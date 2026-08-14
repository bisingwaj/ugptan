/**
 * Forme des données de « L'équipe de l'Unité » dans la console.
 *
 * ⚠️ Aucun import de Prisma : le module est lu par les composants clients des
 * formulaires comme par la couche serveur qui les alimente
 * (`lib/equipe/edition.ts`).
 *
 * Le découpage reproduit celui des autres modules : ce qui appartient à la
 * FICHE d'un côté, ce qui appartient à UNE LANGUE de l'autre. Les deux
 * s'enregistrent séparément (cf. actions/admin-equipe.ts) parce qu'ils
 * n'appartiennent ni aux mêmes personnes ni au même moment : le rédacteur
 * décrit le poste en français, le traducteur ajoute l'anglais plus tard.
 */
import type { Lang } from "@/lib/pick";
import type { TeamStatut } from "@/lib/equipe/statut";

/* -------------------------------------------------------------------------- */
/* Fiches                                                                      */
/* -------------------------------------------------------------------------- */

/** Une version linguistique d'une fiche, telle qu'elle est saisie. */
export type TraductionMembreSaisie = {
  nom: string;
  role: string;
  mandat: string;
  bio: string;
  verbatim: string;
  /** `false` tant qu'aucune ligne n'existe en base pour cette langue. */
  existe: boolean;
  /** La fonction est renseignée, donc la langue est servie (cf. `membreTraduit`). */
  complete: boolean;
  /** Dernière modification de cette langue, déjà formatée. */
  majLe: string | null;
};

/** Une fiche, indépendamment de toute langue. */
export type MembreSaisie = {
  id: string | null;
  key: string;
  nom: string;
  status: TeamStatut;
  position: number;
  featured: boolean;
  color: string;
  email: string;
  composante: string;
  poleId: string;
  photoMediaId: string;
  photoPath: string;
  /** URL du portrait actuel, pour la vignette d'aperçu. */
  photoSrc: string;
  traductions: Record<Lang, TraductionMembreSaisie>;
};

/* -------------------------------------------------------------------------- */
/* Pôles                                                                       */
/* -------------------------------------------------------------------------- */

/** Une version linguistique d'un pôle. */
export type TraductionPoleSaisie = {
  nom: string;
  mission: string;
  existe: boolean;
  majLe: string | null;
};

export type PoleSaisie = {
  id: string;
  key: string;
  position: number;
  color: string;
  /** Nombre de fiches rattachées, pour prévenir avant une suppression. */
  membres: number;
  traductions: Record<Lang, TraductionPoleSaisie>;
};

/* -------------------------------------------------------------------------- */
/* Référentiels                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Ce que les listes déroulantes de la console proposent.
 *
 * Les pôles y figurent sous leur nom FRANÇAIS : la console est un outil de
 * travail interne, elle n'a pas de version anglaise.
 */
export type ReferentielsEquipe = {
  poles: { id: string; nom: string }[];
};
