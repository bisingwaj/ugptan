import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_ACTUS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { articleVierge, chargerReferentiels } from "@/lib/actus/edition";
import { ArticleForm } from "@/components/dashboard/actus/ArticleForm";

export const metadata: Metadata = { title: ADMIN_ACTUS.nouveau };

export default async function NouvelArticlePage() {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle (cf. lib/auth/guard.ts).
  await requirePermission("actualites");

  const referentiels = await chargerReferentiels();

  return (
    <>
      <Link href={adminPath("/actualites")} className="adm-back">← {ADMIN_ACTUS.retourListe}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>{ADMIN_ACTUS.nouveau}</h1>
      <p className="adm__lead">
        Rédigez d'abord la version française, puis passez à l'onglet anglais. L'article reste invisible du
        public tant qu'il n'est pas publié.
      </p>

      <div style={{ marginTop: 26 }}>
        <ArticleForm article={articleVierge()} apercuUrl={null} {...referentiels} />
      </div>
    </>
  );
}
