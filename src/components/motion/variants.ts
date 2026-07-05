/* ============================================================================
   Variants & easing partagés du système de motion (source unique de vérité).
   Intensité « sobre & institutionnel » : courtes, discrètes, transform/opacity
   uniquement (jamais de propriété de layout → pas de CLS).
   ========================================================================== */
import type { Variants } from "framer-motion";

/** Easing identique à l'existant du site : cubic-bezier(0.16, 1, 0.3, 1). */
export const EASE = [0.16, 1, 0.3, 1] as const;

/** Montée + fondu (défaut partout). Amplitude discrète, durée unifiée. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/** Fondu simple (cartes/visuels où la translation n'est pas souhaitée). */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.55, ease: EASE } },
};

/** Volet de texte (réservé aux gros titres de héros). */
export const mask: Variants = {
  hidden: { opacity: 0, y: 10, clipPath: "inset(0 0 100% 0)" },
  show: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", transition: { duration: 0.6, ease: EASE } },
};

/** Conteneur de stagger : orchestre l'apparition séquencée des enfants.
 *  Écart serré par défaut pour une cascade fluide qui ne traîne pas. */
export const stagger = (gap = 0.05, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren } },
});
