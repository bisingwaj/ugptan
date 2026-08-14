"use client";

/**
 * Champs de la fiche d'une entrée de galerie, en deux jeux qui se posent dans
 * les deux colonnes de l'écran :
 *
 *   · `GalerieIdentite` — ce qui se lit : titres, légendes, lieu, textes
 *     alternatifs. Colonne principale ;
 *   · `GalerieReglages` — ce qui classe et montre : état, dates, ordre,
 *     rubrique, composantes. Colonne latérale.
 *
 * Deux composants de CHAMPS, sans `<form>` : les deux appartiennent au MÊME
 * envoi, et la découpe ne sert qu'à la mise en page. Même partage que sur la
 * fiche d'un document (cf. dashboard/docs/DocumentChamps.tsx).
 *
 * Le sélecteur d'état n'apparaît qu'en modification (`avecStatut`) : à la
 * création, l'entrée naît masquée, pour que la vérification du rendu avant mise
 * en ligne ne soit pas court-circuitée dès le formulaire d'ajout.
 */
import { useId, useState } from "react";
import Link from "next/link";
import { ADMIN_GALERIE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import type { GalerieSaisie, ReferentielsGalerieSaisie } from "@/lib/galerie/saisie";
import {
  GAL_STATUTS, GAL_STATUT_HINT, GAL_STATUT_LABEL, type GalerieStatut,
} from "@/lib/galerie/statut";

/* -------------------------------------------------------------------------- */
/* Colonne principale — ce qui se lit                                          */
/* -------------------------------------------------------------------------- */

export function GalerieIdentite({ item }: { item: GalerieSaisie }) {
  const t = ADMIN_GALERIE;
  const idBase = useId();

  return (
    <>
      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocIdentite}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-titreFr`}>
            {t.champTitreFr} <span className="adm-edit__requis">obligatoire</span>
          </label>
          <input
            id={`${idBase}-titreFr`}
            name="titreFr"
            type="text"
            className="field"
            required
            maxLength={200}
            defaultValue={item.titreFr}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champTitreFrAide}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-titreEn`}>{t.champTitreEn}</label>
          <input
            id={`${idBase}-titreEn`}
            name="titreEn"
            type="text"
            className="field"
            maxLength={200}
            defaultValue={item.titreEn}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champTitreEnAide}</p>
        </div>

        <div className="adm-form__row">
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-descriptionFr`}>{t.champDescriptionFr}</label>
            <textarea
              id={`${idBase}-descriptionFr`}
              name="descriptionFr"
              className="field"
              rows={4}
              maxLength={600}
              placeholder={t.champDescriptionPlaceholder}
              defaultValue={item.descriptionFr}
            />
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-descriptionEn`}>{t.champDescriptionEn}</label>
            <textarea
              id={`${idBase}-descriptionEn`}
              name="descriptionEn"
              className="field"
              rows={4}
              maxLength={600}
              defaultValue={item.descriptionEn}
            />
          </div>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-lieu`}>{t.champLieu}</label>
          <input
            id={`${idBase}-lieu`}
            name="lieu"
            type="text"
            className="field"
            maxLength={120}
            defaultValue={item.lieu}
            placeholder="Kinshasa"
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champLieuAide}</p>
        </div>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocAccessibilite}</div>
        <p className="adm-hint" style={{ marginTop: 8 }}>{t.blocAccessibiliteAide}</p>

        <div className="adm-form__row" style={{ marginTop: 12 }}>
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-altFr`}>{t.champAltFr}</label>
            <input
              id={`${idBase}-altFr`}
              name="altFr"
              type="text"
              className="field"
              maxLength={240}
              defaultValue={item.altFr}
            />
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-altEn`}>{t.champAltEn}</label>
            <input
              id={`${idBase}-altEn`}
              name="altEn"
              type="text"
              className="field"
              maxLength={240}
              defaultValue={item.altEn}
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Colonne latérale — ce qui classe et montre                                  */
/* -------------------------------------------------------------------------- */

export function GalerieReglages({
  item,
  referentiels,
  avecStatut = false,
}: {
  item: GalerieSaisie;
  referentiels: ReferentielsGalerieSaisie;
  avecStatut?: boolean;
}) {
  const t = ADMIN_GALERIE;
  const idBase = useId();

  const [statut, setStatut] = useState<GalerieStatut>(item.status);

  /**
   * ⚠️ Le serveur fait foi sur l'ÉTAT, parce qu'il n'appartient pas qu'à ce
   * formulaire : le bouton « Rendre visible » de l'en-tête l'écrit aussi, depuis
   * la même page (cf. GalerieActions).
   *
   * `useState` ne se réinitialise pas quand la prop change. Sans ce recalage :
   * on publie depuis l'en-tête, la base passe à PUBLISHED, ce champ garde DRAFT
   * en mémoire — et le premier enregistrement de la fiche renverrait DRAFT,
   * masquant le contenu sans que rien ne le signale. Même correction que sur la
   * fiche de document, pour la même raison.
   *
   * Recalage PENDANT le rendu, et non dans un `useEffect` : React ré-exécute
   * aussitôt avec la bonne valeur, sans afficher l'état périmé le temps d'une
   * frame. C'est le motif documenté pour un état dérivé d'une prop.
   */
  const [statutServeur, setStatutServeur] = useState<GalerieStatut>(item.status);
  if (statutServeur !== item.status) {
    setStatutServeur(item.status);
    setStatut(item.status);
  }

  return (
    <>
      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocPublication}</div>

        {avecStatut && (
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-status`}>{t.champStatut}</label>
            <select
              id={`${idBase}-status`}
              name="status"
              className="field"
              value={statut}
              onChange={(event) => setStatut(event.target.value as GalerieStatut)}
            >
              {GAL_STATUTS.map((valeur) => (
                <option key={valeur} value={valeur}>{GAL_STATUT_LABEL[valeur]}</option>
              ))}
            </select>
            <p className="adm-hint" style={{ marginTop: 8 }}>{GAL_STATUT_HINT[statut]}</p>
          </div>
        )}

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-priseAt`}>{t.champDatePrise}</label>
          <input
            id={`${idBase}-priseAt`}
            name="priseAt"
            type="date"
            className="field"
            defaultValue={item.priseAt}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champDatePriseAide}</p>
        </div>

        {avecStatut && (
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-publishedAt`}>{t.champDatePublication}</label>
            <input
              id={`${idBase}-publishedAt`}
              name="publishedAt"
              type="date"
              className="field"
              defaultValue={item.publishedAt}
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champDatePublicationAide}</p>
          </div>
        )}

        <label className="adm-check">
          <input type="checkbox" name="featured" defaultChecked={item.featured} />
          <span>{t.champUne}</span>
        </label>
        <p className="adm-hint">{t.champUneAide}</p>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-position`}>{t.champPosition}</label>
          <input
            id={`${idBase}-position`}
            name="position"
            type="number"
            className="field"
            defaultValue={item.position}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champPositionAide}</p>
        </div>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocClassement}</div>

        {/* L'ALBUM avant la rubrique : c'est le rattachement qu'on cherche en
            premier après un dépôt, et le seul qui déplace le contenu d'une page
            à une autre. La rubrique, elle, ne fait que le filtrer. */}
        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-albumId`}>{t.champAlbum}</label>
          <select
            id={`${idBase}-albumId`}
            name="albumId"
            className="field"
            defaultValue={item.albumId}
          >
            <option value="">{t.sansAlbum}</option>
            {referentiels.albums.map((album) => (
              <option key={album.id} value={album.id}>{album.nom}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 6 }}>
            {t.champAlbumAide}{" "}
            <Link href={adminPath("/gallery/albums")} className="adm-link">{t.gererAlbums}</Link>
          </p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-categoryId`}>{t.champRubrique}</label>
          <select
            id={`${idBase}-categoryId`}
            name="categoryId"
            className="field"
            defaultValue={item.categoryId}
          >
            <option value="">{t.sansRubrique}</option>
            {referentiels.categories.map((rubrique) => (
              <option key={rubrique.id} value={rubrique.id}>{rubrique.nom}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 6 }}>
            <Link href={adminPath("/gallery/categories")} className="adm-link">{t.gererRubriques}</Link>
          </p>
        </div>

        <fieldset className="adm-fieldset" style={{ marginTop: 4 }}>
          <legend className="label-mono" style={{ marginBottom: 0 }}>{t.champComposantes}</legend>
          <p className="adm-hint" style={{ marginBottom: 10 }}>{t.champComposantesAide}</p>
          <div className="adm-checks" style={{ gridTemplateColumns: "1fr" }}>
            {referentiels.composantes.map((composante) => (
              <label key={composante.code} className="adm-check">
                <input
                  type="checkbox"
                  name="comps"
                  value={composante.code}
                  defaultChecked={item.comps.includes(composante.code)}
                />
                <span><strong className="mono">{composante.code}</strong> · {composante.titre}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </>
  );
}
