/* Grille de chiffres d'impact — le bloc « Impact humain » de l'accueil.

   Le balisage reproduit exactement celui qui vivait dans `app/[lang]/page.tsx` :
   `grid-4 celled--top`, filets d'un pixel dessinés par le fond noir de la
   grille, grand nombre en `stat__num`, unité en mono accentuée, phrase poussée
   en bas de cellule par `margin: auto 0 0`.

   Les filets sont tracés par les cellules (`--filet`, cf. « Celled grid »
   dans globals.css), plus par le fond du conteneur : le liseré de mise en
   avant reprend donc le filet dans sa liste d'ombres.

   ⚠️ RevealGroup REMPLACE l'élément grille et RevealItem la cellule : aucun
   conteneur intermédiaire, sinon le `gap:1px; background` qui dessine les
   filets saute (cf. components/motion/RevealGroup.tsx). */
import type { CSSProperties } from "react";
import type { ImpactItemVue } from "@/lib/impact/query";
import type { ImpactTheme } from "@/lib/impact/statut";
import { themeSombre } from "@/lib/impact/statut";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { ChiffreCle } from "@/components/impact/ChiffreCle";

export function BlocStats({
  items,
  approx,
  theme,
}: {
  items: ImpactItemVue[];
  /** Marque « ≈ » posée devant toute valeur prospective (cf. t.lbl.approx). */
  approx: string;
  theme: ImpactTheme;
}) {
  const sombre = themeSombre(theme);

  return (
    <RevealGroup
      className="grid-4 celled--top"
      gap={0.06}
      style={{ "--filet": "var(--c-black)" } as CSSProperties}
    >
      {items.map((item) => (
        <RevealItem
          key={item.id}
          className="cell"
          style={{
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            minHeight: 200,
            // Sur fond sombre, la cellule blanche du design system deviendrait
            // un pavé clair au milieu de la section : elle prend le noir, et le
            // texte s'inverse avec elle.
            ...(sombre ? { background: "var(--c-black)", color: "#fff" } : {}),
            // Mise en avant : un liseré d'accent au bord haut de la cellule,
            // sans changement de place dans la grille.
            ...(item.featured ? { boxShadow: `0 0 0 1px var(--filet), inset 0 3px 0 ${item.color ?? "var(--ac)"}` } : {}),
          }}
        >
          <div className="stat__num" style={{ fontSize: "clamp(34px,4.4vw,52px)" }}>
            <span className="stat__approx">{approx}</span>
            {/* Défile jusqu'à sa valeur quand elle se lit comme une quantité. */}
            <ChiffreCle texte={item.valeur} />
          </div>
          {item.surtitre && (
            <div
              className="mono"
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: item.color ?? (sombre ? "var(--ac-light)" : "var(--ac)"),
                marginTop: 10,
              }}
            >
              {item.surtitre}
            </div>
          )}
          {item.texte && (
            <p
              style={{
                margin: "auto 0 0",
                paddingTop: 20,
                fontSize: 14.5,
                lineHeight: 1.55,
                color: sombre ? "var(--c-40)" : "var(--c-70)",
              }}
            >
              {item.texte}
            </p>
          )}
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
