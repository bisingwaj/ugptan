/**
 * Invalidation du cache après une écriture du module « Rapports & analyses ».
 *
 * Même contrat que `lib/actus/cache.ts` : le chemin est donné sous sa forme de
 * ROUTE (`/[lang]/resources`) et non d'URL, seule façon d'invalider les deux
 * langues d'un coup sans énumérer ce qui vient de changer — et DÉRIVÉ de `NAV`
 * plutôt qu'écrit en toutes lettres (cf. `patronRoute` dans lib/routes.ts).
 */
import { revalidatePath } from "next/cache";
import { NAV, patronRoute } from "@/lib/routes";

export function revaliderDocuments(): void {
  revalidatePath(patronRoute(NAV.ressources), "page");
  revalidatePath("/sitemap.xml");
}
