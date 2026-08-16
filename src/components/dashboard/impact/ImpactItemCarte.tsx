"use client";

/**
 * Une ENTRÉE d'une section, dépliable, avec ses onglets de langue.
 *
 * ─── Pourquoi une carte dépliable et non une page par entrée ─────────────────
 * Une entrée porte quatre à six champs. Lui donner sa propre page ferait
 * traverser deux écrans pour corriger une citation, sur une grille qui en
 * compte six. Repliée, la carte tient sur une ligne et dit ce qu'il faut :
 * l'intitulé, l'état, et les langues qui manquent.
 *
 * ─── Trois formulaires, comme partout ailleurs ───────────────────────────────
 *   · un par langue, pour les textes ;
 *   · un pour les réglages non linguistiques (rang, couleur, visuel, vidéo) ;
 *   · un pour la suppression, FRÈRE et non descendant — imbriquer deux `<form>`
 *     n'est pas permis en HTML, le navigateur en écarterait un.
 *
 * Les champs demandés dépendent du GABARIT de la section, et leurs intitulés
 * avec eux : le modèle est générique, la console ne l'est jamais
 * (cf. `CHAMPS_ITEM` dans lib/impact/statut.ts).
 */
import { useActionState, useId, useState } from "react";
import {
  deplacerItemAction, enregistrerItemAction, enregistrerItemLangueAction,
  supprimerItemAction, supprimerItemLangueAction, type ImpactFormState,
} from "@/actions/admin-impact";
import { ADMIN_IMPACT } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { ItemSaisie } from "@/lib/impact/saisie";
import {
  AIDE_VALEUR, CHAMPS_ITEM, IMPACT_ITEM_STATUT_LABEL, IMPACT_STATUSES, LABEL_VALEUR,
  reglageActif, type ImpactLayout, type ImpactStatut,
} from "@/lib/impact/statut";
import { mediaSrc, type MediaRef } from "@/lib/medias";
import { MediaPicker, type ChoixMedia } from "@/components/dashboard/actus/MediaPicker";
import { ChampCouleur } from "@/components/dashboard/ChampCouleur";

const etatInitial: ImpactFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function ImpactItemCarte({
  item,
  layout,
  assets,
  rang,
  total,
}: {
  item: ItemSaisie;
  layout: ImpactLayout;
  assets: MediaRef[];
  rang: number;
  total: number;
}) {
  const t = ADMIN_IMPACT;
  const idBase = useId();
  const [langue, setLangue] = useState<Lang>("fr");
  const [ouverte, setOuverte] = useState(false);

  const [etatReglages, actionReglages, reglagesEnCours] = useActionState(enregistrerItemAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(supprimerItemAction, etatInitial);
  const [, deplacer, deplacementEnCours] = useActionState(deplacerItemAction, etatInitial);

  const [statut, setStatut] = useState<ImpactStatut>(item.status);
  const [couverture, setCouverture] = useState({
    mediaId: item.coverMediaId,
    key: item.coverKey,
    src: item.coverSrc,
  });
  const [picker, setPicker] = useState(false);

  const champs = CHAMPS_ITEM[layout];
  const avecVisuel = reglageActif(layout, "visuel");
  const idSuppression = `suppr-item-${item.id}`;

  // Ce qui identifie l'entrée dans la liste repliée : le premier champ requis
  // renseigné en français, à défaut la valeur, à défaut rien de mieux.
  const resume =
    champs.map((spec) => item.traductions.fr[spec.champ]).find((valeur) => valeur.trim().length > 0)
    ?? item.valeur
    ?? "";

  const choisirVisuel = (choix: ChoixMedia) => {
    setPicker(false);
    setCouverture(
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
          <span className="mono adm-item__rang">{String(rang + 1).padStart(2, "0")}</span>
          <span className="adm-item__resume">{resume.trim() || t.itemSansTitre}</span>
        </button>

        <div className="adm-item__etats">
          <span className={`adm-badge adm-statut adm-statut--${item.status === "PUBLISHED" ? "published" : "draft"}`}>
            {IMPACT_ITEM_STATUT_LABEL[item.status]}
          </span>
          {item.featured && <span className="adm-badge adm-badge--self">{t.itemUne}</span>}

          <span className="adm-langues">
            {LOCALES.map((lang) => {
              const tr = item.traductions[lang];
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
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="sens" value="haut" />
            <button type="submit" className="btn btn--ghost btn--sm" disabled={rang === 0 || deplacementEnCours} title={t.itemMonter} aria-label={t.itemMonter}>↑</button>
          </form>
          <form action={deplacer} className="adm-item__deplacer">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="sens" value="bas" />
            <button type="submit" className="btn btn--ghost btn--sm" disabled={rang === total - 1 || deplacementEnCours} title={t.itemDescendre} aria-label={t.itemDescendre}>↓</button>
          </form>
        </div>
      </div>

      {/* `hidden` sur le conteneur, jamais un démontage : une saisie en cours
          survit au repli de la carte. */}
      <div className="adm-item__corps" hidden={!ouverte}>
        {etatSuppression.error && <div className="auth-error" role="alert">{etatSuppression.error}</div>}

        <div className="adm-tabs" role="tablist" aria-label={t.langueRedaction}>
          {LOCALES.map((lang) => {
            const tr = item.traductions[lang];
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
          <ImpactItemLangue
            key={lang}
            itemId={item.id}
            lang={lang}
            valeurs={item.traductions[lang]}
            champs={champs}
            avecVisuel={avecVisuel}
            visible={langue === lang}
          />
        ))}

        <form action={actionReglages} className="adm-item__reglages">
          <input type="hidden" name="id" value={item.id} />

          {etatReglages.error && <div className="auth-error" role="alert">{etatReglages.error}</div>}
          {etatReglages.ok && <div className="adm-ok" role="status">{etatReglages.ok}</div>}

          <div className="label-mono">{t.itemReglages}</div>

          <div className="adm-item__grille">
            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-status`}>{t.itemStatut}</label>
              <select
                id={`${idBase}-status`}
                name="status"
                className="field"
                value={statut}
                onChange={(event) => setStatut(event.target.value as ImpactStatut)}
              >
                {IMPACT_STATUSES.map((valeur) => (
                  <option key={valeur} value={valeur}>{IMPACT_ITEM_STATUT_LABEL[valeur]}</option>
                ))}
              </select>
            </div>

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-position`}>{t.itemPosition}</label>
              <input
                id={`${idBase}-position`}
                name="position"
                type="number"
                className="field"
                defaultValue={item.position}
              />
            </div>

            {reglageActif(layout, "valeur") && (
              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-valeur`}>{LABEL_VALEUR[layout]}</label>
                <input
                  id={`${idBase}-valeur`}
                  name="valeur"
                  type="text"
                  className="field mono"
                  defaultValue={item.valeur}
                />
                {AIDE_VALEUR[layout] && (
                  <p className="adm-hint" style={{ marginTop: 6 }}>{AIDE_VALEUR[layout]}</p>
                )}
              </div>
            )}

            {reglageActif(layout, "dateAt") && (
              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-dateAt`}>{t.itemDate}</label>
                <input
                  id={`${idBase}-dateAt`}
                  name="dateAt"
                  type="date"
                  className="field"
                  defaultValue={item.dateAt}
                />
                <p className="adm-hint" style={{ marginTop: 6 }}>{t.itemDateAide}</p>
              </div>
            )}

            {reglageActif(layout, "tags") && (
              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-tags`}>{t.itemTags}</label>
                <textarea
                  id={`${idBase}-tags`}
                  name="tags"
                  className="field"
                  rows={4}
                  defaultValue={item.tags}
                  placeholder={"Coordonnateur\nCoordonnateur Adjoint\nAuditeur Interne"}
                />
                <p className="adm-hint" style={{ marginTop: 6 }}>{t.itemTagsAide}</p>
              </div>
            )}

            {reglageActif(layout, "videoYt") && (
              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-videoYt`}>{t.itemVideo}</label>
                <input
                  id={`${idBase}-videoYt`}
                  name="videoYt"
                  type="text"
                  className="field mono"
                  spellCheck={false}
                  defaultValue={item.videoYt}
                  placeholder="lLIB8fyagio"
                />
                <p className="adm-hint" style={{ marginTop: 6 }}>{t.itemVideoAide}</p>
              </div>
            )}

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-lienUrl`}>{t.itemLien}</label>
              <input
                id={`${idBase}-lienUrl`}
                name="lienUrl"
                type="text"
                className="field"
                defaultValue={item.lienUrl}
                placeholder="/components/c1"
              />
            </div>
          </div>

          {reglageActif(layout, "color") && (
            <ChampCouleur defaultValue={item.color} label={t.itemCouleur} aide={t.itemCouleurAide} />
          )}

          {avecVisuel && (
            <div className="adm-form__field">
              <span className="label-mono">{t.itemVisuel}</span>
              <div className="adm-edit__cover" style={{ marginTop: 8, maxWidth: 260 }}>
                {couverture.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={couverture.src} alt="" className="adm-edit__cover-img" />
                ) : (
                  <span className="adm-edit__cover-vide">{t.aucunVisuel}</span>
                )}
              </div>

              <input type="hidden" name="coverMediaId" value={couverture.mediaId} />
              <input type="hidden" name="coverKey" value={couverture.key} />

              <div className="adm-actions__row" style={{ marginTop: 10 }}>
                <button type="button" className="btn btn--outline btn--sm" onClick={() => setPicker(true)}>
                  {couverture.src ? t.changerVisuel : t.choisirVisuel}
                </button>
                {couverture.src && (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => setCouverture({ mediaId: "", key: "", src: "" })}
                  >
                    {t.retirerVisuel}
                  </button>
                )}
              </div>
              <p className="adm-hint" style={{ marginTop: 8 }}>{t.visuelPartage}</p>
            </div>
          )}

          <label className="adm-check">
            <input type="checkbox" name="featured" defaultChecked={item.featured} />
            <span>{t.itemUne}</span>
          </label>
          <p className="adm-hint">{t.itemUneAide}</p>

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
              {t.itemSupprimer}
            </button>
          </div>
        </form>
      </div>

      <form
        id={idSuppression}
        action={suppression}
        hidden
        onSubmit={(event) => {
          if (!window.confirm(t.itemSupprimerConfirm)) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={item.id} />
      </form>

      {avecVisuel && (
        <MediaPicker
          open={picker}
          assets={assets}
          avecRegistre
          onClose={() => setPicker(false)}
          onSelect={choisirVisuel}
          titre={t.itemVisuel}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Une langue d'une entrée                                                     */
/* -------------------------------------------------------------------------- */

function ImpactItemLangue({
  itemId,
  lang,
  valeurs,
  champs,
  avecVisuel,
  visible,
}: {
  itemId: string;
  lang: Lang;
  valeurs: ItemSaisie["traductions"][Lang];
  champs: (typeof CHAMPS_ITEM)[ImpactLayout];
  avecVisuel: boolean;
  visible: boolean;
}) {
  const t = ADMIN_IMPACT;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(enregistrerItemLangueAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(
    supprimerItemLangueAction,
    etatInitial,
  );

  const idSuppression = `suppr-item-trad-${itemId}-${lang}`;
  const erreur = etat.error ?? etatSuppression.error;
  const succes = etat.ok ?? etatSuppression.ok;

  return (
    <div className="adm-item__langue" hidden={!visible}>
      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      {!valeurs.existe && <p className="adm-edit__neuve">{t.tradNouvelle(LANG_LABEL[lang])}</p>}

      <form action={action} className="adm-edit__form">
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="locale" value={lang} />

        {champs.map((spec) => (
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

        {avecVisuel && (
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-mediaAlt`}>{t.itemAlt}</label>
            <input
              id={`${idBase}-mediaAlt`}
              name="mediaAlt"
              type="text"
              className="field"
              defaultValue={valeurs.mediaAlt}
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.itemAltAide}</p>
          </div>
        )}

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-lienLabel`}>{t.itemLienLabel}</label>
          <input
            id={`${idBase}-lienLabel`}
            name="lienLabel"
            type="text"
            className="field"
            defaultValue={valeurs.lienLabel}
          />
        </div>

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
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="locale" value={lang} />
        </form>
      )}
    </div>
  );
}
