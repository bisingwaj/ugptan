/* ============================================================================
   Variants & easing partagés du système de motion (source unique de vérité).
   Intensité « sobre & institutionnel » : transform/opacity/clip-path
   uniquement (jamais de propriété de layout → pas de CLS).

   UNE grammaire pour tout le site, miroir des jetons CSS (tokens.css) :
   - courbe : EASE (= --ease) partout ;
   - durées : DUREE.rapide (= --dur-1) couleurs · DUREE.moyenne (= --dur-2)
     déplacements, menus · DUREE.apparition (= --dur-3) toute entrée à l'écran,
     quelle que soit la variante ;
   - délais : par pas de 0,1 s (DELAI.suite = ce qui suit un titre,
     DELAI.ensuite = le temps d'après, DELAI.fin = le dernier élément) ;
   - cascades : CASCADE.normale, CASCADE.dense pour les longues listes.
   ========================================================================== */
import type { Variants } from "framer-motion";

/** Easing du site : cubic-bezier(0.16, 1, 0.3, 1) — vif puis posé. */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DUREE = { rapide: 0.2, moyenne: 0.4, apparition: 0.7 } as const;
export const DELAI = { suite: 0.1, ensuite: 0.2, fin: 0.3 } as const;
export const CASCADE = { normale: 0.06, dense: 0.04 } as const;
/** Une apparition se déclenche quand l'élément a franchi 8 % du bas d'écran. */
export const MARGE_APPARITION = "0px 0px -8% 0px";

const entree = { duration: DUREE.apparition, ease: EASE };

/** Montée + fondu (défaut partout). Assez ample pour se voir au défilement,
 *  assez court pour ne jamais faire attendre. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: entree },
};

/** Fondu simple (cartes/visuels où la translation n'est pas souhaitée). */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: entree },
};

/** Léger zoom arrière + fondu : visuels, cartes, carte des provinces. */
export const zoom: Variants = {
  hidden: { opacity: 0, scale: 0.965 },
  show: { opacity: 1, scale: 1, transition: entree },
};

/** Rideau de gauche à droite : photos et bandeaux d'image. */
export const wipe: Variants = {
  hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
  show: { opacity: 1, clipPath: "inset(0 0% 0 0)", transition: entree },
};

/** Arrivée latérale : les deux colonnes d'un bloc texte / visuel se rejoignent. */
export const fromLeft: Variants = {
  hidden: { opacity: 0, x: -28 },
  show: { opacity: 1, x: 0, transition: entree },
};
export const fromRight: Variants = {
  hidden: { opacity: 0, x: 28 },
  show: { opacity: 1, x: 0, transition: entree },
};

/** Volet de texte (réservé aux gros titres de héros). */
export const mask: Variants = {
  hidden: { opacity: 0, y: 10, clipPath: "inset(0 0 100% 0)" },
  show: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", transition: entree },
};

/** Conteneur de stagger : orchestre l'apparition séquencée des enfants. */
export const stagger = (gap: number = CASCADE.normale, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren } },
});
