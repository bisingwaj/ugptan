"use client";

import { useActionState } from "react";
import {
  deleteUserAction,
  resendInvitationAction,
  setUserActiveAction,
  type UserFormState,
} from "@/actions/admin-users";
import { ADMIN } from "@/content/admin";

const initialState: UserFormState = { error: null, ok: null };

/**
 * Actions d'un compte : renvoi de l'invitation, désactivation réversible, puis
 * suppression définitive.
 *
 * Désactiver et supprimer existent tous deux parce qu'ils ne disent pas la même
 * chose : l'un ferme l'accès en gardant la trace du compte, l'autre efface la
 * ligne. Les refus (dernier administrateur, compte de la personne connectée)
 * remontent du serveur et s'affichent ici, plutôt que de faire tomber la page.
 */
export function UserActions({
  id,
  isActive,
  isSelf,
  showDelete = true,
  showInvite = false,
}: {
  id: string;
  isActive: boolean;
  isSelf: boolean;
  showDelete?: boolean;
  /** Réservé à la fiche du compte : la liste serait encombrée par ce bouton. */
  showInvite?: boolean;
}) {
  const t = ADMIN.users;
  const [toggleState, toggleAction, togglePending] = useActionState(setUserActiveAction, initialState);
  const [deleteState, removeAction, deletePending] = useActionState(deleteUserAction, initialState);
  const [inviteState, inviteAction, invitePending] = useActionState(resendInvitationAction, initialState);

  const error = toggleState.error ?? deleteState.error ?? inviteState.error;

  return (
    <div className="adm-actions">
      <div className="adm-actions__row">
        {showInvite && (
          <form action={inviteAction}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="btn btn--outline btn--sm" disabled={invitePending || !isActive}>
              {invitePending ? t.resendingInvite : t.resendInvite}
            </button>
          </form>
        )}

        <form action={toggleAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="active" value={isActive ? "0" : "1"} />
          <button
            type="submit"
            className="btn btn--outline btn--sm"
            // Se désactiver soi-même reviendrait à se mettre dehors : le
            // serveur le refuse, le bouton n'a donc pas à être proposé.
            disabled={togglePending || (isSelf && isActive)}
          >
            {isActive ? t.deactivate : t.activate}
          </button>
        </form>

        {showDelete && !isSelf && (
          <form
            action={removeAction}
            onSubmit={(event) => {
              if (!window.confirm(t.removeConfirm)) event.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="btn btn--danger btn--sm" disabled={deletePending}>
              {t.remove}
            </button>
          </form>
        )}
      </div>

      {error && <p className="adm-actions__error" role="alert">{error}</p>}
      {inviteState.ok && <p className="adm-actions__ok" role="status">{inviteState.ok}</p>}
    </div>
  );
}
