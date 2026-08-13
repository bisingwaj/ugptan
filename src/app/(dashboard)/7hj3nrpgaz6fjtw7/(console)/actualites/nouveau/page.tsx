import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_ACTUS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { articleVierge, chargerReferentiels } from "@/lib/actus/edition";
import { ArticleCreation } from "@/components/dashboard/actus/ArticleCreation";

export const metadata: Metadata = { title: ADMIN_ACTUS.nouveau };

export default async function NouvelArticlePage() {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle (cf. lib/auth/guard.ts).
  await requirePermission("actualites");

  const { referentiels, assets } = await chargerReferentiels();

  return (
    <>
      <Link href={adminPath("/actualites")} className="adm-back">← {ADMIN_ACTUS.retourListe}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>{ADMIN_ACTUS.nouveau}</h1>
      <p className="adm__lead">
        Rédigez l'article dans une langue. Une fois créé, sa fiche ouvre un formulaire par langue :
        vous — ou un traducteur — y ajouterez les autres versions, chacune enregistrée séparément.
      </p>

      <div style={{ marginTop: 26 }}>
        <ArticleCreation article={articleVierge()} referentiels={referentiels} assets={assets} />
      </div>
    </>
  );
}
