"use client";

/**
 * Les deux affichages de l'état des langues, communs aux fiches et aux projets
 * du module « Provinces » : les pastilles de la ligne repliée, et les onglets
 * de rédaction de la carte dépliée.
 *
 * Même balisage que les cartes du module « Gouvernance »
 * (cf. components/dashboard/gouvernance/OrganeCarte.tsx), mis en commun ici
 * parce que les deux cartes du module le répètent à l'identique.
 */
import { ADMIN_PROVINCES } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { PastilleTraduction } from "@/components/dashboard/ia/PastilleTraduction";
import type { EtatVue } from "@/lib/ia/statut";

export const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

type EtatLangue = { existe: boolean; complete: boolean };

const libelleEtat = (tr: EtatLangue): string => {
  const t = ADMIN_PROVINCES;
  return !tr.existe ? t.tradManquante : tr.complete ? t.tradPresente : t.tradIncomplete;
};

export function PastillesLangues({ traductions }: { traductions: Record<Lang, EtatLangue> }) {
  return (
    <span className="adm-langues">
      {LOCALES.map((lang) => {
        const tr = traductions[lang];
        return (
          <span
            key={lang}
            className={`adm-langue${tr.complete ? " is-on" : tr.existe ? " is-partiel" : ""}`}
            title={`${lang.toUpperCase()} · ${libelleEtat(tr)}`}
          >
            {lang.toUpperCase()}
          </span>
        );
      })}
    </span>
  );
}

export function OngletsLangues({
  traductions,
  langue,
  onChange,
  etatsIA,
}: {
  traductions: Record<Lang, EtatLangue>;
  langue: Lang;
  onChange: (lang: Lang) => void;
  etatsIA: Partial<Record<Lang, EtatVue>>;
}) {
  return (
    <div className="adm-tabs" role="tablist" aria-label={ADMIN_PROVINCES.langueRedaction}>
      {LOCALES.map((lang) => {
        const tr = traductions[lang];
        return (
          <button
            key={lang}
            type="button"
            role="tab"
            aria-selected={langue === lang}
            className={`adm-tab${langue === lang ? " is-on" : ""}`}
            onClick={() => onChange(lang)}
          >
            <span className="mono adm-tab__code">{lang.toUpperCase()}</span>
            <span>{LANG_LABEL[lang]}</span>
            <span className={`adm-tab__etat${tr.complete ? " is-ok" : tr.existe ? " is-partiel" : ""}`}>
              {libelleEtat(tr)}
            </span>
            <PastilleTraduction etat={etatsIA[lang]} />
          </button>
        );
      })}
    </div>
  );
}
