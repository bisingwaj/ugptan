/**
 * Convertit en WebP compressé les images des galeries d'articles déjà en ligne.
 *
 *   npx tsx --tsconfig tsconfig.json -r dotenv/config scripts/convertir-galeries-webp.ts dotenv_config_path=.env.local
 *       → À BLANC : liste ce qui serait converti, ne touche à rien.
 *   … scripts/convertir-galeries-webp.ts --appliquer dotenv_config_path=.env.local
 *       → convertit.
 *
 * Pour chaque média : téléchargement du fichier actuel, nouveau dépôt par
 * `deposerFichier` avec `optimiser` (même conversion qu'un envoi depuis la
 * console, cf. IMAGE_OPTIMISEE), mise à jour de la fiche, PUIS retrait de
 * l'ancien fichier. Dans cet ordre, la fiche ne désigne jamais un fichier
 * absent ; un échec laisse au pire un ancien fichier orphelin chez Cloudinary.
 *
 * L'identifiant du média ne change pas : galeries, couvertures et corps
 * d'articles qui le citent par son identifiant suivent d'eux-mêmes. Une image
 * insérée dans le CORPS d'un article par son adresse Cloudinary, elle, garde
 * l'ancienne adresse : le script n'en retire donc l'ancien fichier que si
 * aucun corps d'article ne la cite.
 *
 * Rejouable : un média déjà en WebP est ignoré. Les médias externes (sans
 * identifiant Cloudinary) ne nous appartiennent pas et sont ignorés aussi.
 */
import { db } from "@/lib/db";
import { deposerFichier, imageOptimisable, supprimerFichier } from "@/lib/cloudinary";

const APPLIQUER = process.argv.includes("--appliquer");
const mo = (octets: number) => `${(octets / 1048576).toFixed(2)} Mo`;

(async () => {
  const medias = await db().mediaAsset.findMany({
    where: {
      galeriesArticle: { some: {} },
      mimeType: { not: "image/webp" },
      publicId: { not: null },
      url: { not: null },
    },
    select: { id: true, filename: true, mimeType: true, size: true, url: true, publicId: true },
    orderBy: { createdAt: "asc" },
  });
  const aConvertir = medias.filter((m) => imageOptimisable(m.mimeType));

  console.log(`${APPLIQUER ? "CONVERSION" : "À BLANC"} : ${aConvertir.length} image(s), ${mo(aConvertir.reduce((n, m) => n + m.size, 0))} au total.`);
  if (!APPLIQUER) {
    for (const m of aConvertir) console.log(`  ${m.filename} · ${m.mimeType} · ${mo(m.size)}`);
    console.log("Relancer avec --appliquer pour convertir.");
    process.exit(0);
  }

  let avant = 0;
  let apres = 0;
  let echecs = 0;
  for (const [rang, m] of aConvertir.entries()) {
    const etiquette = `[${rang + 1}/${aConvertir.length}] ${m.filename}`;
    try {
      const reponse = await fetch(m.url!);
      if (!reponse.ok) throw new Error(`téléchargement ${reponse.status}`);
      const octets = new Uint8Array(await reponse.arrayBuffer());

      const depot = await deposerFichier(octets, {
        filename: m.filename,
        mimeType: m.mimeType,
        sousDossier: "medias",
        optimiser: true,
      });

      await db().mediaAsset.update({
        where: { id: m.id },
        data: {
          url: depot.url,
          publicId: depot.publicId,
          mimeType: depot.mimeType,
          size: depot.size,
          width: depot.width,
          height: depot.height,
          filename: `${m.filename.replace(/\.[^.]+$/, "")}.webp`,
        },
      });

      // L'ancien fichier n'est retiré que si aucun corps d'article ne cite
      // son adresse : sinon, l'image insérée dans le texte deviendrait un trou.
      const cite = await db().articleTranslation.count({ where: { contentHtml: { contains: m.publicId! } } });
      if (cite === 0) await supprimerFichier(m.publicId!, m.mimeType);

      avant += m.size;
      apres += depot.size;
      console.log(`${etiquette} : ${mo(m.size)} → ${mo(depot.size)}${cite ? " (ancien fichier conservé : cité dans un article)" : ""}`);
    } catch (erreur) {
      echecs += 1;
      console.error(`${etiquette} : ÉCHEC, image laissée telle quelle.`, erreur instanceof Error ? erreur.message : erreur);
    }
  }

  console.log(`Terminé : ${mo(avant)} → ${mo(apres)}${echecs ? `, ${echecs} échec(s)` : ""}.`);
  process.exit(echecs ? 1 : 0);
})();
