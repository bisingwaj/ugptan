"use client";

/**
 * Une demande de participation dans la console : son état, sa note interne, sa
 * suppression.
 *
 * Le formulaire d'arbitrage porte AUSSI la note : les deux se décident au même
 * moment (« liste d'attente, salle pleine »), et les séparer obligerait à
 * enregistrer deux fois pour consigner une seule décision.
 *
 * Le formulaire de SUPPRESSION est un frère, jamais un descendant : imbriquer
 * deux `<form>` n'est pas permis en HTML, le navigateur en écarterait un.
 */
import { useActionState, useId } from "react";
import {
  statuerInscriptionAction,
  supprimerInscriptionAction,
  type EvtFormState,
} from "@/actions/admin-evenements";
import { ADMIN_EVTS } from "@/content/admin";
import {
  INSCRIPTION_STATUSES, INSCRIPTION_LABEL, type InscriptionStatut,
} from "@/lib/events/inscription";

const etatInitial: EvtFormState = { error: null, ok: null };

export type InscriptionItem = {
  id: string;
  nom: string;
  email: string;
  organisation: string | null;
  telephone: string | null;
  message: string | null;
  locale: string;
  statut: InscriptionStatut;
  note: string | null;
  recueLe: string | null;
};

export function InscriptionLigne({ item }: { item: InscriptionItem }) {
  const t = ADMIN_EVTS;
  const [etat, statuer, enCours] = useActionState(statuerInscriptionAction, etatInitial);
  const [etatSuppr, supprimer, suppressionEnCours] = useActionState(supprimerInscriptionAction, etatInitial);

  const idBase = useId();
  const idSuppression = `suppr-inscr-${item.id}`;
  const erreur = etat.error ?? etatSuppr.error;
  const succes = etat.ok ?? etatSuppr.ok;

  return (
    <div className="adm-taxo__bloc">
      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      <div className="adm-inscr__tete">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>
            {item.nom}
            <span className={`adm-badge adm-inscr adm-inscr--${item.statut.toLowerCase()}`}>
              {INSCRIPTION_LABEL[item.statut]}
            </span>
          </div>
          <div className="adm-table__sub">
            <a href={`mailto:${item.email}`} className="adm-link">{item.email}</a>
            {item.telephone && <> · {item.telephone}</>}
            {item.organisation && <> · {item.organisation}</>}
          </div>
        </div>
        <span className="mono adm-table__meta">
          {item.recueLe} · {item.locale.toUpperCase()}
        </span>
      </div>

      {item.message && <p className="adm-inscr__message">{item.message}</p>}

      <form action={statuer} className="adm-inscr__form">
        <input type="hidden" name="id" value={item.id} />

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-statut`}>{t.inscrStatut}</label>
          <select id={`${idBase}-statut`} name="statut" className="field" defaultValue={item.statut}>
            {INSCRIPTION_STATUSES.map((valeur) => (
              <option key={valeur} value={valeur}>{INSCRIPTION_LABEL[valeur]}</option>
            ))}
          </select>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-note`}>{t.inscrNote}</label>
          <input
            id={`${idBase}-note`}
            name="note"
            type="text"
            className="field"
            defaultValue={item.note ?? ""}
            placeholder={t.inscrNotePlaceholder}
          />
        </div>

        <div className="adm-actions__row">
          <button type="submit" className="btn btn--primary btn--sm" disabled={enCours}>
            {enCours ? t.enregistrement : t.enregistrer}
          </button>
          <button
            type="submit"
            form={idSuppression}
            className="btn btn--danger btn--sm"
            disabled={suppressionEnCours}
          >
            {t.supprimer}
          </button>
        </div>
      </form>

      <form
        id={idSuppression}
        action={supprimer}
        hidden
        onSubmit={(event) => {
          if (!window.confirm(t.inscrSupprimerConfirm)) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={item.id} />
      </form>
    </div>
  );
}
