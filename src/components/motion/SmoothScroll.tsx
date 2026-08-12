"use client";
/* Smooth scroll (Lenis), monté une seule fois (layout). Ne rend rien.
   - `lerp` (interpolation par frame) : suit la molette, glisse naturellement.
   - Désactivé si « réduire les animations » (scroll natif).
   - IMPORTANT : quand un overlay (.scrim : tiroir marchés, lightbox vidéo,
     modales) est ouvert, on ARRÊTE Lenis et on verrouille le fond → le contenu
     de l'overlay défile nativement (molette ET barre de défilement), et la page
     derrière ne bouge pas. Reprise automatique à la fermeture. */
import { useEffect } from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "./useReducedMotion";

export function SmoothScroll() {
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    // Pas de Lenis au tactile (pointeur grossier) : l'inertie native (iOS/Android)
    // est plus fluide et moins gourmande. Le verrou d'overlay (.scroll-locked)
    // prend le relais quand lenis est null.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lenis = reduce || coarse ? null : new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });

    let raf = 0;
    if (lenis) {
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    // Verrou de défilement tant qu'un overlay (.scrim) est présent dans le DOM.
    let locked = false;
    let scrollY = 0;
    const sync = () => {
      const open = !!document.querySelector(".scrim");
      if (open === locked) return;
      locked = open;
      if (lenis) {
        if (open) lenis.stop();
        else lenis.start();
      } else {
        if (open) {
          scrollY = window.scrollY;
          document.documentElement.style.setProperty("--scroll-y", `${scrollY}px`);
          document.documentElement.classList.add("scroll-locked");
        } else {
          document.documentElement.classList.remove("scroll-locked");
          window.scrollTo(0, scrollY);
        }
      }
    };
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { childList: true, subtree: true });
    sync();

    return () => {
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
      lenis?.destroy();
      document.documentElement.classList.remove("scroll-locked");
    };
  }, [reduce]);

  return null;
}
