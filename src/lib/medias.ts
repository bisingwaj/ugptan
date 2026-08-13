/**
 * Résolution d'un visuel géré depuis la console.
 *
 * Trois provenances cohabitent, par ordre de priorité :
 *   1. un média porteur d'une URL — fichier déposé chez Cloudinary, ou média
 *      externe saisi à la main : dans les deux cas l'adresse est enregistrée ;
 *   2. un fichier HISTORIQUE, antérieur à la bascule, servi par
 *      `/api/medias/<id>` depuis la base ;
 *   3. une CLÉ du registre intégré (`src/content/media.ts`), pour les articles
 *      repris de la version statique du site.
 *
 * Aucun import Prisma ni Cloudinary : le module est lu par des composants
 * clients (sélecteur de médias) autant que par les pages serveur. Le dépôt lui
 * même vit dans `src/lib/cloudinary.ts`, qui ne s'importe que côté serveur.
 */
import { media } from "@/content/media";
import type { ImgKey } from "@/content/types";
import type { Bilingual, Lang } from "@/lib/pick";

/** Chemin d'un fichier historique servi depuis la base. Source unique de cette forme d'URL. */
export const mediaRoute = (id: string) => `/api/medias/${id}`;

/** Vue d'un média, telle que la manipulent les formulaires et l'affichage. */
export type MediaRef = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  /** Adresse du fichier — Cloudinary ou CDN tiers. `null` pour un fichier historique. */
  url: string | null;
  /**
   * Identifiant Cloudinary. Renseigné, le fichier NOUS appartient : la console
   * l'annonce par son poids et sa suppression le retire du compte. Nul avec une
   * `url`, c'est un média externe dont on ne détient que l'adresse.
   */
  publicId: string | null;
  altFr: string | null;
  altEn: string | null;
  legende: string | null;
};

/** URL d'affichage d'un média de la bibliothèque. */
export const mediaSrc = (asset: Pick<MediaRef, "id" | "url">): string =>
  asset.url ?? mediaRoute(asset.id);

/**
 * Hôtes déclarés dans `next.config.mjs` (`images.remotePatterns`).
 *
 * ⚠️ Doublon assumé : `next/image` refuse une source distante non déclarée, et
 * la console peut enregistrer l'URL de n'importe quel CDN. Plutôt que d'ouvrir
 * le patron distant à `**` — ce qui ferait de l'optimiseur d'images un relais
 * ouvert — on rend l'image NON OPTIMISÉE quand l'hôte n'est pas connu. Elle
 * s'affiche, simplement sans redimensionnement automatique.
 */
const HOTES_OPTIMISABLES = ["res.cloudinary.com", "images.unsplash.com", "cdn.ugptn.cd"];

/** `next/image` sait-il traiter cette source ? */
export function estOptimisable(src: string): boolean {
  if (!src) return false;
  if (!/^https?:\/\//i.test(src)) return true; // chemin relatif : same-origin
  const host = /^https?:\/\/([^/?#]+)/i.exec(src)?.[1].split(":")[0].toLowerCase();
  return host !== undefined && HOTES_OPTIMISABLES.includes(host);
}

/** Visuel prêt à poser dans `<Photo>`. */
export type Visuel = { src: string; alt: string; unoptimized: boolean };

/**
 * Résout la couverture d'un article.
 * `alt` retombe sur le titre : une image de couverture décorative sans texte
 * alternatif reste préférable à un attribut vide pour un lecteur d'écran qui
 * annonce déjà le titre juste après.
 */
export function couverture(
  input: {
    coverMedia?: MediaRef | null;
    coverKey?: string | null;
    coverAlt?: string | null;
  },
  lang: Lang,
  fallbackAlt = "",
): Visuel {
  const asset = input.coverMedia;
  if (asset) {
    const src = mediaSrc(asset);
    const alt = input.coverAlt || (lang === "en" ? asset.altEn : asset.altFr) || fallbackAlt;
    return { src, alt, unoptimized: !estOptimisable(src) };
  }

  const key = input.coverKey as ImgKey | null | undefined;
  const src = key && key in media.img ? media.img[key] : "";
  return { src, alt: input.coverAlt || fallbackAlt, unoptimized: !estOptimisable(src) };
}

/** Texte alternatif d'un média de la bibliothèque, dans la langue active. */
export const mediaAlt = (asset: MediaRef, lang: Lang): string =>
  (lang === "en" ? asset.altEn : asset.altFr) ?? "";

/** Libellé bilingue d'un média, pour les listes de la console. */
export const mediaLibelle = (asset: MediaRef): Bilingual => ({
  fr: asset.altFr || asset.filename,
  en: asset.altEn || asset.altFr || asset.filename,
});

/** Images acceptées au téléversement. Le SVG est exclu : il porte du script. */
export const MIMES_IMAGE = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

/**
 * Documents acceptés au téléversement — rapports, avis d'appel d'offres,
 * comptes rendus. Déposés chez Cloudinary en ressource « brute », ils ressortent
 * octet pour octet : un PDF signé reste vérifiable.
 *
 * Liste FERMÉE, volontairement : accepter n'importe quel type ferait de la
 * bibliothèque un hébergeur de fichiers arbitraires, dont des exécutables.
 */
export const MIMES_DOCUMENT = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
] as const;

/** Tout ce que la bibliothèque accepte, images et documents confondus. */
export const MIMES_ACCEPTES = [...MIMES_IMAGE, ...MIMES_DOCUMENT] as const;

/** Ce média s'affiche-t-il comme une image, ou se télécharge-t-il ? */
export const estImage = (mimeType: string): boolean =>
  mimeType.startsWith("image/") || mimeType === "image/*";

/** Plafond d'une image téléversée (octets). Aligné sur `next.config.mjs`. */
export const TAILLE_MAX = 5 * 1024 * 1024;

/**
 * Plafond d'un document (octets). Plus haut que celui des images : un rapport
 * scanné dépasse couramment 5 Mo, et il n'est ni recompressé ni redimensionné.
 * Le fichier transitant par une server action, `bodySizeLimit` de
 * `next.config.mjs` doit rester au-dessus — marge d'encodage multipart comprise.
 */
export const TAILLE_MAX_DOCUMENT = 10 * 1024 * 1024;

/** Plafond applicable à un type donné. */
export const tailleMaxPour = (mimeType: string): number =>
  estImage(mimeType) ? TAILLE_MAX : TAILLE_MAX_DOCUMENT;

/** Extension affichée sur la vignette d'un document. */
export const extensionLisible = (filename: string): string => {
  const extension = /\.([a-z0-9]{1,6})$/i.exec(filename)?.[1];
  return extension ? extension.toUpperCase() : "DOC";
};

/** « 482 ko », « 1,8 Mo » — poids lisible dans la bibliothèque. */
export function poidsLisible(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}
