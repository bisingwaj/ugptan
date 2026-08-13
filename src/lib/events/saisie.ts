/**
 * Forme des données de la fiche d'événement dans la console.
 *
 * ⚠️ Aucun import de Prisma : le module est lu par les composants clients du
 * formulaire comme par la couche serveur qui les alimente
 * (`lib/events/edition.ts`).
 *
 * Le découpage reproduit celui des formulaires, comme pour les actualités :
 * `EvenementSaisie` porte ce qui appartient à L'ÉVÉNEMENT, `TraductionEvtSaisie`
 * ce qui appartient à UNE LANGUE. Les deux s'enregistrent séparément
 * (cf. actions/admin-evenements.ts).
 */
import type { Lang } from "@/lib/pick";
import type { EvenementMode, EvenementStatut } from "@/lib/events/statut";

/** Une version linguistique, telle qu'elle est saisie. */
export type TraductionEvtSaisie = {
  title: string;
  slug: string;
  excerpt: string;
  /** HTML déjà assaini. */
  content: string;
  lieu: string;
  adresse: string;
  places: string;
  infos: string;
  seoTitle: string;
  seoDescription: string;
  coverAlt: string;
  /** `false` tant qu'aucune ligne n'existe en base pour cette langue. */
  existe: boolean;
  /**
   * Titre ET lieu renseignés : la langue peut être servie au public.
   *
   * Le corps n'entre PAS dans ce critère, contrairement à un article. Un
   * événement se tient à une date et dans un lieu ; sa description peut se
   * réduire à son titre sans que la fiche mente. Exiger un corps interdirait
   * d'annoncer une date connue avant que le programme le soit.
   */
  complete: boolean;
  /** Dernière modification de cette langue, déjà formatée. */
  majLe: string | null;
};

/** La fiche, indépendante de toute langue. */
export type EvenementSaisie = {
  id: string | null;
  status: EvenementStatut;
  /** Format `<input type="datetime-local">`, heure de Kinshasa. */
  startAt: string;
  endAt: string;
  allDay: boolean;
  mode: EvenementMode;
  featured: boolean;
  color: string;
  categoryId: string;
  coverMediaId: string;
  coverKey: string;
  /** URL du visuel actuel, pour la vignette d'aperçu. */
  coverSrc: string;
  registrationUrl: string;
  externalUrl: string;
  onlineUrl: string;
  organiserName: string;
  organiserEmail: string;
  organiserPhone: string;
  organiserUrl: string;
  comps: string[];
  traductions: Record<Lang, TraductionEvtSaisie>;
};

/** Listes déroulantes et bibliothèque, communes aux écrans de la fiche. */
export type ReferentielsEvtSaisie = {
  categories: { id: string; nom: string }[];
  composantes: { code: string; titre: string }[];
};
