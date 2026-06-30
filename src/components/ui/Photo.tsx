"use client";

import type { CSSProperties } from "react";
import { FALLBACK_IMG } from "@/content/media";

type Props = { src: string; alt?: string; className?: string; style?: CSSProperties };

/** Plain <img> with a reliable duotone fallback if the photo fails to load. */
export function Photo({ src, alt = "", className, style }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={(e) => {
        const t = e.currentTarget;
        if (t.src !== FALLBACK_IMG) t.src = FALLBACK_IMG;
      }}
    />
  );
}
