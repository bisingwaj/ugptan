import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { mgpFaq } from "@/content/mgp";
import { NAV, route } from "@/lib/routes";
import { Kicker } from "@/components/ui/Kicker";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Accordion } from "@/components/ui/Accordion";
import { MgpForm } from "@/components/mgp/MgpForm";
import { MgpTracker } from "@/components/mgp/MgpTracker";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return { title: dict(asLang(params.lang)).cta.mgp };
}

/** Une icône par mode de saisine (ordre des modes du MGP). */
const MODE_ICONS: IconName[] = ["formulaire", "sms", "email", "pointfocal"];

export default async function MgpPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang).mgp;
  const faq = mgpFaq.map((f) => ({ q: pick(f.q, lang), r: pick(f.r, lang) }));

  return (
    <div>
      <PageHero crumb={`UGPTN / ${dict(lang).cta.mgp}`} title={t.heroTitle} lead={t.heroLead}>
        <Reveal variant="up" delay={0.18} style={{ display: "inline-flex", alignItems: "center", gap: 11, marginTop: 26, border: "1px solid var(--ok-bd)", background: "var(--ok-bg)", padding: "10px 16px" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
          <span className="mono" style={{ fontSize: 12, color: "var(--ok-fg)" }}>{t.slaBadge}</span>
        </Reveal>
      </PageHero>

      <section style={{ padding: "clamp(48px,6vw,84px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          {/* Modes */}
          <RevealGroup className="grid-4" style={{ marginBottom: "clamp(40px,5vw,60px)" }} gap={0.045}>
            {t.modes.map((m, i) => (
              <RevealItem key={m.n} className="cell step-card" style={{ padding: 22, minHeight: 182, display: "flex", flexDirection: "column" }}>
                <div className="step-card__head">
                  <span className="step-card__icon"><Icon name={MODE_ICONS[i]} size={24} /></span>
                  <span className="mono step-card__n">{m.n}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 15 }}>{m.t}</div>
                <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "var(--c-60)", lineHeight: 1.5 }}>{m.d}</p>
              </RevealItem>
            ))}
          </RevealGroup>

          {/* Form + Tracker */}
          <div className="cols2" style={{ gridTemplateColumns: "1.1fr .9fr", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
            <MgpForm lang={lang} />
            <MgpTracker lang={lang} />
          </div>

          {/* Le suivi a sa page dédiée : c'est elle que l'on garde en favori ou
              que l'on transmet à quelqu'un qui aide la personne à suivre son
              dossier — le formulaire de dépôt n'a pas à être rechargé pour cela. */}
          <Reveal style={{ marginTop: 18, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14, border: "1px solid var(--c-20)", borderTop: "none", background: "var(--c-10)", padding: "16px 20px" }}>
            <span style={{ fontSize: 13.5, color: "var(--c-70)", lineHeight: 1.55 }}>{t.trackPageLead}</span>
            <Link href={route(lang, NAV.mgpSuivi)} className="btn btn--outline btn--sm" style={{ whiteSpace: "nowrap" }}>
              {t.trackPageTitle} <span className="arrow">→</span>
            </Link>
          </Reveal>

          {/* EAS/HS confidential channel */}
          <Reveal style={{ marginTop: "clamp(36px,4vw,56px)", border: "1px solid var(--c-20)", borderLeft: "3px solid var(--c-80)", background: "var(--c-10)", padding: "clamp(26px,3.5vw,42px)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
              <span style={{ width: 44, height: 44, background: "var(--c-black)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>🔒</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: "clamp(18px,2vw,23px)", letterSpacing: "-0.02em" }}>{t.easTitle}</div>
                <div style={{ fontSize: 13, color: "var(--c-60)" }}>{t.easSub}</div>
              </div>
            </div>
            <p style={{ margin: "18px 0 0", fontSize: 14, lineHeight: 1.65, color: "var(--c-70)", maxWidth: 880 }}>{t.easBody}</p>
            <button className="btn btn--dark" style={{ marginTop: 22 }}>{t.easCta} →</button>
          </Reveal>

          {/* FAQ */}
          <div style={{ marginTop: "clamp(48px,6vw,84px)" }}>
            <Reveal>
              <Kicker>{t.faqLabel}</Kicker>
              <h2 className="h2--sm" style={{ margin: "0 0 8px" }}>{t.faqTitle}</h2>
              <p style={{ margin: "0 0 30px", fontSize: 15, color: "var(--c-70)", maxWidth: 620 }}>{t.faqLead}</p>
            </Reveal>
            <Accordion items={faq} />
          </div>
        </div>
      </section>
    </div>
  );
}
