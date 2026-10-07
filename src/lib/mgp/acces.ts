import "server-only";

/**
 * Cloisonnement des signalements EAS/HS dans la console.
 *
 * Les plaintes ordinaires et les signalements EAS/HS partagent une table, un
 * formulaire et un écran. Ce qui les sépare est un PÉRIMÈTRE DE LECTURE, calculé
 * ici pour le compte connecté et appliqué à CHAQUE requête Prisma qui touche
 * `Grievance` côté console : liste, fiche, compteurs, bulle de notification,
 * tableau de bord, actions de traitement, marquage « lu ». L'interface ne
 * masque rien d'elle-même : un dossier hors périmètre n'est tout simplement
 * jamais lu en base, et une fiche demandée par son identifiant répond 404.
 *
 *   · `mgp`      → plaintes ordinaires, à l'exclusion de la catégorie EAS/HS ;
 *   · `mgp-eas`  → signalements EAS/HS (permission nominative, que le rôle
 *                  ADMIN n'emporte pas : cf. lib/auth/permissions.ts) ;
 *   · les deux   → tout ;
 *   · aucune     → l'écran est fermé (garde), et le filtre ne laisse rien passer.
 *
 * ⚠️ RÈGLE : toute nouvelle lecture de `Grievance` dans la console (export,
 * recherche, statistique) compose son `where` avec `scope.where`, par un `AND`
 * et jamais par un étalement d'objet : un `{ ...scope.where, category }` écrit
 * plus tard écraserait le filtre sans bruit.
 */
import type { Prisma } from "@/generated/prisma/client";
import { assertAccess, requireAccess, type AdminUser } from "@/lib/auth/guard";
import { can, type Grantee } from "@/lib/auth/permissions";
import { EAS_CATEGORY, isEasCategory } from "@/lib/mgp/model";

export type GrievanceScope = {
  /** Plaintes ordinaires (permission `mgp`). */
  ordinary: boolean;
  /** Signalements EAS/HS (permission `mgp-eas`). */
  eas: boolean;
  /** Filtre à composer avec toute requête sur `Grievance`. */
  where: Prisma.GrievanceWhereInput;
};

/** Filtre qui ne retient aucune ligne : `in: []` est toujours faux. */
const NOTHING: Prisma.GrievanceWhereInput = { id: { in: [] } };

export function grievanceScope(actor: Grantee): GrievanceScope {
  const ordinary = can(actor, "mgp");
  const eas = can(actor, "mgp-eas");

  let where: Prisma.GrievanceWhereInput;
  if (ordinary && eas) where = {};
  else if (eas) where = { category: EAS_CATEGORY };
  else if (ordinary) where = { category: { not: EAS_CATEGORY } };
  else where = NOTHING;

  return { ordinary, eas, where };
}

/** Le compte voit-il au moins une partie des dossiers ? */
export const seesGrievances = (actor: Grantee): boolean => {
  const scope = grievanceScope(actor);
  return scope.ordinary || scope.eas;
};

/** Compose un filtre avec le périmètre, sans risque d'écrasement de clé. */
export const within = (
  scope: GrievanceScope,
  where: Prisma.GrievanceWhereInput = {},
): Prisma.GrievanceWhereInput => ({ AND: [scope.where, where] });

/**
 * Qui peut se voir CONFIER un dossier de cette catégorie : un signalement
 * EAS/HS ne s'affecte qu'à un titulaire de `mgp-eas`, une plainte ordinaire
 * qu'à un titulaire de `mgp`. Sans cette règle, l'affectation ferait sortir le
 * dossier du cloisonnement par la liste « Responsable ».
 */
export const canHandleCategory = (actor: Grantee, category: string): boolean =>
  isEasCategory(category) ? can(actor, "mgp-eas") : can(actor, "mgp");

/** Garde de page des écrans « Plaintes » (cf. `requirePermission`). */
export async function requireGrievanceAccess(): Promise<{ user: AdminUser; scope: GrievanceScope }> {
  const user = await requireAccess(seesGrievances);
  return { user, scope: grievanceScope(user) };
}

/** Garde des server actions sur les plaintes (cf. `assertPermission`). */
export async function assertGrievanceAccess(): Promise<{ user: AdminUser; scope: GrievanceScope }> {
  const user = await assertAccess(seesGrievances);
  return { user, scope: grievanceScope(user) };
}
