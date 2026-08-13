"use server";

/**
 * Gestion des abonnés depuis la console.
 *
 * ⚠️ INVARIANT : chaque action commence par `assertPermission("newsletter")`.
 * Le proxy laisse passer les POST — rediriger un POST de server action casserait
 * le protocole Flight — donc la barrière est ici, et nulle part ailleurs.
 *
 * Deux gestes seulement, et ils ne disent pas la même chose :
 *
 *   - DÉSABONNER conserve la ligne et la marque. C'est ce qui permet à un
 *     import ultérieur de ne pas réabonner quelqu'un qui est parti.
 *   - SUPPRIMER efface la ligne, donc aussi la mémoire de ce refus. Réservé aux
 *     demandes d'effacement, ce que dit la confirmation affichée à l'écran.
 *
 * Réabonner depuis la console reste possible pour traiter une demande reçue par
 * un autre canal (téléphone, courrier, guichet). Le geste est journalisé par la
 * seule trace qui compte ici : `subscribedAt` repart à la date du jour.
 */
import { revalidatePath } from "next/cache";
import { ADMIN_NEWSLETTER } from "@/lib/admin";
import { db } from "@/lib/db";
import { assertPermission } from "@/lib/auth/guard";
import { ADMIN } from "@/content/admin";

export type NewsletterFormState = { error: string | null; ok: string | null };

const t = ADMIN.newsletter;

/** Bascule actif / désabonné d'une adresse. */
export async function setSubscriberStatusAction(
  _prev: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  await assertPermission("newsletter");

  const id = String(formData.get("id") ?? "");
  const actif = String(formData.get("actif") ?? "") === "1";
  if (!id) return { error: t.introuvable, ok: null };

  try {
    await db().newsletterSubscriber.update({
      where: { id },
      data: actif
        ? // Réabonnement : la date d'inscription repart à zéro, faute de quoi
          // la liste prétendrait que l'adresse n'a jamais quitté la diffusion.
          { status: "ACTIVE", subscribedAt: new Date(), unsubscribedAt: null }
        : { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
    });
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      return { error: t.introuvable, ok: null };
    }
    console.error("[newsletter] changement de statut impossible", error);
    return { error: "Le changement de statut a échoué.", ok: null };
  }

  revalidatePath(ADMIN_NEWSLETTER);
  return { error: null, ok: actif ? t.reabonneOk : t.desabonneOk };
}

/** Effacement définitif d'une adresse. */
export async function deleteSubscriberAction(
  _prev: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  await assertPermission("newsletter");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: t.introuvable, ok: null };

  try {
    await db().newsletterSubscriber.delete({ where: { id } });
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      return { error: t.introuvable, ok: null };
    }
    console.error("[newsletter] suppression impossible", error);
    return { error: "La suppression a échoué.", ok: null };
  }

  revalidatePath(ADMIN_NEWSLETTER);
  return { error: null, ok: t.supprimeOk };
}
