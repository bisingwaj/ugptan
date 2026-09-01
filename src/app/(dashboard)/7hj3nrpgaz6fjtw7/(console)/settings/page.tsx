import type { Metadata } from "next";
import { ADMIN_REGLAGES } from "@/content/admin";
import { requirePermission } from "@/lib/auth/guard";
import { chargerReglages } from "@/lib/reglages/edition";
import { EcranReglages } from "@/components/dashboard/reglages/EcranReglages";

export const metadata: Metadata = { title: ADMIN_REGLAGES.title };

/* L'état de fermeture change hors de cet écran (une autre session, un autre
   administrateur) : le servir depuis un cache montrerait un site ouvert alors
   qu'il vient d'être fermé, sur le seul écran où cette information fait foi. */
export const dynamic = "force-dynamic";

export default async function ReglagesAdminPage() {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle, donc le redirect du layout n'empêche pas cette page d'être
  // rendue et sérialisée.
  await requirePermission("reglages");

  const reglages = await chargerReglages();

  return <EcranReglages reglages={reglages} />;
}
