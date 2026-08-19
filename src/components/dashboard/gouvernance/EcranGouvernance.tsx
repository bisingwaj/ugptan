"use client";

/**
 * L'écran « Gouvernance » : les organes, puis la chronique de leurs décisions.
 *
 * Les deux listes sur un seul écran, et non deux pages : la page publique les
 * enchaîne, et vérifier qu'une décision est bien attribuée à un organe qui
 * existe se fait en regardant les deux, pas en faisant l'aller-retour.
 *
 * ⚠️ La quatrième section de la page publique — « Qui répond de quoi » — n'a
 * pas d'équivalent ici, et c'est voulu : elle affiche les fiches mises en avant
 * du module « L'équipe de l'Unité ». Une personne se saisit à un seul endroit.
 * Le rappel en pied d'écran dit où.
 */
import { useActionState } from "react";
import Link from "next/link";
import {
  ajouterActiviteAction, ajouterOrganeAction, type GouvFormState,
} from "@/actions/admin-gouvernance";
import { ADMIN_GOUVERNANCE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import type { ActiviteSaisie, OrganeSaisie } from "@/lib/gouvernance/saisie";
import { ActiviteCarte } from "@/components/dashboard/gouvernance/ActiviteCarte";
import { OrganeCarte } from "@/components/dashboard/gouvernance/OrganeCarte";
import type { Lang } from "@/lib/pick";
import type { EtatVue } from "@/lib/ia/statut";

const etatInitial: GouvFormState = { error: null, ok: null };

export function EcranGouvernance({
  organes,
  activites,
  etatsIAOrganes,
  etatsIAActivites,
}: {
  organes: OrganeSaisie[];
  activites: ActiviteSaisie[];
  /** États de l'assistance, indexés par identifiant (cf. lib/ia/suivi.ts). */
  etatsIAOrganes: Map<string, Partial<Record<Lang, EtatVue>>>;
  etatsIAActivites: Map<string, Partial<Record<Lang, EtatVue>>>;
}) {
  const t = ADMIN_GOUVERNANCE;
  const [etatOrgane, ajouterOrgane, organeEnCours] = useActionState(ajouterOrganeAction, etatInitial);
  const [etatActivite, ajouterActivite, activiteEnCours] = useActionState(ajouterActiviteAction, etatInitial);

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
            <h2 className="adm__section-title" style={{ margin: 0 }}>{t.organesTitle}</h2>
            <p className="adm-hint" style={{ marginTop: 4 }}>{t.organesLead}</p>
          </div>
          <form action={ajouterOrgane}>
            <button type="submit" className="btn btn--outline btn--sm" disabled={organeEnCours}>
              {organeEnCours ? t.enregistrement : t.organeAjouter}
            </button>
          </form>
        </div>

        {etatOrgane.error && <div className="auth-error" role="alert">{etatOrgane.error}</div>}
        {etatOrgane.ok && <div className="adm-ok" role="status">{etatOrgane.ok}</div>}

        {organes.length === 0 ? (
          <div className="adm-list"><div className="adm-list__row">{t.organeVide}</div></div>
        ) : (
          <div className="adm-items__liste">
            {organes.map((organe, rang) => (
              <OrganeCarte
                key={organe.id}
                organe={organe}
                rang={rang}
                total={organes.length}
                etatsIA={etatsIAOrganes.get(organe.id) ?? {}}
              />
            ))}
          </div>
        )}
      </section>

      <section className="adm-items" style={{ marginTop: 40 }}>
        <div className="adm-items__tete">
          <div style={{ minWidth: 0 }}>
            <h2 className="adm__section-title" style={{ margin: 0 }}>{t.activitesTitle}</h2>
            <p className="adm-hint" style={{ marginTop: 4 }}>{t.activitesLead}</p>
          </div>
          <form action={ajouterActivite}>
            <button type="submit" className="btn btn--outline btn--sm" disabled={activiteEnCours}>
              {activiteEnCours ? t.enregistrement : t.activiteAjouter}
            </button>
          </form>
        </div>

        {etatActivite.error && <div className="auth-error" role="alert">{etatActivite.error}</div>}
        {etatActivite.ok && <div className="adm-ok" role="status">{etatActivite.ok}</div>}

        {activites.length === 0 ? (
          <div className="adm-list"><div className="adm-list__row">{t.activiteVide}</div></div>
        ) : (
          <div className="adm-items__liste">
            {activites.map((activite, rang) => (
              <ActiviteCarte
                key={activite.id}
                activite={activite}
                rang={rang}
                total={activites.length}
                etatsIA={etatsIAActivites.get(activite.id) ?? {}}
              />
            ))}
          </div>
        )}
      </section>

      {/* Le renvoi vers l'équipe : la page publique porte une quatrième section
          que cet écran ne règle pas, et il vaut mieux le dire que laisser
          chercher. */}
      <div className="adm-list" style={{ marginTop: 32 }}>
        <div className="adm-list__row">
          La section « Qui répond de quoi » de la page publique affiche les fiches marquées « mise en avant »
          du module{" "}
          <Link href={adminPath("/equipe")} className="adm-link">L&rsquo;équipe de l&rsquo;Unité</Link>.
        </div>
      </div>
    </>
  );
}
