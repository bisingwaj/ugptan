"use client";

/**
 * Champs d'UNE version linguistique d'un événement.
 *
 * Composant de champs, et non de formulaire : il ne rend aucun `<form>`. C'est
 * ce qui lui permet de servir à la fois à la création — où il voisine avec les
 * réglages dans un envoi unique — et à l'édition, où chaque langue a son propre
 * formulaire (cf. actions/admin-evenements.ts).
 *
 * Les noms de champs ne portent PAS la langue : `title`, jamais `fr_title`. La
 * langue voyage dans un champ `locale` posé par le formulaire hôte, ce qui rend
 * impossible qu'une saisie parte sous le préfixe d'une autre langue.
 *
 * ⚠️ Le LIEU est ici, et non dans les réglages. « Goma — provinces de l'Est »
 * et « Goma — Eastern provinces » sont deux libellés à écrire, pas une donnée
 * géographique à saisir une fois. Le mettre dans la fiche imposerait le
 * français à la version anglaise du site.
 */
import { useId, useState } from "react";
import { ADMIN_EVTS } from "@/content/admin";
import { slugify } from "@/lib/actus/slug";
import type { TraductionEvtSaisie } from "@/lib/events/saisie";
import type { Lang } from "@/lib/pick";
import type { MediaRef } from "@/lib/medias";
import { RichEditor } from "@/components/dashboard/actus/RichEditor";

/** Longueurs au-delà desquelles les moteurs tronquent, à titre indicatif. */
const SEO_TITRE_MAX = 60;
const SEO_DESC_MAX = 160;

export function EvtTraductionChamps({
  lang,
  valeurs,
  assets,
}: {
  lang: Lang;
  valeurs: TraductionEvtSaisie;
  assets: MediaRef[];
}) {
  const t = ADMIN_EVTS;
  const idBase = useId();

  const [titre, setTitre] = useState(valeurs.title);
  const [slug, setSlug] = useState(valeurs.slug);
  // Un slug déjà publié ne suit pas une correction de titre : l'URL est une
  // adresse, pas un reflet. On ne le régénère donc que tant qu'il est vide.
  const [slugLie, setSlugLie] = useState(!valeurs.slug);

  return (
    <>
      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-title`}>{t.champTitre}</label>
        <input
          id={`${idBase}-title`}
          name="title"
          type="text"
          required
          className="field adm-edit__titre"
          value={titre}
          onChange={(event) => {
            setTitre(event.target.value);
            if (slugLie) setSlug(slugify(event.target.value));
          }}
          placeholder={lang === "fr" ? "Titre de l'événement" : "Event title"}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{t.champTitreAide}</p>
      </div>

      <div className="adm-form__row">
        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-slug`}>{t.champSlug}</label>
          <input
            id={`${idBase}-slug`}
            name="slug"
            type="text"
            className="field mono"
            spellCheck={false}
            value={slug}
            onChange={(event) => { setSlugLie(false); setSlug(event.target.value); }}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>
            /{lang}/evenements/<strong>{slugify(slug) || "…"}</strong>
          </p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-coverAlt`}>{t.champAlt}</label>
          <input
            id={`${idBase}-coverAlt`}
            name="coverAlt"
            type="text"
            className="field"
            defaultValue={valeurs.coverAlt}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champAltAide}</p>
        </div>
      </div>

      <fieldset className="adm-fieldset">
        <legend className="label-mono" style={{ marginBottom: 0 }}>{t.blocLieu}</legend>
        <p className="adm-hint" style={{ marginBottom: 14 }}>{t.blocLieuAide}</p>

        <div className="adm-form__row">
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-lieu`}>
              {t.champLieu} <span className="adm-edit__requis">publication</span>
            </label>
            <input
              id={`${idBase}-lieu`}
              name="lieu"
              type="text"
              className="field"
              defaultValue={valeurs.lieu}
              placeholder={lang === "fr" ? "Kinshasa" : "Kinshasa"}
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champLieuAide}</p>
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-places`}>{t.champPlaces}</label>
            <input
              id={`${idBase}-places`}
              name="places"
              type="text"
              className="field"
              defaultValue={valeurs.places}
              placeholder={lang === "fr" ? "320 places" : "320 seats"}
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champPlacesAide}</p>
          </div>
        </div>

        <div className="adm-form__field" style={{ marginTop: 18 }}>
          <label className="label-mono" htmlFor={`${idBase}-adresse`}>{t.champAdresse}</label>
          <input
            id={`${idBase}-adresse`}
            name="adresse"
            type="text"
            className="field"
            defaultValue={valeurs.adresse}
            placeholder={lang === "fr" ? "Salle des conférences, immeuble X, avenue Y" : "Conference hall, X building, Y avenue"}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champAdresseAide}</p>
        </div>
      </fieldset>

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-excerpt`}>{t.champResume}</label>
        <textarea
          id={`${idBase}-excerpt`}
          name="excerpt"
          className="field"
          rows={3}
          defaultValue={valeurs.excerpt}
          placeholder={t.champResumePlaceholder}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{t.champResumeAide}</p>
      </div>

      <div className="adm-form__field">
        <span className="label-mono" id={`${idBase}-corps`}>{t.champDescription}</span>
        <RichEditor
          name="content"
          defaultValue={valeurs.content}
          assets={assets}
          labelId={`${idBase}-corps`}
          placeholder={lang === "fr" ? "Programme, intervenants, objectifs…" : "Programme, speakers, objectives…"}
        />
      </div>

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-infos`}>{t.champInfos}</label>
        <textarea
          id={`${idBase}-infos`}
          name="infos"
          className="field"
          rows={3}
          defaultValue={valeurs.infos}
          placeholder={t.champInfosPlaceholder}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{t.champInfosAide}</p>
      </div>

      <fieldset className="adm-fieldset">
        <legend className="label-mono" style={{ marginBottom: 0 }}>{t.seoTitre}</legend>
        <p className="adm-hint" style={{ marginBottom: 14 }}>{t.seoAide}</p>

        <div className="adm-form__row">
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-seoTitle`}>{t.champSeoTitre}</label>
            <input
              id={`${idBase}-seoTitle`}
              name="seoTitle"
              type="text"
              className="field"
              maxLength={120}
              defaultValue={valeurs.seoTitle}
              placeholder={titre || t.champSeoTitrePlaceholder}
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{SEO_TITRE_MAX} caractères conseillés.</p>
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-seoDescription`}>{t.champSeoDesc}</label>
            <textarea
              id={`${idBase}-seoDescription`}
              name="seoDescription"
              className="field"
              rows={3}
              maxLength={320}
              defaultValue={valeurs.seoDescription}
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{SEO_DESC_MAX} caractères conseillés.</p>
          </div>
        </div>
      </fieldset>
    </>
  );
}
