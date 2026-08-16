/**
 * Forme des données d'une entrée de galerie dans la console.
 *
 * ⚠️ Aucun import de Prisma : le module est lu par les composants clients du
 * formulaire comme par la couche serveur qui les alimente
 * (`lib/galerie/edition.ts`).
 *
 * Un seul formulaire pour la fiche, comme pour les documents : l'entrée n'a pas
 * de version linguistique à enregistrer séparément (cf. l'en-tête du modèle
 * `GalerieItem` au schéma). Les FICHIERS, eux, ont leurs propres formulaires —
 * remplacer une photographie et corriger une légende sont deux gestes distincts,
 * et les confondre ferait repartir un téléversement de plusieurs mégaoctets à
 * chaque correction de virgule.
 */
import type { GalerieStatut, GalerieTypeMedia } from "@/lib/galerie/statut";

/** Le visuel attaché — photographie, ou vignette d'attente d'une vidéo. */
export type VisuelSaisie = {
  /** Adresse de diffusion. */
  url: string;
  /** Identifiant chez l'hébergeur. Nul pour une adresse saisie à la main. */
  publicId: string | null;
  mime: string;
  width: number | null;
  height: number | null;
  taille: number;
};

/** Le film attaché — toujours un fichier téléversé chez l'hébergeur. */
export type VideoSaisie = {
  /** Adresse de diffusion, ou chaîne vide tant qu'aucun film n'est attaché. */
  url: string;
  /** Identifiant Cloudinary du fichier. */
  publicId: string | null;
  /** Durée en secondes relevée au dépôt. Jamais saisie. */
  duree: number | null;
};

/** La fiche complète, telle que la portent les formulaires. */
export type GalerieSaisie = {
  /** `null` sur la fiche vierge de l'écran de dépôt. */
  id: string | null;
  type: GalerieTypeMedia;
  status: GalerieStatut;

  titreFr: string;
  titreEn: string;
  descriptionFr: string;
  descriptionEn: string;
  altFr: string;
  altEn: string;

  lieu: string;

  /** Format `<input type="date">`, heure de Kinshasa. */
  priseAt: string;
  publishedAt: string;

  featured: boolean;
  position: number;
  categoryId: string;
  /** Album de rattachement. Chaîne vide : l'entrée vit hors de tout album. */
  albumId: string;
  comps: string[];

  /** `null` tant qu'aucun visuel n'a été déposé. */
  visuel: VisuelSaisie | null;
  video: VideoSaisie;

  /** Dernière modification, déjà formatée pour l'affichage. */
  majLe: string | null;
};

/** La fiche d'un album, telle que la portent les formulaires. */
export type AlbumSaisie = {
  /** `null` sur la fiche vierge de l'écran de création. */
  id: string | null;
  slug: string;
  status: GalerieStatut;

  titreFr: string;
  titreEn: string;
  descriptionFr: string;
  descriptionEn: string;
  lieu: string;

  /** Format `<input type="date">`, heure de Kinshasa. */
  dateAt: string;
  /** Fin de période. Vide : l'album porte une date unique. */
  dateFin: string;
  publishedAt: string;

  featured: boolean;
  position: number;
  categoryId: string;
  comps: string[];

  /** Entrée choisie comme couverture. Vide : la première dans l'ordre. */
  coverItemId: string;

  /** Nombre de contenus rattachés — affiché en tête de la fiche. */
  total: number;

  /** Dernière modification, déjà formatée pour l'affichage. */
  majLe: string | null;
};

/** Listes déroulantes communes aux écrans de la fiche. */
export type ReferentielsGalerieSaisie = {
  categories: { id: string; nom: string }[];
  composantes: { code: string; titre: string }[];
  /** Albums proposés au rattachement d'un contenu. */
  albums: { id: string; nom: string }[];
};
