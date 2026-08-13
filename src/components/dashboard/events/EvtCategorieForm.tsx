"use client";

/**
 * Formulaire d'une catégorie d'événement.
 *
 * Jumeau de `TaxonomieForm` (actualités) sans en être une variante : les deux
 * écrivent dans des tables différentes, par des actions différentes, et la
 * catégorie d'événement n'a pas d'étiquettes en vis-à-vis. Ajouter un troisième
 * mode au composant des actualités l'aurait transformé en aiguillage, là où le
 * gain se limite à trois champs de saisie.
 *
 * Le composant sert aussi bien à créer qu'à modifier : en création, il se vide
 * après un succès pour enchaîner la saisie suivante.
 */
import { useActionState, useEffect, useId, useRef, useState } from "react";
import {
  enregistrerCategorieEvtAction,
  supprimerCategorieEvtAction,
  type EvtFormState,
} from "@/actions/admin-evenements";
import { ADMIN_EVTS } from "@/content/admin";
import { ChampCouleur } from "@/components/dashboard/ChampCouleur";

const etatInitial: EvtFormState = { error: null, ok: null };

export type CategorieEvtItem = {
  id: string;
  slug: string;
  nomFr: string;
  nomEn: string;
  color: string | null;
  position: number;
  /** Nombre d'événements rattachés — affiché sur le bouton de suppression. */
  usage: number;
};

export function EvtCategorieForm({ item }: { item?: CategorieEvtItem }) {
  const t = ADMIN_EVTS;
  const creation = !item;

  const [state, formAction, pending] = useActionState(enregistrerCategorieEvtAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(
    supprimerCategorieEvtAction,
    etatInitial,
  );

  const formRef = useRef<HTMLFormElement>(null);
  const idBase = useId();
  const idSuppression = `suppr-cat-evt-${item?.id ?? "aucune"}`;

  /**
   * ⚠️ `form.reset()` ne touche QUE les champs natifs : il les ramène à leur
   * `defaultValue`. Le sélecteur de couleur, lui, tient sa valeur dans un état
   * React, que rien ne remet à zéro — la couleur de la catégorie précédente
   * serait restée collée à la suivante. `cycle` sert de `key` : à chaque
   * création réussie, le composant est remonté, donc vidé.
   */
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (creation && state.ok) {
      formRef.current?.reset();
      setCycle((n) => n + 1);
    }
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
            <input id={`${idBase}-fr`} name="nomFr" type="text" required className="field" defaultValue={item?.nomFr ?? ""} />
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-en`}>{t.champNomEn}</label>
            <input id={`${idBase}-en`} name="nomEn" type="text" className="field" defaultValue={item?.nomEn ?? ""} />
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

          <ChampCouleur key={cycle} defaultValue={item?.color} label={t.champCouleur} />

          <div className="adm-form__field adm-taxo__ordre">
            <label className="label-mono" htmlFor={`${idBase}-position`}>{t.champPosition}</label>
            <input id={`${idBase}-position`} name="position" type="number" className="field" defaultValue={item?.position ?? 0} />
          </div>
        </div>

        <div className="adm-actions__row">
          <button type="submit" className="btn btn--primary btn--sm" disabled={pending}>
            {pending ? t.enregistrement : creation ? t.ajouter : t.enregistrer}
          </button>

          {item && (
            // `form=` relie ce bouton au formulaire de suppression, qui est un
            // FRÈRE et non un descendant : imbriquer deux `<form>` n'est pas
            // permis en HTML, et le navigateur en écarterait un silencieusement.
            <button type="submit" form={idSuppression} className="btn btn--danger btn--sm" disabled={suppressionEnCours}>
              {t.supprimer}{item.usage > 0 ? ` (${item.usage})` : ""}
            </button>
          )}
        </div>

        {creation && <p className="adm-hint">{t.champCouleurAide}</p>}
      </form>

      {item && (
        <form
          id={idSuppression}
          action={suppression}
          hidden
          onSubmit={(event) => {
            if (!window.confirm(t.supprimerCategorieConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={item.id} />
        </form>
      )}
    </div>
  );
}
