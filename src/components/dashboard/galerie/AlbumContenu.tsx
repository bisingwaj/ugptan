"use client";

/**
 * Contenus d'un album, dans l'ordre où ils paraîtront.
 *
 * ⚠️ AUCUNE SAISIE n'est demandée ici, et c'est la règle du module : les
 * informations vivent sur l'album, les médias n'en sont que le contenu. Chaque
 * vignette ne porte donc que des gestes d'ACCROCHAGE, tous en un clic :
 * désigner la couverture, monter, descendre, masquer, retirer.
 *
 * Ni titre, ni légende, ni date, ni case à cocher — rien qui ressemble à un
 * formulaire. Le lien « Détails » reste offert pour qui veut légender une
 * photographie en particulier, mais il n'est jamais un passage obligé : une
 * photographie versée est publiable telle quelle.
 *
 * Les médias MASQUÉS restent affichés, contrairement au site : c'est l'écran où
 * l'on décide de ce qui paraît, et cacher ce qu'on vient de retirer priverait
 * du moyen de le remettre.
 */
import { useActionState } from "react";
import Link from "next/link";
import {
  basculerMediaAlbumAction,
  definirCouvertureAction,
  deplacerContenuAction,
  rattacherAlbumAction,
  type GalFormState,
} from "@/actions/admin-galerie";
import { ADMIN_GALERIE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import type { ContenuAlbum } from "@/lib/galerie/edition";

const etatInitial: GalFormState = { error: null, ok: null };

export function AlbumContenu({
  albumId,
  contenus,
  couvertureChoisie,
}: {
  albumId: string;
  contenus: ContenuAlbum[];
  /** Une couverture a-t-elle été désignée, ou le repli automatique s'applique-t-il ? */
  couvertureChoisie: boolean;
}) {
  const t = ADMIN_GALERIE;
  const [etatCouverture, definirCouverture, couvertureEnCours] = useActionState(
    definirCouvertureAction,
    etatInitial,
  );

  const masques = contenus.filter((item) => item.status === "DRAFT").length;
  const videos = contenus.filter((item) => item.type === "VIDEO").length;

  return (
    <section className="adm-panel adm-gal__contenu">
      <div className="adm-gal__contenu-tete">
        <div>
          <div className="label-mono">{t.contenuTitre}</div>
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.contenuLead}</p>
        </div>

        <div className="adm-gal__contenu-actions">
          <span className="mono adm-hint">
            {t.contenuResume(contenus.length, videos, masques)}
          </span>

          {couvertureChoisie && (
            /* Retour au repli automatique : un identifiant vide efface le choix
               (cf. actions/admin-galerie.ts). */
            <form action={definirCouverture}>
              <input type="hidden" name="albumId" value={albumId} />
              <input type="hidden" name="itemId" value="" />
              <button type="submit" className="btn btn--ghost btn--sm" disabled={couvertureEnCours}>
                {t.contenuCouvertureAuto}
              </button>
            </form>
          )}
        </div>
      </div>

      {!couvertureChoisie && contenus.length > 0 && (
        <p className="adm-hint">{t.contenuCouvertureAutoAide}</p>
      )}

      {etatCouverture.error && <div className="auth-error" role="alert">{etatCouverture.error}</div>}
      {etatCouverture.ok && <div className="adm-ok" role="status">{etatCouverture.ok}</div>}

      {contenus.length === 0 ? (
        <p className="adm-gal__contenu-vide">{t.albumSansContenu}</p>
      ) : (
        /* Une MOSAÏQUE et non une liste : à quarante médias, une ligne par
           entrée fait défiler sur trois écrans pour un accrochage qu'on juge
           d'un coup d'œil. Les gestes apparaissent sur la vignette elle-même. */
        <ul className="adm-gal__mosaique">
          {contenus.map((item, index) => (
            <CarteContenu
              key={item.id}
              albumId={albumId}
              item={item}
              premier={index === 0}
              dernier={index === contenus.length - 1}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function CarteContenu({
  albumId,
  item,
  premier,
  dernier,
}: {
  albumId: string;
  item: ContenuAlbum;
  premier: boolean;
  dernier: boolean;
}) {
  const t = ADMIN_GALERIE;
  const [, deplacer, deplacementEnCours] = useActionState(deplacerContenuAction, etatInitial);
  const [etatCouverture, definirCouverture, couvertureEnCours] = useActionState(
    definirCouvertureAction,
    etatInitial,
  );
  const [etatVisibilite, basculer, visibiliteEnCours] = useActionState(
    basculerMediaAlbumAction,
    etatInitial,
  );
  const [etatRetrait, retirer, retraitEnCours] = useActionState(rattacherAlbumAction, etatInitial);

  const erreur = etatCouverture.error ?? etatRetrait.error ?? etatVisibilite.error;
  const masque = item.status === "DRAFT";

  const classes = [
    "adm-gal__tuile",
    item.couverture ? "adm-gal__tuile--cover" : "",
    masque ? "adm-gal__tuile--masque" : "",
  ].filter(Boolean).join(" ");

  return (
    <li className={classes}>
      <span className="adm-gal__tuile-visuel">
        {item.imageUrl ? (
          // Balise nue plutôt que `next/image` : écran d'administration servi à
          // la demande, où l'optimiseur n'ajouterait qu'une transformation.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.altFr || item.titreFr} loading="lazy" decoding="async" />
        ) : (
          <span className="adm-gal__vignette-vide mono">{t.vignetteAbsente}</span>
        )}

        {item.type === "VIDEO" && <span className="adm-gal__play" aria-hidden="true">▶</span>}

        <span className="adm-gal__tuile-etats">
          {item.couverture && <span className="adm-badge adm-badge--self">{t.contenuCouverture}</span>}
          {masque && <span className="adm-badge adm-badge--off">{t.contenuMasque}</span>}
          {item.sansSource && <span className="adm-badge adm-badge--warn">{t.contenuSansSource}</span>}
        </span>
      </span>

      {/* Les gestes, tous en un clic, sans champ à remplir. */}
      <span className="adm-gal__tuile-gestes">
        <form action={deplacer}>
          <input type="hidden" name="itemId" value={item.id} />
          <input type="hidden" name="sens" value="haut" />
          <button
            type="submit"
            className="adm-gal__geste"
            disabled={deplacementEnCours || premier}
            title={t.contenuMonter}
            aria-label={`${t.contenuMonter} : ${item.titreFr}`}
          >
            ↑
          </button>
        </form>

        <form action={deplacer}>
          <input type="hidden" name="itemId" value={item.id} />
          <input type="hidden" name="sens" value="bas" />
          <button
            type="submit"
            className="adm-gal__geste"
            disabled={deplacementEnCours || dernier}
            title={t.contenuDescendre}
            aria-label={`${t.contenuDescendre} : ${item.titreFr}`}
          >
            ↓
          </button>
        </form>

        {!item.couverture && (
          <form action={definirCouverture}>
            <input type="hidden" name="albumId" value={albumId} />
            <input type="hidden" name="itemId" value={item.id} />
            <button
              type="submit"
              className="adm-gal__geste"
              disabled={couvertureEnCours}
              title={t.contenuDefinirCouverture}
              aria-label={`${t.contenuDefinirCouverture} : ${item.titreFr}`}
            >
              ★
            </button>
          </form>
        )}

        <form action={basculer}>
          <input type="hidden" name="itemId" value={item.id} />
          <button
            type="submit"
            className="adm-gal__geste"
            disabled={visibiliteEnCours}
            title={masque ? t.contenuMontrer : t.contenuMasquer}
            aria-label={`${masque ? t.contenuMontrer : t.contenuMasquer} : ${item.titreFr}`}
          >
            {masque ? "◍" : "◉"}
          </button>
        </form>

        <form
          action={retirer}
          onSubmit={(event) => {
            if (!window.confirm(t.contenuRetirerConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="itemId" value={item.id} />
          <input type="hidden" name="albumId" value="" />
          <button
            type="submit"
            className="adm-gal__geste adm-gal__geste--danger"
            disabled={retraitEnCours}
            title={t.contenuRetirer}
            aria-label={`${t.contenuRetirer} : ${item.titreFr}`}
          >
            ✕
          </button>
        </form>

        {/* Offert, jamais exigé : une photographie versée est publiable telle
            quelle, et ce lien ne sert qu'à qui veut la légender. */}
        <Link
          href={adminPath(`/gallery/${item.id}`)}
          className="adm-gal__geste"
          title={t.contenuDetails}
          aria-label={`${t.contenuDetails} : ${item.titreFr}`}
        >
          ⋯
        </Link>
      </span>

      {erreur && <p className="adm-actions__error" role="alert">{erreur}</p>}
    </li>
  );
}
