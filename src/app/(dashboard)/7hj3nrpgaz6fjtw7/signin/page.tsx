import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ADMIN_HOME, EXPIRED_PARAM, NEXT_PARAM, safeAdminRedirect } from "@/lib/admin";
import { ensureInitialAdmin } from "@/lib/auth/bootstrap";
import { getCurrentUser } from "@/lib/auth/guard";
import { ADMIN } from "@/content/admin";
import { AdminLoginForm } from "@/components/dashboard/AdminLoginForm";

export const metadata: Metadata = { title: ADMIN.login.title };

/**
 * Unique page du sous-arbre accessible sans session — le pendant exact du
 * garde : aucune page d'inscription n'existe, ni ici ni ailleurs. Les comptes
 * sont créés depuis le module « Utilisateurs » par un administrateur.
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

  // Marqueur posé par le garde : le cookie a survécu à sa session. On le dit,
  // plutôt que de laisser croire à une déconnexion spontanée (cf. lib/admin.ts).
  const expiree = params[EXPIRED_PARAM] !== undefined;

  return <AdminLoginForm next={next === ADMIN_HOME ? null : next} avis={expiree ? ADMIN.login.expired : null} />;
}
