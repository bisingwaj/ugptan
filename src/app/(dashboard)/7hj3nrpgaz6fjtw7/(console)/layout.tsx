import { requireAdmin } from "@/lib/auth/guard";
import { AdminShell } from "@/components/dashboard/AdminShell";

/**
 * Plafond de durée des fonctions de la console.
 *
 * Posé sur la COQUILLE et non sur une page : une server action s'exécute sous la
 * configuration du segment depuis lequel elle est appelée, et la relance d'une
 * traduction se déclenche depuis n'importe quel écran d'édition (cf.
 * `BandeauTraduction`). Un plafond posé sur le seul écran « Traductions »
 * laisserait donc les autres au défaut de la plateforme, où une génération de
 * trente secondes est coupée en cours de route.
 *
 * Sans effet sur les pages de lecture, qui répondent en quelques dizaines de
 * millisecondes : c'est un plafond, pas une réservation.
 */
export const maxDuration = 120;

/**
 * Verrou de la coquille : deuxième couche derrière `src/proxy.ts`, et non
 * redondante — le matcher du proxy ignore les chemins contenant un point, et
 * une middleware n'est jamais une frontière d'autorisation fiable.
 *
 * ⚠️ Ce garde protège la COQUILLE, pas les pages : l'App Router les rend en
 * parallèle. Chaque page de la console doit appeler `requireAdmin()` ou
 * `requirePermission()` elle-même (cf. lib/auth/guard.ts).
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <AdminShell user={user}>{children}</AdminShell>;
}
