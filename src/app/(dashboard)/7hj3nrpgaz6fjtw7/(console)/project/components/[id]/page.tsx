import type { Metadata } from "next";
import { ADMIN_PROJET } from "@/content/admin";
import { requirePermission } from "@/lib/auth/guard";
import { EcranFicheComposante } from "@/components/dashboard/projet/EcranComposantes";

export const metadata: Metadata = { title: ADMIN_PROJET.composantesTitle };

export default async function ComposanteAdminPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cree?: string }>;
}) {
  await requirePermission("projet");
  const { id } = await props.params;
  return <EcranFicheComposante id={id} params={await props.searchParams} />;
}
