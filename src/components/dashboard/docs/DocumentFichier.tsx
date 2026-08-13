"use client";

/**
 * Le fichier attaché : ce qu'il est, comment l'ouvrir, comment le remplacer.
 *
 * Formulaire SÉPARÉ de celui de la fiche, et non un champ de plus : remplacer un
 * fichier renvoie plusieurs mégaoctets au serveur, geste qui n'a rien à faire
 * dans l'enregistrement d'une correction de titre. Le rapprochement est visuel,
 * pas technique — les deux formulaires sont frères, jamais imbriqués (HTML
 * l'interdit).
 *
 * Le remplacement est replié dans un `<details>`. C'est le geste rare et le plus
 * lourd de conséquences de l'écran : le laisser ouvert en permanence, à côté du
 * bouton d'ouverture du fichier, invite à la fausse manœuvre.
 */
import { useActionState, useId, useState } from "react";
import { remplacerFichierDocAction, type DocFormState } from "@/actions/admin-documents";
import { ADMIN_DOCS } from "@/content/admin";
import type { FichierSaisie } from "@/lib/docs/saisie";
import {
  ACCEPT_DOC, estMimeDoc, formatLisible, poidsLisible, tailleMaxPour, urlTelechargement,
} from "@/lib/docs/fichier";

const etatInitial: DocFormState = { error: null, ok: null };

export function DocumentFichier({
  id,
  fichier,
  stockageActif,
}: {
  id: string;
  fichier: FichierSaisie;
  stockageActif: boolean;
}) {
  const t = ADMIN_DOCS;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(remplacerFichierDocAction, etatInitial);
  const [refus, setRefus] = useState<string | null>(null);

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

  return (
    <div className="adm-panel adm-doc__fichier">
      <div className="label-mono">{t.blocFichier}</div>

      {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

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
      </div>

      <details className="adm-doc__remplacer">
        <summary>{t.fichierRemplacer}</summary>

        <form action={action} className="adm-form" style={{ marginTop: 12 }}>
          <input type="hidden" name="id" value={id} />

          {!stockageActif && <div className="auth-error" role="alert">{t.fichierStockageAbsent}</div>}
          {refus && <div className="auth-error" role="alert">{refus}</div>}

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-remplacement`}>{t.fichierChoisir}</label>
            <input
              id={`${idBase}-remplacement`}
              name="fichier"
              type="file"
              className="field"
              accept={ACCEPT_DOC}
              required
              disabled={!stockageActif}
              onChange={(event) => verifier(event.target.files?.[0])}
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.fichierRemplacerAide}</p>
          </div>

          <button
            type="submit"
            className="btn btn--outline btn--sm"
            disabled={enCours || !stockageActif || refus !== null}
          >
            {enCours ? t.fichierRemplacement : t.fichierRemplacer}
          </button>
        </form>
      </details>
    </div>
  );
}
