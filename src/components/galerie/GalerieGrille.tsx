"use client";

/**
 * Mosaïque publique de la galerie, et visionneuse d'un contenu.
 *
 * Ce qui est CLIENT et ce qui ne l'est pas :
 *   · le filtrage, la recherche et le tri restent SERVEUR (formulaire GET et
 *     liens de la page). L'URL porte donc l'état de la galerie : elle se
 *     partage, se met en favori, se rejoue au bouton « précédent », et les
 *     moteurs indexent chaque combinaison utile. Filtrer ici aurait obligé à
 *     charger toute la galerie pour n'en montrer que trente vignettes ;
 *   · seule la VISIONNEUSE est cliente, parce qu'elle s'ouvre, se parcourt et se
 *     ferme sans rechargement.
 *
 * La visionneuse reste ADRESSABLE malgré tout : `?media=<id>` l'ouvre au
 * chargement, et chaque déplacement met l'adresse à jour. C'est ce lien que la
 * console donne à suivre depuis la fiche d'un contenu visible.
 *
 * ─── Pourquoi une visionneuse propre, et non `VideoProvider` ─────────────────
 *
 * La lightbox du site (components/video/VideoProvider.tsx) ouvre UNE vidéo et
 * s'arrête là. Une galerie se PARCOURT : flèches, compteur, passage d'une photo
 * à un film sans repasser par la grille. Étendre le fournisseur global à ce
 * besoin lui aurait fait porter une liste et un index dont aucune de ses autres
 * utilisations n'a l'usage.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { dict } from "@/content/i18n";
import type { Lang } from "@/lib/pick";
import type { GalerieVue } from "@/lib/galerie/query";
import { Photo } from "@/components/ui/Photo";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

/**
 * Ratio de repli quand les dimensions n'ont pas été relevées.
 *
 * Le format paysage plutôt que le carré : c'est celui de l'immense majorité des
 * photographies de chantier et de toutes les vignettes de vidéo, et une cellule
 * carrée au milieu d'une mosaïque paysage se remarque plus qu'un paysage au
 * milieu de carrés.
 */
const RATIO_DEFAUT = 3 / 2;

export function GalerieGrille({
  items,
  lang,
  ouvertParDefaut,
}: {
  items: GalerieVue[];
  lang: Lang;
  /** Identifiant porté par `?media=` à l'arrivée sur la page. */
  ouvertParDefaut?: string | null;
}) {
  const t = dict(lang).galerie;

  const [index, setIndex] = useState<number | null>(() => {
    if (!ouvertParDefaut) return null;
    const trouve = items.findIndex((item) => item.id === ouvertParDefaut);
    return trouve >= 0 ? trouve : null;
  });

  /**
   * Élément qui avait le focus à l'ouverture, pour le lui rendre à la fermeture.
   * Sans cela, refermer la visionneuse renvoie le focus en tête de document et
   * la navigation au clavier repart du haut de la page.
   */
  const declencheur = useRef<HTMLElement | null>(null);
  const panneau = useRef<HTMLDivElement>(null);

  const ouvert = index === null ? null : items[index] ?? null;

  /**
   * Adresse tenue à jour SANS navigation : `replaceState` plutôt que le routeur.
   * Un `router.replace` referait un aller-retour serveur pour la seule ouverture
   * d'un panneau déjà rendu, et ferait clignoter la mosaïque.
   */
  const majAdresse = useCallback((id: string | null) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("media", id);
    else url.searchParams.delete("media");
    window.history.replaceState(null, "", url);
  }, []);

  const ouvrir = (position: number) => {
    declencheur.current = document.activeElement as HTMLElement | null;
    setIndex(position);
    majAdresse(items[position]?.id ?? null);
  };

  const fermer = useCallback(() => {
    setIndex(null);
    majAdresse(null);
    declencheur.current?.focus();
  }, [majAdresse]);

  /**
   * Déplacement circulaire : la dernière image ramène à la première.
   *
   * Un parcours qui bute est une impasse ; ici, arriver au bout de la sélection
   * en cours et repartir au début est ce qu'un visiteur attend d'une galerie.
   *
   * ⚠️ Le rang suivant se calcule ICI, et non dans une mise à jour fonctionnelle
   * `setIndex(courant => …)`. React traite ces fonctions comme PURES : il les
   * exécute pendant le rendu, et deux fois en mode strict. Y appeler
   * `majAdresse` revenait donc à écrire l'historique en plein rendu, ce que le
   * routeur de Next signale (« Cannot update a component while rendering a
   * different component ») et ce qui, en mode strict, poussait deux entrées
   * pour un seul clic.
   *
   * `deplacer` n'est déclenché que par un geste — les deux flèches du panneau et
   * les touches directionnelles —, jamais pendant un rendu : lire `index` de la
   * portée est donc sûr, et c'est déjà ce que font `ouvrir` et `fermer`.
   */
  const deplacer = useCallback(
    (pas: number) => {
      if (index === null || items.length === 0) return;
      const suivant = (index + pas + items.length) % items.length;
      setIndex(suivant);
      majAdresse(items[suivant]?.id ?? null);
    },
    [index, items, majAdresse],
  );

  useEffect(() => {
    if (index === null) return;

    const surTouche = (event: KeyboardEvent) => {
      if (event.key === "Escape") fermer();
      else if (event.key === "ArrowRight") deplacer(1);
      else if (event.key === "ArrowLeft") deplacer(-1);
    };

    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [index, fermer, deplacer]);

  // Le panneau prend le focus à l'ouverture : sans cela, les flèches ne
  // pilotent rien tant que le visiteur n'a pas cliqué dedans, et un lecteur
  // d'écran continue d'annoncer la page derrière le voile.
  useEffect(() => {
    if (index !== null) panneau.current?.focus();
  }, [index]);

  const total = items.length;

  return (
    <>
      {/* `RevealGroup` REMPLACE la grille et `RevealItem` la cellule : aucun
          conteneur intermédiaire, conformément au contrat du composant. Une
          galerie est une LISTE — d'où `ul` / `li` plutôt que des `div`, pour que
          la navigation au lecteur d'écran en annonce le nombre. */}
      <RevealGroup as="ul" className="gal-grille" gap={0.035}>
        {items.map((item, position) => (
          <RevealItem
            as="li"
            key={item.id}
            className={item.featured ? "gal-cell gal-cell--large" : "gal-cell"}
          >
            <button
              type="button"
              className="gal-cell__btn"
              style={{ aspectRatio: String(item.visuel.ratio ?? RATIO_DEFAUT) }}
              onClick={() => ouvrir(position)}
              aria-label={`${item.type === "VIDEO" ? t.openVideo : t.openPhoto} : ${item.titre}`}
            >
              {item.visuel.src ? (
                <Photo
                  src={item.visuel.src}
                  alt={item.visuel.alt}
                  unoptimized={item.visuel.unoptimized}
                  sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <span className="gal-cell__plaque" aria-hidden="true" />
              )}

              <span className="gal-cell__voile" aria-hidden="true" />

              {item.type === "VIDEO" && (
                <span className="gal-cell__play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" focusable="false">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {item.video?.duree && <em className="mono">{item.video.duree}</em>}
                </span>
              )}

              <span className="gal-cell__legende">
                <span className="gal-cell__kicker mono">
                  {item.rubrique ? item.rubrique.nom : item.typeLabel}
                  {item.lieu ? ` · ${item.lieu}` : ""}
                </span>
                <span className="gal-cell__titre">{item.titre}</span>
              </span>
            </button>
          </RevealItem>
        ))}
      </RevealGroup>

      {ouvert && index !== null && (
        <div className="scrim scrim--center gal-scrim" onClick={fermer}>
          <div
            ref={panneau}
            tabIndex={-1}
            className="modal gal-vue"
            role="dialog"
            aria-modal="true"
            aria-label={ouvert.titre}
            data-lenis-prevent
            onClick={(event) => event.stopPropagation()}
          >
            <div className="gal-vue__barre">
              <span className="mono gal-vue__compteur">{t.counter(index + 1, total)}</span>
              <span className="mono gal-vue__aide">{t.keyboardHint}</span>
              <button type="button" className="gal-vue__fermer" onClick={fermer} aria-label={t.close}>
                ✕
              </button>
            </div>

            <div className="gal-vue__scene">
              {total > 1 && (
                <button
                  type="button"
                  className="gal-vue__nav gal-vue__nav--prec"
                  onClick={() => deplacer(-1)}
                  aria-label={t.previous}
                >
                  ←
                </button>
              )}

              <MediaOuvert item={ouvert} lang={lang} />

              {total > 1 && (
                <button
                  type="button"
                  className="gal-vue__nav gal-vue__nav--suiv"
                  onClick={() => deplacer(1)}
                  aria-label={t.next}
                >
                  →
                </button>
              )}
            </div>

            <div className="gal-vue__pied">
              <div className="gal-vue__texte">
                <div className="gal-vue__kicker mono">
                  {ouvert.typeLabel}
                  {ouvert.rubrique ? ` · ${ouvert.rubrique.nom}` : ""}
                  {ouvert.featured ? ` · ${t.featured}` : ""}
                </div>
                <h2 className="gal-vue__titre">{ouvert.titre}</h2>
                {ouvert.description && <p className="gal-vue__desc">{ouvert.description}</p>}
              </div>

              <dl className="gal-vue__defs">
                {ouvert.lieu && (
                  <div className="gal-vue__row">
                    <dt>{t.labelPlace}</dt>
                    <dd>{ouvert.lieu}</dd>
                  </div>
                )}
                {ouvert.dateLabel && (
                  <div className="gal-vue__row">
                    <dt>{t.labelDate}</dt>
                    <dd>{ouvert.dateLabel}</dd>
                  </div>
                )}
                {ouvert.video?.duree && (
                  <div className="gal-vue__row">
                    <dt>{t.labelDuration}</dt>
                    <dd className="mono">{ouvert.video.duree}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Ce que la scène affiche : une image, ou le lecteur du fichier vidéo.
 *
 * La `key` posée sur le lecteur n'est pas décorative : sans elle, React
 * réutilise le même nœud `<video>` d'un contenu à l'autre, et le navigateur
 * continue de lire la piste précédente pendant que la source change sous lui.
 * Une clé par identifiant force le remontage, donc l'arrêt franc.
 */
function MediaOuvert({ item, lang }: { item: GalerieVue; lang: Lang }) {
  const t = dict(lang).galerie;

  if (item.type === "VIDEO" && item.video) {
    if (item.video.source === "FICHIER") {
      return (
        <video
          key={item.id}
          src={item.video.src}
          poster={item.visuel.src || undefined}
          controls
          autoPlay
          playsInline
          className="gal-vue__lecteur"
        />
      );
    }

    return <p className="gal-vue__vide">{t.videoUnavailable}</p>;
  }

  return (
    <div className="gal-vue__image">
      <Photo
        src={item.visuel.src}
        alt={item.visuel.alt}
        unoptimized={item.visuel.unoptimized}
        sizes="(max-width: 900px) 100vw, 1100px"
        style={{ objectFit: "contain" }}
        priority
      />
    </div>
  );
}
