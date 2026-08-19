/* Aperçu des composantes — page « Le projet ».

   Balisage repris de `app/[lang]/project/page.tsx` : les lignes de `CompRow`,
   sous un filet de deux pixels.

   La console tient désormais les DEUX moitiés : l'en-tête est celui de la
   section (kicker, titre, chapô, bouton) et les composantes viennent du module
   « Le projet » (cf. lib/projet/query.ts). Il n'y a donc plus de bloc « en
   partie administrable » sur cette page.

   Le détail des sous-composantes reste sur l'index et sur chaque page dédiée :
   le recopier ici retirerait toute raison de cliquer. */
import type { Lang } from "@/lib/pick";
import { composantesPubliques } from "@/lib/projet/query";
import { CompRow } from "@/components/composantes/CompRow";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export async function BlocComposantes({ lang }: { lang: Lang }) {
  const composantes = await composantesPubliques(lang);
  if (composantes.length === 0) return null;

  return (
    <RevealGroup style={{ borderTop: "2px solid var(--c-black)" }} gap={0.045}>
      {composantes.map((comp) => (
        <RevealItem key={comp.id}>
          <CompRow comp={comp} lang={lang} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
