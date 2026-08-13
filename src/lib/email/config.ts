/**
 * Réglages de l'envoi d'e-mails transactionnels.
 *
 * ⚠️ Module SERVEUR : aucune de ces valeurs n'est préfixée `NEXT_PUBLIC_`, et
 * c'est délibéré — un mot de passe SMTP n'a rien à faire dans le paquet du
 * navigateur.
 *
 * POURQUOI SMTP ET NON UN SERVICE D'ENVOI TIERS
 * L'exigence est que les messages partent de l'adresse officielle de l'Unité,
 * `ugptndrc@gmail.com`. Aucun prestataire d'envoi (Resend, SendGrid, Postmark…)
 * ne peut le faire : ils exigent tous la preuve, par enregistrements DNS, que
 * l'expéditeur contrôle le domaine — et `gmail.com` appartient à Google.
 * Vérifié auprès de Resend, qui répond « 403 · The gmail.com domain is not
 * verified ». La seule façon d'expédier réellement depuis cette adresse est de
 * passer par le serveur de Google lui-même, authentifié par un mot de passe
 * d'application.
 *
 * Les variables sont nommées `SMTP_*` et non `GMAIL_*` : le jour où l'Unité
 * migre vers Google Workspace ou vers son propre domaine, seules les valeurs
 * changent, pas le code.
 *
 * Tant que `SMTP_PASSWORD` n'est pas renseigné, l'envoi est simplement inactif :
 * rien ne casse, et les écrans le disent (cf. actions/admin-users.ts).
 */
import { SITE_URL } from "@/lib/site";

/** Serveur d'envoi. Valeurs par défaut : celles de Gmail. */
export const SMTP_HOST = (process.env.SMTP_HOST || "smtp.gmail.com").trim();

/**
 * 465 = SMTPS, chiffré de bout en bout dès la connexion. Préféré à 587
 * (STARTTLS, qui négocie en clair avant de chiffrer) : le mot de passe
 * d'application ne traverse jamais un canal non chiffré.
 */
export const SMTP_PORT = Number(process.env.SMTP_PORT || 465);

/** Compte authentifié auprès du serveur — l'adresse officielle de l'Unité. */
export const SMTP_USER = (process.env.SMTP_USER || "").trim();

/**
 * Mot de passe d'APPLICATION Google, et jamais le mot de passe du compte :
 * il est révocable seul, ne donne accès qu'à l'envoi, et n'ouvre ni la boîte
 * ni le reste du compte Google.
 *
 * Les espaces sont retirés : Google l'affiche en quatre groupes de quatre
 * caractères, et il se recopie tel quel. Transmis avec ses espaces, le serveur
 * le refuse — panne d'autant plus déroutante que la valeur « a l'air » juste.
 */
export const SMTP_PASSWORD = (process.env.SMTP_PASSWORD ?? "").replace(/\s+/g, "");

/** Nom affiché de l'expéditeur, tel qu'il apparaît dans la boîte de réception. */
const FROM_NAME = (process.env.EMAIL_FROM_NAME || "UGPTN").trim();

/**
 * Adresse d'expédition. Par défaut celle du compte authentifié : Gmail refuse
 * d'expédier au nom d'une autre adresse, sauf alias déclaré dans le compte.
 */
const FROM_ADDRESS = (process.env.EMAIL_FROM_ADDRESS || SMTP_USER).trim();

export const EMAIL_FROM = `${FROM_NAME} <${FROM_ADDRESS}>`;

/**
 * Adresse de réponse, si elle diffère de l'expéditeur. Vide dans la
 * configuration courante : les messages partant déjà de l'adresse officielle,
 * une réponse y arrive naturellement.
 */
export const EMAIL_REPLY_TO = (process.env.EMAIL_REPLY_TO || "").trim() || undefined;

/** `false` : identifiants absents, l'envoi est désactivé et signalé comme tel. */
export const emailConfigured = SMTP_USER.length > 0 && SMTP_PASSWORD.length > 0;

/**
 * Origine servant à composer les liens absolus des e-mails.
 *
 * `BETTER_AUTH_URL` d'abord, et non l'URL publique du site : c'est cette même
 * valeur que Better Auth utilise pour forger le lien de définition du mot de
 * passe. Les deux liens d'un même message doivent viser le même hôte, sans quoi
 * l'un des deux mènerait au mauvais environnement en développement.
 */
export const APP_ORIGIN = (process.env.BETTER_AUTH_URL || SITE_URL).replace(/\/+$/, "");
