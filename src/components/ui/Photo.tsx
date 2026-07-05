"use client";

import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";
import { FALLBACK_IMG } from "@/content/media";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  /** Indice de taille rendue (responsive) pour servir le bon poids d'image. */
  sizes?: string;
  /** Chargement prioritaire (visuel au-dessus de la ligne de flottaison). */
  priority?: boolean;
};

/** Image optimisée (next/image, mode `fill`) : redimensionnement auto, WebP/AVIF,
 *  lazy par défaut, zéro CLS. Repli duotone si le chargement échoue.
 *  À placer dans un conteneur positionné (toutes les utilisations sont dans .duo). */
export function Photo({
  src,
  alt = "",
  className,
  style,
  sizes = "(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 360px",
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <span
        aria-hidden
        className={className}
        style={{ position: "absolute", inset: 0, backgroundImage: `url("${FALLBACK_IMG}")`, backgroundSize: "cover", backgroundPosition: "center", ...style }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      style={{ objectFit: "cover", ...style }}
      onError={() => setFailed(true)}
    />
  );
}
