"use client";

/**
 * Formulaire de la FICHE : nom, portrait, pôle, composante, mise en avant,
 * contact, ordre.
 *
 * Il n'emporte aucune langue. Publier n'écrit donc jamais une fonction, et la
 * vérification « au moins une langue renseignée » est faite côté serveur sur la
 * fiche relue en base, pas sur ce que porte cet envoi
 * (cf. actions/admin-equipe.ts).
 */
import { useActionState } from "react";
import { enregistrerMembreAction, type EquipeFormState } from "@/actions/admin-equipe";
import { ADMIN_EQUIPE } from "@/content/admin";
import type { MembreSaisie, ReferentielsEquipe } from "@/lib/equipe/saisie";
import type { MediaRef } from "@/lib/medias";
import { MembreReglagesChamps } from "@/components/dashboard/equipe/MembreReglagesChamps";

const etatInitial: EquipeFormState = { error: null, ok: null };

export function MembreReglages({
  membre,
  referentiels,
  assets,
  apercuUrl,
}: {
  membre: MembreSaisie & { id: string };
  referentiels: ReferentielsEquipe;
  assets: MediaRef[];
  apercuUrl: string | null;
}) {
  const t = ADMIN_EQUIPE;
  const [etat, action, enCours] = useActionState(enregistrerMembreAction, etatInitial);

  return (
    <form action={action} className="adm-edit__aside-form">
      <input type="hidden" name="id" value={membre.id} />

      {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

      <MembreReglagesChamps membre={membre} referentiels={referentiels} assets={assets} />

      {/* Barre d'enregistrement collante : la colonne fait plusieurs écrans de
          haut, le bouton ne doit pas se chercher. */}
      <div className="adm-edit__barre">
        <button type="submit" className="btn btn--primary" disabled={enCours}>
          {enCours ? t.enregistrement : t.enregistrerFiche}
          {!enCours && <span className="arrow">→</span>}
        </button>

        {apercuUrl && (
          <a href={apercuUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">
            {t.voirSite}
          </a>
        )}
      </div>
    </form>
  );
}
