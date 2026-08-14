/**
 * Invalidation du cache après une écriture du module « Ressources & publications ».
 *
 * Même contrat que `lib/actus/cache.ts` : le chemin est donné sous sa forme de
 * ROUTE (`/[lang]/transparency`) et non d'URL, seule façon d'invalider les deux
 * langues d'un coup sans énumérer ce qui vient de changer.
 */
import { revalidatePath } from "next/cache";

export function revaliderDocuments(): void {
  revalidatePath("/[lang]/transparency", "page");
  // Page de lecture d'une publication rédigée. Le chemin est donné sous sa
  // forme de ROUTE : les deux langues et TOUTES les pièces sont invalidées d'un
  // coup, ce qui évite de savoir laquelle vient de changer.
  revalidatePath("/[lang]/transparency/[slug]", "page");
  revalidatePath("/sitemap.xml");
}
