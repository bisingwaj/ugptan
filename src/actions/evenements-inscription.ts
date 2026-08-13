"use server";

/**
 * Demande de participation à un événement — côté PUBLIC, donc sans aucune
 * authentification.
 *
 * Mêmes deux principes que le dépôt d'une plainte (cf. actions/mgp.ts), pour
 * les mêmes raisons :
 *
 *   1. **Ce qui entre est une proposition.** Toute donnée du formulaire est
 *      revalidée ici : le navigateur n'est pas une frontière de confiance.
 *      L'identifiant de l'événement lui-même est relu en base — un formulaire
 *      forgé ne doit pas pouvoir inscrire quelqu'un à un brouillon.
 *   2. **Ce qui sort est minimal.** L'action ne renvoie qu'un message. Elle ne
 *      confirme jamais, même indirectement, qu'une adresse figure déjà dans la
 *      liste : ce serait un moyen de tester des adresses une à une.
 *
 * Trois refus, dans cet ordre, parce qu'ils coûtent de moins en moins cher à
 * vérifier : le débit, la validité de la saisie, puis l'état de l'événement.
 */
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { isValidEmail } from "@/lib/auth/validate";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { LANGS, type Lang } from "@/lib/pick";
import { phaseEvenement } from "@/lib/events/statut";
import { INSCRIPTION_LIMITES } from "@/lib/events/inscription";
import { revaliderEvenements } from "@/lib/events/cache";

export type InscriptionState = {
  ok: boolean;
  error: string | null;
  /** Message de succès, déjà dans la langue du formulaire. */
  message: string | null;
};

export const INSCRIPTION_INITIALE: InscriptionState = { ok: false, error: null, message: null };

/**
 * Une inscription légitime demande une minute de saisie. Cinq par quart d'heure
 * laissent de la marge à une personne qui se reprend, ou qui inscrit deux
 * collègues, et coupent court à l'envoi automatisé.
 */
const LIMITE = 5;
const FENETRE_MS = 15 * 60 * 1000;

const propre = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";

/** Le message garde ses retours à la ligne : seuls les blancs de bord partent. */
const propreTexte = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const asLang = (value: unknown): Lang => (LANGS.includes(value as Lang) ? (value as Lang) : "fr");

const echec = (error: string): InscriptionState => ({ ok: false, error, message: null });

export async function inscrireAction(
  _prev: InscriptionState,
  formData: FormData,
): Promise<InscriptionState> {
  const lang = asLang(formData.get("lang"));
  const t = (fr: string, en: string) => (lang === "en" ? en : fr);

  /* --- 1. Débit ---------------------------------------------------------- */
  const limite = rateLimit(`evt:inscription:${requestIp(await headers())}`, LIMITE, FENETRE_MS);
  if (!limite.allowed) {
    return echec(t(
      "Trop de demandes successives depuis cette connexion. Réessayez dans quelques minutes.",
      "Too many successive requests from this connection. Try again in a few minutes.",
    ));
  }

  /* --- 2. Saisie --------------------------------------------------------- */
  const evenementId = propre(formData.get("evenementId"), 40);
  const nom = propre(formData.get("nom"), INSCRIPTION_LIMITES.nom);
  const email = propre(formData.get("email"), INSCRIPTION_LIMITES.email).toLowerCase();
  const organisation = propre(formData.get("organisation"), INSCRIPTION_LIMITES.organisation);
  const telephone = propre(formData.get("telephone"), INSCRIPTION_LIMITES.telephone);
  const message = propreTexte(formData.get("message"), INSCRIPTION_LIMITES.message);

  if (!evenementId) return echec(t("Événement introuvable.", "Event not found."));
  if (!nom) return echec(t("Votre nom est requis.", "Your name is required."));
  if (!isValidEmail(email)) {
    return echec(t("Cette adresse électronique n'est pas valide.", "This email address is not valid."));
  }

  /* --- 3. État de l'événement --------------------------------------------
     Relu en base, jamais cru sur parole. Trois refus distincts, parce qu'ils
     n'appellent pas la même conduite du visiteur. */
  const evenement = await db().evenement.findUnique({
    where: { id: evenementId },
    select: { id: true, status: true, startAt: true, endAt: true, registrationUrl: true },
  });

  if (!evenement || evenement.status !== "PUBLISHED") {
    return echec(t("Cet événement n'est plus annoncé.", "This event is no longer listed."));
  }

  if (phaseEvenement(evenement.startAt, evenement.endAt) === "TERMINE") {
    return echec(t(
      "Cet événement est terminé : les inscriptions sont closes.",
      "This event has ended: registration is closed.",
    ));
  }

  // Billetterie externe : c'est elle qui tient la liste. En tenir une seconde
  // ici la rendrait fausse des deux côtés.
  if (evenement.registrationUrl) {
    return echec(t(
      "Les inscriptions à cet événement se font sur le service indiqué sur sa page.",
      "Registration for this event is handled by the service shown on its page.",
    ));
  }

  /* --- 4. Enregistrement --------------------------------------------------
     `upsert` sur (événement, adresse) : renvoyer le formulaire après une faute
     de frappe dans son nom doit corriger la demande, pas en créer une seconde
     ni afficher une erreur. Le statut n'est PAS réécrit — une demande déjà
     confirmée par l'Unité ne doit pas retomber en « reçue » parce que la
     personne a renvoyé le formulaire. */
  await db().evenementInscription.upsert({
    where: { evenementId_email: { evenementId, email } },
    update: {
      nom,
      organisation: organisation || null,
      telephone: telephone || null,
      message: message || null,
      locale: lang,
    },
    create: {
      evenementId,
      nom,
      email,
      organisation: organisation || null,
      telephone: telephone || null,
      message: message || null,
      locale: lang,
    },
  });

  // La console affiche le nombre de demandes par événement.
  revaliderEvenements();

  return {
    ok: true,
    error: null,
    message: t(
      "Merci. L'équipe confirmera votre participation par courriel.",
      "Thank you. The team will confirm your participation by email.",
    ),
  };
}
