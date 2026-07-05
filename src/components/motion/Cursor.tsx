"use client";
/* Curseur personnalisé — anneau fin + point, en mix-blend-mode: difference
   (blanc qui s'inverse selon le fond → toujours visible, sombre comme clair).
   Suivi fluide (spring, léger retard sur l'anneau), s'agrandit au survol des
   éléments cliquables, se rétracte au clic. Bureau (pointeur fin) uniquement ;
   désactivé si « réduire les animations » (curseur natif conservé). */
import { useEffect, useState } from "react";
import { m, useMotionValue, useSpring } from "framer-motion";

const INTERACTIVE = "a, button, input, textarea, select, label, summary, [role='button'], [data-cursor]";

export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 32, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 350, damping: 32, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setEnabled(true);
    document.documentElement.classList.add("cursor-custom");

    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); setVisible(true); };
    const over = (e: MouseEvent) => {
      const t = e.target as Element | null;
      setHover(!!(t && t.closest && t.closest(INTERACTIVE)));
    };
    const leave = () => setVisible(false);
    const dn = () => setDown(true);
    const up = () => setDown(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    document.addEventListener("mouseleave", leave);
    window.addEventListener("mousedown", dn);
    window.addEventListener("mouseup", up);
    return () => {
      document.documentElement.classList.remove("cursor-custom");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.removeEventListener("mouseleave", leave);
      window.removeEventListener("mousedown", dn);
      window.removeEventListener("mouseup", up);
    };
  }, [x, y]);

  if (!enabled) return null;

  // Pas de wrapper : un conteneur fixe+z-index créerait un contexte d'empilement
  // qui ISOLERAIT le mix-blend-mode de la page. L'anneau et le point sont donc
  // posés directement (au contexte racine) pour se fondre avec le fond.
  return (
    <>
      <m.div
        className="cursor-ring"
        aria-hidden
        style={{ x: ringX, y: ringY }}
        animate={{ scale: hover ? 1.5 : down ? 0.85 : 1, opacity: visible ? 1 : 0 }}
        transition={{ scale: { type: "spring", stiffness: 320, damping: 30 }, opacity: { duration: 0.25 } }}
      />
      <m.div
        className="cursor-dot"
        aria-hidden
        style={{ x, y }}
        animate={{ scale: hover ? 0 : down ? 0.6 : 1, opacity: visible ? 1 : 0 }}
        transition={{ scale: { type: "spring", stiffness: 500, damping: 30 }, opacity: { duration: 0.25 } }}
      />
    </>
  );
}
