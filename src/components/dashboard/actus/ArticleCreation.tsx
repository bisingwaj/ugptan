"use client";

/**
 * Écran « Nouvel article ».
 *
 * Un seul formulaire, une seule langue : un article naît dans la langue où il
 * est rédigé. Les autres versions s'ajoutent ensuite depuis la fiche, chacune
 * par son propre formulaire.
 *
 * Demander les deux langues dès la création reviendrait à exiger la traduction
 * avant même que le texte d'origine soit arrêté — l'inverse de la façon dont
 * une rédaction travaille.
 */
import { useActionState, useId, useState } from "react";
import { creerArticleAction, type ActuFormState } from "@/actions/admin-actualites";
import { ADMIN_ACTUS } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { ArticleSaisie, ReferentielsSaisie } from "@/lib/actus/saisie";
import type { MediaRef } from "@/lib/medias";
import { ReglagesChamps } from "@/components/dashboard/actus/ReglagesChamps";
import { TraductionChamps } from "@/components/dashboard/actus/TraductionChamps";

const etatInitial: ActuFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function ArticleCreation({
  article,
  referentiels,
  assets,
}: {
  article: ArticleSaisie;
  referentiels: ReferentielsSaisie;
  assets: MediaRef[];
}) {
  const t = ADMIN_ACTUS;
  const [etat, action, enCours] = useActionState(creerArticleAction, etatInitial);
  const [langue, setLangue] = useState<Lang>("fr");
  const idBase = useId();

  return (
    <form action={action} className="adm-edit">
      <div className="adm-edit__alertes">
        {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      </div>

      <div className="adm-edit__main">
        <div className="adm-panel adm-edit__langue-choix">
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-locale`}>{t.langueRedaction}</label>
            <select
              id={`${idBase}-locale`}
              name="locale"
              className="field"
              value={langue}
              onChange={(event) => setLangue(event.target.value as Lang)}
              style={{ maxWidth: 260 }}
            >
              {LOCALES.map((lang) => (
                <option key={lang} value={lang}>{LANG_LABEL[lang]}</option>
              ))}
            </select>
            <p className="adm-hint" style={{ marginTop: 8 }}>{t.langueRedactionAide}</p>
          </div>
        </div>

        <div className="adm-edit__langue">
          {/* `key` : changer de langue de rédaction réinitialise les champs —
              le titre et le slug déjà saisis appartenaient à l'autre langue. */}
          <TraductionChamps
            key={langue}
            lang={langue}
            valeurs={article.traductions[langue]}
            assets={assets}
          />
        </div>
      </div>

      <aside className="adm-edit__aside">
        <ReglagesChamps article={article} referentiels={referentiels} assets={assets} />

        <div className="adm-edit__barre">
          <button type="submit" className="btn btn--primary" disabled={enCours}>
            {enCours ? t.creation : t.creer}
            {!enCours && <span className="arrow">→</span>}
          </button>
        </div>
      </aside>
    </form>
  );
}
