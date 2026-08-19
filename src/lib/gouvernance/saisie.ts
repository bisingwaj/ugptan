/**
 * Forme des données du module « Gouvernance » dans la console.
 *
 * ⚠️ Aucun import de Prisma : le module est lu par les composants clients des
 * formulaires comme par la couche serveur qui les alimente
 * (`lib/gouvernance/edition.ts`).
 *
 * Le découpage reproduit celui des autres modules : ce qui appartient à la
 * FICHE d'un côté, ce qui appartient à UNE LANGUE de l'autre. Les deux
 * s'enregistrent séparément (cf. actions/admin-gouvernance.ts).
 */
import type { Lang } from "@/lib/pick";
import type { GouvStatut } from "@/lib/gouvernance/statut";

/* -------------------------------------------------------------------------- */
/* Organes                                                                     */
/* -------------------------------------------------------------------------- */

export type TraductionOrganeSaisie = {
  nom: string;
  nature: string;
  effectif: string;
  presidence: string;
  decision: string;
  frequence: string;
  composition: string;
  /** Un siège par ligne, saisi en zone de texte. */
  membres: string;
  /** `false` tant qu'aucune ligne n'existe en base pour cette langue. */
  existe: boolean;
  /** Le nom et la nature sont renseignés (cf. `organeTraduit`). */
  complete: boolean;
  majLe: string | null;
};

export type OrganeSaisie = {
  id: string;
  key: string;
  sigle: string;
  status: GouvStatut;
  position: number;
  traductions: Record<Lang, TraductionOrganeSaisie>;
};

/* -------------------------------------------------------------------------- */
/* Chronique des décisions                                                     */
/* -------------------------------------------------------------------------- */

export type TraductionActiviteSaisie = {
  dateLabel: string;
  titre: string;
  note: string;
  existe: boolean;
  /** Les trois champs sont renseignés (cf. `activiteTraduite`). */
  complete: boolean;
  majLe: string | null;
};

export type ActiviteSaisie = {
  id: string;
  key: string;
  status: GouvStatut;
  position: number;
  org: string;
  color: string;
  /** Format `<input type="date">`, heure de Kinshasa. */
  dateAt: string;
  traductions: Record<Lang, TraductionActiviteSaisie>;
};
