/**
 * Point d'entrée de la console d'administration.
 *
 * Le segment est volontairement opaque : la console n'est liée depuis nulle part
 * sur le site public. Ce n'est PAS un secret pour autant — le slug est dans le
 * dépôt, dans les manifests de build et dans les logs de déploiement. La vraie
 * barrière est le mot de passe (cf. lib/auth/*).
 *
 * Ce module n'importe rien, exprès : `proxy.ts` comme les composants clients
 * peuvent l'utiliser sans tirer la moindre dépendance crypto.
 */
export const ADMIN_BASE = "/7hj3nrpgaz6fjtw7";

/** Construit un chemin de la console. `slug` vaut "" pour l'index (connexion). */
export const adminPath = (slug = "") => `${ADMIN_BASE}${slug}`;

/** Accueil après connexion. */
export const ADMIN_HOME = adminPath("/tableau-de-bord");
