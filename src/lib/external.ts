/**
 * Destinations hébergées hors de notre périmètre.
 *
 * L'espace des soumissionnaires est un back-office tiers : le bouton
 * « Connexion » du site public y renvoie, et la console de l'UGPTN reste, elle,
 * sans lien visible nulle part.
 *
 * ⚠️ `process.env.NEXT_PUBLIC_*` doit être écrit en toutes lettres : la valeur
 * est remplacée textuellement au build. Un accès dynamique
 * (`process.env[nom]`) renverrait `undefined` côté navigateur.
 */
const RAW_BIDDERS_PORTAL_URL = process.env.NEXT_PUBLIC_BIDDERS_PORTAL_URL ?? "";

/**
 * URL de connexion au portail des soumissionnaires, ou `null` si la variable
 * n'est pas renseignée. Le `null` est significatif : chaque appelant masque
 * alors son bouton plutôt que d'afficher un lien mort.
 */
export const BIDDERS_PORTAL_URL: string | null = /^https?:\/\//i.test(RAW_BIDDERS_PORTAL_URL.trim())
  ? RAW_BIDDERS_PORTAL_URL.trim()
  : null;
