"use client";
/* Smooth scroll (Lenis), monté une seule fois (layout). Ne rend rien.
   - `lerp` (interpolation par frame) : suit la molette, glisse naturellement.
   - Désactivé si « réduire les animations » (scroll natif).
   - IMPORTANT : quand un overlay (.scrim : tiroir marchés, lightbox vidéo,
     modales) est ouvert, on ARRÊTE Lenis et on verrouille le fond → le contenu
     de l'overlay défile nativement (molette ET barre de défilement), et la page
     derrière ne bouge pas. Reprise automatique à la fermeture.
   - Changement de page : retour en haut (cf. plus bas).
   - Chargement : ce composant est monté en différé (cf. MotionProvider), et
     la bibliothèque Lenis elle-même n'est importée QUE si elle va servir
     (pointeur fin, animations non réduites). Un téléphone ne la télécharge
     jamais. */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { usePrefersReducedMotion } from "./useReducedMotion";

export function SmoothScroll() {
  const reduce = usePrefersReducedMotion();
  const pathname = usePathname();
  const premierRendu = useRef(true);
  const retourHistorique = useRef(false);

  // Précédent / suivant du navigateur : la position restaurée est respectée.
  useEffect(() => {
    const marquer = () => { retourHistorique.current = true; };
    window.addEventListener("popstate", marquer);
    return () => window.removeEventListener("popstate", marquer);
  }, []);

  /* Nouvelle page → en haut. Next ne remonte que jusqu'au segment qui change,
     et seulement s'il est hors du viewport ; entre deux pages sœurs (une
     province puis une autre, cliquée sur la carte), la page s'ouvrait donc
     au milieu. Lenis, qui tient sa propre position, pouvait en plus écraser
     le saut natif : on remonte par les deux voies, sans animation. Une
     ancre (#…) garde son saut. */
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    if (retourHistorique.current) {
      retourHistorique.current = false;
      return;
    }
    if (window.location.hash) return;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Préférence encore inconnue (hydratation) : on attend de la connaître,
    // plutôt que de monter Lenis pour le défaire au rendu suivant.
    if (reduce === null) return;
    // Pas de Lenis au tactile (pointeur grossier) : l'inertie native (iOS/Android)
    // est plus fluide et moins gourmande. Le verrou d'overlay (.scroll-locked)
    // prend le relais quand lenis est null.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let lenis: Lenis | null = null;
    let annule = false;
    let raf = 0;

    // Verrou de défilement tant qu'un overlay (.scrim) est présent dans le DOM.
    let locked = false;
    /* Verrou posé par la voie native (.scroll-locked) : il doit être levé par
       la même voie, même si Lenis est arrivé entre-temps (chargement différé). */
    let verrouNatif = false;
    let scrollY = 0;
    const sync = () => {
      const open = !!document.querySelector(".scrim");
      if (open === locked) return;
      locked = open;
      if (open) {
        if (lenis) {
          lenis.stop();
        } else {
          verrouNatif = true;
          scrollY = window.scrollY;
          document.documentElement.style.setProperty("--scroll-y", `${scrollY}px`);
          document.documentElement.classList.add("scroll-locked");
        }
      } else {
        if (verrouNatif) {
          verrouNatif = false;
          document.documentElement.classList.remove("scroll-locked");
          window.scrollTo(0, scrollY);
        }
        lenis?.start();
      }
    };
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { childList: true, subtree: true });
    sync();

    if (!reduce && !coarse) {
      void import("lenis").then(({ default: Lenis }) => {
        if (annule) return;
        const instance = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
        lenis = instance;
        // Exposé pour les ancres internes (cf. composantes/CompSubNav) : un saut
        // de hash natif se ferait écraser par la boucle Lenis — on passe par son
        // API. Tant qu'il est absent, les appelants retombent sur le natif.
        (window as Window & { __lenis?: unknown }).__lenis = instance;
        const loop = (time: number) => {
          instance.raf(time);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        // Overlay ouvert pendant le chargement : il garde son verrou natif, et
        // Lenis reste à l'arrêt jusqu'à sa fermeture (cf. `sync`).
        if (locked) instance.stop();
      });
    }

    return () => {
      annule = true;
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
      lenis?.destroy();
      delete (window as Window & { __lenis?: unknown }).__lenis;
      document.documentElement.classList.remove("scroll-locked");
    };
  }, [reduce]);

  return null;
}
