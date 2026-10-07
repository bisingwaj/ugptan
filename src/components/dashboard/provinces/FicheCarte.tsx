"use client";

/**
 * La fiche d'une province, dépliable, avec ses onglets de langue.
 *
 * Repliée, la carte montre ce qui vieillit le plus vite : le gouverneur et la
 * date de la source qui l'atteste. Une fiche sans date se signale d'emblée, sans
 * avoir à l'ouvrir. Dépliée, l'ADMINISTRATION vient en tête des réglages, avant
 * les chiffres : c'est elle qu'on revient corriger.
 *
 * Trois formulaires, comme partout ailleurs dans la console : un par langue
 * (présentation et statut administratif), un pour les données non traduites.
 * La bascule de publication est sur la ligne.
 */
import { useActionState, useId, useState, type ReactNode } from "react";
import {
  basculerFicheAction, enregistrerFicheAction, enregistrerFicheLangueAction,
  supprimerFicheLangueAction, type ProvinceFormState,
} from "@/actions/admin-provinces";
import { ADMIN_PROVINCES } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { NAV, route } from "@/lib/routes";
import type { FicheSaisie } from "@/lib/provinces/saisie";
import { CHAMPS_FICHE, PROVINCE_STATUT_LABEL } from "@/lib/provinces/statut";
import { BandeauTraduction } from "@/components/dashboard/ia/BandeauTraduction";
import { sourcePourTraduire, type EtatVue } from "@/lib/ia/statut";
import { LANG_LABEL, OngletsLangues, PastillesLangues } from "@/components/dashboard/provinces/Langues";

const etatInitial: ProvinceFormState = { error: null, ok: null };

/** « 2025-03-12 » → « 12 mars 2025 ». Jour civil : lu en UTC, comme il est stocké. */
const jourLisible = (valeur: string): string =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${valeur}T00:00:00Z`));

/** Un champ de réglage : libellé, saisie, aide. */
function Champ({
  id, label, aide, children,
}: { id: string; label: string; aide?: string; children: ReactNode }) {
  return (
    <div className="adm-form__field">
      <label className="label-mono" htmlFor={id}>{label}</label>
      {children}
      {aide && <p className="adm-hint" style={{ marginTop: 6 }}>{aide}</p>}
    </div>
  );
}

export function FicheCarte({
  fiche,
  aVerifier,
  etatsIA,
}: {
  fiche: FicheSaisie;
  /** Gouverneur sans date de source, ou daté de plus d'un an. */
  aVerifier: boolean;
  etatsIA: Partial<Record<Lang, EtatVue>>;
}) {
  const t = ADMIN_PROVINCES;
  const idBase = useId();
  const id = (champ: string) => `${idBase}-${champ}`;
  const [langue, setLangue] = useState<Lang>("fr");
  const [ouverte, setOuverte] = useState(false);

  const [etatReglages, actionReglages, reglagesEnCours] = useActionState(enregistrerFicheAction, etatInitial);
  const [etatBascule, bascule, basculeEnCours] = useActionState(basculerFicheAction, etatInitial);

  const enLigne = fiche.status === "PUBLISHED";
  const lienPublic = route("fr", `${NAV.provinces}/${fiche.slug}`);

  return (
    <div className="adm-item">
      <div className="adm-item__tete">
        <button
          type="button"
          className="adm-item__ouvrir"
          onClick={() => setOuverte((valeur) => !valeur)}
          aria-expanded={ouverte}
        >
          <span className="adm-item__resume">
            <strong style={{ fontWeight: 600 }}>{fiche.nom}</strong>
            {fiche.gouverneur && (
              <span style={{ color: "var(--c-60)" }}>
                {" · "}{fiche.gouverneur}
                {fiche.gouverneurDate && <span className="mono"> · {t.champGouverneurDate.toLowerCase()} {jourLisible(fiche.gouverneurDate)}</span>}
              </span>
            )}
          </span>
        </button>

        <div className="adm-item__etats">
          {fiche.prio && <span className="adm-badge adm-badge--info">{t.fichePrio}</span>}
          {aVerifier && (
            <span className="adm-badge adm-badge--warn" title={fiche.gouverneurDate ? t.aReverifierAide : undefined}>
              {fiche.gouverneurDate ? t.aReverifier : t.aSourcer}
            </span>
          )}
          <span className={`adm-badge adm-statut adm-statut--${enLigne ? "published" : "draft"}`}>
            {PROVINCE_STATUT_LABEL[fiche.status]}
          </span>

          <PastillesLangues traductions={fiche.traductions} />

          <a href={lienPublic} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
            {t.voirPage} ↗
          </a>

          <form action={bascule}>
            <input type="hidden" name="id" value={fiche.id} />
            <button type="submit" className="btn btn--outline btn--sm" disabled={basculeEnCours}>
              {enLigne ? t.depublier : t.publier}
            </button>
          </form>
        </div>
      </div>

      {etatBascule.error && <div className="auth-error" role="alert">{etatBascule.error}</div>}
      {etatBascule.ok && !ouverte && <div className="adm-ok" role="status">{etatBascule.ok}</div>}

      {/* `hidden` sur le conteneur, jamais un démontage : une saisie en cours
          survit au repli de la carte. */}
      <div className="adm-item__corps" hidden={!ouverte}>
        <form action={actionReglages} className="adm-item__reglages" style={{ marginTop: 14 }}>
          <input type="hidden" name="id" value={fiche.id} />

          {etatReglages.error && <div className="auth-error" role="alert">{etatReglages.error}</div>}
          {etatReglages.ok && <div className="adm-ok" role="status">{etatReglages.ok}</div>}

          {/* L'administration d'abord : c'est la donnée qui périme. */}
          <div className="label-mono">{t.blocAdministration}</div>
          <p className="adm-hint" style={{ margin: 0, padding: "10px 12px", border: "1px solid var(--orange)", background: "#fff2e8", color: "#8a3800" }}>
            {t.blocAdministrationAide}
          </p>
          <div className="adm-item__grille">
            <Champ id={id("gouverneur")} label={t.champGouverneur}>
              <input id={id("gouverneur")} name="gouverneur" type="text" className="field" defaultValue={fiche.gouverneur} />
            </Champ>
            <Champ id={id("viceGouverneur")} label={t.champViceGouverneur}>
              <input id={id("viceGouverneur")} name="viceGouverneur" type="text" className="field" defaultValue={fiche.viceGouverneur} />
            </Champ>
            <Champ id={id("gouverneurDate")} label={t.champGouverneurDate} aide={t.champGouverneurDateAide}>
              <input id={id("gouverneurDate")} name="gouverneurDate" type="date" className="field" defaultValue={fiche.gouverneurDate} />
            </Champ>
          </div>
          <Champ id={id("gouverneurSource")} label={t.champGouverneurSource} aide={t.champGouverneurSourceAide}>
            <input id={id("gouverneurSource")} name="gouverneurSource" type="text" className="field" defaultValue={fiche.gouverneurSource} />
          </Champ>

          <div className="label-mono" style={{ marginTop: 10 }}>{t.blocChiffres}</div>
          <p className="adm-hint" style={{ margin: 0 }}>{t.blocChiffresAide}</p>
          <div className="adm-item__grille">
            <Champ id={id("chefLieu")} label={t.champChefLieu}>
              <input id={id("chefLieu")} name="chefLieu" type="text" className="field" defaultValue={fiche.chefLieu} />
            </Champ>
            <Champ id={id("superficieKm2")} label={t.champSuperficie}>
              <input id={id("superficieKm2")} name="superficieKm2" type="text" inputMode="numeric" className="field mono" defaultValue={fiche.superficieKm2} />
            </Champ>
            <Champ id={id("territoires")} label={t.champTerritoires}>
              <input id={id("territoires")} name="territoires" type="text" inputMode="numeric" className="field mono" defaultValue={fiche.territoires} />
            </Champ>
            <Champ id={id("communes")} label={t.champCommunes} aide={t.champCommunesAide}>
              <input id={id("communes")} name="communes" type="text" inputMode="numeric" className="field mono" defaultValue={fiche.communes} />
            </Champ>
          </div>
          <div className="adm-item__grille">
            <Champ id={id("population")} label={t.champPopulation} aide={t.champPopulationAide}>
              <input id={id("population")} name="population" type="text" inputMode="numeric" className="field mono" defaultValue={fiche.population} />
            </Champ>
            <Champ id={id("populationAnnee")} label={t.champPopulationAnnee}>
              <input id={id("populationAnnee")} name="populationAnnee" type="text" inputMode="numeric" maxLength={4} className="field mono" defaultValue={fiche.populationAnnee} />
            </Champ>
            <Champ id={id("populationSource")} label={t.champPopulationSource} aide={t.champPopulationSourceAide}>
              <input id={id("populationSource")} name="populationSource" type="text" className="field" defaultValue={fiche.populationSource} />
            </Champ>
          </div>

          <div className="label-mono" style={{ marginTop: 10 }}>{t.blocListes}</div>
          <div className="adm-item__grille">
            <Champ id={id("villes")} label={t.champVilles} aide={t.champVillesAide}>
              <textarea id={id("villes")} name="villes" className="field" rows={4} defaultValue={fiche.villes} />
            </Champ>
            <Champ id={id("langues")} label={t.champLangues} aide={t.champLanguesAide}>
              <textarea id={id("langues")} name="langues" className="field" rows={4} defaultValue={fiche.langues} />
            </Champ>
          </div>
          <Champ id={id("sources")} label={t.champSources} aide={t.champSourcesAide}>
            <textarea id={id("sources")} name="sources" className="field mono" rows={4} defaultValue={fiche.sources} />
          </Champ>

          <div className="adm-actions__row">
            <button type="submit" className="btn btn--primary btn--sm" disabled={reglagesEnCours}>
              {reglagesEnCours ? t.enregistrement : t.enregistrer}
            </button>
            {fiche.majLe && <span className="adm-hint">{t.ficheMaj} {fiche.majLe}</span>}
          </div>
        </form>

        <div>
          <OngletsLangues traductions={fiche.traductions} langue={langue} onChange={setLangue} etatsIA={etatsIA} />
          {LOCALES.map((lang) => (
            <FicheLangue
              key={lang}
              ficheId={fiche.id}
              lang={lang}
              valeurs={fiche.traductions[lang]}
              visible={langue === lang}
              etatIA={etatsIA[lang]}
              sourceIA={sourcePourTraduire(lang, (l) => fiche.traductions[l].existe)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Une langue d'une fiche                                                      */
/* -------------------------------------------------------------------------- */

function FicheLangue({
  ficheId,
  lang,
  valeurs,
  visible,
  etatIA,
  sourceIA,
}: {
  ficheId: string;
  lang: Lang;
  valeurs: FicheSaisie["traductions"][Lang];
  visible: boolean;
  etatIA: EtatVue | undefined;
  sourceIA: Lang | undefined;
}) {
  const t = ADMIN_PROVINCES;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(enregistrerFicheLangueAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(
    supprimerFicheLangueAction,
    etatInitial,
  );

  const idSuppression = `suppr-fiche-trad-${ficheId}-${lang}`;
  const erreur = etat.error ?? etatSuppression.error;
  const succes = etat.ok ?? etatSuppression.ok;

  return (
    <div className="adm-item__langue" hidden={!visible}>
      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      <BandeauTraduction entite="provinceFiche" entiteId={ficheId} locale={lang} etat={etatIA} sourcePossible={sourceIA} actif={visible} />

      {!valeurs.existe && <p className="adm-edit__neuve">{t.tradNouvelle(LANG_LABEL[lang])}</p>}

      <form action={action} className="adm-edit__form">
        <input type="hidden" name="ficheId" value={ficheId} />
        <input type="hidden" name="locale" value={lang} />

        {CHAMPS_FICHE.map((spec) => (
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
                rows={4}
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
          <input type="hidden" name="ficheId" value={ficheId} />
          <input type="hidden" name="locale" value={lang} />
        </form>
      )}
    </div>
  );
}
