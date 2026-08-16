/**
 * Accusé de réception d'une plainte, adressé à la personne qui a laissé une
 * adresse électronique à l'étape « Coordonnées » du formulaire.
 *
 * Trois partis pris, tous dictés par la position du destinataire — quelqu'un
 * qui vient de confier un litige à une administration et n'a, pour l'instant,
 * qu'un numéro à l'écran :
 *
 *   1. LE NUMÉRO DE RÉFÉRENCE EST L'IDENTIFIANT, et le seul. Le suivi public ne
 *      demande ni compte ni mot de passe : rien à transmettre d'autre, rien à
 *      perdre. Il est isolé dans son propre encadré, répété dans l'objet et
 *      dans la version texte, pour être retrouvable dans une boîte de réception
 *      des mois plus tard.
 *   2. LE DOSSIER EST RECOPIÉ EN ENTIER, description comprise. C'est un choix
 *      opposé à celui de `account-invitation.ts`, et pour la raison inverse :
 *      il ne s'agit pas d'un secret réutilisable mais du propre récit de la
 *      personne, renvoyé à l'adresse qu'elle a elle-même indiquée. Sans cette
 *      copie, elle n'a aucune trace de ce qu'elle a déclaré, alors que c'est
 *      sur cette déclaration que le dossier sera instruit.
 *   3. LES PIÈCES ANNONCÉES SONT DITES POUR CE QU'ELLES SONT : leurs intitulés
 *      seuls sont parvenus à l'Unité (cf. modèle `GrievanceAttachment`). Le
 *      taire laisserait croire que les documents ont été transmis, et la
 *      personne pourrait s'en défaire.
 *
 * Bilingue, dans la langue du formulaire au moment du dépôt : c'est aussi celle
 * dans laquelle l'Unité recontactera la personne.
 */
import { pick, type Lang } from "@/lib/pick";
import {
  SLA_DAYS,
  STAGE_LABEL,
  STAGE_NEXT_STEP,
  STATUS_LABEL,
} from "@/lib/mgp/model";
import {
  button,
  codeBox,
  dataTable,
  esc,
  fallbackLink,
  heading,
  notice,
  numberedList,
  paragraph,
  renderEmail,
  textBlock,
} from "../layout";
import type { Mail } from "../send";

export type GrievanceReceipt = {
  reference: string;
  /** Langue du dépôt (cf. `Grievance.lang`). */
  lang: Lang;
  /** Adresse saisie au formulaire : destinataire du message. */
  email: string;
  /** Libellé de la catégorie, déjà résolu dans la langue du dépôt. */
  categoryLabel: string;
  description: string;
  /** `null` pour un dépôt anonyme. */
  fullName: string | null;
  phone: string | null;
  province: string | null;
  /** Métadonnées des pièces annoncées à l'étape 3. */
  attachments: { name: string; sizeKb: number }[];
  submittedAt: Date;
  /** Échéance de l'engagement des 30 jours, figée au dépôt. */
  dueAt: Date;
  /** Page publique de suivi, en absolu, numéro pré-rempli. */
  trackUrl: string;
};

/**
 * Fuseau figé sur Kinshasa, comme partout ailleurs dans le projet : l'e-mail
 * est composé par le serveur, et un horodatage laissé au fuseau de la machine
 * daterait le dépôt à l'heure de l'hébergeur. `en-GB` et non `en-US` — le site
 * s'adresse d'abord à des lecteurs qui lisent « 23 June 2025 ».
 */
const LOCALE: Record<Lang, string> = { fr: "fr-FR", en: "en-GB" };
const TZ = "Africa/Kinshasa";

const dateTimeFmt: Record<Lang, Intl.DateTimeFormat> = {
  fr: new Intl.DateTimeFormat(LOCALE.fr, { dateStyle: "long", timeStyle: "short", timeZone: TZ }),
  en: new Intl.DateTimeFormat(LOCALE.en, { dateStyle: "long", timeStyle: "short", timeZone: TZ }),
};

const dateFmt: Record<Lang, Intl.DateTimeFormat> = {
  fr: new Intl.DateTimeFormat(LOCALE.fr, { dateStyle: "long", timeZone: TZ }),
  en: new Intl.DateTimeFormat(LOCALE.en, { dateStyle: "long", timeZone: TZ }),
};

export function grievanceReceiptEmail(receipt: GrievanceReceipt): Mail {
  const {
    reference, lang, email, categoryLabel, description, fullName, phone, province,
    attachments, submittedAt, dueAt, trackUrl,
  } = receipt;

  const en = lang === "en";
  const depotDate = dateTimeFmt[lang].format(submittedAt);
  const echeance = dateFmt[lang].format(dueAt);

  const refLabel = en ? "Reference number" : "Numéro de référence";
  const anonyme = en ? "Anonymous submission" : "Dépôt anonyme";

  const subject = en
    ? `Your grievance is registered · ${reference}`
    : `Votre plainte est enregistrée · ${reference}`;

  /* Le tableau reprend le récapitulatif de l'étape 5 du formulaire, dans le
     même ordre : la personne relit ce qu'elle vient de valider. Les lignes sans
     valeur sont retirées plutôt que remplies d'un « non renseigné » — un champ
     laissé vide l'a été volontairement, le souligner serait un reproche. */
  const rows = [
    { label: refLabel, value: reference, mono: true },
    { label: en ? "Submitted on" : "Déposée le", value: depotDate },
    { label: en ? "Category" : "Catégorie", value: categoryLabel },
    { label: en ? "Status" : "État", value: pick(STATUS_LABEL.NOUVELLE, lang) },
    { label: en ? "Stage" : "Étape", value: pick(STAGE_LABEL.RECEPTION, lang) },
    { label: en ? "Response due by" : "Réponse attendue avant le", value: echeance },
    { label: en ? "Identity" : "Identité", value: fullName ?? anonyme },
    { label: en ? "Email" : "E-mail", value: email, mono: true },
    ...(phone ? [{ label: en ? "Phone" : "Téléphone", value: phone, mono: true }] : []),
    ...(province ? [{ label: en ? "Province" : "Province", value: province }] : []),
  ];

  const html = renderEmail({
    lang,
    subtitle: en ? "Grievance mechanism" : "Mécanisme de gestion des plaintes",
    signature: en
      ? "Automated message sent to the address given at submission. Quote your reference number in any exchange."
      : "Message automatique envoyé à l'adresse indiquée lors du dépôt. Citez votre numéro de référence dans tout échange.",
    preheader: en
      ? `Reference number ${reference}. Keep it: it opens the tracking of your case.`
      : `Numéro de référence ${reference}. Conservez-le : il ouvre le suivi de votre dossier.`,
    kicker: en ? "Acknowledgement of receipt" : "Accusé de réception",
    title: en ? "Your grievance is registered" : "Votre plainte est enregistrée",
    blocks: [
      paragraph(
        en
          ? `${fullName ? `Hello ${esc(fullName)},<br>` : "Hello,<br>"}Your grievance reached the Unit on ${esc(depotDate)}, through the form on the UGPTN website. It is registered${fullName ? "" : " as an anonymous submission"} under the number below.`
          : `${fullName ? `Bonjour ${esc(fullName)},<br>` : "Bonjour,<br>"}Votre plainte est parvenue à l'Unité le ${esc(depotDate)}, par le formulaire du site de l'UGPTN. Elle est enregistrée${fullName ? "" : " comme dépôt anonyme"} sous le numéro suivant.`,
      ),
      codeBox(refLabel, reference),
      notice(
        en
          ? "This number is your only tracking credential: there is no account to create and no password to remember. It says nothing about you, and someone who obtained it would see neither your identity nor your account of the facts. Keep it to yourself, and quote it in any exchange with the Unit."
          : "Ce numéro est votre seul identifiant de suivi : il n'y a ni compte à créer, ni mot de passe à retenir. Il ne dit rien de vous, et une personne qui l'obtiendrait n'y verrait ni votre identité ni votre récit des faits. Gardez-le pour vous, et citez-le dans tout échange avec l'Unité.",
      ),
      button(en ? "Track my case" : "Suivre mon dossier", trackUrl),
      fallbackLink(
        trackUrl,
        en
          ? "If the button does not appear, copy this link into your browser:"
          : "Si le bouton ne s'affiche pas, copiez ce lien dans votre navigateur :",
      ),
      heading(en ? "What was recorded" : "Ce qui a été enregistré"),
      dataTable(rows),
      textBlock(en ? "Account of the facts" : "Description des faits", description),
      ...(attachments.length
        ? [
            paragraph(
              en
                ? `You listed ${attachments.length} document${attachments.length > 1 ? "s" : ""}. Their titles alone reached the Unit: the form does not yet carry the files themselves. Keep them, the officer handling your case will ask you for them.`
                : `Vous avez annoncé ${attachments.length} pièce${attachments.length > 1 ? "s" : ""}. Seuls leurs intitulés sont parvenus à l'Unité : le formulaire ne transporte pas encore les fichiers eux-mêmes. Conservez-les, l'agent chargé du dossier vous les demandera.`,
            ),
            numberedList(attachments.map((file) => `${file.name} · ${file.sizeKb} Ko`)),
          ]
        : []),
      heading(en ? "What happens next" : "La suite"),
      paragraph(
        en
          ? `${pick(STAGE_NEXT_STEP.RECEPTION, lang)} The Unit undertakes to respond within ${SLA_DAYS} days, that is by ${esc(echeance)}. Each step is published on the tracking page, along with any message addressed to you.`
          : `${pick(STAGE_NEXT_STEP.RECEPTION, lang)} L'Unité s'engage à vous répondre dans un délai de ${SLA_DAYS} jours, soit avant le ${esc(echeance)}. Chaque étape franchie paraît sur la page de suivi, avec les messages qui vous sont adressés.`,
      ),
      paragraph(
        en
          ? "To add information or correct a detail, reply to this message quoting your reference number. Filing a grievance takes away none of your rights: administrative and judicial remedies remain open in parallel."
          : "Pour compléter votre dépôt ou corriger une information, répondez à ce message en citant votre numéro de référence. Saisir le mécanisme ne vous prive d'aucun droit : les voies administratives et judiciaires restent ouvertes en parallèle.",
        { muted: true },
      ),
    ],
    footnote: en
      ? "You are receiving this message because this address was entered in the grievance form on the UGPTN website. If you did not file this grievance, tell the Unit, quoting the reference number."
      : "Vous recevez ce message parce que cette adresse a été saisie dans le formulaire de plainte du site de l'UGPTN. Si vous n'êtes pas à l'origine de ce dépôt, signalez-le à l'Unité en citant le numéro de référence.",
  });

  const text = [
    en ? "YOUR GRIEVANCE IS REGISTERED" : "VOTRE PLAINTE EST ENREGISTRÉE",
    "",
    en
      ? `${fullName ? `Hello ${fullName},` : "Hello,"}`
      : `${fullName ? `Bonjour ${fullName},` : "Bonjour,"}`,
    en
      ? `Your grievance reached the Unit on ${depotDate}, through the form on the UGPTN website.`
      : `Votre plainte est parvenue à l'Unité le ${depotDate}, par le formulaire du site de l'UGPTN.`,
    "",
    `${refLabel.toUpperCase()} : ${reference}`,
    "",
    en
      ? "This number is your only tracking credential: no account, no password. Keep it to yourself and quote it in any exchange."
      : "Ce numéro est votre seul identifiant de suivi : ni compte, ni mot de passe. Gardez-le pour vous et citez-le dans tout échange.",
    en ? "Track your case:" : "Suivre votre dossier :",
    trackUrl,
    "",
    en ? "WHAT WAS RECORDED" : "CE QUI A ÉTÉ ENREGISTRÉ",
    ...rows.map((row) => `${row.label} : ${row.value}`),
    "",
    en ? "ACCOUNT OF THE FACTS" : "DESCRIPTION DES FAITS",
    description,
    "",
    ...(attachments.length
      ? [
          en
            ? "DOCUMENTS LISTED (titles only: the files themselves were not carried by the form, keep them)"
            : "PIÈCES ANNONCÉES (intitulés seuls : les fichiers n'ont pas été transportés par le formulaire, conservez-les) :",
          ...attachments.map((file, index) => `${index + 1}. ${file.name} · ${file.sizeKb} Ko`),
          "",
        ]
      : []),
    en ? "WHAT HAPPENS NEXT" : "LA SUITE",
    pick(STAGE_NEXT_STEP.RECEPTION, lang),
    en
      ? `The Unit undertakes to respond within ${SLA_DAYS} days, that is by ${echeance}.`
      : `L'Unité s'engage à vous répondre dans un délai de ${SLA_DAYS} jours, soit avant le ${echeance}.`,
    "",
    en
      ? "To add information, reply to this message quoting your reference number."
      : "Pour compléter votre dépôt, répondez à ce message en citant votre numéro de référence.",
    "",
    "--",
    "Unité de Gestion du Projet de Transformation Numérique — RDC",
    en
      ? "Automated message sent to the address given at submission."
      : "Message automatique envoyé à l'adresse indiquée lors du dépôt.",
  ].join("\n");

  return { to: email, subject, html, text };
}
