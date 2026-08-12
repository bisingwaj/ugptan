import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { composantes } from "@/content/data";
import { composantesDetail } from "@/content/composantes-detail";
import { NAV, route } from "@/lib/routes";
import { compColor, onComp } from "@/lib/comp";
import { PageHero } from "@/components/ui/PageHero";
import { Kicker } from "@/components/ui/Kicker";
import { CompCard } from "@/components/composantes/CompCard";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang).comp;
  return {
    title: t.titre,
    description: t.indexLead,
    alternates: { canonical: `/${lang}${NAV.composantes}` },
  };
}

export default async function ComposantesPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const c = t.comp;
  const detailOf = (code: string) => composantesDetail.find((d) => d.code === code);

  return (
    <div>
      <PageHero
        crumb={`UGPTN / ${c.titre}`}
        title={c.indexTitle}
        lead={c.indexLead}
      />

      {/* Cartes */}
      <section className="section">
        <div className="section__inner">
          <RevealGroup className="comp-index" gap={0.05}>
            {composantes.map((comp) => (
              <RevealItem key={comp.code}>
                <CompCard comp={comp} detail={detailOf(comp.code)} lang={lang} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Lecture transversale : ce que chaque composante apporte */}
      <section className="section section--grey">
        <div className="section__inner">
          <Reveal>
            <Kicker>{t.sec.composantes}</Kicker>
            <h2 className="h2--sm comp-h2">{t.comp.rowsNote}</h2>
          </Reveal>
          <RevealGroup className="comp-table" gap={0.04}>
            {composantes.map((comp) => {
              const d = detailOf(comp.code);
              return (
                <RevealItem key={comp.code}>
                  <Link href={`${route(lang, NAV.composantes)}/${comp.code.toLowerCase()}`} className="comp-table__row">
                    <span className="mono comp-table__code" style={{ background: compColor(comp.code), color: onComp(comp.code) }}>
                      {comp.code}
                    </span>
                    <span className="comp-table__t">
                      <strong>{pick(comp.titre, lang)}</strong>
                      <span className="comp-table__d">{d ? pick(d.titreLong, lang) : pick(comp.desc, lang)}</span>
                    </span>
                    <span className="mono comp-table__n">
                      {comp.sous.length > 0 ? `${comp.sous.length} ${c.sousTitle.toLowerCase()}` : "—"}
                    </span>
                    <span className="mono comp-table__m">
                      {d && d.projets.length > 0 ? `${d.projets.length} ${c.projets}` : "—"}
                    </span>
                    <span className="mono comp-table__go" aria-hidden>→</span>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      {/* CTA */}
      <section className="section--dark comp-pager-wrap">
        <div className="section__inner comp-cta-split">
          <Reveal>
            <h2 className="h2--sm" style={{ maxWidth: "16ch" }}>{t.projet.ctaTitle}</h2>
            <p className="comp-cta__lead">{t.projet.ctaLead}</p>
          </Reveal>
          <div className="comp-cta">
            <Link href={route(lang, NAV.projet)} className="btn btn--primary">
              {t.nav.projet} <span className="arrow">→</span>
            </Link>
            <Link href={route(lang, NAV.marches)} className="btn btn--on-dark">{t.cta.marches}</Link>
            <Link href={route(lang, NAV.resultats)} className="btn btn--on-dark">{t.nav.resultats}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
