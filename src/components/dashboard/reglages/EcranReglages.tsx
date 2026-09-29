"use client";

/**
 * L'écran « Réglages » : fermeture du site public et code d'accès.
 *
 * Trois blocs, dans l'ordre où l'on s'en sert. L'état d'abord, parce que la
 * première question en ouvrant l'écran est « le site est-il ouvert ? ». Le code
 * ensuite, qui doit exister avant toute fermeture. Le texte vu par le public en
 * dernier, avec son aperçu : on ne ferme pas un site institutionnel sans avoir
 * lu ce que liront les partenaires.
 *
 * Deux formulaires distincts, comme dans l'action correspondante : régler ne
 * ferme pas, fermer ne règle pas.
 */
import { useActionState, useId, useState } from "react";
import {
  basculerMaintenanceAction, enregistrerReglagesAction, type ReglagesFormState,
} from "@/actions/admin-reglages";
import { ADMIN_REGLAGES } from "@/content/admin";
import { dict } from "@/content/i18n";
import { formatDateTime, toDateTimeLocal } from "@/lib/format";
import { codeAleatoire } from "@/lib/reglages/code";
import type { ReglagesSaisie } from "@/lib/reglages/edition";
import type { Lang } from "@/lib/pick";

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

const etatInitial: ReglagesFormState = { error: null, ok: null };

export function EcranReglages({ reglages }: { reglages: ReglagesSaisie }) {
  const t = ADMIN_REGLAGES;
  const idBase = useId();

  const [etatReglages, enregistrer, enregistrementEnCours] = useActionState(
    enregistrerReglagesAction, etatInitial,
  );
  const [etatBascule, basculer, basculeEnCours] = useActionState(
    basculerMaintenanceAction, etatInitial,
  );

  /* Le code et les messages sont pilotés : le premier pour que le tirage au
     sort remplisse le champ, les seconds pour que l'aperçu suive la frappe. */
  const [code, setCode] = useState(reglages.code);
  const [messageFr, setMessageFr] = useState(reglages.messageFr);
  const [messageEn, setMessageEn] = useState(reglages.messageEn);

  const ferme = reglages.maintenance;
  const apercus: Record<Lang, string> = {
    fr: messageFr.trim() || dict("fr").maintenance.corps,
    en: messageEn.trim() || dict("en").maintenance.corps,
  };

  return (
    <>
      <div className="adm-entete">
        <div>
          <h1 className="adm__title">{t.title}</h1>
          <p className="adm__lead">{t.lead}</p>
        </div>
      </div>

      {/* --- État -------------------------------------------------------- */}
      <section className="adm-card" style={{ marginTop: 32 }}>
        <div className="adm-items__tete">
          <div style={{ minWidth: 0 }}>
            <h2 className="adm__section-title" style={{ margin: 0 }}>{t.etatTitre}</h2>
            <p className="adm-hint" style={{ marginTop: 4 }}>
              {ferme ? t.etatFermeAide : t.etatOuvertAide}
            </p>
          </div>
          <span className={`adm-badge ${ferme ? "adm-badge--warn" : "adm-badge--on"}`}>
            {ferme ? t.etatFerme : t.etatOuvert}
          </span>
        </div>

        {(reglages.depuis || reglages.majLe) && (
          <dl className="adm-defs" style={{ marginTop: 16 }}>
            {ferme && reglages.depuis && (
              <div className="adm-defs__row">
                <dt>{t.depuis}</dt>
                <dd className="adm-defs__val">{formatDateTime(reglages.depuis)}</dd>
              </div>
            )}
            {reglages.majLe && (
              <div className="adm-defs__row">
                <dt>{t.derniereMaj}</dt>
                <dd className="adm-defs__val">
                  {formatDateTime(reglages.majLe)}
                  {reglages.majPar ? ` ${t.parQui} ${reglages.majPar}` : ""}
                </dd>
              </div>
            )}
          </dl>
        )}

        <form action={basculer} style={{ marginTop: 18 }}>
          <input type="hidden" name="fermer" value={ferme ? "0" : "1"} />

          {etatBascule.error && <div className="auth-error" role="alert">{etatBascule.error}</div>}
          {etatBascule.ok && <div className="adm-ok" role="status">{etatBascule.ok}</div>}

          {!ferme && !reglages.code && (
            <p className="adm-hint" style={{ marginBottom: 10 }}>{t.accesManquant}</p>
          )}

          <button
            type="submit"
            className={`btn btn--sm ${ferme ? "btn--primary" : "btn--danger"}`}
            disabled={basculeEnCours || (!ferme && !reglages.code)}
            /* Confirmation native : la fermeture retire le site au public, et
               rien dans la console ne se rattrape aussi vite qu'un clic. */
            onClick={(e) => {
              if (!ferme && !window.confirm(t.fermerConfirmation)) e.preventDefault();
            }}
          >
            {ferme
              ? (basculeEnCours ? t.rouvrirEnCours : t.rouvrir)
              : (basculeEnCours ? t.fermerEnCours : t.fermer)}
          </button>
        </form>
      </section>

      {/* --- Code et texte public ---------------------------------------- */}
      <form action={enregistrer}>
        <section className="adm-card" style={{ marginTop: 24 }}>
          <h2 className="adm__section-title" style={{ margin: 0 }}>{t.accesTitre}</h2>
          <p className="adm-hint" style={{ marginTop: 4 }}>{t.accesAide}</p>

          <div className="adm-form__field" style={{ marginTop: 16, maxWidth: 440 }}>
            <label className="label-mono" htmlFor={`${idBase}-code`}>{t.accesLabel}</label>
            <div className="adm-actions__row" style={{ alignItems: "center" }}>
              <input
                id={`${idBase}-code`}
                name="code"
                type="text"
                className="field mono"
                style={{ maxWidth: 190, letterSpacing: "0.22em" }}
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              />
              <button type="button" className="btn btn--outline btn--sm" onClick={() => setCode(codeAleatoire())}>
                {t.accesTirer}
              </button>
            </div>
          </div>
        </section>

        <section className="adm-card" style={{ marginTop: 24 }}>
          <h2 className="adm__section-title" style={{ margin: 0 }}>{t.publicTitre}</h2>
          <p className="adm-hint" style={{ marginTop: 4 }}>{t.publicAide}</p>

          <div className="adm-form__field" style={{ marginTop: 16, maxWidth: 320 }}>
            <label className="label-mono" htmlFor={`${idBase}-jusqua`}>{t.retourLabel}</label>
            <input
              id={`${idBase}-jusqua`}
              name="jusqua"
              type="datetime-local"
              className="field"
              defaultValue={toDateTimeLocal(reglages.jusqua)}
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.retourAide}</p>
          </div>

          <div className="adm-item__grille" style={{ marginTop: 16 }}>
            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-fr`}>{t.messageFr}</label>
              <textarea
                id={`${idBase}-fr`}
                name="messageFr"
                className="field"
                rows={4}
                maxLength={600}
                value={messageFr}
                onChange={(e) => setMessageFr(e.target.value)}
              />
            </div>
            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-en`}>{t.messageEn}</label>
              <textarea
                id={`${idBase}-en`}
                name="messageEn"
                className="field"
                rows={4}
                maxLength={600}
                value={messageEn}
                onChange={(e) => setMessageEn(e.target.value)}
              />
            </div>
          </div>
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.messageAide}</p>

          <div style={{ marginTop: 22 }}>
            <div className="label-mono">{t.apercuTitre}</div>
            <p className="adm-hint" style={{ marginTop: 4 }}>{t.apercuAide}</p>
            <div className="adm-reglages__apercus">
              {(Object.keys(apercus) as Lang[]).map((lang) => (
                <figure key={lang} className="adm-reglages__apercu">
                  <figcaption className="adm-reglages__apercu-langue mono">{LANG_LABEL[lang]}</figcaption>
                  <p className="adm-reglages__apercu-titre">{dict(lang).maintenance.titre}</p>
                  <p className="adm-reglages__apercu-corps">{apercus[lang]}</p>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <div className="adm-actions" style={{ marginTop: 20 }}>
          {etatReglages.error && <div className="auth-error" role="alert">{etatReglages.error}</div>}
          {etatReglages.ok && <div className="adm-ok" role="status">{etatReglages.ok}</div>}
          {/* Rangée plutôt que fils direct de `.adm-actions`, qui est une colonne
              et étirerait le bouton sur toute la largeur de l'écran. */}
          <div className="adm-actions__row">
            <button type="submit" className="btn btn--primary" disabled={enregistrementEnCours}>
              {enregistrementEnCours ? t.enregistrement : t.enregistrer}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
