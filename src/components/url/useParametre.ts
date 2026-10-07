/**
 * Paramètres d'URL qui pilotent un ÉTAT D'INTERFACE — un panneau ouvert, une
 * recherche lancée — lus dans le navigateur plutôt que par la page serveur.
 *
 * ─── Pourquoi côté client ───────────────────────────────────────────────────
 *
 * Sans `cacheComponents`, une page qui lit `searchParams` devient dynamique EN
 * ENTIER : plus de prérendu, plus de HTML servi par le CDN, un recalcul à
 * chaque visite. Or ces paramètres ne changent rien au contenu de la page ; ils
 * déplient un élément d'une liste déjà rendue. Les faire lire ici rend la page
 * à nouveau statique, et le lien partagé (`?avis=…`, `?media=…`, `?doc=…`,
 * `?ref=…`) ouvre toujours le bon état.
 *
 * ─── La mécanique ───────────────────────────────────────────────────────────
 *
 * Chaque enveloppe de ce dossier place `useSearchParams` sous une frontière
 * `<Suspense>` dont le repli rend le composant SANS paramètre. Au prérendu,
 * Next ne connaît pas la requête : il émet le repli — la liste complète,
 * panneau fermé, exactement ce que voit le visiteur arrivé sans paramètre, et
 * ce que lisent les moteurs. Dans le navigateur, la frontière est rendue avec
 * les vrais paramètres, et le panneau s'ouvre dès l'hydratation. Sans cette
 * frontière, le défaut de `useSearchParams` remonterait jusqu'à la racine et
 * toute la page basculerait en rendu client.
 *
 * Rendues depuis une variante DYNAMIQUE (liste filtrée, cf. lib/url/listes.ts),
 * les mêmes enveloppes lisent les paramètres dès le serveur : le panneau est
 * alors ouvert dans le HTML même, comme avant.
 *
 * Les composants enveloppés n'exploitent le paramètre qu'à leur premier rendu
 * (état initial). Quand ils réécrivent eux-mêmes l'adresse par
 * `history.replaceState` — la galerie, la liste des documents —, Next
 * resynchronise `useSearchParams` : le composant est re-rendu avec la nouvelle
 * valeur et l'ignore. Aucun remontage, aucun clignotement.
 *
 * Un fichier par enveloppe, et non un module commun : un module client importé
 * entraîne tout ce qu'il importe, et la page Marchés n'a pas à charger la
 * visionneuse de la galerie.
 */
import { useSearchParams } from "next/navigation";

/**
 * Valeur nettoyée d'un paramètre, `null` si absent ou vide.
 *
 * ⚠️ `get()` retient la PREMIÈRE valeur d'un paramètre répété, comme
 * `parametre()` côté serveur (lib/url/listes.ts) : `?media=a&media=b` ouvre
 * `a`, sans planter.
 */
export function useParametre(cle: string, longueurMax?: number): string | null {
  const valeur = useSearchParams().get(cle)?.trim();
  if (!valeur) return null;
  return longueurMax ? valeur.slice(0, longueurMax) : valeur;
}
