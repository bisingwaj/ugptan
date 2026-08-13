import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_IMPACT } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { chargerReferentielsImpact, sectionVierge } from "@/lib/impact/edition";
import { ImpactSectionCreation } from "@/components/dashboard/impact/ImpactSectionCreation";

export const metadata: Metadata = { title: ADMIN_IMPACT.nouveau };

export default async function NouvelleSectionImpactPage() {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle (cf. lib/auth/guard.ts).
  await requirePermission("histoires");

  const { referentiels } = await chargerReferentielsImpact();

  return (
    <>
      <Link href={adminPath("/histoires")} className="adm-back">← {ADMIN_IMPACT.retourListe}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>{ADMIN_IMPACT.nouveau}</h1>
      <p className="adm__lead">
        Choisissez où la section s'affiche et quel gabarit dessine ses entrées, puis rédigez son en-tête
        dans une langue. Une fois créée, sa fiche ouvre un formulaire par langue et la liste de ses entrées.
      </p>

      <div style={{ marginTop: 26 }}>
        <ImpactSectionCreation section={sectionVierge()} referentiels={referentiels} />
      </div>
    </>
  );
}
