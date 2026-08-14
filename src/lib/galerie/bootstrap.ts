/**
 * Amorçage des rubriques de la galerie.
 *
 * Aucune ENTRÉE n'est créée, contrairement à `lib/events/bootstrap.ts` : le site
 * statique n'avait pas de galerie, et fabriquer des entrées à partir des
 * photographies d'illustration de `content/media.ts` peuplerait la section de
 * vues d'agence que l'Unité n'a jamais choisi de publier. Le module démarre donc
 * vide, ce qui est l'état honnête.
 *
 * Les RUBRIQUES, elles, sont amorcées : sans nomenclature de départ, le premier
 * dépôt oblige à sortir de l'écran pour créer une rubrique avant de pouvoir
 * ranger quoi que ce soit. Les cinq proposées reprennent les familles de contenu
 * annoncées au module — activités, événements, projets, actualités — et y
 * ajoutent le terrain, qui est ce que photographie une unité de projet.
 *
 * Même contrat que les autres amorçages : ne s'exécute QUE sur une table vide,
 * ne lève jamais, et ne recrée pas ce qu'un administrateur a supprimé.
 */
import { db } from "@/lib/db";
import { describeError } from "@/lib/errors";

const RUBRIQUES = [
  { slug: "activites", nomFr: "Activités", nomEn: "Activities", color: "#0f62fe", position: 10 },
  { slug: "evenements", nomFr: "Événements", nomEn: "Events", color: "#8a3ffc", position: 20 },
  { slug: "projets", nomFr: "Projets", nomEn: "Projects", color: "#009d9a", position: 30 },
  { slug: "actualites", nomFr: "Actualités", nomEn: "News", color: "#ee5396", position: 40 },
  { slug: "terrain", nomFr: "Terrain", nomEn: "Field", color: "#ff832b", position: 50 },
] as const;

let amorce = false;

/** Ne lève jamais : l'écran du module doit s'afficher même base indisponible. */
export async function ensureRubriquesGalerie(): Promise<void> {
  if (amorce) return;

  try {
    if ((await db().galerieCategory.count()) > 0) {
      amorce = true;
      return;
    }

    // `skipDuplicates` : deux rendus concurrents peuvent franchir le compteur
    // ensemble, et le second ne doit pas faire tomber l'écran sur une violation
    // d'unicité de slug.
    await db().galerieCategory.createMany({ data: [...RUBRIQUES], skipDuplicates: true });
    amorce = true;
  } catch (erreur) {
    console.warn(`[galerie] amorçage des rubriques impossible. ${describeError(erreur)}`);
  }
}
