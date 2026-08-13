/**
 * Messages adressés aux ABONNÉS de la newsletter.
 *
 * Deux différences de fond avec l'invitation de compte, qui expliquent que ces
 * gabarits ne partagent que les briques de `../layout` :
 *
 *   1. Ils sont BILINGUES. La langue retenue est celle du formulaire au moment
 *      de l'inscription (`NewsletterSubscriber.lang`) : écrire à quelqu'un dans
 *      une langue qu'il n'a pas choisie est le premier motif de plainte pour
 *      pourriel.
 *   2. Ils s'adressent au PUBLIC. Ni le bandeau ni le pied ne mentionnent la
 *      console — leur destinataire n'y a pas accès (cf. `subtitle` et
 *      `signature` de `renderEmail`).
 *
 * Tous portent un lien de désabonnement : c'est ce qui distingue une lettre
 * d'information d'un envoi non sollicité, et ce que réclament les filtres des
 * messageries.
 */
import type { Lang } from "@/lib/pick";
import { button, esc, fallbackLink, notice, paragraph, renderEmail } from "../layout";
import type { Mail } from "../send";

/** Intitulé sous la marque, à la place de « Console d'administration ». */
const subtitle = (lang: Lang) => (lang === "en" ? "Newsletter" : "Lettre d'information");

const signature = (lang: Lang) =>
  lang === "en"
    ? "Automated message sent to the address that subscribed to the UGPTN newsletter."
    : "Message automatique envoyé à l'adresse inscrite à la lettre d'information de l'UGPTN.";

/** Pied de message rappelant pourquoi il arrive, et comment le faire cesser. */
const footnote = (lang: Lang, unsubscribeUrl: string) =>
  lang === "en"
    ? `You are receiving this message because this address was entered in the newsletter form on the UGPTN website. <a href="${esc(unsubscribeUrl)}" style="color:#0f62fe;">Unsubscribe in one click</a>.`
    : `Vous recevez ce message parce que cette adresse a été saisie dans le formulaire d'inscription du site de l'UGPTN. <a href="${esc(unsubscribeUrl)}" style="color:#0f62fe;">Se désabonner en un clic</a>.`;

/* --- Bienvenue ------------------------------------------------------------ */

/**
 * Accusé d'inscription. Il ne demande rien : l'inscription est déjà effective.
 * Sa raison d'être est de mettre le lien de désabonnement entre les mains de
 * l'abonné dès le premier jour, sans attendre la première campagne.
 */
export function newsletterWelcomeEmail(params: {
  email: string;
  lang: Lang;
  unsubscribeUrl: string;
}): Mail {
  const { email, lang, unsubscribeUrl } = params;
  const en = lang === "en";

  const subject = en
    ? "Your subscription to the UGPTN newsletter"
    : "Votre inscription à la lettre d'information de l'UGPTN";

  const html = renderEmail({
    lang,
    subtitle: subtitle(lang),
    signature: signature(lang),
    preheader: en
      ? "Your address is registered. You will receive the next edition."
      : "Votre adresse est enregistrée. Vous recevrez la prochaine édition.",
    kicker: en ? "Subscription confirmed" : "Inscription confirmée",
    title: en ? "You are subscribed" : "Vous êtes inscrit",
    blocks: [
      paragraph(
        en
          ? `The address <strong>${esc(email)}</strong> has been added to the list of the Digital Transformation Project newsletter. You will receive project news, results and stories.`
          : `L'adresse <strong>${esc(email)}</strong> a été ajoutée à la liste de diffusion de la lettre d'information du Projet de Transformation Numérique. Vous y recevrez l'actualité, les résultats et les histoires du Projet.`,
      ),
      notice(
        en
          ? "You can leave the list at any time: every message we send carries an unsubscribe link, and the button below works from today."
          : "Vous pouvez quitter la liste à tout moment : chacun de nos messages porte un lien de désabonnement, et le bouton ci-dessous fonctionne dès aujourd'hui.",
      ),
      button(en ? "Unsubscribe" : "Me désabonner", unsubscribeUrl),
      paragraph(
        en
          ? "If you did not subscribe, this single click removes the address from the list — nothing else was recorded."
          : "Si vous n'êtes pas à l'origine de cette inscription, ce seul clic retire l'adresse de la liste — rien d'autre n'a été enregistré.",
        { muted: true },
      ),
    ],
    footnote: footnote(lang, unsubscribeUrl),
  });

  const text = [
    en ? "YOUR SUBSCRIPTION TO THE UGPTN NEWSLETTER" : "VOTRE INSCRIPTION À LA LETTRE D'INFORMATION DE L'UGPTN",
    "",
    en
      ? `The address ${email} has been added to the newsletter list.`
      : `L'adresse ${email} a été ajoutée à la liste de diffusion de la lettre d'information.`,
    "",
    en ? "Unsubscribe at any time:" : "Vous désabonner à tout moment :",
    unsubscribeUrl,
    "",
    "--",
    "Unité de Gestion du Projet de Transformation Numérique — RDC",
  ].join("\n");

  return { to: email, subject, html, text };
}

/* --- Confirmation de réinscription ---------------------------------------- */

/**
 * Adressé quand une adresse DÉSABONNÉE est resoumise dans le formulaire.
 *
 * ⚠️ Ce message est la garantie exigée au §4 du cahier des charges : une
 * personne désabonnée n'est jamais remise en liste par la seule saisie de son
 * adresse — n'importe qui aurait pu la taper. Seul le clic sur ce lien, reçu
 * dans SA boîte, vaut consentement.
 */
export function newsletterConfirmEmail(params: {
  email: string;
  lang: Lang;
  confirmUrl: string;
}): Mail {
  const { email, lang, confirmUrl } = params;
  const en = lang === "en";

  const subject = en
    ? "Confirm your subscription to the UGPTN newsletter"
    : "Confirmez votre inscription à la lettre d'information de l'UGPTN";

  const html = renderEmail({
    lang,
    subtitle: subtitle(lang),
    signature: signature(lang),
    preheader: en
      ? "One click is needed to put this address back on the list."
      : "Un clic suffit à remettre cette adresse sur la liste.",
    kicker: en ? "Confirmation required" : "Confirmation requise",
    title: en ? "Confirm your subscription" : "Confirmez votre inscription",
    blocks: [
      paragraph(
        en
          ? `The address <strong>${esc(email)}</strong> was entered again in the newsletter form. It had previously been unsubscribed, so we do not put it back on the list on that basis alone.`
          : `L'adresse <strong>${esc(email)}</strong> vient d'être saisie à nouveau dans le formulaire d'inscription. Elle avait été désabonnée : nous ne la remettons pas en liste sur cette seule base.`,
      ),
      button(en ? "Confirm my subscription" : "Confirmer mon inscription", confirmUrl),
      fallbackLink(
        confirmUrl,
        en
          ? "If the button does not appear, copy this link into your browser:"
          : "Si le bouton ne s'affiche pas, copiez ce lien dans votre navigateur :",
      ),
      paragraph(
        en
          ? "If this was not you, ignore this message: the address stays unsubscribed and you will receive nothing further."
          : "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : l'adresse reste désabonnée et vous ne recevrez rien d'autre.",
        { muted: true },
      ),
    ],
  });

  const text = [
    en ? "CONFIRM YOUR SUBSCRIPTION" : "CONFIRMEZ VOTRE INSCRIPTION",
    "",
    en
      ? `The address ${email} was entered again in the newsletter form, after having been unsubscribed.`
      : `L'adresse ${email} a été saisie à nouveau dans le formulaire d'inscription, après avoir été désabonnée.`,
    "",
    en ? "Confirm with this link:" : "Confirmez avec ce lien :",
    confirmUrl,
    "",
    en
      ? "If this was not you, ignore this message: the address stays unsubscribed."
      : "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : l'adresse reste désabonnée.",
    "",
    "--",
    "Unité de Gestion du Projet de Transformation Numérique — RDC",
  ].join("\n");

  return { to: email, subject, html, text };
}

/* --- Lien de désabonnement, sur demande ----------------------------------- */

/**
 * Envoyé depuis la page publique de désabonnement, quand la personne n'a plus
 * l'e-mail portant son lien. Le lien part par courriel et non à l'écran : sans
 * cela, n'importe qui désabonnerait n'importe quelle adresse en la tapant.
 */
export function newsletterUnsubscribeLinkEmail(params: {
  email: string;
  lang: Lang;
  unsubscribeUrl: string;
}): Mail {
  const { email, lang, unsubscribeUrl } = params;
  const en = lang === "en";

  const subject = en ? "Unsubscribe from the UGPTN newsletter" : "Désabonnement de la lettre d'information de l'UGPTN";

  const html = renderEmail({
    lang,
    subtitle: subtitle(lang),
    signature: signature(lang),
    preheader: en
      ? "Your unsubscribe link, valid until used."
      : "Votre lien de désabonnement, valable jusqu'à son utilisation.",
    kicker: en ? "Unsubscribe" : "Désabonnement",
    title: en ? "Leave the list in one click" : "Quitter la liste en un clic",
    blocks: [
      paragraph(
        en
          ? `An unsubscribe link was requested for <strong>${esc(email)}</strong>. The button below removes this address from the list immediately.`
          : `Un lien de désabonnement a été demandé pour <strong>${esc(email)}</strong>. Le bouton ci-dessous retire cette adresse de la liste sur-le-champ.`,
      ),
      button(en ? "Unsubscribe" : "Me désabonner", unsubscribeUrl),
      fallbackLink(
        unsubscribeUrl,
        en
          ? "If the button does not appear, copy this link into your browser:"
          : "Si le bouton ne s'affiche pas, copiez ce lien dans votre navigateur :",
      ),
      paragraph(
        en
          ? "If you did not ask for this, ignore the message: nothing changes until the link is opened."
          : "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : rien ne change tant que le lien n'est pas ouvert.",
        { muted: true },
      ),
    ],
  });

  const text = [
    en ? "UNSUBSCRIBE FROM THE UGPTN NEWSLETTER" : "DÉSABONNEMENT DE LA LETTRE D'INFORMATION DE L'UGPTN",
    "",
    en ? `Unsubscribe link for ${email} :` : `Lien de désabonnement pour ${email} :`,
    unsubscribeUrl,
    "",
    en
      ? "If you did not ask for this, ignore the message: nothing changes until the link is opened."
      : "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : rien ne change tant que le lien n'est pas ouvert.",
    "",
    "--",
    "Unité de Gestion du Projet de Transformation Numérique — RDC",
  ].join("\n");

  return { to: email, subject, html, text };
}
