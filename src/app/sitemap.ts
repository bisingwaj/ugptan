import type { MetadataRoute } from "next";
import { SITE_URL, ALL_PATHS } from "@/lib/site";

/** Served at /sitemap.xml — toutes les pages localisées (FR + EN). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ALL_PATHS.map((path) => {
    const isHome = path === "/fr" || path === "/en";
    const isNews = path.endsWith("/actualites") || path.endsWith("/evenements");
    return {
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: isHome || isNews ? "weekly" : "monthly",
      priority: isHome ? 1 : 0.7,
    };
  });
}
