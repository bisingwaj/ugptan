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
import { describeError } from "@/lib/errors";
import { isValidEmail } from "@/lib/auth/validate";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { ecrituresSuspendues } from "@/lib/reglages/maintenance";
import { LANGS, type Lang } from "@/lib/pick";
import { phaseEvenement } from "@/lib/events/statut";
import { INSCRIPTION_LIMITES, type InscriptionState } from "@/lib/events/inscription";
import { revaliderEvenements } from "@/lib/events/cache";

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

  /* --- 0. Site fermé ------------------------------------------------------
     Une inscription enregistrée pendant une intervention n'est vue par
     personne au moment où elle compte : elle est refusée, avec la conduite à
     tenir. */
  if (await ecrituresSuspendues()) {
    return echec(t(
      "Le portail est momentanément fermé pour intervention technique. Votre inscription n'a pas été enregistrée : reprenez-la à la réouverture, ou écrivez à info@ugptn.cd.",
      "The portal is temporarily closed for technical work. Your registration has not been recorded: please register again once the site reopens, or write to info@ugptn.cd.",
    ));
  }

  /* --- 1. Débit ---------------------------------------------------------- */
  const limite = await rateLimit(`evt:inscription:${requestIp(await headers())}`, LIMITE, FENETRE_MS);
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

  /* Les deux accès à la base sont tenus dans un seul `try` : une salve du
     transport vers Neon (cf. lib/lecture.ts) ne doit pas faire tomber la page
     sur l'écran d'erreur, mais rendre au formulaire un échec lisible, avec la
     conduite à tenir. Les refus métier (événement retiré, terminé, billetterie
     externe) restent des retours ordinaires, à l'intérieur. */
  const panne = () => echec(t(
    "Votre inscription n'a pas pu être enregistrée, faute d'accès momentané au service. Réessayez dans quelques minutes, ou écrivez à info@ugptn.cd.",
    "Your registration could not be recorded because the service is temporarily unavailable. Please try again in a few minutes, or write to info@ugptn.cd.",
  ));

  try {
    /* --- 3. État de l'événement ------------------------------------------
       Relu en base, jamais cru sur parole. Trois refus distincts, parce
       qu'ils n'appellent pas la même conduite du visiteur. */
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

    /* --- 4. Enregistrement ------------------------------------------------
       ⚠️ CRÉATION SEULE, JAMAIS DE MISE À JOUR. La version précédente faisait
       un `upsert` sur (événement, adresse), pour qu'un renvoi corrige une
       faute de frappe. Mais le formulaire est public et l'adresse n'est pas
       vérifiée : n'importe qui, connaissant l'adresse d'un inscrit, pouvait
       réécrire son nom, son téléphone et son message — et la console aurait
       affiché ces données forgées comme les siennes.

       `createMany` + `skipDuplicates` se traduit par un seul
       `INSERT … ON CONFLICT DO NOTHING` : atomique, sans fenêtre entre une
       lecture et une écriture, et sans erreur d'unicité à rattraper. Une
       demande déjà présente reste donc intacte, statut compris.

       La réponse est la MÊME dans les deux cas (cf. en-tête, principe 2) : ni
       « déjà inscrit » ni « mise à jour », qui confirmeraient qu'une adresse
       figure sur la liste. Une personne qui veut corriger sa demande écrit à
       l'Unité (info@ugptn.cd), qui la reprend depuis la console. */
    await db().evenementInscription.createMany({
      data: [{
        evenementId,
        nom,
        email,
        organisation: organisation || null,
        telephone: telephone || null,
        message: message || null,
        locale: lang,
      }],
      skipDuplicates: true,
    });
  } catch (error) {
    console.error(`[evenements] inscription non enregistrée. ${describeError(error)}`);
    return panne();
  }

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
