/**
 * Chargement des données du module « Provinces » pour la console.
 *
 * Même parti que le module « Gouvernance » (cf. lib/gouvernance/edition.ts) :
 * les deux listes s'éditent EN LISTE, sur un seul écran. Les vingt-six fiches
 * se relisent ensemble (une source datée d'une autre année saute aux yeux à
 * côté des autres), et un projet se vérifie avec les provinces qu'il cite.
 *
 * Aucun repli sur le contenu d'origine ici : la console montre la base, et
 * seulement elle (cf. `lectureConsole`).
 */
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { formatDateTime } from "@/lib/format";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { provinces } from "@/content/data";
import { slugProvince } from "@/lib/provinces/chemins";
import type {
  FicheSaisie, ProjetSaisie, ProvinceOption, TraductionFicheSaisie, TraductionProjetSaisie,
} from "@/lib/provinces/saisie";
import {
  estOdd, ficheTraduite, projetTraduit, type AvancementProjet, type ProvinceStatut,
} from "@/lib/provinces/statut";

const parLangue = <T,>(fabrique: () => T): Record<Lang, T> =>
  Object.fromEntries(LOCALES.map((lang) => [lang, fabrique()])) as Record<Lang, T>;

const traductionFicheVide = (): TraductionFicheSaisie => ({
  description: "", administration: "",
  existe: false, complete: false, majLe: null,
});

const traductionProjetVide = (): TraductionProjetSaisie => ({
  titre: "", resume: "", lieu: "",
  existe: false, complete: false, majLe: null,
});

/** Date au format `<input type="date">`, heure de Kinshasa. */
const toDateInput = (date: Date | null): string =>
  date
    ? new Intl.DateTimeFormat("sv-SE", {
        year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Africa/Kinshasa",
      }).format(date)
    : "";

const nombre = (valeur: number | null): string => (valeur === null ? "" : String(valeur));

/** Les 26 provinces, par ordre alphabétique : l'ordre où on les cherche. */
export function optionsProvinces(): ProvinceOption[] {
  return provinces
    .map((p) => ({ slug: slugProvince(p.nom), nom: p.nom, prio: p.prio }))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

/* -------------------------------------------------------------------------- */
/* Fiches                                                                      */
/* -------------------------------------------------------------------------- */

export async function chargerFiches(): Promise<FicheSaisie[]> {
  const lignes = await lectureConsole(
    () => db().provinceFiche.findMany({
      include: {
        translations: {
          select: { locale: true, description: true, administration: true, updatedAt: true },
        },
      },
    }),
    "fiches des provinces (console)",
  );

  const parSlug = new Map(optionsProvinces().map((option) => [option.slug, option]));

  const fiches = lignes.map((ligne): FicheSaisie => {
    const traductions = parLangue(traductionFicheVide);
    for (const tr of ligne.translations) {
      if (!LOCALES.includes(tr.locale as Lang)) continue;
      traductions[tr.locale as Lang] = {
        description: tr.description ?? "",
        administration: tr.administration ?? "",
        existe: true,
        complete: ficheTraduite(tr),
        majLe: formatDateTime(tr.updatedAt),
      };
    }

    const province = parSlug.get(ligne.slug);
    return {
      id: ligne.id,
      slug: ligne.slug,
      nom: province?.nom ?? ligne.slug,
      prio: province?.prio ?? false,
      status: ligne.status as ProvinceStatut,
      chefLieu: ligne.chefLieu ?? "",
      superficieKm2: nombre(ligne.superficieKm2),
      population: nombre(ligne.population),
      populationAnnee: nombre(ligne.populationAnnee),
      populationSource: ligne.populationSource ?? "",
      territoires: nombre(ligne.territoires),
      communes: nombre(ligne.communes),
      villes: ligne.villes.join("\n"),
      gouverneur: ligne.gouverneur ?? "",
      viceGouverneur: ligne.viceGouverneur ?? "",
      // La date d'une source est un jour civil : pas de fuseau à appliquer.
      gouverneurDate: ligne.gouverneurDate ? ligne.gouverneurDate.toISOString().slice(0, 10) : "",
      gouverneurSource: ligne.gouverneurSource ?? "",
      langues: ligne.langues.join("\n"),
      sources: ligne.sources.join("\n"),
      majLe: formatDateTime(ligne.updatedAt),
      traductions,
    };
  });

  return fiches.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

/* -------------------------------------------------------------------------- */
/* Projets                                                                     */
/* -------------------------------------------------------------------------- */

export async function chargerProjets(): Promise<ProjetSaisie[]> {
  const lignes = await lectureConsole(
    () => db().provinceProjet.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      include: {
        translations: {
          select: { locale: true, titre: true, resume: true, lieu: true, updatedAt: true },
        },
      },
    }),
    "projets des provinces (console)",
  );

  return lignes.map((ligne) => {
    const traductions = parLangue(traductionProjetVide);
    for (const tr of ligne.translations) {
      if (!LOCALES.includes(tr.locale as Lang)) continue;
      traductions[tr.locale as Lang] = {
        titre: tr.titre ?? "",
        resume: tr.resume ?? "",
        lieu: tr.lieu ?? "",
        existe: true,
        complete: projetTraduit(tr),
        majLe: formatDateTime(tr.updatedAt),
      };
    }

    return {
      id: ligne.id,
      key: ligne.key,
      status: ligne.status as ProvinceStatut,
      avancement: ligne.avancement as AvancementProjet,
      position: ligne.position,
      composante: ligne.composante ?? "",
      odd: ligne.odd.filter(estOdd),
      provinces: ligne.provinces,
      debut: toDateInput(ligne.debut),
      fin: toDateInput(ligne.fin),
      traductions,
    };
  });
}
