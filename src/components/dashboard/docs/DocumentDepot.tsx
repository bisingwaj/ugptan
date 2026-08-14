"use client";

/**
 * Écran de création — le support d'abord, la fiche ensuite.
 *
 * ─── Pourquoi le support se choisit ICI, et pas plus tard ────────────────────
 *
 * Il commande tout le reste de l'écran : un document téléversé exige son
 * fichier dès la création (une ligne sans fichier serait une fiche qui ne mène
 * nulle part), une publication rédigée n'en veut pas — son corps s'écrit dans
 * l'éditeur, à l'écran suivant. Demander les deux en même temps produirait un
 * formulaire dont la moitié est toujours hors sujet.
 *
 * Le corps ne se saisit pas ici, et c'est délibéré : rédiger un rapport prend
 * plusieurs séances. La fiche est créée en brouillon, puis le texte s'écrit et
 * s'enregistre autant de fois qu'il le faut sur l'écran de modification.
 *
 * Le contrôle de poids est refait CÔTÉ CLIENT, avant l'envoi. Il ne remplace pas
 * celui du serveur — rien de ce qui vient du navigateur ne fait autorité — il
 * évite d'attendre la fin d'un téléversement de douze mégaoctets pour apprendre
 * qu'il sera refusé.
 */
import { useActionState, useId, useState } from "react";
import { deposerDocumentAction, type DocFormState } from "@/actions/admin-documents";
import { ADMIN_DOCS } from "@/content/admin";
import type { MediaRef } from "@/lib/medias";
import type { DocumentSaisie, ReferentielsDocSaisie } from "@/lib/docs/saisie";
import { ACCEPT_DOC, estMimeDoc, poidsLisible, tailleMaxPour } from "@/lib/docs/fichier";
import { DOC_SUPPORTS, DOC_SUPPORT_HINT, DOC_SUPPORT_LABEL, type DocSupport } from "@/lib/docs/statut";
import { DocumentIdentite, DocumentReglages } from "@/components/dashboard/docs/DocumentChamps";

const etatInitial: DocFormState = { error: null, ok: null };

export function DocumentDepot({
  document,
  referentiels,
  assets,
  stockageActif,
}: {
  document: DocumentSaisie;
  referentiels: ReferentielsDocSaisie;
  assets: MediaRef[];
  stockageActif: boolean;
}) {
  const t = ADMIN_DOCS;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(deposerDocumentAction, etatInitial);
  const [support, setSupport] = useState<DocSupport>(document.support);
  const [refus, setRefus] = useState<string | null>(null);

  const televerse = support === "FICHIER";

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
        {/* Le stockage n'est indispensable qu'au téléversement : une publication
            rédigée se crée même sans lui. */}
        {televerse && !stockageActif && (
          <div className="auth-error" role="alert">{t.fichierStockageAbsent}</div>
        )}
        {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
        {refus && <div className="auth-error" role="alert">{refus}</div>}
      </div>

      <div className="adm-edit__main">
        <div className="adm-edit__form">
          <fieldset className="adm-panel adm-edit__bloc">
            <legend className="label-mono">{t.blocSupport}</legend>
            <p className="adm-hint" style={{ marginBottom: 12 }}>{t.blocSupportAide}</p>

            <div className="adm-supports">
              {DOC_SUPPORTS.map((valeur) => (
                <label key={valeur} className={`adm-support${support === valeur ? " is-on" : ""}`}>
                  <input
                    type="radio"
                    name="support"
                    value={valeur}
                    checked={support === valeur}
                    onChange={() => { setSupport(valeur); setRefus(null); }}
                  />
                  <span>
                    <strong>{DOC_SUPPORT_LABEL[valeur]}</strong>
                    <span className="adm-hint">{DOC_SUPPORT_HINT[valeur]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {televerse && (
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
          )}

          <DocumentIdentite document={{ ...document, support }} />
        </div>
      </div>

      <aside className="adm-edit__aside">
        <DocumentReglages
          document={{ ...document, support }}
          referentiels={referentiels}
          assets={assets}
        />

        <div className="adm-edit__barre">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={enCours || (televerse && (!stockageActif || refus !== null))}
          >
            {enCours
              ? televerse ? t.depot : t.creation
              : televerse ? t.deposer : t.creer}
            {!enCours && <span className="arrow">→</span>}
          </button>
          <span className="adm-hint">
            {televerse
              ? "Enregistré en brouillon, relisible avant mise en ligne."
              : "Créé en brouillon. Le texte s'écrit à l'écran suivant, autant de fois qu'il le faut."}
          </span>
        </div>
      </aside>
    </form>
  );
}
