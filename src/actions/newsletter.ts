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
 *   3. RIEN NE S'ABONNE TOUT SEUL. Aucune adresse ne devient active parce
 *      qu'on l'a tapée dans le formulaire : n'importe qui aurait pu la taper.
 *      Elle ne le devient que par un clic dans un e-mail reçu à cette adresse,
 *      seule preuve que la demande vient de son titulaire (double
 *      confirmation ; §4 du cahier des charges pour la réinscription).
 *   4. UNE BOÎTE N'EST PAS UNE CIBLE. Resoumettre une adresse ne fait pas
 *      repartir un message à chaque fois : au plus un message de confirmation
 *      par adresse et par période (CONFIRM_RESEND_MS), quelle que soit l'IP
 *      d'où vient la demande.
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
  cleAdresse,
  empreinteJeton,
  lienConfirmation,
  lienDesabonnement,
  nouveauToken,
} from "@/lib/newsletter/liens";
import {
  CONFIRM_RESEND_MS,
  CONFIRM_TTL_HEURES,
  CONFIRM_TTL_MS,
  SUBSCRIBE_LIMIT,
  SUBSCRIBE_WINDOW_MS,
  UNSUBSCRIBE_LINK_LIMIT,
  UNSUBSCRIBE_LINK_PER_ADDRESS_MS,
  UNSUBSCRIBE_LINK_WINDOW_MS,
  delaiHumain,
  estToken,
  normalizeEmail,
} from "@/lib/newsletter/model";

const asLang = (valeur: unknown): Lang => (LANGS.includes(valeur as Lang) ? (valeur as Lang) : "fr");

/* --- Inscription ---------------------------------------------------------- */

/**
 * Issue d'une inscription, telle que l'écran doit la raconter.
 *
 * UN SEUL CODE, « confirm » : quelle que soit la situation de l'adresse
 * (nouvelle, en attente, active, désabonnée, envoi récent déjà fait),
 * l'écran dit la même chose — « si cette adresse n'est pas déjà inscrite, un
 * message de confirmation lui a été envoyé ». Deux réponses distinctes
 * suffiraient à faire du formulaire un vérificateur d'appartenance à la liste
 * (principe 2). Le type reste une union nommée pour que le composant qui le
 * lit (components/chrome/Newsletter.tsx) n'ait pas à changer.
 */
export type SubscribeCode = "confirm";

/**
 * Motifs de refus. Chacun a sa phrase dans `dict(lang).nl.erreurs`.
 *
 * Aucun ne dépend de l'adresse soumise au-delà de sa forme : « mail » ne sort
 * que si l'envoi de courriels n'est pas configuré DU TOUT, situation commune à
 * toutes les adresses.
 */
export type SubscribeError = "invalid" | "rate" | "robot" | "mail" | "server" | "ferme";

export type SubscribeResult =
  | { ok: true; code: SubscribeCode }
  | { ok: false; error: SubscribeError };

export type SubscribeDraft = {
  email: string;
  lang: string;
  /** Champ leurre : rempli, la soumission vient d'un robot (cf. HONEYPOT_FIELD). */
  piege?: string;
  /**
   * Millisecondes écoulées depuis l'affichage du formulaire. EXIGÉ : absent,
   * la soumission est refusée (cf. `delaiHumain`).
   */
  delai?: number;
};

/** Réponse unique de toute inscription acceptée (cf. `SubscribeCode`). */
const NEUTRE: SubscribeResult = { ok: true, code: "confirm" };

export async function subscribeNewsletter(draft: SubscribeDraft): Promise<SubscribeResult> {
  const lang = asLang(draft?.lang);

  // 1. Leurre et minuterie : deux filtres sans friction pour l'utilisateur, qui
  //    éliminent l'essentiel des soumissions automatisées avant toute requête.
  //    La minuterie refuse par défaut : ne pas transmettre `delai` ne la
  //    contourne plus.
  if (typeof draft?.piege === "string" && draft.piege.trim().length > 0) {
    return { ok: false, error: "robot" };
  }
  if (!delaiHumain(draft?.delai)) {
    return { ok: false, error: "robot" };
  }

  /* 2. Site fermé : on n'inscrit personne pendant une intervention. Le
        DÉSABONNEMENT et la CONFIRMATION, eux, restent ouverts plus bas : ils
        sont dus à la personne, fermeture ou pas. */
  if (await ecrituresSuspendues()) return { ok: false, error: "ferme" };

  // 3. Débit par adresse IP : ralentisseur contre l'inondation de la liste
  //    (cf. la portée réelle de la limite, lib/rate-limit.ts).
  const ip = requestIp(await headers());
  if (!(await rateLimit(`nl:sub:${ip}`, SUBSCRIBE_LIMIT, SUBSCRIBE_WINDOW_MS)).allowed) {
    return { ok: false, error: "rate" };
  }

  const email = normalizeEmail(draft?.email);
  if (!isValidEmail(email)) return { ok: false, error: "invalid" };

  /* 4. Sans messagerie, pas d'inscription du tout : la double confirmation
        n'aurait aucun moyen d'aboutir, et enregistrer l'adresse en attente
        promettrait un message qui ne partira jamais. Le refus ne dit rien de
        l'adresse : il vaut pour toutes. */
  if (!emailConfigured) return { ok: false, error: "mail" };

  /* Jeton de confirmation : le jeton part dans le lien, seule son empreinte
     est écrite (cf. `NewsletterSubscriber.confirmTokenHash`). */
  const jeton = nouveauToken();
  const empreinte = empreinteJeton(jeton);
  const maintenant = new Date();
  const echeance = new Date(maintenant.getTime() + CONFIRM_TTL_MS);
  const seuilRenvoi = new Date(maintenant.getTime() - CONFIRM_RESEND_MS);

  /** Dernier envoi connu, rétabli si le message ne part pas (cf. plus bas). */
  let envoiPrecedent: Date | null = null;

  try {
    const existant = await db().newsletterSubscriber.findUnique({
      where: { email },
      select: { id: true, status: true, confirmSentAt: true },
    });

    /* --- Adresse déjà active ---------------------------------------------
       Rien à écrire, rien à envoyer, et surtout rien à annoncer de différent
       (principe 2). L'abonné légitime qui se réinscrit par distraction n'a
       besoin de rien ; un tiers n'apprend rien. */
    if (existant?.status === "ACTIVE") return NEUTRE;

    if (existant) {
      /* --- Adresse en attente ou désabonnée ------------------------------
         Un nouveau lien remplace l'ancien, SI aucun message n'est parti vers
         cette adresse depuis CONFIRM_RESEND_MS (principe 4).

         Mise à jour CONDITIONNELLE et non lecture puis écriture : deux
         soumissions simultanées liraient toutes deux « pas d'envoi récent » et
         feraient partir deux messages. Ici, la base n'accepte qu'une des deux
         écritures ; celle qui ne modifie aucune ligne n'envoie rien.

         Le statut n'est PAS touché : une adresse désabonnée le reste jusqu'au
         clic. Son refus demeure inscrit, et un tiers qui la resoumet ne peut
         pas la faire passer « en attente » dans la console. */
      envoiPrecedent = existant.confirmSentAt;

      const { count } = await db().newsletterSubscriber.updateMany({
        where: {
          id: existant.id,
          status: { not: "ACTIVE" },
          OR: [{ confirmSentAt: null }, { confirmSentAt: { lt: seuilRenvoi } }],
        },
        data: {
          confirmTokenHash: empreinte,
          confirmExpiresAt: echeance,
          confirmSentAt: maintenant,
          lang,
        },
      });

      // Envoi récent, ou adresse confirmée entre-temps : rien ne part.
      if (count === 0) return NEUTRE;
    } else {
      /* --- Nouvelle adresse ----------------------------------------------
         Créée EN ATTENTE, statut posé explicitement : ne pas dépendre de la
         valeur par défaut de la base, qui a longtemps été ACTIVE. Le jeton de
         gestion (`token`) est tiré dès maintenant, mais il ne voyagera que
         dans le message de bienvenue, après confirmation. */
      await db().newsletterSubscriber.create({
        data: {
          email,
          lang,
          status: "PENDING",
          token: nouveauToken(),
          source: "site",
          ip,
          confirmTokenHash: empreinte,
          confirmExpiresAt: echeance,
          confirmSentAt: maintenant,
        },
      });
    }
  } catch (error) {
    /* Deux envois simultanés d'une même NOUVELLE adresse : le second heurte la
       contrainte d'unicité. Le premier a fait partir le message ; le second
       n'a rien à ajouter. */
    if ((error as { code?: string })?.code === "P2002") return NEUTRE;

    console.error("[newsletter] échec d'une inscription", error);
    return { ok: false, error: "server" };
  }

  const envoi = await sendEmail(
    newsletterConfirmEmail({
      email,
      lang,
      confirmUrl: lienConfirmation(lang, jeton),
      validiteHeures: CONFIRM_TTL_HEURES,
    }),
  );

  if (!envoi.ok) {
    /* Le message n'est pas parti : on rend la main à la personne en effaçant
       la trace de cet envoi, pour qu'une nouvelle tentative ne soit pas
       bloquée par la borne de renvoi. Conditionné à l'empreinte : si une autre
       soumission a écrit entre-temps, on ne défait pas la sienne.

       La réponse reste NEUTRE, à dessein. Un refus « mail » ici ne pourrait
       sortir que pour une adresse non encore active : une panne de messagerie
       suffirait alors à trier les adresses inscrites des autres. La panne est
       journalisée, seul endroit où elle est utile. */
    console.error("[newsletter] échec de l'envoi d'un message de confirmation");
    try {
      await db().newsletterSubscriber.updateMany({
        where: { email, confirmTokenHash: empreinte },
        data: { confirmSentAt: envoiPrecedent },
      });
    } catch (error) {
      console.error("[newsletter] remise à zéro de l'envoi impossible", error);
    }
  }

  return NEUTRE;
}

/* --- Désabonnement -------------------------------------------------------- */

/**
 * Issue d'une opération par jeton.
 *
 * `expired` ne concerne que la confirmation : le jeton de désabonnement, lui,
 * ne périme pas (on doit pouvoir quitter la liste avec le lien d'un message
 * vieux d'un an).
 */
export type TokenCode = "done" | "already" | "invalid" | "expired" | "server";

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
      /* Un lien de confirmation encore en circulation est annulé au passage :
         après un « non » explicite, un ancien message ne doit pas pouvoir
         réinscrire l'adresse. */
      data: {
        status: "UNSUBSCRIBED",
        unsubscribedAt: new Date(),
        confirmTokenHash: null,
        confirmExpiresAt: null,
      },
    });

    return { code: "done" };
  } catch (error) {
    console.error("[newsletter] échec d'un désabonnement", error);
    return { code: "server" };
  }
}

/* --- Confirmation --------------------------------------------------------- */

/**
 * Confirmation d'une inscription (nouvelle adresse ou réinscription), par le
 * jeton du lien envoyé par `subscribeNewsletter`.
 *
 * Trois propriétés, chacune tenue par la base et non par une lecture
 * préalable :
 *
 *   · USAGE UNIQUE. L'empreinte est effacée par la même écriture qui active
 *     l'adresse : un second clic, ou un lien rejoué, ne trouve plus rien.
 *   · PÉREMPTION. L'écriture exige `confirmExpiresAt` dans le futur ; un lien
 *     expiré n'active rien, même s'il est encore reconnu.
 *   · ATOMICITÉ. `updateMany` conditionnel : deux clics simultanés ne
 *     produisent qu'une activation, donc qu'un message de bienvenue.
 *
 * `subscribedAt` est remise à jour : la liste doit dire depuis quand l'adresse
 * est active, et non depuis quand elle est connue.
 */
export async function confirmByToken(rawToken: string): Promise<{ code: TokenCode }> {
  if (!estToken(rawToken)) return { code: "invalid" };

  const empreinte = empreinteJeton(rawToken);
  const maintenant = new Date();

  let abonne: { email: string; lang: string; token: string };
  try {
    const trouve = await db().newsletterSubscriber.findUnique({
      where: { confirmTokenHash: empreinte },
      select: { id: true, email: true, lang: true, token: true, status: true, confirmExpiresAt: true },
    });

    // Jeton inconnu, déjà utilisé ou remplacé par un envoi plus récent.
    if (!trouve) return { code: "invalid" };
    if (trouve.status === "ACTIVE") return { code: "already" };
    if (!trouve.confirmExpiresAt || trouve.confirmExpiresAt <= maintenant) {
      return { code: "expired" };
    }

    const { count } = await db().newsletterSubscriber.updateMany({
      where: {
        id: trouve.id,
        confirmTokenHash: empreinte,
        confirmExpiresAt: { gt: maintenant },
        status: { not: "ACTIVE" },
      },
      // `readAt` remis à zéro : une inscription confirmée est une nouveauté
      // que la bulle de la console doit signaler.
      data: {
        status: "ACTIVE",
        subscribedAt: maintenant,
        unsubscribedAt: null,
        readAt: null,
        confirmTokenHash: null,
        confirmExpiresAt: null,
      },
    });

    // Un clic concurrent est passé juste avant : l'adresse est active.
    if (count === 0) return { code: "already" };

    abonne = trouve;
  } catch (error) {
    console.error("[newsletter] échec d'une confirmation d'inscription", error);
    return { code: "server" };
  }

  /* Message de bienvenue : l'inscription est désormais effective, et ce
     message remet le lien de désabonnement entre les mains de l'abonné dès le
     premier jour. Son échec ne défait rien : `sendEmail` ne lève jamais (cf.
     lib/email/send.ts). */
  if (emailConfigured) {
    const lang = asLang(abonne.lang);
    await sendEmail(
      newsletterWelcomeEmail({
        email: abonne.email,
        lang,
        unsubscribeUrl: lienDesabonnement(lang, abonne.token),
        oneClickUrl: adresseDesabonnementUnClic(abonne.token),
      }),
    );
  }

  return { code: "done" };
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

  if (!(await rateLimit(`nl:unsub:${requestIp(await headers())}`, UNSUBSCRIBE_LINK_LIMIT, UNSUBSCRIBE_LINK_WINDOW_MS)).allowed) {
    return { ok: false, error: "rate" };
  }

  if (!emailConfigured) return { ok: false, error: "mail" };

  /* Borne par adresse DESTINATAIRE (cf. CONFIRM_RESEND_MS pour le même
     raisonnement) : au plus un lien par adresse et par période, d'où que
     vienne la demande. Consommée AVANT de savoir si l'adresse est inscrite,
     et dépassée sans changer la réponse : la borne ne doit rien révéler de
     plus que le reste de la fonction. */
  if (!(await rateLimit(cleAdresse("nl:unsub:dest", email), 1, UNSUBSCRIBE_LINK_PER_ADDRESS_MS)).allowed) {
    return { ok: true };
  }

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
