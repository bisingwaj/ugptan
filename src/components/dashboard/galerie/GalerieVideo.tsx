"use client";

/**
 * Le fichier vidéo d'une entrée : celui en place, et par quoi le remplacer.
 *
 * Formulaire distinct de celui de la fiche, pour la même raison que le visuel :
 * deux `<form>` ne peuvent pas s'imbriquer, et remplacer un film n'a rien à voir
 * avec la correction d'une légende.
 */
import { useActionState, useState } from "react";
import { enregistrerVideoAction, type GalFormState } from "@/actions/admin-galerie";
import { ADMIN_GALERIE } from "@/content/admin";
import type { VideoSaisie } from "@/lib/galerie/saisie";
import { dureeLisible } from "@/lib/galerie/statut";
import { GalerieSourceVideo } from "@/components/dashboard/galerie/GalerieSourceVideo";

const etatInitial: GalFormState = { error: null, ok: null };

export function GalerieVideo({
  id,
  video,
  stockageActif,
}: {
  id: string;
  video: VideoSaisie;
  stockageActif: boolean;
}) {
  const t = ADMIN_GALERIE;
  const [etat, action, enCours] = useActionState(enregistrerVideoAction, etatInitial);
  const [refus, setRefus] = useState<string | null>(null);

  const attache = Boolean(video.url);
  const duree = dureeLisible(video.duree);

  return (
    <form action={action} className="adm-gal__video">
      <input type="hidden" name="id" value={id} />

      <div className="adm-panel adm-gal__video-etat">
        <div className="adm-gal__video-tete">
          <div>
            <div className="label-mono">{t.videoSourceActuelle}</div>
            <p className={attache ? "adm-gal__video-nom" : "adm-gal__video-vide"}>
              {attache ? t.videoSourceFichier : t.videoSourceAucune}
            </p>
          </div>

          <div className="adm-gal__video-meta">
            {duree && <span className="mono adm-hint">{t.videoDuree} {duree}</span>}
            {attache && (
              <a href={video.url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
                {t.videoOuvrir} ↗
              </a>
            )}
          </div>
        </div>

        {attache && <p className="adm-hint mono adm-gal__video-url">{video.url}</p>}

        {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
        {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}
        {refus && <div className="auth-error" role="alert">{refus}</div>}
      </div>

      <GalerieSourceVideo stockageActif={stockageActif} onRefus={setRefus} />

      <div className="adm-actions__row">
        <button
          type="submit"
          className="btn btn--outline btn--sm"
          disabled={enCours || !stockageActif || refus !== null}
        >
          {enCours ? t.videoEnregistrement : attache ? t.videoRemplacer : t.videoEnregistrer}
        </button>
      </div>
    </form>
  );
}
