/**
 * Lectures de la console sur les plaintes, partagées entre la coquille (bulle
 * de notification), la liste des dossiers et les server actions.
 *
 * ⚠️ Aucune de ces fonctions ne vérifie de droit : elles sont appelées derrière
 * un garde (`requirePermission`, `assertPermission`) ou après un `can(…, "mgp")`.
 */
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

/**
 * Dossier que personne n'a encore ouvert dans la console. L'état est partagé
 * par l'équipe (cf. `Grievance.readAt`) : un seul filtre, le même partout, pour
 * que la bulle, le filtre « Non lues » et les lignes en gras disent la même chose.
 */
export const UNREAD_WHERE = { readAt: null } as const satisfies Prisma.GrievanceWhereInput;

/** Nombre de plaintes non lues — la valeur de la bulle. */
export const countUnreadGrievances = (): Promise<number> =>
  db().grievance.count({ where: UNREAD_WHERE });
