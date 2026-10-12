/**
 * Convertit en WebP compressé les images déjà en ligne, SANS rien casser.
 *
 *   npx tsx --tsconfig tsconfig.json -r dotenv/config scripts/convertir-images-webp.ts --source bibliotheque dotenv_config_path=.env.local
 *       → À BLANC : liste les images et chaque endroit de la base qui cite leur
 *         adresse. Ne modifie rien.
 *   … --source galerie                 → idem pour les photos du module Galerie.
 *   … --appliquer                      → convertit.
 *
 * ─── Ce qui garantit que rien ne casse ──────────────────────────────────────
 *
 *  1. La fiche garde son IDENTIFIANT : tout ce qui la désigne par relation
 *     (galeries, couvertures, portraits, albums…) suit de lui-même.
 *  2. Les ADRESSES écrites en clair ailleurs (corps d'articles, blocs JSON,
 *     textes riches de tous les modules) sont réécrites : le script parcourt
 *     TOUTES les colonnes de texte et JSON de la base, et remplace l'ancienne
 *     adresse par la nouvelle, transformations Cloudinary comprises (le
 *     segment remplacé est « v<version>/<identifiant>.<extension> », commun à
 *     l'adresse brute et à ses variantes redimensionnées).
 *  3. L'ANCIEN FICHIER N'EST PAS SUPPRIMÉ. Des pages en cache, des liens
 *     partagés et des lettres d'information déjà envoyées peuvent encore le
 *     citer. Son retrait est une étape séparée, à faire une fois les caches
 *     expirés (cf. scripts/retirer-anciennes-images.ts).
 *
 * Rejouable : une image déjà en WebP est ignorée. Les médias externes (sans
 * identifiant Cloudinary) ne nous appartiennent pas et sont ignorés aussi.
 * Chaque conversion est consignée dans `scripts/sorties/webp-<source>.jsonl`
 * (ancienne et nouvelle adresse) : c'est la liste que l'étape de retrait relit.
 */
import { appendFileSync, mkdirSync } from "node:fs";
import { db } from "@/lib/db";
import { deposerFichier, imageOptimisable } from "@/lib/cloudinary";

const APPLIQUER = process.argv.includes("--appliquer");
const SOURCE = process.argv[process.argv.indexOf("--source") + 1];
if (SOURCE !== "bibliotheque" && SOURCE !== "galerie") {
  console.error("Préciser --source bibliotheque ou --source galerie.");
  process.exit(2);
}
const JOURNAL = `scripts/sorties/webp-${SOURCE}.jsonl`;
const mo = (octets: number) => `${(octets / 1048576).toFixed(2)} Mo`;

/** Une image à convertir, quelle que soit sa table. */
type Image = { id: string; nom: string; mime: string; taille: number; url: string; publicId: string };

/** Segment commun à l'adresse brute et à ses variantes : « v123/dossier/nom.png ». */
const segment = (url: string): string | null => /\/upload\/(?:[^/]+\/)*?(v\d+\/.+)$/.exec(url)?.[1] ?? null;

/** Colonnes de texte et JSON de la base, où une adresse peut être écrite en clair. */
async function colonnesTexte(): Promise<{ table: string; colonne: string; type: string }[]> {
  const lignes = await db().$queryRawUnsafe<{ table_name: string; column_name: string; data_type: string }[]>(
    // Casts en text : le pilote Neon ne sait pas relire le type « name ».
    `SELECT table_name::text AS table_name, column_name::text AS column_name, data_type::text AS data_type
     FROM information_schema.columns
     WHERE table_schema = 'public' AND data_type IN ('text', 'character varying', 'jsonb', 'json')
       AND table_name NOT LIKE '\\_prisma%'`,
  );
  // Colonnes qui ne peuvent pas porter une adresse d'image : identifiants,
  // clés, statuts, adresses électroniques, empreintes. Les écarter divise le
  // parcours sans rien manquer.
  const exclue = /^(id|.*Id|.*Ids|email|slug|locale|lang|status|statut|type|role|.*Hash|.*Token|token|password|ip|ipAddress|userAgent|code|sigle|color|mimeType|.*Mime|format|fileFormat)$/i;
  return lignes
    .filter((l) => !exclue.test(l.column_name))
    .map((l) => ({ table: l.table_name, colonne: l.column_name, type: l.data_type }));
}

/** Trois essais : la liaison vers la base coupe parfois sur une longue série. */
async function avecReprise<T>(travail: () => Promise<T>): Promise<T> {
  for (let essai = 1; ; essai += 1) {
    try {
      return await travail();
    } catch (erreur) {
      if (essai >= 3) throw erreur;
      await new Promise((fin) => setTimeout(fin, 2000 * essai));
    }
  }
}

const q = (identifiant: string) => `"${identifiant.replace(/"/g, '""')}"`;

type Citation = { table: string; colonne: string; type: string; n: number };

/**
 * Pour chaque segment d'adresse, les endroits qui le citent.
 *
 * UNE requête par colonne pour toutes les images à la fois : une requête par
 * image et par colonne faisait des milliers d'allers-retours vers la base.
 */
async function citations(colonnes: Awaited<ReturnType<typeof colonnesTexte>>, motifs: string[]) {
  const parMotif = new Map<string, Citation[]>(motifs.map((m) => [m, []]));
  if (!motifs.length) return parMotif;
  for (const [rang, c] of colonnes.entries()) {
    if (rang % 40 === 0) console.log(`  recherche des citations : colonne ${rang + 1}/${colonnes.length}…`);
    const lignes = await avecReprise(() => db().$queryRawUnsafe<{ motif: string; n: bigint }[]>(
      `SELECT m AS motif, count(*) AS n FROM unnest($1::text[]) AS m
       JOIN ${q(c.table)} t ON t.${q(c.colonne)}::text LIKE '%' || m || '%'
       GROUP BY m`,
      motifs,
    ));
    for (const l of lignes) parMotif.get(l.motif)?.push({ ...c, n: Number(l.n) });
  }
  return parMotif;
}

async function images(): Promise<Image[]> {
  if (SOURCE === "bibliotheque") {
    const rows = await db().mediaAsset.findMany({
      where: { mimeType: { startsWith: "image/", not: "image/webp" }, publicId: { not: null }, url: { not: null } },
      select: { id: true, filename: true, mimeType: true, size: true, url: true, publicId: true },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((r) => ({ id: r.id, nom: r.filename, mime: r.mimeType, taille: r.size, url: r.url!, publicId: r.publicId! }));
  }
  const rows = await db().galerieItem.findMany({
    where: { type: "PHOTO", imageMime: { not: "image/webp" }, imagePublicId: { not: null }, imageUrl: { not: null } },
    select: { id: true, titreFr: true, imageMime: true, imageSize: true, imageUrl: true, imagePublicId: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    nom: `${r.titreFr || "photo"}.${r.imageUrl!.split(".").pop()}`,
    mime: r.imageMime ?? "image/jpeg",
    taille: r.imageSize,
    url: r.imageUrl!,
    publicId: r.imagePublicId!,
  }));
}

(async () => {
  const liste = (await images()).filter((i) => imageOptimisable(i.mime));
  const colonnes = await colonnesTexte();
  const toutes = await citations(colonnes, liste.map((i) => segment(i.url)).filter((m): m is string => m !== null));
  console.log(`${APPLIQUER ? "CONVERSION" : "À BLANC"} · ${SOURCE} : ${liste.length} image(s), ${mo(liste.reduce((n, i) => n + i.taille, 0))}.`);
  if (APPLIQUER) mkdirSync("scripts/sorties", { recursive: true });

  let avant = 0;
  let apres = 0;
  let echecs = 0;
  for (const [rang, image] of liste.entries()) {
    const etiquette = `[${rang + 1}/${liste.length}] ${image.nom}`;
    const ancien = segment(image.url);
    if (!ancien) {
      console.log(`${etiquette} : adresse inattendue, ignorée (${image.url})`);
      continue;
    }
    // Citations HORS de la fiche elle-même, qui est mise à jour explicitement.
    const cites = (toutes.get(ancien) ?? []).filter(
      (c) => !(c.table === "MediaAsset" && c.colonne === "url") && !(c.table === "GalerieItem" && c.colonne === "imageUrl"),
    );
    const ou = cites.map((c) => `${c.table}.${c.colonne}×${c.n}`).join(", ") || "aucune autre citation";

    if (!APPLIQUER) {
      console.log(`${etiquette} · ${image.mime} · ${mo(image.taille)} · ${ou}`);
      continue;
    }

    // Une coupure réseau ponctuelle ne doit pas faire échouer l'image : trois essais.
    let reussi = false;
    for (let essai = 1; essai <= 3 && !reussi; essai += 1) {
      try {
        const reponse = await fetch(image.url);
        if (!reponse.ok) throw new Error(`téléchargement ${reponse.status}`);
        const octets = new Uint8Array(await reponse.arrayBuffer());
        const depot = await deposerFichier(octets, {
          filename: image.nom,
          mimeType: image.mime,
          sousDossier: SOURCE === "bibliotheque" ? "medias" : "galerie/visuels",
          optimiser: true,
        });
        const nouveau = segment(depot.url);
        if (!nouveau) throw new Error(`adresse de dépôt inattendue : ${depot.url}`);

        await db().$transaction(async (tx) => {
          if (SOURCE === "bibliotheque") {
            await tx.mediaAsset.update({
              where: { id: image.id },
              data: {
                url: depot.url, publicId: depot.publicId, mimeType: depot.mimeType, size: depot.size,
                width: depot.width, height: depot.height, filename: `${image.nom.replace(/\.[^.]+$/, "")}.webp`,
              },
            });
          } else {
            await tx.galerieItem.update({
              where: { id: image.id },
              data: {
                imageUrl: depot.url, imagePublicId: depot.publicId, imageMime: depot.mimeType,
                imageSize: depot.size, imageWidth: depot.width, imageHeight: depot.height,
              },
            });
          }
          // Adresses écrites en clair ailleurs : remplacées dans la même transaction.
          for (const c of cites) {
            const expr = c.type === "jsonb" || c.type === "json"
              ? `replace(${q(c.colonne)}::text, $1, $2)::${c.type}`
              : `replace(${q(c.colonne)}, $1, $2)`;
            await tx.$executeRawUnsafe(
              `UPDATE ${q(c.table)} SET ${q(c.colonne)} = ${expr} WHERE ${q(c.colonne)}::text LIKE $3`,
              ancien, nouveau, `%${ancien}%`,
            );
          }
        });

        appendFileSync(JOURNAL, JSON.stringify({
          source: SOURCE, id: image.id, ancienPublicId: image.publicId, ancienneUrl: image.url,
          nouvelleUrl: depot.url, cites: cites.map((c) => `${c.table}.${c.colonne}`), le: new Date().toISOString(),
        }) + "\n");
        avant += image.taille;
        apres += depot.size;
        reussi = true;
        console.log(`${etiquette} : ${mo(image.taille)} → ${mo(depot.size)} · ${ou}`);
      } catch (erreur) {
        if (essai === 3) {
          echecs += 1;
          console.error(`${etiquette} : ÉCHEC après 3 essais, image laissée telle quelle.`, erreur instanceof Error ? erreur.message : erreur);
        }
      }
    }
  }

  if (APPLIQUER) console.log(`Terminé : ${mo(avant)} → ${mo(apres)}${echecs ? `, ${echecs} échec(s)` : ""}. Anciens fichiers CONSERVÉS (journal : ${JOURNAL}).`);
  else console.log("Relancer avec --appliquer pour convertir.");
  process.exit(echecs ? 1 : 0);
})();
