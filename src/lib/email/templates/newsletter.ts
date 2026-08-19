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
import { SITE_URL } from "@/lib/site";
import { button, esc, fallbackLink, featureList, notice, paragraph, renderEmail } from "../layout";
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


/* --- Sommaire de la lettre ------------------------------------------------- */

/**
 * Ce que l'abonné recevra, annoncé dès l'accusé d'inscription.
 *
 * ─── Pourquoi ces quatre rubriques, et pas « l'actualité du projet » ────────
 *
 * Une lettre d'information de projet public se lit rarement pour le projet
 * lui-même. Elle se lit pour ce qu'il déplace chez ceux qui n'y travaillent
 * pas : un bureau d'état civil territorial, un centre de santé de zone, un
 * ménage qui renonçait à un déplacement. Les rubriques sont donc écrites du
 * point de vue de l'usager, et non de celui de l'Unité.
 *
 * La quatrième n'est pas une concession de forme. Une lettre qui ne rendrait
 * compte que des réussites se fait classer en publicité, par ses lecteurs
 * d'abord, par les filtres ensuite.
 *
 * ⚠️ Aucune promesse chiffrée ici : le prospectif s'écrit qualitativement tant
 * qu'il n'est pas constaté (cf. doctrine de rédaction du projet).
 */
const RUBRIQUES = (en: boolean): { title: string; text: string }[] =>
  en
    ? [
        {
          title: "What changes in a health centre, a school, an administrative office",
          text: "Which institutions are connected, and what their staff can then do on site: a register consulted without travelling, a file sent to the provincial capital without anyone carrying it there.",
        },
        {
          title: "Services that no longer require a journey",
          text: "Civil status, identity, enrolment. As registers become interoperable, each of them removes trips and lost days for the people who depend on them.",
        },
        {
          title: "Skills trained, and what becomes of them",
          text: "The courses opened to young people and to public officials, the occupations they lead to, and what those who completed them are doing now. Training with no demand facing it produces qualified emigration, not employment.",
        },
        {
          title: "What is holding, and why",
          text: "Delays, trade-offs and the reasons behind them. A newsletter that reported successes alone would soon stop being read.",
        },
      ]
    : [
        {
          title: "Ce qui change dans un centre de santé, une école, un bureau administratif",
          text: "Les institutions raccordées, et ce que leurs agents peuvent faire sur place une fois qu'elles le sont : un registre consulté sans se déplacer, un dossier transmis au chef-lieu sans que personne l'y porte.",
        },
        {
          title: "Les démarches qui cessent d'exiger un déplacement",
          text: "L'état civil, l'identité, l'inscription. À mesure que les registres deviennent interopérables, chacune d'elles retire des trajets et des journées perdues à ceux qui en dépendent.",
        },
        {
          title: "Les compétences formées, et ce qu'elles deviennent",
          text: "Les parcours ouverts aux jeunes et aux agents publics, les métiers qu'ils visent, et ce que font aujourd'hui ceux qui les ont terminés. Une formation sans demande en face produit de l'émigration qualifiée, pas de l'emploi.",
        },
        {
          title: "Ce qui bloque, et pourquoi",
          text: "Les retards, les arbitrages et leurs raisons. Une lettre qui ne rendrait compte que des réussites cesserait vite d'être lue.",
        },
      ];

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
  /** Adresse POST du désabonnement en un clic (cf. lib/newsletter/liens.ts). */
  oneClickUrl: string;
}): Mail {
  const { email, lang, unsubscribeUrl, oneClickUrl } = params;
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
          ? `The address <strong>${esc(email)}</strong> is now on the mailing list of the Digital Transformation Project. Each edition reports what changes for the people the project reaches: what a household, a health centre or a territorial registry office can do that it could not do before.`
          : `L'adresse <strong>${esc(email)}</strong> figure désormais sur la liste de diffusion du Projet de Transformation Numérique. Chaque édition rend compte de ce qui change pour les personnes que le projet atteint : ce qu'un ménage, un centre de santé ou un bureau d'état civil territorial peut faire qu'il ne pouvait pas faire avant.`,
      ),
      featureList(RUBRIQUES(en)),
      /* Le bouton mène au site, non au désabonnement.
         Ce n'est pas un renoncement à la règle qui voulait le lien de sortie
         entre les mains de l'abonné dès le premier jour : ce lien reste porté
         par le pied de CE message comme de tous les suivants, et par le
         paragraphe ci-dessous. Ce qui change, c'est qu'un message de bienvenue
         cesse de proposer le départ pour seule action. */
      button(en ? "Read the latest news" : "Lire les dernières actualités", `${SITE_URL}/${lang}/news`),
      notice(
        en
          ? `You can leave the list at any time. Every message carries an unsubscribe link, including this one: <a href="${esc(unsubscribeUrl)}" style="color:#0f62fe;">unsubscribe in one click</a>, with no reason to give and no confirmation to wait for.`
          : `Vous pouvez quitter la liste à tout moment. Chacun de nos messages porte un lien de désabonnement, celui-ci compris : <a href="${esc(unsubscribeUrl)}" style="color:#0f62fe;">se désabonner en un clic</a>, sans motif à donner ni confirmation à attendre.`,
      ),
      paragraph(
        en
          ? "If you did not subscribe, that same link removes the address from the list. Nothing else was recorded: no name, no browsing history."
          : "Si vous n'êtes pas à l'origine de cette inscription, ce même lien retire l'adresse de la liste. Rien d'autre n'a été enregistré : ni nom, ni historique de navigation.",
        { muted: true },
      ),
    ],
    footnote: footnote(lang, unsubscribeUrl),
  });

  const text = [
    /* Titres en casse ordinaire, et non en capitales.
       Une ligne entièrement capitalisée est un des critères que les filtres
       anti-indésirables pèsent depuis toujours (SpamAssassin la relève sous
       « UPPERCASE_25_50 »), et la version texte d'un message est analysée avec
       autant d'attention que sa version HTML. Le soulignement qui suit donne la
       hiérarchie que les capitales portaient. */
    en ? "Your subscription to the UGPTN newsletter" : "Votre inscription à la lettre d'information de l'UGPTN",
    "=".repeat(52),
    "",
    en
      ? `The address ${email} is now on the mailing list. Each edition reports what changes for the people the project reaches.`
      : `L'adresse ${email} figure désormais sur la liste de diffusion. Chaque édition rend compte de ce qui change pour les personnes que le projet atteint.`,
    "",
    en ? "What each edition covers:" : "Ce que couvre chaque édition :",
    ...RUBRIQUES(en).map((r) => `- ${r.title} : ${r.text}`),
    "",
    en ? "Unsubscribe at any time:" : "Vous désabonner à tout moment :",
    unsubscribeUrl,
    "",
    "--",
    "Unité de Gestion du Projet de Transformation Numérique — RDC",
  ].join("\n");

  /* Message de LISTE : il porte les en-têtes de désabonnement que réclament
     Gmail et Yahoo. Le message de confirmation, lui, n'en porte pas — il
     s'adresse à quelqu'un qui n'est PAS encore sur la liste. */
  return { to: email, subject, html, text, listUnsubscribe: { url: oneClickUrl } };
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
    en ? "Confirm your subscription" : "Confirmez votre inscription",
    "=".repeat(52),
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
  oneClickUrl: string;
}): Mail {
  const { email, lang, unsubscribeUrl, oneClickUrl } = params;
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
    en ? "Unsubscribe from the UGPTN newsletter" : "Désabonnement de la lettre d'information de l'UGPTN",
    "=".repeat(52),
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

  return { to: email, subject, html, text, listUnsubscribe: { url: oneClickUrl } };
}
