"use client";

/**
 * Un projet localisé, dépliable, avec ses onglets de langue.
 *
 * Repliée, la carte montre ce qui décide de l'endroit où il paraît : son
 * avancement, sa composante, ses ODD et ses provinces, ou « National » s'il
 * n'en cite aucune. Une erreur de rattachement se voit ainsi sans ouvrir la
 * fiche.
 *
 * Même découpage que les cartes du module « Gouvernance » : un formulaire par
 * langue, un pour les réglages, un pour la suppression (frère et non
 * descendant, `<form>` ne s'imbriquant pas).
 */
import { useActionState, useId, useState } from "react";
import {
  basculerProjetAction, deplacerProjetAction, enregistrerProjetAction,
  enregistrerProjetLangueAction, supprimerProjetAction, supprimerProjetLangueAction,
  type ProvinceFormState,
} from "@/actions/admin-provinces";
import { ADMIN_PROVINCES } from "@/content/admin";
import { ODD } from "@/content/odd";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { ComposanteOption, ProjetSaisie, ProvinceOption } from "@/lib/provinces/saisie";
import {
  AVANCEMENTS, AVANCEMENT_LABEL, CHAMPS_PROJET, PROVINCE_STATUT_LABEL, type AvancementProjet,
} from "@/lib/provinces/statut";
import { BandeauTraduction } from "@/components/dashboard/ia/BandeauTraduction";
import { sourcePourTraduire, type EtatVue } from "@/lib/ia/statut";
import { LANG_LABEL, OngletsLangues, PastillesLangues } from "@/components/dashboard/provinces/Langues";

const etatInitial: ProvinceFormState = { error: null, ok: null };

/** Teinte du badge d'avancement, prise aux variantes d'`.adm-badge`. */
const AVANCEMENT_BADGE: Record<AvancementProjet, string> = {
  EN_COURS: "adm-badge--info",
  PREVU: "adm-badge--off",
  ACHEVE: "adm-badge--ok",
};

/** Provinces affichées sur la ligne repliée ; les suivantes se comptent. */
const PROVINCES_VISIBLES = 4;

export function ProjetCarte({
  projet,
  rang,
  total,
  etatsIA,
  provinces,
  composantes,
}: {
  projet: ProjetSaisie;
  rang: number;
  total: number;
  etatsIA: Partial<Record<Lang, EtatVue>>;
  provinces: ProvinceOption[];
  composantes: ComposanteOption[];
}) {
  const t = ADMIN_PROVINCES;
  const idBase = useId();
  const [langue, setLangue] = useState<Lang>("fr");
  const [ouverte, setOuverte] = useState(false);

  const [etatReglages, actionReglages, reglagesEnCours] = useActionState(enregistrerProjetAction, etatInitial);
  const [etatBascule, bascule, basculeEnCours] = useActionState(basculerProjetAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(supprimerProjetAction, etatInitial);
  const [etatDeplacement, deplacer, deplacementEnCours] = useActionState(deplacerProjetAction, etatInitial);

  const enLigne = projet.status === "PUBLISHED";
  const idSuppression = `suppr-projet-${projet.id}`;
  const titre = projet.traductions.fr.titre || projet.traductions.en.titre;

  const nomDe = new Map(provinces.map((p) => [p.slug, p.nom]));
  const cites = projet.provinces.map((slug) => nomDe.get(slug) ?? slug);
  const oddDe = new Map(ODD.map((o) => [o.n, o]));
  // Une composante supprimée depuis reste proposée, pour ne pas être effacée
  // à l'enregistrement suivant sans que personne l'ait voulu.
  const options = projet.composante && !composantes.some((c) => c.code === projet.composante)
    ? [...composantes, { code: projet.composante, titre: projet.composante }]
    : composantes;

  return (
    <div className="adm-item">
      <div className="adm-item__tete">
        <button
          type="button"
          className="adm-item__ouvrir"
          onClick={() => setOuverte((valeur) => !valeur)}
          aria-expanded={ouverte}
        >
          <span className={`adm-badge ${AVANCEMENT_BADGE[projet.avancement]}`} style={{ flex: "none" }}>
            {AVANCEMENT_LABEL[projet.avancement]}
          </span>
          {projet.composante && <span className="mono adm-item__rang" style={{ fontWeight: 600 }}>{projet.composante}</span>}
          <span className="adm-item__resume">{titre || t.sansTitre}</span>
        </button>

        <div className="adm-item__etats">
          <span className={`adm-badge adm-statut adm-statut--${enLigne ? "published" : "draft"}`}>
            {PROVINCE_STATUT_LABEL[projet.status]}
          </span>

          <PastillesLangues traductions={projet.traductions} />

          <form action={deplacer} className="adm-item__deplacer">
            <input type="hidden" name="id" value={projet.id} />
            <input type="hidden" name="sens" value="haut" />
            <button type="submit" className="btn btn--ghost btn--sm" disabled={rang === 0 || deplacementEnCours} title={t.monter} aria-label={t.monter}>↑</button>
          </form>
          <form action={deplacer} className="adm-item__deplacer">
            <input type="hidden" name="id" value={projet.id} />
            <input type="hidden" name="sens" value="bas" />
            <button type="submit" className="btn btn--ghost btn--sm" disabled={rang === total - 1 || deplacementEnCours} title={t.descendre} aria-label={t.descendre}>↓</button>
          </form>

          <form action={bascule}>
            <input type="hidden" name="id" value={projet.id} />
            <button type="submit" className="btn btn--outline btn--sm" disabled={basculeEnCours}>
              {enLigne ? t.depublier : t.publier}
            </button>
          </form>
        </div>
      </div>

      {/* Où le projet paraît : ses ODD, puis ses provinces. */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, padding: "0 16px 12px" }}>
        {projet.odd.map((n) => (
          <span
            key={n}
            className="mono"
            title={oddDe.get(n)?.titre.fr}
            style={{ background: oddDe.get(n)?.couleur ?? "var(--c-60)", color: "#fff", fontSize: 10.5, fontWeight: 600, padding: "3px 7px" }}
          >
            ODD {n}
          </span>
        ))}
        {cites.length === 0 ? (
          <span className="adm-badge adm-badge--on">{t.national}</span>
        ) : (
          <>
            {cites.slice(0, PROVINCES_VISIBLES).map((nom) => (
              <span key={nom} className="adm-badge adm-badge--off">{nom}</span>
            ))}
            {cites.length > PROVINCES_VISIBLES && (
              <span className="adm-badge adm-badge--off" title={cites.slice(PROVINCES_VISIBLES).join(", ")}>
                {t.provincesPlus(cites.length - PROVINCES_VISIBLES)}
              </span>
            )}
          </>
        )}
      </div>

      {etatBascule.error && <div className="auth-error" role="alert">{etatBascule.error}</div>}
      {etatDeplacement.error && <div className="auth-error" role="alert">{etatDeplacement.error}</div>}

      <div className="adm-item__corps" hidden={!ouverte}>
        {etatSuppression.error && <div className="auth-error" role="alert">{etatSuppression.error}</div>}

        <OngletsLangues traductions={projet.traductions} langue={langue} onChange={setLangue} etatsIA={etatsIA} />

        {LOCALES.map((lang) => (
          <ProjetLangue
            key={lang}
            projetId={projet.id}
            lang={lang}
            valeurs={projet.traductions[lang]}
            visible={langue === lang}
            etatIA={etatsIA[lang]}
            sourceIA={sourcePourTraduire(lang, (l) => projet.traductions[l].existe)}
          />
        ))}

        <form action={actionReglages} className="adm-item__reglages">
          <input type="hidden" name="id" value={projet.id} />

          {etatReglages.error && <div className="auth-error" role="alert">{etatReglages.error}</div>}
          {etatReglages.ok && <div className="adm-ok" role="status">{etatReglages.ok}</div>}

          <div className="label-mono">{t.reglages}</div>

          <div className="adm-item__grille">
            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-avancement`}>{t.champAvancement}</label>
              <select id={`${idBase}-avancement`} name="avancement" className="field" defaultValue={projet.avancement}>
                {AVANCEMENTS.map((av) => (
                  <option key={av} value={av}>{AVANCEMENT_LABEL[av]}</option>
                ))}
              </select>
            </div>

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-composante`}>{t.champComposante}</label>
              <select id={`${idBase}-composante`} name="composante" className="field" defaultValue={projet.composante}>
                <option value="">{t.champComposanteAucune}</option>
                {options.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} · {c.titre}</option>
                ))}
              </select>
              <p className="adm-hint" style={{ marginTop: 6 }}>{t.champComposanteAide}</p>
            </div>

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-position`}>{t.position}</label>
              <input id={`${idBase}-position`} name="position" type="number" className="field" defaultValue={projet.position} />
            </div>
          </div>

          <div className="adm-item__grille">
            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-debut`}>{t.champDebut}</label>
              <input id={`${idBase}-debut`} name="debut" type="date" className="field" defaultValue={projet.debut} />
            </div>
            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-fin`}>{t.champFin}</label>
              <input id={`${idBase}-fin`} name="fin" type="date" className="field" defaultValue={projet.fin} />
              <p className="adm-hint" style={{ marginTop: 6 }}>{t.champDatesAide}</p>
            </div>
          </div>

          <fieldset className="adm-fieldset" style={{ background: "#fff" }}>
            <legend className="label-mono" style={{ marginBottom: 0 }}>{t.champOdd}</legend>
            <p className="adm-hint" style={{ marginBottom: 10 }}>{t.champOddAide}</p>
            <div className="adm-checks">
              {ODD.map((o) => (
                <label key={o.n} className="adm-check">
                  <input type="checkbox" name="odd" value={o.n} defaultChecked={projet.odd.includes(o.n)} />
                  <span aria-hidden style={{ width: 10, height: 10, flex: "none", background: o.couleur }} />
                  <span><strong className="mono">{o.n}</strong> · {o.titre.fr}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="adm-fieldset" style={{ background: "#fff" }}>
            <legend className="label-mono" style={{ marginBottom: 0 }}>{t.champProvinces}</legend>
            <p className="adm-hint" style={{ marginBottom: 10 }}>{t.champProvincesAide}</p>
            <div className="adm-checks" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))" }}>
              {provinces.map((p) => (
                <label key={p.slug} className="adm-check">
                  <input type="checkbox" name="provinces" value={p.slug} defaultChecked={projet.provinces.includes(p.slug)} />
                  <span>
                    {p.nom}
                    {p.prio && <span className="mono" style={{ color: "var(--ac)", fontSize: 11 }} title={t.fichePrio}> ●</span>}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

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
              {t.projetSupprimer}
            </button>
          </div>
        </form>
      </div>

      <form
        id={idSuppression}
        action={suppression}
        hidden
        onSubmit={(event) => {
          if (!window.confirm(t.projetSupprimerConfirm)) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={projet.id} />
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Une langue d'un projet                                                      */
/* -------------------------------------------------------------------------- */

function ProjetLangue({
  projetId,
  lang,
  valeurs,
  visible,
  etatIA,
  sourceIA,
}: {
  projetId: string;
  lang: Lang;
  valeurs: ProjetSaisie["traductions"][Lang];
  visible: boolean;
  etatIA: EtatVue | undefined;
  sourceIA: Lang | undefined;
}) {
  const t = ADMIN_PROVINCES;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(enregistrerProjetLangueAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(
    supprimerProjetLangueAction,
    etatInitial,
  );

  const idSuppression = `suppr-projet-trad-${projetId}-${lang}`;
  const erreur = etat.error ?? etatSuppression.error;
  const succes = etat.ok ?? etatSuppression.ok;

  return (
    <div className="adm-item__langue" hidden={!visible}>
      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      <BandeauTraduction entite="provinceProjet" entiteId={projetId} locale={lang} etat={etatIA} sourcePossible={sourceIA} actif={visible} />

      {!valeurs.existe && <p className="adm-edit__neuve">{t.tradNouvelle(LANG_LABEL[lang])}</p>}

      <form action={action} className="adm-edit__form">
        <input type="hidden" name="projetId" value={projetId} />
        <input type="hidden" name="locale" value={lang} />

        {CHAMPS_PROJET.map((spec) => (
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
          <input type="hidden" name="projetId" value={projetId} />
          <input type="hidden" name="locale" value={lang} />
        </form>
      )}
    </div>
  );
}
