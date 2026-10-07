"use client";
/* Socle du système de motion, monté une seule fois (layout).

   1. Fonctionnalités framer-motion EN DIFFÉRÉ. `LazyMotion` reçoit une
      fonction d'import plutôt que `domAnimation` lui-même : le moteur
      d'animation (≈ 15 Ko compressés) quitte le JavaScript commun et se charge
      juste après l'hydratation. `strict` impose toujours le composant léger
      `m`. Pendant les quelques centaines de millisecondes d'attente, rien ne
      se perd : les éléments gardent l'état rendu par le serveur, et
      framer-motion joue l'entrée dès que les fonctionnalités arrivent. Ce qui
      est au-dessus de la ligne de flottaison (héros, `Reveal eager`) est
      visible dès le HTML et ne dépend pas de ce chargement ; en « réduire les
      animations », Reveal rend une version statique, visible sans moteur.

   2. Défilement doux (Lenis) et curseur personnalisé, montés côté client
      seulement (`ssr: false`) et chargés à part. Ni l'un ni l'autre ne rend
      quoi que ce soit au serveur ; les garder dans le bundle commun faisait
      payer leur code à chaque visiteur, y compris sur téléphone, où ni Lenis
      ni le curseur ne s'activent.

   N.B. : envelopper des enfants serveur ici ne les rend PAS clients (RSC). */
import { LazyMotion } from "framer-motion";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const chargerFonctionnalites = () => import("./fonctionnalites").then((mod) => mod.default);

const SmoothScroll = dynamic(() => import("./SmoothScroll").then((mod) => mod.SmoothScroll), { ssr: false });
const Cursor = dynamic(() => import("./Cursor").then((mod) => mod.Cursor), { ssr: false });

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={chargerFonctionnalites} strict>
      <SmoothScroll />
      <Cursor />
      {children}
    </LazyMotion>
  );
}
