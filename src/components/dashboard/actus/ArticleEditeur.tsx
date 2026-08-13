"use client";

/**
 * Écran d'édition d'un article.
 *
 * Trois formulaires INDÉPENDANTS cohabitent sur la page, et c'est le cœur du
 * dispositif multilingue :
 *
 *   · un par langue, à gauche, sous les onglets ;
 *   · un pour la fiche — statut, date, visuel, classement — à droite.
 *
 * Ils s'enregistrent séparément parce qu'ils n'appartiennent pas aux mêmes
 * personnes ni au même moment : le rédacteur écrit le français, le traducteur
 * ajoute l'anglais plus tard, le responsable publie. Un envoi unique portant
 * les deux langues ferait qu'enregistrer l'anglais réécrive le français tel
 * qu'il avait été chargé, écrasant sans bruit toute correction intermédiaire.
 *
 * Les onglets masquent, ils ne démontent pas : une saisie en cours dans l'autre
 * langue survit au changement d'onglet.
 */
import { useState } from "react";
import { ADMIN_ACTUS } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { ArticleSaisie, ReferentielsSaisie } from "@/lib/actus/saisie";
import type { MediaRef } from "@/lib/medias";
import { ArticleReglages } from "@/components/dashboard/actus/ArticleReglages";
import { ArticleTraduction } from "@/components/dashboard/actus/ArticleTraduction";

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

type Props = {
  article: ArticleSaisie & { id: string };
  referentiels: ReferentielsSaisie;
  assets: MediaRef[];
  /** Lien d'aperçu signé (cf. lib/actus/apercu.ts). */
  apercuUrl: string | null;
};

export function ArticleEditeur({ article, referentiels, assets, apercuUrl }: Props) {
  const t = ADMIN_ACTUS;
  const [langue, setLangue] = useState<Lang>("fr");

  return (
    <div className="adm-edit">
      <div className="adm-edit__main">
        <div className="adm-tabs" role="tablist" aria-label={t.langueRedaction}>
          {LOCALES.map((lang) => {
            const tr = article.traductions[lang];
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
              </button>
            );
          })}
        </div>

        {LOCALES.map((lang) => (
          <ArticleTraduction
            key={lang}
            articleId={article.id}
            lang={lang}
            valeurs={article.traductions[lang]}
            assets={assets}
            visible={langue === lang}
          />
        ))}
      </div>

      <aside className="adm-edit__aside">
        <ArticleReglages
          article={article}
          referentiels={referentiels}
          assets={assets}
          apercuUrl={apercuUrl}
        />
      </aside>
    </div>
  );
}
