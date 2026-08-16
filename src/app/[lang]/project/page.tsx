import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { composantes } from "@/content/data";
import { projetPersonas, citoyenFaq } from "@/content/carbon";
import { NAV, route } from "@/lib/routes";
import { Kicker } from "@/components/ui/Kicker";
import { Accordion } from "@/components/ui/Accordion";
import { PageHero } from "@/components/ui/PageHero";
import { FilAriane } from "@/components/ui/FilAriane";
import { CtaFin } from "@/components/ui/CtaFin";
import { CompRow } from "@/components/composantes/CompRow";
import { GrilleODP } from "@/components/resultats/GrilleODP";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { SectionsImpact } from "@/components/impact/SectionsImpact";

/** Cache aligné sur l'accueil : la page sert deux blocs administrés depuis la
 *  console (avant/après, frise des jalons), invalidés par les écritures du
 *  module (cf. lib/impact/cache.ts). */
export const revalidate = 120;

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const p = dict(lang).projet;
  const path = `/${lang}${NAV.projet}`;
  return {
    title: p.titre,
    description: p.metaDesc,
    alternates: {
      canonical: path,
      languages: { fr: `/fr${NAV.projet}`, en: `/en${NAV.projet}` },
    },
    openGraph: { title: p.titre, description: p.metaDesc, url: path, type: "website" },
  };
}

export default async function ProjetPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const p = t.projet;
  const faq = citoyenFaq.map((f) => ({ q: pick(f.q, lang), r: pick(f.r, lang) }));

  return (
    <div>
      <PageHero
        crumb={
          <FilAriane
            label={t.lbl.ariane}
            items={[{ label: t.nav.accueil, href: route(lang) }, { label: p.titre }]}
          />
        }
        title={p.h1}
        lead={p.lead}
      />

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
          {/* L'aplat portait un badge « C1 » qui n'était cliquable nulle part et
              n'annonçait rien de ce que la section dit. */}
          <div style={{ aspectRatio: "4/3", background: "linear-gradient(140deg, #0a1330 0%, #16315f 55%, #0f62fe 130%)", border: "1px solid var(--c-20)", position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", padding: 22 }}>
            <span className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,.9)", lineHeight: 1.5 }}>{lang === "en" ? "Fibre rollout · digital inclusion" : "Déploiement fibre optique · inclusion numérique"}</span>
          </div>
        </div>
      </section>

      {/* Jalons — la frise administrée depuis la console porte désormais aussi
          les deux signatures de financement, qu'une section « Engagements
          fondateurs » réaffichait en dur huit cents pixels plus bas. */}
      <SectionsImpact emplacement="PROJET_JALONS" lang={lang} />

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

      {/* Composantes — aperçu. Le détail des sous-composantes vit sur l'index
          et sur chaque page dédiée : le recopier ici retirait toute raison de
          cliquer. */}
      <section className="section section--grey">
        <div className="section__inner">
          <Reveal style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20, margin: "0 0 40px" }}>
            <div style={{ maxWidth: 640 }}>
              <Kicker>{p.compLabel}</Kicker>
              <h2 className="h2--sm" style={{ margin: 0 }}>{t.comp.indexTitle}</h2>
              <p className="lead" style={{ marginTop: 16 }}>{p.compLead}</p>
            </div>
            <Link href={route(lang, NAV.composantes)} className="btn btn--outline" style={{ whiteSpace: "nowrap" }}>{t.comp.seeAll} <span className="arrow">→</span></Link>
          </Reveal>
          <RevealGroup style={{ borderTop: "2px solid var(--c-black)" }} gap={0.045}>
            {composantes.map((comp) => (
              <RevealItem key={comp.code}>
                <CompRow comp={comp} lang={lang} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Résultats — aperçu seulement. Le point de départ, la part de femmes et
          les sept indicateurs intermédiaires sont l'apport propre de la page
          « Résultats », qui ne recevait jusqu'ici qu'un seul lien du site. */}
      <section className="section section--dark">
        <div className="section__inner">
          <Reveal style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20, margin: "0 0 40px" }}>
            <div style={{ maxWidth: 680 }}>
              <Kicker light>{p.mesureLabel}</Kicker>
              <h2 className="h2--sm" style={{ margin: 0 }}>{p.mesureTitle}</h2>
            </div>
            <Link href={route(lang, NAV.resultats)} className="btn btn--on-dark" style={{ whiteSpace: "nowrap" }}>{t.cta.resultats} <span className="arrow">→</span></Link>
          </Reveal>
          <GrilleODP lang={lang} variante="apercu" />
        </div>
      </section>

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

      <CtaFin
        titre={p.ctaTitle}
        lead={p.ctaLead}
        liens={[
          { href: route(lang, NAV.marches), label: t.cta.marches },
          { href: route(lang, NAV.actualites), label: t.sec.actus },
          { href: route(lang, NAV.mgp), label: t.cta.mgp },
        ]}
      />
    </div>
  );
}
