"use client";

import type { CSSProperties, ReactNode } from "react";
import { useVideo } from "./VideoProvider";

type Props = {
  id?: string; className?: string; style?: CSSProperties; children: ReactNode;
  dataSlot?: string; dataRatio?: string;
};

export function VideoButton({ id, className, style, children, dataSlot, dataRatio }: Props) {
  const open = useVideo();
  return (
    <button className={className} style={style} onClick={() => open(id)} data-video-slot={dataSlot} data-slot-ratio={dataRatio}>
      {children}
    </button>
  );
}
