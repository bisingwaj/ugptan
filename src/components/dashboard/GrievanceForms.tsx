"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addGrievanceNoteAction,
  addGrievanceUpdateAction,
  logGrievanceContactAction,
  type GrievanceActionState,
} from "@/actions/admin-grievances";
import { ADMIN } from "@/content/admin";
import { LIMITS } from "@/lib/mgp/model";

const initialState: GrievanceActionState = { error: null, ok: null };

/** Vide le formulaire après une écriture réussie : le champ reste prêt pour la
 *  suivante, et un double envoi accidentel n'a plus rien à renvoyer. */
function useResetOnSuccess(ok: string | null) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (ok) ref.current?.reset();
  }, [ok]);
  return ref;
}

function Feedback({ state }: { state: GrievanceActionState }) {
  return (
    <>
      {state.error && <div className="auth-error" role="alert">{state.error}</div>}
      {state.ok && <div className="adm-ok" role="status">{state.ok}</div>}
    </>
  );
}

/** Note interne : ne sort jamais de la console. */
export function GrievanceNoteForm({ id }: { id: string }) {
  const t = ADMIN.grievances;
  const [state, formAction, pending] = useActionState(addGrievanceNoteAction, initialState);
  const formRef = useResetOnSuccess(state.ok);

  return (
    <form ref={formRef} action={formAction} className="adm-form">
      <Feedback state={state} />
      <input type="hidden" name="id" value={id} />

      <div className="adm-form__field">
        <label className="label-mono" htmlFor="g-note">{t.noteField}</label>
        <textarea
          id="g-note"
          name="note"
          required
          maxLength={LIMITS.note}
          rows={4}
          className="field"
          style={{ resize: "vertical", lineHeight: 1.6 }}
        />
      </div>

      <div>
        <button type="submit" disabled={pending} className="btn btn--outline">
          {pending ? t.saving : t.noteSubmit}
        </button>
      </div>
    </form>
  );
}

/**
 * Message adressé au plaignant.
 *
 * ⚠️ Le seul écrit de la console qui devient public. Le bouton porte le mot
 * « publier » et l'avertissement est au-dessus du champ, pas en dessous : il
 * doit être lu avant la rédaction, pas après.
 */
export function GrievanceMessageForm({ id }: { id: string }) {
  const t = ADMIN.grievances;
  const [state, formAction, pending] = useActionState(addGrievanceUpdateAction, initialState);
  const formRef = useResetOnSuccess(state.ok);

  return (
    <form ref={formRef} action={formAction} className="adm-form">
      <Feedback state={state} />
      <input type="hidden" name="id" value={id} />

      <div className="adm-form__field">
        <label className="label-mono" htmlFor="g-message">{t.messageField}</label>
        <textarea
          id="g-message"
          name="message"
          required
          maxLength={LIMITS.message}
          rows={4}
          className="field"
          style={{ resize: "vertical", lineHeight: 1.6 }}
        />
      </div>

      <div>
        <button type="submit" disabled={pending} className="btn btn--primary">
          {pending ? t.messageSubmitting : t.messageSubmit}
          {!pending && <span className="arrow">→</span>}
        </button>
      </div>
    </form>
  );
}

/** Journal d'un échange qui a eu lieu hors de l'outil. */
export function GrievanceContactForm({ id, disabled }: { id: string; disabled?: boolean }) {
  const t = ADMIN.grievances;
  const [state, formAction, pending] = useActionState(logGrievanceContactAction, initialState);
  const formRef = useResetOnSuccess(state.ok);

  return (
    <form ref={formRef} action={formAction} className="adm-form">
      <Feedback state={state} />
      <input type="hidden" name="id" value={id} />

      <div className="adm-form__row">
        <div className="adm-form__field">
          <label className="label-mono" htmlFor="g-channel">{t.contactChannel}</label>
          <select id="g-channel" name="channel" className="field" disabled={disabled}>
            {t.contactChannels.map((channel) => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="adm-form__field">
        <label className="label-mono" htmlFor="g-summary">{t.contactSummary}</label>
        <textarea
          id="g-summary"
          name="summary"
          required
          maxLength={LIMITS.note}
          rows={3}
          disabled={disabled}
          className="field"
          style={{ resize: "vertical", lineHeight: 1.6 }}
        />
      </div>

      <div>
        <button type="submit" disabled={pending || disabled} className="btn btn--outline">
          {pending ? t.saving : t.contactSubmit}
        </button>
      </div>
    </form>
  );
}
