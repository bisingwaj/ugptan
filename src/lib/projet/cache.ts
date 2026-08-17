/**
 * Invalidation du cache après une écriture du module « Le projet ».
 *
 * Même contrat que `lib/impact/cache.ts` : les chemins sont donnés sous leur
 * forme de ROUTE (`/[lang]/components`) et non d'URL, seule façon d'invalider
 * les deux langues d'un coup, et DÉRIVÉS de `NAV` plutôt qu'écrits en toutes
 * lettres (cf. `patronRoute` dans lib/routes.ts).
 *
 * Toutes les pages concernées sont invalidées ensemble, sans regarder ce qui a
 * été touché. Distinguer coûterait une condition à tenir à jour à chaque
 * nouveau point d'affichage, pour économiser quelques revalidations sur une
 * écriture qui n'a lieu que quelques fois par mois — et une composante irrigue
 * de toute façon presque tout le site : sa carte sur l'index, sa ligne sur la
 * page du Projet, ses indicateurs sur l'accueil et sur « Résultats », son
 * étiquette sur les marchés et les actualités qui s'y rattachent.
 *
 * ⚠️ Ces appels ne produisent AUCUN effet sous `next start` (cf. le commentaire
 * détaillé de lib/impact/cache.ts).
 */
import { revalidatePath } from "next/cache";
import { NAV, patronRoute } from "@/lib/routes";

export function revaliderProjet(): void {
  revalidatePath(patronRoute(NAV.accueil), "page");
  revalidatePath(patronRoute(NAV.projet), "page");
  revalidatePath(patronRoute(NAV.composantes), "page");
  // Les cinq pages dédiées d'un coup : le segment reste un paramètre.
  revalidatePath(patronRoute(`${NAV.composantes}/[code]`), "page");
  revalidatePath(patronRoute(NAV.resultats), "page");
  revalidatePath(patronRoute(NAV.marches), "page");
}
