/**
 * Vocabulaire des notifications de la console : quels modules en portent, ce
 * que dit leur compte, et où il mène.
 *
 * Module PUR, lu par la coquille serveur comme par la cloche et la barre
 * latérale (composants clients) : il ne tire ni Prisma ni `server-only`. Le
 * calcul des comptes vit à part, dans lib/notifications.ts.
 *
 * Ajouter un module : une clé ici, un compte dans `compterNotifications`, et
 * le geste qui le fait baisser dans ses pages. La cloche, la bulle et la
 * relecture suivent d'elles-mêmes.
 */
import { ADMIN } from "@/content/admin";
import { ADMIN_GRIEVANCES, ADMIN_NEWSLETTER } from "@/lib/admin";
import type { Permission } from "@/lib/auth/permissions";

/** Modules qui portent une bulle, dans l'ordre du menu de la cloche. */
export const NOTIFICATION_KEYS = ["mgp", "newsletter"] as const satisfies readonly Permission[];

export type NotificationKey = (typeof NOTIFICATION_KEYS)[number];

export const estCleNotification = (valeur: string): valeur is NotificationKey =>
  (NOTIFICATION_KEYS as readonly string[]).includes(valeur);

/**
 * Compte par module. `null` : le compte connecté n'a pas le module, il n'en
 * voit donc ni la bulle ni la ligne dans la cloche.
 */
export type Notifications = Record<NotificationKey, number | null>;

/** Carte d'un compte sans aucun module suivi — ou sans session. */
export const AUCUNE_NOTIFICATION: Notifications = { mgp: null, newsletter: null };

export const estSuivi = (n: Notifications): boolean =>
  NOTIFICATION_KEYS.some((cle) => n[cle] !== null);

/** Total affiché sur la cloche, modules non suivis exclus. */
export const totalNotifications = (n: Notifications): number =>
  NOTIFICATION_KEYS.reduce((total, cle) => total + Math.max(0, n[cle] ?? 0), 0);

const LIBELLES: Record<NotificationKey, { none: string; one: string; many: string }> = {
  mgp: {
    none: ADMIN.grievances.unreadNone,
    one: ADMIN.grievances.unreadOne,
    many: ADMIN.grievances.unreadMany,
  },
  newsletter: {
    none: ADMIN.newsletter.nouveauxNone,
    one: ADMIN.newsletter.nouveauxOne,
    many: ADMIN.newsletter.nouveauxMany,
  },
};

/** « 3 plaintes non lues », « 1 nouvelle inscription », « Aucune plainte non lue ». */
export function resumeNotification(cle: NotificationKey, count: number | null): string {
  const libelle = LIBELLES[cle];
  if (!count || count <= 0) return libelle.none;
  return `${count} ${count > 1 ? libelle.many : libelle.one}`;
}

/**
 * Destination d'une ligne de la cloche. Les plaintes filtrent sur les non lues
 * quand il y en a ; la newsletter mène à sa liste, dont l'ouverture suffit à
 * marquer les inscriptions comme vues.
 */
export function lienNotification(cle: NotificationKey, count: number | null): string {
  if (cle === "mgp") return count && count > 0 ? `${ADMIN_GRIEVANCES}?f=non-lues` : ADMIN_GRIEVANCES;
  return ADMIN_NEWSLETTER;
}
