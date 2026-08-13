"use client";

/**
 * Écran de dépôt : le fichier ET la fiche, en un seul envoi.
 *
 * Les deux vont ensemble ici, et seulement ici : un document sans fichier n'a
 * pas d'existence, et demander deux étapes à la création laisserait une ligne
 * orpheline derrière chaque abandon. Une fois créé, les deux se modifient
 * séparément (cf. actions/admin-documents.ts).
 *
 * Le contrôle de poids est refait CÔTÉ CLIENT, avant l'envoi. Il ne remplace pas
 * celui du serveur — rien de ce qui vient du navigateur ne fait autorité — il
 * évite d'attendre la fin d'un téléversement de douze mégaoctets pour apprendre
 * qu'il sera refusé.
 */
import { useActionState, useId, useState } from "react";
import { deposerDocumentAction, type DocFormState } from "@/actions/admin-documents";
import { ADMIN_DOCS } from "@/content/admin";
import type { DocumentSaisie, ReferentielsDocSaisie } from "@/lib/docs/saisie";
import { ACCEPT_DOC, estMimeDoc, poidsLisible, tailleMaxPour } from "@/lib/docs/fichier";
import { DocumentIdentite, DocumentReglages } from "@/components/dashboard/docs/DocumentChamps";

const etatInitial: DocFormState = { error: null, ok: null };

export function DocumentDepot({
  document,
  referentiels,
  stockageActif,
}: {
  document: DocumentSaisie;
  referentiels: ReferentielsDocSaisie;
  stockageActif: boolean;
}) {
  const t = ADMIN_DOCS;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(deposerDocumentAction, etatInitial);
  const [refus, setRefus] = useState<string | null>(null);

  const verifier = (fichier: File | null | undefined) => {
    if (!fichier) {
      setRefus(null);
      return;
    }
    if (!estMimeDoc(fichier.type)) {
      setRefus("Format non accepté. PDF, Word, Excel, PowerPoint, CSV ou image.");
      return;
    }
    const plafond = tailleMaxPour(fichier.type);
    setRefus(
      fichier.size > plafond
        ? `Fichier trop lourd (${poidsLisible(fichier.size)}). Limite : ${poidsLisible(plafond)}.`
        : null,
    );
  };

  return (
    <form action={action} className="adm-edit">
      <div className="adm-edit__alertes">
        {!stockageActif && <div className="auth-error" role="alert">{t.fichierStockageAbsent}</div>}
        {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
        {refus && <div className="auth-error" role="alert">{refus}</div>}
      </div>

      <div className="adm-edit__main">
        <div className="adm-edit__form">
          <div className="adm-panel adm-edit__bloc">
            <div className="label-mono">{t.blocFichier}</div>

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-fichier`}>
                {t.fichierChoisir} <span className="adm-edit__requis">obligatoire</span>
              </label>
              <input
                id={`${idBase}-fichier`}
                name="fichier"
                type="file"
                className="field"
                accept={ACCEPT_DOC}
                required
                disabled={!stockageActif}
                onChange={(event) => verifier(event.target.files?.[0])}
              />
              <p className="adm-hint" style={{ marginTop: 6 }}>{t.fichierAide}</p>
            </div>
          </div>

          <DocumentIdentite document={document} />
        </div>
      </div>

      <aside className="adm-edit__aside">
        <DocumentReglages document={document} referentiels={referentiels} />

        <div className="adm-edit__barre">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={enCours || !stockageActif || refus !== null}
          >
            {enCours ? t.depot : t.deposer}
            {!enCours && <span className="arrow">→</span>}
          </button>
          <span className="adm-hint">Enregistré en brouillon, relisible avant mise en ligne.</span>
        </div>
      </aside>
    </form>
  );
}
