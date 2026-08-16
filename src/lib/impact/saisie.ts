/**
 * Forme des données du module « Histoires & impact » dans la console.
 *
 * ⚠️ Aucun import de Prisma : le module est lu par les composants clients des
 * formulaires comme par la couche serveur qui les alimente
 * (`lib/impact/edition.ts`).
 *
 * Le découpage reproduit celui des actualités et des événements : ce qui
 * appartient à la FICHE d'un côté, ce qui appartient à UNE LANGUE de l'autre.
 * Les deux s'enregistrent séparément (cf. actions/admin-impact.ts).
 */
import type { Lang } from "@/lib/pick";
import type {
  ImpactEmplacement, ImpactLayout, ImpactStatut, ImpactTheme,
} from "@/lib/impact/statut";

/* -------------------------------------------------------------------------- */
/* Entrées                                                                     */
/* -------------------------------------------------------------------------- */

/** Une version linguistique d'une entrée, telle qu'elle est saisie. */
export type TraductionItemSaisie = {
  surtitre: string;
  titre: string;
  texte: string;
  texteSecondaire: string;
  lienLabel: string;
  mediaAlt: string;
  /** `false` tant qu'aucune ligne n'existe en base pour cette langue. */
  existe: boolean;
  /** Les champs requis par le gabarit sont renseignés (cf. `itemTraduit`). */
  complete: boolean;
  /** Dernière modification de cette langue, déjà formatée. */
  majLe: string | null;
};

/** Une entrée, indépendamment de toute langue. */
export type ItemSaisie = {
  id: string;
  position: number;
  status: ImpactStatut;
  featured: boolean;
  valeur: string;
  color: string;
  videoYt: string;
  lienUrl: string;
  /** Format `<input type="date">`, heure de Kinshasa. */
  dateAt: string;
  /** Pastilles du gabarit POLES, une par ligne. Hors traduction. */
  tags: string;
  coverMediaId: string;
  coverKey: string;
  /** URL du visuel actuel, pour la vignette d'aperçu. */
  coverSrc: string;
  traductions: Record<Lang, TraductionItemSaisie>;
};

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

/** L'en-tête d'une section dans une langue. */
export type TraductionSectionSaisie = {
  kicker: string;
  titre: string;
  lead: string;
  ctaLabel: string;
  /** Ligne courte que seuls certains gabarits affichent. */
  note: string;
  existe: boolean;
  /** Un kicker ou un titre suffit (cf. `sectionTraduite`). */
  complete: boolean;
  majLe: string | null;
};

/** La fiche d'une section, indépendante de toute langue. */
export type SectionSaisie = {
  id: string | null;
  key: string;
  emplacement: ImpactEmplacement;
  layout: ImpactLayout;
  theme: ImpactTheme;
  status: ImpactStatut;
  position: number;
  numero: string;
  compact: boolean;
  grandTitre: boolean;
  ctaUrl: string;
  /** La section poursuit la précédente, dans la même bande. */
  enchaine: boolean;
  /** Section dont celle-ci reprend les entrées. Vide : elle a les siennes. */
  sourceId: string;
  /** Nombre maximal d'entrées affichées. `0` vaut « toutes ». */
  limite: number;
  traductions: Record<Lang, TraductionSectionSaisie>;
  /** Entrées propres. Vides pour une section qui en reprend une autre. */
  items: ItemSaisie[];
};

/** Listes déroulantes communes aux écrans de la fiche. */
export type ReferentielsImpact = {
  /** Sections susceptibles de servir de source, la courante exclue. */
  sources: { id: string; nom: string; layout: string; items: number }[];
};
