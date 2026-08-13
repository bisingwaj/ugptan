/**
 * Dimensions d'une image, lues dans son en-tête.
 *
 * Sans dépendance et sans décodage : on ne lit que les quelques octets qui
 * portent la taille. L'intérêt n'est pas cosmétique — `next/image` a besoin de
 * `width` et `height` pour réserver la place et éviter que la page ne sursaute
 * au chargement, et la bibliothèque de la console affiche la définition d'un
 * visuel avant qu'on le choisisse comme couverture.
 *
 * Renvoie `null` quand le format n'est pas reconnu (AVIF, par exemple) : c'est
 * un renseignement, pas une validation.
 */

export type Dimensions = { width: number; height: number };

const lireU16BE = (b: Uint8Array, i: number) => (b[i] << 8) | b[i + 1];
const lireU32BE = (b: Uint8Array, i: number) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
const lireU16LE = (b: Uint8Array, i: number) => b[i] | (b[i + 1] << 8);
const lireU32LE = (b: Uint8Array, i: number) => (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0;

const commencePar = (b: Uint8Array, signature: number[], offset = 0): boolean =>
  signature.every((octet, i) => b[offset + i] === octet);

/** PNG : la taille vit dans le chunk IHDR, toujours en tête du fichier. */
function taillePng(b: Uint8Array): Dimensions | null {
  if (b.length < 24 || !commencePar(b, [0x89, 0x50, 0x4e, 0x47])) return null;
  return { width: lireU32BE(b, 16), height: lireU32BE(b, 20) };
}

/** GIF : l'écran logique, immédiatement après la signature. */
function tailleGif(b: Uint8Array): Dimensions | null {
  if (b.length < 10 || !commencePar(b, [0x47, 0x49, 0x46])) return null;
  return { width: lireU16LE(b, 6), height: lireU16LE(b, 8) };
}

/**
 * JPEG : il faut parcourir les segments jusqu'au marqueur SOF, qui seul porte
 * la taille. Les marqueurs SOF4 (0xC4), SOF8 (0xC8) et SOF12 (0xCC) sont exclus :
 * ce sont des tables de Huffman et des extensions, pas des en-têtes de trame.
 */
function tailleJpeg(b: Uint8Array): Dimensions | null {
  if (b.length < 4 || !commencePar(b, [0xff, 0xd8])) return null;

  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i += 1; continue; }

    const marqueur = b[i + 1];
    if (marqueur === 0xd8 || marqueur === 0x01 || (marqueur >= 0xd0 && marqueur <= 0xd7)) { i += 2; continue; }
    if (marqueur === 0xd9 || marqueur === 0xda) return null; // fin ou données d'image

    const longueur = lireU16BE(b, i + 2);
    if (longueur < 2) return null;

    const estSOF = marqueur >= 0xc0 && marqueur <= 0xcf
      && marqueur !== 0xc4 && marqueur !== 0xc8 && marqueur !== 0xcc;

    if (estSOF) return { height: lireU16BE(b, i + 5), width: lireU16BE(b, i + 7) };

    i += 2 + longueur;
  }
  return null;
}

/** WebP : trois variantes de conteneur, chacune avec son propre encodage. */
function tailleWebp(b: Uint8Array): Dimensions | null {
  if (b.length < 30 || !commencePar(b, [0x52, 0x49, 0x46, 0x46]) || !commencePar(b, [0x57, 0x45, 0x42, 0x50], 8)) {
    return null;
  }

  const type = String.fromCharCode(b[12], b[13], b[14], b[15]);

  if (type === "VP8X") {
    // Taille de canevas sur 24 bits, moins un.
    const width = 1 + (b[24] | (b[25] << 8) | (b[26] << 16));
    const height = 1 + (b[27] | (b[28] << 8) | (b[29] << 16));
    return { width, height };
  }

  if (type === "VP8 ") {
    // 14 bits utiles, les deux bits de poids fort portant l'échelle.
    return { width: lireU16LE(b, 26) & 0x3fff, height: lireU16LE(b, 28) & 0x3fff };
  }

  if (type === "VP8L") {
    const bits = lireU32LE(b, 21);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
  }

  return null;
}

/** Dimensions d'une image, ou `null` si le format échappe à la lecture. */
export function dimensionsImage(bytes: Uint8Array): Dimensions | null {
  const taille = taillePng(bytes) ?? tailleJpeg(bytes) ?? tailleGif(bytes) ?? tailleWebp(bytes);
  if (!taille) return null;
  // Un en-tête corrompu produit vite des valeurs absurdes : mieux vaut ne rien
  // enregistrer qu'une définition fantaisiste.
  if (taille.width <= 0 || taille.height <= 0 || taille.width > 30000 || taille.height > 30000) return null;
  return taille;
}
