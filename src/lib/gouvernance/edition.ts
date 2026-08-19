/**
 * Chargement des données du module « Gouvernance » pour la console.
 *
 * Les deux listes sont éditées EN LISTE plutôt que fiche par fiche : un organe
 * tient en huit champs, une décision en six, et l'intérêt de l'écran est de les
 * relire ensemble — une chronique se vérifie dans son ordre, une gouvernance
 * dans la cohérence de ses trois cartes. Passer par une page par ligne
 * obligerait à autant d'allers-retours pour une comparaison qui se fait d'un
 * coup d'œil.
 */
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { formatDateTime } from "@/lib/format";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type {
  ActiviteSaisie, OrganeSaisie, TraductionActiviteSaisie, TraductionOrganeSaisie,
} from "@/lib/gouvernance/saisie";
import { activiteTraduite, organeTraduit, type GouvStatut } from "@/lib/gouvernance/statut";

const parLangue = <T,>(fabrique: () => T): Record<Lang, T> =>
  Object.fromEntries(LOCALES.map((lang) => [lang, fabrique()])) as Record<Lang, T>;

const traductionOrganeVide = (): TraductionOrganeSaisie => ({
  nom: "", nature: "", effectif: "", presidence: "", decision: "", frequence: "",
  composition: "", membres: "",
  existe: false, complete: false, majLe: null,
});

const traductionActiviteVide = (): TraductionActiviteSaisie => ({
  dateLabel: "", titre: "", note: "",
  existe: false, complete: false, majLe: null,
});

/** Date au format `<input type="date">`, heure de Kinshasa. */
const toDateInput = (date: Date | null): string =>
  date
    ? new Intl.DateTimeFormat("sv-SE", {
        year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Africa/Kinshasa",
      }).format(date)
    : "";

/* -------------------------------------------------------------------------- */
/* Organes                                                                     */
/* -------------------------------------------------------------------------- */

export async function chargerOrganes(): Promise<OrganeSaisie[]> {
  const lignes = await lectureConsole(
    () => db().organe.findMany({
      orderBy: [{ position: "asc" }, { sigle: "asc" }],
      select: {
        id: true, key: true, sigle: true, status: true, position: true,
        translations: {
          select: {
            locale: true, nom: true, nature: true, effectif: true, presidence: true,
            decision: true, frequence: true, composition: true, membres: true, updatedAt: true,
          },
        },
      },
    }),
    "organes de gouvernance (console)",
  );

  return lignes.map((ligne) => {
    // Toutes les langues du site sont présentes, y compris celles qui n'ont
    // encore aucune ligne : c'est ce qui permet à l'onglet d'annoncer « à
    // traduire » plutôt que de disparaître.
    const traductions = parLangue(traductionOrganeVide);
    for (const tr of ligne.translations) {
      if (!LOCALES.includes(tr.locale as Lang)) continue;
      traductions[tr.locale as Lang] = {
        nom: tr.nom ?? "",
        nature: tr.nature ?? "",
        effectif: tr.effectif ?? "",
        presidence: tr.presidence ?? "",
        decision: tr.decision ?? "",
        frequence: tr.frequence ?? "",
        composition: tr.composition ?? "",
        // Un siège par ligne, comme dans le formulaire (cf. `lireLignes`).
        membres: tr.membres.join("\n"),
        existe: true,
        complete: organeTraduit(tr),
        majLe: formatDateTime(tr.updatedAt),
      };
    }

    return {
      id: ligne.id,
      key: ligne.key,
      sigle: ligne.sigle,
      status: ligne.status as GouvStatut,
      position: ligne.position,
      traductions,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Chronique des décisions                                                     */
/* -------------------------------------------------------------------------- */

export async function chargerActivites(): Promise<ActiviteSaisie[]> {
  const lignes = await lectureConsole(
    () => db().gouvActivite.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      select: {
        id: true, key: true, status: true, position: true, org: true, color: true, dateAt: true,
        translations: {
          select: { locale: true, dateLabel: true, titre: true, note: true, updatedAt: true },
        },
      },
    }),
    "chronique de la gouvernance (console)",
  );

  return lignes.map((ligne) => {
    const traductions = parLangue(traductionActiviteVide);
    for (const tr of ligne.translations) {
      if (!LOCALES.includes(tr.locale as Lang)) continue;
      traductions[tr.locale as Lang] = {
        dateLabel: tr.dateLabel ?? "",
        titre: tr.titre ?? "",
        note: tr.note ?? "",
        existe: true,
        complete: activiteTraduite(tr),
        majLe: formatDateTime(tr.updatedAt),
      };
    }

    return {
      id: ligne.id,
      key: ligne.key,
      status: ligne.status as GouvStatut,
      position: ligne.position,
      org: ligne.org,
      color: ligne.color,
      dateAt: toDateInput(ligne.dateAt),
      traductions,
    };
  });
}
