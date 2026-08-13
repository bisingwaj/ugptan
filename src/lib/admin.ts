/**
 * Points d'entrée de la console d'administration.
 *
 * Le segment est volontairement opaque : la console n'est liée depuis nulle part
 * sur le site public. Ce n'est PAS un secret pour autant — le slug est dans le
 * dépôt, dans les manifests de build et dans les logs de déploiement. La vraie
 * barrière est le couple identifiants + session (cf. lib/auth/*).
 *
 * Ce module n'importe rien, exprès : `proxy.ts` comme les composants clients
 * peuvent l'utiliser sans tirer la moindre dépendance crypto ou Prisma.
 */
export const ADMIN_BASE = "/7hj3nrpgaz6fjtw7";

/** Construit un chemin de la console. `slug` vaut "" pour l'index. */
export const adminPath = (slug = "") => `${ADMIN_BASE}${slug}`;

/**
 * Unique page publique du sous-arbre : l'écran de connexion.
 *
 * Source unique du chemin — proxy, gardes et actions le lisent tous ici, donc
 * le déplacer se fait sur cette seule ligne (et le dossier de route).
 */
export const ADMIN_LOGIN = adminPath("/signin");

/** Accueil après connexion. */
export const ADMIN_HOME = adminPath("/tableau-de-bord");

/** Gestion des comptes. */
export const ADMIN_USERS = adminPath("/utilisateurs");

/** Plaintes reçues par le mécanisme de gestion des plaintes. */
export const ADMIN_GRIEVANCES = adminPath("/plaintes");

/** Paramètre de requête portant la page demandée avant la redirection. */
export const NEXT_PARAM = "next";

/**
 * Marqueur posé par le garde quand il refuse une session que le cookie laissait
 * espérer valide.
 *
 * ⚠️ Il n'est pas cosmétique : c'est lui qui ROMPT une boucle de redirection.
 * Le proxy trie sur la seule PRÉSENCE du cookie, le garde de page vérifie la
 * session EN BASE. Un cookie survivant à sa session — expiration, compte
 * supprimé, base réinitialisée — mettait les deux en désaccord permanent : le
 * proxy renvoyait `/signin` vers le tableau de bord, le garde renvoyait le
 * tableau de bord vers `/signin`, indéfiniment (mesuré : 307 en rafale, page
 * jamais rendue). Ce marqueur dit au proxy « la question a déjà été tranchée en
 * base, laisse passer ».
 */
export const EXPIRED_PARAM = "expire";

/**
 * Filtre anti-redirection ouverte : seuls les chemins internes à la console
 * sont acceptés comme destination après connexion. Tout le reste retombe sur
 * le tableau de bord.
 *
 * Refuse aussi `//evil.tld` et `/\evil.tld`, que les navigateurs interprètent
 * comme des URL protocol-relative malgré leur allure de chemin absolu.
 */
export function safeAdminRedirect(target: string | null | undefined): string {
  if (!target || !target.startsWith(ADMIN_BASE)) return ADMIN_HOME;
  if (target.startsWith("//") || target.startsWith("/\\")) return ADMIN_HOME;

  // Une destination pointant vers la connexion elle-même reboucle : on coupe.
  const path = target.split("?")[0].replace(/\/$/, "");
  if (path === ADMIN_LOGIN || path === ADMIN_BASE) return ADMIN_HOME;

  return target;
}
