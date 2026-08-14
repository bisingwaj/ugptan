"use client";

/**
 * Champs de la fiche d'un document, en deux jeux qui se posent dans les deux
 * colonnes de l'écran :
 *
 *   · `DocumentIdentite` — ce qui se lit : titres, descriptions, sigle, auteur.
 *     Colonne principale ;
 *   · `DocumentReglages` — ce qui classe et publie : statut, dates, ordre,
 *     nature, catégorie, langue du fichier, composantes. Colonne latérale.
 *
 * Deux composants de CHAMPS, sans `<form>` : les deux appartiennent au MÊME
 * envoi, et la découpe ne sert qu'à la mise en page. C'est la différence avec
 * les événements, où la colonne latérale porte son propre formulaire parce
 * qu'elle s'enregistre séparément des langues.
 *
 * Le sélecteur de statut n'apparaît qu'en modification (`avecStatut`) : à la
 * création, le document naît en brouillon, pour que la prévisualisation avant
 * mise en ligne ne soit pas court-circuitée dès le formulaire de dépôt.
 */
import { useId, useState } from "react";
import Link from "next/link";
import { ADMIN_DOCS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { slugify } from "@/lib/actus/slug";
import { mediaSrc, type MediaRef } from "@/lib/medias";
import type { DocumentSaisie, ReferentielsDocSaisie } from "@/lib/docs/saisie";
import {
  DOC_LANGUES, DOC_LANGUE_LABEL, DOC_STATUTS, DOC_STATUT_HINT, DOC_STATUT_LABEL,
  DOC_SUPPORTS, DOC_SUPPORT_HINT, DOC_SUPPORT_LABEL,
  DOC_TYPES, DOC_TYPE_LABEL,
  type DocStatut, type DocSupport,
} from "@/lib/docs/statut";
import { MediaPicker, type ChoixMedia } from "@/components/dashboard/actus/MediaPicker";

/* -------------------------------------------------------------------------- */
/* Colonne principale — ce qui se lit                                          */
/* -------------------------------------------------------------------------- */

export function DocumentIdentite({ document }: { document: DocumentSaisie }) {
  const t = ADMIN_DOCS;
  const idBase = useId();

  // Le titre alimente l'adresse tant qu'aucune n'a été fixée : le rédacteur voit
  // l'URL se former en écrivant, plutôt que de la découvrir après coup.
  const [titre, setTitre] = useState(document.titreFr);
  const [slug, setSlug] = useState(document.slug);
  const adresse = slug || slugify(titre);

  return (
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
          maxLength={220}
          value={titre}
          onChange={(event) => setTitre(event.target.value)}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{t.champTitreFrAide}</p>
      </div>

      {document.support === "REDIGE" && (
        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-slug`}>{t.champSlugDoc}</label>
          <input
            id={`${idBase}-slug`}
            name="slug"
            type="text"
            className="field mono"
            spellCheck={false}
            maxLength={90}
            value={slug}
            placeholder={slugify(titre)}
            onChange={(event) => setSlug(event.target.value)}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>
            {t.champSlugDocAide}
            {adresse && <> Adresse : <span className="mono">/fr/resources/{slugify(adresse)}</span></>}
          </p>
        </div>
      )}

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-titreEn`}>{t.champTitreEn}</label>
        <input
          id={`${idBase}-titreEn`}
          name="titreEn"
          type="text"
          className="field"
          maxLength={220}
          defaultValue={document.titreEn}
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
            rows={5}
            maxLength={600}
            placeholder={t.champDescriptionPlaceholder}
            defaultValue={document.descriptionFr}
          />
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-descriptionEn`}>{t.champDescriptionEn}</label>
          <textarea
            id={`${idBase}-descriptionEn`}
            name="descriptionEn"
            className="field"
            rows={5}
            maxLength={600}
            defaultValue={document.descriptionEn}
          />
        </div>
      </div>

      <div className="adm-form__row">
        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-reference`}>{t.champReference}</label>
          <input
            id={`${idBase}-reference`}
            name="reference"
            type="text"
            className="field mono"
            spellCheck={false}
            maxLength={24}
            defaultValue={document.reference}
            placeholder="MEP"
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champReferenceAide}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-version`}>{t.champVersion}</label>
          <input
            id={`${idBase}-version`}
            name="version"
            type="text"
            className="field mono"
            spellCheck={false}
            maxLength={32}
            defaultValue={document.version}
            placeholder="v1.0"
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champVersionAide}</p>
        </div>
      </div>

      <div className="adm-form__row">
        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-auteur`}>{t.champAuteur}</label>
          <input
            id={`${idBase}-auteur`}
            name="auteur"
            type="text"
            className="field"
            maxLength={160}
            defaultValue={document.auteur}
            placeholder="UGPTN — Pôle suivi & évaluation"
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champAuteurAide}</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Colonne latérale — ce qui classe et publie                                  */
/* -------------------------------------------------------------------------- */

export function DocumentReglages({
  document,
  referentiels,
  assets,
  avecStatut = false,
}: {
  document: DocumentSaisie;
  referentiels: ReferentielsDocSaisie;
  /** Bibliothèque de médias, pour le choix de la couverture. */
  assets: MediaRef[];
  /**
   * Écran de MODIFICATION. Trois champs n'ont de sens qu'une fois la fiche
   * créée : l'état, la date de mise en ligne et le support — ce dernier est
   * choisi à la création par son propre écran (cf. DocumentDepot).
   */
  avecStatut?: boolean;
}) {
  const t = ADMIN_DOCS;
  const idBase = useId();

  const [statut, setStatut] = useState<DocStatut>(document.status);
  const [support, setSupport] = useState<DocSupport>(document.support);
  const [couverture, setCouverture] = useState(document.coverMediaId);
  const [picker, setPicker] = useState(false);

  const visuel = assets.find((asset) => asset.id === couverture);

  const choisirCouverture = (choix: ChoixMedia) => {
    setPicker(false);
    // Seule la bibliothèque est proposée ici : la couverture est enregistrée
    // par son IDENTIFIANT de média, ce qu'une clé du registre intégré n'a pas.
    if (choix.kind === "asset") setCouverture(choix.asset.id);
  };

  /**
   * ⚠️ Le serveur fait foi sur le STATUT, parce qu'il n'appartient pas qu'à ce
   * formulaire : les boutons « Publier » et « Archiver » de l'en-tête l'écrivent
   * aussi, depuis la même page (cf. DocumentActions).
   *
   * `useState` ne se réinitialise pas quand la prop change. Sans ce recalage :
   * on publie depuis l'en-tête, la base passe à PUBLISHED, ce champ garde DRAFT
   * en mémoire — et le premier enregistrement de la fiche renverrait DRAFT,
   * dépubliant le document sans que rien ne le signale. Même correction que sur
   * la fiche d'événement, pour la même raison.
   *
   * Recalage PENDANT le rendu, et non dans un `useEffect` : React ré-exécute
   * aussitôt avec la bonne valeur, sans afficher l'état périmé le temps d'une
   * frame. C'est le motif documenté pour un état dérivé d'une prop.
   */
  const [statutServeur, setStatutServeur] = useState<DocStatut>(document.status);
  if (statutServeur !== document.status) {
    setStatutServeur(document.status);
    setStatut(document.status);
  }

  /**
   * Même recalage sur le SUPPORT, pour une autre raison : à la création, c'est
   * l'écran de dépôt qui porte le choix (cf. DocumentDepot), et cette colonne
   * doit suivre — c'est elle qui montre ou masque la couverture.
   */
  const [supportServeur, setSupportServeur] = useState<DocSupport>(document.support);
  if (supportServeur !== document.support) {
    setSupportServeur(document.support);
    setSupport(document.support);
  }

  return (
    <>
      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocPublication}</div>

        {avecStatut && (
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-support`}>{t.blocSupport}</label>
            <select
              id={`${idBase}-support`}
              name="support"
              className="field"
              value={support}
              onChange={(event) => setSupport(event.target.value as DocSupport)}
            >
              {DOC_SUPPORTS.map((valeur) => (
                <option key={valeur} value={valeur}>{DOC_SUPPORT_LABEL[valeur]}</option>
              ))}
            </select>
            <p className="adm-hint" style={{ marginTop: 8 }}>{DOC_SUPPORT_HINT[support]}</p>
          </div>
        )}

        {avecStatut && (
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-status`}>{t.champStatut}</label>
            <select
              id={`${idBase}-status`}
              name="status"
              className="field"
              value={statut}
              onChange={(event) => setStatut(event.target.value as DocStatut)}
            >
              {DOC_STATUTS.map((valeur) => (
                <option key={valeur} value={valeur}>{DOC_STATUT_LABEL[valeur]}</option>
              ))}
            </select>
            <p className="adm-hint" style={{ marginTop: 8 }}>{DOC_STATUT_HINT[statut]}</p>
          </div>
        )}

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-documentDate`}>{t.champDateDocument}</label>
          <input
            id={`${idBase}-documentDate`}
            name="documentDate"
            type="date"
            className="field"
            defaultValue={document.documentDate}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champDateDocumentAide}</p>
        </div>

        {avecStatut && (
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-publishedAt`}>{t.champDatePublication}</label>
            <input
              id={`${idBase}-publishedAt`}
              name="publishedAt"
              type="date"
              className="field"
              defaultValue={document.publishedAt}
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champDatePublicationAide}</p>
          </div>
        )}

        <label className="adm-check">
          <input type="checkbox" name="featured" defaultChecked={document.featured} />
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
            defaultValue={document.position}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champPositionAide}</p>
        </div>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocClassement}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-type`}>{t.champType}</label>
          <select id={`${idBase}-type`} name="type" className="field" defaultValue={document.type}>
            {DOC_TYPES.map((valeur) => (
              <option key={valeur} value={valeur}>{DOC_TYPE_LABEL[valeur].fr}</option>
            ))}
          </select>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-categoryId`}>{t.champCategorie}</label>
          <select
            id={`${idBase}-categoryId`}
            name="categoryId"
            className="field"
            defaultValue={document.categoryId}
          >
            <option value="">{t.sansCategorie}</option>
            {referentiels.categories.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>{categorie.nom}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 6 }}>
            <Link href={adminPath("/documents/categories")} className="adm-link">{t.gererCategories}</Link>
          </p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-langue`}>Langue du fichier</label>
          <select id={`${idBase}-langue`} name="langue" className="field" defaultValue={document.langue}>
            {DOC_LANGUES.map((valeur) => (
              <option key={valeur} value={valeur}>{DOC_LANGUE_LABEL[valeur].fr}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 6 }}>
            Celle du document lui-même, pas celle de cette fiche : elle s'affiche au public à côté du poids du fichier.
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
                  defaultChecked={document.comps.includes(composante.code)}
                />
                <span><strong className="mono">{composante.code}</strong> · {composante.titre}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* --- Signature ---------------------------------------------------------
          Le nom publié, distinct du compte qui saisit. Trois champs et non un
          seul, pour la même raison que sur un article : un auteur peut avoir un
          compte, ne pas en avoir, ou être un service. */}
      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocSignature}</div>
        <p className="adm-hint" style={{ marginBottom: 12 }}>{t.blocSignatureAide}</p>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-authorId`}>{t.champCompteAuteur}</label>
          <select
            id={`${idBase}-authorId`}
            name="authorId"
            className="field"
            defaultValue={document.authorId}
          >
            <option value="">{t.sansCompteAuteur}</option>
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
            maxLength={160}
            defaultValue={document.authorName}
            placeholder="Cellule suivi & évaluation"
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
            maxLength={160}
            defaultValue={document.authorRole}
            placeholder="Chargé d'études"
          />
        </div>
      </div>

      {/* --- Couverture --------------------------------------------------------
          Sans objet pour une pièce qui n'existe que par son fichier : sa fiche
          publique est un panneau, il n'y a pas de bandeau à illustrer. */}
      {support === "REDIGE" && (
        <div className="adm-panel adm-edit__bloc">
          <div className="label-mono">{t.blocCouverture}</div>
          <p className="adm-hint" style={{ marginBottom: 12 }}>{t.blocCouvertureAide}</p>

          <input type="hidden" name="coverMediaId" value={couverture} />

          {visuel ? (
            <div className="adm-cover">
              {/* `img` et non `next/image` : la source vient de la
                  bibliothèque, l'hôte n'est pas garanti déclaré, et l'aperçu
                  de la console n'a aucun besoin d'optimisation. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaSrc(visuel)} alt="" className="adm-cover__img" />
              <div className="adm-cover__meta">
                <span className="adm-hint">{visuel.altFr || visuel.filename}</span>
              </div>
            </div>
          ) : (
            <p className="adm-hint">{t.couvertureAucune}</p>
          )}

          <div className="adm-actions__row" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => setPicker(true)}>
              {t.couvertureChoisir}
            </button>
            {couverture && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setCouverture("")}
              >
                {t.couvertureRetirer}
              </button>
            )}
          </div>

          <MediaPicker
            open={picker}
            assets={assets}
            onClose={() => setPicker(false)}
            onSelect={choisirCouverture}
            titre={t.blocCouverture}
          />
        </div>
      )}
    </>
  );
}
