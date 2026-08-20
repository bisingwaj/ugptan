import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { marchesMethodes, candidature } from "@/content/marches";
import { chargerMarches } from "@/lib/digiprocure";
import { NAV, route } from "@/lib/routes";
import { Kicker } from "@/components/ui/Kicker";
import { Icon, type IconName } from "@/components/ui/Icon";
import { MarchesClient } from "@/components/marches/MarchesClient";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return { title: dict(asLang(params.lang)).nav.marches };
}

/** Une icône par étape du parcours soumissionnaire (ordre de `candidature`). */
const CANDIDATURE_ICONS: IconName[] = ["compte", "dossier", "depot", "attribution"];

export default async function MarchesPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);

  /* Les avis viennent de DigiProcure, source unique. En cas d'indisponibilité,
     `chargerMarches` rend une liste vide plutôt que de faire échouer la page :
     le site institutionnel ne tombe pas parce que la plateforme redémarre. */
  const marches = await chargerMarches();

  return (
    <div>
      <PageHero crumb={`UGPTN / ${t.nav.marches}`} title={t.marches.heroTitle} lead={t.marches.heroLead}>
        <Reveal variant="up" delay={0.18} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 30 }}>
          {marchesMethodes.map((m) => (
            <div key={m.sigle} style={{ display: "flex", alignItems: "center", gap: 9, border: "1px solid var(--c-20)", padding: "8px 14px" }}>
              <span className="mono" style={{ fontWeight: 600, fontSize: 12, color: "var(--ac)" }}>{m.sigle}</span>
              <span style={{ fontSize: 12.5, color: "var(--c-70)" }}>{pick(m.label, lang)}</span>
            </div>
          ))}
        </Reveal>
      </PageHero>

      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          <MarchesClient lang={lang} marches={marches} />

          <Reveal style={{ marginTop: "clamp(48px,6vw,80px)", background: "var(--c-black)", color: "#fff", padding: "clamp(30px,4vw,52px)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div style={{ maxWidth: 560 }}>
              <Kicker light>{t.marches.bidderKicker}</Kicker>
              <div style={{ fontWeight: 600, fontSize: "clamp(20px,2.4vw,30px)", letterSpacing: "-0.02em" }}>{t.marches.bidderTitle}</div>
              <p style={{ margin: "9px 0 0", fontSize: 14.5, color: "var(--c-30)", lineHeight: 1.55 }}>{t.marches.bidderLead}</p>
            </div>
            <Link href={route(lang, NAV.contact)} className="btn btn--primary" style={{ whiteSpace: "nowrap", padding: "16px 26px" }}>{t.marches.bidderCta} →</Link>
          </Reveal>

          <RevealGroup className="grid-4" style={{ marginTop: 1 }} gap={0.045}>
            {candidature.map((c, i) => (
              <RevealItem key={c.n} className="cell step-card" style={{ padding: "26px 22px", minHeight: 192, display: "flex", flexDirection: "column" }}>
                <div className="step-card__head">
                  <span className="step-card__icon"><Icon name={CANDIDATURE_ICONS[i]} size={26} /></span>
                  <span className="mono step-card__n">{c.n}</span>
                </div>
                <h4 style={{ margin: "16px 0 0", fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{pick(c.titre, lang)}</h4>
                <p style={{ margin: "9px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "var(--c-60)" }}>{pick(c.desc, lang)}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </div>
  );
}
