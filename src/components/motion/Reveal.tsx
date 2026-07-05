"use client";
/* Reveal — primitive d'apparition au scroll pour UN élément.
   - SSR-safe : le texte est dans le HTML ; `data-mo` permet au <noscript> du
     layout de forcer la visibilité si JS est coupé.
   - Reduced-motion : rend les enfants statiques et visibles (même DOM). */
import { m, useInView } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";
import type { Variants } from "framer-motion";
import { fadeUp, fade, mask } from "./variants";
import { usePrefersReducedMotion } from "./useReducedMotion";

type Variant = "up" | "fade" | "mask";
const VARIANTS: Record<Variant, Variants> = { up: fadeUp, fade, mask };
const TAGS = { div: m.div, section: m.section, span: m.span };

function withDelay(v: Variants, delay: number): Variants {
  if (!delay) return v;
  const show = v.show as Record<string, unknown>;
  return { ...v, show: { ...show, transition: { ...(show.transition as object), delay } } };
}

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  as = "div",
  className,
  style,
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  as?: keyof typeof TAGS;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Cible `animate` persistante (via useInView) plutôt que `whileInView` one-shot :
  // un élément remonté (contenu conditionnel/filtré) rejoue hidden→show au lieu
  // de rester bloqué sur `hidden`. Cf. RevealGroup pour le détail du piège.
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const Tag = TAGS[as] as typeof m.div;

  if (reduce) {
    const Static = as;
    return (
      <Static className={className} style={style}>
        {children}
      </Static>
    );
  }

  return (
    <Tag
      ref={ref}
      data-mo=""
      className={className}
      style={style}
      variants={withDelay(VARIANTS[variant], delay)}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </Tag>
  );
}
