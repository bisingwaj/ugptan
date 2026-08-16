import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { composantes } from "@/content/data";
import { composantesDetail } from "@/content/composantes-detail";
import { NAV, route } from "@/lib/routes";
import { PageHero } from "@/components/ui/PageHero";
import { FilAriane } from "@/components/ui/FilAriane";
import { CtaFin } from "@/components/ui/CtaFin";
import { Kicker } from "@/components/ui/Kicker";
import { CompCard } from "@/components/composantes/CompCard";
import { CompChaine } from "@/components/composantes/CompChaine";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const c = dict(lang).comp;
  const path = `/${lang}${NAV.composantes}`;
  return {
    title: c.titre,
    description: c.metaDesc,
    alternates: {
      canonical: path,
      languages: { fr: `/fr${NAV.composantes}`, en: `/en${NAV.composantes}` },
    },
    openGraph: { title: c.titre, description: c.metaDesc, url: path, type: "website" },
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
        crumb={
          <FilAriane
            label={t.lbl.ariane}
            items={[
              { label: t.nav.accueil, href: route(lang) },
              { label: t.nav.projet, href: route(lang, NAV.projet) },
              { label: c.titre },
            ]}
          />
        }
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

      {/* Lecture transversale — les dépendances entre composantes.
          Cette section remplace un tableau qui relistait les cinq mêmes
          composantes juste sous les cartes, avec un titre qui paraphrasait le
          chapeau du héros. */}
      <section className="section section--grey">
        <div className="section__inner">
          <Reveal>
            <Kicker>{c.liensLabel}</Kicker>
            <h2 className="h2--sm comp-h2">{c.liensTitle}</h2>
            <p className="lead comp-lead">{c.liensLead}</p>
          </Reveal>
          <CompChaine lang={lang} />
        </div>
      </section>

      <CtaFin
        titre={t.projet.ctaTitle}
        lead={t.projet.ctaLead}
        liens={[
          { href: route(lang, NAV.projet), label: t.nav.projet },
          { href: route(lang, NAV.marches), label: t.cta.marches },
          { href: route(lang, NAV.resultats), label: t.nav.resultats },
        ]}
      />
    </div>
  );
}
