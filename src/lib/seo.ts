import type { Metadata } from "next";
import type { Lang } from "./pick";
import { LOCALES } from "./params";
import { dict } from "@/content/i18n";

/* ============================================================================
   Métadonnées de page du site public — source unique.

   Pourquoi un utilitaire et non un bloc recopié dans chaque page :

   · Next fusionne les métadonnées SUPERFICIELLEMENT. Une page qui déclare son
     `openGraph` remplace celui du layout en entier : `siteName`, `locale` et
     l'image de partage disparaissaient dès qu'une page posait son propre titre.
     Ici, chaque page reçoit un `openGraph` et un `twitter` COMPLETS.

   · À l'inverse, une page qui ne déclarait RIEN héritait du canonical et des
     hreflang de l'accueil, et se présentait donc aux moteurs comme un doublon
     de `/fr`. Le layout ne porte plus d'adresse (cf. app/[lang]/layout.tsx) :
     c'est ici, et seulement ici, qu'une page déclare la sienne.

   Les chemins s'écrivent SANS préfixe de langue (`NAV.contact`,
   `${NAV.actualites}/${slug}`) — la même convention que `NAV` et `route()`.
   Ils restent relatifs : `metadataBase`, posé par le layout, les rend absolus.
   ========================================================================== */

/** Nom du site tel qu'il paraît dans les aperçus de partage. */
const SITE_NAME = "UGPTN";

/** Locale Open Graph de chaque langue. Anglais britannique : c'est l'orthographe
    des textes EN du site (« programme », « organisation »). */
const OG_LOCALE: Record<Lang, string> = { fr: "fr_FR", en: "en_GB" };

/** Langue vers laquelle pointe `x-default` : la version de référence du site. */
const LANGUE_PAR_DEFAUT: Lang = "fr";

export type ImagePartage = { url: string; alt?: string; width?: number; height?: number };

export type OptionsPage = {
  lang: Lang;
  /** Chemin SANS préfixe de langue : "" pour l'accueil, `NAV.contact`, etc. */
  path: string;
  /**
   * Titre de la page. Une chaîne passe par le gabarit du layout (« · UGPTN ») ;
   * `{ absolute }` le contourne, pour l'accueil ou une page dont le titre
   * nomme déjà l'Unité.
   */
  title: string | { absolute: string };
  description?: string;
  /** Visuel propre (article, événement, album). À défaut : l'image du site. */
  images?: ImagePartage[];
  type?: "website" | "article";
  /**
   * Chemin de chaque version linguistique, quand il diffère d'une langue à
   * l'autre (articles et événements traduits portent leur propre slug). Seules
   * les langues listées sont annoncées : déclarer une traduction qui n'existe
   * pas tromperait les moteurs autant que les lecteurs. Par défaut, le même
   * `path` sous chaque langue.
   */
  chemins?: Partial<Record<Lang, string>>;
  /**
   * `false` : aucune alternative de langue. Pour une page dont l'équivalent
   * dans l'autre langue n'est pas la même page (une page 3 de liste, par ex.).
   */
  alternatesLangue?: boolean;
  /** Chaîne de requête du canonical, sans « ? » (pagination : "page=2"). */
  query?: string;
  /** Raccourci : `noindex, follow`. Ignoré si `robots` est fourni. */
  noindex?: boolean;
  robots?: Metadata["robots"];
  /** Champs Open Graph propres aux articles (dates, rubrique, mots-clés). */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
  authors?: Metadata["authors"];
};

/**
 * Image de partage par défaut d'une langue : un PNG statique de
 * `public/partage/`, un par langue.
 *
 * Statique plutôt que généré (`opengraph-image.tsx` + `next/og`) : la route
 * générée échouait dans `next dev` (« Input buffer contains unsupported image
 * format », conversion du SVG de satori par `sharp`), et rien ne garantissait
 * qu'elle tienne mieux au build. Une image qui ne change qu'avec l'identité du
 * site n'a pas besoin d'être recalculée : un fichier servi par le CDN répond
 * toujours, sans fonction. Pour la refaire, reprendre le gabarit de l'ancienne
 * route (historique git) et l'exporter en 1200 × 630.
 */
export function imageParDefaut(lang: Lang): ImagePartage {
  return { url: `/partage/ugptn-${lang}.png`, width: 1200, height: 630, alt: dict(lang).seo.imageAlt };
}

/** Texte brut d'un titre de page, gabarit du layout compris. */
function titreComplet(title: OptionsPage["title"]): string {
  return typeof title === "string" ? `${title} · ${SITE_NAME}` : title.absolute;
}

/** Métadonnées complètes d'une page publique (cf. en-tête du module). */
export function metaPage(o: OptionsPage): Metadata {
  const suffixe = o.query ? `?${o.query}` : "";
  const canonical = `/${o.lang}${o.chemins?.[o.lang] ?? o.path}${suffixe}`;

  let languages: Record<string, string> | undefined;
  if (o.alternatesLangue !== false) {
    const chemins: Partial<Record<Lang, string>> =
      o.chemins ?? Object.fromEntries(LOCALES.map((l) => [l, o.path]));
    languages = {};
    for (const l of LOCALES) {
      const c = chemins[l];
      if (c !== undefined) languages[l] = `/${l}${c}`;
    }
    // x-default : la version française si elle existe, sinon la page elle-même.
    languages["x-default"] = languages[LANGUE_PAR_DEFAUT] ?? canonical;
  }

  const titrePartage = titreComplet(o.title);
  const images = o.images?.length ? o.images : [imageParDefaut(o.lang)];
  const type = o.type ?? "website";
  const autres = LOCALES.filter((l) => l !== o.lang && (!languages || languages[l]));

  return {
    title: o.title,
    description: o.description,
    ...(o.authors ? { authors: o.authors } : {}),
    alternates: { canonical, ...(languages ? { languages } : {}) },
    openGraph: {
      type,
      url: canonical,
      title: titrePartage,
      description: o.description,
      siteName: SITE_NAME,
      locale: OG_LOCALE[o.lang],
      alternateLocale: autres.map((l) => OG_LOCALE[l]),
      images,
      ...(type === "article" && o.article ? o.article : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: titrePartage,
      description: o.description,
      images: images.map((i) => ({ url: i.url, alt: i.alt })),
    },
    ...(o.robots ? { robots: o.robots } : o.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
