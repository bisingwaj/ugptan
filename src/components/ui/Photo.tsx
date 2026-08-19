"use client";

import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";
import { FALLBACK_IMG } from "@/content/media";
import { apercuFlou } from "@/lib/images";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  /** Indice de taille rendue (responsive) pour servir le bon poids d'image. */
  sizes?: string;
  /** Chargement prioritaire (visuel au-dessus de la ligne de flottaison). */
  priority?: boolean;
  /**
   * Court-circuite l'optimiseur d'images. Nécessaire pour un visuel géré depuis
   * la console dont l'hôte n'est pas déclaré dans `next.config.mjs` : plutôt que
   * d'ouvrir `remotePatterns` à tous les domaines — ce qui ferait de
   * l'optimiseur un relais ouvert —, l'image est servie telle quelle
   * (cf. `estOptimisable()` dans lib/medias.ts).
   */
  unoptimized?: boolean;
};

/**
 * Image optimisée (next/image, mode `fill`) : redimensionnement auto, WebP/AVIF,
 * chargement différé, zéro décalage de mise en page.
 *
 * L'image n'apparaît plus d'un bloc. Une miniature de 16 px, floutée et étirée
 * au cadre, est posée dessous et sert de première impression : elle arrive en un
 * aller-retour réseau là où la photographie complète en demande plusieurs, puis
 * s'efface derrière elle. Sur une liaison lente, la page cesse d'afficher des
 * cadres vides le temps du chargement.
 *
 * La miniature est DÉRIVÉE de l'adresse du visuel (cf. lib/images.ts) : rien
 * n'est stocké pour elle, et les visuels déjà enregistrés en base en profitent
 * sans reprise. Quand aucune dérivation n'est possible, l'aplat duotone du
 * design system tient le cadre.
 *
 * Les styles de position de la miniature sont écrits en ligne, et non en
 * classe : `.duo > img` l'emporterait sur une classe et la replacerait au cadre
 * exact, découvrant les bords que le flou rend translucides.
 *
 * À placer dans un conteneur positionné (toutes les utilisations sont dans `.duo`).
 */
export function Photo({
  src,
  alt = "",
  className,
  style,
  sizes = "(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 360px",
  priority = false,
  unoptimized = false,
}: Props) {
  const [charge, setCharge] = useState(false);
  const [echec, setEchec] = useState(false);

  // Le composant est réutilisé d'une image à l'autre dans la visionneuse de la
  // galerie : sans cette remise à zéro, la suivante hériterait de l'état de la
  // précédente — affichée sans son fondu, ou remplacée par l'aplat de repli.
  const [srcRendu, setSrcRendu] = useState(src);
  if (srcRendu !== src) {
    setSrcRendu(src);
    setCharge(false);
    setEchec(false);
  }

  if (echec || !src) {
    return (
      <span
        aria-hidden
        className={className}
        style={{ position: "absolute", inset: 0, backgroundImage: `url("${FALLBACK_IMG}")`, backgroundSize: "cover", backgroundPosition: "center", ...style }}
      />
    );
  }

  const cadrage = style?.objectFit ?? "cover";

  return (
    <>
      {/* Miniature de chargement. Balise nue plutôt que `next/image` : elle est
          déjà à sa taille finale, l'optimiseur n'aurait rien à en retirer et
          interposerait un aller-retour avant le premier pixel affiché. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={apercuFlou(src) ?? FALLBACK_IMG}
        alt=""
        aria-hidden
        data-photo="apercu"
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        style={{
          // Débordement de 4 % : `filter: blur()` rend les bords translucides,
          // le conteneur (`overflow: hidden`) les recadre.
          position: "absolute",
          top: "-4%",
          left: "-4%",
          width: "108%",
          height: "108%",
          objectFit: cadrage,
          objectPosition: style?.objectPosition,
          filter: "blur(14px)",
          opacity: charge ? 0 : 1,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        // `priority` est déprécié depuis Next 16 : `preload` dit la même chose
        // sans ambiguïté (insertion d'un <link rel="preload"> dans le <head>),
        // et `fetchPriority` la fait valoir auprès du navigateur.
        preload={priority}
        fetchPriority={priority ? "high" : undefined}
        unoptimized={unoptimized}
        className={className}
        // Le fondu dépend de `onLoad`, donc de JavaScript. L'attribut donne au
        // secours sans JS du layout de quoi rétablir l'image (cf. son <noscript>).
        data-photo="image"
        style={{
          objectFit: "cover",
          ...style,
          opacity: charge ? 1 : 0,
          transition: "opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onLoad={() => setCharge(true)}
        onError={() => setEchec(true)}
      />
    </>
  );
}
