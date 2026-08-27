"use server";

/**
 * Inscription et gestion d'abonnement à la lettre d'information — côté PUBLIC,
 * donc sans aucune authentification.
 *
 * Trois principes gouvernent ce fichier :
 *
 *   1. CE QUI ENTRE EST UNE PROPOSITION. L'adresse est revalidée et normalisée
 *      ici ; le formulaire du navigateur n'est pas une frontière de confiance.
 *   2. CE QUI SORT N'APPREND RIEN. Les retours ne disent jamais si une adresse
 *      figure déjà dans la liste : sans cette précaution, le formulaire
 *      deviendrait un moyen de vérifier qu'une personne est inscrite.
 *   3. RIEN NE SE RÉABONNE TOUT SEUL. Une adresse désabonnée ne redevient
 *      active que par un clic dans un e-mail reçu à cette adresse — la seule
 *      preuve que la demande vient bien de son titulaire (§4 du cahier des
 *      charges).
 *
 * Les actions renvoient un CODE et non une phrase : la copie du site vit dans
 * `content/i18n.ts`, en français et en anglais, et c'est le composant qui la
 * résout (cf. components/chrome/Newsletter.tsx).
 */
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { isValidEmail } from "@/lib/auth/validate";
import { LANGS, type Lang } from "@/lib/pick";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { ecrituresSuspendues } from "@/lib/reglages/maintenance";
import { emailConfigured } from "@/lib/email/config";
import { sendEmail } from "@/lib/email/send";
import {
  newsletterConfirmEmail,
  newsletterUnsubscribeLinkEmail,
  newsletterWelcomeEmail,
} from "@/lib/email/templates/newsletter";
import {
  adresseDesabonnementUnClic,
  lienConfirmation,
  lienDesabonnement,
  nouveauToken,
} from "@/lib/newsletter/liens";
import {
  MIN_FILL_MS,
  SUBSCRIBE_LIMIT,
  SUBSCRIBE_WINDOW_MS,
  UNSUBSCRIBE_LINK_LIMIT,
  UNSUBSCRIBE_LINK_WINDOW_MS,
  estToken,
  normalizeEmail,
} from "@/lib/newsletter/model";

const asLang = (valeur: unknown): Lang => (LANGS.includes(valeur as Lang) ? (valeur as Lang) : "fr");

/* --- Inscription ---------------------------------------------------------- */

/**
 * Issue d'une inscription, telle que l'écran doit la raconter.
 *
 * `already` couvre volontairement DEUX situations — l'adresse était déjà
 * active, ou deux envois simultanés ont couru l'un contre l'autre : dans les
 * deux cas, la personne est inscrite et n'a rien à faire de plus.
 */
export type SubscribeCode = "subscribed" | "already" | "confirm";

/** Motifs de refus. Chacun a sa phrase dans `dict(lang).nl.erreurs`. */
export type SubscribeError = "invalid" | "rate" | "robot" | "mail" | "server" | "ferme";

export type SubscribeResult =
  | { ok: true; code: SubscribeCode }
  | { ok: false; error: SubscribeError };

export type SubscribeDraft = {
  email: string;
  lang: string;
  /** Champ leurre : rempli, la soumission vient d'un robot (cf. HONEYPOT_FIELD). */
  piege?: string;
  /** Millisecondes écoulées depuis l'affichage du formulaire. */
  delai?: number;
};

export async function subscribeNewsletter(draft: SubscribeDraft): Promise<SubscribeResult> {
  const lang = asLang(draft?.lang);

  // 1. Leurre et minuterie : deux filtres sans friction pour l'utilisateur, qui
  //    éliminent l'essentiel des soumissions automatisées avant toute requête.
  if (typeof draft?.piege === "string" && draft.piege.trim().length > 0) {
    return { ok: false, error: "robot" };
  }
  if (typeof draft?.delai === "number" && draft.delai >= 0 && draft.delai < MIN_FILL_MS) {
    return { ok: false, error: "robot" };
  }

  /* 2. Site fermé : on n'inscrit personne pendant une intervention. Le
        DÉSABONNEMENT et la CONFIRMATION, eux, restent ouverts plus bas : ils
        sont dus à la personne, fermeture ou pas. */
  if (await ecrituresSuspendues()) return { ok: false, error: "ferme" };

  // 3. Débit par adresse IP : ralentisseur contre l'inondation de la liste
  //    (cf. la portée réelle de la limite, lib/rate-limit.ts).
  const ip = requestIp(await headers());
  if (!rateLimit(`nl:sub:${ip}`, SUBSCRIBE_LIMIT, SUBSCRIBE_WINDOW_MS).allowed) {
    return { ok: false, error: "rate" };
  }

  const email = normalizeEmail(draft?.email);
  if (!isValidEmail(email)) return { ok: false, error: "invalid" };

  try {
    const existant = await db().newsletterSubscriber.findUnique({
      where: { email },
      select: { id: true, status: true, token: true, lang: true },
    });

    /* --- Adresse déjà active ---------------------------------------------
       Rien à écrire, et surtout rien à annoncer de différent : le message de
       succès est le même que pour une première inscription (cf. principe 2). */
    if (existant?.status === "ACTIVE") {
      return { ok: true, code: "already" };
    }

    /* --- Adresse désabonnée ----------------------------------------------
       On ne la réactive PAS. On envoie un lien de confirmation à l'adresse
       elle-même : c'est la « nouvelle action explicite » exigée. Le jeton est
       renouvelé au passage, pour qu'un ancien lien de désabonnement ayant
       circulé ne serve pas de laissez-passer. */
    if (existant) {
      if (!emailConfigured) return { ok: false, error: "mail" };

      const token = nouveauToken();
      await db().newsletterSubscriber.update({
        where: { id: existant.id },
        data: { token, lang },
      });

      const envoi = await sendEmail(
        newsletterConfirmEmail({ email, lang, confirmUrl: lienConfirmation(lang, token) }),
      );
      if (!envoi.ok) return { ok: false, error: "mail" };

      return { ok: true, code: "confirm" };
    }

    /* --- Nouvelle adresse ------------------------------------------------- */
    const token = nouveauToken();
    await db().newsletterSubscriber.create({
      data: { email, lang, token, source: "site", ip },
    });

    /* Message de bienvenue : il n'est pas une confirmation d'inscription — elle
       est déjà effective — mais le moyen de remettre le lien de désabonnement
       entre les mains de l'abonné dès le premier jour. Son échec ne défait
       rien : `sendEmail` ne lève jamais (cf. lib/email/send.ts). */
    if (emailConfigured) {
      await sendEmail(
        newsletterWelcomeEmail({
          email,
          lang,
          unsubscribeUrl: lienDesabonnement(lang, token),
          oneClickUrl: adresseDesabonnementUnClic(token),
        }),
      );
    }

    return { ok: true, code: "subscribed" };
  } catch (error) {
    /* Deux envois simultanés de la même adresse : le second heurte la
       contrainte d'unicité. Ce n'est pas une panne — la personne est inscrite,
       on le lui dit. */
    if ((error as { code?: string })?.code === "P2002") {
      return { ok: true, code: "already" };
    }

    console.error("[newsletter] échec d'une inscription", error);
    return { ok: false, error: "server" };
  }
}

/* --- Désabonnement -------------------------------------------------------- */

export type TokenCode = "done" | "already" | "invalid" | "server";

/**
 * Désabonnement par le jeton d'un lien reçu par e-mail.
 *
 * Déclenché par un bouton, jamais par le simple chargement de la page : les
 * antivirus de messagerie et les aperçus de lien SUIVENT les URL qu'ils
 * trouvent, et désabonneraient les gens à leur insu.
 */
export async function unsubscribeByToken(rawToken: string): Promise<{ code: TokenCode }> {
  if (!estToken(rawToken)) return { code: "invalid" };

  try {
    const abonne = await db().newsletterSubscriber.findUnique({
      where: { token: rawToken },
      select: { id: true, status: true },
    });

    if (!abonne) return { code: "invalid" };
    if (abonne.status === "UNSUBSCRIBED") return { code: "already" };

    await db().newsletterSubscriber.update({
      where: { id: abonne.id },
      data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
    });

    return { code: "done" };
  } catch (error) {
    console.error("[newsletter] échec d'un désabonnement", error);
    return { code: "server" };
  }
}

/**
 * Confirmation d'une réinscription, par le jeton du lien envoyé plus haut.
 *
 * `subscribedAt` est remise à jour : la liste doit dire depuis quand l'adresse
 * est active, et non depuis quand elle est connue.
 */
export async function confirmByToken(rawToken: string): Promise<{ code: TokenCode }> {
  if (!estToken(rawToken)) return { code: "invalid" };

  try {
    const abonne = await db().newsletterSubscriber.findUnique({
      where: { token: rawToken },
      select: { id: true, status: true },
    });

    if (!abonne) return { code: "invalid" };
    if (abonne.status === "ACTIVE") return { code: "already" };

    await db().newsletterSubscriber.update({
      where: { id: abonne.id },
      data: { status: "ACTIVE", subscribedAt: new Date(), unsubscribedAt: null },
    });

    return { code: "done" };
  } catch (error) {
    console.error("[newsletter] échec d'une confirmation d'inscription", error);
    return { code: "server" };
  }
}

/**
 * Renvoi du lien de désabonnement à qui n'a plus l'e-mail qui le portait.
 *
 * ⚠️ La réponse est la MÊME que l'adresse figure ou non dans la liste. Un
 * retour différencié ferait de cette page un vérificateur d'appartenance ; et
 * le lien part par courriel, jamais à l'écran, sans quoi n'importe qui
 * désabonnerait n'importe quelle adresse en la tapant.
 */
export type LinkRequestResult = { ok: true } | { ok: false; error: "invalid" | "rate" | "mail" };

export async function requestUnsubscribeLink(
  rawEmail: string,
  rawLang: string,
): Promise<LinkRequestResult> {
  const lang = asLang(rawLang);
  const email = normalizeEmail(rawEmail);

  if (!isValidEmail(email)) return { ok: false, error: "invalid" };

  if (!rateLimit(`nl:unsub:${requestIp(await headers())}`, UNSUBSCRIBE_LINK_LIMIT, UNSUBSCRIBE_LINK_WINDOW_MS).allowed) {
    return { ok: false, error: "rate" };
  }

  if (!emailConfigured) return { ok: false, error: "mail" };

  try {
    const abonne = await db().newsletterSubscriber.findUnique({
      where: { email },
      select: { token: true, lang: true, status: true },
    });

    // Adresse inconnue ou déjà désabonnée : aucun message ne part, et la
    // réponse reste identique — c'est tout l'objet de la précaution.
    if (abonne && abonne.status === "ACTIVE") {
      /* La langue enregistrée à l'inscription prime sur celle de la page :
         quelqu'un qui s'est inscrit en français et arrive ici depuis la version
         anglaise doit retrouver le message dans la langue qu'il a choisie. */
      const langAbonne = abonne.lang ? asLang(abonne.lang) : lang;

      await sendEmail(
        newsletterUnsubscribeLinkEmail({
          email,
          lang: langAbonne,
          unsubscribeUrl: lienDesabonnement(langAbonne, abonne.token),
          oneClickUrl: adresseDesabonnementUnClic(abonne.token),
        }),
      );
    }

    return { ok: true };
  } catch (error) {
    console.error("[newsletter] échec de l'envoi d'un lien de désabonnement", error);
    // Même retour neutre : une panne ne doit pas non plus révéler l'existence
    // de l'adresse. Elle est journalisée côté serveur, seul endroit utile.
    return { ok: true };
  }
}
