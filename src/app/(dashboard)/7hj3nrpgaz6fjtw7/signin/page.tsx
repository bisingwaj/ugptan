import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ADMIN_HOME, EXPIRED_PARAM, NEXT_PARAM, safeAdminRedirect } from "@/lib/admin";
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

  /**
   * Deux raisons d'arriver ici avec quelque chose à dire, et une seule place
   * pour l'afficher :
   *
   *   · `password=set` — retour de la définition du mot de passe. La personne
   *     doit savoir que l'enregistrement a eu lieu avant de saisir ses
   *     identifiants ;
   *   · `expire`      — le garde a refusé une session que le cookie laissait
   *     espérer valide (cf. lib/auth/guard.ts). Le dire vaut mieux que de
   *     laisser croire à une déconnexion spontanée.
   *
   * Le premier prime : c'est l'issue d'un geste que la personne vient de poser,
   * là où le second ne fait que qualifier son renvoi. Les deux ne peuvent de
   * toute façon pas se produire au même chargement.
   */
  const notice = params.password === "set"
    ? ADMIN.setPassword.doneNotice
    : params[EXPIRED_PARAM] !== undefined
      ? ADMIN.login.expired
      : null;

  return <AdminLoginForm next={next === ADMIN_HOME ? null : next} notice={notice} />;
}
