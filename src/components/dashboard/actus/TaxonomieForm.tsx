"use client";

/**
 * Formulaires des référentiels : catégories et étiquettes.
 *
 * Un seul composant pour les deux, parce qu'ils ne diffèrent que par deux
 * champs (couleur et ordre, propres à la catégorie) et par l'action appelée.
 * Les dupliquer ferait diverger deux écrans qui doivent rester jumeaux.
 *
 * Le composant sert aussi bien à créer qu'à modifier : en création, il se vide
 * après un succès pour enchaîner la saisie suivante.
 */
import { useActionState, useEffect, useId, useRef, useState } from "react";
import {
  enregistrerCategorieAction,
  enregistrerTagAction,
  supprimerCategorieAction,
  supprimerTagAction,
} from "@/actions/admin-taxonomies";
import type { ActuFormState } from "@/actions/admin-actualites";
import { ADMIN_ACTUS } from "@/content/admin";
import { ChampCouleur } from "@/components/dashboard/ChampCouleur";

const etatInitial: ActuFormState = { error: null, ok: null };

export type TaxonomieItem = {
  id: string;
  slug: string;
  nomFr: string;
  nomEn: string;
  color?: string | null;
  position?: number;
  /** Nombre d'articles rattachés — affiché sur le bouton de suppression. */
  usage: number;
};

type Props = {
  genre: "categorie" | "etiquette";
  /** Absent : formulaire de création. */
  item?: TaxonomieItem;
};

export function TaxonomieForm({ genre, item }: Props) {
  const t = ADMIN_ACTUS;
  const estCategorie = genre === "categorie";
  const creation = !item;

  const [state, formAction, pending] = useActionState(
    estCategorie ? enregistrerCategorieAction : enregistrerTagAction,
    etatInitial,
  );
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(
    estCategorie ? supprimerCategorieAction : supprimerTagAction,
    etatInitial,
  );

  const formRef = useRef<HTMLFormElement>(null);
  const idBase = useId();
  const idSuppression = `suppr-${item?.id ?? "aucun"}`;

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

  return (
    <div className="adm-taxo__bloc">
      {message && <div className="auth-error" role="alert">{message}</div>}
      {state.ok && <div className="adm-ok" role="status">{state.ok}</div>}

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

          {estCategorie && (
            <>
              <ChampCouleur key={cycle} defaultValue={item?.color} label={t.champCouleur} />

              <div className="adm-form__field adm-taxo__ordre">
                <label className="label-mono" htmlFor={`${idBase}-position`}>{t.champPosition}</label>
                <input id={`${idBase}-position`} name="position" type="number" className="field" defaultValue={item?.position ?? 0} />
              </div>
            </>
          )}
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
              {suppressionEnCours ? t.suppression : t.supprimer}{!suppressionEnCours && item.usage > 0 ? ` (${item.usage})` : ""}
            </button>
          )}
        </div>

        {creation && <p className="adm-hint">{estCategorie ? t.champCouleurAide : t.champNomEnAide}</p>}
      </form>

      {item && (
        <form
          id={idSuppression}
          action={suppression}
          hidden
          onSubmit={(event) => {
            const question = estCategorie ? t.supprimerCategorieConfirm : t.supprimerTagConfirm;
            if (!window.confirm(question)) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={item.id} />
        </form>
      )}
    </div>
  );
}
