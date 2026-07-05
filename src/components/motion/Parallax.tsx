"use client";
/* Parallax — décalage vertical subtil lié au scroll (transform-only, GPU).
   Réservé à la couche média du héros (pas le texte). Lenis pilote le scroll
   natif que useScroll lit → coexistence OK. Reduced-motion : rendu statique. */
import { useRef } from "react";
import { m, useScroll, useTransform, useSpring } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { usePrefersReducedMotion } from "./useReducedMotion";

export function Parallax({
  children,
  speed = 0.12,
  className,
  style,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yRaw = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);
  const y = useSpring(yRaw, { stiffness: 120, damping: 30, mass: 0.4 });

  if (reduce) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={{ ...style, overflow: "hidden" }}>
      <m.div style={{ y, willChange: "transform", height: "100%" }}>{children}</m.div>
    </div>
  );
}
