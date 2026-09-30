"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { m, useScroll, useTransform, useSpring } from "framer-motion";
import type { CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

/** Fond vidéo du héros — optimisé pour un chargement rapide.
 *  - Le `poster` est peint INSTANTANÉMENT (calque image de fond, toujours
 *    présent sous la vidéo) → première image immédiate, même avant la vidéo.
 *  - La vidéo n'est chargée QUE si pertinent : jamais en « réduire les
 *    animations », ni en mode économie de données / réseau lent (2G) → on
 *    épargne plusieurs Mo aux connexions lentes (essentiel pour le public RDC).
 *  - Sources multiples : WebM (léger) d'abord, MP4 (compatibilité) ensuite.
 *  - Parallaxe verticale subtile, désactivée au tactile et en reduced-motion.
 *  Prérequis fichier : ré-encoder le MP4 en « faststart » (moov au début) pour
 *  une lecture progressive — cf. scripts/optimize-hero-video.sh. */
export function HeroVideo({ src, srcWebm, poster }: { src: string; srcWebm?: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const [coarse, setCoarse] = useState(false);
  const [load, setLoad] = useState(false);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });
  const yRaw = useTransform(scrollYProgress, [0, 1], ["0px", "64px"]);
  const y = useSpring(yRaw, { stiffness: 120, damping: 30, mass: 0.4 });

  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Faut-il charger la vidéo ? Sinon : poster seul, zéro octet de vidéo.
  useEffect(() => {
    if (reduce) return setLoad(false);
    const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = !!c && (c.saveData === true || c.effectiveType === "slow-2g" || c.effectiveType === "2g");
    setLoad(!slow);
  }, [reduce]);

  // Autoplay muet (React ne pose `muted` qu'en attribut).
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !load) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [load]);

  const still = reduce || coarse;
  const base: CSSProperties = { position: "absolute", left: 0, width: "100%", objectFit: "cover" };
  const videoStyle = still
    ? { ...base, inset: 0, height: "100%" }
    : { ...base, top: "-8%", height: "116%", y };

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0, overflow: "hidden" }} aria-hidden>
      {/* Poster : c'est le CANDIDAT LCP du site. Servi par next/image en
          `priority` → précharge automatique (fetchpriority high) + variantes
          responsives AVIF/WebP dimensionnées par écran, là où l'ancien
          `background-image: url()` n'était pas découvrable par le préchargeur et
          livrait la pleine résolution même sur mobile. Toujours présent sous la
          vidéo pour une première peinture immédiate. */}
      {poster && (
        <Image
          src={poster}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      )}
      {load && (
        // `preload="none"` : la vidéo est décorative et le poster couvre déjà
        // l'écran ; on ne dispute plus au LCP le téléchargement du MP4. L'autoplay
        // muet déclenche de toute façon le streaming progressif (MP4 faststart).
        <m.video ref={videoRef} poster={poster} autoPlay muted loop playsInline preload="none" style={videoStyle}>
          {srcWebm && <source src={srcWebm} type="video/webm" />}
          <source src={src} type="video/mp4" />
        </m.video>
      )}
      {/* lisibilité du texte (héros à dominante gauche) */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(11,15,26,0.94) 0%, rgba(11,15,26,0.80) 38%, rgba(11,15,26,0.46) 70%, rgba(11,15,26,0.62) 100%)" }} />
      {/* teinte de marque (duotone bleu) */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(140deg,#0a1330,#0f62fe)", mixBlendMode: "color", opacity: 0.4 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,15,26,0.15), rgba(11,15,26,0.55))" }} />
    </div>
  );
}
