/**
 * Invalidation du cache après une écriture du CMS.
 *
 * Les pages publiques qui lisent les actualités sont rendues à la demande puis
 * mises en cache (cf. leur `revalidate`). Sans cet appel, une publication ne
 * paraîtrait qu'à l'expiration du délai ; avec lui, elle est visible au premier
 * rechargement.
 *
 * Les chemins sont donnés sous leur forme de ROUTE (`/[lang]/news/[slug]`) et
 * non d'URL : c'est la seule façon d'invalider d'un coup toutes les langues et
 * tous les slugs, sans énumérer ce qui vient de changer.
 *
 * ⚠️ Ils sont DÉRIVÉS de `NAV` et jamais écrits en toutes lettres. Les littéraux
 * français d'origine (`/[lang]/actualites`) ont cessé de désigner quoi que ce
 * soit au renommage des routes en anglais, et `revalidatePath` n'a pas levé : il
 * n'invalidait plus rien, sans le dire (cf. `patronRoute` dans lib/routes.ts).
 */
import { revalidatePath } from "next/cache";
import { NAV, patronRoute } from "@/lib/routes";

export function revaliderActualites(): void {
  revalidatePath(patronRoute(NAV.actualites), "page");
  revalidatePath(patronRoute(`${NAV.actualites}/[slug]`), "page");
  // L'accueil affiche les derniers communiqués, les pages composante le bloc
  // « Actualités » qui leur est rattaché.
  revalidatePath(patronRoute(NAV.accueil), "page");
  revalidatePath(patronRoute(`${NAV.composantes}/[code]`), "page");
  revalidatePath("/sitemap.xml");
}
