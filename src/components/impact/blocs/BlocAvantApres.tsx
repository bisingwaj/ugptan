/* Diptyques avant / après — le bloc « Ce que ça change » de la page Le projet.

   Balisage repris à l'identique de `app/[lang]/projet/page.tsx` : numéro en
   pastille noire, intitulé, puis les deux temps séparés par une flèche
   descendante — le constat en gris clair, la situation visée en corps plus
   appuyé. C'est cette différence de traitement qui fait lire le second comme la
   réponse au premier.

   Les intitulés « AVANT » et « APRÈS » viennent du dictionnaire du site et non
   du CMS : ce sont des repères de lecture du gabarit, pas du contenu. */
import type { Lang } from "@/lib/pick";
import type { ImpactItemVue } from "@/lib/impact/query";
import { lienPublic } from "@/lib/routes";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { grillePleine } from "@/lib/grille";
import { compTexteDe } from "@/lib/comp";

export function BlocAvantApres({
  items,
  lang,
  avantLabel,
  apresLabel,
}: {
  items: ImpactItemVue[];
  lang: Lang;
  avantLabel: string;
  apresLabel: string;
}) {
  // Colonnes ramenées à un diviseur du nombre d'éléments en pleine largeur
  // (cf. lib/grille.ts) : pas de rangée finale bancale.
  const pleine = grillePleine(items.length, 4, 2);
  return (
    <RevealGroup
      className={`celled-flow ${pleine.className ?? ""}`}
      style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", ...pleine.style }}
      gap={0.04}
    >
      {items.map((item) => {
        const accent = item.color ?? "var(--ac)";
        // Variante lisible de l'accent pour le texte (cf. lib/comp.ts).
        const texte = compTexteDe(accent);
        return (
          <RevealItem
            key={item.id}
            className="cell"
            style={{
              padding: "28px clamp(22px,2.4vw,30px)",
              display: "flex",
              flexDirection: "column",
              ...(item.featured ? { boxShadow: `0 0 0 1px var(--filet), inset 0 3px 0 ${accent}` } : {}),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              {item.valeur && (
                <span
                  className="mono"
                  style={{ fontWeight: 600, fontSize: 13, color: "#fff", background: "var(--c-black)", padding: "5px 9px" }}
                >
                  {item.valeur}
                </span>
              )}
              {item.titre && (
                <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>{item.titre}</span>
              )}
            </div>

            <div
              className="mono"
              style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--c-60)", marginBottom: 7 }}
            >
              {avantLabel}
            </div>
            <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.5, color: "var(--c-60)" }}>
              {item.texteSecondaire}
            </p>

            <div className="mono" style={{ fontSize: 13, color: texte, marginBottom: 7 }}>↓</div>
            <div
              className="mono"
              style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.09em", color: texte, marginBottom: 7 }}
            >
              {apresLabel}
            </div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, fontWeight: 500 }}>{item.texte}</p>

            {item.lienUrl && item.lienLabel && (
              <a
                href={lienPublic(item.lienUrl, lang)}
                className="mono"
                style={{ marginTop: 18, fontSize: 12, color: texte }}
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
