import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { meta, mandat, principes, poles, equipe, question, engagement } from "@/content/data";
import { ugptnMission, polesAction, uniteStats, methode, engagementsList, glossaire, ugptnFaq } from "@/content/carbon";
import { Kicker } from "@/components/ui/Kicker";
import { Accordion } from "@/components/ui/Accordion";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  return { title: dict(asLang(params.lang)).ugptn.titre };
}

export default function UgptnPage({ params }: { params: { lang: string } }) {
  const lang = asLang(params.lang);
  const t = dict(lang);
  const u = t.ugptn;
  const faq = ugptnFaq.map((f) => ({ q: pick(f.q, lang), r: pick(f.r, lang) }));
  const n2 = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <div>
      <section className="page-hero">
        <div className="section__inner">
          <div className="page-hero__crumb">UGPTN / {u.titre}</div>
          <h1>{u.titre}</h1>
          <p className="page-hero__lead">{u.lead}</p>
        </div>
      </section>

      {/* Question */}
      <section className="section section--dark">
        <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ac-light)", marginBottom: 28 }}>{t.tagPublic}</div>
          <p style={{ margin: 0, fontSize: "clamp(24px,3.4vw,42px)", lineHeight: 1.35, letterSpacing: "-0.02em", fontWeight: 300 }}>« {pick(question, lang)} »</p>
        </div>
      </section>

      {/* Mandat */}
      <section className="section">
        <div className="section__inner">
          <Kicker>{u.mandatLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 44px" }}>{u.mandatTitle}</h2>
          <div className="grid-4">
            {mandat.map((m) => (
              <div key={m.n} className="cell" style={{ padding: "28px 24px", minHeight: 230, display: "flex", flexDirection: "column" }}>
                <div className="mono" style={{ fontWeight: 600, fontSize: 30, color: "var(--ac)" }}>{m.n}</div>
                <h3 style={{ margin: "18px 0 0", fontSize: 19, fontWeight: 600, letterSpacing: "-0.01em" }}>{pick(m.titre, lang)}</h3>
                <p style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.55, color: "var(--c-70)" }}>{pick(m.desc, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principes */}
      <section className="section section--grey">
        <div className="section__inner">
          <Kicker>{u.principesLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 40px" }}>{u.principesTitle}</h2>
          <div className="grid-3">
            {principes.map((p, i) => (
              <div key={i} className="cell" style={{ padding: "30px 28px" }}>
                <div className="mono" style={{ fontSize: 13, color: "var(--ac)" }}>{n2(i)}</div>
                <h3 style={{ margin: "16px 0 0", fontSize: 20, fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em" }}>{pick(p.titre, lang)}</h3>
                <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--c-70)" }}>{pick(p.desc, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pôles */}
      <section className="section">
        <div className="section__inner">
          <Kicker>{u.polesLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 40px" }}>{u.polesTitle}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
            {poles.map((pl, i) => (
              <div key={i} className="pole-row" style={{ background: "#fff", padding: "24px clamp(20px,3vw,32px)", display: "grid", gridTemplateColumns: "230px 1fr", gap: "clamp(16px,3vw,40px)", alignItems: "start" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{pick(pl.nom, lang)}</h3>
                  <div style={{ fontSize: 12.5, color: "var(--c-60)", marginTop: 6, lineHeight: 1.4 }}>{pick(pl.role, lang)}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ac)", marginTop: 10 }}>{pl.roles.length} {t.words.roles}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {pl.roles.map((r) => <span key={r} style={{ fontSize: 12.5, color: "var(--c-80)", background: "var(--c-10)", border: "1px solid var(--c-20)", padding: "6px 11px" }}>{r}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section className="section">
        <div className="section__inner">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 42 }}>
            <div><Kicker>{t.sec.equipe}</Kicker><h2 className="h2--sm">21 {t.words.roles}</h2></div>
            <p style={{ maxWidth: 340, fontSize: 14, lineHeight: 1.55, color: "var(--c-60)", margin: 0 }}>{t.home.equipeLead}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(212px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
            {equipe.map((m, i) => (
              <div key={i} style={{ background: "#fff" }}>
                <div style={{ aspectRatio: "1/1", backgroundImage: "repeating-linear-gradient(135deg,#eaeaea 0 9px,#f4f4f4 9px 18px)", position: "relative", display: "flex", alignItems: "flex-end", padding: 14 }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--c-40)" }}>[ PORTRAIT ]</span>
                  <span className="mono" style={{ position: "absolute", top: 12, left: 14, fontSize: 10, color: "var(--ac)" }}>{n2(i)}</span>
                </div>
                <div style={{ padding: "16px 16px 20px" }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.25 }}>{pick(m.role, lang)}</div>
                  <div style={{ fontSize: 12, color: "var(--c-60)", marginTop: 6 }}>{pick(m.pole, lang)}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--c-50)", marginTop: 12, borderTop: "1px solid var(--c-10)", paddingTop: 10 }}>{t.words.nomAVenir}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement */}
      <section className="section--accent" style={{ padding: "clamp(64px,8vw,120px) var(--pad-x)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <p style={{ margin: 0, fontSize: "clamp(22px,3vw,38px)", lineHeight: 1.35, letterSpacing: "-0.02em", fontWeight: 300 }}>« {pick(engagement, lang)} »</p>
          <div className="mono" style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: "14px 32px", fontSize: 12.5, color: "var(--ac-line)" }}>
            <span>{u.arrete}</span><span style={{ opacity: 0.6 }}>·</span><span>{meta.arrete}</span><span style={{ opacity: 0.6 }}>·</span><span>{meta.arreteDate}</span>
          </div>
        </div>
      </section>

      {/* Objectif & rôle */}
      <section className="section">
        <div className="section__inner">
          <Kicker>{u.objLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 18px", maxWidth: "16ch" }}>{u.objTitle}</h2>
          <p style={{ margin: "0 0 46px", fontSize: "clamp(16px,1.6vw,19px)", lineHeight: 1.62, color: "var(--c-70)", maxWidth: 760 }}>{u.objLead}</p>
          <div className="grid-3 celled--top">
            {ugptnMission.map((m, i) => (
              <div key={i} className="cell" style={{ padding: "32px clamp(22px,2.4vw,30px)", display: "flex", flexDirection: "column" }}>
                <div className="mono" style={{ fontSize: 30, fontWeight: 600, color: "var(--ac)" }}>{n2(i)}</div>
                <h3 style={{ margin: "18px 0 0", fontSize: "clamp(20px,2.2vw,26px)", fontWeight: 600, letterSpacing: "-0.01em" }}>{pick(m.t, lang)}</h3>
                <p style={{ margin: "12px 0 0", fontSize: 14.5, lineHeight: 1.55, color: "var(--c-70)" }}>{pick(m.d, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pôles en action */}
      <section className="section section--dark">
        <div className="section__inner">
          <Kicker light>{u.polesActLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 14px" }}>{u.polesActTitle}</h2>
          <p style={{ margin: "0 0 44px", fontSize: 16, lineHeight: 1.6, color: "var(--c-40)", maxWidth: 700 }}>{u.polesActLead}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 1, background: "var(--c-80)", border: "1px solid var(--c-80)" }}>
            {polesAction.map((p, i) => (
              <div key={i} style={{ background: "var(--c-black)", padding: "28px 24px", display: "flex", flexDirection: "column", borderTop: `3px solid ${p.color}`, minHeight: 230 }}>
                <h3 style={{ margin: 0, fontSize: 17.5, fontWeight: 600, lineHeight: 1.3, color: "#fff" }}>{pick(p.pole, lang)}</h3>
                <p style={{ margin: "14px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--c-40)", flex: 1 }}>{pick(p.mission, lang)}</p>
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--c-80)", display: "flex", alignItems: "flex-start", gap: 9 }}>
                  <span className="blink" style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, marginTop: 5, flex: "0 0 auto" }} />
                  <span style={{ fontSize: 13, lineHeight: 1.45, color: "var(--c-20)", fontWeight: 500 }}>{pick(p.act, lang)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unité en bref */}
      <section className="section section--sm section--grey">
        <div className="section__inner">
          <Kicker>{u.uniteBrefLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 36px" }}>{u.uniteBrefTitle}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-black)", borderTopWidth: 2 }}>
            {uniteStats.map((s, i) => (
              <div key={i} className="cell" style={{ padding: "26px 22px" }}><div className="mono" style={{ fontWeight: 600, fontSize: "clamp(30px,3.6vw,44px)", lineHeight: 1 }}>{s.v}{s.u && <span style={{ fontSize: 15, color: "var(--ac)", marginLeft: 4 }}>{s.u}</span>}</div><div style={{ fontSize: 13, color: "var(--c-70)", marginTop: 10, lineHeight: 1.4 }}>{pick(s.l, lang)}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* Méthode */}
      <section className="section">
        <div className="section__inner">
          <Kicker>{u.methodeLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 14px", maxWidth: "18ch" }}>{u.methodeTitle}</h2>
          <p style={{ margin: "0 0 44px", fontSize: 16, lineHeight: 1.6, color: "var(--c-70)", maxWidth: 720 }}>{u.methodeLead}</p>
          <div className="grid-5">
            {methode.map((m, i) => (
              <div key={i} className="cell" style={{ padding: "28px 22px", display: "flex", flexDirection: "column", minHeight: 210 }}>
                <div className="mono" style={{ fontWeight: 600, fontSize: 13, color: "#fff", background: "var(--ac)", width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{n2(i)}</div>
                <h3 style={{ margin: "18px 0 0", fontSize: 17, fontWeight: 600, lineHeight: 1.28 }}>{pick(m.t, lang)}</h3>
                <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "var(--c-70)" }}>{pick(m.d, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagements */}
      <section className="section section--dark">
        <div className="section__inner">
          <Kicker light>{u.engLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 40px" }}>{u.engTitle}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(284px,1fr))", gap: 1, background: "var(--c-80)", border: "1px solid var(--c-80)" }}>
            {engagementsList.map((e, i) => (
              <div key={i} style={{ background: "var(--c-black)", padding: "26px 24px", borderTop: `3px solid ${e.color}`, display: "flex", flexDirection: "column", minHeight: 158 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#fff" }}>{pick(e.t, lang)}</h3>
                <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--c-40)", flex: 1 }}>{pick(e.d, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Glossaire */}
      <section className="section">
        <div className="section__inner">
          <Kicker>{u.glossaireLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 14px" }}>{u.glossaireTitle}</h2>
          <p style={{ margin: "0 0 40px", fontSize: 16, lineHeight: 1.6, color: "var(--c-70)", maxWidth: 680 }}>{u.glossaireLead}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
            {glossaire.map((g) => (
              <div key={g.s} className="cell" style={{ padding: "20px 22px", display: "flex", gap: 16, alignItems: "baseline" }}>
                <span className="mono" style={{ fontWeight: 600, fontSize: 14, color: "var(--ac)", minWidth: 74 }}>{g.s}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: "var(--c-80)" }}>{pick(g.d, lang)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section--grey">
        <div className="section__inner">
          <Kicker>{u.faqLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 38px" }}>{u.faqTitle}</h2>
          <Accordion items={faq} />
        </div>
      </section>
    </div>
  );
}
