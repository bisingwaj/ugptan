"use client";

/**
 * Bibliothèque de médias — écran de gestion.
 *
 * Chaque visuel porte son propre formulaire : les textes alternatifs se
 * corrigent là où on voit l'image, sans passer par un écran d'édition séparé.
 * Un formulaire global aurait obligé à faire défiler la page pour vérifier ce
 * qu'on décrit.
 */
import { useActionState } from "react";
import {
  enregistrerMediaExterneAction,
  mettreAJourMediaAction,
  supprimerMediaAction,
  televerserDepuisFormulaireAction,
} from "@/actions/admin-medias";
import type { ActuFormState } from "@/actions/admin-actualites";
import { ADMIN_ACTUS } from "@/content/admin";
import { MIMES_IMAGE, mediaSrc, poidsLisible, TAILLE_MAX, type MediaRef } from "@/lib/medias";

const etatInitial: ActuFormState = { error: null, ok: null };

export type MediaAvecUsage = MediaRef & { usage: number };

export function MediaLibrary({ medias }: { medias: MediaAvecUsage[] }) {
  const t = ADMIN_ACTUS;
  const [etatFichier, actionFichier, fichierEnCours] = useActionState(televerserDepuisFormulaireAction, etatInitial);
  const [etatExterne, actionExterne, externeEnCours] = useActionState(enregistrerMediaExterneAction, etatInitial);

  return (
    <>
      <div className="adm-medias__ajout">
        <form action={actionFichier} className="adm-panel">
          <div className="label-mono">{t.mediasTeleverser}</div>
          {etatFichier.error && <div className="auth-error" role="alert">{etatFichier.error}</div>}
          {etatFichier.ok && <div className="adm-ok" role="status">{etatFichier.ok}</div>}

          <div className="adm-form__field" style={{ marginTop: 12 }}>
            <input type="file" name="fichier" accept={MIMES_IMAGE.join(",")} required className="field" />
            <p className="adm-hint" style={{ marginTop: 6 }}>
              JPEG, PNG, WebP, AVIF ou GIF · {poidsLisible(TAILLE_MAX)} maximum.
            </p>
          </div>

          <div className="adm-form__row">
            <div className="adm-form__field">
              <label className="label-mono">{t.mediasAltFr}</label>
              <input name="altFr" type="text" className="field" />
            </div>
            <div className="adm-form__field">
              <label className="label-mono">{t.mediasAltEn}</label>
              <input name="altEn" type="text" className="field" />
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--sm" disabled={fichierEnCours}>
            {fichierEnCours ? "Téléversement…" : t.mediasTeleverser}
          </button>
        </form>

        <form action={actionExterne} className="adm-panel">
          <div className="label-mono">{t.mediasExterne}</div>
          {etatExterne.error && <div className="auth-error" role="alert">{etatExterne.error}</div>}
          {etatExterne.ok && <div className="adm-ok" role="status">{etatExterne.ok}</div>}

          <div className="adm-form__field" style={{ marginTop: 12 }}>
            <label className="label-mono">{t.mediasUrl}</label>
            <input name="url" type="url" required className="field mono" placeholder="https://cdn.ugptn.cd/img/…" />
            <p className="adm-hint" style={{ marginTop: 6 }}>
              Le fichier reste hébergé chez son fournisseur ; seule son adresse est enregistrée.
            </p>
          </div>

          <div className="adm-form__row">
            <div className="adm-form__field">
              <label className="label-mono">{t.mediasAltFr}</label>
              <input name="altFr" type="text" className="field" />
            </div>
            <div className="adm-form__field">
              <label className="label-mono">{t.mediasAltEn}</label>
              <input name="altEn" type="text" className="field" />
            </div>
          </div>

          <button type="submit" className="btn btn--outline btn--sm" disabled={externeEnCours}>
            {externeEnCours ? "Enregistrement…" : t.mediasEnregistrer}
          </button>
        </form>
      </div>

      <div className="adm__section-title">Bibliothèque</div>

      {medias.length === 0 ? (
        <div className="adm-list"><div className="adm-list__row">{t.mediasVide}</div></div>
      ) : (
        <div className="adm-medias__liste">
          {medias.map((media) => <MediaCard key={media.id} media={media} />)}
        </div>
      )}
    </>
  );
}

function MediaCard({ media }: { media: MediaAvecUsage }) {
  const t = ADMIN_ACTUS;
  const [etat, action, enCours] = useActionState(mettreAJourMediaAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(supprimerMediaAction, etatInitial);

  const src = mediaSrc(media);
  const idSuppression = `media-suppr-${media.id}`;
  const message = etat.error ?? etatSuppression.error;

  return (
    <div className="adm-media-card">
      <div className="adm-media-card__visuel">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={media.altFr ?? ""} loading="lazy" decoding="async" />
      </div>

      <div className="adm-media-card__corps">
        <div className="mono adm-media-card__meta">
          {media.filename}
          {" · "}
          {media.width && media.height ? `${media.width}×${media.height}` : "dimensions inconnues"}
          {media.url ? " · externe" : ` · ${poidsLisible(media.size)}`}
          {media.usage > 0 && ` · ${t.mediasUsage} ${media.usage} article${media.usage > 1 ? "s" : ""}`}
        </div>

        {message && <div className="auth-error" role="alert">{message}</div>}
        {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}

        <form action={action} className="adm-media-card__form">
          <input type="hidden" name="id" value={media.id} />

          <div className="adm-form__row">
            <div className="adm-form__field">
              <label className="label-mono">{t.mediasAltFr}</label>
              <input name="altFr" type="text" className="field" defaultValue={media.altFr ?? ""} />
            </div>
            <div className="adm-form__field">
              <label className="label-mono">{t.mediasAltEn}</label>
              <input name="altEn" type="text" className="field" defaultValue={media.altEn ?? ""} />
            </div>
          </div>

          <div className="adm-form__field">
            <label className="label-mono">{t.mediasLegende}</label>
            <input name="legende" type="text" className="field" defaultValue={media.legende ?? ""} />
          </div>

          <div className="adm-actions__row">
            <button type="submit" className="btn btn--outline btn--sm" disabled={enCours}>
              {enCours ? "Enregistrement…" : t.mediasEnregistrer}
            </button>
            <button type="submit" form={idSuppression} className="btn btn--danger btn--sm" disabled={suppressionEnCours}>
              {t.mediasSupprimer}
            </button>
          </div>
        </form>

        {/* Frère du formulaire d'édition, jamais imbriqué : cf. TaxonomieForm. */}
        <form
          id={idSuppression}
          action={suppression}
          hidden
          onSubmit={(event) => {
            if (!window.confirm(t.mediasSupprimerConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={media.id} />
        </form>
      </div>
    </div>
  );
}
