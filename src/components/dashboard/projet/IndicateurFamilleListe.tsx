"use client";

/**
 * Une famille d'indicateurs, avec son bouton d'ajout.
 *
 * Deux familles, deux listes, un seul écran : le cadre de résultats se relit
 * d'un bloc — ce que le Projet vise en objectif, ce qu'il vise en chemin —, et
 * séparer les deux en deux pages obligerait à faire l'aller-retour pour vérifier
 * qu'un chiffre corrigé ici ne contredit pas celui de là-bas.
 */
import { useActionState } from "react";
import { ajouterIndicateurAction, type ProjetFormState } from "@/actions/admin-projet";
import { ADMIN_PROJET } from "@/content/admin";
import type { IndicateurSaisie } from "@/lib/projet/saisie";
import { FAMILLE_HINT, FAMILLE_LABEL, type IndicateurFamille } from "@/lib/projet/statut";
import { IndicateurCarte } from "@/components/dashboard/projet/IndicateurCarte";
import type { Lang } from "@/lib/pick";
import type { EtatVue } from "@/lib/ia/statut";

const etatInitial: ProjetFormState = { error: null, ok: null };

export function IndicateurFamilleListe({
  famille,
  indicateurs,
  etatsIA,
}: {
  famille: IndicateurFamille;
  indicateurs: IndicateurSaisie[];
  /** États de l'assistance, indexés par identifiant d'indicateur. */
  etatsIA: Map<string, Partial<Record<Lang, EtatVue>>>;
}) {
  const t = ADMIN_PROJET;
  const [etat, ajouter, enCours] = useActionState(ajouterIndicateurAction, etatInitial);

  return (
    <section className="adm-items" style={{ marginTop: 32 }}>
      <div className="adm-items__tete">
        <div style={{ minWidth: 0 }}>
          <h2 className="adm__section-title" style={{ margin: 0 }}>{FAMILLE_LABEL[famille]}</h2>
          <p className="adm-hint" style={{ marginTop: 4 }}>{FAMILLE_HINT[famille]}</p>
        </div>

        <form action={ajouter}>
          <input type="hidden" name="famille" value={famille} />
          <button type="submit" className="btn btn--outline btn--sm" disabled={enCours}>
            {enCours ? t.enregistrement : t.indicateurAjouter}
          </button>
        </form>
      </div>

      {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

      {indicateurs.length === 0 ? (
        <div className="adm-list">
          <div className="adm-list__row">{t.indicateurVide}</div>
        </div>
      ) : (
        <div className="adm-items__liste">
          {indicateurs.map((indicateur, rang) => (
            <IndicateurCarte
              key={indicateur.id}
              indicateur={indicateur}
              rang={rang}
              total={indicateurs.length}
              etatsIA={etatsIA.get(indicateur.id) ?? {}}
            />
          ))}
        </div>
      )}
    </section>
  );
}
