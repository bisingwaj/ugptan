import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_DOCS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { cloudinaryActif } from "@/lib/cloudinary";
import { ensureCategoriesDoc } from "@/lib/docs/bootstrap";
import { chargerReferentielsDoc, documentVierge } from "@/lib/docs/edition";
import { DocumentDepot } from "@/components/dashboard/docs/DocumentDepot";

export const metadata: Metadata = { title: ADMIN_DOCS.nouveau };

export default async function NouveauDocumentPage() {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle (cf. lib/auth/guard.ts).
  await requirePermission("documents");
  await ensureCategoriesDoc();

  const referentiels = await chargerReferentielsDoc();

  return (
    <>
      <Link href={adminPath("/documents")} className="adm-back">← {ADMIN_DOCS.retourListe}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>{ADMIN_DOCS.nouveau}</h1>
      <p className="adm__lead">
        Le fichier part sur le stockage du projet ; la base n'enregistre que son adresse et les informations
        que vous saisissez ici. Le document est créé en brouillon : vous pourrez le relire et le prévisualiser
        avant de le publier.
      </p>

      <div style={{ marginTop: 26 }}>
        {/* Lu côté serveur : les identifiants de stockage n'ont rien à faire
            dans le navigateur, seule leur PRÉSENCE y est utile. */}
        <DocumentDepot
          document={documentVierge()}
          referentiels={referentiels}
          stockageActif={cloudinaryActif()}
        />
      </div>
    </>
  );
}
