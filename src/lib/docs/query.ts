/**
 * Couche de lecture des documents — l'unique porte d'entrée du site public vers
 * la table `Document`.
 *
 * Deux invariants, tenus par toutes les fonctions de ce module :
 *
 *  1. **Rien ne sort qui ne soit publié.** Le filtre `publie` s'applique
 *     partout ; un brouillon ou une pièce archivée n'a aucune adresse publique,
 *     et son fichier n'est référencé nulle part sur le site.
 *  2. **Rien ne sort qui ne se lise.** Une pièce doit porter ce qu'il faut pour
 *     être consultée : un fichier téléchargeable, ou un corps rédigé. Les deux
 *     sont possibles ; aucun des deux ne l'est pas (cf. `consultable`).
 *
 * Le fichier lui-même n'est jamais servi par l'application : la vue porte
 * l'adresse de diffusion enregistrée à la création, et le navigateur va la
 * chercher chez l'hébergeur (cf. `lib/docs/fichier.ts` pour les deux formes
 * d'URL, consultation et téléchargement).
 */
import { db } from "@/lib/db";
import { lecteur } from "@/lib/lecture";
import { formatArticleDate } from "@/lib/format";
import { readingMinutes } from "@/lib/html/sanitize";
import { couverture, type MediaRef, type Visuel } from "@/lib/medias";
import { NAV } from "@/lib/routes";
import type { Lang } from "@/lib/pick";
import {
  apercuPossible, formatLisible, ligneTechnique, poidsLisible, urlTelechargement,
} from "@/lib/docs/fichier";
import { typeDocLabel, type DocSupport, type DocTri, type DocType } from "@/lib/docs/statut";

const lecture = lecteur("docs");

/** Condition « servi au public ». Unique définition, reprise par toutes les requêtes. */
const publie = { status: "PUBLISHED" as const };

/**
 * Condition « la pièce se lit ».
 *
 * Un document publié doit mener quelque part : vers un fichier, ou vers un
 * texte. Le cas contraire — fiche complète, rien derrière — se produit
 * naturellement dès qu'on ouvre le module à la rédaction : une publication
 * créée puis laissée vide reste en base. La liste publique l'écarte plutôt que
 * de proposer un bouton qui ne fait rien.
 */
const consultable = {
  // ⚠️ `{ champ: { not: … } }` et non `{ NOT: { champ: … } }` : la seconde forme
  // lit `null` comme un argument ABSENT et fait échouer la requête entière
  // (« Argument `fileUrl` is missing », mesuré). La négation porte ici sur la
  // valeur du champ, pas sur la présence du filtre.
  OR: [{ fileUrl: { not: null } }, { contenuFr: { not: "" } }, { contenuEn: { not: "" } }],
};

/** Publié ET consultable : la condition de toutes les lectures publiques. */
const servi = { ...publie, ...consultable };

/** ⚠️ `data` exclu : cf. le commentaire de `lib/actus/query.ts`. */
const mediaSelect = {
  id: true, filename: true, mimeType: true, size: true,
  width: true, height: true, url: true, publicId: true, altFr: true, altEn: true, legende: true,
} as const;

const documentSelect = {
  id: true,
  slug: true,
  type: true,
  support: true,
  titreFr: true,
  titreEn: true,
  descriptionFr: true,
  descriptionEn: true,
  contenuFr: true,
  contenuEn: true,
  reference: true,
  auteur: true,
  langue: true,
  authorName: true,
  authorRole: true,
  author: { select: { name: true, email: true } },
  coverMedia: { select: mediaSelect },
  publishedAt: true,
  documentDate: true,
  featured: true,
  position: true,
  comps: true,
  fileUrl: true,
  fileName: true,
  fileMime: true,
  fileSize: true,
  fileFormat: true,
  updatedAt: true,
  category: { select: { slug: true, nomFr: true, nomEn: true, color: true } },
} as const;

/* -------------------------------------------------------------------------- */
/* Vue                                                                         */
/* -------------------------------------------------------------------------- */

export type DocCategorie = { slug: string; nom: string; color: string | null; total: number };

/** Le fichier, résolu pour l'affichage. */
export type DocFichier = {
  /** Adresse de consultation — ouvre le fichier dans l'onglet. */
  url: string;
  /** Adresse de téléchargement — force l'enregistrement, nom lisible compris. */
  urlDl: string;
  nom: string;
  mime: string;
  /** « PDF », « DOCX »… */
  format: string;
  /** « 4,2 Mo ». Vide si le poids n'a pas été relevé. */
  poids: string;
  /** Le navigateur sait-il l'afficher sans le télécharger ? */
  apercu: boolean;
};

/** Un document résolu dans une langue, prêt à l'affichage. */
export type DocVue = {
  id: string;
  /** Segment d'URL de la page de lecture. Retombe sur l'identifiant à défaut. */
  slug: string;
  /** Chemin complet de la page de lecture, langue comprise. */
  chemin: string;
  titre: string;
  description: string;
  type: DocType;
  /** Libellé du type dans la langue de lecture. */
  typeLabel: string;
  support: DocSupport;
  /** La pièce se lit-elle sur le site, à sa propre adresse ? */
  redige: boolean;
  /** Corps rédigé, dans la langue de lecture. Vide pour un simple fichier. */
  contenu: string;
  /** Le corps servi est-il bien dans la langue demandée ? */
  traduit: boolean;
  /** Durée de lecture du corps, en minutes. `null` sans corps. */
  lecture: number | null;
  /** Couverture de la page de lecture. `src` vide quand il n'y en a pas. */
  visuel: Visuel;
  categorie: { slug: string; nom: string; color: string | null } | null;
  reference: string | null;
  /** Organisme producteur. */
  auteur: string | null;
  /** Signature de la personne qui a écrit — jamais celle qui a saisi. */
  signature: { nom: string; role: string | null } | null;
  /** Langue du FICHIER (« FR », « FR/EN »), pas celle de la fiche. */
  langue: string;
  /** Date retenue pour l'affichage : celle du document, sinon celle de mise en ligne. */
  date: Date | null;
  dateLabel: string | null;
  dateISO: string | null;
  /** La date affichée est-elle celle du document, ou sa mise en ligne ? */
  dateSource: "document" | "publication" | null;
  annee: number | null;
  featured: boolean;
  comps: string[];
  /** Fichier attaché. `null` pour une publication rédigée qui n'en porte pas. */
  fichier: DocFichier | null;
  /** « PDF · FR · 4,2 Mo » — la ligne technique. Vide sans fichier. */
  technique: string;
  /** Dernière modification, pour les métadonnées de la page de lecture. */
  majISO: string;
};

type LigneDocument = {
  id: string;
  slug: string | null;
  type: string;
  support: string;
  titreFr: string;
  titreEn: string | null;
  descriptionFr: string | null;
  descriptionEn: string | null;
  contenuFr: string;
  contenuEn: string;
  reference: string | null;
  auteur: string | null;
  langue: string;
  authorName: string | null;
  authorRole: string | null;
  author: { name: string | null; email: string } | null;
  coverMedia: MediaRef | null;
  publishedAt: Date | null;
  documentDate: Date | null;
  featured: boolean;
  position: number;
  comps: string[];
  fileUrl: string | null;
  fileName: string | null;
  fileMime: string | null;
  fileSize: number;
  fileFormat: string | null;
  updatedAt: Date;
  category: { slug: string; nomFr: string; nomEn: string; color: string | null } | null;
};

/**
 * L'anglais retombe sur le français quand il est vide.
 *
 * Choix explicite, et l'inverse de celui des articles : un article non traduit
 * DISPARAÎT de la version anglaise, parce qu'un corps rédactionnel en français
 * sur une page anglaise serait illisible. Un document, lui, existe d'abord comme
 * PIÈCE : masquer un rapport aux lecteurs anglophones parce que son titre n'a
 * pas été traduit reviendrait à leur cacher une information publique. La langue
 * réelle du fichier, elle, est toujours affichée.
 */
const bilingue = (fr: string | null, en: string | null, lang: Lang): string =>
  (lang === "en" ? en?.trim() || fr?.trim() : fr?.trim() || en?.trim()) ?? "";

/**
 * Signature affichée : la personne qui a ÉCRIT.
 *
 * `authorName` prime sur le compte relié, comme pour les articles : la
 * signature libre existe précisément pour dire autre chose que le nom du compte
 * — le nom d'un service, ou celui d'un rédacteur qui n'a pas d'accès à la
 * console. Aucune de ces deux valeurs n'est celle du compte qui a saisi la
 * fiche, laquelle ne sort jamais de la console.
 */
function signature(ligne: LigneDocument): { nom: string; role: string | null } | null {
  const nom = ligne.authorName?.trim() || ligne.author?.name?.trim() || null;
  return nom ? { nom, role: ligne.authorRole?.trim() || null } : null;
}

function vue(ligne: LigneDocument, lang: Lang): DocVue {
  const date = ligne.documentDate ?? ligne.publishedAt;
  const type = ligne.type as DocType;
  const support = ligne.support as DocSupport;

  // Le corps suit la même règle de repli que les titres : l'anglais retombe sur
  // le français plutôt que de laisser une page vide. `traduit` dit lequel des
  // deux est servi, pour que la page l'annonce au lecteur.
  const contenu = lang === "en" ? ligne.contenuEn || ligne.contenuFr : ligne.contenuFr || ligne.contenuEn;
  const traduit = lang === "en" ? Boolean(ligne.contenuEn.trim()) : Boolean(ligne.contenuFr.trim());

  const titre = bilingue(ligne.titreFr, ligne.titreEn, lang);
  const slug = ligne.slug || ligne.id;

  return {
    id: ligne.id,
    slug,
    chemin: `/${lang}${NAV.ressources}/${slug}`,
    titre,
    description: bilingue(ligne.descriptionFr, ligne.descriptionEn, lang),
    type,
    typeLabel: typeDocLabel(type, lang),
    support,
    redige: support === "REDIGE",
    contenu,
    traduit: contenu ? traduit : true,
    lecture: contenu ? readingMinutes(contenu) : null,
    visuel: couverture({ coverMedia: ligne.coverMedia }, lang, titre),
    signature: signature(ligne),
    categorie: ligne.category
      ? {
          slug: ligne.category.slug,
          nom: lang === "en" ? ligne.category.nomEn || ligne.category.nomFr : ligne.category.nomFr,
          color: ligne.category.color,
        }
      : null,
    reference: ligne.reference,
    auteur: ligne.auteur,
    langue: ligne.langue,
    date,
    dateLabel: date ? formatArticleDate(date, lang) : null,
    dateISO: date ? date.toISOString() : null,
    dateSource: date ? (ligne.documentDate ? "document" : "publication") : null,
    annee: date ? Number(date.toISOString().slice(0, 4)) : null,
    featured: ligne.featured,
    comps: ligne.comps,
    fichier: ligne.fileUrl
      ? {
          url: ligne.fileUrl,
          urlDl: urlTelechargement(ligne.fileUrl, ligne.fileName ?? "document"),
          nom: ligne.fileName ?? "document",
          mime: ligne.fileMime ?? "application/octet-stream",
          format: formatLisible(ligne.fileName ?? "", ligne.fileFormat),
          poids: ligne.fileSize > 0 ? poidsLisible(ligne.fileSize) : "",
          apercu: apercuPossible(ligne.fileMime ?? "", ligne.fileUrl),
        }
      : null,
    technique: ligne.fileUrl
      ? ligneTechnique({
          fileName: ligne.fileName ?? "",
          fileFormat: ligne.fileFormat,
          fileSize: ligne.fileSize,
          langue: ligne.langue,
        })
      : "",
    majISO: ligne.updatedAt.toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/* Tri                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Traduction d'un axe de tri en clause Prisma.
 *
 * `RANG` — le défaut — est l'ordre ÉDITORIAL : une liste documentaire n'est pas
 * un fil chronologique, et l'Unité doit pouvoir poser le manuel d'exécution
 * au-dessus d'une note de la semaine. La date ne départage qu'à rang égal.
 *
 * ⚠️ `nulls: "last"` sur les dates : en SQL, un NULL trie en TÊTE d'un
 * classement décroissant. Sans cette précision, les documents sans date
 * ouvriraient la liste — exactement l'inverse de ce qu'un lecteur attend.
 */
function ordre(tri: DocTri) {
  switch (tri) {
    case "DATE":
      return [
        { documentDate: { sort: "desc" as const, nulls: "last" as const } },
        { publishedAt: { sort: "desc" as const, nulls: "last" as const } },
      ];
    case "TITRE":
      return [{ titreFr: "asc" as const }];
    case "CATEGORIE":
      return [{ category: { position: "asc" as const } }, { titreFr: "asc" as const }];
    case "STATUT":
      // Sans objet côté public — toutes les lignes servies sont publiées. Le tri
      // existe pour la console, qui appelle la même fonction.
      return [{ status: "asc" as const }, { titreFr: "asc" as const }];
    default:
      return [
        { featured: "desc" as const },
        { position: "asc" as const },
        { documentDate: { sort: "desc" as const, nulls: "last" as const } },
        { publishedAt: { sort: "desc" as const, nulls: "last" as const } },
      ];
  }
}

/**
 * Clause de recherche plein texte, sur les champs qu'un visiteur tape
 * réellement : le titre dans les deux langues, le sigle et l'organisme
 * producteur. La description en fait partie — c'est souvent là que se trouve le
 * mot-clé thématique (« fibre », « genre », « réinstallation »).
 */
const clauseRecherche = (q: string) => ({
  OR: [
    { titreFr: { contains: q, mode: "insensitive" as const } },
    { titreEn: { contains: q, mode: "insensitive" as const } },
    { descriptionFr: { contains: q, mode: "insensitive" as const } },
    { descriptionEn: { contains: q, mode: "insensitive" as const } },
    { reference: { contains: q, mode: "insensitive" as const } },
    { auteur: { contains: q, mode: "insensitive" as const } },
  ],
});

/* -------------------------------------------------------------------------- */
/* Lectures publiques                                                          */
/* -------------------------------------------------------------------------- */

export type FiltresDoc = {
  lang: Lang;
  /** Slug de catégorie, tel qu'il apparaît dans ?categorie=… . */
  categorie?: string | null;
  type?: DocType | null;
  recherche?: string | null;
  tri?: DocTri;
  limite?: number;
};

/**
 * Liste des documents publiés, filtrée et triée.
 *
 * Le filtrage descend EN BASE plutôt que de trier un tableau déjà chargé :
 * la section a vocation à héberger plusieurs centaines de pièces, et rapatrier
 * toute la table pour n'en afficher que huit ferait payer au visiteur ce que
 * PostgreSQL fait mieux.
 */
export async function listerDocuments(filtres: FiltresDoc): Promise<DocVue[]> {
  const q = filtres.recherche?.trim();

  // ⚠️ La recherche entre par `AND` et non à plat : sa clause est un `OR`, et
  // `consultable` en est un autre. Fusionnés au même niveau, le second
  // écraserait le premier — la liste servirait alors des fiches sans rien
  // derrière dès qu'un mot est saisi.
  const where = {
    ...servi,
    ...(filtres.categorie ? { category: { slug: filtres.categorie } } : {}),
    ...(filtres.type ? { type: filtres.type } : {}),
    ...(q ? { AND: [clauseRecherche(q)] } : {}),
  };

  const lignes = await lecture(
    () => db().document.findMany({
      where,
      select: documentSelect,
      orderBy: ordre(filtres.tri ?? "RANG"),
      ...(filtres.limite ? { take: filtres.limite } : {}),
    }),
    [] as LigneDocument[],
    "liste des documents",
  );

  return lignes.map((ligne) => vue(ligne, filtres.lang));
}

/**
 * Catégories proposées en filtre.
 *
 * Seules celles qui portent au moins un document publié : une pastille qui ne
 * renvoie jamais rien fait douter du moteur de recherche plutôt que de la
 * catégorie. Le décompte accompagne le libellé, pour annoncer ce qui attend.
 */
export async function listerCategoriesDoc(lang: Lang): Promise<DocCategorie[]> {
  const categories = await lecture(
    () => db().documentCategory.findMany({
      where: { documents: { some: servi } },
      select: {
        slug: true, nomFr: true, nomEn: true, color: true,
        _count: { select: { documents: { where: servi } } },
      },
      orderBy: [{ position: "asc" }, { nomFr: "asc" }],
    }),
    [],
    "catégories documentaires",
  );

  return categories.map((categorie) => ({
    slug: categorie.slug,
    nom: lang === "en" ? categorie.nomEn || categorie.nomFr : categorie.nomFr,
    color: categorie.color,
    total: categorie._count.documents,
  }));
}

/**
 * Natures effectivement représentées, pour le second axe de filtre.
 *
 * Calculée et non figée sur `DOC_TYPES` : proposer « Jeu de données » quand
 * aucun n'est publié offre un filtre qui ne peut que décevoir.
 */
export async function listerTypesDoc(
  lang: Lang,
): Promise<{ type: DocType; nom: string; total: number }[]> {
  const groupes = await lecture(
    () => db().document.groupBy({ by: ["type"], where: servi, _count: { _all: true } }),
    [] as { type: string; _count: { _all: number } }[],
    "natures documentaires",
  );

  return groupes
    .map((groupe) => ({
      type: groupe.type as DocType,
      nom: typeDocLabel(groupe.type as DocType, lang),
      total: groupe._count._all,
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom, lang));
}

/* -------------------------------------------------------------------------- */
/* Page de lecture                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Une publication rédigée, par son segment d'URL.
 *
 * Deux clés acceptées, et ce n'est pas une commodité : le SLUG est l'adresse
 * publique, l'IDENTIFIANT rattrape les fiches créées avant la page de lecture,
 * qui n'ont pas encore de slug. Sans ce second recours, un document
 * réenregistré ne serait plus atteignable par l'adresse déjà partagée.
 *
 * Le filtre sur le support est délibéré : un document qui n'est qu'un fichier
 * n'a PAS de page de lecture — sa fiche est le panneau de la liste. Lui en
 * fabriquer une donnerait une page sans texte, que les moteurs indexeraient
 * comme un contenu pauvre et qui n'apporterait rien au visiteur.
 */
export async function getDocument(lang: Lang, cle: string): Promise<DocVue | null> {
  const ligne = await lecture(
    () => db().document.findFirst({
      where: { ...publie, support: "REDIGE", OR: [{ slug: cle }, { id: cle }] },
      select: documentSelect,
    }),
    null as LigneDocument | null,
    `document « ${cle} »`,
  );

  if (!ligne) return null;

  const resolu = vue(ligne, lang);
  // Une publication rédigée dont le corps est vide dans les deux langues n'est
  // pas une page : elle serait servie comme un titre suivi de rien.
  return resolu.contenu.trim() ? resolu : null;
}

/**
 * Pièces à lire ensuite, sous une publication.
 *
 * Priorité à la même thématique, puis à la même nature : ce qui rapproche deux
 * rapports, c'est leur sujet, pas leur date. La pièce courante est exclue, et
 * seules les publications rédigées sont proposées — renvoyer vers un PDF depuis
 * une page de lecture briserait le fil.
 */
export async function documentsLies(document: DocVue, lang: Lang, limite = 3): Promise<DocVue[]> {
  const lignes = await lecture(
    () => db().document.findMany({
      where: {
        ...publie,
        support: "REDIGE",
        id: { not: document.id },
        ...(document.categorie
          ? { OR: [{ category: { slug: document.categorie.slug } }, { type: document.type }] }
          : { type: document.type }),
      },
      select: documentSelect,
      orderBy: [
        { featured: "desc" },
        { documentDate: { sort: "desc", nulls: "last" } },
        { publishedAt: { sort: "desc", nulls: "last" } },
      ],
      take: limite,
    }),
    [] as LigneDocument[],
    "documents liés",
  );

  return lignes.map((ligne) => vue(ligne, lang)).filter((lie) => lie.contenu.trim().length > 0);
}

/**
 * Adresses des publications rédigées, pour le sitemap.
 *
 * Les documents qui ne sont qu'un fichier en sont absents : ils n'ont pas
 * d'adresse propre, et le fichier lui-même est servi par l'hébergeur. Ne lève
 * jamais — un sitemap amputé vaut mieux qu'une route en erreur.
 */
export async function urlsDocuments(): Promise<{ slug: string; updatedAt: Date }[]> {
  const lignes = await lecture(
    () => db().document.findMany({
      where: { ...publie, support: "REDIGE", contenuFr: { not: "" } },
      select: { id: true, slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }),
    [] as { id: string; slug: string | null; updatedAt: Date }[],
    "adresses des documents",
  );

  return lignes.map((ligne) => ({ slug: ligne.slug || ligne.id, updatedAt: ligne.updatedAt }));
}
