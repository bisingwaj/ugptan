import type { Metadata } from "next";
import { ADMIN } from "@/content/admin";
import { SetPasswordForm } from "@/components/dashboard/SetPasswordForm";

export const metadata: Metadata = { title: ADMIN.setPassword.title };

/**
 * Définition du mot de passe depuis le lien reçu par e-mail.
 *
 * Deuxième et dernière page du sous-arbre ouverte sans session, avec l'écran de
 * connexion — et pour la même raison : elle sert précisément à obtenir le moyen
 * de se connecter. Le proxy la laisse donc passer (cf. src/proxy.ts).
 *
 * Le jeton n'arrive pas directement de l'e-mail : le lien du message vise
 * `/api/auth/reset-password/<jeton>`, où Better Auth le vérifie avant de
 * rediriger ici avec `?token=` — ou avec `?error=INVALID_TOKEN` s'il est périmé.
 * Un jeton présent dans l'URL a donc DÉJÀ été validé une fois ; il l'est de
 * nouveau à la soumission (cf. actions/admin-password.ts).
 */
export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string; welcome?: string }>;
}) {
  const params = await searchParams;
  // `error` en provenance de Better Auth : le jeton est mort, on n'affiche pas
  // de formulaire qui ne pourrait rien enregistrer.
  const token = params.error ? "" : (params.token ?? "").trim();

  return <SetPasswordForm token={token} welcome={params.welcome === "1"} />;
}
