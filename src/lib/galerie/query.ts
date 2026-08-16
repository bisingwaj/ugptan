/**
 * Couche de lecture de la galerie — l'unique porte d'entrée du site public vers
 * la table `GalerieItem`.
 *
 * Deux invariants, tenus par toutes les fonctions de ce module :
 *
 *  1. **Rien ne sort qui ne soit publié.** Le filtre `publie` s'applique
 *     partout ; une entrée masquée n'a aucune adresse publique, et son fichier
 *     n'est référencé nulle part sur le site.
 *  2. **Rien ne sort qui ne soit MONTRABLE.** Une photo sans image et une vidéo
 *     sans source produiraient l'une comme l'autre une cellule vide au milieu de
 *     la mosaïque — le défaut le plus visible qu'une galerie puisse avoir. La
 *     clause `montrable` les écarte en base, plutôt que de laisser l'affichage
 *     s'en apercevoir.
 *  3. **L'ALBUM COMMANDE.** Un média rattaché à un album masqué ne paraît nulle
 *     part, quel que soit son propre statut (cf. `albumOuvert`). C'est ce qui
 *     permet de préparer un reportage en coulisse et de le publier d'un geste.
 *
 * Le fichier lui-même n'est jamais servi par l'application : la vue porte
 * l'adresse de diffusion enregistrée au dépôt, et le navigateur va la chercher
 * chez l'hébergeur.
 */
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { lecteur } from "@/lib/lecture";
import { formatArticleDate } from "@/lib/format";
import { estOptimisable } from "@/lib/medias";
import type { Lang } from "@/lib/pick";
import { ratioVisuel } from "@/lib/galerie/fichier";
import {
  dureeISO, dureeLisible, sourceVideo, typeMediaLabel,
  type GalerieTri, type GalerieTypeMedia, type SourceVideo,
} from "@/lib/galerie/statut";

const lecture = lecteur("galerie");

/** Condition « servie au public ». Unique définition, reprise par toutes les requêtes. */
const publie = { status: "PUBLISHED" as const };

/**
 * Condition « montrable » : l'entrée a de quoi remplir sa cellule.
 *
 * Une PHOTO exige son image. Une VIDÉO exige son fichier, mais PAS de vignette :
 * sans elle, la carte affiche une plaque d'accent et le titre, ce qui reste un
 * contenu complet. Exiger la vignette masquerait des films en ligne pour un
 * défaut cosmétique — d'autant qu'un film téléversé la reçoit d'office
 * (cf. `vignetteDeVideo` dans actions/admin-galerie.ts).
 */
const montrable = {
  OR: [
    { type: "PHOTO" as const, imageUrl: { not: null } },
    { type: "VIDEO" as const, videoUrl: { not: null } },
  ],
};

/**
 * ⚠️ L'ALBUM COMMANDE. Un média rattaché à un album masqué ne paraît nulle part,
 * même s'il est lui-même publié.
 *
 * C'est la contrepartie directe du principe du module : l'information et la
 * décision vivent sur l'album, les médias n'en sont que le contenu. Ils naissent
 * donc VISIBLES au versement (cf. actions/admin-galerie.ts) — sans quoi il
 * faudrait publier quarante photographies une par une —, et c'est le statut de
 * l'album qui fait barrage.
 *
 * Sans cette clause, préparer un reportage en coulisse serait impossible : les
 * photographies versées dans un album encore masqué apparaîtraient aussitôt dans
 * la mosaïque générale, révélant l'événement avant sa publication.
 */
const albumOuvert = { OR: [{ albumId: null }, { album: publie }] };

/**
 * Condition employée DANS un album, dont le statut est déjà connu de l'appelant.
 * Elle omet `albumOuvert`, qui n'y ferait que répéter une question déjà tranchée.
 */
const servisDansAlbum = { AND: [publie, montrable] };

const servi = { AND: [publie, montrable, albumOuvert] };

const itemSelect = {
  id: true,
  type: true,
  titreFr: true,
  titreEn: true,
  descriptionFr: true,
  descriptionEn: true,
  altFr: true,
  altEn: true,
  lieu: true,
  priseAt: true,
  publishedAt: true,
  featured: true,
  position: true,
  comps: true,
  imageUrl: true,
  imageWidth: true,
  imageHeight: true,
  videoUrl: true,
  videoDuree: true,
  category: { select: { slug: true, nomFr: true, nomEn: true, color: true } },
} as const satisfies Prisma.GalerieItemSelect;

/* -------------------------------------------------------------------------- */
/* Vue                                                                         */
/* -------------------------------------------------------------------------- */

export type GalerieRubrique = { slug: string; nom: string; color: string | null; total: number };

/** Le visuel, résolu pour l'affichage. */
export type GalerieVisuel = {
  /** Adresse de l'image. Vide pour une vidéo sans vignette. */
  src: string;
  /** Texte alternatif dans la langue de lecture, replié sur le titre. */
  alt: string;
  width: number | null;
  height: number | null;
  /** Ratio natif, ou `null` quand les dimensions n'ont pas été relevées. */
  ratio: number | null;
  /** `next/image` doit-il être court-circuité ? (cf. lib/medias.ts) */
  unoptimized: boolean;
};

/** Le film, résolu pour la visionneuse. */
export type GalerieVideo = {
  source: SourceVideo;
  /** Adresse à poser dans la visionneuse : `<video src>` ou `<iframe src>`. */
  src: string;
  /** « 3:24 ». Vide si la durée n'a pas été relevée. */
  duree: string;
  /** « PT3M24S », pour les données structurées. */
  dureeISO: string | null;
};

/** Une entrée résolue dans une langue, prête à l'affichage. */
export type GalerieVue = {
  id: string;
  type: GalerieTypeMedia;
  /** Libellé du type dans la langue de lecture. */
  typeLabel: string;
  titre: string;
  description: string;
  lieu: string | null;
  rubrique: { slug: string; nom: string; color: string | null } | null;
  /** Date retenue pour l'affichage : celle de la prise de vue, sinon la mise en ligne. */
  date: Date | null;
  dateLabel: string | null;
  dateISO: string | null;
  annee: number | null;
  featured: boolean;
  comps: string[];
  visuel: GalerieVisuel;
  /** `null` pour une photographie. */
  video: GalerieVideo | null;
};

type LigneGalerie = {
  id: string;
  type: string;
  titreFr: string;
  titreEn: string | null;
  descriptionFr: string | null;
  descriptionEn: string | null;
  altFr: string | null;
  altEn: string | null;
  lieu: string | null;
  priseAt: Date | null;
  publishedAt: Date | null;
  featured: boolean;
  position: number;
  comps: string[];
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  videoUrl: string | null;
  videoDuree: number | null;
  category: { slug: string; nomFr: string; nomEn: string; color: string | null } | null;
};

/**
 * L'anglais retombe sur le français quand il est vide.
 *
 * Même choix que pour les documents, et l'inverse de celui des articles : un
 * article non traduit DISPARAÎT de la version anglaise, parce qu'un corps
 * rédactionnel en français sur une page anglaise serait illisible. Une
 * photographie, elle, se regarde dans les deux langues : la masquer aux lecteurs
 * anglophones parce que sa légende n'est pas traduite reviendrait à leur cacher
 * l'image elle-même.
 */
const bilingue = (fr: string | null, en: string | null, lang: Lang): string =>
  (lang === "en" ? en?.trim() || fr?.trim() : fr?.trim() || en?.trim()) ?? "";

/** Adresse de lecture d'un film. */
const sourceLecture = (ligne: LigneGalerie, source: SourceVideo): string =>
  source === "FICHIER" ? ligne.videoUrl ?? "" : "";

function vue(ligne: LigneGalerie, lang: Lang): GalerieVue {
  const type = ligne.type as GalerieTypeMedia;
  const date = ligne.priseAt ?? ligne.publishedAt;
  const titre = bilingue(ligne.titreFr, ligne.titreEn, lang);
  const src = ligne.imageUrl ?? "";

  const source = type === "VIDEO" ? sourceVideo(ligne) : "AUCUNE";

  return {
    id: ligne.id,
    type,
    typeLabel: typeMediaLabel(type, lang),
    titre,
    description: bilingue(ligne.descriptionFr, ligne.descriptionEn, lang),
    lieu: ligne.lieu,
    rubrique: ligne.category
      ? {
          slug: ligne.category.slug,
          nom: lang === "en" ? ligne.category.nomEn || ligne.category.nomFr : ligne.category.nomFr,
          color: ligne.category.color,
        }
      : null,
    date,
    dateLabel: date ? formatArticleDate(date, lang) : null,
    dateISO: date ? date.toISOString() : null,
    annee: date ? Number(date.toISOString().slice(0, 4)) : null,
    featured: ligne.featured,
    comps: ligne.comps,
    visuel: {
      src,
      // Le titre en repli : une image décorative sans texte alternatif reste
      // préférable à un attribut vide pour un lecteur d'écran, qui annonce
      // sinon « image » et rien d'autre.
      alt: bilingue(ligne.altFr, ligne.altEn, lang) || titre,
      width: ligne.imageWidth,
      height: ligne.imageHeight,
      ratio: ratioVisuel(ligne.imageWidth, ligne.imageHeight),
      unoptimized: !estOptimisable(src),
    },
    video:
      type === "VIDEO"
        ? {
            source,
            src: sourceLecture(ligne, source),
            duree: dureeLisible(ligne.videoDuree),
            dureeISO: dureeISO(ligne.videoDuree),
          }
        : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Tri                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Traduction d'un axe de tri en clause Prisma.
 *
 * `RANG` — le défaut — est l'ordre ÉDITORIAL : une galerie est un accrochage, et
 * l'Unité doit pouvoir ouvrir sur l'image qui raconte le mieux le Projet, quelle
 * que soit sa date. La date ne départage qu'à rang égal.
 *
 * ⚠️ `nulls: "last"` sur les dates : en SQL, un NULL trie en TÊTE d'un
 * classement décroissant. Sans cette précision, les entrées non datées
 * ouvriraient la galerie — exactement l'inverse de ce qu'un visiteur attend.
 */
function ordre(tri: GalerieTri) {
  const parDate = [
    { priseAt: { sort: "desc" as const, nulls: "last" as const } },
    { publishedAt: { sort: "desc" as const, nulls: "last" as const } },
  ];

  switch (tri) {
    case "DATE":
      return parDate;
    case "TITRE":
      return [{ titreFr: "asc" as const }];
    case "RUBRIQUE":
      return [{ category: { position: "asc" as const } }, { position: "asc" as const }, ...parDate];
    default:
      return [{ featured: "desc" as const }, { position: "asc" as const }, ...parDate];
  }
}

/**
 * Clause de recherche plein texte, sur les champs qu'un visiteur tape
 * réellement : le titre et la description dans les deux langues, et le lieu —
 * « Goma », « Matadi » sont les mots-clés d'une recherche d'images.
 */
const clauseRecherche = (q: string) => ({
  OR: [
    { titreFr: { contains: q, mode: "insensitive" as const } },
    { titreEn: { contains: q, mode: "insensitive" as const } },
    { descriptionFr: { contains: q, mode: "insensitive" as const } },
    { descriptionEn: { contains: q, mode: "insensitive" as const } },
    { lieu: { contains: q, mode: "insensitive" as const } },
  ],
});

/* -------------------------------------------------------------------------- */
/* Lectures publiques                                                          */
/* -------------------------------------------------------------------------- */

export type FiltresGalerie = {
  lang: Lang;
  /** Slug de rubrique, tel qu'il apparaît dans ?rubrique=… . */
  rubrique?: string | null;
  type?: GalerieTypeMedia | null;
  recherche?: string | null;
  tri?: GalerieTri;
  limite?: number;
  /** Slug d'album — restreint la liste à son contenu. */
  album?: string | null;
};

/**
 * Entrées publiées, filtrées et triées.
 *
 * Le filtrage descend EN BASE plutôt que de trier un tableau déjà chargé : une
 * galerie a vocation à héberger plusieurs centaines de visuels, et rapatrier
 * toute la table pour n'en afficher que trente ferait payer au visiteur ce que
 * PostgreSQL fait mieux.
 */
export async function listerGalerie(filtres: FiltresGalerie): Promise<GalerieVue[]> {
  const q = filtres.recherche?.trim();

  const where = {
    ...servi,
    ...(filtres.rubrique ? { category: { slug: filtres.rubrique } } : {}),
    ...(filtres.type ? { type: filtres.type } : {}),
    ...(filtres.album ? { album: { slug: filtres.album, ...publie } } : {}),
    ...(q ? clauseRecherche(q) : {}),
  };

  const lignes = await lecture(
    () => db().galerieItem.findMany({
      where,
      select: itemSelect,
      orderBy: ordre(filtres.tri ?? "RANG"),
      ...(filtres.limite ? { take: filtres.limite } : {}),
    }),
    [] as LigneGalerie[],
    "liste de la galerie",
  );

  return lignes.map((ligne) => vue(ligne, filtres.lang));
}

/* -------------------------------------------------------------------------- */
/* Albums                                                                      */
/* -------------------------------------------------------------------------- */

/** Un album résolu dans une langue, prêt à l'affichage. */
export type AlbumVue = {
  id: string;
  slug: string;
  titre: string;
  description: string;
  lieu: string | null;
  rubrique: { slug: string; nom: string; color: string | null } | null;
  date: Date | null;
  /** « 12 mars 2026 », ou « 12 – 14 mars 2026 » quand une période est saisie. */
  dateLabel: string | null;
  dateISO: string | null;
  featured: boolean;
  comps: string[];
  /** Nombre de contenus SERVIS — pas le total en base. */
  total: number;
  /** Vignette de couverture. `src` vide pour un album encore sans visuel. */
  couverture: GalerieVisuel;
  updatedAt: Date;
};

/**
 * Un album ne paraît que PUBLIÉ **et NON VIDE**.
 *
 * Le second critère compte autant que le premier : un album sans contenu servi
 * afficherait une carte sans vignette qui, une fois ouverte, annoncerait une
 * page vide. C'est le défaut le plus décevant d'une galerie — une promesse de
 * reportage qui ne mène nulle part. Le décompte porte sur les contenus SERVIS,
 * donc un album dont toutes les photos sont masquées disparaît lui aussi.
 */
const albumServi = { AND: [publie, { items: { some: servisDansAlbum } }] };

/** Champs relus pour une carte d'album, couverture comprise. */
const albumSelect = {
  id: true,
  slug: true,
  titreFr: true,
  titreEn: true,
  descriptionFr: true,
  descriptionEn: true,
  lieu: true,
  dateAt: true,
  dateFin: true,
  publishedAt: true,
  featured: true,
  comps: true,
  updatedAt: true,
  category: { select: { slug: true, nomFr: true, nomEn: true, color: true } },
  /* Couverture CHOISIE, quand elle l'a été. La condition `servi` s'applique
     aussi à elle : une couverture masquée entre-temps ne doit pas ressortir par
     la porte de derrière. */
  coverItem: { where: servisDansAlbum, select: itemSelect },
  /* Repli : la première entrée dans l'ordre d'affichage. `take: 1` — on ne
     rapatrie pas quarante photographies pour n'en dessiner qu'une. */
  items: { where: servisDansAlbum, select: itemSelect, orderBy: ordre("RANG"), take: 1 },
  _count: { select: { items: { where: servisDansAlbum } } },
} as const satisfies Prisma.GalerieAlbumSelect;

type LigneAlbum = {
  id: string;
  slug: string;
  titreFr: string;
  titreEn: string | null;
  descriptionFr: string | null;
  descriptionEn: string | null;
  lieu: string | null;
  dateAt: Date | null;
  dateFin: Date | null;
  publishedAt: Date | null;
  featured: boolean;
  comps: string[];
  updatedAt: Date;
  category: { slug: string; nomFr: string; nomEn: string; color: string | null } | null;
  coverItem: LigneGalerie | null;
  items: LigneGalerie[];
  _count: { items: number };
};

/**
 * Séparateur d'un intervalle de dates : tiret demi-cadratin entre deux espaces
 * fines INSÉCABLES (U+202F), la convention typographique française.
 *
 * ⚠️ Écrit en séquences d'échappement, et non en caractères littéraux. Trois
 * raisons, dont la dernière a coûté un test : U+202F est invisible à la
 * relecture, indiscernable de l'espace fine ordinaire U+2009 qui, elle, est
 * SÉCABLE — « 12 mars 2026 – ⏎ 14 mars 2026 » en bout de ligne —, et un
 * copier-coller depuis un traitement de texte substitue l'une à l'autre sans
 * que rien ne le signale.
 */
const SEPARATEUR_PERIODE = "\u202F\u2013\u202F";

/**
 * Date ou PÉRIODE d'un album, dans la langue de lecture.
 *
 * « 12 mars 2026 » pour une journée, « 12 – 14 mars 2026 » pour un reportage
 * étalé. La période se calcule à partir de deux dates et non d'un libellé saisi,
 * pour la raison donnée au schéma : « du 12 au 14 mars » ne se traduit pas tout
 * seul, et ne se trie pas.
 *
 * Une fin ANTÉRIEURE au début est ignorée plutôt que rendue telle quelle : c'est
 * une saisie inversée, et afficher « 14 – 12 mars » ferait douter de la date
 * plus que de la saisie.
 */
function periodeLisible(
  debut: Date | null,
  fin: Date | null,
  publication: Date | null,
  lang: Lang,
): string | null {
  const depart = debut ?? publication;
  if (!depart) return null;

  const label = formatArticleDate(depart, lang);
  if (!debut || !fin || fin.getTime() <= debut.getTime()) return label;

  return `${label}${SEPARATEUR_PERIODE}${formatArticleDate(fin, lang)}`;
}

/** Vignette vide — un album sans contenu servi, cas que `albumServi` écarte. */
const SANS_VISUEL: GalerieVisuel = {
  src: "", alt: "", width: null, height: null, ratio: null, unoptimized: true,
};

function vueAlbum(ligne: LigneAlbum, lang: Lang): AlbumVue {
  const date = ligne.dateAt ?? ligne.publishedAt;
  const titre = bilingue(ligne.titreFr, ligne.titreEn, lang);
  // La couverture choisie l'emporte ; à défaut, la première entrée de l'album.
  const source = ligne.coverItem ?? ligne.items[0] ?? null;
  const visuel = source ? vue(source, lang).visuel : null;

  return {
    id: ligne.id,
    slug: ligne.slug,
    titre,
    description: bilingue(ligne.descriptionFr, ligne.descriptionEn, lang),
    lieu: ligne.lieu,
    rubrique: ligne.category
      ? {
          slug: ligne.category.slug,
          nom: lang === "en" ? ligne.category.nomEn || ligne.category.nomFr : ligne.category.nomFr,
          color: ligne.category.color,
        }
      : null,
    date,
    dateLabel: periodeLisible(ligne.dateAt, ligne.dateFin, ligne.publishedAt, lang),
    dateISO: date ? date.toISOString() : null,
    featured: ligne.featured,
    comps: ligne.comps,
    total: ligne._count.items,
    // Le titre de l'album en dernier recours : une carte de couverture sans
    // texte alternatif n'apprendrait rien à un lecteur d'écran.
    couverture: visuel ? { ...visuel, alt: visuel.alt || titre } : SANS_VISUEL,
    updatedAt: ligne.updatedAt,
  };
}

/** Ordre des albums : mise en avant, rang, puis date de l'événement. */
const ordreAlbums = [
  { featured: "desc" as const },
  { position: "asc" as const },
  { dateAt: { sort: "desc" as const, nulls: "last" as const } },
  { publishedAt: { sort: "desc" as const, nulls: "last" as const } },
];

/** Albums publiés et non vides, du plus mis en avant au plus ancien. */
export async function listerAlbums(
  lang: Lang,
  options: { limite?: number; rubrique?: string | null } = {},
): Promise<AlbumVue[]> {
  const where = {
    ...albumServi,
    ...(options.rubrique ? { category: { slug: options.rubrique } } : {}),
  };

  const lignes = await lecture(
    () => db().galerieAlbum.findMany({
      where,
      select: albumSelect,
      orderBy: ordreAlbums,
      ...(options.limite ? { take: options.limite } : {}),
    }),
    [] as LigneAlbum[],
    "liste des albums",
  );

  return lignes.map((ligne) => vueAlbum(ligne, lang));
}

/**
 * Un album par son slug, pour sa page dédiée.
 *
 * Renvoie `null` sur un album masqué ou vide : la page appelle alors
 * `notFound()`. Servir une page d'album sans contenu vaudrait une 200 sur du
 * vide, que les moteurs indexeraient.
 */
export async function getAlbum(lang: Lang, slug: string): Promise<AlbumVue | null> {
  const ligne = await lecture(
    () => db().galerieAlbum.findFirst({ where: { slug, ...albumServi }, select: albumSelect }),
    null as LigneAlbum | null,
    `album « ${slug} »`,
  );

  return ligne ? vueAlbum(ligne, lang) : null;
}

/**
 * Adresses des albums servis, pour le sitemap.
 *
 * Le slug ne dépendant pas de la langue, chaque album vaut une entrée par
 * locale — c'est l'appelant qui les décline (cf. app/sitemap.ts).
 */
export async function urlsAlbums(): Promise<{ slug: string; updatedAt: Date }[]> {
  return lecture(
    () => db().galerieAlbum.findMany({
      where: albumServi,
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    [],
    "adresses des albums",
  );
}

/**
 * Rubriques proposées en filtre.
 *
 * Seules celles qui portent au moins une entrée servie : une pastille qui ne
 * renvoie jamais rien fait douter du filtre plutôt que de la rubrique. Le
 * décompte accompagne le libellé, pour annoncer ce qui attend.
 */
export async function listerRubriquesGalerie(lang: Lang): Promise<GalerieRubrique[]> {
  const rubriques = await lecture(
    () => db().galerieCategory.findMany({
      where: { items: { some: servi } },
      select: {
        slug: true, nomFr: true, nomEn: true, color: true,
        _count: { select: { items: { where: servi } } },
      },
      orderBy: [{ position: "asc" }, { nomFr: "asc" }],
    }),
    [],
    "rubriques de la galerie",
  );

  return rubriques.map((rubrique) => ({
    slug: rubrique.slug,
    nom: lang === "en" ? rubrique.nomEn || rubrique.nomFr : rubrique.nomFr,
    color: rubrique.color,
    total: rubrique._count.items,
  }));
}

/**
 * Décompte par nature, pour les deux onglets « Photos » / « Vidéos ».
 *
 * Calculé et non déduit de la liste affichée : les onglets doivent annoncer ce
 * que contient la galerie ENTIÈRE pour la rubrique en cours, pas ce qu'en montre
 * le filtre de nature déjà actif — sinon l'onglet « Vidéos » afficherait zéro
 * dès qu'on est sur « Photos », et deviendrait incliquable.
 */
export async function compterParType(
  filtres: Pick<FiltresGalerie, "rubrique" | "recherche">,
): Promise<Record<GalerieTypeMedia, number>> {
  const q = filtres.recherche?.trim();

  const where = {
    ...servi,
    ...(filtres.rubrique ? { category: { slug: filtres.rubrique } } : {}),
    ...(q ? clauseRecherche(q) : {}),
  };

  const groupes = await lecture(
    () => db().galerieItem.groupBy({ by: ["type"], where, _count: { _all: true } }),
    [] as { type: string; _count: { _all: number } }[],
    "décompte de la galerie",
  );

  const total: Record<GalerieTypeMedia, number> = { PHOTO: 0, VIDEO: 0 };
  for (const groupe of groupes) {
    if (groupe.type === "PHOTO" || groupe.type === "VIDEO") total[groupe.type] = groupe._count._all;
  }
  return total;
}

/**
 * Aperçu pour une autre page — l'accueil, une fiche de composante.
 *
 * Renvoie les entrées mises en avant en premier, ce qu'assure déjà l'ordre
 * `RANG`. Le paramètre `comps` restreint aux visuels rattachés à une composante
 * donnée, comme le fait déjà le bloc « Actualités » des pages composante.
 */
export async function apercuGalerie(
  lang: Lang,
  options: { limite?: number; comp?: string | null } = {},
): Promise<GalerieVue[]> {
  const where = {
    ...servi,
    ...(options.comp ? { comps: { has: options.comp } } : {}),
  };

  const lignes = await lecture(
    () => db().galerieItem.findMany({
      where,
      select: itemSelect,
      orderBy: ordre("RANG"),
      take: options.limite ?? 8,
    }),
    [] as LigneGalerie[],
    "aperçu de la galerie",
  );

  return lignes.map((ligne) => vue(ligne, lang));
}
