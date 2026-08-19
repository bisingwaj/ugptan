"use client";

/**
 * Champs d'UNE version linguistique d'un article.
 *
 * Composant de champs, et non de formulaire : il ne rend aucun `<form>`. C'est
 * ce qui lui permet de servir à la fois à la création — où il voisine avec les
 * réglages dans un envoi unique — et à l'édition, où chaque langue a son propre
 * formulaire (cf. actions/admin-actualites.ts).
 *
 * Les noms de champs ne portent PAS la langue : `title`, jamais `fr_title`. La
 * langue voyage dans un champ `locale` posé par le formulaire hôte, ce qui rend
 * impossible qu'une saisie parte sous le préfixe d'une autre langue.
 */
import { useId, useState } from "react";
import { ADMIN_ACTUS } from "@/content/admin";
import { slugify } from "@/lib/actus/slug";
import type { TraductionSaisie } from "@/lib/actus/saisie";
import type { Lang } from "@/lib/pick";
import type { MediaRef } from "@/lib/medias";
import { RichEditor } from "@/components/dashboard/actus/RichEditor";

/** Longueurs au-delà desquelles les moteurs tronquent, à titre indicatif. */
const SEO_TITRE_MAX = 60;
const SEO_DESC_MAX = 160;

export function TraductionChamps({
  lang,
  valeurs,
  assets,
}: {
  lang: Lang;
  valeurs: TraductionSaisie;
  assets: MediaRef[];
}) {
  const t = ADMIN_ACTUS;
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
          placeholder={lang === "fr" ? "Titre de l'article" : "Article title"}
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
            /{lang}/actualites/<strong>{slugify(slug) || "…"}</strong>
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

        {/* La FONCTION de l'auteur, pas son nom : « Cellule communication » se
            traduit, la signature « UGPTN » reste sur la fiche. */}
        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-authorRole`}>{t.champFonction}</label>
          <input
            id={`${idBase}-authorRole`}
            name="authorRole"
            type="text"
            className="field"
            defaultValue={valeurs.authorRole}
            placeholder={lang === "en" ? "Communications Unit" : "Cellule communication"}
          />
        </div>
      </div>

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
        <span className="label-mono" id={`${idBase}-corps`}>{t.champCorps}</span>
        <RichEditor
          name="content"
          defaultValue={valeurs.content}
          assets={assets}
          labelId={`${idBase}-corps`}
          placeholder={lang === "fr" ? "Rédigez l'article…" : "Write the article…"}
        />
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
