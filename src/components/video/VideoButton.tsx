"use client";

import type { CSSProperties, ReactNode } from "react";
import { useVideo } from "./VideoProvider";

type Props = { id?: string; className?: string; style?: CSSProperties; children: ReactNode };

export function VideoButton({ id, className, style, children }: Props) {
  const open = useVideo();
  return (
    <button className={className} style={style} onClick={() => open(id)}>
      {children}
    </button>
  );
}
