/* Glossaire replié — les sigles de la page « L'UGPTN ».

   Balisage repris de `app/[lang]/ugptn/page.tsx` : un `<details>` natif, donc
   un composant serveur qui fonctionne sans JavaScript.

   L'en-tête est dessiné ICI et non par le rendu commun : le titre de la section
   est le `<summary>` sur lequel on clique, et le chapô ne se lit qu'une fois le
   bloc ouvert. Les poser au-dessus les rendrait visibles en permanence et
   viderait le dépliant de sa raison d'être.

   Le glossaire occupait autrefois une section entière pour dix définitions
   d'une ligne. Il se déplie à la suite des questions, où on le cherche. */
import type { ImpactItemVue } from "@/lib/impact/query";

export function BlocGlossaire({
  titre,
  lead,
  items,
}: {
  titre: string | null;
  lead: string | null;
  items: ImpactItemVue[];
}) {
  if (!titre) return null;

  return (
    <details className="glossaire">
      <summary className="glossaire__sum">{titre}</summary>
      {lead && <p className="glossaire__lead">{lead}</p>}
      <div className="glossaire__grille">
        {items.map((item) => (
          <div key={item.id} className="glossaire__item">
            <span className="mono glossaire__s">{item.valeur}</span>
            <span className="glossaire__d">{item.texte}</span>
          </div>
        ))}
      </div>
    </details>
  );
}
