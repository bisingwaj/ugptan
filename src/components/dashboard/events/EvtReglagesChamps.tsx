"use client";

/**
 * Champs de la FICHE d'un événement : tout ce qui ne dépend d'aucune langue —
 * statut, calendrier, modalité, visuel, liens, organisateur.
 *
 * Composant de champs, sans `<form>` : il sert à l'écran de création, où il
 * voisine avec une langue dans un envoi unique, et à l'écran d'édition, où il
 * constitue son propre formulaire (cf. actions/admin-evenements.ts).
 *
 * Deux réglages pilotent l'écran plutôt que de se contenter d'être enregistrés :
 *
 *   · la MODALITÉ ouvre ou masque le lien de connexion — il n'a pas de sens
 *     pour une rencontre en salle. Le champ reste monté, simplement caché : sa
 *     saisie survit à un aller-retour entre « en ligne » et « sur place ».
 *   · « JOURNÉE ENTIÈRE » ne masque pas les heures, il les rend muettes. Le
 *     champ reste un `datetime-local` — c'est lui qui porte la date, et le
 *     réduire à un `date` ferait perdre l'horaire déjà saisi au premier
 *     décochage. L'aide de saisie dit ce que le public verra.
 */
import { useId, useState } from "react";
import Link from "next/link";
import { ADMIN_EVTS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import {
  EVENEMENT_MODES, EVENEMENT_STATUSES, EVT_MODE_HINT, EVT_MODE_LABEL,
  EVT_STATUT_HINT, EVT_STATUT_LABEL,
  type EvenementMode, type EvenementStatut,
} from "@/lib/events/statut";
import type { EvenementSaisie, ReferentielsEvtSaisie } from "@/lib/events/saisie";
import { mediaSrc, type MediaRef } from "@/lib/medias";
import { MediaPicker, type ChoixMedia } from "@/components/dashboard/actus/MediaPicker";
import { ChampCouleur } from "@/components/dashboard/ChampCouleur";

type Props = {
  evenement: EvenementSaisie;
  referentiels: ReferentielsEvtSaisie;
  assets: MediaRef[];
};

export function EvtReglagesChamps({ evenement, referentiels, assets }: Props) {
  const t = ADMIN_EVTS;
  const idBase = useId();

  const [statut, setStatut] = useState<EvenementStatut>(evenement.status);
  const [mode, setMode] = useState<EvenementMode>(evenement.mode);
  const [allDay, setAllDay] = useState(evenement.allDay);

  /**
   * ⚠️ Le serveur fait foi sur le STATUT, parce qu'il n'appartient pas qu'à ce
   * formulaire : le bouton « Publier » de l'en-tête l'écrit aussi, depuis la
   * même page (cf. EvenementActions).
   *
   * `useState` ne se réinitialise pas quand la prop change. Sans ce recalage, la
   * suite était : on publie depuis l'en-tête, la base passe à PUBLISHED, ce
   * champ garde DRAFT en mémoire — et le premier enregistrement des réglages
   * renvoyait DRAFT, faisant retomber l'événement en brouillon SANS que rien ne
   * le signale. Mesuré : c'est exactement ce que vivait la rédaction.
   *
   * Recalage PENDANT le rendu, et non dans un `useEffect` : React ré-exécute
   * aussitôt avec la bonne valeur, sans afficher l'état périmé le temps d'une
   * frame. C'est le motif documenté pour un état dérivé d'une prop.
   */
  const [statutServeur, setStatutServeur] = useState<EvenementStatut>(evenement.status);
  if (statutServeur !== evenement.status) {
    setStatutServeur(evenement.status);
    setStatut(evenement.status);
  }
  const [couverture, setCouverture] = useState({
    mediaId: evenement.coverMediaId,
    key: evenement.coverKey,
    src: evenement.coverSrc,
  });
  const [picker, setPicker] = useState(false);

  const surPlace = mode !== "EN_LIGNE";
  const enLigne = mode !== "PRESENTIEL";

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
            onChange={(event) => setStatut(event.target.value as EvenementStatut)}
          >
            {EVENEMENT_STATUSES.map((valeur) => (
              <option key={valeur} value={valeur}>{EVT_STATUT_LABEL[valeur]}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 8 }}>{EVT_STATUT_HINT[statut]}</p>
        </div>

        <label className="adm-check">
          <input type="checkbox" name="featured" defaultChecked={evenement.featured} />
          <span>{t.champUne}</span>
        </label>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocCalendrier}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-startAt`}>
            {t.champDebut} <span className="adm-edit__requis">obligatoire</span>
          </label>
          <input
            id={`${idBase}-startAt`}
            name="startAt"
            type="datetime-local"
            className="field"
            required
            defaultValue={evenement.startAt}
          />
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-endAt`}>{t.champFin}</label>
          <input
            id={`${idBase}-endAt`}
            name="endAt"
            type="datetime-local"
            className="field"
            defaultValue={evenement.endAt}
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champFinAide}</p>
        </div>

        <label className="adm-check">
          <input
            type="checkbox"
            name="allDay"
            checked={allDay}
            onChange={(event) => setAllDay(event.target.checked)}
          />
          <span>{t.champJournee}</span>
        </label>

        <p className="adm-hint">{allDay ? t.champJourneeActive : t.champDateAide}</p>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocModalite}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-mode`}>{t.champMode}</label>
          <select
            id={`${idBase}-mode`}
            name="mode"
            className="field"
            value={mode}
            onChange={(event) => setMode(event.target.value as EvenementMode)}
          >
            {EVENEMENT_MODES.map((valeur) => (
              <option key={valeur} value={valeur}>{EVT_MODE_LABEL[valeur]}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 8 }}>{EVT_MODE_HINT[mode]}</p>
        </div>

        {/* Le champ reste MONTÉ quand la modalité change : masqué, il conserve
            sa saisie, et repasser de « en ligne » à « sur place » ne fait pas
            perdre l'adresse déjà entrée. */}
        <div className="adm-form__field" hidden={!enLigne}>
          <label className="label-mono" htmlFor={`${idBase}-onlineUrl`}>{t.champLienConnexion}</label>
          <input
            id={`${idBase}-onlineUrl`}
            name="onlineUrl"
            type="url"
            className="field"
            defaultValue={evenement.onlineUrl}
            placeholder="https://…"
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champLienConnexionAide}</p>
        </div>

        {surPlace && <p className="adm-hint">{t.adresseRappel}</p>}
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
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocClassement}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-categoryId`}>{t.champCategorie}</label>
          <select id={`${idBase}-categoryId`} name="categoryId" className="field" defaultValue={evenement.categoryId}>
            <option value="">{t.sansCategorie}</option>
            {referentiels.categories.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>{categorie.nom}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 6 }}>
            <Link href={adminPath("/events/categories")} className="adm-link">{t.gererCategories}</Link>
          </p>
        </div>

        <ChampCouleur
          defaultValue={evenement.color}
          label={t.champCouleur}
          aide={t.champCouleurAide}
        />

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
                  defaultChecked={evenement.comps.includes(composante.code)}
                />
                <span><strong className="mono">{composante.code}</strong> · {composante.titre}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocParticipation}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-registrationUrl`}>{t.champInscription}</label>
          <input
            id={`${idBase}-registrationUrl`}
            name="registrationUrl"
            type="url"
            className="field"
            defaultValue={evenement.registrationUrl}
            placeholder="https://…"
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champInscriptionAide}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-externalUrl`}>{t.champLienExterne}</label>
          <input
            id={`${idBase}-externalUrl`}
            name="externalUrl"
            type="url"
            className="field"
            defaultValue={evenement.externalUrl}
            placeholder="https://…"
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champLienExterneAide}</p>
        </div>
      </div>

      <div className="adm-panel adm-edit__bloc">
        <div className="label-mono">{t.blocOrganisateur}</div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-organiserName`}>{t.champOrganisateur}</label>
          <input
            id={`${idBase}-organiserName`}
            name="organiserName"
            type="text"
            className="field"
            defaultValue={evenement.organiserName}
            placeholder="UGPTN"
          />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champOrganisateurAide}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-organiserEmail`}>{t.champOrganisateurEmail}</label>
          <input
            id={`${idBase}-organiserEmail`}
            name="organiserEmail"
            type="email"
            className="field"
            defaultValue={evenement.organiserEmail}
            placeholder="evenements@ugptn.cd"
          />
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-organiserPhone`}>{t.champOrganisateurTel}</label>
          <input
            id={`${idBase}-organiserPhone`}
            name="organiserPhone"
            type="tel"
            className="field"
            defaultValue={evenement.organiserPhone}
          />
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-organiserUrl`}>{t.champOrganisateurUrl}</label>
          <input
            id={`${idBase}-organiserUrl`}
            name="organiserUrl"
            type="url"
            className="field"
            defaultValue={evenement.organiserUrl}
            placeholder="https://…"
          />
        </div>
      </div>

      <MediaPicker
        open={picker}
        assets={assets}
        avecRegistre
        onClose={() => setPicker(false)}
        onSelect={choisirCouverture}
        titre={t.blocVisuel}
      />
    </>
  );
}
