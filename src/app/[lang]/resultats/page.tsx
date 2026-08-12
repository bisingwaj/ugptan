import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { odp, intermediaires } from "@/content/data";
import { dialogues } from "@/content/carbon";
import { Kicker } from "@/components/ui/Kicker";
import { Counter } from "@/components/ui/Counter";
import { FlowLines, FlowLinesDefs } from "@/components/ui/FlowLines";
import { CellBloom } from "@/components/ui/CellBloom";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { Histoires } from "@/components/home/Histoires";
import { ProjVideos } from "@/components/resultats/ProjVideos";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return { title: dict(asLang(params.lang)).nav.resultats };
}

export default async function ResultatsPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const r = t.resultats;

  return (
    <div>
      <FlowLinesDefs />
      <PageHero crumb={`UGPTN / ${t.sec.resultats}`} title={r.heroTitle} lead={r.heroLead} />

      {/* ODP */}
      <section className="section section--dark">
        <div className="section__inner">
          <Reveal><Kicker light>{r.odpLabel}</Kicker></Reveal>
          <RevealGroup className="grid-4 celled--dark" gap={0.05} style={{ marginTop: 14 }}>
            {odp.map((o, i) => (
              <RevealItem fade key={o.code} className="cell cell--fx" style={{ display: "flex", flexDirection: "column", minHeight: 236 }}>
                <FlowLines variant={i} />
                <div className="mono" style={{ fontSize: 12, color: "var(--ac-light)" }}>{o.code}</div>
                <div style={{ marginTop: "auto" }}><div className="mono" style={{ fontWeight: 600, fontSize: "clamp(34px,4.4vw,56px)", lineHeight: 1, letterSpacing: "-0.03em" }}><span className="stat__approx">{t.lbl.approx}</span><Counter to={o.value} dur={1300} /><span style={{ fontSize: 16, color: "var(--c-40)", marginLeft: 7 }}>{o.unit}</span></div></div>
                <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.45, color: "var(--c-20)" }}>{pick(o.label, lang)}</div>
                <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--c-50)", border: "1px solid var(--c-80)", padding: "3px 7px" }}>{t.lbl.baseline}: {o.baseline}</span>
                  {o.femmes && <span className="mono" style={{ fontSize: 10.5, color: "var(--ac-light)", border: "1px solid var(--acd)", padding: "3px 7px" }}>{o.femmes}</span>}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <p className="stat__note stat__note--dark">{t.lbl.indicatif}</p>
        </div>
      </section>

      {/* Intermédiaires */}
      <section className="section">
        <div className="section__inner">
          <Reveal><Kicker>{r.interLabel}</Kicker></Reveal>
          <RevealGroup gap={0.05} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)", marginTop: 16 }}>
            {intermediaires.map((x, i) => (
              <RevealItem fade key={i} className="cell cell--fx cell--light" style={{ padding: "22px" }}><FlowLines variant={i} /><div className="mono" style={{ fontWeight: 600, fontSize: 24, color: "var(--cell-fg)" }}><span className="stat__approx">{t.lbl.approx}</span>{x.value}<span style={{ fontSize: 13, color: "var(--cell-acc)", marginLeft: 4 }}>{x.unit}</span></div><div style={{ fontSize: 12.5, color: "var(--cell-mut)", marginTop: 8, lineHeight: 1.45 }}>{pick(x.text, lang)}</div></RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Le projet en vidéos */}
      <section className="section section--dark">
        <div className="section__inner">
          <Reveal>
            <Kicker light>{r.projVideosLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 14px" }}>{r.projVideosTitle}</h2>
            <p style={{ margin: "0 0 44px", fontSize: 16, lineHeight: 1.6, color: "var(--c-40)", maxWidth: 700 }}>{r.projVideosLead}</p>
          </Reveal>
          <ProjVideos lang={lang} />
        </div>
      </section>

      {/* Dialogues sectoriels */}
      <section className="section">
        <div className="section__inner">
          <Reveal>
            <Kicker>{r.dialoguesLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 14px" }}>{r.dialoguesTitle}</h2>
            <p style={{ margin: "0 0 42px", fontSize: 16, lineHeight: 1.6, color: "var(--c-70)", maxWidth: 700 }}>{r.dialoguesLead}</p>
          </Reveal>
          <RevealGroup gap={0.045} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(282px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-black)", borderTopWidth: 2 }}>
            {dialogues.map((d, i) => (
              <RevealItem fade key={i} className="cell cell--bloom" style={{ padding: "26px 24px", borderTop: `3px solid ${d.color}`, display: "flex", flexDirection: "column", minHeight: 172 }}>
                <CellBloom color={d.color} />
                <div className="mono" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: d.color }}>{pick(d.secteur, lang)}</div>
                <h3 style={{ margin: "14px 0 0", fontSize: 16.5, fontWeight: 600, lineHeight: 1.32, color: "var(--cell-fg)" }}>{pick(d.titre, lang)}</h3>
                <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "var(--cell-mut)", flex: 1 }}>{pick(d.desc, lang)}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Histoires */}
      <section className="section section--grey">
        <div className="section__inner">
          <Reveal style={{ maxWidth: 680, marginBottom: 44 }}>
            <Kicker>{t.home.storiesLabel}</Kicker>
            <h2 className="h2--sm" style={{ marginBottom: 14 }}>{t.home.storiesTitle}</h2>
            <p className="lead" style={{ margin: 0 }}>{t.home.storiesLead}</p>
          </Reveal>
          <Histoires lang={lang} />
        </div>
      </section>
    </div>
  );
}
