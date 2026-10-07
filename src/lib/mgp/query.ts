/**
 * Lectures de la console sur les plaintes, partagées entre la coquille (bulle
 * de notification), la liste des dossiers et les server actions.
 *
 * ⚠️ Aucune de ces fonctions ne vérifie de droit : elles sont appelées derrière
 * un garde (`requireGrievanceAccess`, `assertGrievanceAccess`) et reçoivent le
 * périmètre du compte (cf. lib/mgp/acces.ts), qu'elles appliquent toujours.
 */
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { within, type GrievanceScope } from "@/lib/mgp/acces";

/**
 * Dossier que personne n'a encore ouvert dans la console. L'état est partagé
 * par l'équipe (cf. `Grievance.readAt`) : un seul filtre, le même partout, pour
 * que la bulle, le filtre « Non lues » et les lignes en gras disent la même chose.
 */
export const UNREAD_WHERE = { readAt: null } as const satisfies Prisma.GrievanceWhereInput;

/**
 * Nombre de plaintes non lues DANS LE PÉRIMÈTRE du compte : la valeur de sa
 * bulle. Un signalement EAS/HS ne fait donc monter que la bulle des comptes
 * habilités, sans quoi le chiffre seul trahirait son arrivée.
 */
export const countUnreadGrievances = (scope: GrievanceScope): Promise<number> =>
  db().grievance.count({ where: within(scope, UNREAD_WHERE) });
