/**
 * Préférence d'affichage de la barre latérale : repliée ou dépliée.
 *
 * Stockée dans un cookie et non dans `localStorage`, pour une raison précise :
 * le serveur doit connaître l'état AVANT le premier rendu. Une lecture côté
 * client ne serait faite qu'après hydratation, et la barre s'afficherait
 * d'abord dépliée avant de se replier sous les yeux de l'utilisateur.
 * Les pages de la console sont déjà rendues à la demande (cookie de session),
 * cette lecture supplémentaire ne coûte donc aucun rendu statique.
 *
 * Les deux largeurs, elles, sont figées dans `styles/dashboard.css` : elles
 * relèvent du design system, pas d'un réglage utilisateur.
 */
import { ADMIN_BASE } from "@/lib/admin";

export const SIDEBAR_COOKIE = "adm_side";

/** `"1"` pour repliée. Toute autre valeur vaut dépliée. */
export const parseSidebarCollapsed = (raw: string | undefined): boolean => raw === "1";

/**
 * Cookie non `HttpOnly` : c'est une préférence d'affichage, écrite par le
 * navigateur lui-même. Cantonné au chemin de la console, comme celui de
 * session, pour ne jamais partir avec les requêtes du site public.
 */
export const sidebarCookieValue = (collapsed: boolean): string =>
  [
    `${SIDEBAR_COOKIE}=${collapsed ? "1" : "0"}`,
    `Path=${ADMIN_BASE}`,
    "Max-Age=31536000",
    "SameSite=Lax",
  ].join("; ");
