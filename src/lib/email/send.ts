/**
 * Expédition des e-mails transactionnels, par SMTP.
 *
 * ⚠️ RÈGLE CARDINALE : `sendEmail` ne lève JAMAIS. Un e-mail est une notification,
 * pas une transaction — l'échec du serveur d'envoi ne doit pas défaire
 * l'opération métier qui l'a déclenché. La création d'un compte, par exemple,
 * reste valide même si l'invitation ne part pas ; l'appelant reçoit un résultat
 * et décide de ce qu'il en dit à l'écran (cf. actions/admin-users.ts).
 *
 * Transport instancié PARESSEUSEMENT, comme Prisma et Better Auth : `next build`
 * importe ce module sans disposer des identifiants SMTP. Il est ensuite
 * réutilisé et maintient sa connexion ouverte entre deux envois — ouvrir une
 * session TLS authentifiée à chaque message coûterait une seconde à chaque fois.
 */
import nodemailer, { type Transporter } from "nodemailer";
import {
  EMAIL_FROM,
  EMAIL_REPLY_TO,
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_USER,
  emailConfigured,
} from "./config";

export type SendResult =
  | { ok: true; id: string | null }
  /** `reason` est destiné au journal serveur, jamais à l'utilisateur final. */
  | { ok: false; reason: string; disabled?: boolean };

let transport: Transporter | undefined;

const transporter = (): Transporter =>
  (transport ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    // `secure` sur le port 465 : la connexion est chiffrée dès son ouverture.
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    // Réutilise la connexion d'un envoi à l'autre.
    pool: true,
    maxConnections: 2,
  }));

/**
 * Dernier résultat d'envoi, par destinataire.
 *
 * Sert un cas précis : Better Auth appelle `sendResetPassword` à travers
 * `runInBackgroundOrAwait`, qui ATTEND la promesse mais AVALE son erreur (cf.
 * context/create-context.mjs). L'appelant de `requestPasswordReset` ne peut donc
 * pas savoir si l'e-mail est parti — et annoncerait « invitation envoyée » à
 * tort. Le rappel dépose ici ce qu'il a obtenu, l'appelant vient le relever
 * juste après.
 *
 * Fiable parce que la promesse est ATTENDUE : le résultat est déposé avant le
 * retour de l'endpoint, sans course possible. La clé est l'adresse, donc deux
 * opérations concurrentes ne peuvent se mélanger qu'en visant le même
 * destinataire — auquel cas elles disent la même chose.
 */
const lastResults = new Map<string, SendResult>();

/** Garde-fou : un pic d'envois ne doit pas faire enfler la table indéfiniment. */
const MAX_TRACKED = 200;

/** Relève et efface le résultat associé à `to`. */
export function takeSendResult(to: string): SendResult | undefined {
  const result = lastResults.get(to);
  lastResults.delete(to);
  return result;
}

function remember(to: string, result: SendResult): SendResult {
  if (lastResults.size > MAX_TRACKED) lastResults.clear();
  lastResults.set(to, result);
  return result;
}

export type Mail = {
  to: string;
  subject: string;
  html: string;
  /** Version texte. Exigée : un message sans elle est noté comme indésirable. */
  text: string;
  /**
   * Adresses de désabonnement, pour les envois GROUPÉS uniquement.
   *
   * Renseignées, elles produisent les deux en-têtes que Gmail et Yahoo
   * réclament depuis février 2024 à tout expéditeur d'envois groupés :
   * `List-Unsubscribe` et `List-Unsubscribe-Post`. Le client de messagerie
   * affiche alors son propre bouton « Se désabonner », en tête du message, et
   * son clic part en POST vers `url` (cf. app/api/newsletter/unsubscribe).
   *
   * ⚠️ À NE PAS renseigner sur un message transactionnel — invitation de compte,
   * accusé de plainte, réinitialisation de mot de passe. Ces messages ne
   * relèvent d'aucune liste, et offrir de s'en désabonner n'aurait aucun sens :
   * la personne cesserait de recevoir ce qu'elle a elle-même demandé.
   */
  listUnsubscribe?: {
    /** Adresse HTTPS acceptant le POST du désabonnement en un clic. */
    url: string;
    /** Repli pour les clients qui ne savent que composer un courriel. */
    mailto?: string;
  };
};

export async function sendEmail(mail: Mail): Promise<SendResult> {
  if (!emailConfigured) {
    // Ni erreur ni silence : l'absence d'identifiants est une configuration,
    // pas une panne. On le journalise une fois, en clair, pour qui lit les logs.
    console.warn(
      `[email] identifiants SMTP absents — « ${mail.subject} » non envoyé à ${mail.to}.`,
    );
    return remember(mail.to, {
      ok: false,
      reason: "SMTP_USER ou SMTP_PASSWORD absent",
      disabled: true,
    });
  }

  try {
    const info = await transporter().sendMail({
      from: EMAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(EMAIL_REPLY_TO ? { replyTo: EMAIL_REPLY_TO } : {}),
      ...(mail.listUnsubscribe
        ? {
            headers: {
              /* Ordre voulu : l'adresse HTTPS d'abord. Les clients qui savent
                 faire le désabonnement en un clic lisent la première entrée
                 utilisable ; le `mailto:` ne sert qu'aux plus anciens. */
              "List-Unsubscribe": [
                `<${mail.listUnsubscribe.url}>`,
                ...(mail.listUnsubscribe.mailto ? [`<mailto:${mail.listUnsubscribe.mailto}>`] : []),
              ].join(", "),
              /* La valeur est littérale et imposée par la RFC 8058 : c'est elle
                 qui autorise le client à poster sans confirmation. Sans elle,
                 l'en-tête précédent ne vaut que comme lien ordinaire. */
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              /* Annonce un envoi automatique de liste : les répondeurs
                 d'absence n'y répondent pas, ce qui évite des allers-retours
                 que les filtres comptent contre l'expéditeur. */
              Precedence: "bulk",
            },
          }
        : {}),
    });

    /* `rejected` recense les destinataires que le serveur a refusés alors que
       la connexion, elle, s'est bien passée : sans ce contrôle, un refus
       partiel passerait pour un succès. */
    if (info.rejected?.length) {
      const reason = `destinataire refusé par ${SMTP_HOST} : ${info.rejected.join(", ")}`;
      console.error(`[email] ${reason} (« ${mail.subject} »)`);
      return remember(mail.to, { ok: false, reason });
    }

    /* Trace d'expédition. L'identifiant est celui que porte le message chez le
       destinataire : c'est lui qui permet, en cas de contestation, de
       confirmer qu'une invitation est bien partie et quand. */
    console.info(`[email] « ${mail.subject} » → ${mail.to} · ${info.messageId ?? "sans identifiant"}`);

    return remember(mail.to, { ok: true, id: info.messageId ?? null });
  } catch (error) {
    // Identifiants refusés, validation en deux étapes absente, réseau coupé,
    // quota Google dépassé : tout finit ici.
    console.error(`[email] échec de l'envoi de « ${mail.subject} » → ${mail.to} :`, error);
    return remember(mail.to, {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}
