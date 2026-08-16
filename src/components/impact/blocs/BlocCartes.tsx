/* Cartes thématiques — le bloc « Dialogues sectoriels » de la page Résultats.

   Balisage repris à l'identique de `app/[lang]/resultats/page.tsx` : grille à
   filets d'un pixel, liseré de 3 px de la couleur du thème en haut de chaque
   carte, `cell--bloom` pour la floraison de couleur au survol, thème en mono
   capitales, titre puis description qui pousse la carte à hauteur égale.

   ⚠️ `RevealItem fade` et non l'apparition par translation : les cellules à
   effet de survol translatent déjà, et framer laisserait sinon un `transform`
   en ligne qui bloque le `:hover` (cf. le commentaire de RevealItem). */
import type { Lang } from "@/lib/pick";
import type { ImpactItemVue } from "@/lib/impact/query";
import { lienPublic } from "@/lib/routes";
import { CellBloom } from "@/components/ui/CellBloom";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function BlocCartes({ items, lang }: { items: ImpactItemVue[]; lang: Lang }) {
  return (
    <RevealGroup
      gap={0.045}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(282px,1fr))",
        gap: 1,
        background: "var(--c-20)",
        border: "1px solid var(--c-black)",
        borderTopWidth: 2,
      }}
    >
      {items.map((item) => {
        const accent = item.color ?? "var(--ac)";
        return (
          <RevealItem
            fade
            key={item.id}
            className="cell cell--bloom"
            style={{
              padding: "26px 24px",
              borderTop: `3px solid ${accent}`,
              display: "flex",
              flexDirection: "column",
              minHeight: 172,
            }}
          >
            <CellBloom color={accent} />
            {item.surtitre && (
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: accent,
                }}
              >
                {item.surtitre}
              </div>
            )}
            {item.titre && (
              <h3 style={{ margin: "14px 0 0", fontSize: 16.5, fontWeight: 600, lineHeight: 1.32, color: "var(--cell-fg)" }}>
                {item.titre}
              </h3>
            )}
            {item.texte && (
              <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "var(--cell-mut)", flex: 1 }}>
                {item.texte}
              </p>
            )}
            {item.lienUrl && item.lienLabel && (
              <a
                href={lienPublic(item.lienUrl, lang)}
                className="mono"
                style={{ marginTop: 14, fontSize: 12, color: accent }}
              >
                {item.lienLabel} →
              </a>
            )}
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
