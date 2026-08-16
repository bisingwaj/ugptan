"use client";

/**
 * Formulaire de la fiche d'un album — création et modification.
 *
 * Un seul composant pour les deux écrans, contrairement aux contenus qui ont
 * un formulaire de dépôt distinct : un album n'emporte AUCUN fichier, il n'y a
 * donc rien qui change entre le créer et le modifier, sinon l'action appelée et
 * la présence du sélecteur d'état. Deux composants auraient été deux copies.
 */
import { useActionState } from "react";
import {
  creerAlbumAction, enregistrerAlbumAction, type GalFormState,
} from "@/actions/admin-galerie";
import { ADMIN_GALERIE } from "@/content/admin";
import type { AlbumSaisie, ReferentielsGalerieSaisie } from "@/lib/galerie/saisie";
import { AlbumIdentite, AlbumReglages } from "@/components/dashboard/galerie/AlbumChamps";

const etatInitial: GalFormState = { error: null, ok: null };

export function AlbumEditeur({
  album,
  referentiels,
  publicUrl,
}: {
  album: AlbumSaisie;
  referentiels: ReferentielsGalerieSaisie;
  /** `null` tant que l'album n'est pas publié, ou en création. */
  publicUrl?: string | null;
}) {
  const t = ADMIN_GALERIE;
  const creation = album.id === null;
  const [etat, action, enCours] = useActionState(
    creation ? creerAlbumAction : enregistrerAlbumAction,
    etatInitial,
  );

  return (
    <form action={action} className="adm-edit">
      {album.id && <input type="hidden" name="id" value={album.id} />}

      <div className="adm-edit__alertes">
        {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
        {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}
      </div>

      <div className="adm-edit__main">
        <div className="adm-edit__form">
          <AlbumIdentite album={album} />
        </div>
      </div>

      <aside className="adm-edit__aside">
        <AlbumReglages album={album} referentiels={referentiels} avecStatut={!creation} />

        {/* Barre collante : la colonne fait plusieurs écrans de haut, le bouton
            d'enregistrement ne doit pas se chercher. */}
        <div className="adm-edit__barre">
          <button type="submit" className="btn btn--primary" disabled={enCours}>
            {enCours ? t.enregistrement : creation ? t.albumNouveau : t.enregistrer}
            {!enCours && <span className="arrow">→</span>}
          </button>

          {!creation &&
            (publicUrl ? (
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
                {t.albumVoirSite}
              </a>
            ) : (
              <span className="adm-hint">{t.albumVoirSiteIndisponible}</span>
            ))}

          {creation && (
            <span className="adm-hint">
              L&apos;album est créé masqué et vide : vous y verserez vos photos juste après.
            </span>
          )}
        </div>
      </aside>
    </form>
  );
}
