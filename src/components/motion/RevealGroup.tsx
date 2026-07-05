"use client";
/* RevealGroup / RevealItem — apparition séquencée (stagger) pour grilles & listes.
   - Le conteneur orchestre ; chaque item hérite (pas de whileInView par item).
   - IMPORTANT (filets 1px des grilles) : RevealGroup REMPLACE l'élément grille
     et RevealItem REMPLACE l'élément cellule — aucun wrapper intermédiaire,
     sinon le `gap:1px; background` qui dessine les filets saute.
   - Reduced-motion : rendu statique et visible.
   - ROBUSTESSE AUX LISTES DYNAMIQUES (filtres, recherche, tri) : on pilote la
     révélation via `useInView` + une prop `animate` PERSISTANTE (et non
     `whileInView` one-shot). Avec `whileInView`+`once`, l'observateur est retiré
     après le 1er passage : un enfant démonté puis remonté (retour à « voir tout »
     après un filtre) restait bloqué sur l'état `hidden` (opacité 0 → « c'est vide »).
     Une cible `animate` toujours active est héritée par tout enfant remonté, qui
     rejoue donc hidden→show. Cf. Marchés / Actualités / Transparence. */
import { m, useInView } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { stagger, fadeUp, fade } from "./variants";
import { usePrefersReducedMotion } from "./useReducedMotion";

const GROUP_TAGS = { div: m.div, section: m.section, ul: m.ul };

export function RevealGroup({
  children,
  gap = 0.05,
  delayChildren = 0,
  as = "div",
  className,
  style,
}: {
  children: ReactNode;
  gap?: number;
  delayChildren?: number;
  as?: keyof typeof GROUP_TAGS;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // `once: true` → ne se relance pas au scroll, mais la cible `animate` reste
  // active en permanence, donc les enfants remontés (après un filtre) révèlent.
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  // Tag runtime choisi par `as` ; cast types-only (div/section/ul acceptent les
  // mêmes props motion + ref) pour satisfaire le typage du ref sur l'union.
  const Tag = GROUP_TAGS[as] as typeof m.div;

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
      className={className}
      style={style}
      variants={stagger(gap, delayChildren)}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </Tag>
  );
}

const ITEM_TAGS = { div: m.div, li: m.li, a: m.a };

export function RevealItem({
  children,
  as = "div",
  className,
  style,
  fade: fadeOnly = false,
}: {
  children: ReactNode;
  as?: keyof typeof ITEM_TAGS;
  className?: string;
  style?: CSSProperties;
  /** Apparition en opacité seule (sans translation) — à utiliser pour les
   *  cellules à effet de survol qui translatent (cell--fx / cell--bloom),
   *  afin que framer ne laisse pas de transform inline bloquant le :hover. */
  fade?: boolean;
}) {
  const reduce = usePrefersReducedMotion();

  if (reduce) {
    const Static = as;
    return (
      <Static className={className} style={style}>
        {children}
      </Static>
    );
  }

  const Tag = ITEM_TAGS[as];
  return (
    <Tag data-mo="" className={className} style={style} variants={fadeOnly ? fade : fadeUp}>
      {children}
    </Tag>
  );
}
