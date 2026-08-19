"use client";

/**
 * Une liste d'entrées d'un même type, avec son bouton d'ajout.
 *
 * Une section de la fiche peut en porter plusieurs : la problématique tient
 * trois listes — les axes du constat, les paragraphes d'appui, les renvois —
 * qui s'affichent dans trois colonnes distinctes de la page publique. Les
 * fondre en une seule obligerait à choisir un type dans un menu à chaque ajout,
 * pour un geste que le titre de la liste dit déjà.
 */
import { useActionState } from "react";
import { ajouterBlocAction, type ProjetFormState } from "@/actions/admin-projet";
import { ADMIN_PROJET } from "@/content/admin";
import type { BlocSaisie } from "@/lib/projet/saisie";
import { BLOC_HINT, BLOC_LABEL, type ComposanteBlocType } from "@/lib/projet/statut";
import type { MediaRef } from "@/lib/medias";
import { ComposanteBlocCarte } from "@/components/dashboard/projet/ComposanteBlocCarte";
import type { Lang } from "@/lib/pick";
import type { EtatVue } from "@/lib/ia/statut";

const etatInitial: ProjetFormState = { error: null, ok: null };

export function ComposanteBlocsListe({
  composanteId,
  type,
  blocs,
  assets,
  voisines,
  etatsIA,
}: {
  composanteId: string;
  type: ComposanteBlocType;
  /** Déjà filtrées sur ce type et rangées par position. */
  blocs: BlocSaisie[];
  assets: MediaRef[];
  voisines: { code: string; nom: string }[];
  /** États de l'assistance de TOUS les blocs de la composante, indexés par identifiant. */
  etatsIA: Map<string, Partial<Record<Lang, EtatVue>>>;
}) {
  const t = ADMIN_PROJET;
  const [etat, ajouter, enCours] = useActionState(ajouterBlocAction, etatInitial);

  return (
    <div className="adm-items">
      <div className="adm-items__tete">
        <div style={{ minWidth: 0 }}>
          <h3 className="adm__section-title" style={{ margin: 0 }}>{BLOC_LABEL[type]}</h3>
          <p className="adm-hint" style={{ marginTop: 4 }}>{BLOC_HINT[type]}</p>
        </div>

        <form action={ajouter}>
          <input type="hidden" name="composanteId" value={composanteId} />
          <input type="hidden" name="type" value={type} />
          <button type="submit" className="btn btn--outline btn--sm" disabled={enCours}>
            {enCours ? t.enregistrement : t.blocAjouter}
          </button>
        </form>
      </div>

      {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

      {blocs.length === 0 ? (
        <div className="adm-list">
          <div className="adm-list__row">{t.blocVide}</div>
        </div>
      ) : (
        <div className="adm-items__liste">
          {blocs.map((bloc, rang) => (
            <ComposanteBlocCarte
              key={bloc.id}
              bloc={bloc}
              assets={assets}
              voisines={voisines}
              rang={rang}
              total={blocs.length}
              etatsIA={etatsIA.get(bloc.id) ?? {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
