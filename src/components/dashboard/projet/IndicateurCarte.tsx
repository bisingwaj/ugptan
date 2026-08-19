"use client";

/**
 * Un indicateur du cadre de résultats, dépliable, avec ses onglets de langue.
 *
 * Repliée, la carte montre ce qui se lit sur le site — le code, le chiffre et
 * son unité — plus l'état et les langues qui manquent. C'est la relecture du
 * cadre de résultats faite d'un coup d'œil, sans ouvrir onze fiches.
 *
 * Trois formulaires, comme partout ailleurs : un par langue, un pour les
 * réglages, un pour la suppression — frère et non descendant, `<form>` ne
 * s'imbriquant pas.
 */
import { useActionState, useId, useState } from "react";
import {
  basculerIndicateurAction, deplacerIndicateurAction, enregistrerIndicateurAction,
  enregistrerIndicateurLangueAction, supprimerIndicateurAction, type ProjetFormState,
} from "@/actions/admin-projet";
import { ADMIN_PROJET } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { IndicateurSaisie } from "@/lib/projet/saisie";
import {
  familleAnimee, PROJET_STATUT_LABEL, type IndicateurFamille,
} from "@/lib/projet/statut";
import { BandeauTraduction } from "@/components/dashboard/ia/BandeauTraduction";
import { PastilleTraduction } from "@/components/dashboard/ia/PastilleTraduction";
import { sourcePourTraduire, type EtatVue } from "@/lib/ia/statut";

const etatInitial: ProjetFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function IndicateurCarte({
  indicateur,
  rang,
  total,
  etatsIA,
}: {
  indicateur: IndicateurSaisie;
  rang: number;
  total: number;
  etatsIA: Partial<Record<Lang, EtatVue>>;
}) {
  const t = ADMIN_PROJET;
  const idBase = useId();
  const [langue, setLangue] = useState<Lang>("fr");
  const [ouverte, setOuverte] = useState(false);

  const [etatReglages, actionReglages, reglagesEnCours] = useActionState(enregistrerIndicateurAction, etatInitial);
  const [etatBascule, bascule, basculeEnCours] = useActionState(basculerIndicateurAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(supprimerIndicateurAction, etatInitial);
  const [, deplacer, deplacementEnCours] = useActionState(deplacerIndicateurAction, etatInitial);

  const enLigne = indicateur.status === "PUBLISHED";
  const idSuppression = `suppr-ind-${indicateur.id}`;
  const anime = familleAnimee(indicateur.famille);

  // Ce qui identifie l'indicateur replié : ce que le site en montre. L'unité est
  // désormais linguistique — la carte repliée reprend le français, comme le
  // libellé juste en dessous.
  const resume = [indicateur.valeur, indicateur.traductions.fr.unit].filter(Boolean).join(" ");
  const libelle = indicateur.traductions.fr.label || indicateur.traductions.en.label;

  return (
    <div className="adm-item">
      <div className="adm-item__tete">
        <button
          type="button"
          className="adm-item__ouvrir"
          onClick={() => setOuverte((valeur) => !valeur)}
          aria-expanded={ouverte}
        >
          <span className="mono adm-item__rang">
            {indicateur.code || String(rang + 1).padStart(2, "0")}
          </span>
          <span className="adm-item__resume">
            <span className="mono" style={{ fontWeight: 600 }}>{resume || "—"}</span>
            {libelle && <span style={{ color: "var(--c-60)" }}> · {libelle}</span>}
          </span>
        </button>

        <div className="adm-item__etats">
          <span className={`adm-badge adm-statut adm-statut--${enLigne ? "published" : "draft"}`}>
            {PROJET_STATUT_LABEL[indicateur.status]}
          </span>

          <span className="adm-langues">
            {LOCALES.map((lang) => {
              const tr = indicateur.traductions[lang];
              const etat = !tr.existe ? t.tradManquante : tr.complete ? t.tradPresente : t.tradIncomplete;
              return (
                <span
                  key={lang}
                  className={`adm-langue${tr.complete ? " is-on" : tr.existe ? " is-partiel" : ""}`}
                  title={`${lang.toUpperCase()} · ${etat}`}
                >
                  {lang.toUpperCase()}
                </span>
              );
            })}
          </span>

          <form action={deplacer} className="adm-item__deplacer">
            <input type="hidden" name="id" value={indicateur.id} />
            <input type="hidden" name="sens" value="haut" />
            <button type="submit" className="btn btn--ghost btn--sm" disabled={rang === 0 || deplacementEnCours} title={t.blocMonter} aria-label={t.blocMonter}>↑</button>
          </form>
          <form action={deplacer} className="adm-item__deplacer">
            <input type="hidden" name="id" value={indicateur.id} />
            <input type="hidden" name="sens" value="bas" />
            <button type="submit" className="btn btn--ghost btn--sm" disabled={rang === total - 1 || deplacementEnCours} title={t.blocDescendre} aria-label={t.blocDescendre}>↓</button>
          </form>

          <form action={bascule}>
            <input type="hidden" name="id" value={indicateur.id} />
            <button type="submit" className="btn btn--outline btn--sm" disabled={basculeEnCours}>
              {enLigne ? t.depublier : t.publier}
            </button>
          </form>
        </div>
      </div>

      {etatBascule.error && <div className="auth-error" role="alert">{etatBascule.error}</div>}

      <div className="adm-item__corps" hidden={!ouverte}>
        {etatSuppression.error && <div className="auth-error" role="alert">{etatSuppression.error}</div>}

        <div className="adm-tabs" role="tablist" aria-label={t.langueRedaction}>
          {LOCALES.map((lang) => {
            const tr = indicateur.traductions[lang];
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
          <IndicateurLangue
            key={lang}
            indicateurId={indicateur.id}
            lang={lang}
            famille={indicateur.famille}
            valeurs={indicateur.traductions[lang]}
            visible={langue === lang}
            etatIA={etatsIA[lang]}
            sourceIA={sourcePourTraduire(lang, (l) => indicateur.traductions[l].existe)}
          />
        ))}

        <form action={actionReglages} className="adm-item__reglages">
          <input type="hidden" name="id" value={indicateur.id} />
          <input type="hidden" name="status" value={indicateur.status} />

          {etatReglages.error && <div className="auth-error" role="alert">{etatReglages.error}</div>}
          {etatReglages.ok && <div className="adm-ok" role="status">{etatReglages.ok}</div>}

          <div className="label-mono">{t.blocReglages}</div>

          <div className="adm-item__grille">
            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-code`}>{t.champIndCode}</label>
              <input id={`${idBase}-code`} name="code" type="text" className="field mono" defaultValue={indicateur.code} placeholder="ODP-5" />
              <p className="adm-hint" style={{ marginTop: 6 }}>{t.champIndCodeAide}</p>
            </div>

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-valeur`}>{t.champValeur}</label>
              <input id={`${idBase}-valeur`} name="valeur" type="text" className="field mono" defaultValue={indicateur.valeur} placeholder="10 000" />
              <p className="adm-hint" style={{ marginTop: 6 }}>{t.champValeurAide}</p>
            </div>

            {anime && (
              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-valeurNum`}>{t.champValeurNum}</label>
                <input id={`${idBase}-valeurNum`} name="valeurNum" type="number" className="field mono" defaultValue={indicateur.valeurNum} />
                <p className="adm-hint" style={{ marginTop: 6 }}>{t.champValeurNumAide}</p>
              </div>
            )}

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-position`}>{t.blocPosition}</label>
              <input id={`${idBase}-position`} name="position" type="number" className="field" defaultValue={indicateur.position} />
            </div>
          </div>

          {/* L'état ne se change pas ici : le bouton de la ligne le fait, et il
              porte les refus (valeur absente, aucune langue). Un second réglage
              du même état, dans un formulaire voisin, en donnerait deux. */}
          <div className="adm-actions__row">
            <button type="submit" className="btn btn--primary btn--sm" disabled={reglagesEnCours}>
              {reglagesEnCours ? t.enregistrement : t.enregistrer}
            </button>
            <button
              type="submit"
              form={idSuppression}
              className="btn btn--danger btn--sm"
              disabled={suppressionEnCours}
            >
              {t.indicateurSupprimer}
            </button>
          </div>
        </form>
      </div>

      <form
        id={idSuppression}
        action={suppression}
        hidden
        onSubmit={(event) => {
          if (!window.confirm(t.indicateurSupprimerConfirm)) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={indicateur.id} />
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Une langue d'un indicateur                                                  */
/* -------------------------------------------------------------------------- */

function IndicateurLangue({
  indicateurId,
  lang,
  famille,
  valeurs,
  visible,
  etatIA,
  sourceIA,
}: {
  indicateurId: string;
  lang: Lang;
  famille: IndicateurFamille;
  valeurs: IndicateurSaisie["traductions"][Lang];
  visible: boolean;
  etatIA: EtatVue | undefined;
  sourceIA: Lang | undefined;
}) {
  const t = ADMIN_PROJET;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(enregistrerIndicateurLangueAction, etatInitial);

  /* Le point de départ et la précision ne s'affichent que sur les grilles
     complètes — « Résultats » et les pages de composante —, que seuls les
     indicateurs d'objectif alimentent. Les demander à un intermédiaire serait
     une saisie perdue. */
  const complet = famille === "ODP";

  return (
    <div className="adm-item__langue" hidden={!visible}>
      {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

      {/* Avant les champs : on doit savoir d'où vient le texte avant de le lire. */}
      <BandeauTraduction entite="indicateur" entiteId={indicateurId} locale={lang} etat={etatIA} sourcePossible={sourceIA} actif={visible} />

      {!valeurs.existe && <p className="adm-edit__neuve">{t.tradNouvelle(LANG_LABEL[lang])}</p>}

      <form action={action} className="adm-edit__form">
        <input type="hidden" name="indicateurId" value={indicateurId} />
        <input type="hidden" name="locale" value={lang} />

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-label`}>
            {t.champLabel}
            <span className="adm-edit__requis"> obligatoire</span>
          </label>
          <textarea id={`${idBase}-label`} name="label" className="field" rows={2} defaultValue={valeurs.label} />
        </div>

        {complet && (
          <>
            {/* L'unité se lit à droite de la valeur : « millions » et « jours »
                se traduisent, « km » et « kbit/s » se recopient. */}
            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-unit`}>{t.champUnit}</label>
              <input
                id={`${idBase}-unit`}
                name="unit"
                type="text"
                className="field"
                defaultValue={valeurs.unit}
                placeholder={lang === "en" ? "million" : "millions"}
              />
              <p className="adm-hint" style={{ marginTop: 6 }}>{t.champUnitAide}</p>
            </div>

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-baseline`}>{t.champBaseline}</label>
              <input id={`${idBase}-baseline`} name="baseline" type="text" className="field" defaultValue={valeurs.baseline} placeholder="6,56 kbit/s" />
              <p className="adm-hint" style={{ marginTop: 6 }}>{t.champBaselineAide}</p>
            </div>

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-note`}>{t.champNote}</label>
              <input id={`${idBase}-note`} name="note" type="text" className="field" defaultValue={valeurs.note} placeholder="dont environ la moitié de femmes" />
              <p className="adm-hint" style={{ marginTop: 6 }}>{t.champNoteAide}</p>
            </div>
          </>
        )}

        <div className="adm-edit__actions">
          <button type="submit" className="btn btn--primary btn--sm" disabled={enCours}>
            {enCours ? t.enregistrement : t.enregistrerLangue(LANG_LABEL[lang])}
          </button>
          {valeurs.majLe && <span className="adm-hint">{t.majLe} {valeurs.majLe}</span>}
        </div>
      </form>
    </div>
  );
}
