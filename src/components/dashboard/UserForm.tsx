"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createUserAction, updateUserAction, type UserFormState } from "@/actions/admin-users";
import { ADMIN, MODULE_LABEL } from "@/content/admin";
import {
  assignablePermissions,
  ROLES,
  ROLE_HINT,
  ROLE_LABEL,
  type AdminRole,
} from "@/lib/auth/permissions";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/validate";

const initialState: UserFormState = { error: null, ok: null };

export type EditableUser = {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  permissions: string[];
};

type Props =
  | { mode: "create"; user?: undefined; isSelf?: false }
  | { mode: "edit"; user: EditableUser; isSelf: boolean };

/**
 * Formulaire de compte, création et modification confondues.
 *
 * Le rôle pilote la liste des modules cochables : c'est la seule raison pour
 * laquelle ce formulaire est un composant client. Le filtrage est refait côté
 * serveur (cf. actions/admin-users.ts) — ce qui suit est du confort de saisie.
 */
export function UserForm({ mode, user, isSelf = false }: Props) {
  const t = ADMIN.users;
  const isCreate = mode === "create";

  const [state, formAction, pending] = useActionState(
    isCreate ? createUserAction : updateUserAction,
    initialState,
  );

  const [role, setRole] = useState<AdminRole>(user?.role ?? "EDITOR");
  const extras = assignablePermissions(role);

  const formRef = useRef<HTMLFormElement>(null);

  // Après une création réussie, on vide les champs : le formulaire reste à
  // l'écran, prêt pour le compte suivant.
  useEffect(() => {
    if (isCreate && state.ok) {
      formRef.current?.reset();
      setRole("EDITOR");
    }
  }, [isCreate, state.ok]);

  return (
    <form ref={formRef} action={formAction} className="adm-form">
      {state.error && <div className="auth-error" role="alert">{state.error}</div>}
      {state.ok && <div className="adm-ok" role="status">{state.ok}</div>}

      {!isCreate && <input type="hidden" name="id" value={user.id} />}

      <div className="adm-form__row">
        <div className="adm-form__field">
          <label className="label-mono" htmlFor="user-email">{t.fieldEmail}</label>
          <input
            id="user-email"
            name="email"
            type="email"
            required
            spellCheck={false}
            autoComplete="off"
            defaultValue={user?.email ?? ""}
            placeholder="prenom.nom@ugptn.cd"
            className="field"
          />
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor="user-name">
            {t.fieldName} <span className="adm-hint">({t.fieldNameHint})</span>
          </label>
          <input
            id="user-name"
            name="name"
            type="text"
            autoComplete="off"
            defaultValue={user?.name ?? ""}
            className="field"
          />
        </div>
      </div>

      <div className="adm-form__row">
        <div className="adm-form__field">
          <label className="label-mono" htmlFor="user-password">
            {isCreate ? t.fieldPassword : t.fieldPasswordEdit}{" "}
            {!isCreate && <span className="adm-hint">({t.fieldPasswordEditHint})</span>}
          </label>
          <input
            id="user-password"
            name="password"
            type="password"
            required={isCreate}
            minLength={PASSWORD_MIN_LENGTH}
            // « new-password » et non « current-password » : sans quoi le
            // gestionnaire du navigateur propose le mot de passe de la personne
            // connectée pour le compte qu'elle est en train de créer.
            autoComplete="new-password"
            placeholder="••••••••"
            className="field"
          />
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor="user-role">{t.fieldRole}</label>
          <select
            id="user-role"
            name="role"
            value={role}
            disabled={isSelf}
            onChange={(event) => setRole(event.target.value as AdminRole)}
            className="field"
          >
            {ROLES.map((value) => (
              <option key={value} value={value}>{ROLE_LABEL[value]}</option>
            ))}
          </select>
          {/* Un `select` désactivé n'est pas soumis : sans ce doublon, le rôle
              arriverait vide côté serveur. */}
          {isSelf && <input type="hidden" name="role" value={role} />}
          <p className="adm-hint" style={{ marginTop: 8 }}>
            {isSelf ? "Vous ne pouvez pas modifier votre propre rôle." : ROLE_HINT[role]}
          </p>
        </div>
      </div>

      <fieldset className="adm-fieldset">
        <legend className="label-mono" style={{ marginBottom: 0 }}>{t.fieldPermissions}</legend>

        {role === "ADMIN" ? (
          <p className="adm-hint">{t.fieldPermissionsAdmin}</p>
        ) : (
          <>
            <p className="adm-hint" style={{ marginBottom: 12 }}>{t.fieldPermissionsHint}</p>
            <div className="adm-checks">
              {extras.map((permission) => (
                <label key={permission} className="adm-check">
                  <input
                    type="checkbox"
                    name="permissions"
                    value={permission}
                    defaultChecked={user?.permissions.includes(permission)}
                  />
                  <span>{MODULE_LABEL[permission] ?? permission}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </fieldset>

      <div>
        <button type="submit" disabled={pending} className="btn btn--primary">
          {pending ? (isCreate ? t.creating : t.saving) : isCreate ? t.create : t.save}
          {!pending && <span className="arrow">→</span>}
        </button>
      </div>
    </form>
  );
}
