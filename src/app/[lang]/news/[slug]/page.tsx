import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { meta } from "@/content/data";
import { SITE_URL } from "@/lib/site";
import { NAV } from "@/lib/routes";
import { truncate } from "@/lib/html/sanitize";
import { articlesLies, getArticle, voisins, type ActuVue } from "@/lib/actus/query";
import { ArticleVue } from "@/components/actus/ArticleVue";

/** Même politique de cache que la liste (cf. ../page.tsx). */
export const revalidate = 120;

/**
 * Les articles n'étant pas connus à la compilation, la page est produite à la
 * première demande puis mise en cache. `dynamicParams` est réaffirmé ici :
 * le layout de langue le fixe à `false` pour ses deux locales, ce qui n'a pas
 * de sens pour un segment dont les valeurs naissent en base.
 */
export const dynamicParams = true;

type Params = { params: Promise<{ lang: string; slug: string }> };

/** Description de repli : le résumé, sinon le début du corps. */
const description = (actu: ActuVue): string =>
  actu.seoDescription?.trim() || truncate(actu.excerpt, 300);

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const actu = await getArticle(lang, params.slug);

  if (!actu) return { title: dict(lang).nav.actualites, robots: { index: false, follow: true } };

  const titre = actu.seoTitle?.trim() || actu.title;
  const url = `${SITE_URL}/${actu.langue}${NAV.actualites}/${actu.slug}`;
  const image = actu.visuel.src
    ? actu.visuel.src.startsWith("http") ? actu.visuel.src : `${SITE_URL}${actu.visuel.src}`
    : undefined;

  // `languages` ne liste que les langues RÉELLEMENT traduites : annoncer une
  // alternative qui renverrait le même texte tromperait les moteurs autant que
  // les lecteurs.
  const languages = Object.fromEntries(
    Object.entries(actu.slugs).map(([locale, slug]) => [locale, `/${locale}${NAV.actualites}/${slug}`]),
  );

  return {
    title: titre,
    description: description(actu),
    authors: actu.auteur ? [{ name: actu.auteur.nom }] : [{ name: meta.uniteLong }],
    alternates: { canonical: `/${actu.langue}${NAV.actualites}/${actu.slug}`, languages },
    openGraph: {
      type: "article",
      title: titre,
      description: description(actu),
      url,
      siteName: "UGPTN",
      locale: actu.langue === "en" ? "en_US" : "fr_FR",
      publishedTime: actu.dateISO,
      modifiedTime: actu.updatedISO,
      section: actu.categorie?.nom,
      tags: actu.tags.map((tag) => tag.nom),
      images: image ? [{ url: image, alt: actu.visuel.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: titre,
      description: description(actu),
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArticlePage(props: Params) {
  const params = await props.params;
  const lang = asLang(params.lang);

  const actu = await getArticle(lang, params.slug);
  if (!actu) notFound();

  // Blocs d'accompagnement : leur absence appauvrit la fin de page, elle ne doit
  // pas emporter l'article lui-même. Une base momentanément injoignable coûte
  // donc les articles liés et la navigation, pas la lecture.
  const [lies, adjacents] = await Promise.all([
    articlesLies(actu, lang, 3).catch(() => []),
    voisins(actu, lang).catch(() => ({ precedent: null, suivant: null })),
  ]);

  /**
   * Données structurées `NewsArticle`.
   * Sérialisées ici, avec l'article, plutôt que dans le layout : elles décrivent
   * cette page-ci, et leur contenu vient de la base.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: actu.title,
    description: description(actu),
    datePublished: actu.dateISO,
    dateModified: actu.updatedISO,
    inLanguage: actu.langue,
    articleSection: actu.categorie?.nom,
    keywords: actu.tags.map((tag) => tag.nom).join(", ") || undefined,
    image: actu.visuel.src
      ? [actu.visuel.src.startsWith("http") ? actu.visuel.src : `${SITE_URL}${actu.visuel.src}`]
      : undefined,
    author: { "@type": "Organization", name: actu.auteur?.nom ?? meta.uniteLong },
    publisher: { "@type": "Organization", name: meta.uniteLong, url: SITE_URL },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${actu.langue}${NAV.actualites}/${actu.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Sérialisation d'un objet que nous construisons : aucune chaîne
        // arbitraire n'y entre sans passer par JSON.stringify, qui échappe les
        // séquences dangereuses des valeurs.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ArticleVue
        actu={actu}
        lang={lang}
        lies={lies}
        precedent={adjacents.precedent}
        suivant={adjacents.suivant}
      />
    </>
  );
}
