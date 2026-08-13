/**
 * E-mail d'ouverture de compte, envoyé à la création depuis le module
 * « Utilisateurs ».
 *
 * ⚠️ AUCUN MOT DE PASSE n'y figure, et c'est un choix de conception, pas un
 * oubli. Better Auth ne conserve qu'une empreinte : le mot de passe saisi par
 * l'administrateur n'existe en clair que le temps de la requête de création.
 * L'écrire dans un e-mail le déposerait en clair dans une boîte de réception,
 * chez un fournisseur tiers, pour une durée indéterminée. Le message porte donc
 * un lien à usage unique, par lequel la personne choisit elle-même son mot de
 * passe — la seule façon de ne jamais faire transiter de secret réutilisable.
 *
 * Le gabarit et les briques viennent de `../layout` : ce fichier ne décrit que
 * le contenu, jamais la mise en page.
 */
import {
  button,
  dataTable,
  esc,
  fallbackLink,
  notice,
  paragraph,
  renderEmail,
} from "../layout";
import type { Mail } from "../send";

export type AccountInvitation = {
  /** Nom affiché du destinataire. */
  name: string;
  /** Adresse qui sert d'identifiant de connexion. */
  email: string;
  /** Libellé du rôle, en français (cf. lib/auth/permissions.ts). */
  roleLabel: string;
  /** Lien à usage unique de définition du mot de passe. */
  setPasswordUrl: string;
  /** Page de connexion de la console, en absolu. */
  signinUrl: string;
  /** Durée de validité du lien, en jours. */
  expiresInDays: number;
};

export function accountInvitationEmail(invitation: AccountInvitation): Mail {
  const { name, email, roleLabel, setPasswordUrl, signinUrl, expiresInDays } = invitation;

  const subject = "Votre accès à la console d'administration UGPTN";

  const html = renderEmail({
    preheader: `Un compte a été ouvert à votre nom. Définissez votre mot de passe pour accéder à la console.`,
    kicker: "Ouverture de compte",
    title: "Votre accès à la console est prêt",
    blocks: [
      paragraph(
        `Bonjour ${esc(name)},<br>Un compte vous a été ouvert sur la console d'administration de l'UGPTN. Voici les informations de connexion qui s'y rattachent.`,
      ),
      dataTable([
        { label: "Identifiant", value: email, mono: true },
        { label: "Rôle", value: roleLabel },
        { label: "Console", value: signinUrl, mono: true },
      ]),
      notice(
        `Pour votre sécurité, aucun mot de passe ne vous est transmis par e-mail. Le bouton ci-dessous ouvre une page où vous choisissez le vôtre ; il est valable ${expiresInDays} jours et ne fonctionne qu'une fois.`,
      ),
      button("Définir mon mot de passe", setPasswordUrl),
      fallbackLink(setPasswordUrl, "Si le bouton ne s'affiche pas, copiez ce lien dans votre navigateur :"),
      paragraph(
        `Une fois votre mot de passe défini, vous vous connecterez à tout moment depuis <a href="${esc(signinUrl)}" style="color:#0f62fe;">la page de connexion</a> avec l'adresse ci-dessus. Les modules auxquels vous avez accès dépendent de votre rôle et des droits que l'administrateur vous a accordés.`,
      ),
      paragraph(
        "Si le lien a expiré, demandez à un administrateur de vous en envoyer un nouveau depuis le module « Utilisateurs ».",
        { muted: true },
      ),
    ],
    footnote:
      "Vous recevez ce message parce qu'un administrateur de l'UGPTN a créé un compte à votre nom. Si vous n'attendiez pas cet accès, ignorez ce message et signalez-le à l'Unité : le lien expirera sans avoir servi.",
  });

  const text = [
    "VOTRE ACCÈS À LA CONSOLE UGPTN",
    "",
    `Bonjour ${name},`,
    "",
    "Un compte vous a été ouvert sur la console d'administration de l'UGPTN.",
    "",
    `Identifiant : ${email}`,
    `Rôle        : ${roleLabel}`,
    `Console     : ${signinUrl}`,
    "",
    "Pour votre sécurité, aucun mot de passe ne vous est transmis par e-mail.",
    `Définissez le vôtre avec ce lien, valable ${expiresInDays} jours et utilisable une seule fois :`,
    setPasswordUrl,
    "",
    "Si le lien a expiré, demandez à un administrateur de vous en envoyer un nouveau.",
    "",
    "--",
    "Unité de Gestion du Projet de Transformation Numérique — RDC",
    "Message automatique, envoyé parce qu'un administrateur a créé un compte à votre nom.",
  ].join("\n");

  return { to: email, subject, html, text };
}
