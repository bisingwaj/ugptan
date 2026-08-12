"use client";

import { useActionState } from "react";
import { deleteUserAction, setUserActiveAction, type UserFormState } from "@/actions/admin-users";
import { ADMIN } from "@/content/admin";

const initialState: UserFormState = { error: null, ok: null };

/**
 * Actions d'un compte : désactivation réversible, puis suppression définitive.
 *
 * Les deux gestes existent parce qu'ils ne disent pas la même chose. Désactiver
 * ferme l'accès en gardant la trace du compte ; supprimer efface la ligne. Les
 * refus (dernier administrateur, compte de la personne connectée) remontent du
 * serveur et s'affichent ici, plutôt que de faire tomber la page.
 */
export function UserActions({
  id,
  isActive,
  isSelf,
  showDelete = true,
}: {
  id: string;
  isActive: boolean;
  isSelf: boolean;
  showDelete?: boolean;
}) {
  const t = ADMIN.users;
  const [toggleState, toggleAction, togglePending] = useActionState(setUserActiveAction, initialState);
  const [deleteState, removeAction, deletePending] = useActionState(deleteUserAction, initialState);

  const error = toggleState.error ?? deleteState.error;

  return (
    <div className="adm-actions">
      <div className="adm-actions__row">
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
    </div>
  );
}
