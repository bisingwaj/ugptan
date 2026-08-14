"use client";

/**
 * Actions rapides d'une fiche, depuis la liste comme depuis la fiche elle-même.
 *
 * Publier / retirer est réversible et se fait sans quitter l'écran ; supprimer
 * emmène ailleurs, d'où sa séparation visuelle. Les refus — publier une fiche
 * qu'aucune langue ne sert — remontent du serveur et s'affichent ici plutôt que
 * de faire tomber la page.
 */
import { useActionState } from "react";
import {
  basculerMembreAction,
  deplacerMembreAction,
  supprimerMembreAction,
  type EquipeFormState,
} from "@/actions/admin-equipe";
import { ADMIN_EQUIPE } from "@/content/admin";

const etatInitial: EquipeFormState = { error: null, ok: null };

export function MembreActions({
  id,
  enLigne,
  compact = false,
}: {
  id: string;
  enLigne: boolean;
  /** Liste : boutons resserrés. Fiche : boutons de taille courante. */
  compact?: boolean;
}) {
  const t = ADMIN_EQUIPE;
  const [etatBascule, bascule, basculeEnCours] = useActionState(basculerMembreAction, etatInitial);
  const [etatSuppression, supprime, suppressionEnCours] = useActionState(supprimerMembreAction, etatInitial);

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

/**
 * Déplacement d'une fiche dans la grille.
 *
 * Séparé des actions ci-dessus : il vit dans une colonne de la liste, au plus
 * près de la ligne qu'il déplace, alors que publier et supprimer se rangent en
 * fin de ligne.
 */
export function MembreOrdre({ id, premier, dernier }: { id: string; premier: boolean; dernier: boolean }) {
  const t = ADMIN_EQUIPE;
  const [, deplacer, enCours] = useActionState(deplacerMembreAction, etatInitial);

  return (
    <div className="adm-ordre">
      <form action={deplacer}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="sens" value="haut" />
        <button type="submit" className="btn btn--sm btn--ghost" disabled={enCours || premier} title={t.monter}>
          ↑
        </button>
      </form>
      <form action={deplacer}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="sens" value="bas" />
        <button type="submit" className="btn btn--sm btn--ghost" disabled={enCours || dernier} title={t.descendre}>
          ↓
        </button>
      </form>
    </div>
  );
}
