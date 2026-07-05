"use client";
/* Hook de préférence « réduire les animations », SSR-safe (null au serveur,
   réactif au client). Ré-export du hook de framer-motion pour centraliser. */
import { useReducedMotion } from "framer-motion";

export const usePrefersReducedMotion = useReducedMotion;
