"use client";

/**
 * Actions rapides d'une entrée, depuis la liste comme depuis la fiche.
 *
 * Deux gestes seulement, contrairement aux documents qui en ont trois : montrer
 * ou masquer est réversible et se fait sans quitter l'écran ; supprimer efface
 * la ligne ET les fichiers, et emmène ailleurs. Pas d'archivage entre les deux —
 * une photographie retirée n'est pas une version remplacée qu'il faudrait
 * pouvoir citer plus tard (cf. l'enum `GalerieStatus` au schéma).
 *
 * Les refus — source manquante, entrée introuvable — remontent du serveur et
 * s'affichent ici plutôt que de faire tomber la page.
 */
import { useActionState } from "react";
import {
  basculerVisibiliteAction,
  supprimerGalerieAction,
  type GalFormState,
} from "@/actions/admin-galerie";
import { ADMIN_GALERIE } from "@/content/admin";

const etatInitial: GalFormState = { error: null, ok: null };

export function GalerieActions({
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
  const [etatBascule, bascule, basculeEnCours] = useActionState(basculerVisibiliteAction, etatInitial);
  const [etatSuppression, supprime, suppressionEnCours] = useActionState(
    supprimerGalerieAction,
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
