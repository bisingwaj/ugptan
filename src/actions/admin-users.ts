"use server";

/**
 * Gestion des comptes de la console.
 *
 * ⚠️ INVARIANT : chaque action commence par `assertPermission("utilisateurs")`,
 * droit réservé au rôle ADMIN (cf. lib/auth/permissions.ts). Le proxy laisse
 * passer les POST — rediriger un POST de server action casserait le protocole
 * Flight — donc la barrière est ici, et nulle part ailleurs.
 *
 * Trois garde-fous structurent le module, tous vérifiés côté serveur :
 *   1. personne ne se retire à soi-même son propre accès (rôle, désactivation,
 *      suppression) — la console se refermerait sur son unique occupant ;
 *   2. le dernier administrateur actif est intouchable, pour la même raison ;
 *   3. un mot de passe n'est jamais stocké ni renvoyé en clair.
 */
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_USERS, adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { assertPermission } from "@/lib/auth/guard";
import { hashPassword } from "@/lib/auth/password";
import {
  assignablePermissions,
  isRole,
  type AdminRole,
} from "@/lib/auth/permissions";
import {
  newSession,
  sessionCookieOptions,
  signSession,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import { isValidEmail, normalizeEmail, normalizeName, passwordIssue } from "@/lib/auth/validate";

/** État partagé par les formulaires de création et de modification. */
export type UserFormState = { error: string | null; ok: string | null };

const EMAIL_TAKEN = "Cette adresse est déjà associée à un compte.";

/** Code Prisma d'une violation de contrainte d'unicité. */
const UNIQUE_VIOLATION = "P2002";

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: string }).code === UNIQUE_VIOLATION;

/** Rôle soumis, ou `null` si la valeur ne fait pas partie de l'enum. */
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
  return db().user.count({ where: { role: "ADMIN", isActive: true, id: { not: exceptId } } });
}

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
    await db().user.create({
      data: {
        email,
        name,
        role,
        permissions: readPermissions(formData, role),
        passwordHash: await hashPassword(password),
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { error: EMAIL_TAKEN, ok: null };
    throw error;
  }

  revalidatePath(ADMIN_USERS);
  return { error: null, ok: `Compte ${email} créé.` };
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

  if (!id) return { error: "Compte introuvable.", ok: null };
  if (!isValidEmail(email)) return { error: "Adresse électronique invalide.", ok: null };
  if (!role) return { error: "Rôle invalide.", ok: null };

  const target = await db().user.findUnique({
    where: { id },
    select: { id: true, role: true, isActive: true },
  });
  if (!target) return { error: "Compte introuvable.", ok: null };

  const isSelf = target.id === actor.id;

  if (isSelf && role !== target.role) {
    return { error: "Vous ne pouvez pas modifier votre propre rôle.", ok: null };
  }

  // Rétrograder le dernier administrateur actif fermerait la console à tous.
  if (target.role === "ADMIN" && role !== "ADMIN" && target.isActive) {
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

  const passwordFields = changingPassword
    ? { passwordHash: await hashPassword(password), passwordChangedAt: new Date() }
    : {};

  try {
    await db().user.update({
      where: { id },
      data: { email, name, role, permissions: readPermissions(formData, role), ...passwordFields },
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { error: EMAIL_TAKEN, ok: null };
    throw error;
  }

  // Changer son propre mot de passe révoque les jetons antérieurs, y compris
  // celui de la requête en cours : sans réémission, on se déconnecterait soi-même.
  if (isSelf && changingPassword) {
    const token = await signSession(newSession({ id: target.id, email, role }));
    (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  }

  revalidatePath(ADMIN_USERS);
  revalidatePath(adminPath(`/utilisateurs/${id}`));
  return { error: null, ok: "Compte mis à jour." };
}

/**
 * Bascule actif / désactivé. Le compte et son historique sont conservés :
 * seule la porte se ferme, à la requête suivante (cf. lib/auth/guard.ts).
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
  if (!id) return { error: "Compte introuvable.", ok: null };

  if (id === actor.id && !active) {
    return { error: "Vous ne pouvez pas désactiver votre propre compte.", ok: null };
  }

  const target = await db().user.findUnique({ where: { id }, select: { role: true } });
  if (!target) return { error: "Compte introuvable.", ok: null };

  if (!active && target.role === "ADMIN" && (await otherActiveAdmins(id)) === 0) {
    return { error: "Ce compte est le dernier administrateur actif : il ne peut pas être désactivé.", ok: null };
  }

  await db().user.update({ where: { id }, data: { isActive: active } });

  revalidatePath(ADMIN_USERS);
  revalidatePath(adminPath(`/utilisateurs/${id}`));
  return { error: null, ok: active ? "Compte réactivé." : "Compte désactivé." };
}

export async function deleteUserAction(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const actor = await assertPermission("utilisateurs");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Compte introuvable.", ok: null };
  if (id === actor.id) return { error: "Vous ne pouvez pas supprimer votre propre compte.", ok: null };

  const target = await db().user.findUnique({ where: { id }, select: { role: true, isActive: true } });
  if (!target) return { error: "Compte introuvable.", ok: null };

  if (target.role === "ADMIN" && target.isActive && (await otherActiveAdmins(id)) === 0) {
    return { error: "Ce compte est le dernier administrateur actif : il ne peut pas être supprimé.", ok: null };
  }

  await db().user.delete({ where: { id } });

  revalidatePath(ADMIN_USERS);
  // redirect() lève NEXT_REDIRECT : appelé en dernier, hors de tout try/catch.
  redirect(ADMIN_USERS);
}
