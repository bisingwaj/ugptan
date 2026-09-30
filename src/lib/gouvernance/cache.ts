/**
 * Invalidation du cache après une écriture du module « Gouvernance ».
 *
 * Même contrat que les autres modules : les chemins sont donnés sous leur forme
 * de ROUTE (`/[lang]/governance`) et non d'URL, seule façon d'invalider les deux
 * langues d'un coup, et DÉRIVÉS de `NAV` plutôt qu'écrits en toutes lettres
 * (cf. `patronRoute` dans lib/routes.ts).
 *
 * L'accueil est invalidé avec la page : il porte l'aperçu des trois organes.
 *
 * ⚠️ Ces appels ne produisent AUCUN effet sous `next start` (cf. le commentaire
 * détaillé de lib/impact/cache.ts).
 */
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { NAV, patronRoute } from "@/lib/routes";
import { invaliderTags, TAG } from "@/lib/cache/redis";

export function revaliderGouvernance(): void {
  revalidatePath(patronRoute(NAV.accueil), "page");
  revalidatePath(patronRoute(NAV.gouvernance), "page");
  // Vide les entrées Redis du module (cf. lib/actus/cache.ts pour le `after`).
  after(() => invaliderTags([TAG.gouvernance]));
}
