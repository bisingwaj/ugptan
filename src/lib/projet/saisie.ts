/**
 * Forme des données du module « Le projet » dans la console.
 *
 * ⚠️ Aucun import de Prisma : le module est lu par les composants clients des
 * formulaires comme par la couche serveur qui les alimente
 * (`lib/projet/edition.ts`).
 *
 * Le découpage reproduit celui des autres modules : ce qui appartient à la
 * FICHE d'un côté, ce qui appartient à UNE LANGUE de l'autre. Les deux
 * s'enregistrent séparément (cf. actions/admin-projet.ts).
 */
import type { Lang } from "@/lib/pick";
import type { ComposanteBlocType, IndicateurFamille, ProjetStatut } from "@/lib/projet/statut";

/* -------------------------------------------------------------------------- */
/* Blocs                                                                       */
/* -------------------------------------------------------------------------- */

/** Une version linguistique d'un bloc, telle qu'elle est saisie. */
export type TraductionBlocSaisie = {
  titre: string;
  texte: string;
  texteSecondaire: string;
  /** Un paragraphe par ligne, saisi en zone de texte. */
  paragraphes: string;
  /** Une puce par ligne. */
  puces: string;
  /** `false` tant qu'aucune ligne n'existe en base pour cette langue. */
  existe: boolean;
  /** Les champs requis par le type sont renseignés (cf. `blocTraduit`). */
  complete: boolean;
  /** Dernière modification de cette langue, déjà formatée. */
  majLe: string | null;
};

/** Un bloc, indépendamment de toute langue. */
export type BlocSaisie = {
  id: string;
  type: ComposanteBlocType;
  position: number;
  status: ProjetStatut;
  reference: string;
  sigle: string;
  slug: string;
  /** Dotation en millions de dollars. Vide quand le type n'en porte pas. */
  montant: string;
  cible: string;
  coverMediaId: string;
  coverKey: string;
  /** URL du visuel actuel, pour la vignette d'aperçu. */
  coverSrc: string;
  traductions: Record<Lang, TraductionBlocSaisie>;
};

/* -------------------------------------------------------------------------- */
/* Composantes                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Une version linguistique d'une composante.
 *
 * Un seul objet porte les quatre en-têtes de la page (héros, problématique,
 * écosystème, finalité) : ils appartiennent tous à la même ligne de traduction,
 * et les séparer obligerait à quatre enregistrements pour une même relecture.
 * La console les présente néanmoins section par section.
 */
export type TraductionComposanteSaisie = {
  titre: string;
  desc: string;
  titreLong: string;
  soustitre: string;
  pbTitre: string;
  pbLead: string;
  ecoTitre: string;
  ecoLead: string;
  finTitre: string;
  finLead: string;
  videoTitre: string;
  existe: boolean;
  /** L'intitulé court suffit (cf. `composanteTraduite`). */
  complete: boolean;
  majLe: string | null;
};

/** La fiche d'une composante, indépendante de toute langue. */
export type ComposanteSaisie = {
  id: string | null;
  key: string;
  code: string;
  slug: string;
  color: string;
  status: ProjetStatut;
  position: number;
  /** Saisis en chaîne : un champ nombre vide vaut « rien », pas « zéro ». */
  montant: string;
  ida: string;
  afd: string;
  /** Codes des indicateurs d'objectif rattachés. */
  odpCodes: string[];
  coverMediaId: string;
  coverKey: string;
  coverSrc: string;
  videoYt: string;
  videoSrc: string;
  videoDuree: string;
  videoPosterKey: string;
  videoPosterSrc: string;
  traductions: Record<Lang, TraductionComposanteSaisie>;
  blocs: BlocSaisie[];
};

/** Listes déroulantes communes aux écrans de la fiche. */
export type ReferentielsProjet = {
  /** Indicateurs d'objectif rattachables, par leur code. */
  odp: { code: string; label: string }[];
  /** Les autres composantes, pour les renvois de la problématique. */
  composantes: { code: string; nom: string }[];
  /** Clés du registre d'images intégré, pour les visuels d'origine. */
  cles: string[];
};

/* -------------------------------------------------------------------------- */
/* Indicateurs                                                                 */
/* -------------------------------------------------------------------------- */

export type TraductionIndicateurSaisie = {
  label: string;
  baseline: string;
  note: string;
  /** Unité affichée à droite de la valeur (« millions », « jours », « km »). */
  unit: string;
  existe: boolean;
  /** Le libellé suffit (cf. `indicateurTraduit`). */
  complete: boolean;
  majLe: string | null;
};

export type IndicateurSaisie = {
  id: string;
  key: string;
  famille: IndicateurFamille;
  code: string;
  status: ProjetStatut;
  position: number;
  valeur: string;
  /** Vide : la valeur s'affiche telle quelle, sans compteur animé. */
  valeurNum: string;
  traductions: Record<Lang, TraductionIndicateurSaisie>;
};
