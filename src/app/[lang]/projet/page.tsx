import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { composantes, odp, intermediaires } from "@/content/data";
import { projetPersonas, citoyenFaq } from "@/content/carbon";
import { NAV, route, compRoute } from "@/lib/routes";
import { compVar } from "@/lib/comp";
import { Kicker } from "@/components/ui/Kicker";
import { Counter } from "@/components/ui/Counter";
import { Accordion } from "@/components/ui/Accordion";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { SectionsImpact } from "@/components/impact/SectionsImpact";

/** Cache aligné sur l'accueil : la page sert deux blocs administrés depuis la
 *  console (avant/après, frise des jalons), invalidés par les écritures du
 *  module (cf. lib/impact/cache.ts). */
export const revalidate = 120;

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return { title: dict(asLang(params.lang)).projet.titre };
}

export default async function ProjetPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const p = t.projet;
  const faq = citoyenFaq.map((f) => ({ q: pick(f.q, lang), r: pick(f.r, lang) }));

  return (
    <div>
      <PageHero crumb={`UGPTN / ${p.titre}`} title={p.titre} lead={p.lead} />

      {/* Contexte */}
      <section className="section">
        <div className="section__inner cols2 cols2--center">
          <div>
            <Reveal>
              <Kicker>{p.ctxLabel}</Kicker>
              <h2 className="h2--sm">{p.ctxTitle}</h2>
              <p style={{ margin: "22px 0 0", fontSize: 16, lineHeight: 1.65, color: "var(--c-70)" }}>{p.ctxLead}</p>
            </Reveal>
            <RevealGroup className="grid-3" style={{ marginTop: 34 }} gap={0.05}>
              {p.ctxStats.map((s, i) => (
                <RevealItem key={i} className="cell" style={{ padding: "18px 16px" }}><div className="mono" style={{ fontWeight: 600, fontSize: 26 }}>{s.v}<span style={{ fontSize: 12, color: "var(--ac)", marginLeft: 3 }}>{s.u}</span></div><div style={{ fontSize: 11.5, color: "var(--c-60)", marginTop: 8, lineHeight: 1.4 }}>{s.t}</div></RevealItem>
              ))}
            </RevealGroup>
          </div>
          <div style={{ aspectRatio: "4/3", background: "linear-gradient(140deg, #0a1330 0%, #16315f 55%, #0f62fe 130%)", border: "1px solid var(--c-20)", position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", padding: 22 }}>
            <span className="mono" style={{ position: "absolute", top: 18, right: 20, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.85)" }}>C1</span>
            <span className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,.9)", lineHeight: 1.5 }}>{lang === "en" ? "Fibre rollout · digital inclusion" : "Déploiement fibre optique · inclusion numérique"}</span>
          </div>
        </div>
      </section>

      {/* Ce que ça change — administré depuis la console (module « Histoires &
          impact »). Le dessin du diptyque vit dans
          components/impact/blocs/BlocAvantApres.tsx. */}
      <SectionsImpact emplacement="PROJET_CHANGEMENTS" lang={lang} />

      {/* Pour qui */}
      <section className="section">
        <div className="section__inner">
          <Reveal>
            <Kicker>{p.whoLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 44px" }}>{p.whoTitle}</h2>
          </Reveal>
          <RevealGroup className="celled-flow celled-flow--top" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(258px,1fr))" }} gap={0.045}>
            {projetPersonas.map((pe, i) => (
              <RevealItem key={i} className="cell" style={{ padding: "28px 26px", minHeight: 158, display: "flex", flexDirection: "column" }}>
                <div style={{ width: 30, height: 3, background: "var(--ac)", marginBottom: 20 }} />
                <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>{pick(pe.k, lang)}</div>
                <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.55, color: "var(--c-70)" }}>{pick(pe.d, lang)}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Engagements fondateurs */}
      <section className="section section--grey">
        <div className="section__inner">
          <Reveal>
            <Kicker>{p.engLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 40px" }}>{p.engTitle}</h2>
          </Reveal>
          <RevealGroup className="cols2" style={{ gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }} gap={0.045}>
            {p.eng.map((e, i) => (
              <RevealItem key={i} style={{ background: "#fff", padding: "30px", display: "flex", gap: 22, alignItems: "flex-start" }}>
                <span className="mono" style={{ fontSize: 13, color: "#fff", background: "var(--ac)", padding: "6px 10px", whiteSpace: "nowrap" }}>{e.d}</span>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55 }}>{e.t}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Composantes */}
      <section className="section">
        <div className="section__inner">
          <Reveal style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20, margin: "0 0 48px" }}>
            <div>
              <Kicker>{t.sec.composantes}</Kicker>
              <h2 className="h2--sm" style={{ margin: 0 }}>{t.comp.indexTitle}</h2>
            </div>
            <Link href={route(lang, NAV.composantes)} className="btn btn--outline" style={{ whiteSpace: "nowrap" }}>{t.comp.seeAll} <span className="arrow">→</span></Link>
          </Reveal>
          <RevealGroup style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-black)", borderTopWidth: 2 }} gap={0.045}>
            {composantes.map((comp) => (
              <RevealItem key={comp.code}>
                <Link href={compRoute(lang, comp.code)} className="comp-row comp-row--link" style={{ ...compVar(comp.code), display: "block", background: "#fff", padding: "30px clamp(20px,3vw,36px)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 30px", gap: "clamp(16px,3vw,40px)", alignItems: "baseline" }} className="comp-head">
                    <div className="mono" style={{ fontWeight: 600, fontSize: 30, color: "var(--comp)" }}>{comp.code}</div>
                    <div><h3 className="comp-row__titre" style={{ margin: 0, fontSize: "clamp(19px,2.1vw,26px)", fontWeight: 600, letterSpacing: "-0.01em" }}>{pick(comp.titre, lang)}</h3><p style={{ margin: "8px 0 0", fontSize: 14.5, lineHeight: 1.55, color: "var(--c-70)", maxWidth: 720 }}>{pick(comp.desc, lang)}</p></div>
                    <span className="comp-row__go" aria-hidden>→</span>
                  </div>
                  {comp.sous.length > 0 && (
                    <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
                      {comp.sous.map((s) => (
                        <div key={s.ref} style={{ background: "#fafafa", padding: "14px 16px" }}><div className="mono" style={{ fontSize: 11, color: "var(--ac)" }}>{s.ref}</div><div style={{ fontSize: 13, color: "var(--c-80)", marginTop: 7, lineHeight: 1.4 }}>{pick(s.text, lang)}</div></div>
                      ))}
                    </div>
                  )}
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Résultats / ODP */}
      <section className="section section--dark">
        <div className="section__inner">
          <Reveal>
            <Kicker light>{t.sec.resultats}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 44px", maxWidth: 680 }}>{t.home.resultatsTitle}</h2>
          </Reveal>
          <RevealGroup className="grid-4 celled--dark" gap={0.045}>
            {odp.map((o) => (
              <RevealItem key={o.code} className="cell" style={{ display: "flex", flexDirection: "column", minHeight: 210 }}>
                <div className="mono" style={{ fontSize: 12, color: "var(--ac-light)" }}>{o.code}</div>
                <div style={{ marginTop: "auto" }}><div className="mono" style={{ fontWeight: 600, fontSize: "clamp(30px,4vw,50px)", lineHeight: 1, letterSpacing: "-0.03em" }}><span className="stat__approx">{t.lbl.approx}</span><Counter to={o.value} dur={1300} /><span style={{ fontSize: 15, color: "var(--c-40)", marginLeft: 6 }}>{o.unit}</span></div></div>
                <div style={{ marginTop: 12, fontSize: 13.5, color: "var(--c-20)", lineHeight: 1.4 }}>{pick(o.label, lang)}</div>
              </RevealItem>
            ))}
          </RevealGroup>
          <RevealGroup style={{ marginTop: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 1, background: "var(--c-80)", border: "1px solid var(--c-80)", borderTop: "none" }} gap={0.045}>
            {intermediaires.map((x, i) => (
              <RevealItem key={i} style={{ background: "var(--c-black)", padding: "18px 20px" }}><div className="mono" style={{ fontWeight: 600, fontSize: 22 }}><span className="stat__approx">{t.lbl.approx}</span>{x.value}<span style={{ fontSize: 12, color: "var(--ac-light)", marginLeft: 4 }}>{x.unit}</span></div><div style={{ fontSize: 12, color: "var(--c-40)", marginTop: 6, lineHeight: 1.4 }}>{pick(x.text, lang)}</div></RevealItem>
            ))}
          </RevealGroup>
          <p className="stat__note stat__note--dark">{t.lbl.indicatif}</p>
        </div>
      </section>

      {/* Jalons — frise administrée depuis la console. Les dates sont désormais
          de vraies dates : elles ordonnent la frise et se mettent en forme dans
          la langue de lecture. */}
      <SectionsImpact emplacement="PROJET_JALONS" lang={lang} />

      {/* Le projet & vous */}
      <section className="section section--grey">
        <div className="section__inner">
          <Reveal>
            <Kicker>{p.cfaqLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 38px" }}>{p.cfaqTitle}</h2>
          </Reveal>
          <Accordion items={faq} />
        </div>
      </section>

      {/* CTA */}
      <section className="section--dark" style={{ padding: "clamp(56px,7vw,104px) var(--pad-x)" }}>
        <div className="section__inner" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 28 }}>
          <Reveal>
            <h2 className="h2--sm" style={{ maxWidth: "16ch" }}>{p.ctaTitle}</h2>
            <p style={{ margin: "18px 0 0", fontSize: 16, lineHeight: 1.6, color: "var(--c-40)", maxWidth: 520 }}>{p.ctaLead}</p>
          </Reveal>
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
