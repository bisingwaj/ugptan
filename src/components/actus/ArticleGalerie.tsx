"use client";

/**
 * Galerie d'images d'un article : une mosaïque sous le texte, et une
 * visionneuse qui s'ouvre au clic et se parcourt (flèches, clavier, Échap).
 *
 * Même dessin que la galerie du site (classes `gal-*`, cf.
 * components/galerie/GalerieGrille.tsx), sans ce qui lui est propre : ni
 * vidéo, ni rubrique, ni adresse `?media=`. Une galerie d'article se regarde
 * dans l'article, elle n'a pas besoin d'un lien par photo.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { dict } from "@/content/i18n";
import type { Lang } from "@/lib/pick";
import type { ImageActu } from "@/lib/actus/query";
import { Photo } from "@/components/ui/Photo";
import { usePiegeFocus } from "@/components/ui/usePiegeFocus";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

/**
 * Vignettes montrées au plus. La galerie vit dans une colonne collée à
 * l'écran : quatre rangées de trois la gardent sous la hauteur d'un portable,
 * au-delà son bas deviendrait inaccessible. La dernière vignette annonce le
 * reste (« +15 »), et la visionneuse parcourt toutes les images.
 */
const VIGNETTES_MAX = 12;

export function ArticleGalerie({ images, lang, titre }: { images: ImageActu[]; lang: Lang; titre: string }) {
  const t = dict(lang).galerie;
  const ta = dict(lang).actus;
  const [index, setIndex] = useState<number | null>(null);
  const declencheur = useRef<HTMLElement | null>(null);
  const panneau = useRef<HTMLDivElement>(null);
  const total = images.length;
  const ouverte = index === null ? null : images[index] ?? null;

  const ouvrir = (position: number) => {
    declencheur.current = document.activeElement as HTMLElement | null;
    setIndex(position);
  };

  const fermer = useCallback(() => {
    setIndex(null);
    declencheur.current?.focus();
  }, []);

  // Parcours circulaire : la dernière image ramène à la première.
  const deplacer = useCallback(
    (pas: number) => setIndex((courant) => (courant === null ? null : (courant + pas + total) % total)),
    [total],
  );

  useEffect(() => {
    if (index === null) return;
    const surTouche = (event: KeyboardEvent) => {
      if (event.key === "Escape") fermer();
      else if (event.key === "ArrowRight") deplacer(1);
      else if (event.key === "ArrowLeft") deplacer(-1);
    };
    // Le défilement de la page se verrouille de lui-même tant qu'un `.scrim`
    // est affiché (cf. motion/SmoothScroll.tsx).
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [index, fermer, deplacer]);

  useEffect(() => {
    if (index !== null) panneau.current?.focus();
  }, [index]);
  usePiegeFocus(panneau, index !== null, { initial: panneau });

  if (total === 0) return null;

  return (
    <section className="actu-galerie" aria-label={titre}>
      <div className="mono actu-galerie__titre">
        {titre} · {total}
      </div>

      <RevealGroup as="ul" className="gal-grille actu-galerie__grille" gap={0.04}>
        {images.slice(0, VIGNETTES_MAX).map((image, position) => {
          const reste = position === VIGNETTES_MAX - 1 ? total - VIGNETTES_MAX : 0;
          return (
            <RevealItem as="li" key={image.id} zoom className="gal-cell">
              <button
                type="button"
                className="gal-cell__btn"
                onClick={() => ouvrir(position)}
                aria-label={
                  reste > 0
                    ? `${ta.galerieVoirTout} (${total})`
                    : `${t.openPhoto} : ${image.legende ?? image.alt}`
                }
              >
                <Photo
                  src={image.src}
                  alt={image.alt}
                  unoptimized={image.unoptimized}
                  sizes="(max-width: 960px) 33vw, 170px"
                />
                {reste > 0 && (
                  <span className="actu-galerie__reste" aria-hidden="true">+{reste}</span>
                )}
              </button>
            </RevealItem>
          );
        })}
      </RevealGroup>

      {total > 1 && (
        <button type="button" className="actu-galerie__tout" onClick={() => ouvrir(0)}>
          {ta.galerieVoirTout} ({total}) →
        </button>
      )}

      {/* Portail vers <body> : rendue dans la colonne collée (position:
          sticky, qui crée son propre empilement), la visionneuse restait
          sous le bandeau de l'article malgré son z-index. */}
      {ouverte && index !== null && createPortal(
        <div className="scrim scrim--center gal-scrim" onClick={fermer}>
          <div
            ref={panneau}
            tabIndex={-1}
            className="modal gal-vue"
            role="dialog"
            aria-modal="true"
            aria-label={ouverte.legende ?? ouverte.alt}
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
                <button type="button" className="gal-vue__nav gal-vue__nav--prec" onClick={() => deplacer(-1)} aria-label={t.previous}>
                  ←
                </button>
              )}
              <div className="gal-vue__image">
                <Photo
                  key={ouverte.id}
                  src={ouverte.src}
                  alt={ouverte.alt}
                  unoptimized={ouverte.unoptimized}
                  sizes="(max-width: 900px) 100vw, 1100px"
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              {total > 1 && (
                <button type="button" className="gal-vue__nav gal-vue__nav--suiv" onClick={() => deplacer(1)} aria-label={t.next}>
                  →
                </button>
              )}
            </div>

            {ouverte.legende && (
              <div className="gal-vue__pied">
                <div className="gal-vue__texte">
                  <p className="gal-vue__desc">{ouverte.legende}</p>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
