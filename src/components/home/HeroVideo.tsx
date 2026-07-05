"use client";

import { useEffect, useRef, useState } from "react";
import { m, useScroll, useTransform, useSpring } from "framer-motion";
import type { CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

/** Fond vidéo du héros : autoplay muet en boucle + calques de lisibilité
 *  (gauche sombre, teinte bleue) + parallaxe verticale subtile au scroll.
 *  `poster` = premier rendu instantané (avant que la vidéo ne charge).
 *  Parallaxe désactivée au tactile (vidéo conservée mais statique) et en
 *  « réduire les animations » (vidéo en pause). */
export function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const [coarse, setCoarse] = useState(false);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });
  const yRaw = useTransform(scrollYProgress, [0, 1], ["0px", "64px"]);
  const y = useSpring(yRaw, { stiffness: 120, damping: 30, mass: 0.4 });

  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Forcer la propriété muted (React ne la pose qu'en attribut) pour autoriser l'autoplay.
    v.muted = true;
    if (reduce) { v.pause(); return; }
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [reduce]);

  const still = reduce || coarse;
  const base: CSSProperties = { position: "absolute", left: 0, width: "100%", objectFit: "cover" };
  const videoStyle = still
    ? { ...base, inset: 0, height: "100%" }
    : { ...base, top: "-8%", height: "116%", y };

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0, overflow: "hidden" }} aria-hidden>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <m.video ref={videoRef} src={src} poster={poster} autoPlay muted loop playsInline preload="auto" style={videoStyle} />
      {/* lisibilité du texte (héros à dominante gauche) */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(11,15,26,0.94) 0%, rgba(11,15,26,0.80) 38%, rgba(11,15,26,0.46) 70%, rgba(11,15,26,0.62) 100%)" }} />
      {/* teinte de marque (duotone bleu) */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(140deg,#0a1330,#0f62fe)", mixBlendMode: "color", opacity: 0.4 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,15,26,0.15), rgba(11,15,26,0.55))" }} />
    </div>
  );
}
