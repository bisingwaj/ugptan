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

/**
 * Deuxième page du sous-arbre ouverte sans session : celle où l'on définit son
 * mot de passe depuis le lien reçu par e-mail. Elle ne peut pas exiger d'être
 * connecté — elle sert justement à obtenir le moyen de l'être. L'autorisation
 * vient du jeton porté par l'URL, vérifié par Better Auth.
 *
 * Déclarée ici, et non dans `lib/auth/server.ts`, pour que `proxy.ts` puisse la
 * lire sans tirer Prisma ni Better Auth dans la middleware.
 */
export const ADMIN_SET_PASSWORD = adminPath("/set-password");

/** Accueil après connexion. */
export const ADMIN_HOME = adminPath("/dashboard");

/** Gestion des comptes. */
export const ADMIN_USERS = adminPath("/users");

/** Plaintes reçues par le mécanisme de gestion des plaintes. */
export const ADMIN_GRIEVANCES = adminPath("/grievances");

/** Abonnés à la lettre d'information. */
export const ADMIN_NEWSLETTER = adminPath("/newsletter");

/** Paramètre de requête portant la page demandée avant la redirection. */
export const NEXT_PARAM = "next";

/**
 * Marqueur posé par le garde quand il refuse une session que le cookie laissait
 * espérer valide (expiration, session révoquée, base réinitialisée).
 *
 * Il ne sert plus qu'à EXPLIQUER : l'écran de connexion s'en sert pour dire
 * pourquoi la personne se retrouve là, au lieu de la laisser croire à une
 * déconnexion spontanée.
 *
 * Il a un temps rompu une boucle de redirection — le proxy renvoyait `/signin`
 * vers le tableau de bord dès qu'un cookie existait, le garde renvoyait le
 * tableau de bord vers `/signin`, sans fin. Ce n'est plus lui qui la tient
 * ouverte : `proxy.ts` ne fait plus sortir de l'écran de connexion, quel que
 * soit le cookie. Retirer ce marqueur ne réveillerait donc pas la boucle ; cela
 * ne ferait que rendre le renvoi muet.
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
