import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { marchesMethodes, candidature } from "@/content/marches";
import { NAV, route } from "@/lib/routes";
import { Kicker } from "@/components/ui/Kicker";
import { MarchesClient } from "@/components/marches/MarchesClient";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  return { title: dict(asLang(params.lang)).nav.marches };
}

export default function MarchesPage({ params }: { params: { lang: string } }) {
  const lang = asLang(params.lang);
  const t = dict(lang);

  return (
    <div>
      <section className="page-hero">
        <div className="section__inner">
          <div className="page-hero__crumb">UGPTN / {t.nav.marches}</div>
          <h1>{t.marches.heroTitle}</h1>
          <p className="page-hero__lead">{t.marches.heroLead}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 30 }}>
            {marchesMethodes.map((m) => (
              <div key={m.sigle} style={{ display: "flex", alignItems: "center", gap: 9, border: "1px solid var(--c-20)", padding: "8px 14px" }}>
                <span className="mono" style={{ fontWeight: 600, fontSize: 12, color: "var(--ac)" }}>{m.sigle}</span>
                <span style={{ fontSize: 12.5, color: "var(--c-70)" }}>{pick(m.label, lang)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          <MarchesClient lang={lang} />

          <div style={{ marginTop: "clamp(48px,6vw,80px)", background: "var(--c-black)", color: "#fff", padding: "clamp(30px,4vw,52px)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div style={{ maxWidth: 560 }}>
              <Kicker light>{t.connexion.bidderSpace}</Kicker>
              <div style={{ fontWeight: 600, fontSize: "clamp(20px,2.4vw,30px)", letterSpacing: "-0.02em" }}>{t.marches.bidderTitle}</div>
              <p style={{ margin: "9px 0 0", fontSize: 14.5, color: "var(--c-30)", lineHeight: 1.55 }}>{t.marches.bidderLead}</p>
            </div>
            <Link href={route(lang, NAV.connexion)} className="btn btn--primary" style={{ whiteSpace: "nowrap", padding: "16px 26px" }}>{t.connexion.bidderSpace} →</Link>
          </div>

          <div className="grid-4" style={{ marginTop: 1 }}>
            {candidature.map((c) => (
              <div key={c.n} className="cell" style={{ padding: "26px 22px", minHeight: 180, display: "flex", flexDirection: "column" }}>
                <div className="mono" style={{ fontWeight: 600, fontSize: 26, color: "var(--ac)" }}>{c.n}</div>
                <h4 style={{ margin: "14px 0 0", fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{pick(c.titre, lang)}</h4>
                <p style={{ margin: "9px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "var(--c-60)" }}>{pick(c.desc, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
