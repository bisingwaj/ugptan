import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { videoSlots, statusLabel, statusColor, type Ratio } from "@/content/videos";
import { Kicker } from "@/components/ui/Kicker";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const en = asLang(params.lang) === "en";
  return { title: en ? "Media plan" : "Plan médias", robots: { index: false, follow: false } };
}

const ratioBox: Record<Ratio, { w: number; h: number }> = {
  "16:9": { w: 16, h: 9 }, "9:16": { w: 9, h: 16 }, "1:1": { w: 1, h: 1 },
};

export default function MediasPage({ params }: { params: { lang: string } }) {
  const lang = asLang(params.lang);
  const en = lang === "en";

  return (
    <div>
      <section className="page-hero">
        <div className="section__inner">
          <div className="page-hero__crumb">UGPTN / {en ? "Media plan" : "Plan médias"}</div>
          <h1>{en ? "Where videos go on the site." : "Où les vidéos prennent place sur le site."}</h1>
          <p className="page-hero__lead">
            {en
              ? "Every video slot planned across the site — heroes included. Use it to plan shoots and productions. Tip: add ?slots=1 to any page URL to highlight these slots in context."
              : "Tous les emplacements vidéo prévus sur le site — héros compris. À utiliser pour planifier les tournages et productions. Astuce : ajoutez ?slots=1 à l'URL de n'importe quelle page pour repérer ces emplacements en contexte."}
          </p>
        </div>
      </section>

      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          <Kicker>{en ? "Video slots" : "Emplacements vidéo"}</Kicker>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)", marginTop: 16 }}>
            {videoSlots.map((s) => {
              const sc = statusColor(s.status);
              const rb = ratioBox[s.ratio];
              return (
                <div key={s.key} className="cell" style={{ padding: "24px clamp(20px,2.4vw,28px)", display: "flex", flexDirection: "column" }}>
                  {/* Cadre proportionnel à l'aspect */}
                  <div className="duo" style={{ aspectRatio: `${rb.w} / ${rb.h}`, maxHeight: 200, alignSelf: "center", width: s.ratio === "9:16" ? "auto" : "100%", border: `2px dashed ${sc}`, background: "var(--c-10)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <span style={{ width: 48, height: 48, borderRadius: "50%", background: sc, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16, paddingLeft: 3 }}>▶</span>
                    <span className="mono" style={{ position: "absolute", top: 8, left: 8, fontSize: 10.5, color: sc, background: "#fff", padding: "2px 6px", border: `1px solid ${sc}` }}>{s.ratio}</span>
                  </div>
                  <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--c-50)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{pick(s.page, lang)}</span>
                    <span className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: "#fff", background: sc, padding: "3px 9px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{pick(statusLabel(s.status), lang)}</span>
                  </div>
                  <h3 style={{ margin: "10px 0 0", fontSize: 16, fontWeight: 600, lineHeight: 1.35 }}>{pick(s.zone, lang)}</h3>
                  <div className="mono" style={{ fontSize: 11.5, color: "var(--c-60)", marginTop: 10, display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
                    <span>⏱ {s.duree}</span>
                    {s.count ? <span>×{s.count}</span> : null}
                  </div>
                  <p style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.55, color: "var(--c-70)", flex: 1 }}>{pick(s.note, lang)}</p>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 22, display: "flex", gap: 12, padding: "18px 22px", background: "var(--c-10)", borderLeft: "3px solid var(--ac)" }}>
            <span style={{ fontSize: 15 }}>ℹ</span>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--c-70)" }}>
              {en
                ? "Source of truth: src/content/videos.ts. Playback ids live in src/content/media.ts (default film) and src/content/actualites.ts (per-article). Animations can be produced with Remotion (npm run remotion:studio) and exported into these slots."
                : "Source de vérité : src/content/videos.ts. Les identifiants de lecture vivent dans src/content/media.ts (film par défaut) et src/content/actualites.ts (par article). Les animations se produisent avec Remotion (npm run remotion:studio) et s'exportent dans ces emplacements."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
