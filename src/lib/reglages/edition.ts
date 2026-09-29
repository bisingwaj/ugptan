/**
 * Lecture des réglages pour la console.
 *
 * La ligne peut ne pas exister : elle n'est écrite qu'au premier enregistrement.
 * Plutôt que de la créer à la volée au premier affichage — ce qui ferait écrire
 * une simple consultation, y compris celle d'un compte venu regarder —, l'absence
 * est traduite en valeurs par défaut.
 */
import { db } from "@/lib/db";
import { dict } from "@/content/i18n";
import { lectureConsole } from "@/lib/lecture";
import { PAGES_DESACTIVABLES } from "@/lib/routes";
import type { NavKey } from "@/lib/routes";
import { REGLAGES_ID } from "@/lib/reglages/maintenance";

export type ReglagesSaisie = {
  maintenance: boolean;
  code: string;
  depuis: Date | null;
  jusqua: Date | null;
  messageFr: string;
  messageEn: string;
  majLe: Date | null;
  majPar: string | null;
};

const VIDE: ReglagesSaisie = {
  maintenance: false,
  code: "",
  depuis: null,
  jusqua: null,
  messageFr: "",
  messageEn: "",
  majLe: null,
  majPar: null,
};

export function chargerReglages(): Promise<ReglagesSaisie> {
  return lectureConsole(async () => {
    const ligne = await db().reglages.findUnique({ where: { id: REGLAGES_ID } });
    if (!ligne) return VIDE;
    return {
      maintenance: ligne.maintenance,
      code: ligne.maintenanceCode ?? "",
      depuis: ligne.maintenanceSince,
      jusqua: ligne.maintenanceUntil,
      messageFr: ligne.maintenanceFr ?? "",
      messageEn: ligne.maintenanceEn ?? "",
      majLe: ligne.updatedAt,
      majPar: ligne.updatedBy,
    };
  }, "réglages du site");
}

/** Une page désactivable, et son état actuel. */
export type PageSaisie = {
  cle: NavKey;
  /** Libellé français — l'unique langue de la console. */
  label: string;
  active: boolean;
  majLe: Date | null;
  majPar: string | null;
};

/**
 * L'état des pages désactivables, dans l'ordre de `PAGES_DESACTIVABLES`.
 *
 * Comme `chargerReglages`, l'absence de ligne se traduit en valeur par
 * défaut (page active) plutôt que d'être créée à la volée.
 */
export function chargerPages(): Promise<PageSaisie[]> {
  return lectureConsole(async () => {
    const lignes = await db().pageEtat.findMany();
    const fermees = new Map(lignes.map((ligne) => [ligne.cle, ligne]));
    const labels = dict("fr").nav;

    return PAGES_DESACTIVABLES.map(({ key }) => {
      const ligne = fermees.get(key);
      return {
        cle: key,
        label: labels[key],
        active: !ligne,
        majLe: ligne?.updatedAt ?? null,
        majPar: ligne?.updatedBy ?? null,
      };
    });
  }, "pages publiques");
}
