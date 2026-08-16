import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { meta } from "@/content/data";
import { NAV, route } from "@/lib/routes";
import { PageHero } from "@/components/ui/PageHero";
import { FilAriane } from "@/components/ui/FilAriane";
import { CtaFin } from "@/components/ui/CtaFin";
import { SectionsImpact } from "@/components/impact/SectionsImpact";

/**
 * La page ne porte plus que sa chrome : le héros, le fil d'Ariane, les
 * métadonnées et la sortie. Ses six blocs viennent de la console (module
 * « L'UGPTN »), ou du contenu d'origine tant qu'aucune section n'y est publiée
 * (cf. lib/impact/query.ts) :
 *
 *   1. Engagement        la citation qui ouvre la page
 *   2. Mandat            les cinq fonctions de l'Unité
 *   3. Ce qui borne      les trois règles, puis les engagements
 *   4. Organisation      les repères, puis l'organigramme des pôles
 *   5. Méthode           le cycle répété marché après marché
 *   6. Équipe            l'en-tête ; les fiches viennent du module « L'équipe »
 *   7. Questions         la foire aux questions, puis le glossaire replié
 *
 * Cache aligné sur les autres pages administrées, invalidé par les écritures du
 * module (cf. lib/impact/cache.ts).
 */
export const revalidate = 120;

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const u = dict(lang).ugptn;
  const path = `/${lang}${NAV.ugptn}`;
  return {
    /* `absolute` parce que le gabarit du layout ajoute « · UGPTN » : sur cette
       page-ci, il produirait « L'UGPTN · UGPTN ». */
    title: { absolute: `${u.titre} — ${meta.uniteLong}` },
    description: u.metaDesc,
    alternates: {
      canonical: path,
      languages: { fr: `/fr${NAV.ugptn}`, en: `/en${NAV.ugptn}` },
    },
    openGraph: { title: u.titre, description: u.metaDesc, url: path, type: "website" },
  };
}

export default async function UgptnPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const u = t.ugptn;

  return (
    <div>
      <PageHero
        crumb={
          <FilAriane
            label={t.lbl.ariane}
            items={[{ label: t.nav.accueil, href: route(lang) }, { label: u.titre }]}
          />
        }
        title={u.titre}
        lead={u.lead}
      />

      <SectionsImpact emplacement="UGPTN_ENGAGEMENT" lang={lang} />
      <SectionsImpact emplacement="UGPTN_MANDAT" lang={lang} />
      <SectionsImpact emplacement="UGPTN_PRINCIPES" lang={lang} />
      <SectionsImpact emplacement="UGPTN_ORGANISATION" lang={lang} />
      <SectionsImpact emplacement="UGPTN_METHODE" lang={lang} />
      <SectionsImpact emplacement="UGPTN_EQUIPE" lang={lang} />
      <SectionsImpact emplacement="UGPTN_QUESTIONS" lang={lang} />

      <CtaFin
        titre={u.ctaTitle}
        lead={u.ctaLead}
        liens={[
          { href: route(lang, NAV.gouvernance), label: t.nav.gouvernance },
          { href: route(lang, NAV.marches), label: t.cta.marches },
          { href: route(lang, NAV.contact), label: t.nav.contact },
        ]}
      />
    </div>
  );
}
