import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_EQUIPE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { chargerReferentielsEquipe, membreVierge } from "@/lib/equipe/edition";
import { MembreCreation } from "@/components/dashboard/equipe/MembreCreation";

export const metadata: Metadata = { title: ADMIN_EQUIPE.nouveau };

export default async function NouveauMembrePage() {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle (cf. lib/auth/guard.ts).
  await requirePermission("equipe");

  const { referentiels, assets } = await chargerReferentielsEquipe();

  return (
    <>
      <Link href={adminPath("/equipe")} className="adm-back">← {ADMIN_EQUIPE.retourListe}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>{ADMIN_EQUIPE.nouveau}</h1>
      <p className="adm__lead">
        Renseignez la fonction dans une langue, puis le rattachement de la fiche. Une fois créée, elle
        ouvre un formulaire par langue. Un poste encore à pourvoir se saisit sans nom : le site affiche
        alors son intitulé et une pastille d&apos;initiales.
      </p>

      <div style={{ marginTop: 26 }}>
        <MembreCreation membre={membreVierge()} referentiels={referentiels} assets={assets} />
      </div>
    </>
  );
}
