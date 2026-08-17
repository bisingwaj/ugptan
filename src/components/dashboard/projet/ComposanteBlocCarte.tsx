"use client";

/**
 * Une ENTRÉE d'une section de composante, dépliable, avec ses onglets de langue.
 *
 * Même dispositif que `ImpactItemCarte`, et pour les mêmes raisons : une entrée
 * porte deux à cinq champs, lui donner sa propre page ferait traverser deux
 * écrans pour corriger une phrase. Repliée, la carte tient sur une ligne et dit
 * l'essentiel — l'intitulé, l'état, les langues qui manquent.
 *
 * Trois formulaires, comme partout ailleurs dans la console :
 *   · un par langue, pour les textes ;
 *   · un pour les réglages non linguistiques (rang, référence, visuel) ;
 *   · un pour la suppression, FRÈRE et non descendant — imbriquer deux `<form>`
 *     n'est pas permis en HTML, le navigateur en écarterait un.
 *
 * Les champs demandés dépendent du TYPE de l'entrée, et leurs intitulés avec
 * eux : le modèle est générique, la console ne l'est jamais (cf. `CHAMPS_BLOC`
 * dans lib/projet/statut.ts).
 */
import { useActionState, useId, useState } from "react";
import {
  deplacerBlocAction, enregistrerBlocAction, enregistrerBlocLangueAction,
  supprimerBlocAction, supprimerBlocLangueAction, type ProjetFormState,
} from "@/actions/admin-projet";
import { ADMIN_PROJET } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { BlocSaisie } from "@/lib/projet/saisie";
import {
  CHAMPS_BLOC, LABEL_REFERENCE, PROJET_BLOC_STATUT_LABEL, PROJET_STATUSES,
  reglageBlocActif, type ComposanteBlocType,
} from "@/lib/projet/statut";
import { mediaSrc, type MediaRef } from "@/lib/medias";
import { MediaPicker, type ChoixMedia } from "@/components/dashboard/actus/MediaPicker";

const etatInitial: ProjetFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function ComposanteBlocCarte({
  bloc,
  assets,
  voisines,
  rang,
  total,
}: {
  bloc: BlocSaisie;
  assets: MediaRef[];
  /** Composantes rattachables, pour le renvoi d'un bloc `PB_LIEN`. */
  voisines: { code: string; nom: string }[];
  rang: number;
  total: number;
}) {
  const t = ADMIN_PROJET;
  const idBase = useId();
  const [langue, setLangue] = useState<Lang>("fr");
  const [ouverte, setOuverte] = useState(false);

  const [etatReglages, actionReglages, reglagesEnCours] = useActionState(enregistrerBlocAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(supprimerBlocAction, etatInitial);
  const [, deplacer, deplacementEnCours] = useActionState(deplacerBlocAction, etatInitial);

  const [visuel, setVisuel] = useState({
    mediaId: bloc.coverMediaId,
    key: bloc.coverKey,
    src: bloc.coverSrc,
  });
  const [picker, setPicker] = useState(false);

  const champs = CHAMPS_BLOC[bloc.type];
  const avecVisuel = reglageBlocActif(bloc.type, "visuel");
  const reference = LABEL_REFERENCE[bloc.type];
  const idSuppression = `suppr-bloc-${bloc.id}`;

  // Ce qui identifie l'entrée repliée : le premier champ requis renseigné en
  // français, à défaut la référence, à défaut rien de mieux.
  const resume =
    champs
      .map((spec) => {
        const valeur = bloc.traductions.fr[spec.champ];
        // Un champ à lignes multiples se résume à sa première ligne.
        return valeur.split("\n")[0] ?? "";
      })
      .find((valeur) => valeur.trim().length > 0) ?? bloc.reference;

  const choisirVisuel = (choix: ChoixMedia) => {
    setPicker(false);
    setVisuel(
      choix.kind === "asset"
        ? { mediaId: choix.asset.id, key: "", src: mediaSrc(choix.asset) }
        : { mediaId: "", key: choix.key, src: choix.src },
    );
  };

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
            {bloc.reference || String(rang + 1).padStart(2, "0")}
          </span>
          <span className="adm-item__resume">{resume.trim() || t.blocSansTitre}</span>
        </button>

        <div className="adm-item__etats">
          <span className={`adm-badge adm-statut adm-statut--${bloc.status === "PUBLISHED" ? "published" : "draft"}`}>
            {PROJET_BLOC_STATUT_LABEL[bloc.status]}
          </span>

          <span className="adm-langues">
            {LOCALES.map((lang) => {
              const tr = bloc.traductions[lang];
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

          {/* Deux formulaires d'un seul bouton : le déplacement n'a pas d'état
              à afficher, il réordonne et la page se relit. */}
          <form action={deplacer} className="adm-item__deplacer">
            <input type="hidden" name="id" value={bloc.id} />
            <input type="hidden" name="sens" value="haut" />
            <button type="submit" className="btn btn--ghost btn--sm" disabled={rang === 0 || deplacementEnCours} title={t.blocMonter} aria-label={t.blocMonter}>↑</button>
          </form>
          <form action={deplacer} className="adm-item__deplacer">
            <input type="hidden" name="id" value={bloc.id} />
            <input type="hidden" name="sens" value="bas" />
            <button type="submit" className="btn btn--ghost btn--sm" disabled={rang === total - 1 || deplacementEnCours} title={t.blocDescendre} aria-label={t.blocDescendre}>↓</button>
          </form>
        </div>
      </div>

      {/* `hidden` sur le conteneur, jamais un démontage : une saisie en cours
          survit au repli de la carte. */}
      <div className="adm-item__corps" hidden={!ouverte}>
        {etatSuppression.error && <div className="auth-error" role="alert">{etatSuppression.error}</div>}

        <div className="adm-tabs" role="tablist" aria-label="Langue de rédaction">
          {LOCALES.map((lang) => {
            const tr = bloc.traductions[lang];
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
          <BlocLangue
            key={lang}
            blocId={bloc.id}
            lang={lang}
            type={bloc.type}
            valeurs={bloc.traductions[lang]}
            visible={langue === lang}
          />
        ))}

        <form action={actionReglages} className="adm-item__reglages">
          <input type="hidden" name="id" value={bloc.id} />

          {etatReglages.error && <div className="auth-error" role="alert">{etatReglages.error}</div>}
          {etatReglages.ok && <div className="adm-ok" role="status">{etatReglages.ok}</div>}

          <div className="label-mono">{t.blocReglages}</div>

          <div className="adm-item__grille">
            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-status`}>{t.blocStatut}</label>
              <select id={`${idBase}-status`} name="status" className="field" defaultValue={bloc.status}>
                {PROJET_STATUSES.map((valeur) => (
                  <option key={valeur} value={valeur}>{PROJET_BLOC_STATUT_LABEL[valeur]}</option>
                ))}
              </select>
            </div>

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-position`}>{t.blocPosition}</label>
              <input id={`${idBase}-position`} name="position" type="number" className="field" defaultValue={bloc.position} />
            </div>

            {reference && (
              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-reference`}>{reference.label}</label>
                <input id={`${idBase}-reference`} name="reference" type="text" className="field mono" defaultValue={bloc.reference} />
                <p className="adm-hint" style={{ marginTop: 6 }}>{reference.aide}</p>
              </div>
            )}

            {reglageBlocActif(bloc.type, "montant") && (
              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-montant`}>{t.champMontantBloc}</label>
                <input id={`${idBase}-montant`} name="montant" type="text" inputMode="decimal" className="field mono" defaultValue={bloc.montant} />
                <p className="adm-hint" style={{ marginTop: 6 }}>{t.champMontantAide}</p>
              </div>
            )}

            {reglageBlocActif(bloc.type, "sigle") && (
              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-sigle`}>{t.champSigle}</label>
                <input id={`${idBase}-sigle`} name="sigle" type="text" className="field mono" defaultValue={bloc.sigle} placeholder="GOVNET" />
                <p className="adm-hint" style={{ marginTop: 6 }}>{t.champSigleAide}</p>
              </div>
            )}

            {reglageBlocActif(bloc.type, "slug") && (
              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-slug`}>{t.champAncre}</label>
                <input id={`${idBase}-slug`} name="slug" type="text" className="field mono" spellCheck={false} defaultValue={bloc.slug} placeholder="cloud-souverain" />
                <p className="adm-hint" style={{ marginTop: 6 }}>{t.champAncreAide}</p>
              </div>
            )}

            {reglageBlocActif(bloc.type, "cible") && (
              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-cible`}>{t.champCible}</label>
                <select id={`${idBase}-cible`} name="cible" className="field" defaultValue={bloc.cible}>
                  <option value="">{t.cibleAucune}</option>
                  {voisines.map((voisine) => (
                    <option key={voisine.code} value={voisine.code}>
                      {voisine.code} — {voisine.nom}
                    </option>
                  ))}
                </select>
                <p className="adm-hint" style={{ marginTop: 6 }}>{t.champCibleAide}</p>
              </div>
            )}
          </div>

          {avecVisuel && (
            <div className="adm-form__field">
              <span className="label-mono">{t.champVisuel}</span>
              <div className="adm-edit__cover" style={{ marginTop: 8, maxWidth: 260 }}>
                {visuel.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={visuel.src} alt="" className="adm-edit__cover-img" />
                ) : (
                  <span className="adm-edit__cover-vide">{t.aucunVisuel}</span>
                )}
              </div>

              <input type="hidden" name="coverMediaId" value={visuel.mediaId} />
              <input type="hidden" name="coverKey" value={visuel.key} />

              <div className="adm-actions__row" style={{ marginTop: 10 }}>
                <button type="button" className="btn btn--outline btn--sm" onClick={() => setPicker(true)}>
                  {visuel.src ? t.changerVisuel : t.choisirVisuel}
                </button>
                {visuel.src && (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => setVisuel({ mediaId: "", key: "", src: "" })}
                  >
                    {t.retirerVisuel}
                  </button>
                )}
              </div>
              <p className="adm-hint" style={{ marginTop: 8 }}>{t.visuelPartage}</p>
            </div>
          )}

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
              {t.blocSupprimer}
            </button>
          </div>
        </form>
      </div>

      <form
        id={idSuppression}
        action={suppression}
        hidden
        onSubmit={(event) => {
          if (!window.confirm(t.blocSupprimerConfirm)) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={bloc.id} />
      </form>

      {avecVisuel && (
        <MediaPicker
          open={picker}
          assets={assets}
          avecRegistre
          onClose={() => setPicker(false)}
          onSelect={choisirVisuel}
          titre={t.champVisuel}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Une langue d'une entrée                                                     */
/* -------------------------------------------------------------------------- */

function BlocLangue({
  blocId,
  lang,
  type,
  valeurs,
  visible,
}: {
  blocId: string;
  lang: Lang;
  type: ComposanteBlocType;
  valeurs: BlocSaisie["traductions"][Lang];
  visible: boolean;
}) {
  const t = ADMIN_PROJET;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(enregistrerBlocLangueAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(
    supprimerBlocLangueAction,
    etatInitial,
  );

  const idSuppression = `suppr-bloc-trad-${blocId}-${lang}`;
  const erreur = etat.error ?? etatSuppression.error;
  const succes = etat.ok ?? etatSuppression.ok;

  return (
    <div className="adm-item__langue" hidden={!visible}>
      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      {!valeurs.existe && <p className="adm-edit__neuve">{t.tradNouvelle(LANG_LABEL[lang])}</p>}

      <form action={action} className="adm-edit__form">
        <input type="hidden" name="blocId" value={blocId} />
        <input type="hidden" name="locale" value={lang} />

        {CHAMPS_BLOC[type].map((spec) => (
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
                // Les champs à lignes multiples portent plusieurs paragraphes :
                // trois lignes de fenêtre y rendraient la relecture impossible.
                rows={spec.champ === "paragraphes" || spec.champ === "puces" ? 7 : 4}
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
          <input type="hidden" name="blocId" value={blocId} />
          <input type="hidden" name="locale" value={lang} />
        </form>
      )}
    </div>
  );
}
