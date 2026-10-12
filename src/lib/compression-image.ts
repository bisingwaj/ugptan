/**
 * Compression d'une image DANS LE NAVIGATEUR, avant son envoi.
 *
 * Pourquoi côté client, alors que Cloudinary convertit déjà au dépôt (cf.
 * `IMAGE_OPTIMISEE` dans lib/cloudinary.ts) :
 *
 *   · le poids qui coûte, c'est celui de l'ENVOI. Une photo d'appareil fait
 *     couramment 6 à 10 Mo ; réduite et convertie ici, elle en pèse quelques
 *     centaines de ko, ce qui change tout sur une liaison mobile ;
 *   · le plafond de 5 Mo par image refusait ces photos avant même qu'elles
 *     soient converties. Compressée d'abord, la même photo passe.
 *
 * La conversion serveur reste la garantie : une image arrivée autrement (un
 * navigateur qui ne sait pas produire de WebP, un envoi sans JavaScript) est
 * convertie quand même.
 *
 * ⚠️ Module NAVIGATEUR : canvas et `createImageBitmap` n'existent pas côté
 * serveur.
 */

/** Côté le plus long, en pixels : au-delà, aucun écran du site n'en profite. */
const COTE_MAX = 2560;
/** Qualité WebP : en deçà, les aplats et les visages se dégradent à l'œil. */
const QUALITE = 0.82;

/** Formats convertis. Le GIF (animé) et le SVG (vectoriel) passent tels quels. */
const CONVERTIBLES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Renvoie une version WebP réduite de l'image, ou l'original quand la
 * conversion n'apporte rien (format écarté, navigateur incapable, résultat plus
 * lourd que l'original). Ne lève jamais : au pire, l'original part, et le
 * serveur fait le travail.
 */
export async function compresserImage(fichier: File): Promise<File> {
  if (!CONVERTIBLES.includes(fichier.type) || typeof createImageBitmap !== "function") return fichier;

  try {
    // `imageOrientation: "from-image"` applique la rotation EXIF : sans elle,
    // une photo prise en portrait au téléphone ressortirait couchée.
    const image = await createImageBitmap(fichier, { imageOrientation: "from-image" });
    const echelle = Math.min(1, COTE_MAX / Math.max(image.width, image.height));
    const largeur = Math.max(1, Math.round(image.width * echelle));
    const hauteur = Math.max(1, Math.round(image.height * echelle));

    const canvas = document.createElement("canvas");
    canvas.width = largeur;
    canvas.height = hauteur;
    const contexte = canvas.getContext("2d");
    if (!contexte) return fichier;
    contexte.drawImage(image, 0, 0, largeur, hauteur);
    image.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITE));
    // Un navigateur sans encodeur WebP renvoie du PNG : on garde alors l'original.
    if (!blob || blob.type !== "image/webp") return fichier;
    // Un WebP déjà petit peut ressortir plus lourd : rien à gagner.
    if (blob.size >= fichier.size && echelle === 1) return fichier;

    const nom = `${fichier.name.replace(/\.[^.]+$/, "") || "image"}.webp`;
    return new File([blob], nom, { type: "image/webp", lastModified: fichier.lastModified });
  } catch {
    return fichier;
  }
}
