import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { jalons } from "@/content/data";
import { Kicker } from "@/components/ui/Kicker";
import { ActualitesClient } from "@/components/actus/ActualitesClient";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return { title: dict(asLang(params.lang)).nav.actualites };
}

export default async function ActualitesPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  return (
    <div>
      <PageHero crumb={`UGPTN / ${t.sec.actus}`} title={t.actus.heroTitle} lead={t.actus.heroLead} />

      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(56px,7vw,90px)" }}>
        <div className="section__inner">
          <ActualitesClient lang={lang} />

          <div style={{ marginTop: "clamp(48px,6vw,84px)" }}>
            <Reveal>
              <Kicker>{t.actus.timeline}</Kicker>
            </Reveal>
            <RevealGroup style={{ borderLeft: "2px solid var(--c-20)", marginLeft: 8, marginTop: 20 }} gap={0.045}>
              {jalons.map((j, i) => (
                <RevealItem key={i} style={{ position: "relative", padding: "0 0 30px 36px" }}>
                  <span style={{ position: "absolute", left: -7, top: 3, width: 12, height: 12, background: "var(--ac)", border: "2px solid #fff" }} />
                  <div className="mono" style={{ fontSize: 13, color: "var(--ac)", fontWeight: 500 }}>{j.date}</div>
                  <div style={{ fontSize: 16, marginTop: 5, maxWidth: 560, lineHeight: 1.4 }}>{pick(j.text, lang)}</div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>
    </div>
  );
}
