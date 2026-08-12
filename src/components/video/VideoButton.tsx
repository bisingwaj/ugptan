"use client";

import type { CSSProperties, ReactNode } from "react";
import { useVideo, type VideoMeta } from "./VideoProvider";

type Props = {
  id?: string; className?: string; style?: CSSProperties; children: ReactNode;
  dataSlot?: string; dataRatio?: string;
  /** Titre / source affichés dans l'entête de la lightbox (défaut : film du projet). */
  meta?: VideoMeta;
  ariaLabel?: string;
};

export function VideoButton({ id, className, style, children, dataSlot, dataRatio, meta, ariaLabel }: Props) {
  const open = useVideo();
  return (
    <button className={className} style={style} onClick={() => open(id, meta)} aria-label={ariaLabel} data-video-slot={dataSlot} data-slot-ratio={dataRatio}>
      {children}
    </button>
  );
}
