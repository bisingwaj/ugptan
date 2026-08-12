/**
 * Destinations hébergées hors de notre périmètre.
 *
 * L'espace des soumissionnaires est un back-office tiers, avec sa propre
 * authentification : le bouton « Connexion » du site public s'y contente d'une
 * redirection. Aucune adresse n'est écrite ici — seulement lue de
 * l'environnement. La console de l'UGPTN reste, elle, sans lien visible nulle
 * part sur le site public.
 *
 * Deux noms sont acceptés pour la même chose : `NEXT_PUBLIC_BIDDERS_PORTAL_URL`,
 * en place dans les déploiements existants, et `NEXT_PUBLIC_SUBMITTERS_ADMIN_LOGIN_URL`,
 * nommé d'après la spécification. Le premier renseigné l'emporte.
 *
 * ⚠️ `process.env.NEXT_PUBLIC_*` doit être écrit en toutes lettres : la valeur
 * est remplacée textuellement au build. Un accès dynamique
 * (`process.env[nom]`) renverrait `undefined` côté navigateur.
 */
const RAW_BIDDERS_PORTAL_URL =
  process.env.NEXT_PUBLIC_BIDDERS_PORTAL_URL ||
  process.env.NEXT_PUBLIC_SUBMITTERS_ADMIN_LOGIN_URL ||
  "";

/**
 * URL de connexion au portail des soumissionnaires, ou `null` si la variable
 * n'est pas renseignée. Le `null` est significatif : chaque appelant masque
 * alors son bouton plutôt que d'afficher un lien mort.
 */
export const BIDDERS_PORTAL_URL: string | null = /^https?:\/\//i.test(RAW_BIDDERS_PORTAL_URL.trim())
  ? RAW_BIDDERS_PORTAL_URL.trim()
  : null;
