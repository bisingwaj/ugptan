/* Cartes numérotées — le mandat et la méthode de la page « L'UGPTN ».

   Un seul gabarit pour deux blocs, parce que le fond suffit à les distinguer :
   sur clair, le numéro s'écrit en grand dans l'accent (le mandat) ; sur sombre,
   il se pose dans une pastille pleine (la méthode). Les deux dessins sont repris
   au pixel de `app/[lang]/ugptn/page.tsx`, y compris l'écart de hauteur minimale
   et d'interlignage qui les séparait déjà.

   Le numéro affiché vient de la fiche quand il y est, sinon du rang de l'entrée :
   la méthode ne numérotait pas ses étapes à la main, elle les comptait. */
import type { ImpactItemVue } from "@/lib/impact/query";
import type { ImpactTheme } from "@/lib/impact/statut";
import { themeSombre } from "@/lib/impact/statut";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

const rang = (index: number): string => String(index + 1).padStart(2, "0");

export function BlocEtapes({ items, theme }: { items: ImpactItemVue[]; theme: ImpactTheme }) {
  const sombre = themeSombre(theme);

  return (
    <RevealGroup className={sombre ? "grid-5 celled--dark" : "grid-5"} gap={0.045}>
      {items.map((item, index) => (
        <RevealItem
          key={item.id}
          className="cell"
          style={{
            padding: "28px 22px",
            display: "flex",
            flexDirection: "column",
            minHeight: sombre ? 210 : 230,
          }}
        >
          {sombre ? (
            <div
              className="mono"
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: "#fff",
                background: item.color ?? "var(--ac)",
                width: 30,
                height: 30,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.valeur ?? rang(index)}
            </div>
          ) : (
            <div className="mono" style={{ fontWeight: 600, fontSize: 28, color: item.color ?? "var(--ac)" }}>
              {item.valeur ?? rang(index)}
            </div>
          )}

          {item.titre && (
            <h3
              style={{
                margin: "18px 0 0",
                fontSize: sombre ? 17 : 18,
                fontWeight: 600,
                lineHeight: sombre ? 1.28 : undefined,
                letterSpacing: sombre ? undefined : "-0.01em",
                color: sombre ? "#fff" : undefined,
              }}
            >
              {item.titre}
            </h3>
          )}
          {item.texte && (
            <p
              style={{
                margin: sombre ? "10px 0 0" : "12px 0 0",
                fontSize: 13.5,
                lineHeight: sombre ? 1.5 : 1.55,
                /* --c-40 et non --c-70 : sur fond noir, le gris foncé n'est pas lisible. */
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
