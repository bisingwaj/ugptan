/* Aperçu des composantes — page « Le projet ».

   Balisage repris de `app/[lang]/project/page.tsx` : les cinq lignes de
   `CompRow`, sous un filet de deux pixels.

   Ce que la console tient ici est l'EN-TÊTE : le kicker, le titre, le chapô et
   le libellé du bouton. Les cinq composantes, elles, sont une donnée de
   structure du Projet, fixée par le manuel d'exécution ; les rendre éditables
   laisserait croire qu'on peut en ajouter une depuis un formulaire.

   Le détail des sous-composantes vit sur l'index et sur chaque page dédiée :
   le recopier ici retirerait toute raison de cliquer. */
import type { Lang } from "@/lib/pick";
import { composantes } from "@/content/data";
import { CompRow } from "@/components/composantes/CompRow";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function BlocComposantes({ lang }: { lang: Lang }) {
  return (
    <RevealGroup style={{ borderTop: "2px solid var(--c-black)" }} gap={0.045}>
      {composantes.map((comp) => (
        <RevealItem key={comp.code}>
          <CompRow comp={comp} lang={lang} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
