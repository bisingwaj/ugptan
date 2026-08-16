"use client";

/**
 * Le fichier : ce qu'il est, comment l'ouvrir, comment le remplacer — et, sur
 * une publication rédigée, comment l'attacher ou le retirer.
 *
 * Formulaire SÉPARÉ de celui de la fiche, et non un champ de plus : déposer un
 * fichier renvoie plusieurs mégaoctets au serveur, geste qui n'a rien à faire
 * dans l'enregistrement d'une correction de titre. Le rapprochement est visuel,
 * pas technique — les deux formulaires sont frères, jamais imbriqués (HTML
 * l'interdit).
 *
 * Le remplacement est replié dans un `<details>`. C'est le geste rare et le plus
 * lourd de conséquences de l'écran : le laisser ouvert en permanence, à côté du
 * bouton d'ouverture du fichier, invite à la fausse manœuvre. L'ATTACHEMENT, à
 * l'inverse, est déplié : il n'écrase rien, et une pièce jointe qu'on ne trouve
 * pas est une pièce jointe qui n'existe pas.
 */
import { useActionState, useId, useState } from "react";
import {
  remplacerFichierDocAction, retirerFichierDocAction, type DocFormState,
} from "@/actions/admin-documents";
import { ADMIN_DOCS } from "@/content/admin";
import type { FichierSaisie } from "@/lib/docs/saisie";
import type { DocSupport } from "@/lib/docs/statut";
import {
  ACCEPT_DOC, estMimeDoc, formatLisible, poidsLisible, tailleMaxPour, urlTelechargement,
} from "@/lib/docs/fichier";

const etatInitial: DocFormState = { error: null, ok: null };

export function DocumentFichier({
  id,
  fichier,
  support,
  stockageActif,
}: {
  id: string;
  /** `null` : aucune pièce n'est attachée, le bloc propose d'en déposer une. */
  fichier: FichierSaisie | null;
  support: DocSupport;
  stockageActif: boolean;
}) {
  const t = ADMIN_DOCS;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(remplacerFichierDocAction, etatInitial);
  const [etatRetrait, retirer, retraitEnCours] = useActionState(retirerFichierDocAction, etatInitial);
  const [refus, setRefus] = useState<string | null>(null);

  const redige = support === "REDIGE";
  const erreur = etat.error ?? etatRetrait.error;
  const succes = etat.ok ?? etatRetrait.ok;

  const verifier = (choisi: File | null | undefined) => {
    if (!choisi) {
      setRefus(null);
      return;
    }
    if (!estMimeDoc(choisi.type)) {
      setRefus("Format non accepté. PDF, Word, Excel, PowerPoint, CSV ou image.");
      return;
    }
    const plafond = tailleMaxPour(choisi.type);
    setRefus(
      choisi.size > plafond
        ? `Fichier trop lourd (${poidsLisible(choisi.size)}). Limite : ${poidsLisible(plafond)}.`
        : null,
    );
  };

  /** Le formulaire de dépôt, partagé par l'attachement et le remplacement. */
  const champDepot = (aide: string, libelle: string, enCoursLibelle: string) => (
    <form action={action} className="adm-form" style={{ marginTop: 12 }}>
      <input type="hidden" name="id" value={id} />

      {!stockageActif && <div className="auth-error" role="alert">{t.fichierStockageAbsent}</div>}
      {refus && <div className="auth-error" role="alert">{refus}</div>}

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-fichier`}>{t.fichierChoisir}</label>
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
        <p className="adm-hint" style={{ marginTop: 6 }}>{aide}</p>
      </div>

      <button
        type="submit"
        className="btn btn--outline btn--sm"
        disabled={enCours || !stockageActif || refus !== null}
      >
        {enCours ? enCoursLibelle : libelle}
      </button>
    </form>
  );

  return (
    <div className="adm-panel adm-doc__fichier">
      <div className="label-mono">{redige ? t.blocPieceJointe : t.blocFichier}</div>

      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      {!fichier ? (
        <>
          <p className="adm-hint" style={{ marginTop: 8 }}>{t.fichierAucun}</p>
          {champDepot(t.fichierAttacherAide, t.fichierAttacher, t.fichierAttachement)}
        </>
      ) : (
        <>
          <div className="adm-doc__fichier-tete">
            <span className="adm-doc__ext mono">{formatLisible(fichier.nom, fichier.format)}</span>
            <div style={{ minWidth: 0 }}>
              <div className="adm-doc__nom">{fichier.nom}</div>
              <div className="mono adm-hint">
                {fichier.taille > 0 ? poidsLisible(fichier.taille) : "poids inconnu"}
                {fichier.publicId ? " · hébergé sur le stockage du projet" : " · référence externe"}
              </div>
            </div>
          </div>

          <div className="adm-actions__row">
            <a
              href={fichier.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline btn--sm"
            >
              {t.fichierOuvrir} ↗
            </a>
            <a
              href={urlTelechargement(fichier.url, fichier.nom)}
              className="btn btn--ghost btn--sm"
              // `download` seul ne suffit pas sur une origine tierce : le navigateur
              // l'ignore. C'est l'URL ci-dessus qui porte la demande, l'attribut ne
              // fait qu'annoncer l'intention au lecteur d'écran.
              download
            >
              {t.fichierTelecharger}
            </a>

            {/* Le retrait n'existe que sur une publication rédigée : ailleurs,
                il ne laisserait rien à consulter (cf. actions/admin-documents.ts). */}
            {redige && (
              <form
                action={retirer}
                onSubmit={(event) => {
                  if (!window.confirm(t.fichierRetirerConfirm)) event.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={id} />
                <button type="submit" className="btn btn--ghost btn--sm" disabled={retraitEnCours}>
                  {t.fichierRetirer}
                </button>
              </form>
            )}
          </div>

          <details className="adm-doc__remplacer">
            <summary>{t.fichierRemplacer}</summary>
            {champDepot(t.fichierRemplacerAide, t.fichierRemplacer, t.fichierRemplacement)}
          </details>
        </>
      )}
    </div>
  );
}
