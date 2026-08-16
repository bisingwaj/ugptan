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
  return (
    <RevealGroup
      className="celled-flow"
      style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}
      gap={0.045}
    >
      {items.map((item) => {
        const accent = item.color ?? "var(--ac)";
        return (
          <RevealItem
            key={item.id}
            className="cell"
            style={{
              padding: "28px clamp(22px,2.4vw,30px)",
              display: "flex",
              flexDirection: "column",
              ...(item.featured ? { boxShadow: `inset 0 3px 0 ${accent}` } : {}),
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
              style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--c-50)", marginBottom: 7 }}
            >
              {avantLabel}
            </div>
            <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.5, color: "var(--c-60)" }}>
              {item.texteSecondaire}
            </p>

            <div className="mono" style={{ fontSize: 13, color: accent, marginBottom: 7 }}>↓</div>
            <div
              className="mono"
              style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.09em", color: accent, marginBottom: 7 }}
            >
              {apresLabel}
            </div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, fontWeight: 500 }}>{item.texte}</p>

            {item.lienUrl && item.lienLabel && (
              <a
                href={lienPublic(item.lienUrl, lang)}
                className="mono"
                style={{ marginTop: 18, fontSize: 12, color: accent }}
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
