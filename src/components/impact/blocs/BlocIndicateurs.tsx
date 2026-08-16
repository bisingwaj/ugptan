/* Aperçu des indicateurs — page « Le projet ».

   Balisage repris de `app/[lang]/project/page.tsx` : la grille ODP en variante
   d'aperçu, sur fond sombre.

   Ce que la console tient ici est l'EN-TÊTE. Les quatre indicateurs de l'objectif
   de développement du projet relèvent du cadre de résultats et de la conformité
   au manuel d'exécution : ils ne se rédigent pas.

   L'aperçu s'arrête là volontairement. Le point de départ, la part de femmes et
   les sept indicateurs intermédiaires sont l'apport propre de la page
   « Résultats », qui ne recevait jusqu'ici qu'un seul lien du site. */
import type { Lang } from "@/lib/pick";
import { GrilleODP } from "@/components/resultats/GrilleODP";

export function BlocIndicateurs({ lang }: { lang: Lang }) {
  return <GrilleODP lang={lang} variante="apercu" />;
}
