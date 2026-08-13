import type { MetadataRoute } from "next";
import { SITE_URL, ALL_PATHS } from "@/lib/site";
import { NAV } from "@/lib/routes";
import { urlsArticles } from "@/lib/actus/query";

/**
 * Servi sur /sitemap.xml — toutes les pages localisées (FR + EN), plus une
 * entrée par article publié.
 *
 * Les articles étant écrits en base, le fichier est régénéré périodiquement et
 * invalidé à chaque publication (cf. lib/actus/cache.ts). `urlsArticles()` ne
 * lève jamais : un sitemap amputé vaut mieux qu'une erreur sur cette route.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const pages = ALL_PATHS.map((path) => {
    const isHome = path === "/fr" || path === "/en";
    const isNews = path.endsWith("/actualites") || path.endsWith("/evenements");
    return {
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: (isHome || isNews ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: isHome ? 1 : 0.7,
    };
  });

  const articles = (await urlsArticles()).map((article) => ({
    url: `${SITE_URL}/${article.locale}${NAV.actualites}/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "monthly" as const,
    // Sous les pages de navigation : un article est une feuille, pas une porte
    // d'entrée du site.
    priority: 0.6,
  }));

  return [...pages, ...articles];
}
