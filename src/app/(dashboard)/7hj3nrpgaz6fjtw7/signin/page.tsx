import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ADMIN_HOME, NEXT_PARAM, safeAdminRedirect } from "@/lib/admin";
import { ensureInitialAdmin } from "@/lib/auth/bootstrap";
import { getCurrentUser } from "@/lib/auth/guard";
import { ADMIN } from "@/content/admin";
import { AdminLoginForm } from "@/components/dashboard/AdminLoginForm";

export const metadata: Metadata = { title: ADMIN.login.title };

/**
 * Écran de connexion — le pendant exact du garde : aucune page d'inscription
 * n'existe, ni ici ni ailleurs. Les comptes sont créés depuis le module
 * « Utilisateurs » par un administrateur, qui déclenche l'envoi d'une
 * invitation (cf. actions/admin-users.ts).
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Base encore vierge : crée le compte administrateur initial. Sans cela,
  // l'écran serait une porte sans clé (cf. lib/auth/bootstrap.ts).
  await ensureInitialAdmin();

  // Le proxy fait déjà le renvoi, mais il ne couvre pas les chemins contenant
  // un point : la page se garde elle-même, comme toutes les autres.
  if (await getCurrentUser()) redirect(ADMIN_HOME);

  const params = await searchParams;
  const raw = params[NEXT_PARAM];
  const next = safeAdminRedirect(Array.isArray(raw) ? raw[0] : raw);

  // Retour depuis la définition du mot de passe : la personne doit savoir que
  // l'enregistrement a bien eu lieu avant de saisir ses identifiants.
  const notice = params.password === "set" ? ADMIN.setPassword.doneNotice : null;

  return <AdminLoginForm next={next === ADMIN_HOME ? null : next} notice={notice} />;
}
