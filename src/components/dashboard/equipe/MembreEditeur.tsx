"use client";

/**
 * Écran d'édition d'une fiche de l'équipe.
 *
 * L'organisation reprend celle des autres modules : les langues à gauche sous
 * des onglets, les réglages à droite, et autant de formulaires INDÉPENDANTS que
 * d'objets à enregistrer. Ils ne s'enregistrent pas ensemble parce qu'ils
 * n'appartiennent ni aux mêmes personnes ni au même moment : le rédacteur
 * décrit le poste en français, le traducteur ajoute l'anglais plus tard, le
 * responsable publie.
 */
import { useState } from "react";
import { ADMIN_EQUIPE } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { MembreSaisie, ReferentielsEquipe } from "@/lib/equipe/saisie";
import type { MediaRef } from "@/lib/medias";
import { MembreProfil } from "@/components/dashboard/equipe/MembreProfil";
import { MembreReglages } from "@/components/dashboard/equipe/MembreReglages";
import { PastilleTraduction } from "@/components/dashboard/ia/PastilleTraduction";
import { sourcePourTraduire, type EtatVue } from "@/lib/ia/statut";

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

type Props = {
  membre: MembreSaisie & { id: string };
  referentiels: ReferentielsEquipe;
  assets: MediaRef[];
  apercuUrl: string | null;
  /** État de l'assistance à la traduction, par langue (cf. lib/ia/suivi.ts). */
  etatsIA: Partial<Record<Lang, EtatVue>>;
};

export function MembreEditeur({ membre, referentiels, assets, apercuUrl, etatsIA }: Props) {
  const t = ADMIN_EQUIPE;
  const [langue, setLangue] = useState<Lang>("fr");

  return (
    <div className="adm-edit">
      <div className="adm-edit__main">
        <div className="adm-tabs" role="tablist" aria-label={t.langueRedaction}>
          {LOCALES.map((lang) => {
            const tr = membre.traductions[lang];
            const etat = tr.complete ? t.tradPresente : t.tradManquante;
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
                <span className={`adm-tab__etat${tr.complete ? " is-ok" : ""}`}>{etat}</span>
                <PastilleTraduction etat={etatsIA[lang]} />
              </button>
            );
          })}
        </div>

        {/* Les onglets masquent, ils ne démontent pas : une saisie en cours
            dans l'autre langue survit au changement d'onglet. */}
        {LOCALES.map((lang) => (
          <MembreProfil
            key={lang}
            membreId={membre.id}
            lang={lang}
            valeurs={membre.traductions[lang]}
            etatIA={etatsIA[lang]}
            sourceIA={sourcePourTraduire(lang, (l) => membre.traductions[l].existe)}
            visible={langue === lang}
          />
        ))}
      </div>

      <aside className="adm-edit__aside">
        <MembreReglages
          membre={membre}
          referentiels={referentiels}
          assets={assets}
          apercuUrl={apercuUrl}
        />
      </aside>
    </div>
  );
}
