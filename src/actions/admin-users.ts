"use server";

/**
 * Gestion des comptes de la console.
 *
 * ⚠️ INVARIANT : chaque action commence par `assertPermission("utilisateurs")`,
 * droit réservé au rôle ADMIN (cf. lib/auth/permissions.ts). Le proxy laisse
 * passer les POST — rediriger un POST de server action casserait le protocole
 * Flight — donc la barrière est ici, et nulle part ailleurs.
 *
 * Toute écriture touchant à l'identité passe par le plugin `admin` de Better
 * Auth : création, mot de passe, rôle, adresse, désactivation, suppression.
 * Rien n'est écrit à la main dans les tables d'authentification, et les
 * sessions du compte visé sont révoquées par Better Auth quand elles doivent
 * l'être (désactivation, suppression).
 *
 * Les appels portent les en-têtes de la requête : Better Auth revérifie donc
 * de son côté que l'appelant est bien administrateur. Double contrôle assumé —
 * notre garde décide de l'accès au module, le sien de l'accès à l'API.
 *
 * Trois garde-fous propres au projet s'ajoutent aux siens :
 *   1. personne ne se retire à soi-même son propre accès (rôle, désactivation,
 *      suppression) — la console se refermerait sur son unique occupant ;
 *   2. le dernier administrateur actif est intouchable, pour la même raison ;
 *   3. un mot de passe n'est jamais lu, stocké ni renvoyé en clair.
 */
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { ADMIN_USERS, adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { assertPermission } from "@/lib/auth/guard";
import { auth, SET_PASSWORD_REDIRECT } from "@/lib/auth/server";
import { assignablePermissions, isRole, type AdminRole } from "@/lib/auth/permissions";
import { isValidEmail, normalizeEmail, normalizeName, passwordIssue } from "@/lib/auth/validate";
import { emailConfigured } from "@/lib/email/config";
import { takeSendResult } from "@/lib/email/send";

/** État partagé par les formulaires de création et de modification. */
export type UserFormState = { error: string | null; ok: string | null };

const EMAIL_TAKEN = "Cette adresse est déjà associée à un compte.";
const NOT_FOUND = "Compte introuvable.";

/** Codes Better Auth signalant une adresse déjà prise. */
const TAKEN_CODES = new Set([
  "USER_ALREADY_EXISTS",
  "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
]);

/**
 * Traduit l'erreur d'un appel Better Auth en message affichable.
 *
 * Les refus attendus (adresse prise, compte absent) deviennent des messages ;
 * tout le reste est journalisé et présenté comme une panne, sans exposer le
 * détail technique dans l'interface.
 */
function apiMessage(error: unknown, fallback: string): string {
  if (error instanceof APIError) {
    const code = (error.body as { code?: string } | undefined)?.code;
    if (code && TAKEN_CODES.has(code)) return EMAIL_TAKEN;
    if (code === "USER_NOT_FOUND") return NOT_FOUND;
    if (code === "PASSWORD_TOO_SHORT" || code === "PASSWORD_TOO_LONG") {
      return "Le mot de passe ne respecte pas la longueur exigée.";
    }
  }

  console.error("[admin] échec d'une opération sur un compte", error);
  return fallback;
}

/** Rôle soumis, ou `null` si la valeur ne fait pas partie des rôles connus. */
function readRole(formData: FormData): AdminRole | null {
  const raw = String(formData.get("role") ?? "");
  return isRole(raw) ? raw : null;
}

/**
 * Permissions cochées, réduites à celles qu'on a le droit d'accorder à ce rôle.
 * Le filtrage compte : les cases envoyées par le navigateur sont, comme toute
 * entrée de formulaire, une proposition et non une décision.
 */
function readPermissions(formData: FormData, role: AdminRole): string[] {
  const allowed = new Set<string>(assignablePermissions(role));
  return formData
    .getAll("permissions")
    .map(String)
    .filter((permission) => allowed.has(permission));
}

/** Nombre d'administrateurs actifs, hors compte désigné. */
async function otherActiveAdmins(exceptId: string): Promise<number> {
  return db().user.count({ where: { role: "ADMIN", banned: false, id: { not: exceptId } } });
}

/**
 * Envoie à `email` le message d'ouverture de compte : identifiants, adresse de
 * la console et lien à usage unique pour choisir son mot de passe.
 *
 * ⚠️ N'échoue JAMAIS bruyamment. Un e-mail qui ne part pas est un désagrément,
 * pas une raison d'annuler la création d'un compte déjà enregistré : la
 * fonction rapporte ce qui s'est passé, l'appelant l'affiche, et rien n'est
 * défait. C'est Better Auth qui émet le jeton et compose le lien ; le contenu
 * du message vit dans lib/email/templates/account-invitation.ts.
 */
type InvitationOutcome = "sent" | "disabled" | "failed";

async function sendInvitation(email: string): Promise<InvitationOutcome> {
  if (!emailConfigured) return "disabled";

  try {
    await auth().api.requestPasswordReset({
      // Chemin relatif : `originCheck` l'accepte sans exiger que l'origine
      // figure dans les origines de confiance (cf. lib/auth/server.ts).
      body: { email, redirectTo: SET_PASSWORD_REDIRECT },
    });
  } catch (error) {
    console.error(`[admin] invitation non émise pour ${email} :`, error);
    return "failed";
  }

  /* L'appel ci-dessus répond « succès » même quand l'e-mail n'est pas parti :
     Better Auth avale l'erreur du rappel d'envoi. Le verdict se lit donc dans
     le registre alimenté par `sendEmail`, relevé ici (cf. lib/email/send.ts).
     Un registre vide signifie que le rappel n'a pas eu lieu — adresse inconnue,
     par exemple : on ne prétend pas alors avoir envoyé quoi que ce soit. */
  const result = takeSendResult(email);
  if (!result) {
    console.error(`[admin] aucun envoi consigné pour ${email} : invitation probablement non émise.`);
    return "failed";
  }
  if (result.ok) return "sent";
  return result.disabled ? "disabled" : "failed";
}

/** Ce que l'écran annonce après une création, selon le sort de l'invitation. */
const invitationNote: Record<InvitationOutcome, string> = {
  sent: "Une invitation vient de lui être envoyée pour qu'il définisse son mot de passe.",
  disabled:
    "L'envoi d'e-mails n'est pas configuré : communiquez vous-même ses identifiants et son mot de passe initial.",
  failed:
    "En revanche, l'invitation n'a pas pu être envoyée. Renvoyez-la depuis la fiche du compte, ou transmettez le mot de passe initial autrement.",
};

export async function createUserAction(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await assertPermission("utilisateurs");

  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const name = normalizeName(formData.get("name"));
  const role = readRole(formData);

  if (!isValidEmail(email)) return { error: "Adresse électronique invalide.", ok: null };
  if (!role) return { error: "Rôle invalide.", ok: null };

  const issue = passwordIssue(password);
  if (issue) return { error: issue, ok: null };

  try {
    // C'est Better Auth qui hache le mot de passe et crée le moyen de connexion.
    // `name` est requis de son côté : l'adresse en tient lieu si le champ est
    // laissé vide, plutôt que d'imposer une saisie de plus.
    await auth().api.createUser({
      body: {
        email,
        password,
        name: name ?? email,
        role,
        data: { permissions: readPermissions(formData, role) },
      },
      headers: await headers(),
    });
  } catch (error) {
    return { error: apiMessage(error, "La création du compte a échoué."), ok: null };
  }

  // Après la création, jamais avant : le compte existe désormais quoi qu'il
  // advienne de l'e-mail.
  const outcome = await sendInvitation(email);

  revalidatePath(ADMIN_USERS);
  return { error: null, ok: `Compte ${email} créé. ${invitationNote[outcome]}` };
}

/**
 * Renvoie l'invitation à un compte existant : lien expiré, e-mail égaré,
 * adresse corrigée. Émet un nouveau jeton, qui invalide le précédent.
 */
export async function resendInvitationAction(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await assertPermission("utilisateurs");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: NOT_FOUND, ok: null };

  const target = await db().user.findUnique({ where: { id }, select: { email: true, banned: true } });
  if (!target) return { error: NOT_FOUND, ok: null };
  if (target.banned) {
    return { error: "Ce compte est désactivé : réactivez-le avant de lui renvoyer une invitation.", ok: null };
  }

  const outcome = await sendInvitation(target.email);
  if (outcome === "disabled") {
    return { error: "L'envoi d'e-mails n'est pas configuré (RESEND_API_KEY absente).", ok: null };
  }
  if (outcome === "failed") {
    return { error: "L'invitation n'a pas pu être envoyée. Consultez le journal du serveur.", ok: null };
  }

  return { error: null, ok: `Invitation renvoyée à ${target.email}.` };
}

export async function updateUserAction(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const actor = await assertPermission("utilisateurs");

  const id = String(formData.get("id") ?? "");
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const name = normalizeName(formData.get("name"));
  const role = readRole(formData);

  if (!id) return { error: NOT_FOUND, ok: null };
  if (!isValidEmail(email)) return { error: "Adresse électronique invalide.", ok: null };
  if (!role) return { error: "Rôle invalide.", ok: null };

  const target = await db().user.findUnique({
    where: { id },
    select: { id: true, role: true, banned: true },
  });
  if (!target) return { error: NOT_FOUND, ok: null };

  const isSelf = target.id === actor.id;

  if (isSelf && role !== target.role) {
    return { error: "Vous ne pouvez pas modifier votre propre rôle.", ok: null };
  }

  // Rétrograder le dernier administrateur actif fermerait la console à tous.
  if (target.role === "ADMIN" && role !== "ADMIN" && !target.banned) {
    if ((await otherActiveAdmins(target.id)) === 0) {
      return { error: "Ce compte est le dernier administrateur actif : son rôle ne peut pas être abaissé.", ok: null };
    }
  }

  // Mot de passe laissé vide : on conserve l'actuel. Le champ n'est jamais
  // pré-rempli, faute de quoi il faudrait le renvoyer au navigateur.
  const changingPassword = password.length > 0;
  if (changingPassword) {
    const issue = passwordIssue(password);
    if (issue) return { error: issue, ok: null };
  }

  const requestHeaders = await headers();

  try {
    await auth().api.adminUpdateUser({
      body: {
        userId: id,
        data: { name: name ?? email, email, role, permissions: readPermissions(formData, role) },
      },
      headers: requestHeaders,
    });

    if (changingPassword) {
      // Better Auth remplace l'empreinte du moyen de connexion « credential »,
      // ou en crée un s'il n'en existait pas encore.
      await auth().api.setUserPassword({
        body: { userId: id, newPassword: password },
        headers: requestHeaders,
      });
    }
  } catch (error) {
    return { error: apiMessage(error, "La mise à jour du compte a échoué."), ok: null };
  }

  revalidatePath(ADMIN_USERS);
  revalidatePath(adminPath(`/users/${id}`));
  return { error: null, ok: "Compte mis à jour." };
}

/**
 * Bascule actif / désactivé, portée par le bannissement de Better Auth : le
 * compte et son historique sont conservés, ses sessions sont révoquées sur-le-
 * champ et toute nouvelle connexion est refusée tant que la mesure dure.
 *
 * Renvoie l'erreur au lieu de la lever : un garde-fou franchi est un refus
 * ordinaire, à afficher dans la page, pas une panne à confier à la frontière
 * d'erreur de Next.
 */
export async function setUserActiveAction(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const actor = await assertPermission("utilisateurs");

  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "1";
  if (!id) return { error: NOT_FOUND, ok: null };

  if (id === actor.id && !active) {
    return { error: "Vous ne pouvez pas désactiver votre propre compte.", ok: null };
  }

  const target = await db().user.findUnique({ where: { id }, select: { role: true } });
  if (!target) return { error: NOT_FOUND, ok: null };

  if (!active && target.role === "ADMIN" && (await otherActiveAdmins(id)) === 0) {
    return { error: "Ce compte est le dernier administrateur actif : il ne peut pas être désactivé.", ok: null };
  }

  const requestHeaders = await headers();

  try {
    if (active) {
      await auth().api.unbanUser({ body: { userId: id }, headers: requestHeaders });
    } else {
      await auth().api.banUser({ body: { userId: id }, headers: requestHeaders });
    }
  } catch (error) {
    return { error: apiMessage(error, "Le changement d'état du compte a échoué."), ok: null };
  }

  revalidatePath(ADMIN_USERS);
  revalidatePath(adminPath(`/users/${id}`));
  return { error: null, ok: active ? "Compte réactivé." : "Compte désactivé." };
}

export async function deleteUserAction(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const actor = await assertPermission("utilisateurs");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: NOT_FOUND, ok: null };
  if (id === actor.id) return { error: "Vous ne pouvez pas supprimer votre propre compte.", ok: null };

  const target = await db().user.findUnique({ where: { id }, select: { role: true, banned: true } });
  if (!target) return { error: NOT_FOUND, ok: null };

  if (target.role === "ADMIN" && !target.banned && (await otherActiveAdmins(id)) === 0) {
    return { error: "Ce compte est le dernier administrateur actif : il ne peut pas être supprimé.", ok: null };
  }

  try {
    // Supprime le compte, ses sessions et ses moyens de connexion. Les dossiers
    // MGP qu'il portait ne sont pas emportés (relation en `SetNull`), et
    // l'historique conserve son nom (cf. GrievanceEvent.authorLabel).
    await auth().api.removeUser({ body: { userId: id }, headers: await headers() });
  } catch (error) {
    return { error: apiMessage(error, "La suppression du compte a échoué."), ok: null };
  }

  revalidatePath(ADMIN_USERS);
  // redirect() lève NEXT_REDIRECT : appelé en dernier, hors de tout try/catch.
  redirect(ADMIN_USERS);
}
