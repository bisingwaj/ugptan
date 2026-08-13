"use client";

/**
 * Fiche d'article — création et modification confondues.
 *
 * Organisation en deux colonnes : le TEXTE à gauche (le travail de rédaction),
 * les RÉGLAGES à droite (statut, date, classement, visuel). C'est la seule
 * disposition qui laisse le corps de l'article occuper une largeur de lecture
 * confortable ; un formulaire en colonne unique reléguerait l'éditeur sous une
 * dizaine de champs administratifs.
 *
 * Le multilingue passe par des ONGLETS, et non par deux formulaires : les deux
 * langues sont présentes dans le DOM en permanence et partent dans le même
 * envoi. Basculer d'un onglet à l'autre ne perd donc jamais une saisie, et
 * l'état de traduction se lit directement sur l'onglet.
 */
import { useActionState, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { enregistrerArticleAction, type ActuFormState } from "@/actions/admin-actualites";
import { ADMIN_ACTUS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { slugify } from "@/lib/actus/slug";
import { ARTICLE_STATUSES, STATUT_HINT, STATUT_LABEL, type ArticleStatut } from "@/lib/actus/statut";
import { mediaSrc, type MediaRef } from "@/lib/medias";
import { RichEditor } from "@/components/dashboard/actus/RichEditor";
import { MediaPicker, type ChoixMedia } from "@/components/dashboard/actus/MediaPicker";

const etatInitial: ActuFormState = { error: null, ok: null };

export type TraductionSaisie = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  coverAlt: string;
};

export type ArticleSaisie = {
  id: string | null;
  status: ArticleStatut;
  /** Format `<input type="datetime-local">`, heure de Kinshasa. */
  publishedAt: string;
  featured: boolean;
  lieu: string;
  videoYt: string;
  comps: string[];
  categoryId: string;
  coverMediaId: string;
  coverKey: string;
  /** URL du visuel actuel, pour la vignette d'aperçu. */
  coverSrc: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  tagIds: string[];
  traductions: Record<Lang, TraductionSaisie>;
};

type Props = {
  article: ArticleSaisie;
  categories: { id: string; nom: string }[];
  tags: { id: string; nom: string }[];
  auteurs: { id: string; nom: string }[];
  composantes: { code: string; titre: string }[];
  assets: MediaRef[];
  /** Lien d'aperçu signé, absent tant que l'article n'existe pas en base. */
  apercuUrl?: string | null;
};

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

/** Longueurs au-delà desquelles Google tronque, à titre indicatif. */
const SEO_TITRE_MAX = 60;
const SEO_DESC_MAX = 160;

export function ArticleForm({ article, categories, tags, auteurs, composantes, assets, apercuUrl }: Props) {
  const [state, formAction, pending] = useActionState(enregistrerArticleAction, etatInitial);
  const t = ADMIN_ACTUS;

  const [langue, setLangue] = useState<Lang>("fr");
  const [statut, setStatut] = useState<ArticleStatut>(article.status);
  const [titres, setTitres] = useState<Record<Lang, string>>({
    fr: article.traductions.fr.title,
    en: article.traductions.en.title,
  });
  const [slugs, setSlugs] = useState<Record<Lang, string>>({
    fr: article.traductions.fr.slug,
    en: article.traductions.en.slug,
  });
  // Un slug déjà publié ne doit pas suivre une correction de titre : l'URL est
  // une adresse, pas un reflet. On ne le régénère donc que tant qu'il est vide.
  const [slugLie, setSlugLie] = useState<Record<Lang, boolean>>({
    fr: !article.traductions.fr.slug,
    en: !article.traductions.en.slug,
  });

  const [couverture, setCouverture] = useState({
    mediaId: article.coverMediaId,
    key: article.coverKey,
    src: article.coverSrc,
  });
  const [picker, setPicker] = useState(false);

  const idBase = useId();

  // La date n'a de sens que pour une parution : la masquer pour un brouillon
  // éviterait de la ressaisir, on se contente donc de l'expliquer.
  const dateObligatoire = statut === "SCHEDULED";

  const modifierTitre = (lang: Lang, valeur: string) => {
    setTitres((etat) => ({ ...etat, [lang]: valeur }));
    if (slugLie[lang]) setSlugs((etat) => ({ ...etat, [lang]: slugify(valeur) }));
  };

  const choisirCouverture = (choix: ChoixMedia) => {
    setPicker(false);
    setCouverture(
      choix.kind === "asset"
        ? { mediaId: choix.asset.id, key: "", src: mediaSrc(choix.asset) }
        : { mediaId: "", key: choix.key, src: choix.src },
    );
  };

  const traduites = useMemo(
    () => LOCALES.filter((lang) => titres[lang].trim().length > 0),
    [titres],
  );

  // Remonter en tête après un enregistrement : le message de résultat est
  // au-dessus du formulaire, qui fait plusieurs écrans de haut.
  useEffect(() => {
    if (state.ok || state.error) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.ok, state.error]);

  return (
    <form action={formAction} className="adm-edit">
      {article.id && <input type="hidden" name="id" value={article.id} />}

      <div className="adm-edit__alertes">
        {state.error && <div className="auth-error" role="alert">{state.error}</div>}
        {state.ok && <div className="adm-ok" role="status">{state.ok}</div>}
      </div>

      {/* ================= Colonne de rédaction ================= */}
      <div className="adm-edit__main">
        <div className="adm-tabs" role="tablist" aria-label="Langue de rédaction">
          {LOCALES.map((lang) => {
            const rempli = titres[lang].trim().length > 0;
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
                <span className={`adm-tab__etat${rempli ? " is-ok" : ""}`}>
                  {rempli ? t.tradPresente : t.tradManquante}
                </span>
              </button>
            );
          })}
        </div>

        {LOCALES.map((lang) => {
          const tr = article.traductions[lang];
          const visible = langue === lang;
          return (
            // `hidden` et non un démontage : les deux langues doivent rester
            // dans le DOM pour partir dans le même envoi.
            <div key={lang} hidden={!visible} className="adm-edit__langue">
              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-${lang}-title`}>{t.champTitre}</label>
                <input
                  id={`${idBase}-${lang}-title`}
                  name={`${lang}_title`}
                  type="text"
                  className="field adm-edit__titre"
                  value={titres[lang]}
                  onChange={(event) => modifierTitre(lang, event.target.value)}
                  placeholder={lang === "fr" ? "Titre de l'article" : "Article title"}
                />
                <p className="adm-hint" style={{ marginTop: 6 }}>{t.champTitreAide}</p>
              </div>

              <div className="adm-form__row">
                <div className="adm-form__field">
                  <label className="label-mono" htmlFor={`${idBase}-${lang}-slug`}>{t.champSlug}</label>
                  <input
                    id={`${idBase}-${lang}-slug`}
                    name={`${lang}_slug`}
                    type="text"
                    className="field mono"
                    value={slugs[lang]}
                    spellCheck={false}
                    onChange={(event) => {
                      setSlugLie((etat) => ({ ...etat, [lang]: false }));
                      setSlugs((etat) => ({ ...etat, [lang]: event.target.value }));
                    }}
                  />
                  <p className="adm-hint" style={{ marginTop: 6 }}>
                    /{lang}/actualites/<strong>{slugify(slugs[lang]) || "…"}</strong>
                  </p>
                </div>

                <div className="adm-form__field">
                  <label className="label-mono" htmlFor={`${idBase}-${lang}-coverAlt`}>{t.champAlt}</label>
                  <input
                    id={`${idBase}-${lang}-coverAlt`}
                    name={`${lang}_coverAlt`}
                    type="text"
                    className="field"
                    defaultValue={tr.coverAlt}
                  />
                  <p className="adm-hint" style={{ marginTop: 6 }}>{t.champAltAide}</p>
                </div>
              </div>

              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-${lang}-excerpt`}>{t.champResume}</label>
                <textarea
                  id={`${idBase}-${lang}-excerpt`}
                  name={`${lang}_excerpt`}
                  className="field"
                  rows={3}
                  defaultValue={tr.excerpt}
                  placeholder={t.champResumePlaceholder}
                />
                <p className="adm-hint" style={{ marginTop: 6 }}>{t.champResumeAide}</p>
              </div>

              <div className="adm-form__field">
                <span className="label-mono" id={`${idBase}-${lang}-corps`}>{t.champCorps}</span>
                <RichEditor
                  name={`${lang}_content`}
                  defaultValue={tr.content}
                  assets={assets}
                  labelId={`${idBase}-${lang}-corps`}
                  placeholder={lang === "fr" ? "Rédigez l'article…" : "Write the article…"}
                />
              </div>

              <fieldset className="adm-fieldset">
                <legend className="label-mono" style={{ marginBottom: 0 }}>{t.seoTitre}</legend>
                <p className="adm-hint" style={{ marginBottom: 14 }}>{t.seoAide}</p>

                <div className="adm-form__row">
                  <div className="adm-form__field">
                    <label className="label-mono" htmlFor={`${idBase}-${lang}-seoTitle`}>{t.champSeoTitre}</label>
                    <input
                      id={`${idBase}-${lang}-seoTitle`}
                      name={`${lang}_seoTitle`}
                      type="text"
                      className="field"
                      maxLength={120}
                      defaultValue={tr.seoTitle}
                      placeholder={titres[lang] || t.champSeoTitrePlaceholder}
                    />
                    <p className="adm-hint" style={{ marginTop: 6 }}>{SEO_TITRE_MAX} caractères conseillés.</p>
                  </div>

                  <div className="adm-form__field">
                    <label className="label-mono" htmlFor={`${idBase}-${lang}-seoDescription`}>{t.champSeoDesc}</label>
                    <textarea
                      id={`${idBase}-${lang}-seoDescription`}
                      name={`${lang}_seoDescription`}
                      className="field"
                      rows={3}
                      maxLength={320}
                      defaultValue={tr.seoDescription}
                    />
                    <p className="adm-hint" style={{ marginTop: 6 }}>{SEO_DESC_MAX} caractères conseillés.</p>
                  </div>
                </div>
              </fieldset>
            </div>
          );
        })}
      </div>

      {/* ================= Colonne des réglages ================= */}
      <aside className="adm-edit__aside">
        <div className="adm-panel adm-edit__bloc">
          <div className="label-mono">{t.blocPublication}</div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-status`}>{t.champStatut}</label>
            <select
              id={`${idBase}-status`}
              name="status"
              className="field"
              value={statut}
              onChange={(event) => setStatut(event.target.value as ArticleStatut)}
            >
              {ARTICLE_STATUSES.map((valeur) => (
                <option key={valeur} value={valeur}>{STATUT_LABEL[valeur]}</option>
              ))}
            </select>
            <p className="adm-hint" style={{ marginTop: 8 }}>{STATUT_HINT[statut]}</p>
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-publishedAt`}>
              {t.champDate} {dateObligatoire && <span className="adm-edit__requis">obligatoire</span>}
            </label>
            <input
              id={`${idBase}-publishedAt`}
              name="publishedAt"
              type="datetime-local"
              className="field"
              defaultValue={article.publishedAt}
              required={dateObligatoire}
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champDateAide}</p>
          </div>

          <label className="adm-check">
            <input type="checkbox" name="featured" defaultChecked={article.featured} />
            <span>{t.champUne}</span>
          </label>

          <div className="adm-edit__actions">
            <button type="submit" className="btn btn--primary" disabled={pending}>
              {pending ? t.enregistrement : t.enregistrer}
              {!pending && <span className="arrow">→</span>}
            </button>

            {apercuUrl ? (
              <a href={apercuUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">
                {t.apercu}
              </a>
            ) : (
              <span className="adm-hint">{t.apercuIndisponible}</span>
            )}
          </div>

          {traduites.length === 0 && <p className="adm-hint">{t.aucuneLangue}</p>}
        </div>

        <div className="adm-panel adm-edit__bloc">
          <div className="label-mono">{t.blocVisuel}</div>

          <div className="adm-edit__cover">
            {couverture.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={couverture.src} alt="" className="adm-edit__cover-img" />
            ) : (
              <span className="adm-edit__cover-vide">{t.aucunVisuel}</span>
            )}
          </div>

          <input type="hidden" name="coverMediaId" value={couverture.mediaId} />
          <input type="hidden" name="coverKey" value={couverture.key} />

          <div className="adm-actions__row">
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

          <div className="adm-form__field" style={{ marginTop: 18 }}>
            <label className="label-mono" htmlFor={`${idBase}-videoYt`}>{t.champVideo}</label>
            <input
              id={`${idBase}-videoYt`}
              name="videoYt"
              type="text"
              className="field"
              defaultValue={article.videoYt}
              placeholder="https://www.youtube.com/watch?v=…"
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champVideoAide}</p>
          </div>
        </div>

        <div className="adm-panel adm-edit__bloc">
          <div className="label-mono">{t.blocClassement}</div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-categoryId`}>{t.champCategorie}</label>
            <select id={`${idBase}-categoryId`} name="categoryId" className="field" defaultValue={article.categoryId}>
              <option value="">{t.sansCategorie}</option>
              {categories.map((categorie) => (
                <option key={categorie.id} value={categorie.id}>{categorie.nom}</option>
              ))}
            </select>
            <p className="adm-hint" style={{ marginTop: 6 }}>
              <Link href={adminPath("/actualites/categories")} className="adm-link">{t.gererCategories}</Link>
            </p>
          </div>

          <fieldset className="adm-fieldset" style={{ marginTop: 4 }}>
            <legend className="label-mono" style={{ marginBottom: 0 }}>{t.champTags}</legend>
            {tags.length > 0 ? (
              <div className="adm-checks" style={{ gridTemplateColumns: "1fr" }}>
                {tags.map((tag) => (
                  <label key={tag.id} className="adm-check">
                    <input type="checkbox" name="tags" value={tag.id} defaultChecked={article.tagIds.includes(tag.id)} />
                    <span>{tag.nom}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="adm-hint">{t.aucunTag}</p>
            )}
            <div className="adm-form__field" style={{ marginTop: 12 }}>
              <label className="label-mono" htmlFor={`${idBase}-nouveauxTags`}>{t.champNouveauxTags}</label>
              <input
                id={`${idBase}-nouveauxTags`}
                name="nouveauxTags"
                type="text"
                className="field"
                placeholder="fibre optique, inclusion"
              />
              <p className="adm-hint" style={{ marginTop: 6 }}>{t.champNouveauxTagsAide}</p>
            </div>
          </fieldset>

          <fieldset className="adm-fieldset" style={{ marginTop: 16 }}>
            <legend className="label-mono" style={{ marginBottom: 0 }}>{t.champComposantes}</legend>
            <p className="adm-hint" style={{ marginBottom: 10 }}>{t.champComposantesAide}</p>
            <div className="adm-checks" style={{ gridTemplateColumns: "1fr" }}>
              {composantes.map((composante) => (
                <label key={composante.code} className="adm-check">
                  <input
                    type="checkbox"
                    name="comps"
                    value={composante.code}
                    defaultChecked={article.comps.includes(composante.code)}
                  />
                  <span><strong className="mono">{composante.code}</strong> · {composante.titre}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="adm-panel adm-edit__bloc">
          <div className="label-mono">{t.blocAuteur}</div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-authorId`}>{t.champCompte}</label>
            <select id={`${idBase}-authorId`} name="authorId" className="field" defaultValue={article.authorId}>
              <option value="">{t.sansCompte}</option>
              {auteurs.map((auteur) => (
                <option key={auteur.id} value={auteur.id}>{auteur.nom}</option>
              ))}
            </select>
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-authorName`}>{t.champSignature}</label>
            <input
              id={`${idBase}-authorName`}
              name="authorName"
              type="text"
              className="field"
              defaultValue={article.authorName}
              placeholder="UGPTN"
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champSignatureAide}</p>
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-authorRole`}>{t.champFonction}</label>
            <input
              id={`${idBase}-authorRole`}
              name="authorRole"
              type="text"
              className="field"
              defaultValue={article.authorRole}
              placeholder="Cellule communication"
            />
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-lieu`}>{t.champLieu}</label>
            <input
              id={`${idBase}-lieu`}
              name="lieu"
              type="text"
              className="field"
              defaultValue={article.lieu}
              placeholder="Kinshasa"
            />
          </div>
        </div>
      </aside>

      <MediaPicker
        open={picker}
        assets={assets}
        avecRegistre
        onClose={() => setPicker(false)}
        onSelect={choisirCouverture}
        titre="Image de couverture"
      />
    </form>
  );
}
