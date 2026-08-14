/**
 * Invalidation du cache après une écriture du module « L'équipe de l'Unité ».
 *
 * Même contrat que `lib/actus/cache.ts`, `lib/events/cache.ts` et
 * `lib/impact/cache.ts` : les chemins sont donnés sous leur forme de ROUTE
 * (`/[lang]/gouvernance`) et non d'URL, seule façon d'invalider les deux
 * langues d'un coup.
 *
 * Les quatre pages sont invalidées ensemble, sans regarder ce qui a été touché.
 * C'est le propre de ce module : une fiche unique alimente l'accueil, la page
 * « L'Unité », la page « Gouvernance » et la fiche de sa composante. Distinguer
 * demanderait de rejouer ici la logique de `query.ts` — mise en avant,
 * rattachement à une composante — et de la tenir à jour à chaque évolution,
 * pour économiser deux revalidations sur une écriture qui a lieu quelques fois
 * par an.
 *
 * Les pages de composante sont invalidées par leur route paramétrée : les cinq
 * le sont donc ensemble, y compris celles dont le responsable n'a pas changé.
 *
 * ⚠️ Ces appels ne produisent AUCUN effet sous `next start` : cf. le commentaire
 * de `lib/impact/cache.ts`, qui vaut mot pour mot ici.
 */
import { revalidatePath } from "next/cache";

export function revaliderEquipe(): void {
  revalidatePath("/[lang]", "page");
  revalidatePath("/[lang]/ugptn", "page");
  revalidatePath("/[lang]/governance", "page");
  revalidatePath("/[lang]/components/[code]", "page");
}
