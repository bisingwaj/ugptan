"use server";

/**
 * Bibliothèque de médias et de documents.
 *
 * Le fichier téléversé part chez CLOUDINARY (cf. `src/lib/cloudinary.ts`) ; la
 * base ne garde que son adresse, son identifiant public et ses métadonnées.
 * Écrire le binaire en PostgreSQL rendait l'installation autonome, mais faisait
 * porter à la base — sauvegardée, répliquée, facturée à l'octet — un rôle de
 * serveur de fichiers, et à l'application celui de CDN. Un média téléversé et
 * un média externe se ressemblent désormais : les deux portent une `url`, seul
 * `publicId` distingue ce qui nous appartient de ce qui est hébergé ailleurs.
 *
 * Deux conséquences à connaître :
 *   - la suppression retire aussi le fichier du compte Cloudinary ;
 *   - sans identifiants Cloudinary, le téléversement est refusé avec un message
 *     explicite. Le reste de la console continue de fonctionner.
 *
 * ⚠️ Autorisation : le module « Médias » OU le module « Actualités ». Un
 * rédacteur doit pouvoir téléverser la couverture de son article sans qu'on lui
 * ouvre toute la bibliothèque.
 */
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { adminPath } from "@/lib/admin";
import { getCurrentUser, type AdminUser } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { cloudinaryActif, deposerFichier, supprimerFichier } from "@/lib/cloudinary";
import { dimensionsImage } from "@/lib/image-size";
import { MIMES_ACCEPTES, contenuCorrespond, estImage, poidsLisible, tailleMaxPour } from "@/lib/medias";
import { safeUrl } from "@/lib/html/sanitize";
import { revaliderActualites } from "@/lib/actus/cache";
import type { ActuFormState } from "@/actions/admin-actualites";

const MEDIAS_PATH = adminPath("/media");

const texte = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();
const optionnel = (value: string): string | null => (value.length ? value : null);

/**
 * Garde propre au module : deux permissions ouvrent la bibliothèque.
 * Lève au lieu de rediriger, comme toute garde de server action.
 */
async function assertMedias(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Session expirée. Reconnectez-vous.");
  if (!can(user, "medias") && !can(user, "actualites")) {
    throw new Error("Droits insuffisants pour cette opération.");
  }
  return user;
}

/** Retour du téléversement, consommé par le sélecteur de médias de l'éditeur. */
export type TeleversementResultat =
  | {
      ok: true;
      id: string;
      src: string;
      alt: string;
      width: number | null;
      height: number | null;
      /** Identifiant de stockage : distingue notre fichier d'un média externe. */
      publicId: string | null;
    }
  | { ok: false; error: string };

/**
 * Téléverse un fichier depuis l'éditeur (collage, glisser-déposer, sélecteur).
 *
 * Renvoie un objet plutôt que d'utiliser `useActionState` : l'appelant est du
 * code d'éditeur qui a besoin de l'URL immédiatement pour insérer l'image à
 * l'endroit du curseur.
 *
 * Le dépôt distant précède l'écriture en base, et non l'inverse : un échec
 * Cloudinary laisse alors la bibliothèque intacte, là qu'une ligne créée
 * d'abord aurait survécu en pointant vers un fichier inexistant.
 */
export async function televerserMediaAction(formData: FormData): Promise<TeleversementResultat> {
  const acteur = await assertMedias();

  const fichier = formData.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { ok: false, error: "Aucun fichier reçu." };
  }

  if (!(MIMES_ACCEPTES as readonly string[]).includes(fichier.type)) {
    return {
      ok: false,
      error: "Format non accepté. Images : JPEG, PNG, WebP, AVIF, GIF. Documents : PDF, Word, Excel, PowerPoint, CSV.",
    };
  }

  const plafond = tailleMaxPour(fichier.type);
  if (fichier.size > plafond) {
    return {
      ok: false,
      error: `Fichier trop lourd (${poidsLisible(fichier.size)}). Limite : ${poidsLisible(plafond)}.`,
    };
  }

  if (!cloudinaryActif()) {
    return {
      ok: false,
      error: "Stockage des fichiers non configuré. Renseignez CLOUDINARY_URL dans l'environnement.",
    };
  }

  const octets = new Uint8Array(await fichier.arrayBuffer());

  /* Le type contrôlé plus haut est celui que le CLIENT annonce : une requête
     forgée présente ce qu'elle veut sous l'étiquette « image/png ». On relit
     donc les premiers octets, qui eux ne mentent pas. Sans ce contrôle, la
     liste blanche des types ne vérifiait que la politesse du navigateur. */
  if (!contenuCorrespond(octets, fichier.type)) {
    return {
      ok: false,
      error: "Le contenu du fichier ne correspond pas à son format annoncé. Envoi refusé.",
    };
  }

  const nom = fichier.name.slice(0, 180) || (estImage(fichier.type) ? "image" : "document");

  // Dimensions lues localement : Cloudinary les renvoie aussi, mais seulement
  // pour une ressource « image ». La lecture d'en-tête couvre en plus les cas
  // où le service les omet, et ne coûte que quelques octets.
  const taille = estImage(fichier.type) ? dimensionsImage(octets) : null;

  let depot;
  try {
    depot = await deposerFichier(octets, {
      filename: nom,
      mimeType: fichier.type,
      sousDossier: estImage(fichier.type) ? "medias" : "documents",
    });
  } catch (erreur) {
    console.error("[medias] dépôt Cloudinary impossible", erreur);
    return { ok: false, error: "Téléversement refusé par le service de stockage. Réessayez." };
  }

  const alt = texte(formData, "altFr");

  let media;
  try {
    media = await db().mediaAsset.create({
      data: {
        filename: nom,
        mimeType: fichier.type,
        size: depot.size || fichier.size,
        width: depot.width ?? taille?.width ?? null,
        height: depot.height ?? taille?.height ?? null,
        url: depot.url,
        publicId: depot.publicId,
        altFr: optionnel(alt),
        altEn: optionnel(texte(formData, "altEn")) ?? optionnel(alt),
        createdById: acteur.id,
      },
      select: { id: true, width: true, height: true, url: true, publicId: true },
    });
  } catch (erreur) {
    // Le fichier est déjà chez Cloudinary : le retirer évite d'y laisser un
    // orphelin que plus rien en base ne désigne.
    await supprimerFichier(depot.publicId, fichier.type);
    throw erreur;
  }

  revalidatePath(MEDIAS_PATH);

  return {
    ok: true,
    id: media.id,
    src: media.url ?? "",
    alt,
    width: media.width,
    height: media.height,
    publicId: media.publicId,
  };
}

/** Variante formulaire du téléversement, pour la page « Médias ». */
export async function televerserDepuisFormulaireAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  const resultat = await televerserMediaAction(formData);
  return resultat.ok
    ? { error: null, ok: "Média ajouté à la bibliothèque." }
    : { error: resultat.error, ok: null };
}

/**
 * Enregistre un média hébergé ailleurs.
 *
 * `safeUrl` refait ici le contrôle de schéma appliqué au corps des articles :
 * une URL `javascript:` déposée dans la bibliothèque finirait dans un attribut
 * `src` de la page publique.
 */
export async function enregistrerMediaExterneAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  const acteur = await assertMedias();

  const brut = texte(formData, "url");
  const url = brut ? safeUrl(brut) : null;
  if (!url || !/^https?:\/\//i.test(url)) {
    return { error: "Indiquez une URL commençant par http:// ou https://.", ok: null };
  }

  const alt = texte(formData, "altFr");
  const nom = url.split("/").pop()?.split("?")[0] || "media";

  await db().mediaAsset.create({
    data: {
      filename: nom.slice(0, 180),
      mimeType: "image/*",
      size: 0,
      url,
      altFr: optionnel(alt),
      altEn: optionnel(texte(formData, "altEn")) ?? optionnel(alt),
      createdById: acteur.id,
    },
  });

  revalidatePath(MEDIAS_PATH);
  return { error: null, ok: "Média externe enregistré." };
}

/** Met à jour les textes d'un média (alternatif FR/EN, légende). */
export async function mettreAJourMediaAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  await assertMedias();

  const id = texte(formData, "id");
  if (!id) return { error: "Média introuvable.", ok: null };

  const existe = await db().mediaAsset.findUnique({ where: { id }, select: { id: true } });
  if (!existe) return { error: "Média introuvable.", ok: null };

  await db().mediaAsset.update({
    where: { id },
    data: {
      altFr: optionnel(texte(formData, "altFr")),
      altEn: optionnel(texte(formData, "altEn")),
      legende: optionnel(texte(formData, "legende")),
    },
  });

  revalidatePath(MEDIAS_PATH);
  revaliderActualites();
  return { error: null, ok: "Média mis à jour." };
}

/**
 * Supprime un média, en base ET chez Cloudinary.
 *
 * Refusé tant qu'il sert de couverture : la relation passerait à `null`
 * (`onDelete: SetNull`) et des articles perdraient silencieusement leur visuel.
 * Mieux vaut nommer les articles concernés et laisser l'auteur trancher. Même
 * règle pour les événements, dont le média est l'affiche.
 *
 * Le corps HTML des articles n'est pas inspecté : une image insérée dans le
 * texte y figure par son URL, pas par une relation. La suppression laisserait
 * donc un lien mort — d'où l'avertissement porté par l'écran « Médias ».
 *
 * L'ordre est inverse de celui du téléversement : la base d'abord, le fichier
 * ensuite. Un échec réseau chez Cloudinary laisse un fichier orphelin que plus
 * rien ne désigne — gênant, mais sans effet visible ; l'inverse effacerait un
 * fichier encore référencé.
 */
export async function supprimerMediaAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  await assertMedias();

  const id = texte(formData, "id");
  if (!id) return { error: "Média introuvable.", ok: null };

  const media = await db().mediaAsset.findUnique({
    where: { id },
    select: {
      filename: true,
      mimeType: true,
      publicId: true,
      _count: { select: { couvertures: true, affiches: true } },
    },
  });
  if (!media) return { error: "Média introuvable.", ok: null };

  if (media._count.couvertures > 0) {
    return {
      error: `Ce média est la couverture de ${media._count.couvertures} article(s). Remplacez-la avant de le supprimer.`,
      ok: null,
    };
  }

  if (media._count.affiches > 0) {
    return {
      error: `Ce média est l'affiche de ${media._count.affiches} événement(s). Remplacez-la avant de le supprimer.`,
      ok: null,
    };
  }

  await db().mediaAsset.delete({ where: { id } });
  if (media.publicId) await supprimerFichier(media.publicId, media.mimeType);

  revalidatePath(MEDIAS_PATH);
  return { error: null, ok: `« ${media.filename} » supprimé de la bibliothèque.` };
}
