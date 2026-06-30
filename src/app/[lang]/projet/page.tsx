import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { composantes, odp, intermediaires, jalons } from "@/content/data";
import { projetImpacts, projetPersonas, citoyenFaq } from "@/content/carbon";
import { NAV, route } from "@/lib/routes";
import { Kicker } from "@/components/ui/Kicker";
import { Counter } from "@/components/ui/Counter";
import { Accordion } from "@/components/ui/Accordion";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  return { title: dict(asLang(params.lang)).projet.titre };
}

export default function ProjetPage({ params }: { params: { lang: string } }) {
  const lang = asLang(params.lang);
  const t = dict(lang);
  const p = t.projet;
  const faq = citoyenFaq.map((f) => ({ q: pick(f.q, lang), r: pick(f.r, lang) }));

  return (
    <div>
      <section className="page-hero">
        <div className="section__inner">
          <div className="page-hero__crumb">UGPTN / {p.titre}</div>
          <h1>{p.titre}</h1>
          <p className="page-hero__lead">{p.lead}</p>
        </div>
      </section>

      {/* Contexte */}
      <section className="section">
        <div className="section__inner cols2 cols2--center">
          <div>
            <Kicker>{p.ctxLabel}</Kicker>
            <h2 className="h2--sm">{p.ctxTitle}</h2>
            <p style={{ margin: "22px 0 0", fontSize: 16, lineHeight: 1.65, color: "var(--c-70)" }}>{p.ctxLead}</p>
            <div className="grid-3" style={{ marginTop: 34 }}>
              {p.ctxStats.map((s, i) => (
                <div key={i} className="cell" style={{ padding: "18px 16px" }}><div className="mono" style={{ fontWeight: 600, fontSize: 26 }}>{s.v}<span style={{ fontSize: 12, color: "var(--ac)", marginLeft: 3 }}>{s.u}</span></div><div style={{ fontSize: 11.5, color: "var(--c-60)", marginTop: 8, lineHeight: 1.4 }}>{s.t}</div></div>
              ))}
            </div>
          </div>
          <div style={{ aspectRatio: "4/3", backgroundImage: "repeating-linear-gradient(135deg,#eaeaea 0 10px,#f4f4f4 10px 20px)", border: "1px solid var(--c-20)", position: "relative", display: "flex", alignItems: "flex-end", padding: 20 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--c-40)" }}>[ IMAGE — déploiement fibre optique / inclusion numérique ]</span>
          </div>
        </div>
      </section>

      {/* Ce que ça change */}
      <section className="section section--grey">
        <div className="section__inner">
          <Kicker>{p.changeLabel}</Kicker>
          <h2 className="h2--sm" style={{ maxWidth: "18ch" }}>{p.changeTitle}</h2>
          <p style={{ margin: "22px 0 44px", fontSize: 16, lineHeight: 1.65, color: "var(--c-70)", maxWidth: 720 }}>{p.changeLead}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
            {projetImpacts.map((i) => (
              <div key={i.n} className="cell" style={{ padding: "28px clamp(22px,2.4vw,30px)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}><span className="mono" style={{ fontWeight: 600, fontSize: 13, color: "#fff", background: "var(--c-black)", padding: "5px 9px" }}>{i.n}</span><span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>{pick(i.t, lang)}</span></div>
                <div className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--c-50)", marginBottom: 7 }}>{t.words.avant}</div>
                <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.5, color: "var(--c-60)" }}>{pick(i.av, lang)}</p>
                <div className="mono" style={{ fontSize: 13, color: "var(--ac)", marginBottom: 7 }}>↓</div>
                <div className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--ac)", marginBottom: 7 }}>{t.words.apres}</div>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, fontWeight: 500 }}>{pick(i.ap, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="section">
        <div className="section__inner">
          <Kicker>{p.whoLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 44px" }}>{p.whoTitle}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(258px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-black)", borderTopWidth: 2 }}>
            {projetPersonas.map((pe, i) => (
              <div key={i} className="cell" style={{ padding: "28px 26px", minHeight: 158, display: "flex", flexDirection: "column" }}>
                <div style={{ width: 30, height: 3, background: "var(--ac)", marginBottom: 20 }} />
                <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>{pick(pe.k, lang)}</div>
                <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.55, color: "var(--c-70)" }}>{pick(pe.d, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagements fondateurs */}
      <section className="section section--grey">
        <div className="section__inner">
          <Kicker>{p.engLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 40px" }}>{p.engTitle}</h2>
          <div className="cols2" style={{ gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
            {p.eng.map((e, i) => (
              <div key={i} style={{ background: "#fff", padding: "30px", display: "flex", gap: 22, alignItems: "flex-start" }}>
                <span className="mono" style={{ fontSize: 13, color: "#fff", background: "var(--ac)", padding: "6px 10px", whiteSpace: "nowrap" }}>{e.d}</span>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55 }}>{e.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Composantes */}
      <section className="section">
        <div className="section__inner">
          <Kicker>{t.sec.composantes}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 48px" }}>510 M USD · 5 {t.words.composantes}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-black)", borderTopWidth: 2 }}>
            {composantes.map((comp) => (
              <div key={comp.code} style={{ background: "#fff", padding: "30px clamp(20px,3vw,36px)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "clamp(16px,3vw,40px)", alignItems: "baseline" }} className="comp-head">
                  <div className="mono" style={{ fontWeight: 600, fontSize: 30, color: "var(--ac)" }}>{comp.code}</div>
                  <div><h3 style={{ margin: 0, fontSize: "clamp(19px,2.1vw,26px)", fontWeight: 600, letterSpacing: "-0.01em" }}>{pick(comp.titre, lang)}</h3><p style={{ margin: "8px 0 0", fontSize: 14.5, lineHeight: 1.55, color: "var(--c-70)", maxWidth: 640 }}>{pick(comp.desc, lang)}</p></div>
                  <div style={{ textAlign: "right", minWidth: 130 }}><div className="mono" style={{ fontWeight: 600, fontSize: "clamp(24px,2.6vw,34px)" }}><Counter to={comp.montant} dur={1200} /><span style={{ fontSize: 12, color: "var(--c-60)", marginLeft: 4, fontWeight: 400 }}>M USD</span></div><div className="mono" style={{ fontSize: 11, color: "var(--c-50)", marginTop: 6 }}>IDA {comp.ida} · AFD {comp.afd}</div></div>
                </div>
                {comp.sous.length > 0 && (
                  <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
                    {comp.sous.map((s) => (
                      <div key={s.ref} style={{ background: "#fafafa", padding: "14px 16px" }}><div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--c-50)" }}><span>{s.ref}</span><span style={{ color: "var(--c-black)" }}>{s.montant} M</span></div><div style={{ fontSize: 13, color: "var(--c-80)", marginTop: 7, lineHeight: 1.4 }}>{pick(s.text, lang)}</div></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Résultats / ODP */}
      <section className="section section--dark">
        <div className="section__inner">
          <Kicker light>{t.sec.resultats}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 44px", maxWidth: 680 }}>{t.home.resultatsTitle}</h2>
          <div className="grid-4 celled--dark">
            {odp.map((o) => (
              <div key={o.code} className="cell" style={{ display: "flex", flexDirection: "column", minHeight: 210 }}>
                <div className="mono" style={{ fontSize: 12, color: "var(--ac-light)" }}>{o.code}</div>
                <div style={{ marginTop: "auto" }}><div className="mono" style={{ fontWeight: 600, fontSize: "clamp(30px,4vw,50px)", lineHeight: 1, letterSpacing: "-0.03em" }}><Counter to={o.value} dur={1700} /><span style={{ fontSize: 15, color: "var(--c-40)", marginLeft: 6 }}>{o.unit}</span></div></div>
                <div style={{ marginTop: 12, fontSize: 13.5, color: "var(--c-20)", lineHeight: 1.4 }}>{pick(o.label, lang)}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 1, background: "var(--c-80)", border: "1px solid var(--c-80)", borderTop: "none" }}>
            {intermediaires.map((x, i) => (
              <div key={i} style={{ background: "var(--c-black)", padding: "18px 20px" }}><div className="mono" style={{ fontWeight: 600, fontSize: 22 }}>{x.value}<span style={{ fontSize: 12, color: "var(--ac-light)", marginLeft: 4 }}>{x.unit}</span></div><div style={{ fontSize: 12, color: "var(--c-40)", marginTop: 6, lineHeight: 1.4 }}>{pick(x.text, lang)}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* Jalons */}
      <section className="section">
        <div className="section__inner">
          <Kicker>{p.jalonsLabel}</Kicker>
          <div style={{ borderLeft: "2px solid var(--c-20)", marginLeft: 8, marginTop: 20 }}>
            {jalons.map((j, i) => (
              <div key={i} style={{ position: "relative", padding: "0 0 30px 36px" }}>
                <span style={{ position: "absolute", left: -7, top: 3, width: 12, height: 12, background: "var(--ac)", border: "2px solid #fff" }} />
                <div className="mono" style={{ fontSize: 13, color: "var(--ac)", fontWeight: 500 }}>{j.date}</div>
                <div style={{ fontSize: 16, marginTop: 5, maxWidth: 560, lineHeight: 1.4 }}>{pick(j.text, lang)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Le projet & vous */}
      <section className="section section--grey">
        <div className="section__inner">
          <Kicker>{p.cfaqLabel}</Kicker>
          <h2 className="h2--sm" style={{ margin: "0 0 38px" }}>{p.cfaqTitle}</h2>
          <Accordion items={faq} />
        </div>
      </section>

      {/* CTA */}
      <section className="section--dark" style={{ padding: "clamp(56px,7vw,104px) var(--pad-x)" }}>
        <div className="section__inner" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 28 }}>
          <div>
            <h2 className="h2--sm" style={{ maxWidth: "16ch" }}>{p.ctaTitle}</h2>
            <p style={{ margin: "18px 0 0", fontSize: 16, lineHeight: 1.6, color: "var(--c-40)", maxWidth: 520 }}>{p.ctaLead}</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href={route(lang, NAV.marches)} className="btn btn--primary">{t.cta.marches} <span className="arrow">→</span></Link>
            <Link href={route(lang, NAV.actualites)} className="btn btn--on-dark">{t.sec.actus}</Link>
            <Link href={route(lang, NAV.mgp)} className="btn btn--on-dark">{t.cta.mgp}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
