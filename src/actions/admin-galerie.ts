"use server";

/**
 * Écritures du module « Vidéos & galeries ».
 *
 * ⚠️ INVARIANT : chaque action commence par `assertPermission("videos")`. Le
 * proxy laisse passer les POST (rediriger un POST de server action casserait le
 * protocole Flight), la barrière d'autorisation est donc ici, et nulle part
 * ailleurs.
 *
 * ─── Les fichiers et la fiche s'enregistrent SÉPARÉMENT ──────────────────────
 *
 *   · `ajouterGalerieAction`      → création : le visuel (ou la source vidéo) ET
 *                                   la fiche, en une fois, parce qu'une entrée
 *                                   sans média n'a pas d'existence ;
 *   · `enregistrerGalerieAction`  → la fiche seule : titres, légendes, textes
 *                                   alternatifs, lieu, dates, rubrique, ordre ;
 *   · `remplacerVisuelAction`     → le visuel seul, métadonnées conservées ;
 *   · `enregistrerVideoAction`    → le fichier vidéo seul.
 *
 * Les confondre ferait repartir un téléversement de plusieurs mégaoctets à
 * chaque correction de légende, et — plus grave — un formulaire unique
 * renverrait un champ « fichier » vide sur une simple modification de titre, ce
 * qui obligerait le serveur à deviner s'il faut effacer le visuel ou le garder.
 *
 * ─── Ordre des opérations, et pourquoi il n'est pas symétrique ───────────────
 *
 * À la CRÉATION, le dépôt distant précède l'écriture en base : un échec chez
 * l'hébergeur laisse la table intacte, là qu'une ligne écrite d'abord aurait
 * survécu en pointant vers un fichier inexistant.
 *
 * À la SUPPRESSION, l'inverse : la base d'abord, le retrait des fichiers
 * ensuite. Un échec réseau laisse alors des fichiers orphelins que plus rien ne
 * désigne — gênant, sans effet visible ; le contraire effacerait un fichier
 * encore montré par une entrée en ligne.
 *
 * Au REMPLACEMENT, les deux règles se combinent : dépôt du nouveau, bascule de
 * la ligne, retrait de l'ancien. À aucun instant la fiche ne désigne un fichier
 * absent.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { adminPath } from "@/lib/admin";
import { assertPermission, type AdminUser } from "@/lib/auth/guard";
import { cloudinaryActif, deposerFichier, supprimerFichier } from "@/lib/cloudinary";
import { fromDateInput } from "@/lib/format";
import { dimensionsImage } from "@/lib/image-size";
import { contenuCorrespond, poidsLisible } from "@/lib/medias";
import { slugify } from "@/lib/actus/slug";
import { codesComposantes } from "@/lib/projet/query";
import { revaliderGalerie } from "@/lib/galerie/cache";
import {
  estMimeImageGalerie, estMimeVideoGalerie, tailleMaxPour, typeMediaDuFichier,
} from "@/lib/galerie/fichier";
import { isGalStatut, isGalType } from "@/lib/galerie/statut";

/** État partagé par tous les formulaires du module. */
export type GalFormState = { error: string | null; ok: string | null };

const GALERIE_PATH = adminPath("/gallery");
const RUBRIQUES_PATH = adminPath("/gallery/categories");
const ALBUMS_PATH = adminPath("/gallery/albums");

/**
 * Sous-dossiers propres au module chez l'hébergeur.
 *
 * Séparés de ceux des médias et des documents : les visuels publiés d'une
 * galerie et les illustrations d'articles ne se rangent pas ensemble, ce qui
 * rend un ménage manuel possible sans inspecter chaque fichier.
 */
const DOSSIER_VISUEL = "galerie/visuels";
const DOSSIER_VIDEO = "galerie/videos";


/** Code Prisma d'une violation de contrainte d'unicité. */
const UNIQUE_VIOLATION = "P2002";

const estDoublon = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: string }).code === UNIQUE_VIOLATION;

/* -------------------------------------------------------------------------- */
/* Lecture du formulaire                                                       */
/* -------------------------------------------------------------------------- */

const texte = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();
const optionnel = (value: string): string | null => (value.length ? value : null);
const coche = (formData: FormData, key: string): boolean =>
  formData.get(key) === "on" || formData.get(key) === "1";

/** Entier d'ordre d'affichage. Une saisie illisible vaut 0 plutôt qu'un refus. */
function lireEntier(value: string): number {
  const nombre = Number.parseInt(value, 10);
  return Number.isFinite(nombre) ? nombre : 0;
}

/** Couleur d'accent : hexadécimal à 6 chiffres, ou rien. */
function lireCouleur(value: string): string | null {
  const couleur = value.trim().toLowerCase();
  if (!couleur) return null;
  return /^#[0-9a-f]{6}$/.test(couleur) ? couleur : null;
}

/** Codes de composante cochés, réduits à ceux qui existent réellement. */
async function lireComposantes(formData: FormData): Promise<string[]> {
  const admis = await codesComposantes();
  return formData.getAll("comps").map(String).filter((code) => admis.has(code));
}

/**
 * Champs de la fiche, hors fichiers et hors statut.
 *
 * Le titre anglais et la description anglaise peuvent rester vides : la lecture
 * publique retombe alors sur le français (cf. lib/galerie/query.ts). Les forcer
 * ici imposerait une traduction avant toute mise en ligne, ce qui retarderait la
 * parution d'une photographie pour un motif de forme.
 */
async function lireFiche(formData: FormData) {
  return {
    titreFr: texte(formData, "titreFr"),
    titreEn: optionnel(texte(formData, "titreEn")),
    descriptionFr: optionnel(texte(formData, "descriptionFr")),
    descriptionEn: optionnel(texte(formData, "descriptionEn")),
    altFr: optionnel(texte(formData, "altFr")),
    altEn: optionnel(texte(formData, "altEn")),
    lieu: optionnel(texte(formData, "lieu")),
    priseAt: fromDateInput(texte(formData, "priseAt")),
    featured: coche(formData, "featured"),
    position: lireEntier(texte(formData, "position")),
    categoryId: optionnel(texte(formData, "categoryId")),
    albumId: optionnel(texte(formData, "albumId")),
    comps: await lireComposantes(formData),
  };
}

/* -------------------------------------------------------------------------- */
/* Dépôt du visuel                                                             */
/* -------------------------------------------------------------------------- */

/** Ce que le dépôt d'un visuel renvoie, prêt à écrire en base. */
type Visuel = {
  imageUrl: string;
  imagePublicId: string;
  imageMime: string;
  imageWidth: number | null;
  imageHeight: number | null;
  imageSize: number;
};

/**
 * Contrôle et dépose l'image soumise.
 *
 * `obligatoire: false` renvoie `null` quand aucun fichier n'a été choisi — c'est
 * le cas d'une vidéo, dont la vignette est facultative. Les refus sont rendus en
 * clair — format, poids, stockage non configuré — plutôt que remontés en
 * exception : ce sont des situations ordinaires, que la personne qui dépose peut
 * corriger elle-même.
 */
async function deposerVisuel(
  formData: FormData,
  options: { obligatoire: boolean; champ?: string },
): Promise<{ visuel: Visuel | null } | { error: string }> {
  const fichier = formData.get(options.champ ?? "visuel");

  if (!(fichier instanceof File) || fichier.size === 0) {
    if (options.obligatoire) {
      return { error: "Aucune image reçue. Choisissez la photographie à téléverser." };
    }
    return { visuel: null };
  }

  if (!estMimeImageGalerie(fichier.type)) {
    return { error: "Format non accepté. Images : JPEG, PNG, WebP, AVIF, GIF." };
  }

  const plafond = tailleMaxPour(fichier.type);
  if (fichier.size > plafond) {
    return {
      error: `Image trop lourde (${poidsLisible(fichier.size)}). Limite : ${poidsLisible(plafond)}.`,
    };
  }

  if (!cloudinaryActif()) {
    return {
      error: "Stockage des fichiers non configuré : le dépôt est impossible tant que CLOUDINARY_URL n'est pas renseignée dans l'environnement.",
    };
  }

  const nom = fichier.name.slice(0, 180) || "visuel";
  const octets = new Uint8Array(await fichier.arrayBuffer());

  /* Le type annoncé par le client ne prouve rien ; les premiers octets, si.
     Cf. `contenuCorrespond` — même contrôle que la bibliothèque de médias. */
  if (!contenuCorrespond(octets, fichier.type)) {
    return { error: "Le contenu du fichier ne correspond pas à son format annoncé. Dépôt refusé." };
  }

  // Dimensions lues localement : Cloudinary les renvoie aussi, mais la lecture
  // d'en-tête couvre les cas où le service les omet, et ne coûte que quelques
  // octets. Elles donnent son ratio à la cellule de la grille publique.
  const taille = dimensionsImage(octets);

  try {
    const depot = await deposerFichier(octets, {
      filename: nom,
      mimeType: fichier.type,
      sousDossier: DOSSIER_VISUEL,
    });

    return {
      visuel: {
        imageUrl: depot.url,
        imagePublicId: depot.publicId,
        imageMime: fichier.type,
        imageWidth: depot.width ?? taille?.width ?? null,
        imageHeight: depot.height ?? taille?.height ?? null,
        imageSize: depot.size || fichier.size,
      },
    };
  } catch (erreur) {
    console.error("[galerie] dépôt Cloudinary impossible (visuel)", erreur);
    return { error: "Téléversement refusé par le service de stockage. Réessayez." };
  }
}

/* -------------------------------------------------------------------------- */
/* Source d'une vidéo                                                          */
/* -------------------------------------------------------------------------- */

/** Ce que le dépôt d'un film renvoie, prêt à écrire en base. */
type SourceVideoEcriture = {
  videoUrl: string;
  videoPublicId: string;
  videoDuree: number | null;
};

/**
 * Dépose le film soumis.
 *
 * ⚠️ Une SEULE voie : un fichier téléversé. L'identifiant YouTube et l'adresse
 * saisie à la main ont été retirés du module — ils demandaient une saisie par
 * vidéo, ce que le module refuse par principe (l'information vit sur l'album),
 * et n'ont jamais servi.
 *
 * Renvoie `null` quand aucun fichier n'a été choisi : l'appelant décide si
 * c'est un refus ou simplement « rien à changer ».
 */
async function deposerVideo(
  formData: FormData,
): Promise<{ source: SourceVideoEcriture } | { error: string } | null> {
  const fichier = formData.get("video");
  if (!(fichier instanceof File) || fichier.size === 0) return null;

  if (!estMimeVideoGalerie(fichier.type)) {
    return { error: "Format vidéo non accepté. MP4 ou WebM uniquement." };
  }

  const plafond = tailleMaxPour(fichier.type);
  if (fichier.size > plafond) {
    return {
      error: `Vidéo trop lourde (${poidsLisible(fichier.size)}). Limite : ${poidsLisible(plafond)}. Compressez le film avant de le déposer.`,
    };
  }

  if (!cloudinaryActif()) {
    return {
      error: "Stockage des fichiers non configuré : le dépôt est impossible tant que CLOUDINARY_URL n'est pas renseignée dans l'environnement.",
    };
  }

  const nom = fichier.name.slice(0, 180) || "video";
  const octets = new Uint8Array(await fichier.arrayBuffer());

  /* Le type annoncé par le client ne prouve rien ; les premiers octets, si.
     Cf. `contenuCorrespond` — même contrôle que la bibliothèque de médias. */
  if (!contenuCorrespond(octets, fichier.type)) {
    return { error: "Le contenu du fichier ne correspond pas à son format annoncé. Dépôt refusé." };
  }

  try {
    const depot = await deposerFichier(octets, {
      filename: nom,
      mimeType: fichier.type,
      sousDossier: DOSSIER_VIDEO,
    });

    return {
      source: { videoUrl: depot.url, videoPublicId: depot.publicId, videoDuree: depot.duree },
    };
  } catch (erreur) {
    console.error("[galerie] dépôt Cloudinary impossible (vidéo)", erreur);
    return { error: "Téléversement de la vidéo refusé par le service de stockage. Réessayez." };
  }
}

/* -------------------------------------------------------------------------- */
/* Création                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Ajoute une entrée : les fichiers chez l'hébergeur, la fiche en base.
 *
 * L'entrée naît MASQUÉE, quel que soit le formulaire : relire une légende et un
 * cadrage avant de les montrer fait partie de ce qu'on attend du module, et
 * publier d'un même geste que déposer le rendrait impossible. La mise en ligne
 * se fait depuis la fiche, une fois le rendu vérifié.
 */
export async function ajouterGalerieAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  const acteur: AdminUser = await assertPermission("videos");

  const typeBrut = texte(formData, "type");
  const type = isGalType(typeBrut) ? typeBrut : ("PHOTO" as const);

  const fiche = await lireFiche(formData);
  if (!fiche.titreFr) return { error: "Le titre français est obligatoire.", ok: null };

  // Une vidéo peut n'avoir pas de vignette ; une photographie sans image n'est
  // rien du tout.
  const depot = await deposerVisuel(formData, { obligatoire: type === "PHOTO" });
  if ("error" in depot) return { error: depot.error, ok: null };

  let source: SourceVideoEcriture | null = null;
  if (type === "VIDEO") {
    const lu = await deposerVideo(formData);
    if (lu && "error" in lu) {
      // Le visuel est peut-être déjà parti : le retirer évite d'abandonner un
      // orphelin chez l'hébergeur pour une saisie que l'on refuse.
      if (depot.visuel) await supprimerFichier(depot.visuel.imagePublicId, depot.visuel.imageMime);
      return { error: lu.error, ok: null };
    }
    if (!lu) {
      if (depot.visuel) await supprimerFichier(depot.visuel.imagePublicId, depot.visuel.imageMime);
      return { error: "Choisissez le fichier vidéo à téléverser.", ok: null };
    }
    source = lu.source;
  }

  let item;
  try {
    item = await db().galerieItem.create({
      data: {
        ...fiche,
        ...(depot.visuel ?? {}),
        ...(source ?? {}),
        type,
        status: "DRAFT",
        createdById: acteur.id,
      },
      select: { id: true },
    });
  } catch (erreur) {
    // Les fichiers sont déjà chez l'hébergeur : les retirer évite d'y laisser des
    // orphelins que plus rien en base ne désigne.
    if (depot.visuel) await supprimerFichier(depot.visuel.imagePublicId, depot.visuel.imageMime);
    if (source?.videoPublicId) await supprimerFichier(source.videoPublicId, "video/mp4");
    throw erreur;
  }

  revalidatePath(GALERIE_PATH);
  // redirect() lève NEXT_REDIRECT : appelé en dernier, hors de tout try/catch.
  redirect(`${GALERIE_PATH}/${item.id}?ajoute=1`);
}

/* -------------------------------------------------------------------------- */
/* Fiche                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Enregistre les métadonnées, fichiers inchangés.
 *
 * `publishedAt` est traité à part : le champ est proposé au rédacteur, mais s'il
 * le laisse vide sur une entrée déjà en ligne, la date déjà posée est CONSERVÉE.
 * L'effacer reviendrait à sortir le visuel de tout classement chronologique sans
 * que personne l'ait demandé.
 */
export async function enregistrerGalerieAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const id = texte(formData, "id");
  if (!id) return { error: "Entrée introuvable.", ok: null };

  const statutBrut = texte(formData, "status");
  if (!isGalStatut(statutBrut)) return { error: "Statut inconnu.", ok: null };
  const statut = statutBrut;

  const fiche = await lireFiche(formData);
  if (!fiche.titreFr) return { error: "Le titre français est obligatoire.", ok: null };

  const existant = await db().galerieItem.findUnique({
    where: { id },
    select: { publishedAt: true, type: true, imageUrl: true, videoUrl: true },
  });
  if (!existant) return { error: "Entrée introuvable.", ok: null };

  // Rendre visible une entrée que la galerie publique écarterait de toute façon
  // (cf. la clause `montrable` de lib/galerie/query.ts) laisserait la console
  // annoncer une mise en ligne qui n'a pas lieu.
  if (statut === "PUBLISHED") {
    const manque = manqueDeMedia(existant);
    if (manque) return { error: manque, ok: null };
  }

  const saisie = fromDateInput(texte(formData, "publishedAt"));
  const publishedAt = saisie ?? existant.publishedAt ?? (statut === "PUBLISHED" ? new Date() : null);

  await db().galerieItem.update({ where: { id }, data: { ...fiche, status: statut, publishedAt } });

  revalidatePath(`${GALERIE_PATH}/${id}`);
  revalidatePath(GALERIE_PATH);
  revaliderGalerie();
  return { error: null, ok: "Entrée enregistrée." };
}

/** Ce qui manque à une entrée pour paraître, en clair. `null` si rien ne manque. */
function manqueDeMedia(item: {
  type: string;
  imageUrl: string | null;
  videoUrl: string | null;
}): string | null {
  if (item.type === "PHOTO" && !item.imageUrl) {
    return "Aucune image attachée : téléversez-la avant de rendre l'entrée visible.";
  }
  if (item.type === "VIDEO" && !item.videoUrl) {
    return "Aucun fichier vidéo attaché : téléversez-le avant de rendre la vidéo visible.";
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Fichiers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Remplace le visuel en conservant toutes les métadonnées.
 *
 * C'est le geste du meilleur tirage : même scène, même légende, même place dans
 * la galerie, nouvelle image. L'ancien fichier est retiré du compte APRÈS la
 * bascule de la ligne — jamais avant, sans quoi la galerie publique désignerait
 * pendant quelques instants un fichier déjà effacé.
 */
export async function remplacerVisuelAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const id = texte(formData, "id");
  if (!id) return { error: "Entrée introuvable.", ok: null };

  const ancien = await db().galerieItem.findUnique({
    where: { id },
    select: { imagePublicId: true, imageMime: true },
  });
  if (!ancien) return { error: "Entrée introuvable.", ok: null };

  const depot = await deposerVisuel(formData, { obligatoire: true });
  if ("error" in depot) return { error: depot.error, ok: null };
  if (!depot.visuel) return { error: "Aucune image reçue.", ok: null };

  const nouveau = depot.visuel;

  try {
    await db().galerieItem.update({ where: { id }, data: nouveau });
  } catch (erreur) {
    await supprimerFichier(nouveau.imagePublicId, nouveau.imageMime);
    throw erreur;
  }

  if (ancien.imagePublicId) {
    await supprimerFichier(ancien.imagePublicId, ancien.imageMime ?? "image/jpeg");
  }

  revalidatePath(`${GALERIE_PATH}/${id}`);
  revalidatePath(GALERIE_PATH);
  revaliderGalerie();
  return { error: null, ok: "Visuel remplacé." };
}

/**
 * Enregistre ou remplace la source d'un film.
 *
 * L'ancien fichier est retiré du compte APRÈS la bascule de la ligne — jamais
 * avant, sans quoi la galerie publique désignerait pendant quelques instants un
 * film déjà effacé.
 */
export async function enregistrerVideoAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const id = texte(formData, "id");
  if (!id) return { error: "Entrée introuvable.", ok: null };

  const ancien = await db().galerieItem.findUnique({
    where: { id },
    select: { type: true, videoPublicId: true },
  });
  if (!ancien) return { error: "Entrée introuvable.", ok: null };
  if (ancien.type !== "VIDEO") {
    return { error: "Cette entrée est une photographie : elle n'a pas de source vidéo.", ok: null };
  }

  const lu = await deposerVideo(formData);
  if (lu && "error" in lu) return { error: lu.error, ok: null };
  if (!lu) return { error: "Choisissez le fichier vidéo à téléverser.", ok: null };

  const source = lu.source;

  try {
    await db().galerieItem.update({ where: { id }, data: source });
  } catch (erreur) {
    await supprimerFichier(source.videoPublicId, "video/mp4");
    throw erreur;
  }

  if (ancien.videoPublicId && ancien.videoPublicId !== source.videoPublicId) {
    await supprimerFichier(ancien.videoPublicId, "video/mp4");
  }

  revalidatePath(`${GALERIE_PATH}/${id}`);
  revalidatePath(GALERIE_PATH);
  revaliderGalerie();
  return { error: null, ok: "Source de la vidéo enregistrée." };
}

/* -------------------------------------------------------------------------- */
/* Actions rapides                                                             */
/* -------------------------------------------------------------------------- */

/** Bascule visible / masqué depuis la liste comme depuis la fiche. */
export async function basculerVisibiliteAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const id = texte(formData, "id");
  if (!id) return { error: "Entrée introuvable.", ok: null };

  const item = await db().galerieItem.findUnique({
    where: { id },
    select: {
      status: true, titreFr: true, publishedAt: true,
      type: true, imageUrl: true, videoUrl: true,
    },
  });
  if (!item) return { error: "Entrée introuvable.", ok: null };

  const enLigne = item.status === "PUBLISHED";

  if (!enLigne) {
    const manque = manqueDeMedia(item);
    if (manque) return { error: manque, ok: null };
  }

  await db().galerieItem.update({
    where: { id },
    data: {
      status: enLigne ? "DRAFT" : "PUBLISHED",
      ...(enLigne || item.publishedAt ? {} : { publishedAt: new Date() }),
    },
  });

  // ⚠️ La FICHE de la console est revalidée, pas seulement le site public : le
  // sélecteur « Statut » du formulaire vit sur la même page que ce bouton, et
  // sans cette ligne il continuerait de renvoyer l'ancienne valeur au premier
  // enregistrement.
  revalidatePath(`${GALERIE_PATH}/${id}`);
  revalidatePath(GALERIE_PATH);
  revaliderGalerie();
  return {
    error: null,
    ok: enLigne ? `« ${item.titreFr} » masqué.` : `« ${item.titreFr} » publié dans la galerie.`,
  };
}

/**
 * Suppression définitive, fichiers compris.
 *
 * C'est le seul geste irréversible du module, et la raison pour laquelle le
 * statut « Masqué » existe à côté : une image qu'on ne veut plus montrer se
 * masque, elle ne s'efface pas. Ce qui est effacé l'est partout — ligne en base
 * ET fichiers chez l'hébergeur.
 */
export async function supprimerGalerieAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const id = texte(formData, "id");
  if (!id) return { error: "Entrée introuvable.", ok: null };

  const item = await db().galerieItem.findUnique({
    where: { id },
    select: { imagePublicId: true, imageMime: true, videoPublicId: true },
  });
  if (!item) return { error: "Entrée introuvable.", ok: null };

  await db().galerieItem.delete({ where: { id } });

  if (item.imagePublicId) {
    await supprimerFichier(item.imagePublicId, item.imageMime ?? "image/jpeg");
  }
  if (item.videoPublicId) await supprimerFichier(item.videoPublicId, "video/mp4");

  revaliderGalerie();
  redirect(`${GALERIE_PATH}?supprime=1`);
}

/* -------------------------------------------------------------------------- */
/* Versement en série dans un album                                            */
/* -------------------------------------------------------------------------- */

/** Résultat d'un versement unitaire, consommé par la boucle du navigateur. */
export type VersementResultat =
  | { ok: true; id: string; titre: string; type: "PHOTO" | "VIDEO"; apercu: string | null }
  | { ok: false; error: string; nom: string };

/**
 * Titre de départ, déduit du nom du fichier.
 *
 * « atelier-goma_04.JPG » devient « atelier goma 04 ». Ce n'est pas un beau
 * titre, et ce n'est pas le but : c'est un REPÈRE, qui permet de retrouver la
 * photographie dans la liste pour la renommer. L'alternative — un titre vide —
 * est refusée par le modèle, et un « Sans titre (12) » n'apprendrait rien.
 */
function titreDepuisFichier(nom: string): string {
  const sansExtension = nom.replace(/\.[^.]+$/, "");
  const propre = sansExtension.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return propre.slice(0, 200) || "Sans titre";
}

/**
 * Vignette d'attente d'une vidéo déposée chez Cloudinary.
 *
 * Le service rend n'importe quelle image d'une vidéo en changeant simplement son
 * extension : `…/video/upload/v1/film.mp4` → `…/film.jpg` renvoie la première
 * frame. On enregistre donc cette adresse comme visuel, ce qui donne à chaque
 * vidéo versée une vraie vignette SANS second téléversement ni saisie.
 *
 * ⚠️ C'est une DÉRIVÉE, pas un fichier à nous : `imagePublicId` reste nul, de
 * sorte que la suppression de l'entrée ne tente pas de l'effacer séparément —
 * elle disparaît avec la vidéo dont elle est tirée.
 */
function vignetteDeVideo(urlVideo: string): string | null {
  if (!/\/video\/upload\//.test(urlVideo)) return null;
  return urlVideo.replace(/\.[a-z0-9]+$/i, ".jpg");
}

/**
 * Verse UN média — photographie OU vidéo — dans un album.
 *
 * ⚠️ Un fichier par appel, et c'est délibéré. Le corps d'une server action est
 * plafonné à 14 Mo (`bodySizeLimit`, cf. next.config.mjs) : un formulaire
 * multiple qui enverrait quarante fichiers d'un coup serait refusé par le
 * TRANSPORT, bien avant d'atteindre nos contrôles, sur une erreur illisible.
 * C'est donc le NAVIGATEUR qui boucle (cf. GalerieVersement), un appel par
 * fichier. Trois conséquences, toutes voulues :
 *   · le plafond n'est jamais atteint ;
 *   · un fichier lourd ou lent ne bloque pas les autres — ils avancent en
 *     parallèle sur les autres ouvriers de la file ;
 *   · l'échec est LOCAL : il nomme son fichier et laisse le reste passer.
 *
 * ─── Aucune saisie n'est demandée, et c'est la règle du module ───────────────
 *
 * L'entrée créée hérite de TOUT son contexte de l'album — rubrique, date, lieu,
 * composantes — et prend pour titre le nom de son fichier. Elle naît VISIBLE :
 * c'est le statut de l'ALBUM qui décide de ce qui paraît (cf. `albumOuvert` dans
 * lib/galerie/query.ts), pas celui de chacun de ses médias. Verser quarante
 * photographies ne doit demander aucun formulaire, et aucun second geste.
 */
export async function verserDansAlbumAction(formData: FormData): Promise<VersementResultat> {
  const acteur: AdminUser = await assertPermission("videos");

  const fichier = formData.get("media");
  const nom = fichier instanceof File ? fichier.name : "fichier";

  const albumId = texte(formData, "albumId");
  if (!albumId) return { ok: false, error: "Album introuvable.", nom };

  const album = await db().galerieAlbum.findUnique({
    where: { id: albumId },
    select: { id: true, categoryId: true, dateAt: true, lieu: true, comps: true },
  });
  if (!album) return { ok: false, error: "Album introuvable.", nom };

  if (!(fichier instanceof File) || fichier.size === 0) {
    return { ok: false, error: "fichier vide ou illisible", nom };
  }

  const type = typeMediaDuFichier(fichier.type);
  if (!type) {
    return { ok: false, error: "format non accepté (JPEG, PNG, WebP, AVIF, GIF, MP4, WebM)", nom };
  }

  const plafond = tailleMaxPour(fichier.type);
  if (fichier.size > plafond) {
    return {
      ok: false,
      nom,
      error: type === "VIDEO"
        ? `trop lourde (${poidsLisible(fichier.size)} — limite ${poidsLisible(plafond)}). Déposez ce film sur le compte Cloudinary du Projet, puis collez son adresse.`
        : `trop lourde (${poidsLisible(fichier.size)} — limite ${poidsLisible(plafond)})`,
    };
  }

  if (!cloudinaryActif()) {
    return { ok: false, error: "stockage non configuré (CLOUDINARY_URL absente)", nom };
  }

  const octets = new Uint8Array(await fichier.arrayBuffer());

  /* Le type annoncé par le client ne prouve rien ; les premiers octets, si.
     Cf. `contenuCorrespond` — même contrôle que la bibliothèque de médias. */
  if (!contenuCorrespond(octets, fichier.type)) {
    return { ok: false, nom, error: "contenu du fichier non conforme au format annoncé" };
  }

  // Dimensions lues localement pour une image : elles donnent son ratio à la
  // cellule de la mosaïque publique, ce qui évite que la page se réorganise
  // sous les yeux du visiteur au fil des chargements.
  const taille = type === "PHOTO" ? dimensionsImage(octets) : null;

  let depot;
  try {
    depot = await deposerFichier(octets, {
      filename: nom.slice(0, 180) || "media",
      mimeType: fichier.type,
      sousDossier: type === "VIDEO" ? DOSSIER_VIDEO : DOSSIER_VISUEL,
    });
  } catch (erreur) {
    console.error("[galerie] dépôt Cloudinary impossible", erreur);
    return { ok: false, error: "refusé par le service de stockage", nom };
  }

  const titre = titreDepuisFichier(nom);
  const vignette = type === "VIDEO" ? vignetteDeVideo(depot.url) : depot.url;

  /** Contexte hérité de l'album — jamais ressaisi média par média. */
  const heritage = {
    albumId: album.id,
    categoryId: album.categoryId,
    priseAt: album.dateAt,
    lieu: album.lieu,
    comps: album.comps,
  };

  try {
    const item = await db().galerieItem.create({
      data: {
        type,
        // Visible d'emblée : c'est l'album qui commande.
        status: "PUBLISHED",
        publishedAt: new Date(),
        titreFr: titre,
        ...heritage,
        imageUrl: vignette,
        // Nul pour une vidéo : la vignette est une dérivée du film, pas un
        // fichier distinct à effacer (cf. `vignetteDeVideo`).
        imagePublicId: type === "PHOTO" ? depot.publicId : null,
        imageMime: type === "PHOTO" ? fichier.type : null,
        imageWidth: type === "PHOTO" ? depot.width ?? taille?.width ?? null : null,
        imageHeight: type === "PHOTO" ? depot.height ?? taille?.height ?? null : null,
        imageSize: type === "PHOTO" ? depot.size || fichier.size : 0,
        ...(type === "VIDEO"
          ? { videoUrl: depot.url, videoPublicId: depot.publicId, videoDuree: depot.duree }
          : {}),
        createdById: acteur.id,
      },
      select: { id: true },
    });

    revalidatePath(`${ALBUMS_PATH}/${albumId}`);
    revaliderGalerie();
    return { ok: true, id: item.id, titre, type, apercu: vignette };
  } catch (erreur) {
    // Le fichier est déjà chez l'hébergeur : le retirer évite d'y laisser un
    // orphelin que plus rien en base ne désigne.
    await supprimerFichier(depot.publicId, fichier.type);
    console.error("[galerie] versement impossible", erreur);
    return { ok: false, error: "enregistrement refusé par la base", nom };
  }
}

/**
 * Montre ou masque UN média d'un album, sans passer par sa fiche.
 *
 * Le seul geste par média que le module conserve, et il tient en un clic : une
 * photographie ratée se retire de l'accrochage sans qu'on ait à ouvrir quoi que
 * ce soit. Tout le reste — titre, légende, date — se règle au niveau de l'album.
 */
export async function basculerMediaAlbumAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const itemId = texte(formData, "itemId");
  if (!itemId) return { error: "Contenu introuvable.", ok: null };

  const item = await db().galerieItem.findUnique({
    where: { id: itemId },
    select: { status: true, albumId: true, publishedAt: true },
  });
  if (!item) return { error: "Contenu introuvable.", ok: null };

  const visible = item.status === "PUBLISHED";

  await db().galerieItem.update({
    where: { id: itemId },
    data: {
      status: visible ? "DRAFT" : "PUBLISHED",
      ...(visible || item.publishedAt ? {} : { publishedAt: new Date() }),
    },
  });

  if (item.albumId) revalidatePath(`${ALBUMS_PATH}/${item.albumId}`);
  revaliderGalerie();
  return { error: null, ok: null };
}

/* -------------------------------------------------------------------------- */
/* Albums                                                                      */
/* -------------------------------------------------------------------------- */

/** Champs de la fiche d'un album, hors statut et hors couverture. */
async function lireAlbum(formData: FormData) {
  return {
    titreFr: texte(formData, "titreFr"),
    titreEn: optionnel(texte(formData, "titreEn")),
    descriptionFr: optionnel(texte(formData, "descriptionFr")),
    descriptionEn: optionnel(texte(formData, "descriptionEn")),
    lieu: optionnel(texte(formData, "lieu")),
    dateAt: fromDateInput(texte(formData, "dateAt")),
    dateFin: fromDateInput(texte(formData, "dateFin")),
    featured: coche(formData, "featured"),
    position: lireEntier(texte(formData, "position")),
    categoryId: optionnel(texte(formData, "categoryId")),
    comps: await lireComposantes(formData),
  };
}

/**
 * Crée un album, vide.
 *
 * Vide, et c'est l'ordre naturel du geste : on ouvre le reportage d'un
 * événement AVANT d'en verser les photographies, comme on nomme un dossier
 * avant de le remplir. L'écran de la fiche porte ensuite le téléversement.
 *
 * L'album naît MASQUÉ, comme les contenus : un album publié d'emblée
 * apparaîtrait sur le site à l'instant où il est encore vide, donc écarté par la
 * lecture publique (cf. `albumServi`), puis surgirait au premier dépôt sans que
 * personne ait décidé de le montrer.
 */
export async function creerAlbumAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  const acteur: AdminUser = await assertPermission("videos");

  const fiche = await lireAlbum(formData);
  if (!fiche.titreFr) return { error: "Le titre français est obligatoire.", ok: null };

  const slug = slugify(texte(formData, "slug") || fiche.titreFr);
  if (!slug) return { error: "Le titre ne produit aucun identifiant d'URL exploitable.", ok: null };

  let album;
  try {
    album = await db().galerieAlbum.create({
      data: { ...fiche, slug, status: "DRAFT", createdById: acteur.id },
      select: { id: true },
    });
  } catch (erreur) {
    if (estDoublon(erreur)) {
      return { error: "Cet identifiant d'URL est déjà pris par un autre album.", ok: null };
    }
    throw erreur;
  }

  revalidatePath(ALBUMS_PATH);
  // redirect() lève NEXT_REDIRECT : appelé en dernier, hors de tout try/catch.
  redirect(`${ALBUMS_PATH}/${album.id}?cree=1`);
}

/** Enregistre la fiche d'un album, contenus inchangés. */
export async function enregistrerAlbumAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const id = texte(formData, "id");
  if (!id) return { error: "Album introuvable.", ok: null };

  const statutBrut = texte(formData, "status");
  if (!isGalStatut(statutBrut)) return { error: "Statut inconnu.", ok: null };
  const statut = statutBrut;

  const fiche = await lireAlbum(formData);
  if (!fiche.titreFr) return { error: "Le titre français est obligatoire.", ok: null };

  const slug = slugify(texte(formData, "slug") || fiche.titreFr);
  if (!slug) return { error: "Le titre ne produit aucun identifiant d'URL exploitable.", ok: null };

  const existant = await db().galerieAlbum.findUnique({
    where: { id },
    select: { publishedAt: true, _count: { select: { items: { where: { status: "PUBLISHED" } } } } },
  });
  if (!existant) return { error: "Album introuvable.", ok: null };

  /* Publier un album que la galerie écarterait de toute façon (cf. `albumServi`
     dans lib/galerie/query.ts) laisserait la console annoncer une mise en ligne
     qui n'a pas lieu — et l'adresse de l'album répondrait 404. */
  if (statut === "PUBLISHED" && existant._count.items === 0) {
    return {
      error: "Cet album est vide : versez-y au moins un média avant de le publier. Une page d'album sans contenu n'aurait rien à montrer.",
      ok: null,
    };
  }

  const saisie = fromDateInput(texte(formData, "publishedAt"));
  const publishedAt = saisie ?? existant.publishedAt ?? (statut === "PUBLISHED" ? new Date() : null);

  try {
    await db().galerieAlbum.update({
      where: { id },
      data: { ...fiche, slug, status: statut, publishedAt },
    });
  } catch (erreur) {
    if (estDoublon(erreur)) {
      return { error: "Cet identifiant d'URL est déjà pris par un autre album.", ok: null };
    }
    throw erreur;
  }

  revalidatePath(`${ALBUMS_PATH}/${id}`);
  revalidatePath(ALBUMS_PATH);
  revaliderGalerie();
  return { error: null, ok: "Album enregistré." };
}

/** Bascule visible / masqué depuis la liste comme depuis la fiche. */
export async function basculerVisibiliteAlbumAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const id = texte(formData, "id");
  if (!id) return { error: "Album introuvable.", ok: null };

  const album = await db().galerieAlbum.findUnique({
    where: { id },
    select: {
      status: true, titreFr: true, publishedAt: true,
      _count: { select: { items: { where: { status: "PUBLISHED" } } } },
    },
  });
  if (!album) return { error: "Album introuvable.", ok: null };

  const enLigne = album.status === "PUBLISHED";

  if (!enLigne && album._count.items === 0) {
    return {
      error: "Cet album est vide : versez-y au moins un média avant de le publier.",
      ok: null,
    };
  }

  await db().galerieAlbum.update({
    where: { id },
    data: {
      status: enLigne ? "DRAFT" : "PUBLISHED",
      ...(enLigne || album.publishedAt ? {} : { publishedAt: new Date() }),
    },
  });

  revalidatePath(`${ALBUMS_PATH}/${id}`);
  revalidatePath(ALBUMS_PATH);
  revaliderGalerie();
  return {
    error: null,
    ok: enLigne ? `« ${album.titreFr} » masqué.` : `« ${album.titreFr} » publié.`,
  };
}

/**
 * Supprime un album SANS supprimer ses contenus.
 *
 * Les entrées sont libérées (`onDelete: SetNull` au schéma) et restent dans la
 * galerie, sans album. C'est le choix prudent : effacer par mégarde le reportage
 * d'un événement ne doit pas emporter quarante photographies dont l'Unité ne
 * détient pas forcément les originaux. Le nombre d'entrées libérées est annoncé
 * plutôt que laissé à découvrir.
 */
export async function supprimerAlbumAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const id = texte(formData, "id");
  if (!id) return { error: "Album introuvable.", ok: null };

  const album = await db().galerieAlbum.findUnique({
    where: { id },
    select: { titreFr: true, _count: { select: { items: true } } },
  });
  if (!album) return { error: "Album introuvable.", ok: null };

  await db().galerieAlbum.delete({ where: { id } });

  revaliderGalerie();

  const liberes = album._count.items;
  redirect(`${ALBUMS_PATH}?supprime=${liberes}`);
}

/**
 * Désigne la couverture de l'album.
 *
 * Un identifiant vide REMET le repli automatique — la première entrée dans
 * l'ordre d'affichage. C'est ce qui permet de revenir en arrière sans avoir à
 * deviner quelle photographie était choisie au départ.
 */
export async function definirCouvertureAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const albumId = texte(formData, "albumId");
  const itemId = optionnel(texte(formData, "itemId"));
  if (!albumId) return { error: "Album introuvable.", ok: null };

  if (itemId) {
    // La couverture doit appartenir à l'album : sans ce contrôle, un formulaire
    // rejoué désignerait la photographie d'un autre reportage.
    const item = await db().galerieItem.findUnique({ where: { id: itemId }, select: { albumId: true } });
    if (!item) return { error: "Contenu introuvable.", ok: null };
    if (item.albumId !== albumId) {
      return { error: "Ce contenu n'appartient pas à cet album.", ok: null };
    }
  }

  await db().galerieAlbum.update({ where: { id: albumId }, data: { coverItemId: itemId } });

  revalidatePath(`${ALBUMS_PATH}/${albumId}`);
  revaliderGalerie();
  return {
    error: null,
    ok: itemId ? "Couverture de l'album définie." : "Couverture rendue automatique.",
  };
}

/**
 * Rattache une entrée à un album, ou l'en retire.
 *
 * Retirer ne supprime rien : l'entrée retourne dans la galerie sans album. Si
 * elle en était la couverture, le lien est rompu du même geste — sans quoi
 * l'album afficherait en vignette une photographie qu'il ne contient plus.
 */
export async function rattacherAlbumAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const itemId = texte(formData, "itemId");
  const albumId = optionnel(texte(formData, "albumId"));
  if (!itemId) return { error: "Contenu introuvable.", ok: null };

  const item = await db().galerieItem.findUnique({
    where: { id: itemId },
    select: { titreFr: true, albumId: true },
  });
  if (!item) return { error: "Contenu introuvable.", ok: null };

  await db().galerieItem.update({ where: { id: itemId }, data: { albumId } });

  if (item.albumId) {
    await db().galerieAlbum.updateMany({
      where: { id: item.albumId, coverItemId: itemId },
      data: { coverItemId: null },
    });
    revalidatePath(`${ALBUMS_PATH}/${item.albumId}`);
  }
  if (albumId) revalidatePath(`${ALBUMS_PATH}/${albumId}`);

  revalidatePath(`${GALERIE_PATH}/${itemId}`);
  revaliderGalerie();
  return {
    error: null,
    ok: albumId ? `« ${item.titreFr} » rattaché à l'album.` : `« ${item.titreFr} » retiré de l'album.`,
  };
}

/**
 * Déplace une entrée d'un cran dans son album.
 *
 * ÉCHANGE les rangs de deux voisines plutôt que de renuméroter toute la série :
 * une écriture de deux lignes au lieu de quarante, et surtout aucun risque de
 * laisser la liste à moitié renumérotée si la connexion tombe au milieu.
 *
 * Les entrées mises en avant passent devant les autres dans l'ordre d'affichage
 * (cf. lib/galerie/query.ts) : le déplacement se fait donc DANS le groupe où
 * l'entrée se trouve, ce qui est exactement ce que la rédaction voit à l'écran.
 */
export async function deplacerContenuAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const itemId = texte(formData, "itemId");
  const sens = texte(formData, "sens") === "bas" ? "bas" : "haut";
  if (!itemId) return { error: "Contenu introuvable.", ok: null };

  const item = await db().galerieItem.findUnique({
    where: { id: itemId },
    select: { albumId: true, position: true, featured: true },
  });
  if (!item?.albumId) return { error: "Ce contenu n'appartient à aucun album.", ok: null };

  const voisine = await db().galerieItem.findFirst({
    where: {
      albumId: item.albumId,
      featured: item.featured,
      id: { not: itemId },
      position: sens === "haut" ? { lte: item.position } : { gte: item.position },
    },
    select: { id: true, position: true },
    orderBy: { position: sens === "haut" ? "desc" : "asc" },
  });

  if (!voisine) {
    return { error: null, ok: sens === "haut" ? "Déjà en tête." : "Déjà en fin de liste." };
  }

  /* Rangs égaux — le cas courant tant que personne n'a numéroté : l'échange ne
     changerait rien. On écarte alors les deux d'un cran, ce qui produit l'ordre
     attendu et amorce la numérotation. */
  const [rangItem, rangVoisine] =
    item.position === voisine.position
      ? sens === "haut"
        ? [item.position - 1, voisine.position]
        : [item.position + 1, voisine.position]
      : [voisine.position, item.position];

  await db().$transaction([
    db().galerieItem.update({ where: { id: itemId }, data: { position: rangItem } }),
    db().galerieItem.update({ where: { id: voisine.id }, data: { position: rangVoisine } }),
  ]);

  revalidatePath(`${ALBUMS_PATH}/${item.albumId}`);
  revaliderGalerie();
  return { error: null, ok: null };
}

/* -------------------------------------------------------------------------- */
/* Rubriques                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Libellés des deux langues.
 * L'anglais retombe sur le français plutôt que de rester vide : une rubrique
 * sans libellé anglais afficherait un filtre muet sur la version anglaise.
 */
function lireLibelles(formData: FormData): { nomFr: string; nomEn: string } | null {
  const nomFr = texte(formData, "nomFr");
  if (!nomFr) return null;
  return { nomFr, nomEn: texte(formData, "nomEn") || nomFr };
}

export async function enregistrerRubriqueAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const id = texte(formData, "id");
  const libelles = lireLibelles(formData);
  if (!libelles) return { error: "Le libellé français est obligatoire.", ok: null };

  const slug = slugify(texte(formData, "slug") || libelles.nomFr);
  if (!slug) return { error: "Le libellé ne produit aucun identifiant d'URL exploitable.", ok: null };

  const donnees = {
    ...libelles,
    slug,
    color: lireCouleur(texte(formData, "color")),
    position: lireEntier(texte(formData, "position")),
  };

  try {
    if (id) await db().galerieCategory.update({ where: { id }, data: donnees });
    else await db().galerieCategory.create({ data: donnees });
  } catch (error) {
    if (estDoublon(error)) {
      return { error: "Cet identifiant d'URL est déjà pris par une autre rubrique.", ok: null };
    }
    throw error;
  }

  revalidatePath(RUBRIQUES_PATH);
  revaliderGalerie();
  return { error: null, ok: id ? "Rubrique mise à jour." : `Rubrique « ${libelles.nomFr} » créée.` };
}

/**
 * Suppression d'une rubrique.
 *
 * Les entrées ne sont PAS supprimées : leur rattachement passe à `null`
 * (`onDelete: SetNull` au schéma). On l'annonce plutôt que de le laisser
 * découvrir — une photographie qui perd sa rubrique sans explication ressemble à
 * une perte de données.
 */
export async function supprimerRubriqueAction(
  _prev: GalFormState,
  formData: FormData,
): Promise<GalFormState> {
  await assertPermission("videos");

  const id = texte(formData, "id");
  if (!id) return { error: "Rubrique introuvable.", ok: null };

  const rubrique = await db().galerieCategory.findUnique({
    where: { id },
    select: { nomFr: true, _count: { select: { items: true } } },
  });
  if (!rubrique) return { error: "Rubrique introuvable.", ok: null };

  await db().galerieCategory.delete({ where: { id } });

  revalidatePath(RUBRIQUES_PATH);
  revaliderGalerie();

  const orphelins = rubrique._count.items;
  return {
    error: null,
    ok: orphelins > 0
      ? `Rubrique « ${rubrique.nomFr} » supprimée. ${orphelins} entrée(s) sont désormais sans rubrique.`
      : `Rubrique « ${rubrique.nomFr} » supprimée.`,
  };
}
