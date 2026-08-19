"use client";

/**
 * Champs de la FICHE d'un article : tout ce qui ne dépend d'aucune langue —
 * statut, date, visuel, classement, auteur.
 *
 * Composant de champs, sans `<form>` : il sert à l'écran de création, où il
 * voisine avec une langue dans un envoi unique, et à l'écran d'édition, où il
 * constitue son propre formulaire (cf. actions/admin-actualites.ts).
 */
import { useId, useState } from "react";
import Link from "next/link";
import { ADMIN_ACTUS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { ARTICLE_STATUSES, STATUT_HINT, STATUT_LABEL, type ArticleStatut } from "@/lib/actus/statut";
import type { ArticleSaisie, ReferentielsSaisie } from "@/lib/actus/saisie";
import { mediaSrc, type MediaRef } from "@/lib/medias";
import { MediaPicker, type ChoixMedia } from "@/components/dashboard/actus/MediaPicker";

type Props = {
  article: ArticleSaisie;
  referentiels: ReferentielsSaisie;
  assets: MediaRef[];
};

export function ReglagesChamps({ article, referentiels, assets }: Props) {
  const t = ADMIN_ACTUS;
  const idBase = useId();

  const [statut, setStatut] = useState<ArticleStatut>(article.status);
  const [couverture, setCouverture] = useState({
    mediaId: article.coverMediaId,
    key: article.coverKey,
    src: article.coverSrc,
  });
  const [picker, setPicker] = useState(false);

  // La date n'a de sens que pour une parution : plutôt que de la masquer sur un
  // brouillon — ce qui obligerait à la ressaisir —, on dit quand elle s'impose.
  const dateObligatoire = statut === "SCHEDULED";

  const choisirCouverture = (choix: ChoixMedia) => {
    setPicker(false);
    setCouverture(
      choix.kind === "asset"
        ? { mediaId: choix.asset.id, key: "", src: mediaSrc(choix.asset) }
        : { mediaId: "", key: choix.key, src: choix.src },
    );
  };

  return (
    <>
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

        <p className="adm-hint">{t.visuelPartage}</p>

        <div className="adm-form__field">
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
            {referentiels.categories.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>{categorie.nom}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 6 }}>
            <Link href={adminPath("/news/categories")} className="adm-link">{t.gererCategories}</Link>
          </p>
        </div>

        <fieldset className="adm-fieldset" style={{ marginTop: 4 }}>
          <legend className="label-mono" style={{ marginBottom: 0 }}>{t.champTags}</legend>
          {referentiels.tags.length > 0 ? (
            <div className="adm-checks" style={{ gridTemplateColumns: "1fr" }}>
              {referentiels.tags.map((tag) => (
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
            {referentiels.composantes.map((composante) => (
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
            {referentiels.auteurs.map((auteur) => (
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

      <MediaPicker
        open={picker}
        assets={assets}
        avecRegistre
        onClose={() => setPicker(false)}
        onSelect={choisirCouverture}
        titre="Image de couverture"
      />
    </>
  );
}
