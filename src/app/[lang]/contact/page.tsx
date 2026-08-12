import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { contact } from "@/content/carbon";
import { Kicker } from "@/components/ui/Kicker";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProvinceMap } from "@/components/home/ProvinceMap";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return { title: dict(asLang(params.lang)).contact.titre };
}

/** Une icône par mode de saisine (ordre des modes du MGP). */
const MODE_ICONS: IconName[] = ["formulaire", "sms", "email", "pointfocal"];

export default async function ContactPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const c = t.contact;

  return (
    <div>
      <PageHero crumb={`UGPTN / ${c.titre}`} title={c.titre} lead={c.lead} />

      {/* Coordonnées */}
      <section style={{ padding: "clamp(48px,6vw,80px) var(--pad-x) 0" }}>
        <div className="section__inner">
          <RevealGroup gap={0.045} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
            <RevealItem className="cell" style={{ padding: "30px 28px" }}>
              <div className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--c-50)" }}>{c.lblAddress}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 14, lineHeight: 1.4 }}>{contact.adresse}</div>
              <div style={{ fontSize: 13.5, color: "var(--c-70)", marginTop: 8, lineHeight: 1.5 }}>{contact.quartier}</div>
            </RevealItem>
            <RevealItem className="cell" style={{ padding: "30px 28px" }}>
              <div className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--c-50)" }}>{c.lblPhone}</div>
              <a href={`tel:${contact.tel.replace(/\s/g, "")}`} className="mono" style={{ display: "block", fontSize: 21, fontWeight: 600, marginTop: 14 }}>{contact.tel}</a>
              <div style={{ fontSize: 13.5, color: "var(--c-70)", marginTop: 8, lineHeight: 1.5 }}>{c.phoneNote}</div>
            </RevealItem>
            <RevealItem className="cell" style={{ padding: "30px 28px" }}>
              <div className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--c-50)" }}>E-mail</div>
              <a href={`mailto:${contact.email}`} style={{ display: "block", fontSize: 18, fontWeight: 600, marginTop: 14, color: "var(--ac)", wordBreak: "break-all" }}>{contact.email}</a>
              <div style={{ fontSize: 13.5, color: "var(--c-70)", marginTop: 8, lineHeight: 1.5 }}>{c.emailNote}</div>
            </RevealItem>
            <RevealItem className="cell" style={{ padding: "30px 28px" }}>
              <div className="mono" style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--green-bright)" }}><span className="blink" style={{ width: 8, height: 8, background: "var(--green-bright)", borderRadius: "50%" }} />{c.numeroVert}</div>
              <div className="mono" style={{ fontSize: 30, fontWeight: 600, marginTop: 14 }}>{contact.numeroVert}</div>
              <div style={{ fontSize: 13.5, color: "var(--c-70)", marginTop: 8, lineHeight: 1.5 }}>{c.numeroVertNote}</div>
            </RevealItem>
          </RevealGroup>
          <div style={{ marginTop: 1, background: "var(--c-black)", color: "#fff", padding: "24px 28px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px 22px" }}>
            <span className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ac-light)" }}>{c.lblTutelle}</span>
            {contact.tutelles.map((tu) => <span key={tu} style={{ fontSize: 14.5, fontWeight: 500 }}>{tu}</span>)}
          </div>
        </div>
      </section>

      {/* MGP modes + EAS */}
      <section className="section">
        <div className="section__inner">
          <Reveal>
            <Kicker>{c.mgpLabel}</Kicker>
            <h2 className="h2--sm" style={{ margin: "0 0 12px" }}>{c.mgpModesTitle}</h2>
            <p style={{ margin: "0 0 40px", fontSize: 15, color: "var(--c-70)" }}>{c.slaText}</p>
          </Reveal>
          <RevealGroup className="grid-4" gap={0.045}>
            {c.mgpModes.map((m, i) => (
              <RevealItem key={m.n} className="cell step-card" style={{ padding: "26px 22px", minHeight: 190, display: "flex", flexDirection: "column" }}>
                <div className="step-card__head">
                  <span className="step-card__icon"><Icon name={MODE_ICONS[i]} size={26} /></span>
                  <span className="mono step-card__n">{m.n}</span>
                </div>
                <h3 style={{ margin: "auto 0 0", fontSize: 17, fontWeight: 600 }}>{m.t}</h3>
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--c-70)", lineHeight: 1.5 }}>{m.d}</p>
              </RevealItem>
            ))}
          </RevealGroup>
          <RevealGroup className="cols2" gap={0.045} style={{ marginTop: 1, gridTemplateColumns: "1.2fr .8fr", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)", borderTop: "none" }}>
            <RevealItem style={{ background: "var(--c-black)", color: "#fff", padding: "34px clamp(20px,3vw,36px)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{c.generalTitle}</div>
                <div style={{ fontSize: 13.5, color: "var(--c-40)", marginTop: 6, maxWidth: 380, lineHeight: 1.5 }}>{c.generalDesc}</div>
              </div>
              <button className="btn btn--primary btn--sm">{t.cta.report}<span className="arrow">→</span></button>
            </RevealItem>
            <RevealItem style={{ background: "var(--c-10)", padding: "34px clamp(20px,3vw,36px)", borderLeft: "3px solid var(--c-50)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 15 }}>🔒</span><div style={{ fontSize: 16, fontWeight: 600 }}>{c.easLabel}</div></div>
              <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--c-70)", lineHeight: 1.55 }}>{c.easText}</p>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Map */}
      <section className="section">
        <div className="section__inner cols2 cols2--center" style={{ gridTemplateColumns: ".85fr 1.15fr" }}>
          <Reveal>
            <Kicker>{c.focalLabel}</Kicker>
            <h2 className="h2--sm">26 provinces.<br />10 {t.words.prio}.</h2>
            <p style={{ margin: "22px 0 0", fontSize: 15, lineHeight: 1.6, color: "var(--c-70)", maxWidth: 420 }}>{t.home.couvertureLead}</p>
            <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 9, fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 11, height: 11, background: "var(--ac)" }} /><span style={{ color: "var(--c-80)" }}>{t.lbl.prio} (CPF)</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 11, height: 11, border: "1px solid var(--c-50)", background: "#fff" }} /><span style={{ color: "var(--c-80)" }}>{t.lbl.autres}</span></div>
            </div>
          </Reveal>
          <ProvinceMap lang={lang} />
        </div>
      </section>
    </div>
  );
}
