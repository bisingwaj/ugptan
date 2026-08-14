/**
 * Invalidation du cache après une écriture du module « Vidéos & galeries ».
 *
 * Même contrat que `lib/actus/cache.ts` : le chemin est donné sous sa forme de
 * ROUTE (`/[lang]/gallery`) et non d'URL, seule façon d'invalider les deux
 * langues d'un coup sans énumérer ce qui vient de changer — et DÉRIVÉ de `NAV`
 * plutôt qu'écrit en toutes lettres (cf. `patronRoute` dans lib/routes.ts).
 */
import { revalidatePath } from "next/cache";
import { NAV, patronRoute } from "@/lib/routes";

export function revaliderGalerie(): void {
  revalidatePath(patronRoute(NAV.galerie), "page");
  /* Les pages d'album, par leur route paramétrée : elles sont donc toutes
     invalidées ensemble. Distinguer supposerait de savoir quel album une
     écriture touche — vrai pour l'édition d'un album, faux dès qu'on déplace
     une photographie de l'un vers l'autre, où DEUX pages changent. Le coût
     d'une invalidation de trop est nul ; celui d'une invalidation manquée est
     un reportage qui garde une photo qu'on vient d'en retirer. */
  revalidatePath(patronRoute(`${NAV.galerie}/[slug]`), "page");
  revalidatePath("/sitemap.xml");
}
