/**
 * Forme des données de la fiche d'un document dans la console.
 *
 * ⚠️ Aucun import de Prisma : le module est lu par les composants clients du
 * formulaire comme par la couche serveur qui les alimente
 * (`lib/docs/edition.ts`).
 *
 * Un seul formulaire, contrairement aux articles et aux événements : la fiche
 * n'a pas de version linguistique à enregistrer séparément (cf. l'en-tête du
 * modèle `Document` au schéma). Le FICHIER, lui, a son propre formulaire —
 * remplacer un fichier et corriger un titre sont deux gestes distincts, et les
 * confondre ferait repartir un téléversement de plusieurs mégaoctets à chaque
 * correction de virgule.
 */
import type { DocLangue, DocStatut, DocType } from "@/lib/docs/statut";

/** Le fichier attaché, tel que la console l'affiche. */
export type FichierSaisie = {
  /** Adresse de diffusion. Toujours renseignée : un document sans fichier n'existe pas. */
  url: string;
  /** Identifiant chez l'hébergeur. Nul pour une reprise dont on n'a que l'adresse. */
  publicId: string | null;
  nom: string;
  mime: string;
  taille: number;
  format: string | null;
};

/** La fiche complète, telle que la portent les formulaires. */
export type DocumentSaisie = {
  /** `null` sur la fiche vierge de l'écran de dépôt. */
  id: string | null;
  status: DocStatut;
  type: DocType;

  titreFr: string;
  titreEn: string;
  descriptionFr: string;
  descriptionEn: string;

  reference: string;
  auteur: string;
  langue: DocLangue;

  /** Format `<input type="date">`, heure de Kinshasa. */
  publishedAt: string;
  documentDate: string;

  featured: boolean;
  position: number;
  categoryId: string;
  comps: string[];

  /** `null` tant qu'aucun fichier n'a été déposé (écran de dépôt uniquement). */
  fichier: FichierSaisie | null;

  /** Dernière modification, déjà formatée pour l'affichage. */
  majLe: string | null;
};

/** Listes déroulantes communes aux écrans de la fiche. */
export type ReferentielsDocSaisie = {
  categories: { id: string; nom: string }[];
  composantes: { code: string; titre: string }[];
};
