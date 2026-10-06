"use client";

/**
 * L'écran « Provinces » : les vingt-six fiches, puis les projets localisés.
 *
 * Les deux listes sur un seul écran, comme le module « Gouvernance » : la page
 * province les enchaîne, et vérifier qu'un projet cite les bonnes provinces se
 * fait en regardant les deux.
 *
 * Pas de bouton d'ajout pour les fiches : la table des provinces est figée
 * (cf. content/data.ts), et l'amorçage crée la fiche de chacune.
 */
import { useActionState } from "react";
import { ajouterProjetAction, type ProvinceFormState } from "@/actions/admin-provinces";
import { ADMIN_PROVINCES } from "@/content/admin";
import type { Lang } from "@/lib/pick";
import type { EtatVue } from "@/lib/ia/statut";
import type {
  ComposanteOption, FicheSaisie, ProjetSaisie, ProvinceOption,
} from "@/lib/provinces/saisie";
import { FicheCarte } from "@/components/dashboard/provinces/FicheCarte";
import { ProjetCarte } from "@/components/dashboard/provinces/ProjetCarte";

const etatInitial: ProvinceFormState = { error: null, ok: null };

export function EcranProvinces({
  fiches,
  projets,
  provinces,
  composantes,
  etatsIAFiches,
  etatsIAProjets,
}: {
  fiches: FicheSaisie[];
  projets: ProjetSaisie[];
  provinces: ProvinceOption[];
  composantes: ComposanteOption[];
  /** États de l'assistance, indexés par identifiant (cf. lib/ia/suivi.ts). */
  etatsIAFiches: Map<string, Partial<Record<Lang, EtatVue>>>;
  etatsIAProjets: Map<string, Partial<Record<Lang, EtatVue>>>;
}) {
  const t = ADMIN_PROVINCES;
  const [etatProjet, ajouterProjet, projetEnCours] = useActionState(ajouterProjetAction, etatInitial);

  return (
    <>
      <div className="adm-entete">
        <div>
          <h1 className="adm__title">{t.title}</h1>
          <p className="adm__lead">{t.lead}</p>
        </div>
      </div>

      <section className="adm-items" style={{ marginTop: 32 }}>
        <div className="adm-items__tete">
          <div style={{ minWidth: 0 }}>
            <h2 className="adm__section-title" style={{ margin: 0 }}>{t.fichesTitle}</h2>
            <p className="adm-hint" style={{ marginTop: 4 }}>{t.fichesLead}</p>
          </div>
        </div>

        {fiches.length === 0 ? (
          <div className="adm-list"><div className="adm-list__row">{t.ficheVide}</div></div>
        ) : (
          <div className="adm-items__liste">
            {fiches.map((fiche) => (
              <FicheCarte key={fiche.id} fiche={fiche} etatsIA={etatsIAFiches.get(fiche.id) ?? {}} />
            ))}
          </div>
        )}
      </section>

      <section className="adm-items" style={{ marginTop: 40 }}>
        <div className="adm-items__tete">
          <div style={{ minWidth: 0 }}>
            <h2 className="adm__section-title" style={{ margin: 0 }}>{t.projetsTitle}</h2>
            <p className="adm-hint" style={{ marginTop: 4 }}>{t.projetsLead}</p>
          </div>
          <form action={ajouterProjet}>
            <button type="submit" className="btn btn--outline btn--sm" disabled={projetEnCours}>
              {projetEnCours ? t.enregistrement : t.projetAjouter}
            </button>
          </form>
        </div>

        {etatProjet.error && <div className="auth-error" role="alert">{etatProjet.error}</div>}
        {etatProjet.ok && <div className="adm-ok" role="status">{etatProjet.ok}</div>}

        {projets.length === 0 ? (
          <div className="adm-list"><div className="adm-list__row">{t.projetVide}</div></div>
        ) : (
          <div className="adm-items__liste">
            {projets.map((projet, rang) => (
              <ProjetCarte
                key={projet.id}
                projet={projet}
                rang={rang}
                total={projets.length}
                etatsIA={etatsIAProjets.get(projet.id) ?? {}}
                provinces={provinces}
                composantes={composantes}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
