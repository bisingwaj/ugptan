/* Aperçu des indicateurs — page « Le projet ».

   Balisage repris de `app/[lang]/project/page.tsx` : la grille ODP en variante
   d'aperçu, sur fond sombre.

   L'en-tête vient de la section, les indicateurs du module « Le projet »
   (cf. lib/projet/query.ts) : les deux se règlent en console.

   L'aperçu s'arrête à la valeur et à son libellé, volontairement. Le point de
   départ, la part de femmes et les indicateurs intermédiaires sont l'apport
   propre de la page « Résultats », qui ne recevait jusqu'ici qu'un seul lien du
   site. */
import type { Lang } from "@/lib/pick";
import { GrilleODP } from "@/components/resultats/GrilleODP";

export function BlocIndicateurs({ lang }: { lang: Lang }) {
  return <GrilleODP lang={lang} variante="apercu" />;
}
