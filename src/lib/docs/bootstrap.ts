/**
 * Amorçage des catégories documentaires.
 *
 * Contrairement à `lib/events/bootstrap.ts`, RIEN n'est repris du contenu
 * statique : les huit « ressources » de `src/content/carbon.ts` n'ont jamais eu
 * de fichier derrière elles, et créer des documents sans fichier produirait des
 * lignes qui ne peuvent qu'échouer au téléchargement. Le module démarre donc
 * vide, ce qui est l'état honnête.
 *
 * Les CATÉGORIES, elles, sont amorcées : sans nomenclature de départ, le premier
 * dépôt oblige à sortir de l'écran pour créer une thématique avant de pouvoir
 * ranger quoi que ce soit. Les quatre proposées reprennent celles déjà employées
 * par la page « Documents » du site.
 *
 * Même contrat que les autres amorçages : ne s'exécute QUE sur une table vide,
 * ne lève jamais, et ne recrée pas ce qu'un administrateur a supprimé.
 */
import { db } from "@/lib/db";
import { describeError } from "@/lib/errors";

const CATEGORIES = [
  { slug: "reference", nomFr: "Référence", nomEn: "Reference", color: "#0f62fe", position: 10 },
  { slug: "suivi-evaluation", nomFr: "Suivi & évaluation", nomEn: "Monitoring & evaluation", color: "#8a3ffc", position: 20 },
  { slug: "sauvegardes", nomFr: "Sauvegardes E&S", nomEn: "E&S safeguards", color: "#009d9a", position: 30 },
  { slug: "passation", nomFr: "Passation & fiduciaire", nomEn: "Procurement & fiduciary", color: "#ff832b", position: 40 },
] as const;

let amorce = false;

/** Ne lève jamais : l'écran du module doit s'afficher même base indisponible. */
export async function ensureCategoriesDoc(): Promise<void> {
  if (amorce) return;

  try {
    if ((await db().documentCategory.count()) > 0) {
      amorce = true;
      return;
    }

    // `skipDuplicates` : deux rendus concurrents peuvent franchir le compteur
    // ensemble, et le second ne doit pas faire tomber l'écran sur une violation
    // d'unicité de slug.
    await db().documentCategory.createMany({ data: [...CATEGORIES], skipDuplicates: true });
    amorce = true;
  } catch (erreur) {
    console.warn(`[docs] amorçage des catégories impossible. ${describeError(erreur)}`);
  }
}
