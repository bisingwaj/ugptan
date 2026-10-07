/* Fonctionnalités de framer-motion chargées EN DIFFÉRÉ par MotionProvider.

   Module à part, importé seulement par `import()` : c'est ce qui permet au
   bundler d'en faire un fragment séparé, téléchargé après l'hydratation au
   lieu d'alourdir le JavaScript commun de chaque page. `domAnimation` =
   animations, variants, gestes et apparition au défilement, SANS la
   projection de layout (domMax), dont le site n'a pas l'usage. */
import { domAnimation } from "framer-motion";

export default domAnimation;
