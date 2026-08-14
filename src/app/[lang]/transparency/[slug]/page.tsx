import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { meta } from "@/content/data";
import { SITE_URL } from "@/lib/site";
import { NAV } from "@/lib/routes";
import { htmlToText, truncate } from "@/lib/html/sanitize";
import { documentsLies, getDocument, type DocVue } from "@/lib/docs/query";
import { DocumentVue } from "@/components/docs/DocumentVue";

/**
 * Cinq minutes de cache, comme la liste (cf. ../page.tsx).
 *
 * Un rapport ne se réécrit pas à la minute, et rien sur cette page ne dépend de
 * l'instant présent. Les écritures de la console invalident en outre
 * explicitement cette route (cf. lib/docs/cache.ts) : une correction paraît au
 * premier rechargement.
 */
export const revalidate = 300;

/**
 * Les publications n'étant pas connues à la compilation, la page est produite à
 * la première demande puis mise en cache. `dynamicParams` est réaffirmé ici : le
 * layout de langue le fixe à `false` pour ses deux locales, ce qui n'a pas de
 * sens pour un segment dont les valeurs naissent en base.
 */
export const dynamicParams = true;

type Params = { params: Promise<{ lang: string; slug: string }> };

/** Description de repli : le chapô, sinon le début du corps. */
const description = (document: DocVue): string =>
  document.description.trim() || truncate(htmlToText(document.contenu), 300);

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const document = await getDocument(lang, params.slug);

  if (!document) {
    return { title: dict(lang).ressources.titre, robots: { index: false, follow: true } };
  }

  const url = `${SITE_URL}${document.chemin}`;
  const image = document.visuel.src
    ? document.visuel.src.startsWith("http")
      ? document.visuel.src
      : `${SITE_URL}${document.visuel.src}`
    : undefined;

  return {
    title: document.titre,
    description: description(document),
    // L'auteur annoncé est celui qui a ÉCRIT — la signature, ou l'organisme
    // producteur à défaut. Jamais le compte qui a saisi la fiche.
    authors: [{ name: document.signature?.nom ?? document.auteur ?? meta.uniteLong }],
    alternates: {
      canonical: `/${lang}${NAV.transparence}/${document.slug}`,
      // Le slug est commun aux deux langues (cf. le modèle `Document`) : les
      // deux alternatives existent toujours, contrairement aux articles dont la
      // traduction porte sa propre adresse.
      languages: {
        fr: `/fr${NAV.transparence}/${document.slug}`,
        en: `/en${NAV.transparence}/${document.slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: document.titre,
      description: description(document),
      url,
      siteName: "UGPTN",
      locale: lang === "en" ? "en_US" : "fr_FR",
      publishedTime: document.dateISO ?? undefined,
      modifiedTime: document.majISO,
      section: document.categorie?.nom,
      images: image ? [{ url: image, alt: document.visuel.alt }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: document.titre,
      description: description(document),
      images: image ? [image] : undefined,
    },
  };
}

export default async function DocumentPage(props: Params) {
  const params = await props.params;
  const lang = asLang(params.lang);

  const document = await getDocument(lang, params.slug);
  if (!document) notFound();

  // Bloc d'accompagnement : son absence appauvrit la fin de page, elle ne doit
  // pas emporter la lecture elle-même. Une base momentanément injoignable coûte
  // donc les pièces liées, pas le rapport.
  const lies = await documentsLies(document, lang, 3).catch(() => []);

  /**
   * Données structurées `Report` — le type que schema.org réserve aux rapports,
   * et qui hérite d'`Article`. Sérialisées ici, avec la publication, plutôt que
   * dans le layout : elles décrivent cette page-ci, et leur contenu vient de la
   * base.
   *
   * `associatedMedia` porte la pièce jointe quand il y en a une : c'est ainsi
   * qu'un moteur comprend qu'un fichier téléchargeable accompagne le texte,
   * sans confondre les deux adresses.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Report",
    headline: document.titre,
    description: description(document),
    datePublished: document.dateISO ?? undefined,
    dateModified: document.majISO,
    inLanguage: lang,
    articleSection: document.categorie?.nom,
    ...(document.reference ? { identifier: document.reference } : {}),
    image: document.visuel.src
      ? [document.visuel.src.startsWith("http") ? document.visuel.src : `${SITE_URL}${document.visuel.src}`]
      : undefined,
    author: document.signature
      ? { "@type": "Person", name: document.signature.nom, ...(document.signature.role ? { jobTitle: document.signature.role } : {}) }
      : { "@type": "Organization", name: document.auteur ?? meta.uniteLong },
    publisher: { "@type": "Organization", name: meta.uniteLong, url: SITE_URL },
    ...(document.fichier
      ? {
          associatedMedia: {
            "@type": "DataDownload",
            contentUrl: document.fichier.url,
            encodingFormat: document.fichier.mime,
            name: document.fichier.nom,
          },
        }
      : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${document.chemin}` },
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
      <DocumentVue document={document} lang={lang} lies={lies} />
    </>
  );
}
