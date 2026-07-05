"use client";
/* Charge le sous-ensemble de fonctionnalités de framer-motion (domAnimation :
   animations + variants + gestes, SANS la projection de layout lourde) et force
   l'usage du composant léger `m` via `strict`. Monté une seule fois (layout).
   N.B. : envelopper des enfants serveur ici ne les rend PAS clients (RSC). */
import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
