import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { odp, intermediaires } from "@/content/data";
import { dialogues } from "@/content/carbon";
import { Kicker } from "@/components/ui/Kicker";
import { Counter } from "@/components/ui/Counter";
import { Histoires } from "@/components/home/Histoires";
import { ProjVideos } from "@/components/resultats/ProjVideos";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  return { title: dict(asLang(params.lang)).nav.resultats };
}

export default function ResultatsPage({ params }: { params: { lang: string } }) {
  const lang = asLang(params.lang);
  const t = dict(lang);
  const r = t.resultats;

  return (
    <div>
      <section className="page-hero">
        <div className="section__inner">
          <div className="page-hero__crumb">UGPTN / {t.sec.resultats}</div>
          <h1>{r.heroTitle}</h1>
          <p className="page-hero__lead">{r.heroLead}</p>
        </div>
      </section>

      {/* ODP */}
      <section className="section section--dark">
        <div className="section__inner">
          <Kicker light>{r.odpLabel}</Kicker>
          <div className="grid-4 celled--dark" style={{ marginTop: 14 }}>
            {odp.map((o) => (
              <div key={o.code} className="cell" style={{ display: "flex", flexDirection: "column", minHeight: 236 }}>
                <div className="mono" style={{ fontSize: 12, color: "var(--ac-light)" }}>{o.code}</div>
                <div style={{ marginTop: "auto" }}><div className="mono" style={{ fontWeight: 600, fontSize: "clamp(34px,4.4vw,56px)", lineHeight: 1, letterSpacing: "-0.03em" }}><Counter to={o.value} dur={1700} /><span style={{ fontSize: 16, color: "var(--c-40)", marginLeft: 7 }}>{o.unit}</span></div></div>
                <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.45, color: "var(--c-20)" }}>{pick(o.label, lang)}</div>
                <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--c-50)", border: "1px solid var(--c-80)", padding: "3px 7px" }}>{t.lbl.baseline}: {o.baseline}</span>
                  {o.femmes && <span className="mono" style={{ fontSize: 10.5, color: "var(--ac-light)", border: "1px solid var(--acd)", padding: "3px 7px" }}>{o.femmes}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intermédiaires */}
      <section className="section">
        <div className="section__inner">
          <Kicker>{r.interLabel}</Kicker>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)", marginTop: 16 }}>
            {intermediaires.map((x, i) => (
              <div key={i} className="cell" style={{ padding: "22px" }}><div className="mono" style={{ fontWeight: 600, fontSize: 24 }}>{x.value}<span style={{ fontSize: 13, color: "var(--ac)", marginLeft: 4 }}>{x.unit}</span></div><div style={{ fontSize: 12.5, color: "var(--c-70)", marginTop: 8, lineHeight: 1.45 }}>{pick(x.text, lang)}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* Le projet en vidéos */}
      <section className="section section--dark">
        <div className="section__inner">
          <Kicker light>{r.projVideosLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 14px" }}>{r.projVideosTitle}</h2>
          <p style={{ margin: "0 0 44px", fontSize: 16, lineHeight: 1.6, color: "var(--c-40)", maxWidth: 700 }}>{r.projVideosLead}</p>
          <ProjVideos lang={lang} />
        </div>
      </section>

      {/* Dialogues sectoriels */}
      <section className="section">
        <div className="section__inner">
          <Kicker>{r.dialoguesLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 14px" }}>{r.dialoguesTitle}</h2>
          <p style={{ margin: "0 0 42px", fontSize: 16, lineHeight: 1.6, color: "var(--c-70)", maxWidth: 700 }}>{r.dialoguesLead}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(282px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-black)", borderTopWidth: 2 }}>
            {dialogues.map((d, i) => (
              <div key={i} className="cell" style={{ padding: "26px 24px", borderTop: `3px solid ${d.color}`, display: "flex", flexDirection: "column", minHeight: 172 }}>
                <div className="mono" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: d.color }}>{pick(d.secteur, lang)}</div>
                <h3 style={{ margin: "14px 0 0", fontSize: 16.5, fontWeight: 600, lineHeight: 1.32 }}>{pick(d.titre, lang)}</h3>
                <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "var(--c-70)", flex: 1 }}>{pick(d.desc, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Histoires */}
      <section className="section section--grey">
        <div className="section__inner">
          <div style={{ maxWidth: 680, marginBottom: 44 }}>
            <Kicker>{t.home.storiesLabel}</Kicker>
            <h2 className="h2--sm" style={{ marginBottom: 14 }}>{t.home.storiesTitle}</h2>
            <p className="lead" style={{ margin: 0 }}>{t.home.storiesLead}</p>
          </div>
          <Histoires lang={lang} />
        </div>
      </section>
    </div>
  );
}
