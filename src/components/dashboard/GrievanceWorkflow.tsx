"use client";

import { useActionState } from "react";
import { updateGrievanceAction, type GrievanceActionState } from "@/actions/admin-grievances";
import { ADMIN } from "@/content/admin";
import {
  GRIEVANCE_PRIORITIES,
  GRIEVANCE_STAGES,
  GRIEVANCE_STATUSES,
  PRIORITY_LABEL,
  STAGE_LABEL,
  STATUS_LABEL,
  type GrievancePriority,
  type GrievanceStage,
  type GrievanceStatus,
} from "@/lib/mgp/model";

const initialState: GrievanceActionState = { error: null, ok: null };

export type AssignableUser = { id: string; label: string };

/**
 * Qualification et traitement d'un dossier : les quatre décisions qui le font
 * avancer, dans un seul formulaire.
 *
 * Réunies plutôt qu'éclatées en quatre boutons parce qu'elles se prennent
 * ensemble — on qualifie, on affecte et on avance d'une étape dans le même
 * geste. La server action, elle, journalise chaque champ séparément : ce qui
 * est commode à saisir n'a pas à être grossier à relire.
 */
export function GrievanceWorkflow({
  id,
  status,
  stage,
  priority,
  assigneeId,
  users,
}: {
  id: string;
  status: GrievanceStatus;
  stage: GrievanceStage;
  priority: GrievancePriority;
  assigneeId: string | null;
  users: AssignableUser[];
}) {
  const t = ADMIN.grievances;
  const [state, formAction, pending] = useActionState(updateGrievanceAction, initialState);

  return (
    <form action={formAction} className="adm-form">
      {state.error && <div className="auth-error" role="alert">{state.error}</div>}
      {state.ok && <div className="adm-ok" role="status">{state.ok}</div>}

      <input type="hidden" name="id" value={id} />

      <div className="adm-form__row">
        <div className="adm-form__field">
          <label className="label-mono" htmlFor="g-status">{t.fieldStatus}</label>
          <select id="g-status" name="status" defaultValue={status} className="field">
            {GRIEVANCE_STATUSES.map((value) => (
              <option key={value} value={value}>{STATUS_LABEL[value].fr}</option>
            ))}
          </select>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor="g-stage">{t.fieldStage}</label>
          <select id="g-stage" name="stage" defaultValue={stage} className="field">
            {GRIEVANCE_STAGES.map((value, i) => (
              <option key={value} value={value}>{i + 1}. {STAGE_LABEL[value].fr}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="adm-form__row">
        <div className="adm-form__field">
          <label className="label-mono" htmlFor="g-priority">{t.fieldPriority}</label>
          <select id="g-priority" name="priority" defaultValue={priority} className="field">
            {GRIEVANCE_PRIORITIES.map((value) => (
              <option key={value} value={value}>{PRIORITY_LABEL[value]}</option>
            ))}
          </select>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor="g-assignee">{t.fieldAssignee}</label>
          <select id="g-assignee" name="assigneeId" defaultValue={assigneeId ?? ""} className="field">
            <option value="">{t.unassigned}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.label}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 8 }}>{t.assigneeHint}</p>
        </div>
      </div>

      <div>
        <button type="submit" disabled={pending} className="btn btn--primary">
          {pending ? t.saving : t.save}
          {!pending && <span className="arrow">→</span>}
        </button>
      </div>
    </form>
  );
}
