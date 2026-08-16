import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { NAV, route } from "@/lib/routes";
import { PageHero } from "@/components/ui/PageHero";
import { FilAriane } from "@/components/ui/FilAriane";
import { CtaFin } from "@/components/ui/CtaFin";
import { SectionsImpact } from "@/components/impact/SectionsImpact";

/**
 * La page ne porte plus que sa chrome. Ses blocs viennent de deux modules de la
 * console, et l'ordre de lecture les entremêle :
 *
 *   1. Contexte          module « Le projet »
 *   2. Jalons            module « Histoires & impact »
 *   3. Ce que ça change  module « Histoires & impact »
 *   4. Pour qui          module « Le projet »
 *   5. Composantes       module « Le projet » (en-tête ; les cinq volets sont
 *                        une donnée de structure du Projet)
 *   6. Résultats         module « Le projet » (en-tête ; les indicateurs ODP
 *                        relèvent du cadre de résultats)
 *   7. Questions         module « Le projet »
 *
 * Cache aligné sur l'accueil, invalidé par les écritures du module
 * (cf. lib/impact/cache.ts).
 */
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

      <SectionsImpact emplacement="PROJET_CONTEXTE" lang={lang} />
      <SectionsImpact emplacement="PROJET_JALONS" lang={lang} />
      <SectionsImpact emplacement="PROJET_CHANGEMENTS" lang={lang} />
      <SectionsImpact emplacement="PROJET_POUR_QUI" lang={lang} />
      <SectionsImpact emplacement="PROJET_COMPOSANTES" lang={lang} />
      <SectionsImpact emplacement="PROJET_RESULTATS" lang={lang} />
      <SectionsImpact emplacement="PROJET_QUESTIONS" lang={lang} />

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
