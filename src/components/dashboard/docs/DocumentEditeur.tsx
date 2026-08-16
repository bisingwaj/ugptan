"use client";

/**
 * Formulaire de la fiche d'un document déjà créé.
 *
 * Il n'emporte PAS le fichier : celui-ci a son propre formulaire, posé au-dessus
 * par la page (cf. DocumentFichier). Un seul envoi ici, pour toute la fiche —
 * métadonnées ET corps rédigé, dans les deux langues. Contrairement aux articles
 * et aux événements, dont chaque langue s'enregistre séparément parce qu'un
 * traducteur y travaille en parallèle du rédacteur : une pièce documentaire est
 * publiée d'un bloc, par la même personne (cf. DocumentRedaction).
 *
 * Le bloc de rédaction n'apparaît que pour une publication RÉDIGÉE : sur une
 * pièce qui n'existe que par son fichier, l'éditeur n'aurait rien à écrire —
 * et le texte saisi ne serait servi nulle part.
 */
import { useActionState } from "react";
import { enregistrerDocumentAction, type DocFormState } from "@/actions/admin-documents";
import { ADMIN_DOCS } from "@/content/admin";
import type { MediaRef } from "@/lib/medias";
import type { DocumentSaisie, ReferentielsDocSaisie } from "@/lib/docs/saisie";
import { DocumentIdentite, DocumentReglages } from "@/components/dashboard/docs/DocumentChamps";
import { DocumentRedaction } from "@/components/dashboard/docs/DocumentRedaction";
import { DocumentApercu } from "@/components/dashboard/docs/DocumentApercu";

const etatInitial: DocFormState = { error: null, ok: null };

export function DocumentEditeur({
  document,
  referentiels,
  assets,
  categorieNom,
  publicUrl,
}: {
  document: DocumentSaisie & { id: string };
  referentiels: ReferentielsDocSaisie;
  assets: MediaRef[];
  categorieNom: string | null;
  publicUrl: string | null;
}) {
  const t = ADMIN_DOCS;
  const [etat, action, enCours] = useActionState(enregistrerDocumentAction, etatInitial);

  return (
    <form action={action} className="adm-edit">
      <input type="hidden" name="id" value={document.id} />

      <div className="adm-edit__alertes">
        {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
        {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}
      </div>

      <div className="adm-edit__main">
        <div className="adm-edit__form">
          <DocumentIdentite document={document} />

          {document.support === "REDIGE" && (
            <DocumentRedaction
              contenuFr={document.contenuFr}
              contenuEn={document.contenuEn}
              assets={assets}
            />
          )}
        </div>
      </div>

      <aside className="adm-edit__aside">
        <DocumentReglages
          document={document}
          referentiels={referentiels}
          assets={assets}
          avecStatut
        />

        {/* Barre collante : la colonne fait plusieurs écrans de haut, le bouton
            d'enregistrement ne doit pas se chercher. */}
        <div className="adm-edit__barre">
          <button type="submit" className="btn btn--primary" disabled={enCours}>
            {enCours ? t.enregistrement : t.enregistrer}
            {!enCours && <span className="arrow">→</span>}
          </button>

          <DocumentApercu document={document} categorieNom={categorieNom} />

          {publicUrl ? (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
              {t.voirSite}
            </a>
          ) : (
            <span className="adm-hint">{t.voirSiteIndisponible}</span>
          )}
        </div>
      </aside>
    </form>
  );
}
