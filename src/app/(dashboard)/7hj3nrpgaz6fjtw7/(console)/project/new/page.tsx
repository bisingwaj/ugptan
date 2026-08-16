import type { Metadata } from "next";
import { ADMIN_IMPACT } from "@/content/admin";
import { requirePermission } from "@/lib/auth/guard";
import { EcranNouvelleSection } from "@/components/dashboard/impact/EcranSections";

export const metadata: Metadata = { title: ADMIN_IMPACT.nouveau };

export default async function NouvelleSectionProjetPage() {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("projet");

  return <EcranNouvelleSection module="projet" />;
}
