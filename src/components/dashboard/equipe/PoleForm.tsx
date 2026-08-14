"use client";

/**
 * Création et modification d'un pôle.
 *
 * Les deux langues sont saisies ENSEMBLE ici, contrairement aux fiches. Un pôle
 * n'a qu'un nom et une mission d'une ligne : demander deux passages pour deux
 * libellés coûterait plus que de les écrire côte à côte, et le risque
 * qu'invoque le formulaire par langue — un traducteur écrasant une correction
 * faite entre-temps — ne porte pas sur deux mots posés une fois pour toutes.
 */
import { useActionState } from "react";
import {
  creerPoleAction,
  deplacerPoleAction,
  enregistrerPoleAction,
  supprimerPoleAction,
  type EquipeFormState,
} from "@/actions/admin-equipe";
import { ADMIN_EQUIPE } from "@/content/admin";
import type { PoleSaisie } from "@/lib/equipe/saisie";
import { ChampCouleur } from "@/components/dashboard/ChampCouleur";

const etatInitial: EquipeFormState = { error: null, ok: null };

/* -------------------------------------------------------------------------- */
/* Création                                                                    */
/* -------------------------------------------------------------------------- */

export function PoleCreation() {
  const t = ADMIN_EQUIPE;
  const [etat, action, enCours] = useActionState(creerPoleAction, etatInitial);

  return (
    <form action={action} className="adm-panel" style={{ marginTop: 18 }}>
      <div className="label-mono">{t.poleNouveau}</div>

      {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

      <div className="adm-form__grid">
        <div className="adm-form__field">
          <label className="label-mono" htmlFor="pole-nom-fr">{t.poleNom} · {t.poleFr} *</label>
          <input id="pole-nom-fr" name="nomFr" type="text" className="field" maxLength={120} required />
        </div>
        <div className="adm-form__field">
          <label className="label-mono" htmlFor="pole-nom-en">{t.poleNom} · {t.poleEn}</label>
          <input id="pole-nom-en" name="nomEn" type="text" className="field" maxLength={120} />
        </div>
        <div className="adm-form__field">
          <label className="label-mono" htmlFor="pole-mission-fr">{t.poleMission} · {t.poleFr}</label>
          <input id="pole-mission-fr" name="missionFr" type="text" className="field" maxLength={240} />
        </div>
        <div className="adm-form__field">
          <label className="label-mono" htmlFor="pole-mission-en">{t.poleMission} · {t.poleEn}</label>
          <input id="pole-mission-en" name="missionEn" type="text" className="field" maxLength={240} />
        </div>
      </div>

      <p className="adm-hint">{t.poleMissionAide}</p>

      <ChampCouleur label={t.poleCouleur} />

      <div className="adm-actions__row" style={{ marginTop: 12 }}>
        <button type="submit" className="btn btn--primary btn--sm" disabled={enCours}>
          {enCours ? t.enregistrement : t.poleNouveau}
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Modification                                                                */
/* -------------------------------------------------------------------------- */

export function PoleCarte({
  pole,
  premier,
  dernier,
}: {
  pole: PoleSaisie;
  premier: boolean;
  dernier: boolean;
}) {
  const t = ADMIN_EQUIPE;
  const [etat, action, enCours] = useActionState(enregistrerPoleAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(supprimerPoleAction, etatInitial);
  const [, deplacer, deplacementEnCours] = useActionState(deplacerPoleAction, etatInitial);

  const idSuppression = `suppr-pole-${pole.id}`;
  const erreur = etat.error ?? etatSuppression.error;

  return (
    <div className="adm-panel" style={{ marginTop: 14 }}>
      <div className="adm-items__tete">
        <div className="label-mono">{pole.traductions.fr.nom || pole.key}</div>
        <div className="adm-ordre">
          <form action={deplacer}>
            <input type="hidden" name="id" value={pole.id} />
            <input type="hidden" name="sens" value="haut" />
            <button
              type="submit"
              className="btn btn--sm btn--ghost"
              disabled={deplacementEnCours || premier}
              title={t.monter}
            >
              ↑
            </button>
          </form>
          <form action={deplacer}>
            <input type="hidden" name="id" value={pole.id} />
            <input type="hidden" name="sens" value="bas" />
            <button
              type="submit"
              className="btn btn--sm btn--ghost"
              disabled={deplacementEnCours || dernier}
              title={t.descendre}
            >
              ↓
            </button>
          </form>
        </div>
      </div>

      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

      <form action={action}>
        <input type="hidden" name="id" value={pole.id} />

        <div className="adm-form__grid">
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${pole.id}-nom-fr`}>{t.poleNom} · {t.poleFr} *</label>
            <input
              id={`${pole.id}-nom-fr`}
              name="nomFr"
              type="text"
              className="field"
              defaultValue={pole.traductions.fr.nom}
              maxLength={120}
              required
            />
          </div>
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${pole.id}-nom-en`}>{t.poleNom} · {t.poleEn}</label>
            <input
              id={`${pole.id}-nom-en`}
              name="nomEn"
              type="text"
              className="field"
              defaultValue={pole.traductions.en.nom}
              maxLength={120}
            />
          </div>
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${pole.id}-mission-fr`}>{t.poleMission} · {t.poleFr}</label>
            <input
              id={`${pole.id}-mission-fr`}
              name="missionFr"
              type="text"
              className="field"
              defaultValue={pole.traductions.fr.mission}
              maxLength={240}
            />
          </div>
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${pole.id}-mission-en`}>{t.poleMission} · {t.poleEn}</label>
            <input
              id={`${pole.id}-mission-en`}
              name="missionEn"
              type="text"
              className="field"
              defaultValue={pole.traductions.en.mission}
              maxLength={240}
            />
          </div>
        </div>

        <p className="adm-hint">{t.poleEnAide}</p>

        <ChampCouleur defaultValue={pole.color} label={t.poleCouleur} />

        <div className="adm-actions__row" style={{ marginTop: 12 }}>
          <button type="submit" className="btn btn--primary btn--sm" disabled={enCours}>
            {enCours ? t.enregistrement : t.enregistrer}
          </button>
          <button
            type="submit"
            form={idSuppression}
            className="btn btn--danger btn--sm"
            disabled={suppressionEnCours}
          >
            {t.poleSupprimer}
          </button>
          <span className="adm-hint">
            {t.poleMembres} : {pole.membres}
          </span>
        </div>
      </form>

      <form
        id={idSuppression}
        action={suppression}
        hidden
        onSubmit={(event) => {
          if (!window.confirm(t.poleSupprimerConfirm)) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={pole.id} />
      </form>
    </div>
  );
}
