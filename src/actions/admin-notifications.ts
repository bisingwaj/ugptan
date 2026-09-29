"use server";

/**
 * Relecture des bulles de notification par la coquille de la console.
 *
 * Pas d'`assertPermission` ici, et c'est voulu : la cloche n'appartient à aucun
 * module. Le droit est vérifié module par module dans `compterNotifications`,
 * qui rend `null` pour ce que le compte ne peut pas voir.
 *
 * Sans session, la carte vide plutôt qu'une exception : cette action est
 * appelée toutes les minutes par un onglet resté ouvert, et une session expirée
 * n'a pas à remplir le journal serveur. La prochaine navigation renverra la
 * personne à l'écran de connexion.
 */
import { getCurrentUser } from "@/lib/auth/guard";
import { compterNotifications } from "@/lib/notifications";
import { AUCUNE_NOTIFICATION, type Notifications } from "@/lib/notifications-model";

export async function compterNotificationsAction(): Promise<Notifications> {
  const user = await getCurrentUser();
  if (!user) return AUCUNE_NOTIFICATION;
  return compterNotifications(user);
}
