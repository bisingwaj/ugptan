/**
 * Couche de lecture des documents — l'unique porte d'entrée du site public vers
 * la table `Document`.
 *
 * Deux invariants, tenus par toutes les fonctions de ce module :
 *
 *  1. **Rien ne sort qui ne soit publié.** Le filtre `publie` s'applique
 *     partout ; un brouillon ou une pièce archivée n'a aucune adresse publique,
 *     et son fichier n'est référencé nulle part sur le site.
 *  2. **Rien ne sort sans son fichier.** Un document est une pièce à
 *     télécharger : l'afficher sans lien utile ne rendrait service à personne.
 *
 * Le fichier lui-même n'est jamais servi par l'application : la vue porte
 * l'adresse de diffusion enregistrée à la création, et le navigateur va la
 * chercher chez l'hébergeur (cf. `lib/docs/fichier.ts` pour les deux formes
 * d'URL, consultation et téléchargement).
 */
import { db } from "@/lib/db";
import { lecteur } from "@/lib/lecture";
import { formatArticleDate } from "@/lib/format";
import type { Lang } from "@/lib/pick";
import {
  apercuPossible, formatLisible, ligneTechnique, poidsLisible, urlTelechargement,
} from "@/lib/docs/fichier";
import { typeDocLabel, type DocTri, type DocType } from "@/lib/docs/statut";

const lecture = lecteur("docs");

/** Condition « servi au public ». Unique définition, reprise par toutes les requêtes. */
const publie = { status: "PUBLISHED" as const };

const documentSelect = {
  id: true,
  type: true,
  titreFr: true,
  titreEn: true,
  descriptionFr: true,
  descriptionEn: true,
  reference: true,
  auteur: true,
  langue: true,
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
  titre: string;
  description: string;
  type: DocType;
  /** Libellé du type dans la langue de lecture. */
  typeLabel: string;
  categorie: { slug: string; nom: string; color: string | null } | null;
  reference: string | null;
  auteur: string | null;
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
  fichier: DocFichier;
  /** « PDF · FR · 4,2 Mo » — la ligne technique, prête à poser. */
  technique: string;
};

type LigneDocument = {
  id: string;
  type: string;
  titreFr: string;
  titreEn: string | null;
  descriptionFr: string | null;
  descriptionEn: string | null;
  reference: string | null;
  auteur: string | null;
  langue: string;
  publishedAt: Date | null;
  documentDate: Date | null;
  featured: boolean;
  position: number;
  comps: string[];
  fileUrl: string;
  fileName: string;
  fileMime: string;
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

function vue(ligne: LigneDocument, lang: Lang): DocVue {
  const date = ligne.documentDate ?? ligne.publishedAt;
  const type = ligne.type as DocType;

  return {
    id: ligne.id,
    titre: bilingue(ligne.titreFr, ligne.titreEn, lang),
    description: bilingue(ligne.descriptionFr, ligne.descriptionEn, lang),
    type,
    typeLabel: typeDocLabel(type, lang),
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
    fichier: {
      url: ligne.fileUrl,
      urlDl: urlTelechargement(ligne.fileUrl, ligne.fileName),
      nom: ligne.fileName,
      mime: ligne.fileMime,
      format: formatLisible(ligne.fileName, ligne.fileFormat),
      poids: ligne.fileSize > 0 ? poidsLisible(ligne.fileSize) : "",
      apercu: apercuPossible(ligne.fileMime, ligne.fileUrl),
    },
    technique: ligneTechnique({
      fileName: ligne.fileName,
      fileFormat: ligne.fileFormat,
      fileSize: ligne.fileSize,
      langue: ligne.langue,
    }),
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

  const where = {
    ...publie,
    ...(filtres.categorie ? { category: { slug: filtres.categorie } } : {}),
    ...(filtres.type ? { type: filtres.type } : {}),
    ...(q ? clauseRecherche(q) : {}),
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
      where: { documents: { some: publie } },
      select: {
        slug: true, nomFr: true, nomEn: true, color: true,
        _count: { select: { documents: { where: publie } } },
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
    () => db().document.groupBy({ by: ["type"], where: publie, _count: { _all: true } }),
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
