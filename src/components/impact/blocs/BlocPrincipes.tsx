/* Règles numérotées — « Ce qui borne ses décisions », page « L'UGPTN ».

   Balisage repris de `app/[lang]/ugptn/page.tsx` : trois cellules larges, le
   numéro d'ordre en petit mono accentué, un titre qui porte la règle et un
   paragraphe qui dit ce qu'elle engage.

   Le numéro est CALCULÉ, jamais saisi : il dit le rang de la règle dans la
   liste. Le laisser écrire permettrait d'afficher « 03 » en deuxième position,
   et rien dans la page ne signalerait l'erreur. */
import type { ImpactItemVue } from "@/lib/impact/query";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function BlocPrincipes({ items }: { items: ImpactItemVue[] }) {
  return (
    <RevealGroup className="grid-3" gap={0.05}>
      {items.map((item, index) => (
        <RevealItem key={item.id} className="cell" style={{ padding: "30px 28px" }}>
          <div className="mono" style={{ fontSize: 13, color: item.color ?? "var(--ac)" }}>
            {String(index + 1).padStart(2, "0")}
          </div>
          {item.titre && (
            <h3
              style={{
                margin: "16px 0 0",
                fontSize: 20,
                fontWeight: 600,
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
              }}
            >
              {item.titre}
            </h3>
          )}
          {item.texte && (
            <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--c-70)" }}>
              {item.texte}
            </p>
          )}
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
