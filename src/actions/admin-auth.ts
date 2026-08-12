"use server";

/**
 * Connexion / déconnexion de la console.
 *
 * ⚠️ Un fichier "use server" ne peut exporter que des fonctions async — les
 * constantes et les types vivent dans `lib/auth/session.ts`.
 *
 * ⚠️ INVARIANT : toute server action de la console commence par un garde
 * (`requireAdmin`, `assertPermission`). `src/proxy.ts` laisse volontairement
 * passer les POST — rediriger un POST de server action casse le protocole
 * Flight — donc les actions se protègent elles-mêmes.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_BASE, ADMIN_LOGIN, safeAdminRedirect } from "@/lib/admin";
import { db } from "@/lib/db";
import { ensureInitialAdmin } from "@/lib/auth/bootstrap";
import { burnPasswordTime, verifyPassword } from "@/lib/auth/password";
import type { AdminRole } from "@/lib/auth/permissions";
import { normalizeEmail } from "@/lib/auth/validate";
import {
  newSession,
  sessionCookieOptions,
  signSession,
  SESSION_COOKIE,
  type LoginState,
} from "@/lib/auth/session";

/** Plancher de temps de réponse : un échec ne doit pas se distinguer au chrono. */
const MIN_RESPONSE_MS = 350;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Message unique pour « adresse inconnue » comme pour « mot de passe faux ». */
const INVALID_CREDENTIALS = "Adresse électronique ou mot de passe incorrect.";

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const started = Date.now();

  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const destination = safeAdminRedirect(String(formData.get("next") ?? ""));

  // Première connexion sur une base vierge : provisionne le compte initial.
  await ensureInitialAdmin();

  const user = email
    ? await db().user.findUnique({
        where: { email },
        select: { id: true, email: true, role: true, passwordHash: true, isActive: true },
      })
    : null;

  // Adresse inconnue : on dérive quand même une empreinte, sinon le temps de
  // réponse trahirait l'existence des comptes.
  const ok = user
    ? password.length > 0 && (await verifyPassword(password, user.passwordHash))
    : (await burnPasswordTime(password || "-"), false);

  const elapsed = Date.now() - started;
  if (elapsed < MIN_RESPONSE_MS) await sleep(MIN_RESPONSE_MS - elapsed);

  if (!user || !ok) return { error: INVALID_CREDENTIALS };

  // Contrôlé APRÈS le mot de passe : signalé plus tôt, ce message révélerait
  // quelles adresses correspondent à un compte.
  if (!user.isActive) {
    return { error: "Ce compte est désactivé. Contactez un administrateur." };
  }

  await db().user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = await signSession(
    newSession({ id: user.id, email: user.email, role: user.role as AdminRole }),
  );
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  // redirect() lève NEXT_REDIRECT → hors de tout try/catch, après le set().
  redirect(destination);
}

/**
 * Pas de garde ici, délibérément : la déconnexion doit aboutir même sur une
 * session déjà révoquée (compte désactivé entre-temps), sans quoi le cookie
 * mort resterait collé au navigateur. Next contrôle par ailleurs l'origine de
 * toute server action, ce qui ferme la porte au déclenchement par un tiers.
 */
export async function logoutAction(): Promise<void> {
  // Le path DOIT correspondre à celui de la pose, sinon le navigateur expire un
  // cookie fantôme sur "/" et garde la vraie session.
  (await cookies()).delete({ name: SESSION_COOKIE, path: ADMIN_BASE });

  redirect(ADMIN_LOGIN);
}
