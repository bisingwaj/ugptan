/**
 * Gardes serveur de la console.
 *
 * Répartition assumée avec `src/proxy.ts` : le proxy fait un tri OPTIMISTE sur
 * la simple présence du cookie de session, sans toucher la base — c'est ce que
 * recommande Better Auth pour une middleware. La vérification qui fait foi est
 * ici, et nulle part ailleurs : `auth.api.getSession` valide le jeton en base
 * et renvoie le compte tel qu'il existe à l'instant de la requête.
 *
 * Deux conséquences de cette lecture en base à chaque requête, toutes deux
 * voulues : un compte désactivé, rétrogradé ou supprimé perd l'accès au
 * chargement suivant, sans attendre l'expiration de sa session ; et le cache de
 * session en cookie reste désactivé côté Better Auth (cf. lib/auth/server.ts).
 *
 * ⚠️ Ces fonctions décident de l'AUTORISATION à partir d'une identité établie
 * par Better Auth. Elles ne vérifient aucun mot de passe et ne posent aucun
 * cookie : tout cela appartient à Better Auth.
 */
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_HOME, ADMIN_LOGIN, EXPIRED_PARAM } from "@/lib/admin";
import { auth } from "@/lib/auth/server";
import { can, isRole, type AdminRole, type Permission } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { estPanneDeLiaison } from "@/lib/errors";
import { lectureConsole } from "@/lib/lecture";

/** Compte connecté, tel qu'il existe en base à l'instant de la requête. */
export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  permissions: string[];
};

/**
 * `cache()` : une seule vérification de session par requête, quel que soit le
 * nombre de gardes traversés (layout + page + action).
 */
export const getCurrentUser = cache(async (): Promise<AdminUser | null> => {
  /**
   * ⚠️ Une PANNE DE BASE n'est pas une absence de session.
   *
   * Cette lecture avalait autrefois toute erreur (`.catch(() => null)`), ce qui
   * revenait à déconnecter la personne dès que le transport vers Neon flanchait.
   * Or il flanche par salves (cf. lib/lecture.ts) : une rédactrice au milieu
   * d'une fiche se retrouvait sur l'écran de connexion, sans rien avoir fait.
   *
   * D'où la distinction, désormais tenue :
   *   · panne de LIAISON  → reprises, puis l'erreur remonte à la frontière de
   *     la console, qui l'affiche avec un bouton « Réessayer ». La session est
   *     intacte, et le dire vaut mieux que de la nier ;
   *   · toute autre erreur → `null`, comme avant. Un cookie illisible ou un
   *     jeton corrompu ne se rejouent pas : la personne n'est pas connectée, et
   *     l'écran de connexion est la bonne destination.
   */
  const entetes = await headers();
  const session = await lectureConsole(
    () => auth().api.getSession({ headers: entetes }),
    "session de la console",
  ).catch((error) => {
    if (estPanneDeLiaison(error)) throw error;
    return null;
  });

  if (!session) return null;

  const user = session.user;

  // Better Auth révoque déjà les sessions d'un compte banni et refuse sa
  // connexion. Le contrôle est répété ici pour que la fenêtre entre le
  // bannissement et la fin de la requête en cours soit nulle.
  if (user.banned && (!user.banExpires || user.banExpires > new Date())) return null;

  // Un rôle inconnu de `permissions.ts` n'ouvre rien : refus plutôt que
  // repli silencieux sur un rôle par défaut.
  if (!isRole(user.role ?? "")) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name || null,
    role: user.role as AdminRole,
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
  };
});

/**
 * Lève si l'absence de session s'explique par une base injoignable.
 *
 * ⚠️ Le `catch` de `getCurrentUser` ne suffit PAS, et il a fallu une panne pour
 * le voir. Better Auth ne laisse jamais sortir l'erreur de son adaptateur : il
 * l'attrape, écrit « ERROR [Better Auth]: INTERNAL_SERVER_ERROR » dans le
 * journal, et rend `null`. Aucune exception n'atteint donc `lectureConsole`,
 * qui ne rejoue rien, ni le `catch`, qui ne distingue rien — et un `null` de
 * PANNE devient indiscernable d'un `null` d'ABSENCE de session. Mesuré sur une
 * liaison instable : `read ECONNRESET` côté Neon, « Session expirée.
 * Reconnectez-vous. » côté rédaction, session pourtant valide.
 *
 * On lève l'ambiguïté en interrogeant la base nous-mêmes : si elle répond,
 * l'absence est réelle ; si elle est injoignable, c'est une panne.
 *
 * ⚠️ À n'appeler QUE depuis les gardes qui refusent une opération. L'écran de
 * connexion, lui, appelle `getCurrentUser` directement et doit continuer de
 * s'afficher base éteinte : c'est précisément là qu'on a besoin de le lire.
 * Une sonde posée plus haut le ferait tomber en erreur.
 *
 * Le coût est nul dans le cas courant : une session valide ne l'atteint jamais.
 * Et il n'y a pas de brèche — cette fonction n'accorde aucun accès, elle choisit
 * seulement entre « déconnecté » et « injoignable ».
 *
 * Sans reprises, volontairement : `lectureConsole` vient d'en dépenser cinq sur
 * la même liaison. Les rejouer doublerait l'attente pour redire ce que la
 * première série a déjà établi.
 */
async function refuserSiBaseInjoignable(): Promise<void> {
  await db().$queryRaw`SELECT 1`;
}

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
  if (user) return user;

  // Pas de session : reste à savoir si c'est la personne qui n'en a plus, ou la
  // base qui n'a pas pu le dire. Renvoyer une rédactrice à l'écran de connexion
  // au milieu d'une salve lui ferait refaire une connexion qui échouerait pour
  // la même raison.
  await refuserSiBaseInjoignable();

  // `EXPIRED_PARAM` : le proxy a laissé passer sur la foi du cookie, la base
  // vient de le démentir. Le marqueur permet à l'écran de connexion de le DIRE,
  // plutôt que d'accueillir la personne comme si elle s'était déconnectée
  // d'elle-même (cf. lib/admin.ts).
  redirect(`${ADMIN_LOGIN}?${EXPIRED_PARAM}=1`);
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
  let user: AdminUser | null;

  try {
    user = await getCurrentUser();
    // Pas de session : la sonde tranche entre une session réellement finie et
    // une base qui n'a pas pu répondre (cf. `refuserSiBaseInjoignable`).
    if (!user) await refuserSiBaseInjoignable();
  } catch (error) {
    // Une panne de liaison ne dit RIEN de la session. Répondre
    // « Reconnectez-vous » enverrait la personne vers un écran de connexion qui
    // échouerait pour la même raison, et lui ferait croire qu'elle a perdu son
    // travail. On refuse l'opération — mais en nommant la vraie cause.
    if (estPanneDeLiaison(error)) {
      throw new Error(
        "Base de données momentanément injoignable. Votre session reste valide : réessayez dans un instant.",
      );
    }
    throw error;
  }

  if (!user) throw new Error("Session expirée. Reconnectez-vous.");
  if (!can(user, permission)) throw new Error("Droits insuffisants pour cette opération.");
  return user;
}
