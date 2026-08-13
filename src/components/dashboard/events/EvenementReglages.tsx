"use client";

/**
 * Formulaire de la FICHE d'un événement : statut, calendrier, modalité, visuel,
 * classement, participation, organisateur.
 *
 * Il n'emporte aucune langue. Publier n'écrit donc jamais un titre ni un lieu,
 * et la vérification « au moins une langue complète » est faite côté serveur
 * sur l'événement relu en base, pas sur ce que porte cet envoi
 * (cf. actions/admin-evenements.ts).
 */
import { useActionState } from "react";
import { enregistrerFicheEvtAction, type EvtFormState } from "@/actions/admin-evenements";
import { ADMIN_EVTS } from "@/content/admin";
import type { EvenementSaisie, ReferentielsEvtSaisie } from "@/lib/events/saisie";
import type { MediaRef } from "@/lib/medias";
import { EvtReglagesChamps } from "@/components/dashboard/events/EvtReglagesChamps";

const etatInitial: EvtFormState = { error: null, ok: null };

export function EvenementReglages({
  evenement,
  referentiels,
  assets,
  apercuUrl,
}: {
  evenement: EvenementSaisie & { id: string };
  referentiels: ReferentielsEvtSaisie;
  assets: MediaRef[];
  apercuUrl: string | null;
}) {
  const t = ADMIN_EVTS;
  const [etat, action, enCours] = useActionState(enregistrerFicheEvtAction, etatInitial);

  return (
    <form action={action} className="adm-edit__aside-form">
      <input type="hidden" name="id" value={evenement.id} />

      {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

      <EvtReglagesChamps evenement={evenement} referentiels={referentiels} assets={assets} />

      {/* Barre d'enregistrement collante : la colonne fait plusieurs écrans de
          haut, le bouton ne doit pas se chercher. */}
      <div className="adm-edit__barre">
        <button type="submit" className="btn btn--primary" disabled={enCours}>
          {enCours ? t.enregistrement : t.enregistrerFiche}
          {!enCours && <span className="arrow">→</span>}
        </button>

        {apercuUrl ? (
          <a href={apercuUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">
            {t.voirSite}
          </a>
        ) : (
          <span className="adm-hint">{t.voirSiteIndisponible}</span>
        )}
      </div>
    </form>
  );
}
