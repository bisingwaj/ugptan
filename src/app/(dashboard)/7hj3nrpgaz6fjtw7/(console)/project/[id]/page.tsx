import type { Metadata } from "next";
import { ADMIN_SECTIONS_MODULE } from "@/content/admin";
import { requirePermission } from "@/lib/auth/guard";
import { EcranFicheSection } from "@/components/dashboard/impact/EcranSections";

export const metadata: Metadata = { title: ADMIN_SECTIONS_MODULE.projet.title };

export default async function ModifierSectionProjetPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cree?: string; copie?: string }>;
}) {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("projet");

  const { id } = await props.params;
  return <EcranFicheSection module="projet" id={id} params={await props.searchParams} />;
}
