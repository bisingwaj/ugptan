"use client";
/* Préférence « réduire les animations », SANS écart d'hydratation.

   ⚠️ Pourquoi pas le `useReducedMotion` de framer-motion : il lit
   `matchMedia` dès le premier rendu client. Le serveur, lui, ne sait rien :
   il rend l'état animé (Reveal en `opacity: 0`, en attente d'apparition).
   Pour un visiteur en « réduire les animations », le premier rendu client
   différait donc du HTML reçu (Reveal rendait sa version statique), React
   n'en corrigeait pas les attributs, et l'`opacity: 0` du serveur restait en
   place : texte invisible sur la quasi-totalité du site.

   `useSyncExternalStore` règle ce point : pendant l'hydratation, React prend
   la valeur serveur (`null`, préférence inconnue) — même arbre que le HTML —,
   puis re-rend aussitôt avec la vraie préférence. Ce second rendu est une mise
   à jour ordinaire : Reveal y remplace proprement l'élément animé par sa
   version statique, visible.

   Valeurs : `null` tant que la préférence n'est pas connue (serveur,
   hydratation), puis `true` / `false`, réactif à un changement de réglage. */
import { useSyncExternalStore } from "react";

const REQUETE = "(prefers-reduced-motion: reduce)";

function abonner(rappel: () => void) {
  const mq = window.matchMedia(REQUETE);
  mq.addEventListener("change", rappel);
  return () => mq.removeEventListener("change", rappel);
}

const lireClient = () => window.matchMedia(REQUETE).matches;
const lireServeur = () => null;

export function usePrefersReducedMotion(): boolean | null {
  return useSyncExternalStore<boolean | null>(abonner, lireClient, lireServeur);
}
