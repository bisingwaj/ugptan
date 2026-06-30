import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { mgpFaq } from "@/content/mgp";
import { Kicker } from "@/components/ui/Kicker";
import { Accordion } from "@/components/ui/Accordion";
import { MgpForm } from "@/components/mgp/MgpForm";
import { MgpTracker } from "@/components/mgp/MgpTracker";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  return { title: dict(asLang(params.lang)).cta.mgp };
}

export default function MgpPage({ params }: { params: { lang: string } }) {
  const lang = asLang(params.lang);
  const t = dict(lang).mgp;
  const faq = mgpFaq.map((f) => ({ q: pick(f.q, lang), r: pick(f.r, lang) }));

  return (
    <div>
      <section className="page-hero">
        <div className="section__inner">
          <div className="page-hero__crumb">UGPTN / {dict(lang).cta.mgp}</div>
          <h1>{t.heroTitle}</h1>
          <p className="page-hero__lead">{t.heroLead}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 11, marginTop: 26, border: "1px solid var(--ok-bd)", background: "var(--ok-bg)", padding: "10px 16px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
            <span className="mono" style={{ fontSize: 12, color: "var(--ok-fg)" }}>{t.slaBadge}</span>
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(48px,6vw,84px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          {/* Modes */}
          <div className="grid-4" style={{ marginBottom: "clamp(40px,5vw,60px)" }}>
            {t.modes.map((m) => (
              <div key={m.n} className="cell" style={{ padding: 22, minHeight: 170, display: "flex", flexDirection: "column" }}>
                <div className="mono" style={{ fontWeight: 600, fontSize: 22, color: "var(--ac)" }}>{m.n}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 13 }}>{m.t}</div>
                <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "var(--c-60)", lineHeight: 1.5 }}>{m.d}</p>
              </div>
            ))}
          </div>

          {/* Form + Tracker */}
          <div className="cols2" style={{ gridTemplateColumns: "1.1fr .9fr", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
            <MgpForm lang={lang} />
            <MgpTracker lang={lang} />
          </div>

          {/* EAS/HS confidential channel */}
          <div style={{ marginTop: "clamp(36px,4vw,56px)", border: "1px solid var(--c-20)", borderLeft: "3px solid var(--c-80)", background: "var(--c-10)", padding: "clamp(26px,3.5vw,42px)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
              <span style={{ width: 44, height: 44, background: "var(--c-black)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>🔒</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: "clamp(18px,2vw,23px)", letterSpacing: "-0.02em" }}>{t.easTitle}</div>
                <div style={{ fontSize: 13, color: "var(--c-60)" }}>{t.easSub}</div>
              </div>
            </div>
            <p style={{ margin: "18px 0 0", fontSize: 14, lineHeight: 1.65, color: "var(--c-70)", maxWidth: 880 }}>{t.easBody}</p>
            <button className="btn btn--dark" style={{ marginTop: 22 }}>{t.easCta} →</button>
          </div>

          {/* FAQ */}
          <div style={{ marginTop: "clamp(48px,6vw,84px)" }}>
            <Kicker>{t.faqLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 8px" }}>{t.faqTitle}</h2>
            <p style={{ margin: "0 0 30px", fontSize: 15, color: "var(--c-70)", maxWidth: 620 }}>{t.faqLead}</p>
            <Accordion items={faq} />
          </div>
        </div>
      </section>
    </div>
  );
}
