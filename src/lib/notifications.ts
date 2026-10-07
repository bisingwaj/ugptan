import "server-only";

/**
 * Comptes des bulles de notification, pour le compte connecté.
 *
 * Un module n'est compté que si le compte y a accès : un chiffre reste une
 * information, et la bulle d'un module fermé révélerait son activité.
 */
import type { AdminUser } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { grievanceScope, seesGrievances } from "@/lib/mgp/acces";
import { countUnreadGrievances } from "@/lib/mgp/query";
import { compterNouveauxAbonnes } from "@/lib/newsletter/query";
import type { Notifications } from "@/lib/notifications-model";

/**
 * `catch` par module : une bulle n'est qu'une indication, une panne de base ne
 * doit ni faire tomber la coquille ni éteindre les autres comptes. La relecture
 * suivante corrige le chiffre.
 */
const compter = (autorise: boolean, lire: () => Promise<number>): Promise<number | null> =>
  autorise ? lire().catch(() => 0) : Promise.resolve(null);

export async function compterNotifications(user: AdminUser): Promise<Notifications> {
  const [mgp, newsletter] = await Promise.all([
    // Compté dans le périmètre du compte : un signalement EAS/HS ne fait pas
    // monter la bulle d'un agent qui ne peut pas l'ouvrir (cf. lib/mgp/acces.ts).
    compter(seesGrievances(user), () => countUnreadGrievances(grievanceScope(user))),
    compter(can(user, "newsletter"), compterNouveauxAbonnes),
  ]);
  return { mgp, newsletter };
}
