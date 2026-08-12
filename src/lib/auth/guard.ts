/**
 * Gardes serveur de la console.
 *
 * Deuxième couche, indispensable : `src/proxy.ts` ne s'exécute pas sur les
 * chemins contenant un point (cf. son `matcher`), et une middleware n'est de
 * toute façon jamais une frontière d'autorisation pour les server actions.
 *
 * Différence avec le proxy : ici le compte est RELU EN BASE à chaque requête.
 * Le jeton prouve l'identité, la base décide des droits. Un compte désactivé,
 * rétrogradé ou supprimé perd donc l'accès au chargement suivant, sans qu'on
 * ait à attendre l'expiration de sa session.
 */
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_HOME, ADMIN_LOGIN } from "@/lib/admin";
import { db } from "@/lib/db";
import { can, type AdminRole, type Permission } from "@/lib/auth/permissions";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/** Compte connecté, tel qu'il existe en base à l'instant de la requête. */
export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  permissions: string[];
};

/**
 * `cache()` : une seule vérification HMAC et une seule lecture en base par
 * requête, quel que soit le nombre de gardes traversés (layout + page + action).
 */
export const getCurrentUser = cache(async (): Promise<AdminUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await db().user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      permissions: true,
      isActive: true,
      passwordChangedAt: true,
    },
  });

  if (!user || !user.isActive) return null;

  // Jeton antérieur au dernier changement de mot de passe : session révoquée.
  if (payload.iat < user.passwordChangedAt.getTime()) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as AdminRole,
    permissions: user.permissions,
  };
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
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) redirect(ADMIN_LOGIN);
  return user;
}

/**
 * Variante exigeant un module précis. Renvoie au tableau de bord plutôt qu'à la
 * connexion : le compte est authentifié, c'est son périmètre qui est en cause.
 */
export async function requirePermission(permission: Permission): Promise<AdminUser> {
  const user = await requireAdmin();
  if (!can(user, permission)) redirect(ADMIN_HOME);
  return user;
}

/**
 * Garde des server actions sensibles. Contrairement aux gardes de page, elle
 * lève au lieu de rediriger : une action n'a pas de destination naturelle, et
 * une exception ne peut pas être confondue avec un succès par l'appelant.
 */
export async function assertPermission(permission: Permission): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Session expirée. Reconnectez-vous.");
  if (!can(user, permission)) throw new Error("Droits insuffisants pour cette opération.");
  return user;
}
