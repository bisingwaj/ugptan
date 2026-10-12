/**
 * Retire de Cloudinary les anciens fichiers laissés par la conversion WebP
 * (cf. scripts/convertir-images-webp.ts), une fois qu'ils ne servent plus.
 *
 *   npx tsx --tsconfig tsconfig.json -r dotenv/config scripts/retirer-anciennes-images.ts dotenv_config_path=.env.local
 *       → À BLANC : dit ce qui serait retiré, et pourquoi le reste est gardé.
 *   … --appliquer → retire.
 *
 * Un ancien fichier n'est retiré que si les TROIS conditions tiennent :
 *
 *  1. la conversion date d'au moins 24 h (`--delai <heures>` pour changer) :
 *     les pages en cache (ISR, Redis, une heure au plus) et les vignettes de
 *     l'optimiseur d'images ont eu le temps d'adopter la nouvelle adresse ;
 *  2. la fiche désigne bien le NOUVEAU fichier (rien n'est revenu en arrière) ;
 *  3. plus aucune colonne de la base ne cite l'ancienne adresse.
 *
 * Ce que le script ne peut pas voir : une lettre d'information déjà envoyée
 * ou un lien partagé ailleurs qui pointerait sur l'ancien fichier. Pour ces
 * cas, attendre plus longtemps est la seule précaution, d'où le délai réglable.
 *
 * Les lignes retirées sont marquées dans le journal (`retire`), ce qui rend le
 * script rejouable.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { db } from "@/lib/db";
import { supprimerFichier } from "@/lib/cloudinary";

const APPLIQUER = process.argv.includes("--appliquer");
const iDelai = process.argv.indexOf("--delai");
const DELAI_H = iDelai >= 0 ? Number(process.argv[iDelai + 1]) : 24;
const JOURNAUX = ["scripts/sorties/webp-bibliotheque.jsonl", "scripts/sorties/webp-galerie.jsonl"];

type Entree = {
  source: "bibliotheque" | "galerie";
  id: string;
  ancienPublicId: string;
  ancienneUrl: string;
  nouvelleUrl: string;
  le: string;
  retire?: string;
};

const segment = (url: string): string | null => /\/upload\/(?:[^/]+\/)*?(v\d+\/.+)$/.exec(url)?.[1] ?? null;

/** 45 s au plus par requête, trois essais : la liaison vers la base coupe parfois. */
async function avecReprise<T>(travail: () => Promise<T>): Promise<T> {
  for (let essai = 1; ; essai += 1) {
    try {
      return await Promise.race([
        travail(),
        new Promise<never>((_, rejet) => setTimeout(() => rejet(new Error("délai dépassé (45 s)")), 45_000)),
      ]);
    } catch (erreur) {
      if (essai >= 3) throw erreur;
      await new Promise((fin) => setTimeout(fin, 2000 * essai));
    }
  }
}

/**
 * Pour chaque ancienne adresse, la première colonne qui la cite encore.
 * UNE requête par colonne pour toutes les adresses à la fois.
 */
async function citations(motifs: string[]): Promise<Map<string, string>> {
  const cites = new Map<string, string>();
  if (!motifs.length) return cites;
  const colonnes = await avecReprise(() => db().$queryRawUnsafe<{ t: string; c: string }[]>(
    `SELECT table_name::text AS t, column_name::text AS c FROM information_schema.columns
     WHERE table_schema = 'public' AND data_type IN ('text', 'character varying', 'jsonb', 'json')`,
  ));
  for (const { t, c } of colonnes) {
    const lignes = await avecReprise(() => db().$queryRawUnsafe<{ motif: string }[]>(
      `SELECT DISTINCT m AS motif FROM unnest($1::text[]) AS m
       JOIN "${t}" x ON x."${c}"::text LIKE '%' || m || '%'`,
      motifs,
    ));
    for (const { motif } of lignes) if (!cites.has(motif)) cites.set(motif, `${t}.${c}`);
  }
  return cites;
}

(async () => {
  const limite = Date.now() - DELAI_H * 3600_000;
  let retires = 0;

  // Toutes les anciennes adresses en attente, cherchées en une passe.
  const enAttente = JOURNAUX.filter(existsSync).flatMap((j) =>
    readFileSync(j, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as Entree).filter((e) => !e.retire),
  );
  const cites = await citations(enAttente.map((e) => segment(e.ancienneUrl)).filter((m): m is string => m !== null));

  for (const journal of JOURNAUX.filter(existsSync)) {
    const entrees: Entree[] = readFileSync(journal, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));

    for (const e of entrees) {
      if (e.retire) continue;
      const nom = e.ancienneUrl.split("/").pop();
      if (Date.parse(e.le) > limite) {
        console.log(`garde  ${nom} : converti il y a moins de ${DELAI_H} h`);
        continue;
      }
      const actuelle = e.source === "bibliotheque"
        ? (await db().mediaAsset.findUnique({ where: { id: e.id }, select: { url: true } }))?.url
        : (await db().galerieItem.findUnique({ where: { id: e.id }, select: { imageUrl: true } }))?.imageUrl;
      if (actuelle !== undefined && actuelle !== null && actuelle !== e.nouvelleUrl) {
        console.log(`garde  ${nom} : la fiche ne désigne plus le fichier converti`);
        continue;
      }
      const motif = segment(e.ancienneUrl);
      const cite = motif ? cites.get(motif) ?? null : "adresse illisible";
      if (cite) {
        console.log(`garde  ${nom} : encore cité (${cite})`);
        continue;
      }
      if (!APPLIQUER) {
        console.log(`retirerait ${nom}`);
        continue;
      }
      await supprimerFichier(e.ancienPublicId, "image/jpeg");
      e.retire = new Date().toISOString();
      retires += 1;
      console.log(`retiré ${nom}`);
    }

    if (APPLIQUER) writeFileSync(journal, entrees.map((e) => JSON.stringify(e)).join("\n") + "\n");
  }

  console.log(APPLIQUER ? `Terminé : ${retires} ancien(s) fichier(s) retiré(s).` : "À blanc. Relancer avec --appliquer pour retirer.");
  process.exit(0);
})();
