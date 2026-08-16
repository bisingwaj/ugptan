"use client";

/**
 * Formulaire d'une rubrique de la galerie.
 *
 * Jumeau de `DocCategorieForm` sans en être une variante : les deux écrivent
 * dans des tables différentes, par des actions différentes. Mutualiser les
 * aurait transformés en aiguillage sur trois champs de saisie.
 *
 * Le composant sert aussi bien à créer qu'à modifier : en création, il se vide
 * après un succès pour enchaîner la saisie suivante.
 */
import { useActionState, useEffect, useId, useRef } from "react";
import {
  enregistrerRubriqueAction,
  supprimerRubriqueAction,
  type GalFormState,
} from "@/actions/admin-galerie";
import { ADMIN_GALERIE } from "@/content/admin";

const etatInitial: GalFormState = { error: null, ok: null };

export type RubriqueGalerieItem = {
  id: string;
  slug: string;
  nomFr: string;
  nomEn: string;
  color: string | null;
  position: number;
  /** Nombre de contenus rattachés — affiché sur le bouton de suppression. */
  usage: number;
};

export function GalRubriqueForm({ item }: { item?: RubriqueGalerieItem }) {
  const t = ADMIN_GALERIE;
  const creation = !item;

  const [state, formAction, pending] = useActionState(enregistrerRubriqueAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(
    supprimerRubriqueAction,
    etatInitial,
  );

  const formRef = useRef<HTMLFormElement>(null);
  const idBase = useId();
  const idSuppression = `suppr-rub-gal-${item?.id ?? "aucune"}`;

  useEffect(() => {
    if (creation && state.ok) formRef.current?.reset();
  }, [creation, state.ok]);

  const message = state.error ?? etatSuppression.error;
  const succes = state.ok ?? etatSuppression.ok;

  return (
    <div className="adm-taxo__bloc">
      {message && <div className="auth-error" role="alert">{message}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      <form ref={formRef} action={formAction} className="adm-taxo__form">
        {item && <input type="hidden" name="id" value={item.id} />}

        <div className="adm-taxo__grille">
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-fr`}>{t.champNomFr}</label>
            <input
              id={`${idBase}-fr`}
              name="nomFr"
              type="text"
              required
              className="field"
              defaultValue={item?.nomFr ?? ""}
            />
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-en`}>{t.champNomEn}</label>
            <input
              id={`${idBase}-en`}
              name="nomEn"
              type="text"
              className="field"
              defaultValue={item?.nomEn ?? ""}
            />
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-slug`}>{t.champSlug}</label>
            <input
              id={`${idBase}-slug`}
              name="slug"
              type="text"
              className="field mono"
              spellCheck={false}
              defaultValue={item?.slug ?? ""}
            />
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-color`}>{t.champCouleur}</label>
            <input
              id={`${idBase}-color`}
              name="color"
              type="text"
              className="field mono"
              spellCheck={false}
              defaultValue={item?.color ?? ""}
              placeholder="#0f62fe"
            />
          </div>

          <div className="adm-form__field adm-taxo__ordre">
            <label className="label-mono" htmlFor={`${idBase}-position`}>{t.champOrdre}</label>
            <input
              id={`${idBase}-position`}
              name="position"
              type="number"
              className="field"
              defaultValue={item?.position ?? 0}
            />
          </div>
        </div>

        <div className="adm-actions__row">
          <button type="submit" className="btn btn--primary btn--sm" disabled={pending}>
            {pending ? t.enregistrement : creation ? t.ajouterRubrique : t.enregistrer}
          </button>

          {item && (
            // `form=` relie ce bouton au formulaire de suppression, qui est un
            // FRÈRE et non un descendant : imbriquer deux `<form>` n'est pas
            // permis en HTML, et le navigateur en écarterait un silencieusement.
            <button
              type="submit"
              form={idSuppression}
              className="btn btn--danger btn--sm"
              disabled={suppressionEnCours}
            >
              {t.supprimer}{item.usage > 0 ? ` (${item.usage})` : ""}
            </button>
          )}
        </div>

        {creation && <p className="adm-hint">{t.champSlugAide}</p>}
      </form>

      {item && (
        <form
          id={idSuppression}
          action={suppression}
          hidden
          onSubmit={(event) => {
            if (!window.confirm(t.supprimerRubriqueConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={item.id} />
        </form>
      )}
    </div>
  );
}
