"use client";

/**
 * Formulaire de la FICHE d'une section : emplacement, gabarit, apparence,
 * bouton, reprise d'entrées.
 *
 * Il n'emporte aucune langue. Publier n'écrit donc jamais un titre, et la
 * vérification « au moins une langue renseignée » est faite côté serveur sur la
 * section relue en base, pas sur ce que porte cet envoi
 * (cf. actions/admin-impact.ts).
 */
import { useActionState } from "react";
import { enregistrerSectionAction, type ImpactFormState } from "@/actions/admin-impact";
import { ADMIN_IMPACT } from "@/content/admin";
import type { ReferentielsImpact, SectionSaisie } from "@/lib/impact/saisie";
import type { ImpactEmplacement } from "@/lib/impact/statut";
import { ImpactReglagesChamps } from "@/components/dashboard/impact/ImpactReglagesChamps";

const etatInitial: ImpactFormState = { error: null, ok: null };

export function ImpactSectionReglages({
  section,
  referentiels,
  emplacements,
  apercuUrl,
}: {
  section: SectionSaisie & { id: string };
  referentiels: ReferentielsImpact;
  /** Emplacements du module qui ouvre cet écran. */
  emplacements: readonly ImpactEmplacement[];
  apercuUrl: string | null;
}) {
  const t = ADMIN_IMPACT;
  const [etat, action, enCours] = useActionState(enregistrerSectionAction, etatInitial);

  return (
    <form action={action} className="adm-edit__aside-form">
      <input type="hidden" name="id" value={section.id} />

      {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

      <ImpactReglagesChamps section={section} referentiels={referentiels} emplacements={emplacements} />

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
