import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN_DOCS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { cloudinaryActif } from "@/lib/cloudinary";
import { NAV } from "@/lib/routes";
import { chargerDocument, chargerReferentielsDoc } from "@/lib/docs/edition";
import { DOC_STATUT_LABEL, DOC_TYPE_LABEL } from "@/lib/docs/statut";
import { DocumentActions } from "@/components/dashboard/docs/DocumentActions";
import { DocumentEditeur } from "@/components/dashboard/docs/DocumentEditeur";
import { DocumentFichier } from "@/components/dashboard/docs/DocumentFichier";

export const metadata: Metadata = { title: ADMIN_DOCS.modifier };

type Recherche = { depose?: string };

export default async function ModifierDocumentPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Recherche>;
}) {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("documents");

  const { id } = await props.params;
  const params = await props.searchParams;
  const t = ADMIN_DOCS;

  const [document, { referentiels, assets }] = await Promise.all([
    chargerDocument(id),
    chargerReferentielsDoc(),
  ]);
  if (!document) notFound();

  const enLigne = document.status === "PUBLISHED";
  const archive = document.status === "ARCHIVED";
  const categorieNom =
    referentiels.categories.find((categorie) => categorie.id === document.categoryId)?.nom ?? null;

  /**
   * Lien vers la page publique.
   *
   * Il n'existe que si le document est en ligne : un lien mort sur un brouillon
   * donnerait à croire que la pièce est déjà servie. Deux destinations, selon le
   * support :
   *
   *   · une publication RÉDIGÉE a sa propre adresse de lecture ;
   *   · une pièce TÉLÉVERSÉE n'en a pas — sa fiche est un panneau de la liste,
   *     que le paramètre `doc` ouvre directement
   *     (cf. src/components/docs/RessourcesListe.tsx).
   */
  const publicUrl = !enLigne
    ? null
    : document.support === "REDIGE"
      ? `/fr${NAV.ressources}/${document.slug || document.id}`
      : `/fr${NAV.ressources}?doc=${document.id}`;

  return (
    <>
      <Link href={adminPath("/documents")} className="adm-back">← {t.retourListe}</Link>

      <div className="adm-entete" style={{ marginTop: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="adm__title">{document.titreFr || "(sans titre)"}</h1>
          <div className="adm-entete__meta">
            <span className={`adm-badge adm-statut adm-statut--${document.status.toLowerCase()}`}>
              {DOC_STATUT_LABEL[document.status]}
            </span>

            <span className="adm-badge adm-badge--info">{DOC_TYPE_LABEL[document.type].fr}</span>

            {document.reference && <span className="mono adm-hint">{document.reference}</span>}
            {categorieNom && <span className="adm-hint">{categorieNom}</span>}
            {document.majLe && <span className="mono adm-hint">Modifié le {document.majLe}</span>}

            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-link"
                style={{ fontSize: 13 }}
              >
                Voir sur le site ↗
              </a>
            )}
          </div>
        </div>

        <DocumentActions id={document.id} enLigne={enLigne} archive={archive} />
      </div>

      {params.depose && <div className="adm-ok" role="status" style={{ marginTop: 16 }}>{t.deposeOk}</div>}

      {/* Le fichier a son propre formulaire, posé AVANT celui de la fiche : deux
          `<form>` ne peuvent pas s'imbriquer, et remplacer un fichier n'a rien à
          voir avec l'enregistrement d'un titre (cf. actions/admin-documents.ts). */}
      <div style={{ marginTop: 26 }}>
        <DocumentFichier
          id={document.id}
          fichier={document.fichier}
          support={document.support}
          stockageActif={cloudinaryActif()}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        <DocumentEditeur
          document={document}
          referentiels={referentiels}
          assets={assets}
          categorieNom={categorieNom}
          publicUrl={publicUrl}
        />
      </div>
    </>
  );
}
