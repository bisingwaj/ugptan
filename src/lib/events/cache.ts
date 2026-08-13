/**
 * Invalidation du cache après une écriture du module « Événements ».
 *
 * Même contrat que `lib/actus/cache.ts` : les chemins sont donnés sous leur
 * forme de ROUTE (`/[lang]/evenements/[slug]`) et non d'URL, seule façon
 * d'invalider d'un coup toutes les langues et tous les slugs sans énumérer ce
 * qui vient de changer.
 */
import { revalidatePath } from "next/cache";

export function revaliderEvenements(): void {
  revalidatePath("/[lang]/evenements", "page");
  revalidatePath("/[lang]/evenements/[slug]", "page");
  // L'accueil affiche les prochaines rencontres.
  revalidatePath("/[lang]", "page");
  revalidatePath("/sitemap.xml");
}
