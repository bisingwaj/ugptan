import type { Metadata } from "next";
import { ADMIN_SECTIONS_MODULE } from "@/content/admin";
import { requirePermission } from "@/lib/auth/guard";
import { ensureImpact } from "@/lib/impact/bootstrap";
import { EcranListeSections, type RechercheListe } from "@/components/dashboard/impact/EcranSections";

export const metadata: Metadata = { title: ADMIN_SECTIONS_MODULE.ugptn.title };

export default async function UgptnAdminPage(props: { searchParams: Promise<RechercheListe> }) {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle, donc le redirect du layout n'empêche pas cette page d'être
  // rendue et sérialisée.
  await requirePermission("ugptn");
  // Reprise du contenu d'origine du site, section par section et une seule fois.
  await ensureImpact();

  return <EcranListeSections module="ugptn" params={await props.searchParams} />;
}
