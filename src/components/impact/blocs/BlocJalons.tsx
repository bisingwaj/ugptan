/* Frise verticale — le bloc « Calendrier & jalons » de la page Le projet.

   Balisage repris à l'identique de `app/[lang]/projet/page.tsx` : un filet
   vertical de 2 px porté par la liste, un carré d'accent posé à cheval sur ce
   filet pour chaque jalon, la date en mono accentuée puis le fait marquant.

   Le carré est bordé de blanc pour se détacher du filet ; sur fond gris ou
   sombre, il prend la couleur du fond de section, sans quoi un liseré blanc
   apparaîtrait au milieu de la frise. */
import type { Lang } from "@/lib/pick";
import type { ImpactItemVue } from "@/lib/impact/query";
import { lienPublic } from "@/lib/routes";
import { themeSombre, type ImpactTheme } from "@/lib/impact/statut";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

/** Fond réel de la section, pour la bordure du carré de la frise. */
const FOND: Record<ImpactTheme, string> = {
  CLAIR: "#fff",
  GRIS: "var(--c-10)",
  PALE: "var(--ac-pale)",
  SOMBRE: "var(--c-black)",
};

export function BlocJalons({
  items,
  lang,
  theme,
}: {
  items: ImpactItemVue[];
  lang: Lang;
  theme: ImpactTheme;
}) {
  const sombre = themeSombre(theme);

  return (
    <RevealGroup
      style={{
        borderLeft: `2px solid ${sombre ? "var(--c-80)" : "var(--c-20)"}`,
        marginLeft: 8,
        marginTop: 20,
      }}
      gap={0.045}
    >
      {items.map((item) => {
        const accent = item.color ?? "var(--ac)";
        return (
          <RevealItem key={item.id} style={{ position: "relative", padding: "0 0 30px 36px" }}>
            <span
              style={{
                position: "absolute",
                left: -7,
                top: 3,
                width: 12,
                height: 12,
                background: accent,
                border: `2px solid ${FOND[theme]}`,
                // Mise en avant : un halo de la couleur du jalon, qui l'épaissit
                // sans le déplacer ni décaler le filet.
                ...(item.featured ? { boxShadow: `0 0 0 2px ${accent}` } : {}),
              }}
            />
            {item.dateLabel && (
              <div className="mono" style={{ fontSize: 13, color: accent, fontWeight: 500 }}>{item.dateLabel}</div>
            )}
            {item.titre && (
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 5, maxWidth: 560, lineHeight: 1.35 }}>
                {item.titre}
              </div>
            )}
            {item.texte && (
              <div
                style={{
                  fontSize: 16,
                  marginTop: 5,
                  maxWidth: 560,
                  lineHeight: 1.4,
                  ...(sombre ? { color: "var(--c-20)" } : {}),
                }}
              >
                {item.texte}
              </div>
            )}
            {item.lienUrl && item.lienLabel && (
              <a
                href={lienPublic(item.lienUrl, lang)}
                className="mono"
                style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: accent }}
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
