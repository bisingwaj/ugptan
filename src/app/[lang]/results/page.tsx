import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { intermediaires } from "@/content/data";
import { NAV, route } from "@/lib/routes";
import { Kicker } from "@/components/ui/Kicker";
import { FlowLines, FlowLinesDefs } from "@/components/ui/FlowLines";
import { PageHero } from "@/components/ui/PageHero";
import { FilAriane } from "@/components/ui/FilAriane";
import { CtaFin } from "@/components/ui/CtaFin";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { SectionsImpact } from "@/components/impact/SectionsImpact";
import { GrilleODP } from "@/components/resultats/GrilleODP";

/** Cache aligné sur l'accueil : la page sert deux blocs administrés depuis la
 *  console (dialogues sectoriels, témoignages), invalidés par les écritures du
 *  module (cf. lib/impact/cache.ts). */
export const revalidate = 120;

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const r = dict(lang).resultats;
  const path = `/${lang}${NAV.resultats}`;
  return {
    /* Le titre d'onglet reprenait le libellé de menu (« Résultats ») pendant
       que le H1 disait autre chose : deux noms pour une page. */
    title: r.titre,
    description: r.metaDesc,
    alternates: {
      canonical: path,
      languages: { fr: `/fr${NAV.resultats}`, en: `/en${NAV.resultats}` },
    },
    openGraph: { title: r.titre, description: r.metaDesc, url: path, type: "website" },
  };
}

export default async function ResultatsPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const r = t.resultats;

  return (
    <div>
      <FlowLinesDefs />
      <PageHero
        crumb={
          <FilAriane
            label={t.lbl.ariane}
            items={[
              { label: t.nav.accueil, href: route(lang) },
              { label: t.nav.projet, href: route(lang, NAV.projet) },
              { label: r.titre },
            ]}
          />
        }
        title={r.heroTitle}
        lead={r.heroLead}
      />

      {/* ODP — version complète. C'est ici, et nulle part ailleurs désormais,
          que se lisent le point de départ et la part de femmes. */}
      <section className="section section--dark">
        <div className="section__inner">
          <Reveal><Kicker light>{r.odpLabel}</Kicker></Reveal>
          <div style={{ marginTop: 14 }}>
            <GrilleODP lang={lang} variante="complet" />
          </div>
        </div>
      </section>

      {/* Intermédiaires — seule occurrence du site, après allègement de
          l'accueil et de « Le Projet ». */}
      <section className="section">
        <div className="section__inner">
          <Reveal><Kicker>{r.interLabel}</Kicker></Reveal>
          <RevealGroup gap={0.05} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)", marginTop: 16 }}>
            {intermediaires.map((x, i) => (
              <RevealItem fade key={i} className="cell cell--fx cell--light" style={{ padding: "22px" }}><FlowLines variant={i} /><div className="mono" style={{ fontWeight: 600, fontSize: 24, color: "var(--cell-fg)" }}><span className="stat__approx">{t.lbl.approx}</span>{x.value}<span style={{ fontSize: 13, color: "var(--cell-acc)", marginLeft: 4 }}>{x.unit}</span></div><div style={{ fontSize: 12.5, color: "var(--cell-mut)", marginTop: 8, lineHeight: 1.45 }}>{pick(x.text, lang)}</div></RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* La section « Le projet en vidéos » a été retirée : cinq cartes portant
          un bouton de lecture et une durée devant des films qui ne sont pas
          fournis, et dont le clic menait, pour C5, à une ancre inexistante. */}

      {/* Dialogues sectoriels — administré depuis la console. */}
      <SectionsImpact emplacement="RESULTATS_DIALOGUES" lang={lang} />

      {/* Histoires — la collection de référence des témoignages, dont l'accueil
          reprend les entrées (cf. le module « Histoires & impact »). */}
      <SectionsImpact emplacement="RESULTATS_HISTOIRES" lang={lang} />

      <CtaFin
        titre={r.ctaTitle}
        lead={r.ctaLead}
        liens={[
          { href: route(lang, NAV.composantes), label: t.comp.titre },
          { href: route(lang, NAV.transparence), label: t.nav.transparence },
          { href: route(lang, NAV.projet), label: t.nav.projet },
        ]}
      />
    </div>
  );
}
