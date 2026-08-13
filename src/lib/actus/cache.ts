/**
 * Invalidation du cache après une écriture du CMS.
 *
 * Les pages publiques qui lisent les actualités sont rendues à la demande puis
 * mises en cache (cf. leur `revalidate`). Sans cet appel, une publication ne
 * paraîtrait qu'à l'expiration du délai ; avec lui, elle est visible au premier
 * rechargement.
 *
 * Les chemins sont donnés sous leur forme de ROUTE (`/[lang]/actualites/[slug]`)
 * et non d'URL : c'est la seule façon d'invalider d'un coup toutes les langues
 * et tous les slugs, sans énumérer ce qui vient de changer.
 */
import { revalidatePath } from "next/cache";

export function revaliderActualites(): void {
  revalidatePath("/[lang]/actualites", "page");
  revalidatePath("/[lang]/actualites/[slug]", "page");
  // L'accueil affiche les derniers communiqués, les pages composante le bloc
  // « Actualités » qui leur est rattaché.
  revalidatePath("/[lang]", "page");
  revalidatePath("/[lang]/composantes/[code]", "page");
  revalidatePath("/sitemap.xml");
}
