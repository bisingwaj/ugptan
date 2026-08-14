/**
 * Invalidation du cache après une écriture du module « Histoires & impact ».
 *
 * Même contrat que `lib/actus/cache.ts` et `lib/events/cache.ts` : les chemins
 * sont donnés sous leur forme de ROUTE (`/[lang]/results`) et non d'URL, seule
 * façon d'invalider les deux langues d'un coup — et DÉRIVÉS de `NAV` plutôt
 * qu'écrits en toutes lettres (cf. `patronRoute` dans lib/routes.ts).
 *
 * Les trois pages sont invalidées ensemble, sans regarder l'emplacement touché.
 * Distinguer coûterait une condition à tenir à jour à chaque nouvel
 * emplacement, pour économiser deux revalidations sur une écriture qui n'a lieu
 * que quelques fois par mois.
 *
 * ⚠️ Ces appels ne produisent AUCUN effet sous `next start` : le serveur
 * autonome sert les pages pré-rendues au build depuis son cache mémoire et ne
 * les régénère jamais, pas même à l'expiration de leur `revalidate`. Le
 * constat vaut pour tout le site — il a été mesuré à l'identique sur l'accueil
 * et sur une actualité, hors de ce module. Ce sont les gestionnaires de cache
 * des plateformes de déploiement (cf. netlify.toml, vercel.json) qui honorent
 * ces invalidations ; en développement, la question ne se pose pas.
 */
import { revalidatePath } from "next/cache";
import { NAV, patronRoute } from "@/lib/routes";

export function revaliderImpact(): void {
  revalidatePath(patronRoute(NAV.accueil), "page");
  revalidatePath(patronRoute(NAV.resultats), "page");
  revalidatePath(patronRoute(NAV.projet), "page");
}
