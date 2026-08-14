/**
 * Invalidation du cache après une écriture du module « Événements ».
 *
 * Même contrat que `lib/actus/cache.ts` : les chemins sont donnés sous leur
 * forme de ROUTE (`/[lang]/events/[slug]`) et non d'URL, seule façon d'invalider
 * d'un coup toutes les langues et tous les slugs sans énumérer ce qui vient de
 * changer — et DÉRIVÉS de `NAV` plutôt qu'écrits en toutes lettres
 * (cf. `patronRoute` dans lib/routes.ts).
 */
import { revalidatePath } from "next/cache";
import { NAV, patronRoute } from "@/lib/routes";

export function revaliderEvenements(): void {
  revalidatePath(patronRoute(NAV.evenements), "page");
  revalidatePath(patronRoute(`${NAV.evenements}/[slug]`), "page");
  // L'accueil affiche les prochaines rencontres.
  revalidatePath(patronRoute(NAV.accueil), "page");
  revalidatePath("/sitemap.xml");
}
