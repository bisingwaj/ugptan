"use client";

/**
 * Actions rapides d'une composante, depuis la liste comme depuis la fiche.
 *
 * Publier / retirer est réversible et se fait sans quitter l'écran ; supprimer
 * emmène ailleurs, d'où sa séparation visuelle. Les refus (aucune langue
 * renseignée) remontent du serveur et s'affichent ici plutôt que de faire
 * tomber la page.
 */
import { useActionState } from "react";
import {
  basculerComposanteAction, supprimerComposanteAction, type ProjetFormState,
} from "@/actions/admin-projet";
import { ADMIN_PROJET } from "@/content/admin";

const etatInitial: ProjetFormState = { error: null, ok: null };

export function ComposanteActions({
  id,
  enLigne,
  compact = false,
}: {
  id: string;
  enLigne: boolean;
  /** Liste : boutons resserrés. Fiche : boutons de taille courante. */
  compact?: boolean;
}) {
  const t = ADMIN_PROJET;
  const [etatBascule, bascule, basculeEnCours] = useActionState(basculerComposanteAction, etatInitial);
  const [etatSuppression, supprime, suppressionEnCours] = useActionState(supprimerComposanteAction, etatInitial);

  const erreur = etatBascule.error ?? etatSuppression.error;
  const taille = compact ? "btn btn--sm" : "btn";

  return (
    <div className="adm-actions">
      <div className="adm-actions__row">
        <form action={bascule}>
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={`${taille} btn--outline`} disabled={basculeEnCours}>
            {enLigne ? t.depublier : t.publier}
          </button>
        </form>

        <form
          action={supprime}
          onSubmit={(event) => {
            if (!window.confirm(t.supprimerConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={`${taille} btn--danger`} disabled={suppressionEnCours}>
            {t.supprimer}
          </button>
        </form>
      </div>

      {erreur && <p className="adm-actions__error" role="alert">{erreur}</p>}
    </div>
  );
}
