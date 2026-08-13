"use client";

/**
 * Formulaire de la FICHE : statut, date, visuel, classement, auteur.
 *
 * Il n'emporte aucune langue. Publier n'écrit donc jamais un titre ni un corps,
 * et la vérification « au moins une langue complète » est faite côté serveur
 * sur l'article relu en base, pas sur ce que porte cet envoi
 * (cf. actions/admin-actualites.ts).
 */
import { useActionState } from "react";
import { enregistrerFicheAction, type ActuFormState } from "@/actions/admin-actualites";
import { ADMIN_ACTUS } from "@/content/admin";
import type { ArticleSaisie, ReferentielsSaisie } from "@/lib/actus/saisie";
import type { MediaRef } from "@/lib/medias";
import { ReglagesChamps } from "@/components/dashboard/actus/ReglagesChamps";

const etatInitial: ActuFormState = { error: null, ok: null };

export function ArticleReglages({
  article,
  referentiels,
  assets,
  apercuUrl,
}: {
  article: ArticleSaisie & { id: string };
  referentiels: ReferentielsSaisie;
  assets: MediaRef[];
  apercuUrl: string | null;
}) {
  const t = ADMIN_ACTUS;
  const [etat, action, enCours] = useActionState(enregistrerFicheAction, etatInitial);

  return (
    <form action={action} className="adm-edit__aside-form">
      <input type="hidden" name="id" value={article.id} />

      {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

      <ReglagesChamps article={article} referentiels={referentiels} assets={assets} />

      {/* Barre d'enregistrement collante : la colonne fait plusieurs écrans de
          haut, le bouton ne doit pas se chercher. */}
      <div className="adm-edit__barre">
        <button type="submit" className="btn btn--primary" disabled={enCours}>
          {enCours ? t.enregistrement : t.enregistrerFiche}
          {!enCours && <span className="arrow">→</span>}
        </button>

        {apercuUrl ? (
          <a href={apercuUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">
            {t.apercu}
          </a>
        ) : (
          <span className="adm-hint">{t.apercuIndisponible}</span>
        )}
      </div>
    </form>
  );
}
