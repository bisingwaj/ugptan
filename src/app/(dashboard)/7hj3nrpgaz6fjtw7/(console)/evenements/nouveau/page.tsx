import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_EVTS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { chargerReferentielsEvt, evenementVierge } from "@/lib/events/edition";
import { EvenementCreation } from "@/components/dashboard/events/EvenementCreation";

export const metadata: Metadata = { title: ADMIN_EVTS.nouveau };

export default async function NouvelEvenementPage() {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle (cf. lib/auth/guard.ts).
  await requirePermission("evenements");

  const { referentiels, assets } = await chargerReferentielsEvt();

  return (
    <>
      <Link href={adminPath("/evenements")} className="adm-back">← {ADMIN_EVTS.retourListe}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>{ADMIN_EVTS.nouveau}</h1>
      <p className="adm__lead">
        Annoncez l'événement dans une langue. Une fois créé, sa fiche ouvre un formulaire par langue :
        vous — ou un traducteur — y ajouterez les autres versions, chacune enregistrée séparément.
      </p>

      <div style={{ marginTop: 26 }}>
        <EvenementCreation evenement={evenementVierge()} referentiels={referentiels} assets={assets} />
      </div>
    </>
  );
}
