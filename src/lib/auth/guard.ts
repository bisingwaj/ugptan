/**
 * Garde serveur de la console.
 *
 * Deuxième couche, indispensable : `src/proxy.ts` ne s'exécute pas sur les
 * chemins contenant un point (cf. son `matcher`), et une middleware n'est de
 * toute façon jamais une frontière d'autorisation pour les server actions.
 */
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_BASE } from "@/lib/admin";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/lib/auth/session";

/** `cache()` : une seule vérification HMAC par requête, quel que soit le nombre d'appels. */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
});

/**
 * À appeler au début de TOUT layout, page et server action de la console.
 *
 * ⚠️ « Aussi dans la page », et pas seulement dans le layout : l'App Router rend
 * layouts et pages EN PARALLÈLE. Un `redirect()` levé par le seul layout arrive
 * trop tard — la page a déjà été rendue et sa charge RSC part dans le corps de
 * la réponse 307. Vérifié : sans ce garde côté page, le contenu du tableau de
 * bord était sérialisé dans la redirection.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect(ADMIN_BASE);
  return session;
}
