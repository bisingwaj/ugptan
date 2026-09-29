/**
 * Lecture des réglages pour la console.
 *
 * La ligne peut ne pas exister : elle n'est écrite qu'au premier enregistrement.
 * Plutôt que de la créer à la volée au premier affichage — ce qui ferait écrire
 * une simple consultation, y compris celle d'un compte venu regarder —, l'absence
 * est traduite en valeurs par défaut.
 */
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
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
