"use server";

/**
 * Connexion et déconnexion de la console.
 *
 * Ces deux actions ne font QUE déléguer à Better Auth : aucune vérification de
 * mot de passe, aucun jeton forgé, aucun cookie posé à la main. Elles traduisent
 * une soumission de formulaire en appel d'API et une erreur d'API en message
 * lisible, rien de plus.
 *
 * Pourquoi passer par une server action plutôt que par le client Better Auth :
 * c'est la convention du projet (formulaires en `useActionState`), et le mot de
 * passe ne transite alors que dans le corps de l'action, jamais dans une requête
 * fetch émise depuis le navigateur. Le plugin `nextCookies` (cf.
 * lib/auth/server.ts) fait poser le cookie de session par Next.
 *
 * ⚠️ Un fichier "use server" n'exporte que des fonctions async — les types sont
 * effacés à la compilation et restent donc admis.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { ADMIN_LOGIN, safeAdminRedirect } from "@/lib/admin";
import { ensureInitialAdmin } from "@/lib/auth/bootstrap";
import { auth, BANNED_MESSAGE } from "@/lib/auth/server";
import { normalizeEmail } from "@/lib/auth/validate";

/** État renvoyé au formulaire de connexion. */
export type LoginState = { error: string | null };

/** Message unique pour « adresse inconnue » comme pour « mot de passe faux ». */
const INVALID_CREDENTIALS = "Adresse électronique ou mot de passe incorrect.";

/**
 * Traduit l'erreur levée par Better Auth.
 *
 * Un seul message pour tous les refus d'identifiants : distinguer « compte
 * inconnu » de « mot de passe incorrect » livrerait la liste des adresses
 * enregistrées à qui les essaie. Le compte désactivé fait exception — la
 * personne existe, sait qu'elle existe, et doit savoir à qui s'adresser.
 */
function signInMessage(error: unknown): string {
  if (error instanceof APIError) {
    const code = (error.body as { code?: string } | undefined)?.code;
    if (code === "BANNED_USER") return BANNED_MESSAGE;
    return INVALID_CREDENTIALS;
  }

  console.error("[auth] échec technique à la connexion", error);
  return "Le service d'authentification est momentanément indisponible. Réessayez dans un instant.";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const destination = safeAdminRedirect(String(formData.get("next") ?? ""));

  // Première connexion sur une base vierge : provisionne le compte initial.
  await ensureInitialAdmin();

  if (!email || !password) return { error: INVALID_CREDENTIALS };

  try {
    await auth().api.signInEmail({
      body: { email, password },
      // Les en-têtes servent à Better Auth pour horodater la session et y
      // consigner l'adresse d'origine et le navigateur.
      headers: await headers(),
    });
  } catch (error) {
    return { error: signInMessage(error) };
  }

  // redirect() lève NEXT_REDIRECT → hors de tout try/catch, après la connexion.
  redirect(destination);
}

/**
 * Pas de garde ici, délibérément : la déconnexion doit aboutir même sur une
 * session déjà révoquée (compte désactivé entre-temps), sans quoi le cookie
 * mort resterait collé au navigateur. Next contrôle par ailleurs l'origine de
 * toute server action, ce qui ferme la porte au déclenchement par un tiers.
 */
export async function logoutAction(): Promise<void> {
  // Better Auth supprime la session en base ET expire le cookie.
  await auth()
    .api.signOut({ headers: await headers() })
    .catch(() => {
      // Session déjà invalide : il n'y a plus rien à révoquer, on renvoie
      // quand même la personne vers l'écran de connexion.
    });

  redirect(ADMIN_LOGIN);
}
