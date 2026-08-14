/**
 * Les FICHIERS d'une entrée de galerie : ce qu'on accepte, et comment on
 * l'annonce.
 *
 * ⚠️ Module lu par le NAVIGATEUR (formulaires de dépôt de la console). Il
 * n'importe donc rien de `src/lib/cloudinary.ts`, qui embarque le SDK et lit
 * `process.env` : seules les constantes partagées de `src/lib/medias.ts` sont
 * réutilisées, ce module n'ayant lui-même aucune dépendance serveur.
 *
 * Les formats acceptés ne sont PAS redéfinis ici, pour la même raison que dans
 * `lib/docs/fichier.ts` : deux listes auraient divergé au premier format ajouté.
 */
import {
  MIMES_IMAGE,
  MIMES_VIDEO,
  TAILLE_MAX,
  TAILLE_MAX_VIDEO,
  estImage,
  estVideo,
  poidsLisible,
  tailleMaxPour,
} from "@/lib/medias";

export { estImage, estVideo, poidsLisible, tailleMaxPour, TAILLE_MAX, TAILLE_MAX_VIDEO };

/**
 * Visuels acceptés par la galerie : des IMAGES, et rien d'autre.
 *
 * Volontairement plus étroit que `MIMES_ACCEPTES`, qui admet aussi les
 * documents : une galerie montre, elle ne distribue pas. Un PDF déposé ici
 * produirait une cellule vide dans une grille dont toute la mise en page repose
 * sur le ratio de l'image.
 */
export const MIMES_GAL_IMAGE = MIMES_IMAGE;

/** Attribut `accept` du champ de dépôt d'un visuel. */
export const ACCEPT_GAL_IMAGE = MIMES_GAL_IMAGE.join(",");

/** Attribut `accept` du champ de dépôt d'une vidéo. */
export const ACCEPT_GAL_VIDEO = MIMES_VIDEO.join(",");

/**
 * Tout ce qu'un versement d'album accepte — photos ET vidéos, dans la même
 * sélection.
 *
 * C'est ce qui permet de vider une carte mémoire d'un seul geste : un reportage
 * mêle les deux, et obliger à faire deux passes reviendrait à trier les fichiers
 * à la main avant de les envoyer, exactement le travail que le versement en
 * série est censé supprimer. Le TYPE de chaque entrée créée se déduit du fichier
 * lui-même (cf. `typeMediaDuFichier`), pas d'un choix préalable.
 */
export const MIMES_GAL_MEDIA = [...MIMES_GAL_IMAGE, ...MIMES_VIDEO] as const;

/** Attribut `accept` du champ de versement d'un album. */
export const ACCEPT_GAL_MEDIA = MIMES_GAL_MEDIA.join(",");

export const estMimeMediaGalerie = (mimeType: string): boolean =>
  (MIMES_GAL_MEDIA as readonly string[]).includes(mimeType);

/**
 * Nature d'une entrée, déduite du type MIME du fichier versé.
 *
 * Renvoie `null` sur un type refusé : l'appelant en fait un échec NOMMÉ pour ce
 * fichier, sans interrompre les autres.
 */
export function typeMediaDuFichier(mimeType: string): "PHOTO" | "VIDEO" | null {
  if (estMimeImageGalerie(mimeType)) return "PHOTO";
  if (estMimeVideoGalerie(mimeType)) return "VIDEO";
  return null;
}

export const estMimeImageGalerie = (mimeType: string): boolean =>
  (MIMES_GAL_IMAGE as readonly string[]).includes(mimeType);

export const estMimeVideoGalerie = (mimeType: string): boolean =>
  (MIMES_VIDEO as readonly string[]).includes(mimeType);

/**
 * Ratio natif d'un visuel, arrondi à deux décimales.
 *
 * Il sert à la grille publique : une cellule qui connaît son ratio d'avance
 * réserve sa place avant que l'image arrive, et la page ne se réorganise pas
 * sous les yeux du visiteur au fil des chargements. Sans dimensions relevées, on
 * ne devine RIEN — l'appelant retombe alors sur un format carré, qui est le
 * moindre mal dans une mosaïque.
 */
export function ratioVisuel(width: number | null, height: number | null): number | null {
  if (!width || !height || width <= 0 || height <= 0) return null;
  return Math.round((width / height) * 100) / 100;
}
