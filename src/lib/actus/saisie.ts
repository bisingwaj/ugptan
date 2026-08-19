/**
 * Forme des données de la fiche d'article dans la console.
 *
 * ⚠️ Aucun import : le module est lu par les composants clients du formulaire
 * comme par la couche serveur qui les alimente (`lib/actus/edition.ts`). Le
 * garder sans dépendance évite qu'un type partagé traîne Prisma jusqu'au
 * paquet du navigateur.
 *
 * Le découpage reproduit celui des formulaires : `ArticleSaisie` porte ce qui
 * appartient à l'ARTICLE, `TraductionSaisie` ce qui appartient à UNE LANGUE.
 * Les deux s'enregistrent séparément (cf. actions/admin-actualites.ts).
 */
import type { Lang } from "@/lib/pick";
import type { ArticleStatut } from "@/lib/actus/statut";

/** Une version linguistique, telle qu'elle est saisie. */
export type TraductionSaisie = {
  title: string;
  slug: string;
  excerpt: string;
  /** HTML déjà assaini. */
  content: string;
  seoTitle: string;
  seoDescription: string;
  coverAlt: string;
  /** Fonction affichée sous la signature (« Cellule communication »). */
  authorRole: string;
  /** `false` tant qu'aucune ligne n'existe en base pour cette langue. */
  existe: boolean;
  /** Titre ET corps renseignés : la langue est servie au public. */
  complete: boolean;
  /** Dernière modification de cette langue, déjà formatée. */
  majLe: string | null;
};

/** La fiche, indépendante de toute langue. */
export type ArticleSaisie = {
  id: string | null;
  status: ArticleStatut;
  /** Format `<input type="datetime-local">`, heure de Kinshasa. */
  publishedAt: string;
  featured: boolean;
  lieu: string;
  videoYt: string;
  comps: string[];
  categoryId: string;
  coverMediaId: string;
  coverKey: string;
  /** URL du visuel actuel, pour la vignette d'aperçu. */
  coverSrc: string;
  authorId: string;
  authorName: string;
  tagIds: string[];
  traductions: Record<Lang, TraductionSaisie>;
};

/** Listes déroulantes et bibliothèque, communes aux écrans de la fiche. */
export type ReferentielsSaisie = {
  categories: { id: string; nom: string }[];
  tags: { id: string; nom: string }[];
  auteurs: { id: string; nom: string }[];
  composantes: { code: string; titre: string }[];
};
