/* Publics visés — « Pour qui ? », page « Le projet ».

   Balisage repris de `app/[lang]/project/page.tsx` : une grille qui se remplit
   d'elle-même (`auto-fit`, 258 px minimum) plutôt qu'un nombre de colonnes figé,
   parce que le nombre de publics n'a pas de raison d'être un multiple de trois.

   Le trait d'accent au-dessus du nom tient lieu de puce : il marque l'entrée
   sans lui ajouter de titre de niveau, ces cartes n'étant pas des sous-parties
   de la page mais les éléments d'une même liste. */
import type { ImpactItemVue } from "@/lib/impact/query";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function BlocPersonas({ items }: { items: ImpactItemVue[] }) {
  return (
    <RevealGroup
      className="celled-flow celled-flow--top"
      style={{ gridTemplateColumns: "repeat(auto-fit,minmax(258px,1fr))" }}
      gap={0.045}
    >
      {items.map((item) => (
        <RevealItem
          key={item.id}
          className="cell"
          style={{ padding: "28px 26px", minHeight: 158, display: "flex", flexDirection: "column" }}
        >
          <div style={{ width: 30, height: 3, background: item.color ?? "var(--ac)", marginBottom: 20 }} />
          {item.titre && (
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>{item.titre}</div>
          )}
          {item.texte && (
            <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.55, color: "var(--c-70)" }}>
              {item.texte}
            </p>
          )}
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
