/**
 * Vocabulaire du module « Documents & transparence ».
 *
 * ⚠️ Aucun import de VALEUR : ce module est lu par les formulaires clients de la
 * console, par la couche de lecture publique et par les gardes serveur. Seuls
 * des types sont importés, et le compilateur les efface. Les valeurs de
 * `DocStatut` et de `DocType` reproduisent volontairement les enums
 * `DocumentStatus` et `DocumentType` du schéma Prisma — les deux doivent rester
 * alignées.
 *
 * Deux axes, à ne pas confondre :
 *   · le STATUT dit si la pièce est servie au public (brouillon, publié,
 *     archivé). C'est une décision de l'Unité ;
 *   · le TYPE dit ce qu'elle est (rapport, étude, note…). C'est une nature, et
 *     elle ne change pas parce qu'on dépublie.
 *
 * La CATÉGORIE, troisième axe, n'est pas ici : c'est une table, parce que les
 * thématiques du projet évoluent (cf. `DocumentCategory` au schéma).
 */
import type { Bilingual, Lang } from "@/lib/pick";

/* -------------------------------------------------------------------------- */
/* Statut de publication                                                       */
/* -------------------------------------------------------------------------- */

export const DOC_STATUTS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type DocStatut = (typeof DOC_STATUTS)[number];

export const isDocStatut = (value: string): value is DocStatut =>
  (DOC_STATUTS as readonly string[]).includes(value);

export const DOC_STATUT_LABEL: Record<DocStatut, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

export const DOC_STATUT_HINT: Record<DocStatut, string> = {
  DRAFT: "Visible de la seule console. Le fichier existe déjà chez l'hébergeur, mais rien ne le référence sur le site.",
  PUBLISHED: "En ligne. Le document apparaît dans « Rapports et analyses » et son fichier est téléchargeable.",
  ARCHIVED: "Retiré du site, conservé en base avec son fichier. À préférer à la suppression pour une version remplacée.",
};

/** Un document est-il servi au public ? Unique définition, lue partout. */
export const estPublieDoc = (statut: DocStatut): boolean => statut === "PUBLISHED";

/* -------------------------------------------------------------------------- */
/* Nature du document                                                          */
/* -------------------------------------------------------------------------- */

export const DOC_TYPES = [
  "RAPPORT",
  "ETUDE",
  "ANALYSE",
  "NOTE",
  "MANUEL",
  "PLAN",
  "CADRE",
  "PRESENTATION",
  "DONNEES",
  "AUTRE",
] as const;
export type DocType = (typeof DOC_TYPES)[number];

export const isDocType = (value: string): value is DocType =>
  (DOC_TYPES as readonly string[]).includes(value);

/**
 * Libellés des deux langues, tenus ICI et non dans `content/i18n.ts`.
 *
 * La nature d'un document est une donnée du module, pas du contenu éditorial du
 * site : la placer avec le reste du dictionnaire obligerait à modifier deux
 * fichiers pour ajouter un type, et laisserait le second oubli passer inaperçu.
 */
export const DOC_TYPE_LABEL: Record<DocType, Bilingual> = {
  RAPPORT: { fr: "Rapport", en: "Report" },
  ETUDE: { fr: "Étude", en: "Study" },
  ANALYSE: { fr: "Analyse", en: "Analysis" },
  NOTE: { fr: "Note d'orientation", en: "Policy note" },
  MANUEL: { fr: "Manuel", en: "Manual" },
  PLAN: { fr: "Plan", en: "Plan" },
  CADRE: { fr: "Cadre de gestion", en: "Management framework" },
  PRESENTATION: { fr: "Présentation", en: "Presentation" },
  DONNEES: { fr: "Jeu de données", en: "Dataset" },
  AUTRE: { fr: "Autre document", en: "Other document" },
};

/** Libellé d'un type dans la langue de lecture. */
export const typeDocLabel = (type: DocType, lang: Lang): string => DOC_TYPE_LABEL[type][lang];

/* -------------------------------------------------------------------------- */
/* Langue du fichier                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Langue du FICHIER, et non de la fiche. Liste fermée : elle s'affiche telle
 * quelle dans la ligne technique du document (« PDF · FR · 4,2 Mo »), et une
 * saisie libre y produirait « fr », « Fr », « français » sur la même liste.
 */
export const DOC_LANGUES = ["FR", "EN", "FR/EN"] as const;
export type DocLangue = (typeof DOC_LANGUES)[number];

export const isDocLangue = (value: string): value is DocLangue =>
  (DOC_LANGUES as readonly string[]).includes(value);

export const DOC_LANGUE_LABEL: Record<DocLangue, Bilingual> = {
  FR: { fr: "Français", en: "French" },
  EN: { fr: "Anglais", en: "English" },
  "FR/EN": { fr: "Bilingue FR/EN", en: "Bilingual FR/EN" },
};

/* -------------------------------------------------------------------------- */
/* Tri                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Axes de tri, partagés par la console et par le site public.
 *
 * `RANG` est l'ordre éditorial : mise en avant d'abord, puis `position`, puis la
 * date. C'est le défaut, parce qu'une liste documentaire n'est pas un fil
 * chronologique — l'Unité veut pouvoir mettre le manuel d'exécution en tête.
 */
export const DOC_TRIS = ["RANG", "DATE", "TITRE", "CATEGORIE", "STATUT"] as const;
export type DocTri = (typeof DOC_TRIS)[number];

export const isDocTri = (value: string): value is DocTri =>
  (DOC_TRIS as readonly string[]).includes(value);

export const DOC_TRI_LABEL: Record<DocTri, string> = {
  RANG: "Ordre d'affichage",
  DATE: "Date",
  TITRE: "Titre",
  CATEGORIE: "Catégorie",
  STATUT: "Statut",
};
