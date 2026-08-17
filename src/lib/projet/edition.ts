/**
 * Chargement des données du module « Le projet » pour la console.
 *
 * Partagé par les écrans de création et de modification, comme
 * `lib/impact/edition.ts` : les deux affichent les mêmes réglages, l'un sur une
 * fiche vierge, l'autre sur une fiche relue en base. Regrouper les requêtes ici
 * évite que les deux écrans divergent au premier champ ajouté.
 */
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { formatDateTime } from "@/lib/format";
import { mediaSrc, type MediaRef } from "@/lib/medias";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { media as registre } from "@/content/media";
import type { ImgKey } from "@/content/types";
import type {
  BlocSaisie, ComposanteSaisie, IndicateurSaisie, ReferentielsProjet,
  TraductionBlocSaisie, TraductionComposanteSaisie, TraductionIndicateurSaisie,
} from "@/lib/projet/saisie";
import {
  blocTraduit, composanteTraduite, indicateurTraduit,
  type ComposanteBlocType, type IndicateurFamille, type ProjetStatut,
} from "@/lib/projet/statut";

/** ⚠️ `data` exclu : cf. le commentaire de lib/actus/query.ts. */
const mediaSelect = {
  id: true, filename: true, mimeType: true, size: true,
  width: true, height: true, url: true, publicId: true, altFr: true, altEn: true, legende: true,
} as const;

const parLangue = <T,>(fabrique: () => T): Record<Lang, T> =>
  Object.fromEntries(LOCALES.map((lang) => [lang, fabrique()])) as Record<Lang, T>;

/** Chiffre saisi : `null` s'affiche vide, pas « 0 ». */
const nombre = (valeur: number | null | undefined): string =>
  valeur === null || valeur === undefined ? "" : String(valeur);

/** Un visuel du registre intégré, résolu en adresse d'aperçu. */
const srcRegistre = (cle: string | null): string => {
  const key = cle as ImgKey | null;
  return key && key in registre.img ? registre.img[key] : "";
};

/* -------------------------------------------------------------------------- */
/* Fiches vierges                                                              */
/* -------------------------------------------------------------------------- */

const traductionComposanteVide = (): TraductionComposanteSaisie => ({
  titre: "", desc: "", titreLong: "", soustitre: "",
  pbTitre: "", pbLead: "", ecoTitre: "", ecoLead: "", finTitre: "", finLead: "",
  videoTitre: "",
  existe: false, complete: false, majLe: null,
});

const traductionBlocVide = (): TraductionBlocSaisie => ({
  titre: "", texte: "", texteSecondaire: "", paragraphes: "", puces: "",
  existe: false, complete: false, majLe: null,
});

const traductionIndicateurVide = (): TraductionIndicateurSaisie => ({
  label: "", baseline: "", note: "",
  existe: false, complete: false, majLe: null,
});

/** Fiche vierge — écran « Nouvelle composante ». */
export const composanteVierge = (): ComposanteSaisie => ({
  id: null,
  key: "",
  code: "",
  slug: "",
  /* L'accent du site plutôt qu'une couleur tirée au sort : une composante sans
     accent choisi doit se fondre dans la charte, pas s'en écarter. */
  color: "#0f62fe",
  status: "DRAFT",
  position: 0,
  montant: "",
  ida: "",
  afd: "",
  odpCodes: [],
  coverMediaId: "",
  coverKey: "",
  coverSrc: "",
  videoYt: "",
  videoSrc: "",
  videoDuree: "",
  videoPosterKey: "",
  videoPosterSrc: "",
  traductions: parLangue(traductionComposanteVide),
  blocs: [],
});

/* -------------------------------------------------------------------------- */
/* Référentiels                                                                */
/* -------------------------------------------------------------------------- */

export type ReferentielsProjetComplets = {
  referentiels: ReferentielsProjet;
  assets: MediaRef[];
};

/**
 * Indicateurs rattachables, composantes voisines et bibliothèque de médias.
 *
 * `exclureId` retire la composante courante de la liste des voisines : un
 * renvoi d'une composante vers elle-même n'apprendrait rien au lecteur, et
 * l'index en tirerait une flèche qui boucle.
 */
export async function chargerReferentielsProjet(exclureId?: string): Promise<ReferentielsProjetComplets> {
  const [odp, composantes, assets] = await lectureConsole(
    () => Promise.all([
      db().indicateur.findMany({
        where: { famille: "ODP" },
        orderBy: [{ position: "asc" }, { code: "asc" }],
        select: {
          code: true,
          translations: { where: { locale: "fr" }, select: { label: true } },
        },
      }),
      db().composante.findMany({
        where: exclureId ? { id: { not: exclureId } } : {},
        orderBy: [{ position: "asc" }, { code: "asc" }],
        select: {
          code: true,
          translations: { where: { locale: "fr" }, select: { titre: true } },
        },
      }),
      db().mediaAsset.findMany({ select: mediaSelect, orderBy: { createdAt: "desc" }, take: 300 }),
    ]),
    "référentiels de « Le projet »",
  );

  return {
    referentiels: {
      // Un indicateur sans code ne se rattache pas : c'est par lui que la page
      // de composante le retrouve.
      odp: odp
        .filter((row): row is typeof row & { code: string } => Boolean(row.code))
        .map((row) => ({ code: row.code, label: row.translations[0]?.label || row.code })),
      composantes: composantes.map((row) => ({
        code: row.code,
        nom: row.translations[0]?.titre || row.code,
      })),
      cles: Object.keys(registre.img),
    },
    assets,
  };
}

/* -------------------------------------------------------------------------- */
/* Fiche relue                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Fiche relue en base, projetée dans la forme attendue par les formulaires.
 *
 * Le type de retour resserre `id` sur `string` : `ComposanteSaisie.id` est
 * nullable pour couvrir la fiche vierge, mais une fiche relue en a forcément un.
 */
export async function chargerComposante(
  id: string,
): Promise<(ComposanteSaisie & { id: string }) | null> {
  const composante = await lectureConsole(
    () => db().composante.findUnique({
      where: { id },
      select: {
        id: true, key: true, code: true, slug: true, color: true, status: true, position: true,
        montant: true, ida: true, afd: true, odpCodes: true,
        coverKey: true, coverMediaId: true, coverMedia: { select: mediaSelect },
        videoYt: true, videoSrc: true, videoDuree: true, videoPosterKey: true,
        translations: {
          select: {
            locale: true, titre: true, desc: true, titreLong: true, soustitre: true,
            pbTitre: true, pbLead: true, ecoTitre: true, ecoLead: true,
            finTitre: true, finLead: true, videoTitre: true, updatedAt: true,
          },
        },
        blocs: {
          orderBy: { position: "asc" },
          select: {
            id: true, type: true, position: true, status: true,
            reference: true, sigle: true, slug: true, montant: true, cible: true,
            coverKey: true, coverMediaId: true, coverMedia: { select: mediaSelect },
            translations: {
              select: {
                locale: true, titre: true, texte: true, texteSecondaire: true,
                paragraphes: true, puces: true, updatedAt: true,
              },
            },
          },
        },
      },
    }),
    `composante « ${id} »`,
  );

  if (!composante) return null;

  // Toutes les langues du site sont présentes, y compris celles qui n'ont
  // encore aucune ligne : c'est ce qui permet à l'onglet d'annoncer « à
  // traduire » plutôt que de disparaître.
  const traductions = parLangue(traductionComposanteVide);
  for (const tr of composante.translations) {
    if (!LOCALES.includes(tr.locale as Lang)) continue;
    traductions[tr.locale as Lang] = {
      titre: tr.titre ?? "",
      desc: tr.desc ?? "",
      titreLong: tr.titreLong ?? "",
      soustitre: tr.soustitre ?? "",
      pbTitre: tr.pbTitre ?? "",
      pbLead: tr.pbLead ?? "",
      ecoTitre: tr.ecoTitre ?? "",
      ecoLead: tr.ecoLead ?? "",
      finTitre: tr.finTitre ?? "",
      finLead: tr.finLead ?? "",
      videoTitre: tr.videoTitre ?? "",
      existe: true,
      complete: composanteTraduite(tr),
      majLe: formatDateTime(tr.updatedAt),
    };
  }

  const blocs: BlocSaisie[] = composante.blocs.map((bloc) => {
    const type = bloc.type as ComposanteBlocType;
    const trads = parLangue(traductionBlocVide);
    for (const tr of bloc.translations) {
      if (!LOCALES.includes(tr.locale as Lang)) continue;
      trads[tr.locale as Lang] = {
        titre: tr.titre ?? "",
        texte: tr.texte ?? "",
        texteSecondaire: tr.texteSecondaire ?? "",
        // Un paragraphe par ligne, comme dans le formulaire (cf. `lireLignes`).
        paragraphes: tr.paragraphes.join("\n"),
        puces: tr.puces.join("\n"),
        existe: true,
        complete: blocTraduit(type, {
          titre: tr.titre, texte: tr.texte, texteSecondaire: tr.texteSecondaire,
          paragraphes: tr.paragraphes, puces: tr.puces,
        }),
        majLe: formatDateTime(tr.updatedAt),
      };
    }

    return {
      id: bloc.id,
      type,
      position: bloc.position,
      status: bloc.status as ProjetStatut,
      reference: bloc.reference ?? "",
      sigle: bloc.sigle ?? "",
      slug: bloc.slug ?? "",
      montant: nombre(bloc.montant),
      cible: bloc.cible ?? "",
      coverMediaId: bloc.coverMediaId ?? "",
      coverKey: bloc.coverKey ?? "",
      coverSrc: bloc.coverMedia ? mediaSrc(bloc.coverMedia) : srcRegistre(bloc.coverKey),
      traductions: trads,
    };
  });

  return {
    id: composante.id,
    key: composante.key,
    code: composante.code,
    slug: composante.slug,
    color: composante.color,
    status: composante.status as ProjetStatut,
    position: composante.position,
    montant: nombre(composante.montant),
    ida: nombre(composante.ida),
    afd: nombre(composante.afd),
    odpCodes: composante.odpCodes,
    coverMediaId: composante.coverMediaId ?? "",
    coverKey: composante.coverKey ?? "",
    coverSrc: composante.coverMedia ? mediaSrc(composante.coverMedia) : srcRegistre(composante.coverKey),
    videoYt: composante.videoYt ?? "",
    videoSrc: composante.videoSrc ?? "",
    videoDuree: composante.videoDuree ?? "",
    videoPosterKey: composante.videoPosterKey ?? "",
    videoPosterSrc: srcRegistre(composante.videoPosterKey),
    traductions,
    blocs,
  };
}

/* -------------------------------------------------------------------------- */
/* Cadre de résultats                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Tous les indicateurs d'une famille, relus pour l'écran du cadre de résultats.
 *
 * L'écran les édite EN LISTE plutôt que fiche par fiche : un indicateur tient
 * en cinq champs, et le cadre de résultats se relit comme un tableau — passer
 * par une page par ligne obligerait à onze allers-retours pour vérifier une
 * cohérence qui, elle, se lit d'un coup d'œil.
 */
export async function chargerIndicateurs(famille: IndicateurFamille): Promise<IndicateurSaisie[]> {
  const lignes = await lectureConsole(
    () => db().indicateur.findMany({
      where: { famille },
      orderBy: [{ position: "asc" }, { code: "asc" }],
      select: {
        id: true, key: true, famille: true, code: true, status: true, position: true,
        valeur: true, valeurNum: true, unit: true,
        translations: {
          select: { locale: true, label: true, baseline: true, note: true, updatedAt: true },
        },
      },
    }),
    `indicateurs « ${famille} » (console)`,
  );

  return lignes.map((ligne) => {
    const trads = parLangue(traductionIndicateurVide);
    for (const tr of ligne.translations) {
      if (!LOCALES.includes(tr.locale as Lang)) continue;
      trads[tr.locale as Lang] = {
        label: tr.label ?? "",
        baseline: tr.baseline ?? "",
        note: tr.note ?? "",
        existe: true,
        complete: indicateurTraduit(tr),
        majLe: formatDateTime(tr.updatedAt),
      };
    }

    return {
      id: ligne.id,
      key: ligne.key,
      famille: ligne.famille as IndicateurFamille,
      code: ligne.code ?? "",
      status: ligne.status as ProjetStatut,
      position: ligne.position,
      valeur: ligne.valeur,
      valeurNum: nombre(ligne.valeurNum),
      unit: ligne.unit ?? "",
      traductions: trads,
    };
  });
}
