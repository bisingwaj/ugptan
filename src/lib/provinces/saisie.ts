/**
 * Forme des données du module « Provinces » dans la console.
 *
 * ⚠️ Aucun import de Prisma : le module est lu par les composants clients des
 * formulaires comme par la couche serveur qui les alimente
 * (`lib/provinces/edition.ts`).
 *
 * Même découpage que les autres modules (cf. lib/gouvernance/saisie.ts) : ce
 * qui appartient à la FICHE d'un côté, ce qui appartient à UNE LANGUE de
 * l'autre. Les deux s'enregistrent séparément (cf. actions/admin-provinces.ts).
 */
import type { Lang } from "@/lib/pick";
import type { AvancementProjet, ProvinceStatut } from "@/lib/provinces/statut";

/* -------------------------------------------------------------------------- */
/* Fiches                                                                      */
/* -------------------------------------------------------------------------- */

export type TraductionFicheSaisie = {
  description: string;
  administration: string;
  /** `false` tant qu'aucune ligne n'existe en base pour cette langue. */
  existe: boolean;
  /** La présentation est renseignée (cf. `ficheTraduite`). */
  complete: boolean;
  majLe: string | null;
};

/**
 * Les nombres sont rendus en CHAÎNES : un `<input type="number">` vide doit
 * rester vide, et `0` n'est pas « inconnu ».
 */
export type FicheSaisie = {
  id: string;
  slug: string;
  /** Nom affiché, lu dans la table figée des 26 provinces (content/data.ts). */
  nom: string;
  prio: boolean;
  status: ProvinceStatut;
  chefLieu: string;
  superficieKm2: string;
  population: string;
  populationAnnee: string;
  populationSource: string;
  territoires: string;
  communes: string;
  /** Une ville par ligne. */
  villes: string;
  gouverneur: string;
  viceGouverneur: string;
  /** Format `<input type="date">`. */
  gouverneurDate: string;
  gouverneurSource: string;
  /** Une langue par ligne. */
  langues: string;
  /** Une adresse par ligne. */
  sources: string;
  majLe: string | null;
  traductions: Record<Lang, TraductionFicheSaisie>;
};

/* -------------------------------------------------------------------------- */
/* Projets                                                                     */
/* -------------------------------------------------------------------------- */

export type TraductionProjetSaisie = {
  titre: string;
  resume: string;
  lieu: string;
  existe: boolean;
  /** L'intitulé est renseigné (cf. `projetTraduit`). */
  complete: boolean;
  majLe: string | null;
};

export type ProjetSaisie = {
  id: string;
  key: string;
  status: ProvinceStatut;
  avancement: AvancementProjet;
  position: number;
  /** Code de composante, ou "" : rattaché à aucune. */
  composante: string;
  odd: number[];
  /** Slugs des provinces. Vide : projet national. */
  provinces: string[];
  /** Format `<input type="date">`. */
  debut: string;
  fin: string;
  traductions: Record<Lang, TraductionProjetSaisie>;
};

/** Une province proposée aux cases à cocher d'un projet. */
export type ProvinceOption = { slug: string; nom: string; prio: boolean };

/** Une composante proposée au rattachement d'un projet. */
export type ComposanteOption = { code: string; titre: string };
