/**
 * Couche de lecture de « Le projet » — l'unique porte d'entrée du site public
 * vers les tables `Composante` et `Indicateur`.
 *
 * Elle sert quatre pages : l'index des composantes, les cinq pages dédiées, la
 * page « Résultats » et les deux aperçus de la page du Projet.
 *
 * Trois invariants, repris de `lib/impact/query.ts` — c'est la même doctrine,
 * appliquée à d'autres tables.
 *
 * ─── 1. Rien ne sort qui ne soit publié ──────────────────────────────────────
 * Le filtre s'applique à la composante ET à chacun de ses blocs : retirer un
 * projet phare le temps d'une validation est un geste courant, il ne doit pas
 * obliger à dépublier la page entière.
 *
 * ─── 2. Rien ne sort dans la mauvaise langue ─────────────────────────────────
 * Un bloc dont la traduction manque disparaît de la version concernée. Une
 * composante dont l'intitulé court n'est pas traduit ne s'affiche pas du tout
 * dans cette langue : sa carte quitte l'index et sa page dédiée y répond 404.
 *
 * ⚠️ Le repli entre les DEUX REGISTRES d'une même langue, en revanche, est
 * assumé : une composante dont la formulation éditoriale (`titreLong`,
 * `soustitre`) n'est pas rédigée retombe sur la formulation courte du MEP
 * (`titre`, `desc`). C'est un repli DANS la langue, jamais entre les langues :
 * il ne fait jamais paraître un texte français sur la version anglaise.
 *
 * ─── 3. Le dessin des pages ne dépend pas de l'état de la base ───────────────
 * Tant qu'AUCUNE composante publiée n'existe, le contenu d'origine du site
 * prend le relais (`src/content/data.ts` et `src/content/composantes-detail.ts`).
 * C'est ce qui permet de livrer le module sans vider sept pages publiques en
 * attendant que quelqu'un ouvre la console. La même règle vaut, FAMILLE PAR
 * FAMILLE, pour les indicateurs.
 */
import { db } from "@/lib/db";
import { lecteur } from "@/lib/lecture";
import { couverture, type MediaRef, type Visuel } from "@/lib/medias";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { composantes as composantesSeed, compColors, odp as odpSeed, intermediaires as interSeed } from "@/content/data";
import { composantesDetail } from "@/content/composantes-detail";
import type { ComposanteDetail } from "@/content/types";
import {
  blocTraduit, composanteTraduite, indicateurTraduit,
  type ComposanteBlocType, type IndicateurFamille,
} from "@/lib/projet/statut";

const lecture = lecteur("projet");

/* -------------------------------------------------------------------------- */
/* Vue                                                                         */
/* -------------------------------------------------------------------------- */

/** Une sous-composante du MEP, résolue dans une langue. */
export type SousComposanteVue = {
  id: string;
  /** Référence du Manuel (« 1.2 »). */
  reference: string | null;
  /** Dotation en millions de dollars. */
  montant: number | null;
  titre: string;
};

/** Un axe de la problématique, ou une brique de l'écosystème : même forme. */
export type CoupleVue = { id: string; titre: string; texte: string };

/** Un renvoi de la problématique. `cible` désigne une autre composante. */
export type RenvoiVue = { id: string; cible: string | null; texte: string };

/** Un projet phare, résolu dans une langue. */
export type ProjetPhareVue = {
  id: string;
  /** Numéro affiché (« 01 »). Calculé à défaut de saisie. */
  numero: string;
  /** Ancre dans la page. Dérivée du titre à défaut de saisie. */
  slug: string;
  sigle: string | null;
  titre: string;
  statut: string | null;
  corps: string[];
  points: string[];
  chute: string | null;
  visuel: Visuel | null;
};

/** Une composante, résolue dans une langue, prête à l'affichage. */
export type ComposanteVue = {
  id: string;
  key: string;
  code: string;
  slug: string;
  color: string;
  /** Formulation courte du MEP — cartes, lignes d'aperçu, fil d'Ariane. */
  titre: string;
  desc: string;
  /** Formulation éditoriale du héros. Repliée sur la courte à défaut. */
  titreLong: string;
  soustitre: string;
  visuel: Visuel | null;
  montant: number;
  ida: number;
  afd: number;
  /** Codes des indicateurs d'objectif rattachés. */
  odpCodes: string[];
  sous: SousComposanteVue[];
  /** Paragraphes du contexte, dans l'ordre. */
  chapeau: string[];
  problematique: {
    titre: string;
    lead: string;
    axes: CoupleVue[];
    appui: string[];
    liens: RenvoiVue[];
  } | null;
  objectifs: { id: string; texte: string }[];
  projets: ProjetPhareVue[];
  ecosysteme: { titre: string; lead: string; couches: CoupleVue[] } | null;
  finalite: { titre: string; lead: string; points: { id: string; texte: string }[] } | null;
  video: {
    yt: string | null;
    src: string | null;
    duree: string | null;
    titre: string;
    poster: Visuel | null;
  } | null;
};

/** Un indicateur du cadre de résultats, résolu dans une langue. */
export type IndicateurVue = {
  id: string;
  code: string | null;
  valeur: string;
  /** Renseigné, le dessin anime le chiffre au défilement. */
  valeurNum: number | null;
  unit: string;
  label: string;
  baseline: string | null;
  note: string | null;
};

/* -------------------------------------------------------------------------- */
/* Sélections Prisma                                                           */
/* -------------------------------------------------------------------------- */

/** ⚠️ `data` est volontairement absent : cf. le commentaire de lib/actus/query.ts. */
const mediaSelect = {
  id: true, filename: true, mimeType: true, size: true,
  width: true, height: true, url: true, publicId: true, altFr: true, altEn: true, legende: true,
} as const;

const blocSelect = {
  id: true, type: true, position: true, reference: true, sigle: true, slug: true,
  montant: true, cible: true, coverKey: true,
  coverMedia: { select: mediaSelect },
  translations: {
    select: { locale: true, titre: true, texte: true, texteSecondaire: true, paragraphes: true, puces: true },
  },
} as const;

const composanteSelect = {
  id: true, key: true, code: true, slug: true, color: true, position: true,
  montant: true, ida: true, afd: true, odpCodes: true,
  coverKey: true, coverMedia: { select: mediaSelect },
  videoYt: true, videoSrc: true, videoDuree: true, videoPosterKey: true,
  translations: {
    select: {
      locale: true, titre: true, desc: true, titreLong: true, soustitre: true,
      pbTitre: true, pbLead: true, ecoTitre: true, ecoLead: true,
      finTitre: true, finLead: true, videoTitre: true,
    },
  },
  blocs: {
    where: { status: "PUBLISHED" as const },
    orderBy: { position: "asc" as const },
    select: blocSelect,
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Résolution                                                                  */
/* -------------------------------------------------------------------------- */

const vide = (valeur: string | null | undefined): string | null => {
  const texte = (valeur ?? "").trim();
  return texte.length > 0 ? texte : null;
};

/** Lignes non vides d'un champ à lignes multiples. */
const lignes = (valeurs: readonly string[] | null | undefined): string[] =>
  (valeurs ?? []).map((ligne) => ligne.trim()).filter((ligne) => ligne.length > 0);

/**
 * Ancre d'un projet phare, à défaut de saisie.
 *
 * Le titre sert de repli, réduit à un identifiant : une ancre absente casserait
 * l'index collant de la page, dont chaque lien vise `#projet-<slug>`.
 */
const ancre = (titre: string, rang: number): string => {
  const base = titre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `projet-${rang + 1}`;
};

const numero = (rang: number): string => String(rang + 1).padStart(2, "0");

type BlocBrut = {
  id: string;
  type: string;
  reference: string | null;
  sigle: string | null;
  slug: string | null;
  montant: number | null;
  cible: string | null;
  coverKey: string | null;
  coverMedia: MediaRef | null;
  translations: {
    locale: string; titre: string | null; texte: string | null; texteSecondaire: string | null;
    paragraphes: string[]; puces: string[];
  }[];
};

/** Un bloc résolu dans une langue, ou `null` si la langue n'est pas servie. */
type BlocResolu = BlocBrut & {
  titre: string | null;
  texte: string | null;
  texteSecondaire: string | null;
  paragraphes: string[];
  puces: string[];
};

function resoudreBloc(bloc: BlocBrut, lang: Lang): BlocResolu | null {
  const tr = bloc.translations.find((item) => item.locale === lang);
  if (!tr) return null;

  const valeurs = {
    titre: vide(tr.titre),
    texte: vide(tr.texte),
    texteSecondaire: vide(tr.texteSecondaire),
    paragraphes: lignes(tr.paragraphes),
    puces: lignes(tr.puces),
  };
  if (!blocTraduit(bloc.type as ComposanteBlocType, valeurs)) return null;

  return { ...bloc, ...valeurs };
}

type ComposanteBrute = {
  id: string; key: string; code: string; slug: string; color: string; position: number;
  montant: number; ida: number; afd: number; odpCodes: string[];
  coverKey: string | null; coverMedia: MediaRef | null;
  videoYt: string | null; videoSrc: string | null; videoDuree: string | null; videoPosterKey: string | null;
  translations: {
    locale: string; titre: string | null; desc: string | null; titreLong: string | null;
    soustitre: string | null; pbTitre: string | null; pbLead: string | null;
    ecoTitre: string | null; ecoLead: string | null; finTitre: string | null;
    finLead: string | null; videoTitre: string | null;
  }[];
  blocs: BlocBrut[];
};

/** `null` quand la composante n'a rien à servir dans cette langue. */
function resoudreComposante(composante: ComposanteBrute, lang: Lang): ComposanteVue | null {
  const tr = composante.translations.find((item) => item.locale === lang);
  if (!tr || !composanteTraduite(tr)) return null;

  const titre = vide(tr.titre) ?? "";
  const desc = vide(tr.desc) ?? "";

  const resolus = composante.blocs
    .map((bloc) => resoudreBloc(bloc, lang))
    .filter((bloc): bloc is BlocResolu => bloc !== null);
  const parType = (type: ComposanteBlocType) => resolus.filter((bloc) => bloc.type === type);

  const visuel = (cle: string | null, media: MediaRef | null, alt: string): Visuel | null => {
    if (!media && !cle) return null;
    const resolu = couverture({ coverMedia: media, coverKey: cle }, lang, alt);
    return resolu.src ? resolu : null;
  };

  const axes = parType("PB_AXE").map((bloc) => ({
    id: bloc.id, titre: bloc.titre ?? "", texte: bloc.texte ?? "",
  }));
  const appui = parType("PB_APPUI").map((bloc) => bloc.texte ?? "");
  const liens = parType("PB_LIEN").map((bloc) => ({
    id: bloc.id, cible: vide(bloc.cible), texte: bloc.texte ?? "",
  }));
  const pbTitre = vide(tr.pbTitre);
  const pbLead = vide(tr.pbLead);

  const couches = parType("ECO_COUCHE").map((bloc) => ({
    id: bloc.id, titre: bloc.titre ?? "", texte: bloc.texte ?? "",
  }));
  const ecoTitre = vide(tr.ecoTitre);
  const ecoLead = vide(tr.ecoLead);

  const points = parType("FIN_POINT").map((bloc) => ({ id: bloc.id, texte: bloc.titre ?? "" }));
  const finTitre = vide(tr.finTitre);
  const finLead = vide(tr.finLead);

  const videoTitre = vide(tr.videoTitre);
  const posterKey = vide(composante.videoPosterKey);

  return {
    id: composante.id,
    key: composante.key,
    code: composante.code,
    slug: composante.slug,
    color: composante.color,
    titre,
    desc,
    // Repli DANS la langue, jamais entre les langues (cf. l'en-tête).
    titreLong: vide(tr.titreLong) ?? titre,
    soustitre: vide(tr.soustitre) ?? desc,
    visuel: visuel(composante.coverKey, composante.coverMedia, titre),
    montant: composante.montant,
    ida: composante.ida,
    afd: composante.afd,
    odpCodes: composante.odpCodes,
    sous: parType("SOUS_COMPOSANTE").map((bloc) => ({
      id: bloc.id, reference: vide(bloc.reference), montant: bloc.montant, titre: bloc.titre ?? "",
    })),
    chapeau: parType("CHAPEAU").map((bloc) => bloc.texte ?? ""),
    /* La problématique n'existe que par son en-tête ET ses axes : un titre seul
       ouvrirait une bande vide, des axes seuls tomberaient sans annonce. */
    problematique: pbTitre && axes.length > 0
      ? { titre: pbTitre, lead: pbLead ?? "", axes, appui, liens }
      : null,
    objectifs: parType("OBJECTIF").map((bloc) => ({ id: bloc.id, texte: bloc.titre ?? "" })),
    projets: parType("PROJET").map((bloc, rang) => {
      const titreProjet = bloc.titre ?? "";
      return {
        id: bloc.id,
        numero: vide(bloc.reference) ?? numero(rang),
        slug: vide(bloc.slug) ?? ancre(titreProjet, rang),
        sigle: vide(bloc.sigle),
        titre: titreProjet,
        statut: bloc.texteSecondaire,
        // La chute est un paragraphe de plus, mis en valeur : elle ne remplace
        // pas le corps, elle le clôt.
        corps: bloc.paragraphes,
        points: bloc.puces,
        chute: bloc.texte,
        visuel: visuel(bloc.coverKey, bloc.coverMedia, titreProjet),
      };
    }),
    ecosysteme: ecoTitre && couches.length > 0
      ? { titre: ecoTitre, lead: ecoLead ?? "", couches }
      : null,
    finalite: finTitre && points.length > 0
      ? { titre: finTitre, lead: finLead ?? "", points }
      : null,
    /* L'emplacement vidéo existe dès qu'une affiche et un titre sont posés :
       sans fichier, la page annonce « à venir » plutôt que de ne rien montrer,
       comportement repris du contenu d'origine. */
    video: posterKey && videoTitre
      ? {
          yt: vide(composante.videoYt),
          src: vide(composante.videoSrc),
          duree: vide(composante.videoDuree),
          titre: videoTitre,
          poster: visuel(posterKey, null, videoTitre),
        }
      : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Repli sur le contenu d'origine                                              */
/* -------------------------------------------------------------------------- */

const detailDe = (code: string): ComposanteDetail | undefined =>
  composantesDetail.find((item) => item.code === code);

/**
 * Composante du contenu d'origine, projetée dans la vue publique.
 *
 * Les identifiants sont préfixés `seed-` : ils ne désignent aucune ligne en
 * base, et rien de ce qui les porte n'est modifiable depuis la console.
 */
function resoudreSeedComposante(code: string, lang: Lang): ComposanteVue | null {
  const comp = composantesSeed.find((item) => item.code === code);
  if (!comp) return null;
  const detail = detailDe(code);

  const titre = pick(comp.titre, lang);
  const desc = pick(comp.desc, lang);
  const cle = `seed-${code.toLowerCase()}`;

  const visuelDe = (imgKey: string | undefined, alt: string): Visuel | null => {
    if (!imgKey) return null;
    const resolu = couverture({ coverKey: imgKey }, lang, alt);
    return resolu.src ? resolu : null;
  };

  const pb = detail?.problematique;
  const axes = (pb?.axes ?? []).map((axe, rang) => ({
    id: `${cle}-axe-${rang}`, titre: pick(axe.t, lang), texte: pick(axe.d, lang),
  }));
  const couches = (detail?.ecosysteme?.couches ?? []).map((couche, rang) => ({
    id: `${cle}-eco-${rang}`, titre: pick(couche.t, lang), texte: pick(couche.d, lang),
  }));

  const video = detail?.video;
  const videoTitre = video ? pick(video.titre, lang) : "";

  return {
    id: cle,
    key: cle,
    code: comp.code,
    slug: detail?.slug ?? comp.code.toLowerCase(),
    color: compColors[comp.code] ?? "var(--ac)",
    titre,
    desc,
    titreLong: detail ? pick(detail.titreLong, lang) : titre,
    soustitre: detail ? pick(detail.soustitre, lang) : desc,
    visuel: visuelDe(detail?.img, titre),
    montant: comp.montant,
    ida: comp.ida,
    afd: comp.afd,
    odpCodes: detail?.odp ?? [],
    sous: comp.sous.map((item, rang) => ({
      id: `${cle}-sous-${rang}`, reference: item.ref, montant: item.montant, titre: pick(item.text, lang),
    })),
    chapeau: detail ? (lang === "en" ? detail.chapeau.en : detail.chapeau.fr) : [],
    problematique: pb
      ? {
          titre: pick(pb.titre, lang),
          lead: pick(pb.lead, lang),
          axes,
          appui: lang === "en" ? pb.appui.en : pb.appui.fr,
          liens: pb.liens.map((lien, rang) => ({
            id: `${cle}-lien-${rang}`, cible: lien.code ?? null, texte: pick(lien.t, lang),
          })),
        }
      : null,
    objectifs: (detail?.objectifs ?? []).map((objectif, rang) => ({
      id: `${cle}-obj-${rang}`, texte: pick(objectif, lang),
    })),
    projets: (detail?.projets ?? []).map((projet, rang) => ({
      id: `${cle}-projet-${rang}`,
      numero: projet.n,
      slug: projet.slug,
      sigle: projet.sigle ?? null,
      titre: pick(projet.titre, lang),
      statut: projet.statut ? pick(projet.statut, lang) : null,
      corps: lang === "en" ? projet.corps.en : projet.corps.fr,
      points: (projet.points ?? []).map((point) => pick(point, lang)),
      chute: projet.chute ? pick(projet.chute, lang) : null,
      visuel: visuelDe(projet.img, pick(projet.titre, lang)),
    })),
    ecosysteme: detail?.ecosysteme
      ? {
          titre: pick(detail.ecosysteme.titre, lang),
          lead: pick(detail.ecosysteme.lead, lang),
          couches,
        }
      : null,
    finalite: detail?.finalite
      ? {
          titre: pick(detail.finalite.titre, lang),
          lead: pick(detail.finalite.lead, lang),
          points: detail.finalite.points.map((point, rang) => ({
            id: `${cle}-fin-${rang}`, texte: pick(point, lang),
          })),
        }
      : null,
    video: video
      ? {
          yt: video.yt ?? null,
          src: video.src ?? null,
          duree: video.duree ?? null,
          titre: videoTitre,
          poster: visuelDe(video.poster, videoTitre),
        }
      : null,
  };
}

const seedComposantes = (lang: Lang): ComposanteVue[] =>
  composantesSeed
    .map((comp) => resoudreSeedComposante(comp.code, lang))
    .filter((comp): comp is ComposanteVue => comp !== null);

/**
 * Indicateurs du contenu d'origine.
 *
 * ⚠️ `baseline` et `note` étaient rédigés en français SEUL, et s'affichaient
 * tels quels sur la version anglaise. Le repli reproduit ce comportement à
 * l'identique — il n'y a pas de traduction à inventer ici — et la console
 * permet de la fournir dès la reprise en base.
 */
function seedIndicateurs(famille: IndicateurFamille, lang: Lang): IndicateurVue[] {
  if (famille === "ODP") {
    return odpSeed.map((item) => ({
      id: `seed-${item.code}`,
      code: item.code,
      valeur: String(item.value),
      valeurNum: item.value,
      unit: item.unit,
      label: pick(item.label, lang),
      baseline: item.baseline,
      note: item.femmes,
    }));
  }

  return interSeed.map((item, rang) => ({
    id: `seed-inter-${rang}`,
    code: null,
    valeur: item.value,
    valeurNum: null,
    unit: item.unit,
    label: pick(item.text, lang),
    baseline: null,
    note: null,
  }));
}

/* -------------------------------------------------------------------------- */
/* Lecture                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Composantes publiées, résolues dans une langue et dans l'ordre du MEP.
 *
 * Le repli sur le contenu d'origine se décide sur la présence d'une composante
 * publiée EN BASE, avant résolution linguistique : sans cela, une composante
 * publiée mais non traduite en anglais ferait ressurgir le contenu d'origine
 * sur la seule version anglaise, et les deux versions du site ne diraient plus
 * la même chose sans que personne l'ait décidé.
 */
export async function composantesPubliques(lang: Lang): Promise<ComposanteVue[]> {
  const lignesBase = await lecture(
    () => db().composante.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ position: "asc" }, { code: "asc" }],
      select: composanteSelect,
    }),
    [],
    "composantes du Projet",
  );

  if (lignesBase.length === 0) return seedComposantes(lang);

  return lignesBase
    .map((composante) => resoudreComposante(composante as ComposanteBrute, lang))
    .filter((composante): composante is ComposanteVue => composante !== null);
}

/**
 * Une composante par son slug ou son code, insensible à la casse.
 *
 * Passe par la liste complète plutôt que par une requête ciblée : la page a de
 * toute façon besoin de ses voisines — le pager, la barre d'onglets et les
 * renvois de la problématique les nomment toutes.
 */
export async function composantePublique(
  cle: string,
  lang: Lang,
): Promise<{ composante: ComposanteVue; toutes: ComposanteVue[] } | null> {
  const toutes = await composantesPubliques(lang);
  const recherche = cle.toLowerCase();
  const composante = toutes.find(
    (item) => item.slug.toLowerCase() === recherche || item.code.toLowerCase() === recherche,
  );
  return composante ? { composante, toutes } : null;
}

/** Slugs à pré-générer. Le contenu d'origine sert de repli, base éteinte. */
export async function slugsComposantes(): Promise<string[]> {
  const lignesBase = await lecture(
    () => db().composante.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { position: "asc" },
      select: { slug: true },
    }),
    [],
    "adresses des pages de composante",
  );

  if (lignesBase.length === 0) return composantesDetail.map((detail) => detail.slug);
  return lignesBase.map((row) => row.slug);
}

/**
 * Indicateurs d'une famille, résolus dans une langue.
 *
 * `codes` restreint la grille à certains indicateurs, ce dont une page de
 * composante a besoin pour ceux qui lui sont rattachés. Un code inconnu est
 * ignoré plutôt que de vider la grille.
 */
export async function indicateurs(
  famille: IndicateurFamille,
  lang: Lang,
  codes?: readonly string[],
): Promise<IndicateurVue[]> {
  const lignesBase = await lecture(
    () => db().indicateur.findMany({
      where: { famille, status: "PUBLISHED" },
      orderBy: [{ position: "asc" }, { code: "asc" }],
      select: {
        id: true, code: true, valeur: true, valeurNum: true, unit: true,
        translations: { select: { locale: true, label: true, baseline: true, note: true } },
      },
    }),
    [],
    `indicateurs « ${famille} »`,
  );

  const liste = lignesBase.length === 0
    ? seedIndicateurs(famille, lang)
    : lignesBase
        .map((item): IndicateurVue | null => {
          const tr = item.translations.find((row) => row.locale === lang);
          if (!tr || !indicateurTraduit(tr)) return null;
          return {
            id: item.id,
            code: vide(item.code),
            valeur: item.valeur,
            valeurNum: item.valeurNum,
            unit: vide(item.unit) ?? "",
            label: vide(tr.label) ?? "",
            baseline: vide(tr.baseline),
            note: vide(tr.note),
          };
        })
        .filter((item): item is IndicateurVue => item !== null);

  if (!codes) return liste;
  return liste.filter((item) => item.code !== null && codes.includes(item.code));
}

/* -------------------------------------------------------------------------- */
/* Référentiel partagé                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Les composantes telles que les AUTRES modules de la console les proposent :
 * rattacher un article, une publication, un événement ou un reportage.
 *
 * Les brouillons en font partie, et c'est voulu : un communiqué peut annoncer
 * une composante dont la page n'est pas encore ouverte. Le rattachement est une
 * étiquette de classement, pas un lien vers une page.
 *
 * Le nom est celui de la version FRANÇAISE : la console est un outil de travail
 * interne, elle n'a pas de version anglaise.
 */
export async function referentielComposantes(): Promise<{ code: string; titre: string }[]> {
  const lignesBase = await lecture(
    () => db().composante.findMany({
      orderBy: [{ position: "asc" }, { code: "asc" }],
      select: {
        code: true,
        translations: { where: { locale: "fr" }, select: { titre: true } },
      },
    }),
    [],
    "référentiel des composantes",
  );

  if (lignesBase.length === 0) {
    return composantesSeed.map((comp) => ({ code: comp.code, titre: comp.titre.fr }));
  }

  return lignesBase.map((row) => ({
    code: row.code,
    titre: row.translations[0]?.titre || row.code,
  }));
}

/**
 * Codes admis pour un rattachement.
 *
 * ⚠️ Cette lecture remplace une liste FIGÉE (`new Set(composantes.map(…))`)
 * évaluée à l'import des actions : elle rejetait silencieusement toute
 * composante créée en console, et la case cochée par l'éditeur disparaissait à
 * l'enregistrement sans un mot.
 */
export async function codesComposantes(): Promise<Set<string>> {
  const referentiel = await referentielComposantes();
  return new Set(referentiel.map((item) => item.code));
}

/** Toutes les clés d'amorçage, pour la reprise en console. */
export const clesComposantes = (): string[] => composantesSeed.map((comp) => comp.code);
