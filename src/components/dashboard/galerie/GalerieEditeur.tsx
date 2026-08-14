"use client";

/**
 * Formulaire de la fiche d'une entrée déjà en base.
 *
 * Il n'emporte NI le visuel NI la source vidéo : chacun a son propre
 * formulaire, posé au-dessus par la page (cf. GalerieVisuel, GalerieVideo). Un
 * seul envoi ici, pour toute la fiche — contrairement aux articles et aux
 * événements, dont chaque langue s'enregistre séparément parce qu'un traducteur
 * y travaille en parallèle du rédacteur. Deux champs de titre ne créent pas ce
 * risque.
 */
import { useActionState } from "react";
import { enregistrerGalerieAction, type GalFormState } from "@/actions/admin-galerie";
import { ADMIN_GALERIE } from "@/content/admin";
import type { GalerieSaisie, ReferentielsGalerieSaisie } from "@/lib/galerie/saisie";
import { GalerieIdentite, GalerieReglages } from "@/components/dashboard/galerie/GalerieChamps";

const etatInitial: GalFormState = { error: null, ok: null };

export function GalerieEditeur({
  item,
  referentiels,
  publicUrl,
}: {
  item: GalerieSaisie & { id: string };
  referentiels: ReferentielsGalerieSaisie;
  publicUrl: string | null;
}) {
  const t = ADMIN_GALERIE;
  const [etat, action, enCours] = useActionState(enregistrerGalerieAction, etatInitial);

  return (
    <form action={action} className="adm-edit">
      <input type="hidden" name="id" value={item.id} />

      <div className="adm-edit__alertes">
        {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
        {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}
      </div>

      <div className="adm-edit__main">
        <div className="adm-edit__form">
          <GalerieIdentite item={item} />
        </div>
      </div>

      <aside className="adm-edit__aside">
        <GalerieReglages item={item} referentiels={referentiels} avecStatut />

        {/* Barre collante : la colonne fait plusieurs écrans de haut, le bouton
            d'enregistrement ne doit pas se chercher. */}
        <div className="adm-edit__barre">
          <button type="submit" className="btn btn--primary" disabled={enCours}>
            {enCours ? t.enregistrement : t.enregistrer}
            {!enCours && <span className="arrow">→</span>}
          </button>

          {publicUrl ? (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
              {t.voirSite}
            </a>
          ) : (
            <span className="adm-hint">{t.voirSiteIndisponible}</span>
          )}
        </div>
      </aside>
    </form>
  );
}
