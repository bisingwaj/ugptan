"use client";

import { useEffect, useRef } from "react";

/** Fond vidéo du héros : autoplay muet en boucle + calques de lisibilité (gauche sombre, teinte bleue). */
export function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // Forcer la propriété muted (React ne la pose qu'en attribut) pour autoriser l'autoplay.
    v.muted = true;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { v.pause(); return; }
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }} aria-hidden>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={ref}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* lisibilité du texte (héros à dominante gauche) */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(11,15,26,0.94) 0%, rgba(11,15,26,0.80) 38%, rgba(11,15,26,0.46) 70%, rgba(11,15,26,0.62) 100%)" }} />
      {/* teinte de marque (duotone bleu) */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(140deg,#0a1330,#0f62fe)", mixBlendMode: "color", opacity: 0.4 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,15,26,0.15), rgba(11,15,26,0.55))" }} />
    </div>
  );
}
