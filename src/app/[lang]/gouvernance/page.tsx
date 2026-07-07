import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { gouvernance } from "@/content/data";
import { gouvActivites, gouvLeads } from "@/content/carbon";
import { initials } from "@/lib/format";
import { Kicker } from "@/components/ui/Kicker";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  return { title: dict(asLang(params.lang)).gouv.titre };
}

export default function GouvernancePage({ params }: { params: { lang: string } }) {
  const lang = asLang(params.lang);
  const t = dict(lang);
  const g = t.gouv;

  return (
    <div>
      <PageHero crumb={`UGPTN / ${g.titre}`} title={g.titre} lead={g.lead} />

      {/* Bodies */}
      <section className="section">
        <div className="section__inner">
          <RevealGroup className="grid-3 celled--top" gap={0.05}>
            {gouvernance.map((b) => (
              <RevealItem key={b.sigle} className="cell" style={{ padding: "32px 30px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: 30 }}>{b.sigle}</span>
                  <span className="mono" style={{ fontSize: 11, color: "#fff", background: "var(--ac)", padding: "4px 10px" }}>{b.effectif}</span>
                </div>
                <div style={{ fontSize: 15, color: "var(--c-70)", marginTop: 10, lineHeight: 1.4 }}>{pick(b.nom, lang)}</div>
                <div style={{ marginTop: 26, borderTop: "1px solid var(--c-20)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                  {[[g.bodyLabels.nature, pick(b.nature, lang)], [g.bodyLabels.presidence, pick(b.presidence, lang)], [g.bodyLabels.decision, pick(b.decision, lang)], [g.bodyLabels.frequence, pick(b.frequence, lang)]].map(([k, v], i) => (
                    <div key={i}><div className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--c-50)" }}>{k}</div><div style={{ fontSize: 14.5, marginTop: 4 }}>{v}</div></div>
                  ))}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Composition COPIL / CTP */}
      <section className="section section--grey">
        <div className="section__inner cols2" style={{ gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
          {[
            { sigle: "COPIL", comp: g.copilComp, desc: g.copilDesc, members: g.copilMembers },
            { sigle: "CTP", comp: g.ctpComp, desc: g.ctpDesc, members: g.ctpMembers },
          ].map((col) => (
            <div key={col.sigle} style={{ background: "#fff", padding: "34px clamp(20px,3vw,38px)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{col.sigle}</h3>
                <span className="mono" style={{ fontSize: 11, color: "var(--ac)" }}>{col.comp}</span>
              </div>
              <p style={{ margin: "12px 0 22px", fontSize: 14, color: "var(--c-70)", lineHeight: 1.5 }}>{col.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {col.members.map((m) => <span key={m} style={{ fontSize: 12.5, color: "var(--c-black)", background: "var(--c-10)", border: "1px solid var(--c-20)", padding: "7px 12px" }}>{m}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activités */}
      <section className="section section--dark">
        <div className="section__inner">
          <Kicker light>{g.actLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 14px" }}>{g.actTitle}</h2>
          <p style={{ margin: "0 0 44px", fontSize: 16, lineHeight: 1.6, color: "var(--c-40)", maxWidth: 680 }}>{g.actLead}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--c-80)", border: "1px solid var(--c-80)" }}>
            {gouvActivites.map((a, i) => (
              <div key={i} className="gov-act" style={{ background: "var(--c-black)", padding: "24px clamp(20px,2.4vw,30px)", display: "grid", gridTemplateColumns: "150px 1fr", gap: "clamp(14px,2vw,32px)", alignItems: "start", borderLeft: `3px solid ${a.color}` }}>
                <div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--c-50)" }}>{pick(a.date, lang)}</div>
                  <span className="mono" style={{ display: "inline-block", marginTop: 10, fontSize: 10.5, fontWeight: 600, color: "#fff", background: a.color, padding: "4px 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{a.org}</span>
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: "#fff", lineHeight: 1.35 }}>{pick(a.titre, lang)}</div>
                  <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--c-40)" }}>{pick(a.note, lang)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leads */}
      <section className="section">
        <div className="section__inner">
          <Reveal style={{ maxWidth: 640, marginBottom: 42 }}>
            <Kicker>{g.leadsLabel}</Kicker>
            <h2 className="h2--sm" style={{ marginBottom: 14 }}>{g.leadsTitle}</h2>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "var(--c-70)" }}>{g.leadsLead}</p>
          </Reveal>
          <RevealGroup gap={0.05} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(262px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
            {gouvLeads.map((l, i) => (
              <RevealItem key={i} style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
                <div style={{ aspectRatio: "5/4", backgroundColor: l.img ? "#e8ebf0" : "#eef1f7", position: "relative", overflow: "hidden", display: "flex", alignItems: l.img ? "flex-end" : "center", justifyContent: "center", padding: 14, borderTop: `3px solid ${l.color}` }}>
                  {l.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.img} alt={l.nom ? `${l.nom} — ${pick(l.role, lang)}` : pick(l.role, lang)} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 22%" }} />
                  ) : (
                    <span className="mono" style={{ fontSize: "clamp(32px,4.4vw,46px)", fontWeight: 600, color: "var(--c-30)", letterSpacing: "0.02em" }}>{initials(pick(l.role, lang))}</span>
                  )}
                </div>
                <div style={{ padding: "18px 18px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.3 }}>{pick(l.role, lang)}</div>
                  <span className="mono" style={{ display: "inline-block", alignSelf: "flex-start", marginTop: 10, fontSize: 10.5, fontWeight: 600, color: l.color, border: `1px solid ${l.color}`, padding: "3px 8px" }}>{pick(l.pole, lang)}</span>
                  <p style={{ margin: "14px 0 0", fontSize: 13, lineHeight: 1.5, color: "var(--c-70)", flex: 1 }}>{pick(l.mandate, lang)}</p>
                  {l.nom && (
                    <div style={{ marginTop: 14, borderTop: "1px solid var(--c-10)", paddingTop: 12 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--c-black)" }}>{l.nom}</span>
                    </div>
                  )}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </div>
  );
}
