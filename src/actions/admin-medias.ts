"use server";

/**
 * Bibliothèque de médias.
 *
 * Deux natures de média, une seule table (cf. `MediaAsset` au schéma) :
 *   - un fichier TÉLÉVERSÉ, dont les octets vivent en base et que sert
 *     `/api/medias/<id>` ;
 *   - un média EXTERNE, dont on n'enregistre que l'URL.
 *
 * Stocker le binaire en base est un choix assumé : l'installation reste
 * autonome — aucun service de stockage à provisionner, aucune clé d'API à
 * gérer, une sauvegarde de la base suffit à tout restaurer. Le prix est connu
 * (le plafond de 5 Mo par fichier, et la règle de ne jamais sélectionner la
 * colonne `data` hors de la route qui sert le fichier) ; pour un site
 * institutionnel qui publie quelques visuels par semaine, il est modeste. Une
 * bascule vers un CDN reste ouverte sans migration : il suffit d'enregistrer
 * les visuels comme médias externes.
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
import { dimensionsImage } from "@/lib/image-size";
import { MIMES_IMAGE, TAILLE_MAX, poidsLisible } from "@/lib/medias";
import { safeUrl } from "@/lib/html/sanitize";
import { revaliderActualites } from "@/lib/actus/cache";
import type { ActuFormState } from "@/actions/admin-actualites";

const MEDIAS_PATH = adminPath("/medias");

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
  | { ok: true; id: string; src: string; alt: string; width: number | null; height: number | null }
  | { ok: false; error: string };

/**
 * Téléverse un fichier depuis l'éditeur (collage, glisser-déposer, sélecteur).
 *
 * Renvoie un objet plutôt que d'utiliser `useActionState` : l'appelant est du
 * code d'éditeur qui a besoin de l'URL immédiatement pour insérer l'image à
 * l'endroit du curseur.
 */
export async function televerserMediaAction(formData: FormData): Promise<TeleversementResultat> {
  const acteur = await assertMedias();

  const fichier = formData.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { ok: false, error: "Aucun fichier reçu." };
  }

  if (!(MIMES_IMAGE as readonly string[]).includes(fichier.type)) {
    return { ok: false, error: "Format non accepté. Utilisez JPEG, PNG, WebP, AVIF ou GIF." };
  }

  if (fichier.size > TAILLE_MAX) {
    return {
      ok: false,
      error: `Fichier trop lourd (${poidsLisible(fichier.size)}). Limite : ${poidsLisible(TAILLE_MAX)}.`,
    };
  }

  const octets = new Uint8Array(await fichier.arrayBuffer());
  const taille = dimensionsImage(octets);

  const alt = texte(formData, "altFr");

  const media = await db().mediaAsset.create({
    data: {
      filename: fichier.name.slice(0, 180) || "image",
      mimeType: fichier.type,
      size: fichier.size,
      width: taille?.width ?? null,
      height: taille?.height ?? null,
      data: Buffer.from(octets),
      altFr: optionnel(alt),
      altEn: optionnel(texte(formData, "altEn")) ?? optionnel(alt),
      createdById: acteur.id,
    },
    select: { id: true, width: true, height: true },
  });

  revalidatePath(MEDIAS_PATH);

  return {
    ok: true,
    id: media.id,
    src: `/api/medias/${media.id}`,
    alt,
    width: media.width,
    height: media.height,
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
 * Supprime un média.
 *
 * Refusé tant qu'il sert de couverture : la relation passerait à `null`
 * (`onDelete: SetNull`) et des articles perdraient silencieusement leur visuel.
 * Mieux vaut nommer les articles concernés et laisser l'auteur trancher.
 *
 * Le corps HTML des articles n'est pas inspecté : une image insérée dans le
 * texte y figure par son URL, pas par une relation. La suppression laisserait
 * donc un lien mort — d'où l'avertissement porté par l'écran « Médias ».
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
    select: { filename: true, _count: { select: { couvertures: true } } },
  });
  if (!media) return { error: "Média introuvable.", ok: null };

  if (media._count.couvertures > 0) {
    return {
      error: `Ce média est la couverture de ${media._count.couvertures} article(s). Remplacez-la avant de le supprimer.`,
      ok: null,
    };
  }

  await db().mediaAsset.delete({ where: { id } });

  revalidatePath(MEDIAS_PATH);
  return { error: null, ok: `« ${media.filename} » supprimé de la bibliothèque.` };
}
