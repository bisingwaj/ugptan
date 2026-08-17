"use client";

/**
 * Les réglages NON LINGUISTIQUES d'une section de la fiche.
 *
 * Trois sections en portent : l'identité (code, adresse, accent, ordre, état,
 * visuel du héros), les données du MEP (dotation, clé IDA/AFD, indicateurs
 * rattachés) et la vidéo. Les autres n'ont que des textes et des entrées.
 *
 * ⚠️ Le champ caché `reglages` déclare à l'action le GROUPE que cet envoi
 * porte. Sans lui, enregistrer les données du MEP remettrait l'accent au bleu
 * par défaut et effacerait la vidéo — des champs absents du formulaire, lus
 * comme vides (cf. `lireFicheComposante` dans actions/admin-projet.ts).
 */
import { useActionState, useId, useState } from "react";
import { enregistrerComposanteAction, type ProjetFormState } from "@/actions/admin-projet";
import { ADMIN_PROJET } from "@/content/admin";
import { mediaSrc, type MediaRef } from "@/lib/medias";
import type { ComposanteSaisie, ReferentielsProjet } from "@/lib/projet/saisie";
import { PROJET_STATUSES, PROJET_STATUT_HINT, PROJET_STATUT_LABEL } from "@/lib/projet/statut";
import { MediaPicker, type ChoixMedia } from "@/components/dashboard/actus/MediaPicker";
import { ChampCouleur } from "@/components/dashboard/ChampCouleur";

const etatInitial: ProjetFormState = { error: null, ok: null };

type Props = {
  composante: ComposanteSaisie & { id: string };
  referentiels: ReferentielsProjet;
  assets: MediaRef[];
};

/* -------------------------------------------------------------------------- */
/* Identité & héros                                                            */
/* -------------------------------------------------------------------------- */

export function ReglagesIdentite({ composante, assets }: Omit<Props, "referentiels">) {
  const t = ADMIN_PROJET;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(enregistrerComposanteAction, etatInitial);
  const [statut, setStatut] = useState(composante.status);
  const [visuel, setVisuel] = useState({
    mediaId: composante.coverMediaId,
    key: composante.coverKey,
    src: composante.coverSrc,
  });
  const [picker, setPicker] = useState(false);

  const choisir = (choix: ChoixMedia) => {
    setPicker(false);
    setVisuel(
      choix.kind === "asset"
        ? { mediaId: choix.asset.id, key: "", src: mediaSrc(choix.asset) }
        : { mediaId: "", key: choix.key, src: choix.src },
    );
  };

  return (
    <>
      <form action={action} className="adm-edit__form adm-panneau__form">
        <input type="hidden" name="id" value={composante.id} />
        <input type="hidden" name="reglages" value="identite" />

        {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
        {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

        <div className="adm-item__grille">
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-code`}>{t.champCode}</label>
            <input id={`${idBase}-code`} name="code" type="text" className="field mono" defaultValue={composante.code} placeholder="C6" required />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champCodeAide}</p>
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-slug`}>{t.champSlug}</label>
            <input id={`${idBase}-slug`} name="slug" type="text" className="field mono" spellCheck={false} defaultValue={composante.slug} />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champSlugAide}</p>
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-status`}>État</label>
            <select
              id={`${idBase}-status`}
              name="status"
              className="field"
              value={statut}
              onChange={(event) => setStatut(event.target.value as typeof statut)}
            >
              {PROJET_STATUSES.map((valeur) => (
                <option key={valeur} value={valeur}>{PROJET_STATUT_LABEL[valeur]}</option>
              ))}
            </select>
            <p className="adm-hint" style={{ marginTop: 6 }}>{PROJET_STATUT_HINT[statut]}</p>
          </div>

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-position`}>{t.champPosition}</label>
            <input id={`${idBase}-position`} name="position" type="number" className="field" defaultValue={composante.position} />
            <p className="adm-hint" style={{ marginTop: 6 }}>{t.champPositionAide}</p>
          </div>
        </div>

        <ChampCouleur defaultValue={composante.color} label={t.champCouleur} aide={t.champCouleurAide} />

        <div className="adm-form__field">
          <span className="label-mono">{t.champVisuel}</span>
          <div className="adm-edit__cover" style={{ marginTop: 8, maxWidth: 320 }}>
            {visuel.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={visuel.src} alt="" className="adm-edit__cover-img" />
            ) : (
              <span className="adm-edit__cover-vide">{t.aucunVisuel}</span>
            )}
          </div>

          <input type="hidden" name="coverMediaId" value={visuel.mediaId} />
          <input type="hidden" name="coverKey" value={visuel.key} />

          <div className="adm-actions__row" style={{ marginTop: 10 }}>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => setPicker(true)}>
              {visuel.src ? t.changerVisuel : t.choisirVisuel}
            </button>
            {visuel.src && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setVisuel({ mediaId: "", key: "", src: "" })}>
                {t.retirerVisuel}
              </button>
            )}
          </div>
          <p className="adm-hint" style={{ marginTop: 8 }}>{t.visuelPartage}</p>
        </div>

        <div className="adm-edit__actions">
          <button type="submit" className="btn btn--primary" disabled={enCours}>
            {enCours ? t.enregistrement : t.enregistrerFiche}
          </button>
        </div>
      </form>

      <MediaPicker
        open={picker}
        assets={assets}
        avecRegistre
        onClose={() => setPicker(false)}
        onSelect={choisir}
        titre={t.champVisuel}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Données du MEP                                                              */
/* -------------------------------------------------------------------------- */

export function ReglagesMep({ composante, referentiels }: Omit<Props, "assets">) {
  const t = ADMIN_PROJET;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(enregistrerComposanteAction, etatInitial);

  return (
    <form action={action} className="adm-edit__form adm-panneau__form">
      <input type="hidden" name="id" value={composante.id} />
      <input type="hidden" name="reglages" value="mep" />

      {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

      <div className="adm-item__grille">
        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-montant`}>{t.champMontant}</label>
          <input id={`${idBase}-montant`} name="montant" type="text" inputMode="decimal" className="field mono" defaultValue={composante.montant} />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champMontantAide}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-ida`}>{t.champIda}</label>
          <input id={`${idBase}-ida`} name="ida" type="text" inputMode="decimal" className="field mono" defaultValue={composante.ida} />
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-afd`}>{t.champAfd}</label>
          <input id={`${idBase}-afd`} name="afd" type="text" inputMode="decimal" className="field mono" defaultValue={composante.afd} />
        </div>
      </div>

      <fieldset className="adm-form__field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="label-mono">{t.champOdp}</legend>
        <p className="adm-hint" style={{ marginTop: 6, marginBottom: 10 }}>{t.champOdpAide}</p>

        {referentiels.odp.length === 0 ? (
          <p className="adm-hint">{t.odpVide}</p>
        ) : (
          referentiels.odp.map((indicateur) => (
            <label key={indicateur.code} className="adm-check">
              <input
                type="checkbox"
                name="odpCodes"
                value={indicateur.code}
                defaultChecked={composante.odpCodes.includes(indicateur.code)}
              />
              <span>
                <span className="mono">{indicateur.code}</span> — {indicateur.label}
              </span>
            </label>
          ))
        )}
      </fieldset>

      <div className="adm-edit__actions">
        <button type="submit" className="btn btn--primary" disabled={enCours}>
          {enCours ? t.enregistrement : t.enregistrerFiche}
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Vidéo de présentation                                                       */
/* -------------------------------------------------------------------------- */

export function ReglagesVideo({ composante, referentiels }: Omit<Props, "assets">) {
  const t = ADMIN_PROJET;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(enregistrerComposanteAction, etatInitial);

  return (
    <form action={action} className="adm-edit__form adm-panneau__form">
      <input type="hidden" name="id" value={composante.id} />
      <input type="hidden" name="reglages" value="video" />

      {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-poster`}>{t.champVideoPoster}</label>
        <select id={`${idBase}-poster`} name="videoPosterKey" className="field" defaultValue={composante.videoPosterKey}>
          <option value="">{t.aucunVisuel}</option>
          {referentiels.cles.map((cle) => (
            <option key={cle} value={cle}>{cle}</option>
          ))}
        </select>
        <p className="adm-hint" style={{ marginTop: 6 }}>{t.champVideoPosterAide}</p>
      </div>

      <div className="adm-item__grille">
        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-yt`}>{t.champVideoYt}</label>
          <input id={`${idBase}-yt`} name="videoYt" type="text" className="field mono" spellCheck={false} defaultValue={composante.videoYt} placeholder="2ZJGxoF610c" />
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-src`}>{t.champVideoSrc}</label>
          <input id={`${idBase}-src`} name="videoSrc" type="text" className="field mono" spellCheck={false} defaultValue={composante.videoSrc} placeholder="/videos/c1.mp4" />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champVideoSrcAide}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-duree`}>{t.champVideoDuree}</label>
          <input id={`${idBase}-duree`} name="videoDuree" type="text" className="field" defaultValue={composante.videoDuree} placeholder="4 min" />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champVideoDureeAide}</p>
        </div>
      </div>

      <div className="adm-edit__actions">
        <button type="submit" className="btn btn--primary" disabled={enCours}>
          {enCours ? t.enregistrement : t.enregistrerFiche}
        </button>
      </div>
    </form>
  );
}
