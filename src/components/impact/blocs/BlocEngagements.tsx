/* Cartes à filet coloré — « Des engagements vérifiables », page « L'UGPTN ».

   Balisage repris de `app/[lang]/ugptn/page.tsx` : quatre cellules, chacune
   surmontée d'un filet de trois pixels à sa couleur. Le titre y est un `h4` et
   non un `h3`, parce que ce bloc suit un sous-titre : la hiérarchie du document
   descend d'un cran quand la section en poursuit une autre. */
import type { ImpactItemVue } from "@/lib/impact/query";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function BlocEngagements({ items }: { items: ImpactItemVue[] }) {
  return (
    <RevealGroup className="grid-4" gap={0.045}>
      {items.map((item) => (
        <RevealItem
          key={item.id}
          className="cell"
          style={{
            padding: "26px 24px",
            borderTop: `3px solid ${item.color ?? "var(--ac)"}`,
            display: "flex",
            flexDirection: "column",
            minHeight: 150,
          }}
        >
          {item.titre && <h4 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{item.titre}</h4>}
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
