"use client";

/**
 * Bibliothèque de médias et de documents — écran de gestion.
 *
 * Chaque fichier porte son propre formulaire : les textes alternatifs se
 * corrigent là où on voit l'image, sans passer par un écran d'édition séparé.
 * Un formulaire global aurait obligé à faire défiler la page pour vérifier ce
 * qu'on décrit.
 *
 * Les fichiers partent chez Cloudinary (cf. `src/lib/cloudinary.ts`). Un
 * document n'ayant pas de vignette, sa carte affiche son extension et un lien
 * d'ouverture plutôt qu'une image cassée.
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
import {
  estImage,
  extensionLisible,
  MIMES_ACCEPTES,
  mediaSrc,
  poidsLisible,
  TAILLE_MAX,
  TAILLE_MAX_DOCUMENT,
  type MediaRef,
} from "@/lib/medias";
import { vignette } from "@/lib/images";

const etatInitial: ActuFormState = { error: null, ok: null };

export type MediaAvecUsage = MediaRef & { usage: number };

export function MediaLibrary({ medias, stockageActif }: { medias: MediaAvecUsage[]; stockageActif: boolean }) {
  const t = ADMIN_ACTUS;
  const [etatFichier, actionFichier, fichierEnCours] = useActionState(televerserDepuisFormulaireAction, etatInitial);
  const [etatExterne, actionExterne, externeEnCours] = useActionState(enregistrerMediaExterneAction, etatInitial);

  return (
    <>
      <div className="adm-medias__ajout">
        <form action={actionFichier} className="adm-panel">
          <div className="label-mono">{t.mediasTeleverser}</div>
          {!stockageActif && <div className="auth-error" role="alert">{t.mediasStockageAbsent}</div>}
          {etatFichier.error && <div className="auth-error" role="alert">{etatFichier.error}</div>}
          {etatFichier.ok && <div className="adm-ok" role="status">{etatFichier.ok}</div>}

          <div className="adm-form__field" style={{ marginTop: 12 }}>
            <input
              type="file"
              name="fichier"
              accept={MIMES_ACCEPTES.join(",")}
              required
              disabled={!stockageActif}
              className="field"
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>
              Images JPEG, PNG, WebP, AVIF ou GIF · {poidsLisible(TAILLE_MAX)} maximum.
              <br />
              Documents PDF, Word, Excel, PowerPoint ou CSV · {poidsLisible(TAILLE_MAX_DOCUMENT)} maximum.
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

          <button type="submit" className="btn btn--primary btn--sm" disabled={fichierEnCours || !stockageActif}>
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
  const image = estImage(media.mimeType);
  // Un média externe porte une adresse sans nous appartenir : pas d'identifiant
  // de stockage, donc pas de poids connu.
  const externe = Boolean(media.url) && !media.publicId;

  return (
    <div className="adm-media-card">
      <div className="adm-media-card__visuel">
        {image ? (
          // Vignette de 220 px : inutile de rapatrier l'original pour la
          // remplir (cf. `vignette()` dans lib/images.ts). Le fichier reste
          // accessible en pleine définition par son adresse, juste au-dessous.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vignette(src, 480)} alt={media.altFr ?? ""} loading="lazy" decoding="async" />
        ) : (
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="adm-media-card__doc"
            aria-label={`${t.mediasOuvrir} : ${media.filename}`}
          >
            <span className="adm-media-card__ext mono">{extensionLisible(media.filename)}</span>
            <span className="adm-media-card__doclabel">{t.mediasOuvrir}</span>
          </a>
        )}
      </div>

      <div className="adm-media-card__corps">
        <div className="mono adm-media-card__meta">
          {media.filename}
          {" · "}
          {image
            ? media.width && media.height
              ? `${media.width}×${media.height}`
              : "dimensions inconnues"
            : t.mediasDocument}
          {externe ? " · externe" : ` · ${poidsLisible(media.size)}`}
          {media.usage > 0 && ` · ${t.mediasUsage} ${media.usage} publication${media.usage > 1 ? "s" : ""}`}
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
