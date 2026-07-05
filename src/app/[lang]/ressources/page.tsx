import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { ressources } from "@/content/carbon";
import { PageHero } from "@/components/ui/PageHero";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  return { title: dict(asLang(params.lang)).ressources.titre };
}

export default function RessourcesPage({ params }: { params: { lang: string } }) {
  const lang = asLang(params.lang);
  const t = dict(lang);
  const r = t.ressources;
  return (
    <div>
      <PageHero crumb={`UGPTAN / ${r.titre}`} title={r.hero} lead={r.lead} />
      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          <RevealGroup gap={0.045} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(348px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
            {ressources.map((res, i) => (
              <RevealItem as="a" key={i} style={{ display: "flex", flexDirection: "column", background: "#fff", padding: "26px clamp(20px,2.4vw,28px)", borderTop: `3px solid ${res.color}`, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: res.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>{pick(res.k, lang)}</span>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--c-50)" }}>{pick(res.date, lang)}</span>
                </div>
                <h3 style={{ margin: "16px 0 0", fontSize: 17, fontWeight: 600, lineHeight: 1.35, flex: 1 }}>{pick(res.titre, lang)}</h3>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--c-70)", marginTop: 14 }}>{pick(res.pole, lang)}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--c-20)" }}>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--c-50)" }}>{res.meta}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: res.color }}>{r.download} <span style={{ width: 28, height: 28, background: res.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>↓</span></span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </div>
  );
}
