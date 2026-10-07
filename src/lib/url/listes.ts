/**
 * Listes publiques filtrables : la version « nue » prérendue, les variantes
 * filtrées rendues à la demande.
 *
 * ─── Le problème ────────────────────────────────────────────────────────────
 *
 * Sans `cacheComponents`, une page qui lit `searchParams` est DYNAMIQUE en
 * entier : son `revalidate` n'a plus d'effet, chaque visite recalcule la page
 * (Redis, voire la base) et le CDN ne sert plus de HTML. Les quatre listes
 * concernées — Actualités, Événements, Galerie, Rapports & analyses — sont
 * parmi les plus fréquentées du site, et l'immense majorité des visites y
 * arrivent SANS paramètre. On payait donc le rendu dynamique de tous pour
 * l'usage de quelques-uns.
 *
 * ─── Pourquoi le filtrage reste serveur ─────────────────────────────────────
 *
 * L'alternative — servir la liste complète et filtrer dans le navigateur — a
 * été écartée pour ces quatre listes, après examen des requêtes :
 *
 *   · Actualités : la recherche porte sur le CORPS des articles
 *     (`contentHtml`, cf. lib/actus/query.ts), et la liste croît sans borne au
 *     fil des publications. Filtrer côté client imposerait d'expédier tous les
 *     corps à chaque visiteur. La pagination, elle, a une valeur SEO propre
 *     (canonical de `?page=`), qui exige des métadonnées calculées au serveur ;
 *   · Événements : même recherche sur le corps, jusqu'à 400 lignes
 *     (`take: 400`, cf. lib/events/query.ts) ;
 *   · Galerie et Rapports : la recherche couvre les DEUX langues (titres et
 *     descriptions FR et EN, référence, organisme), les décomptes par nature et
 *     par rubrique suivent les filtres, et les modules sont explicitement
 *     dimensionnés pour « plusieurs centaines de pièces » avec un filtrage
 *     descendu en base (cf. lib/docs/query.ts, components/galerie/GalerieGrille).
 *     Le refaire en JavaScript dupliquerait le tri et la recherche de Prisma
 *     — deux implémentations qui divergeraient à la première retouche.
 *
 * ─── Le dispositif ──────────────────────────────────────────────────────────
 *
 * Chaque liste a DEUX routes, qui partagent le même rendu :
 *
 *   · `/<langue>/news` — ne lit AUCUN paramètre : prérendue, régénérée selon
 *     son `revalidate` et invalidée par la console. C'est elle que reçoivent
 *     presque tous les visiteurs ;
 *   · `/<langue>/news/_filtre` — la variante filtrée, dynamique, qui lit
 *     `searchParams` (requêtes toujours servies par le cache Redis, dont les
 *     clés portent les filtres).
 *
 * Le proxy (src/proxy.ts) RÉÉCRIT vers la seconde toute requête qui porte un
 * filtre non vide : l'adresse affichée et partagée ne change pas
 * (`/fr/news?categorie=…`), les liens, le formulaire GET et le bouton
 * « précédent » fonctionnent comme avant, sans JavaScript compris. L'accès
 * direct à `/_filtre` est refusé par le même proxy (404) : l'adresse
 * technique n'existe pas pour le public, et ne peut donc pas être indexée en
 * doublon.
 *
 * Le segment commence par un tiret bas, que `slugify` ne produit jamais
 * (lib/actus/slug.ts : `[a-z0-9-]`) : aucun article, événement, album ou
 * document ne peut entrer en collision avec lui. Le dossier s'écrit
 * `%5Ffiltre` — un dossier `_filtre` serait un dossier PRIVÉ, exclu du routage.
 *
 * Les paramètres d'ÉTAT D'INTERFACE (`?media=`, `?doc=`) ne figurent pas ici :
 * ils ouvrent un panneau, ne changent pas la liste, et sont lus côté client
 * (cf. components/url/useParametre.ts). Un lien `?media=…` reste donc servi
 * par la page statique.
 *
 * ⚠️ Module lu par le proxy : aucune dépendance d'exécution hors lib/routes.
 */
import { NAV } from "@/lib/routes";

/** Segment de la variante filtrée, tel qu'il apparaît dans l'URL réécrite. */
export const SEGMENT_FILTRE = "_filtre";

/**
 * Paramètres qui changent le CONTENU de chaque liste — exactement ceux que
 * lisait la page avant la séparation. En ajouter un à une page sans l'ajouter
 * ici le rendrait inopérant : la requête resterait servie par la version
 * statique, qui l'ignore.
 */
const PARAMETRES_DE_LISTE: Readonly<Record<string, readonly string[]>> = {
  [NAV.actualites]: ["categorie", "tag", "q", "page"],
  [NAV.evenements]: ["categorie", "q"],
  [NAV.galerie]: ["rubrique", "type", "q", "tri"],
  [NAV.transparence]: ["categorie", "type", "q", "tri"],
};

/**
 * Chemin de la variante filtrée à servir pour cette requête, ou `null` si la
 * version statique convient.
 *
 * Un paramètre VIDE (`?q=`, formulaire soumis sans saisie) ne compte pas : la
 * page le traitait déjà comme absent, la version statique rend donc à
 * l'identique, et il n'y a aucune raison de payer un rendu dynamique pour lui.
 *
 * @param chemin chemin SANS préfixe de langue (« /news »).
 */
export function varianteFiltree(chemin: string, recherche: URLSearchParams): string | null {
  const nu = chemin.replace(/\/+$/, "");
  const cles = PARAMETRES_DE_LISTE[nu];
  if (!cles) return null;
  const filtre = cles.some((cle) => recherche.getAll(cle).some((valeur) => valeur.trim() !== ""));
  return filtre ? `${nu}/${SEGMENT_FILTRE}` : null;
}

/** Vrai pour une adresse technique de variante filtrée demandée telle quelle. */
export function estVarianteFiltree(chemin: string): boolean {
  const nu = chemin.replace(/\/+$/, "");
  return Object.keys(PARAMETRES_DE_LISTE).some((base) => nu === `${base}/${SEGMENT_FILTRE}`);
}

/** Forme de `searchParams` telle que Next la remet à une page. */
export type ParametresBruts = Record<string, string | string[] | undefined>;

/**
 * Valeur d'un paramètre de requête, nettoyée ; `null` si absente ou vide.
 *
 * ⚠️ Un paramètre RÉPÉTÉ (`?q=a&q=b`) arrive en TABLEAU : l'ancienne lecture
 * `recherche.q?.trim()` levait alors « trim is not a function » et la page
 * tombait en 500. On retient la première valeur, comme le fait
 * `URLSearchParams.get` côté client — les deux lectures concordent.
 */
export function parametre(brut: ParametresBruts, cle: string): string | null {
  const valeur = brut[cle];
  const premiere = Array.isArray(valeur) ? valeur[0] : valeur;
  return typeof premiere === "string" && premiere.trim() ? premiere.trim() : null;
}
