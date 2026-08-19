"use client";

/**
 * Réglages d'une fiche, communs à toutes les langues.
 *
 * Partagés par l'écran de création et par celui de modification.
 *
 * ─── L'écran dit OÙ la fiche s'affichera ─────────────────────────────────────
 *
 * Aucune case « afficher sur l'accueil » n'est proposée, parce qu'il n'en existe
 * pas en base : une fiche publiée est dans la grille, un point c'est tout. Ce
 * que la rédaction choisit, ce sont deux rattachements qui ajoutent un
 * emplacement — la mise en avant pour les cartes de coordination, la composante
 * pour son profil de responsable. Le récapitulatif en bas du bloc « Publication »
 * énonce le résultat, pour qu'on n'ait pas à le déduire.
 */
import { useId, useState } from "react";
import { ADMIN_EQUIPE } from "@/content/admin";
import {
  TEAM_COMPOSANTES, TEAM_STATUSES, TEAM_STATUT_HINT, TEAM_STATUT_LABEL,
  type TeamStatut,
} from "@/lib/equipe/statut";
import type { MembreSaisie, ReferentielsEquipe } from "@/lib/equipe/saisie";
import type { MediaRef } from "@/lib/medias";
import { vignette } from "@/lib/images";
import { ChampCouleur } from "@/components/dashboard/ChampCouleur";
import { MediaPicker, type ChoixMedia } from "@/components/dashboard/actus/MediaPicker";

type Props = {
  membre: MembreSaisie;
  referentiels: ReferentielsEquipe;
  assets: MediaRef[];
};

export function MembreReglagesChamps({ membre, referentiels, assets }: Props) {
  const t = ADMIN_EQUIPE;
  const idBase = useId();

  const [statut, setStatut] = useState<TeamStatut>(membre.status);
  const [featured, setFeatured] = useState(membre.featured);
  const [composante, setComposante] = useState(membre.composante);
  const [picker, setPicker] = useState(false);
  const [portrait, setPortrait] = useState({ mediaId: membre.photoMediaId, src: membre.photoSrc });

  /**
   * ⚠️ Le serveur fait foi sur l'ÉTAT, parce qu'il n'appartient pas qu'à ce
   * formulaire : le bouton « Publier » de l'en-tête l'écrit aussi, depuis la
   * même page. Sans ce recalage, publier depuis l'en-tête puis enregistrer les
   * réglages ferait retomber la fiche en brouillon, sans que rien ne le dise.
   *
   * Recalage PENDANT le rendu, et non dans un `useEffect` : React ré-exécute
   * aussitôt avec la bonne valeur, sans afficher l'état périmé le temps d'une
   * frame. C'est le motif documenté pour un état dérivé d'une prop.
   */
  const [statutServeur, setStatutServeur] = useState<TeamStatut>(membre.status);
  if (statutServeur !== membre.status) {
    setStatutServeur(membre.status);
    setStatut(membre.status);
  }

  const choisirPortrait = (choix: ChoixMedia) => {
    // Seul un média de la bibliothèque est retenu : le registre d'images du site
    // ne contient pas de portraits, et un visuel de composante en tiendrait mal
    // lieu.
    if (choix.kind === "asset") setPortrait({ mediaId: choix.asset.id, src: choix.src });
    setPicker(false);
  };

  const emplacements = statut === "PUBLISHED"
    ? [t.ouGrille, ...(featured ? [t.ouCoordination] : []), ...(composante ? [t.ouComposante(composante)] : [])]
    : [];

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
            onChange={(event) => setStatut(event.target.value as TeamStatut)}
          >
            {TEAM_STATUSES.map((valeur) => (
              <option key={valeur} value={valeur}>{TEAM_STATUT_LABEL[valeur]}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 8 }}>{TEAM_STATUT_HINT[statut]}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-nom`}>{t.champNom}</label>
          <input
            id={`${idBase}-nom`}
            name="nom"
            type="text"
            className="field"
            defaultValue={membre.nom}
            maxLength={160}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champNomAide}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-position`}>{t.champPosition}</label>
          <input
            id={`${idBase}-position`}
            name="position"
            type="number"
            className="field"
            style={{ maxWidth: 120 }}
            defaultValue={membre.position}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champPositionAide}</p>
        </div>

        <p className="adm-hint" style={{ marginTop: 4 }}>
          <strong>{t.colOu} : </strong>
          {emplacements.length > 0 ? emplacements.join(" · ") : t.ouRien}
        </p>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocRattachement}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-poleId`}>{t.champPole}</label>
          <select id={`${idBase}-poleId`} name="poleId" className="field" defaultValue={membre.poleId}>
            <option value="">{t.sansPole}</option>
            {referentiels.poles.map((pole) => (
              <option key={pole.id} value={pole.id}>{pole.nom}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champPoleAide}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-composante`}>{t.champComposante}</label>
          <select
            id={`${idBase}-composante`}
            name="composante"
            className="field"
            value={composante}
            onChange={(event) => setComposante(event.target.value)}
          >
            <option value="">{t.sansComposante}</option>
            {TEAM_COMPOSANTES.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champComposanteAide}</p>
        </div>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocMiseEnAvant}</div>

        <label className="adm-check">
          <input
            type="checkbox"
            name="featured"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
          />
          <span>{t.champFeatured}</span>
        </label>
        <p className="adm-hint">{t.champFeaturedAide}</p>

        <ChampCouleur defaultValue={membre.color} label={t.champCouleur} aide={t.champCouleurAide} />
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocPortrait}</div>

        <div className="adm-form__field">
          <div className="adm-edit__cover" style={{ marginTop: 8, maxWidth: 220 }}>
            {portrait.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vignette(portrait.src, 640)} alt="" loading="lazy" decoding="async" className="adm-edit__cover-img" />
            ) : (
              <span className="adm-edit__cover-vide">{t.aucunPortrait}</span>
            )}
          </div>

          <input type="hidden" name="photoMediaId" value={portrait.mediaId} />

          <div className="adm-actions__row" style={{ marginTop: 10 }}>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => setPicker(true)}>
              {portrait.src ? t.changerPortrait : t.choisirPortrait}
            </button>
            {portrait.src && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setPortrait({ mediaId: "", src: "" })}
              >
                {t.retirerPortrait}
              </button>
            )}
          </div>
          <p className="adm-hint" style={{ marginTop: 8 }}>{t.portraitPartage}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-photoPath`}>{t.champPhotoPath}</label>
          <input
            id={`${idBase}-photoPath`}
            name="photoPath"
            type="text"
            className="field mono"
            spellCheck={false}
            defaultValue={membre.photoPath}
            placeholder="/portraits/exemple.jpg"
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champPhotoPathAide}</p>
        </div>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocContact}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-email`}>{t.champEmail}</label>
          <input
            id={`${idBase}-email`}
            name="email"
            type="email"
            className="field"
            defaultValue={membre.email}
            placeholder="prenom.nom@ugptn.cd"
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champEmailAide}</p>
        </div>
      </div>

      <MediaPicker
        open={picker}
        assets={assets}
        onClose={() => setPicker(false)}
        onSelect={choisirPortrait}
        titre={t.blocPortrait}
      />
    </>
  );
}
