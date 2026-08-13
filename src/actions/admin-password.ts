"use server";

/**
 * Définition du mot de passe par la personne elle-même, depuis le lien reçu
 * par e-mail.
 *
 * Seule action de la console accessible SANS session — c'est sa raison d'être :
 * on ne peut pas exiger d'être connecté pour obtenir le moyen de se connecter.
 * L'autorisation ne vient donc pas d'un cookie mais du jeton, émis par Better
 * Auth, à usage unique et daté. Tout le contrôle lui appartient : ce fichier ne
 * fait que transmettre.
 */
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { ADMIN_LOGIN } from "@/lib/admin";
import { auth } from "@/lib/auth/server";
import { passwordIssue } from "@/lib/auth/validate";

export type SetPasswordState = { error: string | null };

const INVALID_TOKEN =
  "Ce lien n'est plus valable : il a expiré ou a déjà servi. Demandez à un administrateur de vous en envoyer un nouveau.";

export async function setPasswordAction(
  _prev: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (!token) return { error: INVALID_TOKEN };

  const issue = passwordIssue(password);
  if (issue) return { error: issue };

  if (password !== confirmation) {
    return { error: "Les deux mots de passe saisis ne sont pas identiques." };
  }

  try {
    await auth().api.resetPassword({ body: { token, newPassword: password } });
  } catch (error) {
    if (error instanceof APIError) return { error: INVALID_TOKEN };
    console.error("[auth] échec technique à la définition d'un mot de passe", error);
    return { error: "Le service est momentanément indisponible. Réessayez dans un instant." };
  }

  // Aucune session n'est ouverte au passage : la personne se connecte avec le
  // mot de passe qu'elle vient de choisir, ce qui vérifie du même coup qu'il
  // est bien celui qu'elle croit avoir saisi.
  redirect(`${ADMIN_LOGIN}?password=set`);
}
