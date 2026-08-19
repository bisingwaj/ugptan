"use client";

/**
 * Écran d'édition d'un événement.
 *
 * Trois formulaires INDÉPENDANTS cohabitent sur la page, et c'est le cœur du
 * dispositif multilingue :
 *
 *   · un par langue, à gauche, sous les onglets ;
 *   · un pour la fiche — statut, calendrier, modalité, visuel — à droite.
 *
 * Ils s'enregistrent séparément parce qu'ils n'appartiennent pas aux mêmes
 * personnes ni au même moment : le rédacteur annonce en français, le traducteur
 * ajoute l'anglais plus tard, le responsable publie. Un envoi unique portant
 * les deux langues ferait qu'enregistrer l'anglais réécrive le français tel
 * qu'il avait été chargé, écrasant sans bruit toute correction intermédiaire.
 *
 * Les onglets masquent, ils ne démontent pas : une saisie en cours dans l'autre
 * langue survit au changement d'onglet.
 */
import { useState } from "react";
import { ADMIN_EVTS } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { EvenementSaisie, ReferentielsEvtSaisie } from "@/lib/events/saisie";
import type { MediaRef } from "@/lib/medias";
import { EvenementReglages } from "@/components/dashboard/events/EvenementReglages";
import { EvenementTraduction } from "@/components/dashboard/events/EvenementTraduction";
import { PastilleTraduction } from "@/components/dashboard/ia/PastilleTraduction";
import { sourcePourTraduire, type EtatVue } from "@/lib/ia/statut";

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

type Props = {
  evenement: EvenementSaisie & { id: string };
  referentiels: ReferentielsEvtSaisie;
  assets: MediaRef[];
  /** Lien vers la fiche publique, quand elle existe. */
  apercuUrl: string | null;
  /** État de l'assistance à la traduction, par langue (cf. lib/ia/suivi.ts). */
  etatsIA: Partial<Record<Lang, EtatVue>>;
};

export function EvenementEditeur({ evenement, referentiels, assets, apercuUrl, etatsIA }: Props) {
  const t = ADMIN_EVTS;
  const [langue, setLangue] = useState<Lang>("fr");

  return (
    <div className="adm-edit">
      <div className="adm-edit__main">
        <div className="adm-tabs" role="tablist" aria-label={t.langueRedaction}>
          {LOCALES.map((lang) => {
            const tr = evenement.traductions[lang];
            const etat = !tr.existe ? t.tradManquante : tr.complete ? t.tradPresente : t.tradIncomplete;
            return (
              <button
                key={lang}
                type="button"
                role="tab"
                aria-selected={langue === lang}
                className={`adm-tab${langue === lang ? " is-on" : ""}`}
                onClick={() => setLangue(lang)}
              >
                <span className="mono adm-tab__code">{lang.toUpperCase()}</span>
                <span>{LANG_LABEL[lang]}</span>
                <span className={`adm-tab__etat${tr.complete ? " is-ok" : tr.existe ? " is-partiel" : ""}`}>
                  {etat}
                </span>
                <PastilleTraduction etat={etatsIA[lang]} />
              </button>
            );
          })}
        </div>

        {LOCALES.map((lang) => (
          <EvenementTraduction
            key={lang}
            evenementId={evenement.id}
            lang={lang}
            valeurs={evenement.traductions[lang]}
            assets={assets}
            visible={langue === lang}
            etatIA={etatsIA[lang]}
            sourceIA={sourcePourTraduire(lang, (l) => evenement.traductions[l].existe)}
          />
        ))}
      </div>

      <aside className="adm-edit__aside">
        <EvenementReglages
          evenement={evenement}
          referentiels={referentiels}
          assets={assets}
          apercuUrl={apercuUrl}
        />
      </aside>
    </div>
  );
}
