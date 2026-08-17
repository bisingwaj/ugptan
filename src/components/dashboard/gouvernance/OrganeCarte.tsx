"use client";

/**
 * Un organe de gouvernance, dépliable, avec ses onglets de langue.
 *
 * Repliée, la carte montre ce que le site montre — le sigle et le nom — plus
 * l'état et les langues qui manquent. Dépliée, elle porte les huit champs de la
 * fiche, puis ses réglages.
 *
 * Trois formulaires, comme partout ailleurs dans la console : un par langue, un
 * pour les réglages, un pour la suppression — frère et non descendant, `<form>`
 * ne s'imbriquant pas.
 */
import { useActionState, useId, useState } from "react";
import {
  basculerOrganeAction, deplacerOrganeAction, enregistrerOrganeAction,
  enregistrerOrganeLangueAction, supprimerOrganeAction, supprimerOrganeLangueAction,
  type GouvFormState,
} from "@/actions/admin-gouvernance";
import { ADMIN_GOUVERNANCE } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { OrganeSaisie } from "@/lib/gouvernance/saisie";
import { CHAMPS_ORGANE, GOUV_STATUT_LABEL } from "@/lib/gouvernance/statut";

const etatInitial: GouvFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function OrganeCarte({
  organe,
  rang,
  total,
}: {
  organe: OrganeSaisie;
  rang: number;
  total: number;
}) {
  const t = ADMIN_GOUVERNANCE;
  const idBase = useId();
  const [langue, setLangue] = useState<Lang>("fr");
  const [ouverte, setOuverte] = useState(false);

  const [etatReglages, actionReglages, reglagesEnCours] = useActionState(enregistrerOrganeAction, etatInitial);
  const [etatBascule, bascule, basculeEnCours] = useActionState(basculerOrganeAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(supprimerOrganeAction, etatInitial);
  const [, deplacer, deplacementEnCours] = useActionState(deplacerOrganeAction, etatInitial);

  const enLigne = organe.status === "PUBLISHED";
  const idSuppression = `suppr-organe-${organe.id}`;
  const nom = organe.traductions.fr.nom || organe.traductions.en.nom;

  return (
    <div className="adm-item">
      <div className="adm-item__tete">
        <button
          type="button"
          className="adm-item__ouvrir"
          onClick={() => setOuverte((valeur) => !valeur)}
          aria-expanded={ouverte}
        >
          <span className="mono adm-item__rang" style={{ fontWeight: 600 }}>{organe.sigle}</span>
          <span className="adm-item__resume">{nom || t.sansTitre}</span>
        </button>

        <div className="adm-item__etats">
          <span className={`adm-badge adm-statut adm-statut--${enLigne ? "published" : "draft"}`}>
            {GOUV_STATUT_LABEL[organe.status]}
          </span>

          <span className="adm-langues">
            {LOCALES.map((lang) => {
              const tr = organe.traductions[lang];
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
            <input type="hidden" name="id" value={organe.id} />
            <input type="hidden" name="sens" value="haut" />
            <button type="submit" className="btn btn--ghost btn--sm" disabled={rang === 0 || deplacementEnCours} title={t.monter} aria-label={t.monter}>↑</button>
          </form>
          <form action={deplacer} className="adm-item__deplacer">
            <input type="hidden" name="id" value={organe.id} />
            <input type="hidden" name="sens" value="bas" />
            <button type="submit" className="btn btn--ghost btn--sm" disabled={rang === total - 1 || deplacementEnCours} title={t.descendre} aria-label={t.descendre}>↓</button>
          </form>

          <form action={bascule}>
            <input type="hidden" name="id" value={organe.id} />
            <button type="submit" className="btn btn--outline btn--sm" disabled={basculeEnCours}>
              {enLigne ? t.depublier : t.publier}
            </button>
          </form>
        </div>
      </div>

      {etatBascule.error && <div className="auth-error" role="alert">{etatBascule.error}</div>}

      {/* `hidden` sur le conteneur, jamais un démontage : une saisie en cours
          survit au repli de la carte. */}
      <div className="adm-item__corps" hidden={!ouverte}>
        {etatSuppression.error && <div className="auth-error" role="alert">{etatSuppression.error}</div>}

        <div className="adm-tabs" role="tablist" aria-label={t.langueRedaction}>
          {LOCALES.map((lang) => {
            const tr = organe.traductions[lang];
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
          <OrganeLangue
            key={lang}
            organeId={organe.id}
            lang={lang}
            valeurs={organe.traductions[lang]}
            visible={langue === lang}
          />
        ))}

        <form action={actionReglages} className="adm-item__reglages">
          <input type="hidden" name="id" value={organe.id} />
          <input type="hidden" name="status" value={organe.status} />

          {etatReglages.error && <div className="auth-error" role="alert">{etatReglages.error}</div>}
          {etatReglages.ok && <div className="adm-ok" role="status">{etatReglages.ok}</div>}

          <div className="label-mono">{t.reglages}</div>

          <div className="adm-item__grille">
            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-sigle`}>{t.champSigle}</label>
              <input id={`${idBase}-sigle`} name="sigle" type="text" className="field mono" defaultValue={organe.sigle} required />
              <p className="adm-hint" style={{ marginTop: 6 }}>{t.champSigleAide}</p>
            </div>

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-position`}>{t.position}</label>
              <input id={`${idBase}-position`} name="position" type="number" className="field" defaultValue={organe.position} />
            </div>
          </div>

          {/* L'état ne se change pas ici : le bouton de la ligne le fait, et il
              porte les refus. Un second réglage du même état, dans un
              formulaire voisin, en donnerait deux. */}
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
              {t.organeSupprimer}
            </button>
          </div>
        </form>
      </div>

      <form
        id={idSuppression}
        action={suppression}
        hidden
        onSubmit={(event) => {
          if (!window.confirm(t.organeSupprimerConfirm)) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={organe.id} />
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Une langue d'un organe                                                      */
/* -------------------------------------------------------------------------- */

function OrganeLangue({
  organeId,
  lang,
  valeurs,
  visible,
}: {
  organeId: string;
  lang: Lang;
  valeurs: OrganeSaisie["traductions"][Lang];
  visible: boolean;
}) {
  const t = ADMIN_GOUVERNANCE;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(enregistrerOrganeLangueAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(
    supprimerOrganeLangueAction,
    etatInitial,
  );

  const idSuppression = `suppr-organe-trad-${organeId}-${lang}`;
  const erreur = etat.error ?? etatSuppression.error;
  const succes = etat.ok ?? etatSuppression.ok;

  return (
    <div className="adm-item__langue" hidden={!visible}>
      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      {!valeurs.existe && <p className="adm-edit__neuve">{t.tradNouvelle(LANG_LABEL[lang])}</p>}

      <form action={action} className="adm-edit__form">
        <input type="hidden" name="organeId" value={organeId} />
        <input type="hidden" name="locale" value={lang} />

        {CHAMPS_ORGANE.map((spec) => (
          <div key={spec.champ} className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-${spec.champ}`}>
              {spec.label}
              {spec.requis && <span className="adm-edit__requis"> obligatoire</span>}
            </label>
            {spec.long ? (
              <textarea
                id={`${idBase}-${spec.champ}`}
                name={spec.champ}
                className="field"
                rows={spec.champ === "membres" ? 8 : 4}
                defaultValue={valeurs[spec.champ]}
                placeholder={spec.placeholder}
              />
            ) : (
              <input
                id={`${idBase}-${spec.champ}`}
                name={spec.champ}
                type="text"
                className="field"
                defaultValue={valeurs[spec.champ]}
                placeholder={spec.placeholder}
              />
            )}
            {spec.aide && <p className="adm-hint" style={{ marginTop: 6 }}>{spec.aide}</p>}
          </div>
        ))}

        <div className="adm-edit__actions">
          <button type="submit" className="btn btn--primary btn--sm" disabled={enCours}>
            {enCours ? t.enregistrement : t.enregistrerLangue(LANG_LABEL[lang])}
          </button>

          {valeurs.existe && (
            <button
              type="submit"
              form={idSuppression}
              className="btn btn--danger btn--sm"
              disabled={suppressionEnCours}
            >
              {t.supprimerTraduction}
            </button>
          )}

          {valeurs.majLe && <span className="adm-hint">{t.majLe} {valeurs.majLe}</span>}
        </div>
      </form>

      {valeurs.existe && (
        <form
          id={idSuppression}
          action={suppression}
          hidden
          onSubmit={(event) => {
            if (!window.confirm(t.supprimerTraductionConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="organeId" value={organeId} />
          <input type="hidden" name="locale" value={lang} />
        </form>
      )}
    </div>
  );
}
