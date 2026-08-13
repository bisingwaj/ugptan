"use client";

import { useActionState } from "react";
import { ADMIN } from "@/content/admin";
import {
  deleteSubscriberAction,
  setSubscriberStatusAction,
  type NewsletterFormState,
} from "@/actions/admin-newsletter";

const initialState: NewsletterFormState = { error: null, ok: null };

/**
 * Actions d'une ligne d'abonné : bascule d'abonnement, puis effacement.
 *
 * Les deux confirmations ne servent pas le même propos et sont écrites en
 * conséquence : désabonner est réversible par le titulaire de l'adresse,
 * supprimer efface la trace de son refus (cf. actions/admin-newsletter.ts).
 * Les refus du serveur s'affichent ici plutôt que de faire tomber la page.
 */
export function NewsletterActions({ id, actif }: { id: string; actif: boolean }) {
  const t = ADMIN.newsletter;
  const [statutState, statutAction, statutPending] = useActionState(setSubscriberStatusAction, initialState);
  const [suppState, suppAction, suppPending] = useActionState(deleteSubscriberAction, initialState);

  const error = statutState.error ?? suppState.error;

  return (
    <div className="adm-actions">
      <div className="adm-actions__row">
        <form
          action={statutAction}
          onSubmit={(event) => {
            const message = actif ? t.desabonnerConfirm : t.reabonnerConfirm;
            if (!window.confirm(message)) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="actif" value={actif ? "0" : "1"} />
          <button type="submit" className="btn btn--outline btn--sm" disabled={statutPending}>
            {statutPending
              ? actif
                ? t.desabonnement
                : t.reabonnement
              : actif
                ? t.desabonner
                : t.reabonner}
          </button>
        </form>

        <form
          action={suppAction}
          onSubmit={(event) => {
            if (!window.confirm(t.supprimerConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="btn btn--danger btn--sm" disabled={suppPending}>
            {suppPending ? t.suppression : t.supprimer}
          </button>
        </form>
      </div>

      {error && <p className="adm-actions__error" role="alert">{error}</p>}
    </div>
  );
}
