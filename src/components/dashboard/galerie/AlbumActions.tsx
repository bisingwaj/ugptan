"use client";

/**
 * Actions rapides d'un album, depuis la liste comme depuis la fiche.
 *
 * Deux gestes, comme sur un contenu : montrer ou masquer, réversible et sur
 * place ; supprimer, qui emmène ailleurs. La suppression d'un album ne détruit
 * PAS ses contenus — ils retournent dans la galerie sans album —, et la
 * confirmation le dit, faute de quoi personne n'oserait cliquer.
 */
import { useActionState } from "react";
import {
  basculerVisibiliteAlbumAction,
  supprimerAlbumAction,
  type GalFormState,
} from "@/actions/admin-galerie";
import { ADMIN_GALERIE } from "@/content/admin";

const etatInitial: GalFormState = { error: null, ok: null };

export function AlbumActions({
  id,
  visible,
  compact = false,
}: {
  id: string;
  visible: boolean;
  /** Liste : boutons resserrés. Fiche : boutons de taille courante. */
  compact?: boolean;
}) {
  const t = ADMIN_GALERIE;
  const [etatBascule, bascule, basculeEnCours] = useActionState(
    basculerVisibiliteAlbumAction,
    etatInitial,
  );
  const [etatSuppression, supprime, suppressionEnCours] = useActionState(
    supprimerAlbumAction,
    etatInitial,
  );

  const erreur = etatBascule.error ?? etatSuppression.error;
  const taille = compact ? "btn btn--sm" : "btn";

  return (
    <div className="adm-actions">
      <div className="adm-actions__row">
        <form action={bascule}>
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={`${taille} btn--outline`} disabled={basculeEnCours}>
            {visible ? t.depublier : t.publier}
          </button>
        </form>

        <form
          action={supprime}
          onSubmit={(event) => {
            if (!window.confirm(t.albumSupprimerConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={`${taille} btn--danger`} disabled={suppressionEnCours}>
            {t.albumSupprimer}
          </button>
        </form>
      </div>

      {erreur && <p className="adm-actions__error" role="alert">{erreur}</p>}
    </div>
  );
}
