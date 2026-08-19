"use client";

/**
 * Le visuel d'une entrée : ce qu'il est, et comment le remplacer.
 *
 * Formulaire distinct de celui de la fiche, et posé avant lui par la page : deux
 * `<form>` ne peuvent pas s'imbriquer, et remplacer une image n'a rien à voir
 * avec l'enregistrement d'une légende (cf. actions/admin-galerie.ts).
 *
 * L'image est affichée par une balise `img` nue plutôt que par `next/image` :
 * c'est un écran d'administration, servi à la demande derrière une session, et
 * faire passer une vérification de cadrage par l'optimiseur ne ferait
 * qu'ajouter une transformation entre la rédaction et ce qu'elle veut voir.
 */
import { useActionState, useId, useState } from "react";
import { remplacerVisuelAction, type GalFormState } from "@/actions/admin-galerie";
import { ADMIN_GALERIE } from "@/content/admin";
import type { VisuelSaisie } from "@/lib/galerie/saisie";
// Aliasée : le composant reçoit déjà une prop booléenne nommée `vignette`.
import { vignette as bornerLargeur } from "@/lib/images";
import {
  ACCEPT_GAL_IMAGE, TAILLE_MAX, estMimeImageGalerie, poidsLisible,
} from "@/lib/galerie/fichier";

const etatInitial: GalFormState = { error: null, ok: null };

export function GalerieVisuel({
  id,
  visuel,
  alt,
  vignette,
  stockageActif,
}: {
  id: string;
  /** `null` quand une vidéo n'a pas encore de vignette. */
  visuel: VisuelSaisie | null;
  /** Texte alternatif de la fiche, pour ne pas annoncer une image muette. */
  alt: string;
  /** Vrai pour une vidéo : le visuel y est une vignette d'attente, pas le contenu. */
  vignette: boolean;
  stockageActif: boolean;
}) {
  const t = ADMIN_GALERIE;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(remplacerVisuelAction, etatInitial);
  const [refus, setRefus] = useState<string | null>(null);

  const verifier = (fichier: File | null | undefined) => {
    if (!fichier) {
      setRefus(null);
      return;
    }
    if (!estMimeImageGalerie(fichier.type)) {
      setRefus("Format non accepté. JPEG, PNG, WebP, AVIF ou GIF.");
      return;
    }
    setRefus(
      fichier.size > TAILLE_MAX
        ? `Image trop lourde (${poidsLisible(fichier.size)}). Limite : ${poidsLisible(TAILLE_MAX)}.`
        : null,
    );
  };

  return (
    <div className="adm-panel adm-gal__visuel">
      <div className="adm-gal__visuel-tete">
        <div className="label-mono">{vignette ? t.visuelVignette : t.blocVisuel}</div>
        {visuel && (
          <span className="mono adm-hint">
            {visuel.width && visuel.height ? `${visuel.width}×${visuel.height} · ` : ""}
            {visuel.taille > 0 ? poidsLisible(visuel.taille) : "poids inconnu"}
          </span>
        )}
      </div>

      <div className="adm-gal__visuel-corps">
        <div className="adm-gal__apercu">
          {visuel ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bornerLargeur(visuel.url, 640)} alt={alt} loading="lazy" decoding="async" />
          ) : (
            <span className="adm-gal__apercu-vide mono">{t.visuelAucun}</span>
          )}
        </div>

        <form action={action} className="adm-gal__remplacer">
          <input type="hidden" name="id" value={id} />

          {!stockageActif && <div className="auth-error" role="alert">{t.stockageAbsent}</div>}
          {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
          {etat.ok && <div className="adm-ok" role="status">{etat.ok}</div>}
          {refus && <div className="auth-error" role="alert">{refus}</div>}

          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-visuel`}>
              {visuel ? t.visuelRemplacer : t.visuelChoisir}
            </label>
            <input
              id={`${idBase}-visuel`}
              name="visuel"
              type="file"
              className="field"
              accept={ACCEPT_GAL_IMAGE}
              required
              disabled={!stockageActif}
              onChange={(event) => verifier(event.target.files?.[0])}
            />
            <p className="adm-hint" style={{ marginTop: 6 }}>
              {visuel ? t.visuelRemplacerAide : t.visuelAide}
            </p>
          </div>

          <div className="adm-actions__row">
            <button
              type="submit"
              className="btn btn--outline btn--sm"
              disabled={enCours || !stockageActif || refus !== null}
            >
              {enCours ? t.visuelRemplacement : visuel ? t.visuelRemplacer : t.visuelAjouter}
            </button>
            {visuel && (
              <a
                href={visuel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost btn--sm"
              >
                Ouvrir l&apos;image ↗
              </a>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
