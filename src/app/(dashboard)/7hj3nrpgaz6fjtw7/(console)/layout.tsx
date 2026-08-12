import { requireAdmin } from "@/lib/auth/guard";
import { AdminShell } from "@/components/dashboard/AdminShell";

/**
 * Verrou de la coquille : deuxième couche derrière `src/proxy.ts`, et non
 * redondante — le matcher du proxy ignore les chemins contenant un point, et
 * une middleware n'est jamais une frontière d'autorisation fiable.
 *
 * ⚠️ Ce garde protège la COQUILLE, pas les pages : l'App Router les rend en
 * parallèle. Chaque page de la console doit appeler `requireAdmin()` elle-même
 * (cf. lib/auth/guard.ts).
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell session={session}>{children}</AdminShell>;
}
