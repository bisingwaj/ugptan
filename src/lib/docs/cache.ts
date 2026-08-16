/**
 * Invalidation du cache après une écriture du module « Ressources & publications ».
 *
 * Même contrat que `lib/actus/cache.ts` : le chemin est donné sous sa forme de
 * ROUTE (`/[lang]/transparency`) et non d'URL, seule façon d'invalider les deux
 * langues d'un coup sans énumérer ce qui vient de changer — et DÉRIVÉ de `NAV`
 * plutôt qu'écrit en toutes lettres (cf. `patronRoute` dans lib/routes.ts).
 *
 * La dérivation compte doublement ici : cette section VIENT d'être déplacée de
 * `/resources` vers `/transparency`. Un littéral aurait survécu au renommage
 * sans rien invalider, et `revalidatePath` ne lève pas sur un chemin qui
 * n'existe plus — la panne aurait été silencieuse.
 */
import { revalidatePath } from "next/cache";
import { NAV, patronRoute } from "@/lib/routes";

export function revaliderDocuments(): void {
  revalidatePath(patronRoute(NAV.transparence), "page");
  // Page de lecture d'une publication rédigée. Le chemin est donné sous sa
  // forme de ROUTE : les deux langues et TOUTES les pièces sont invalidées d'un
  // coup, ce qui évite de savoir laquelle vient de changer.
  revalidatePath(patronRoute(`${NAV.transparence}/[slug]`), "page");
  revalidatePath("/sitemap.xml");
}
