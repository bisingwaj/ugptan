"use client";

/**
 * Actions rapides d'un article, depuis la liste comme depuis la fiche.
 *
 * Publier / dépublier est réversible et se fait sans quitter l'écran ;
 * dupliquer et supprimer emmènent ailleurs, d'où leur séparation visuelle. Les
 * refus (corps vide, article introuvable) remontent du serveur et s'affichent
 * ici plutôt que de faire tomber la page.
 */
import { useActionState } from "react";
import {
  basculerPublicationAction,
  dupliquerArticleAction,
  supprimerArticleAction,
  type ActuFormState,
} from "@/actions/admin-actualites";
import { ADMIN_ACTUS } from "@/content/admin";

const etatInitial: ActuFormState = { error: null, ok: null };

export function ArticleActions({
  id,
  enLigne,
  compact = false,
}: {
  id: string;
  enLigne: boolean;
  /** Liste : boutons resserrés. Fiche : boutons de taille courante. */
  compact?: boolean;
}) {
  const t = ADMIN_ACTUS;
  const [etatBascule, bascule, basculeEnCours] = useActionState(basculerPublicationAction, etatInitial);
  const [etatCopie, copie, copieEnCours] = useActionState(dupliquerArticleAction, etatInitial);
  const [etatSuppression, supprime, suppressionEnCours] = useActionState(supprimerArticleAction, etatInitial);

  const erreur = etatBascule.error ?? etatCopie.error ?? etatSuppression.error;
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

        <form action={copie}>
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={`${taille} btn--ghost`} disabled={copieEnCours}>
            {t.dupliquer}
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
