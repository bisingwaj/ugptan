"use server";

/**
 * Connexion / déconnexion de la console.
 *
 * ⚠️ Un fichier "use server" ne peut exporter que des fonctions async — les
 * constantes et les types vivent dans `lib/auth/session.ts`.
 *
 * ⚠️ INVARIANT : toute server action de la console commence par
 * `await requireAdmin()`. `src/proxy.ts` laisse volontairement passer les POST
 * (rediriger un POST de server action casse le protocole Flight), donc les
 * actions se protègent elles-mêmes.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_BASE, ADMIN_HOME } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth/guard";
import { verifyPassword } from "@/lib/auth/password";
import {
  newSession,
  sessionCookieOptions,
  signSession,
  SESSION_COOKIE,
  type LoginState,
} from "@/lib/auth/session";

/** Plancher de temps de réponse : un échec ne doit pas se distinguer au chrono. */
const MIN_RESPONSE_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const started = Date.now();
  const password = String(formData.get("password") ?? "");
  const stored = process.env.ADMIN_PASSWORD_HASH;

  if (!stored) {
    console.error("[admin] ADMIN_PASSWORD_HASH n'est pas défini — connexion impossible.");
  }

  const ok = Boolean(stored) && password.length > 0 && (await verifyPassword(password, stored as string));

  const elapsed = Date.now() - started;
  if (elapsed < MIN_RESPONSE_MS) await sleep(MIN_RESPONSE_MS - elapsed);

  if (!ok) return { error: "Identifiants invalides." };

  const token = await signSession(newSession("admin"));
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  // redirect() lève NEXT_REDIRECT → hors de tout try/catch, après le set().
  redirect(ADMIN_HOME);
}

export async function logoutAction(): Promise<void> {
  await requireAdmin();

  // Le path DOIT correspondre à celui de la pose, sinon le navigateur expire un
  // cookie fantôme sur "/" et garde la vraie session.
  (await cookies()).delete({ name: SESSION_COOKIE, path: ADMIN_BASE });

  redirect(ADMIN_BASE);
}
