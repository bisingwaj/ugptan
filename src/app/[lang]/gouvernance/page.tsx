import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { gouvernance } from "@/content/data";
import { gouvActivites } from "@/content/carbon";
import { membresEnAvant } from "@/lib/equipe/query";
import { Kicker } from "@/components/ui/Kicker";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { CartesCoordination } from "@/components/equipe/CartesCoordination";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return { title: dict(asLang(params.lang)).gouv.titre };
}

export default async function GouvernancePage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const g = t.gouv;
  const leads = await membresEnAvant(lang);

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
          {/* Fiches marquées « mise en avant » dans la console. Ce sont les
              mêmes personnes que la grille de l'accueil, montrées avec leur
              responsabilité (cf. src/components/equipe/CartesCoordination.tsx). */}
          <CartesCoordination membres={leads} />
        </div>
      </section>
    </div>
  );
}
