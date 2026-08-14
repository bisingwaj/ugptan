"use client";

/**
 * Champs de la fiche d'un album, en deux jeux qui se posent dans les deux
 * colonnes de l'écran :
 *
 *   · `AlbumIdentite` — ce qui se lit : titres, présentation, lieu. Colonne
 *     principale ;
 *   · `AlbumReglages` — ce qui classe et publie : état, dates, adresse, ordre,
 *     rubrique, composantes. Colonne latérale.
 *
 * Deux composants de CHAMPS, sans `<form>` : les deux appartiennent au MÊME
 * envoi, et la découpe ne sert qu'à la mise en page. Même partage que sur la
 * fiche d'un contenu (cf. GalerieChamps.tsx).
 */
import { useId, useState } from "react";
import Link from "next/link";
import { ADMIN_GALERIE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import type { AlbumSaisie, ReferentielsGalerieSaisie } from "@/lib/galerie/saisie";
import {
  GAL_STATUTS, GAL_STATUT_HINT, GAL_STATUT_LABEL, type GalerieStatut,
} from "@/lib/galerie/statut";

/* -------------------------------------------------------------------------- */
/* Colonne principale — ce qui se lit                                          */
/* -------------------------------------------------------------------------- */

export function AlbumIdentite({ album }: { album: AlbumSaisie }) {
  const t = ADMIN_GALERIE;
  const idBase = useId();

  return (
    <div className="adm-panel adm-edit__bloc">
      <div className="label-mono">{t.blocIdentite}</div>

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-titreFr`}>
          {t.champAlbumTitreFr} <span className="adm-edit__requis">obligatoire</span>
        </label>
        <input
          id={`${idBase}-titreFr`}
          name="titreFr"
          type="text"
          className="field"
          required
          maxLength={200}
          defaultValue={album.titreFr}
          placeholder="Atelier régional de Goma"
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{t.champAlbumTitreFrAide}</p>
      </div>

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-titreEn`}>{t.champAlbumTitreEn}</label>
        <input
          id={`${idBase}-titreEn`}
          name="titreEn"
          type="text"
          className="field"
          maxLength={200}
          defaultValue={album.titreEn}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{t.champTitreEnAide}</p>
      </div>

      <div className="adm-form__row">
        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-descriptionFr`}>
            {t.champAlbumDescriptionFr}
          </label>
          <textarea
            id={`${idBase}-descriptionFr`}
            name="descriptionFr"
            className="field"
            rows={5}
            maxLength={900}
            placeholder={t.champAlbumDescriptionPlaceholder}
            defaultValue={album.descriptionFr}
          />
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-descriptionEn`}>
            {t.champAlbumDescriptionEn}
          </label>
          <textarea
            id={`${idBase}-descriptionEn`}
            name="descriptionEn"
            className="field"
            rows={5}
            maxLength={900}
            defaultValue={album.descriptionEn}
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
          defaultValue={album.lieu}
          placeholder="Goma, Nord-Kivu"
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>
          Il est repris par chaque photo versée dans l&apos;album.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Colonne latérale — ce qui classe et publie                                  */
/* -------------------------------------------------------------------------- */

export function AlbumReglages({
  album,
  referentiels,
  avecStatut = false,
}: {
  album: AlbumSaisie;
  referentiels: ReferentielsGalerieSaisie;
  avecStatut?: boolean;
}) {
  const t = ADMIN_GALERIE;
  const idBase = useId();

  const [statut, setStatut] = useState<GalerieStatut>(album.status);

  /**
   * ⚠️ Le serveur fait foi sur l'ÉTAT : le bouton « Rendre visible » de l'en-tête
   * l'écrit aussi, depuis la même page. Recalage pendant le rendu, motif déjà
   * employé sur les fiches de contenu et de document — voir le commentaire
   * détaillé dans GalerieChamps.tsx.
   */
  const [statutServeur, setStatutServeur] = useState<GalerieStatut>(album.status);
  if (statutServeur !== album.status) {
    setStatutServeur(album.status);
    setStatut(album.status);
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
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champAlbumStatutAide}</p>
          </div>
        )}

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-dateAt`}>{t.champAlbumDate}</label>
          <input
            id={`${idBase}-dateAt`}
            name="dateAt"
            type="date"
            className="field"
            defaultValue={album.dateAt}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champAlbumDateAide}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-dateFin`}>{t.champAlbumDateFin}</label>
          <input
            id={`${idBase}-dateFin`}
            name="dateFin"
            type="date"
            className="field"
            defaultValue={album.dateFin}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champAlbumDateFinAide}</p>
        </div>

        {avecStatut && (
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-publishedAt`}>
              {t.champDatePublication}
            </label>
            <input
              id={`${idBase}-publishedAt`}
              name="publishedAt"
              type="date"
              className="field"
              defaultValue={album.publishedAt}
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champDatePublicationAide}</p>
          </div>
        )}

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-slug`}>{t.champAlbumSlug}</label>
          <input
            id={`${idBase}-slug`}
            name="slug"
            type="text"
            className="field mono"
            spellCheck={false}
            maxLength={140}
            defaultValue={album.slug}
            placeholder="atelier-regional-goma"
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champAlbumSlugAide}</p>
        </div>

        <label className="adm-check">
          <input type="checkbox" name="featured" defaultChecked={album.featured} />
          <span>{t.champAlbumUne}</span>
        </label>
        <p className="adm-hint">{t.champAlbumUneAide}</p>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-position`}>{t.champPosition}</label>
          <input
            id={`${idBase}-position`}
            name="position"
            type="number"
            className="field"
            defaultValue={album.position}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champPositionAide}</p>
        </div>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocClassement}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-categoryId`}>{t.champRubrique}</label>
          <select
            id={`${idBase}-categoryId`}
            name="categoryId"
            className="field"
            defaultValue={album.categoryId}
          >
            <option value="">{t.sansRubrique}</option>
            {referentiels.categories.map((rubrique) => (
              <option key={rubrique.id} value={rubrique.id}>{rubrique.nom}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 6 }}>
            <Link href={adminPath("/gallery/categories")} className="adm-link">
              {t.gererRubriques}
            </Link>
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
                  defaultChecked={album.comps.includes(composante.code)}
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
