"use client";

/**
 * Actions rapides d'un document, depuis la liste comme depuis la fiche.
 *
 * Trois gestes, de conséquence croissante : publier / dépublier est réversible
 * et se fait sans quitter l'écran ; archiver retire du site en gardant la pièce
 * et son fichier ; supprimer efface les deux, et emmène ailleurs. Les refus
 * (fichier manquant, document introuvable) remontent du serveur et s'affichent
 * ici plutôt que de faire tomber la page.
 */
import { useActionState } from "react";
import {
  archiverDocumentAction,
  basculerPublicationDocAction,
  supprimerDocumentAction,
  type DocFormState,
} from "@/actions/admin-documents";
import { ADMIN_DOCS } from "@/content/admin";

const etatInitial: DocFormState = { error: null, ok: null };

export function DocumentActions({
  id,
  enLigne,
  archive,
  compact = false,
}: {
  id: string;
  enLigne: boolean;
  archive: boolean;
  /** Liste : boutons resserrés. Fiche : boutons de taille courante. */
  compact?: boolean;
}) {
  const t = ADMIN_DOCS;
  const [etatBascule, bascule, basculeEnCours] = useActionState(basculerPublicationDocAction, etatInitial);
  const [etatArchive, archiver, archiveEnCours] = useActionState(archiverDocumentAction, etatInitial);
  const [etatSuppression, supprime, suppressionEnCours] = useActionState(supprimerDocumentAction, etatInitial);

  const erreur = etatBascule.error ?? etatArchive.error ?? etatSuppression.error;
  const taille = compact ? "btn btn--sm" : "btn";

  return (
    <div className="adm-actions">
      <div className="adm-actions__row">
        {/* Un document archivé ne se publie pas d'un clic : il faut d'abord le
            sortir de l'archive, geste qui dit qu'on le remet en circulation. */}
        {!archive && (
          <form action={bascule}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className={`${taille} btn--outline`} disabled={basculeEnCours}>
              {enLigne ? t.depublier : t.publier}
            </button>
          </form>
        )}

        <form
          action={archiver}
          onSubmit={(event) => {
            if (!archive && !window.confirm(t.archiverConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={`${taille} btn--ghost`} disabled={archiveEnCours}>
            {archive ? t.desarchiver : t.archiver}
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
