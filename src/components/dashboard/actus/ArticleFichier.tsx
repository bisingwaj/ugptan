"use client";

/**
 * Le PDF joint à un article : le déposer, l'ouvrir, le remplacer, le retirer.
 *
 * Même dispositif que le fichier d'un document publié (cf.
 * dashboard/docs/DocumentFichier.tsx), réduit au PDF : c'est le format du texte
 * officiel d'un communiqué. Formulaire SÉPARÉ de la fiche, pour qu'une
 * correction de date ne renvoie pas plusieurs mégaoctets au serveur.
 *
 * Le remplacement est replié dans un `<details>` : c'est le geste rare, et il
 * casse les liens déjà partagés vers l'ancien fichier.
 */
import { useActionState, useId, useState } from "react";
import {
  joindrePdfArticleAction, retirerPdfArticleAction, type ActuFormState,
} from "@/actions/admin-actualites";
import { ADMIN_ACTUS } from "@/content/admin";
import type { ArticleSaisie } from "@/lib/actus/saisie";
import { MIME_PDF } from "@/lib/actus/fichier";
import { poidsLisible, tailleMaxPour, urlTelechargement } from "@/lib/docs/fichier";

const etatInitial: ActuFormState = { error: null, ok: null };

export function ArticleFichier({
  id,
  fichier,
  stockageActif,
}: {
  id: string;
  fichier: ArticleSaisie["fichier"];
  stockageActif: boolean;
}) {
  const t = ADMIN_ACTUS;
  const idBase = useId();
  const [etat, joindre, envoiEnCours] = useActionState(joindrePdfArticleAction, etatInitial);
  const [etatRetrait, retirer, retraitEnCours] = useActionState(retirerPdfArticleAction, etatInitial);
  const [refus, setRefus] = useState<string | null>(null);

  const erreur = etat.error ?? etatRetrait.error;
  const succes = etat.ok ?? etatRetrait.ok;

  const verifier = (choisi: File | null | undefined) => {
    if (!choisi) return setRefus(null);
    if (choisi.type !== MIME_PDF) return setRefus(t.pdfRefusFormat);
    const plafond = tailleMaxPour(choisi.type);
    setRefus(
      choisi.size > plafond
        ? `Fichier trop lourd (${poidsLisible(choisi.size)}). Limite : ${poidsLisible(plafond)}.`
        : null,
    );
  };

  const champDepot = (libelle: string, aide: string) => (
    <form action={joindre} className="adm-form" style={{ marginTop: 12 }}>
      <input type="hidden" name="id" value={id} />
      {!stockageActif && <div className="auth-error" role="alert">{t.pdfStockageAbsent}</div>}
      {refus && <div className="auth-error" role="alert">{refus}</div>}
      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-pdf`}>{t.pdfChoisir}</label>
        <input
          id={`${idBase}-pdf`}
          name="fichier"
          type="file"
          className="field"
          accept={`${MIME_PDF},.pdf`}
          required
          disabled={!stockageActif}
          onChange={(event) => verifier(event.target.files?.[0])}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{aide}</p>
      </div>
      <button
        type="submit"
        className="btn btn--outline btn--sm"
        disabled={envoiEnCours || !stockageActif || refus !== null}
      >
        {envoiEnCours ? t.pdfEnvoi : libelle}
      </button>
    </form>
  );

  return (
    <div className="adm-panel adm-doc__fichier">
      <div className="label-mono">{t.pdfBloc}</div>

      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      {!fichier ? (
        <>
          <p className="adm-hint" style={{ marginTop: 8 }}>{t.pdfAucun}</p>
          {champDepot(t.pdfJoindre, t.pdfAide)}
        </>
      ) : (
        <>
          <div className="adm-doc__fichier-tete">
            <span className="adm-doc__ext mono">PDF</span>
            <div style={{ minWidth: 0 }}>
              <div className="adm-doc__nom">{fichier.nom}</div>
              <div className="mono adm-hint">
                {fichier.taille > 0 ? poidsLisible(fichier.taille) : "poids inconnu"}
              </div>
            </div>
          </div>

          <div className="adm-actions__row">
            <a href={fichier.url} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">
              {t.pdfOuvrir} ↗
            </a>
            <a href={urlTelechargement(fichier.url, fichier.nom)} className="btn btn--ghost btn--sm" download>
              {t.pdfTelecharger}
            </a>
            <form
              action={retirer}
              onSubmit={(event) => {
                if (!window.confirm(t.pdfRetirerConfirm)) event.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={id} />
              <button type="submit" className="btn btn--ghost btn--sm" disabled={retraitEnCours}>
                {t.pdfRetirer}
              </button>
            </form>
          </div>

          <details className="adm-doc__remplacer">
            <summary>{t.pdfRemplacer}</summary>
            {champDepot(t.pdfRemplacer, t.pdfRemplacerAide)}
          </details>
        </>
      )}
    </div>
  );
}
