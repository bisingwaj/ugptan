/**
 * Invalidation du cache après une écriture du module « Documents ».
 *
 * Même contrat que `lib/actus/cache.ts` : le chemin est donné sous sa forme de
 * ROUTE (`/[lang]/ressources`) et non d'URL, seule façon d'invalider les deux
 * langues d'un coup sans énumérer ce qui vient de changer.
 */
import { revalidatePath } from "next/cache";

export function revaliderDocuments(): void {
  revalidatePath("/[lang]/ressources", "page");
  revalidatePath("/sitemap.xml");
}
