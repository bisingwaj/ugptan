import type { Metadata } from "next";
import { ADMIN_PROJET } from "@/content/admin";
import { requirePermission } from "@/lib/auth/guard";
import { ensureComposantes } from "@/lib/projet/bootstrap";
import { EcranListeComposantes } from "@/components/dashboard/projet/EcranComposantes";

export const metadata: Metadata = { title: ADMIN_PROJET.composantesTitle };

export default async function ComposantesAdminPage(props: {
  searchParams: Promise<{ supprime?: string }>;
}) {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle, donc le redirect du layout n'empêche pas cette page d'être
  // rendue et sérialisée.
  await requirePermission("projet");
  // Reprise du contenu d'origine du site, composante par composante et une
  // seule fois.
  await ensureComposantes();

  return <EcranListeComposantes params={await props.searchParams} />;
}
