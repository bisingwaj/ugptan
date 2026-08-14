/**
 * Vocabulaire du module « Vidéos & galeries ».
 *
 * ⚠️ Aucun import de VALEUR : ce module est lu par les formulaires clients de la
 * console, par la visionneuse publique et par les gardes serveur. Seuls des
 * types sont importés, et le compilateur les efface. Les valeurs de
 * `GalerieStatut` et de `GalerieTypeMedia` reproduisent volontairement les enums
 * `GalerieStatus` et `GalerieType` du schéma Prisma — les deux doivent rester
 * alignées.
 *
 * Deux axes, à ne pas confondre :
 *   · le STATUT dit si l'entrée paraît sur le site. C'est une décision ;
 *   · le TYPE dit ce qu'elle est — une photographie ou une vidéo. C'est une
 *     nature, et elle ne change pas parce qu'on dépublie.
 *
 * La RUBRIQUE, quatrième axe, n'est pas ici : c'est une table, parce que les
 * rubriques d'un projet évoluent (cf. `GalerieCategory` au schéma).
 */
import type { Bilingual, Lang } from "@/lib/pick";

/* -------------------------------------------------------------------------- */
/* Statut de publication                                                       */
/* -------------------------------------------------------------------------- */

export const GAL_STATUTS = ["DRAFT", "PUBLISHED"] as const;
export type GalerieStatut = (typeof GAL_STATUTS)[number];

export const isGalStatut = (value: string): value is GalerieStatut =>
  (GAL_STATUTS as readonly string[]).includes(value);

export const GAL_STATUT_LABEL: Record<GalerieStatut, string> = {
  DRAFT: "Masqué",
  PUBLISHED: "Visible",
};

export const GAL_STATUT_HINT: Record<GalerieStatut, string> = {
  DRAFT: "Visible de la seule console. Le fichier existe déjà chez l'hébergeur, mais rien ne le montre sur le site.",
  PUBLISHED: "En ligne. L'entrée apparaît dans la galerie du site et s'ouvre dans la visionneuse.",
};

/** Une entrée est-elle servie au public ? Unique définition, lue partout. */
export const estPubliee = (statut: GalerieStatut): boolean => statut === "PUBLISHED";

/* -------------------------------------------------------------------------- */
/* Nature de l'entrée                                                          */
/* -------------------------------------------------------------------------- */

export const GAL_TYPES = ["PHOTO", "VIDEO"] as const;
export type GalerieTypeMedia = (typeof GAL_TYPES)[number];

export const isGalType = (value: string): value is GalerieTypeMedia =>
  (GAL_TYPES as readonly string[]).includes(value);

/**
 * Libellés des deux langues, tenus ICI et non dans `content/i18n.ts`.
 *
 * La nature d'un média est une donnée du module, pas du contenu éditorial du
 * site : la placer avec le reste du dictionnaire obligerait à modifier deux
 * fichiers pour ajouter un type, et laisserait le second oubli passer inaperçu.
 * Même règle que pour les natures documentaires (cf. lib/docs/statut.ts).
 */
export const GAL_TYPE_LABEL: Record<GalerieTypeMedia, Bilingual> = {
  PHOTO: { fr: "Photo", en: "Photo" },
  VIDEO: { fr: "Vidéo", en: "Video" },
};

/** Pluriel, pour les onglets de filtre de la page publique. */
export const GAL_TYPE_PLURIEL: Record<GalerieTypeMedia, Bilingual> = {
  PHOTO: { fr: "Photos", en: "Photos" },
  VIDEO: { fr: "Vidéos", en: "Videos" },
};

export const typeMediaLabel = (type: GalerieTypeMedia, lang: Lang): string =>
  GAL_TYPE_LABEL[type][lang];

/* -------------------------------------------------------------------------- */
/* Source d'une vidéo                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Le film a-t-il de quoi être lu ?
 *
 * DÉDUITE et non stockée, exactement comme la phase d'un événement se déduit de
 * ses dates : une colonne de plus n'aurait fait que répéter ce que la colonne de
 * contenu dit déjà, avec le risque habituel qu'elle finisse par mentir.
 *
 * Deux états seulement depuis le retrait des sources externes : le module
 * n'accepte plus qu'un FICHIER téléversé. L'identifiant YouTube et l'adresse
 * saisie à la main demandaient une saisie par vidéo, ce que le module refuse par
 * principe — l'information vit sur l'album.
 */
export type SourceVideo = "FICHIER" | "AUCUNE";

export function sourceVideo(item: { videoUrl?: string | null }): SourceVideo {
  return item.videoUrl?.trim() ? "FICHIER" : "AUCUNE";
}

/**
 * Durée lisible d'une vidéo : « 3:24 », « 1:02:10 ».
 *
 * Les heures n'apparaissent que si elles existent : « 0:03:24 » sur une capsule
 * de trois minutes donne à croire à un format d'horloge, pas à une durée.
 */
export function dureeLisible(secondes: number | null | undefined): string {
  if (!secondes || secondes <= 0) return "";

  const h = Math.floor(secondes / 3600);
  const m = Math.floor((secondes % 3600) / 60);
  const s = Math.floor(secondes % 60);
  const deux = (n: number) => String(n).padStart(2, "0");

  return h > 0 ? `${h}:${deux(m)}:${deux(s)}` : `${m}:${deux(s)}`;
}

/**
 * Durée au format ISO 8601, exigée par `VideoObject` des données structurées.
 * « PT3M24S » — les moteurs ne lisent pas « 3:24 ».
 */
export function dureeISO(secondes: number | null | undefined): string | null {
  if (!secondes || secondes <= 0) return null;

  const h = Math.floor(secondes / 3600);
  const m = Math.floor((secondes % 3600) / 60);
  const s = Math.floor(secondes % 60);

  return `PT${h > 0 ? `${h}H` : ""}${m > 0 ? `${m}M` : ""}${s > 0 || (h === 0 && m === 0) ? `${s}S` : ""}`;
}

/* -------------------------------------------------------------------------- */
/* Tri                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Axes de tri, partagés par la console et par le site public.
 *
 * `RANG` est l'ordre éditorial : mise en avant d'abord, puis `position`, puis la
 * date de prise de vue. C'est le défaut, parce qu'une galerie est un ACCROCHAGE
 * et non un fil chronologique — l'Unité veut pouvoir ouvrir sur la photographie
 * qui raconte le mieux le Projet, quelle que soit sa date.
 */
export const GAL_TRIS = ["RANG", "DATE", "TITRE", "RUBRIQUE"] as const;
export type GalerieTri = (typeof GAL_TRIS)[number];

export const isGalTri = (value: string): value is GalerieTri =>
  (GAL_TRIS as readonly string[]).includes(value);

export const GAL_TRI_LABEL: Record<GalerieTri, string> = {
  RANG: "Ordre d'affichage",
  DATE: "Date",
  TITRE: "Titre",
  RUBRIQUE: "Rubrique",
};
