"use client";

/**
 * Une décision de la chronique, dépliable, avec ses onglets de langue.
 *
 * Repliée, la carte montre la pastille de l'instance et la date rédigée : c'est
 * ce par quoi la chronique se relit, et il faut pouvoir vérifier son ordre sans
 * ouvrir cinq fiches.
 */
import { useActionState, useId, useState } from "react";
import {
  basculerActiviteAction, deplacerActiviteAction, enregistrerActiviteAction,
  enregistrerActiviteLangueAction, supprimerActiviteAction, type GouvFormState,
} from "@/actions/admin-gouvernance";
import { ADMIN_GOUVERNANCE } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { ActiviteSaisie } from "@/lib/gouvernance/saisie";
import { CHAMPS_ACTIVITE, GOUV_STATUT_LABEL } from "@/lib/gouvernance/statut";
import { ChampCouleur } from "@/components/dashboard/ChampCouleur";

const etatInitial: GouvFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function ActiviteCarte({
  activite,
  rang,
  total,
}: {
  activite: ActiviteSaisie;
  rang: number;
  total: number;
}) {
  const t = ADMIN_GOUVERNANCE;
  const idBase = useId();
  const [langue, setLangue] = useState<Lang>("fr");
  const [ouverte, setOuverte] = useState(false);

  const [etatReglages, actionReglages, reglagesEnCours] = useActionState(enregistrerActiviteAction, etatInitial);
  const [etatBascule, bascule, basculeEnCours] = useActionState(basculerActiviteAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(supprimerActiviteAction, etatInitial);
  const [, deplacer, deplacementEnCours] = useActionState(deplacerActiviteAction, etatInitial);

  const enLigne = activite.status === "PUBLISHED";
  const idSuppression = `suppr-act-${activite.id}`;
  const fr = activite.traductions.fr;
  const en = activite.traductions.en;

  return (
    <div className="adm-item">
      <div className="adm-item__tete">
        <button
          type="button"
          className="adm-item__ouvrir"
          onClick={() => setOuverte((valeur) => !valeur)}
          aria-expanded={ouverte}
        >
          {/* La pastille reprend la couleur du site : la chronique se relit à
              l'instance autant qu'à la date. */}
          <span
            className="mono adm-item__rang"
            style={{ background: activite.color, color: "#fff", padding: "3px 8px", fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase" }}
          >
            {activite.org}
          </span>
          <span className="adm-item__resume">
            {fr.dateLabel && <span className="mono" style={{ color: "var(--c-60)" }}>{fr.dateLabel} · </span>}
            {fr.titre || en.titre || t.sansTitre}
          </span>
        </button>

        <div className="adm-item__etats">
          <span className={`adm-badge adm-statut adm-statut--${enLigne ? "published" : "draft"}`}>
            {GOUV_STATUT_LABEL[activite.status]}
          </span>

          <span className="adm-langues">
            {LOCALES.map((lang) => {
              const tr = activite.traductions[lang];
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
            <input type="hidden" name="id" value={activite.id} />
            <input type="hidden" name="sens" value="haut" />
            <button type="submit" className="btn btn--ghost btn--sm" disabled={rang === 0 || deplacementEnCours} title={t.monter} aria-label={t.monter}>↑</button>
          </form>
          <form action={deplacer} className="adm-item__deplacer">
            <input type="hidden" name="id" value={activite.id} />
            <input type="hidden" name="sens" value="bas" />
            <button type="submit" className="btn btn--ghost btn--sm" disabled={rang === total - 1 || deplacementEnCours} title={t.descendre} aria-label={t.descendre}>↓</button>
          </form>

          <form action={bascule}>
            <input type="hidden" name="id" value={activite.id} />
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
            const tr = activite.traductions[lang];
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
          <ActiviteLangue
            key={lang}
            activiteId={activite.id}
            lang={lang}
            valeurs={activite.traductions[lang]}
            visible={langue === lang}
          />
        ))}

        <form action={actionReglages} className="adm-item__reglages">
          <input type="hidden" name="id" value={activite.id} />
          <input type="hidden" name="status" value={activite.status} />

          {etatReglages.error && <div className="auth-error" role="alert">{etatReglages.error}</div>}
          {etatReglages.ok && <div className="adm-ok" role="status">{etatReglages.ok}</div>}

          <div className="label-mono">{t.reglages}</div>

          <div className="adm-item__grille">
            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-org`}>{t.champOrg}</label>
              <input id={`${idBase}-org`} name="org" type="text" className="field" defaultValue={activite.org} required />
              <p className="adm-hint" style={{ marginTop: 6 }}>{t.champOrgAide}</p>
            </div>

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-dateAt`}>{t.champDate}</label>
              <input id={`${idBase}-dateAt`} name="dateAt" type="date" className="field" defaultValue={activite.dateAt} />
              <p className="adm-hint" style={{ marginTop: 6 }}>{t.champDateAide}</p>
            </div>

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-position`}>{t.position}</label>
              <input id={`${idBase}-position`} name="position" type="number" className="field" defaultValue={activite.position} />
            </div>
          </div>

          <ChampCouleur defaultValue={activite.color} label={t.champCouleur} aide={t.champCouleurAide} />

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
              {t.activiteSupprimer}
            </button>
          </div>
        </form>
      </div>

      <form
        id={idSuppression}
        action={suppression}
        hidden
        onSubmit={(event) => {
          if (!window.confirm(t.activiteSupprimerConfirm)) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={activite.id} />
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Une langue d'une décision                                                   */
/* -------------------------------------------------------------------------- */

function ActiviteLangue({
  activiteId,
  lang,
  valeurs,
  visible,
}: {
  activiteId: string;
  lang: Lang;
  valeurs: ActiviteSaisie["traductions"][Lang];
  visible: boolean;
}) {
  const t = ADMIN_GOUVERNANCE;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(enregistrerActiviteLangueAction, etatInitial);

  return (
    <div className="adm-item__langue" hidden={!visible}>
      {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

      {!valeurs.existe && <p className="adm-edit__neuve">{t.tradNouvelle(LANG_LABEL[lang])}</p>}

      <form action={action} className="adm-edit__form">
        <input type="hidden" name="activiteId" value={activiteId} />
        <input type="hidden" name="locale" value={lang} />

        {CHAMPS_ACTIVITE.map((spec) => (
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
                rows={3}
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
          {valeurs.majLe && <span className="adm-hint">{t.majLe} {valeurs.majLe}</span>}
        </div>
      </form>
    </div>
  );
}
