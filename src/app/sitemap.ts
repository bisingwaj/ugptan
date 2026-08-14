import type { MetadataRoute } from "next";
import { SITE_URL, ALL_PATHS } from "@/lib/site";
import { NAV } from "@/lib/routes";
import { urlsArticles } from "@/lib/actus/query";
import { urlsEvenements } from "@/lib/events/query";
import { urlsDocuments } from "@/lib/docs/query";
import { LOCALES } from "@/lib/params";

/**
 * Servi sur /sitemap.xml — toutes les pages localisées (FR + EN), plus une
 * entrée par article, par événement et par publication rédigée.
 *
 * Les trois étant écrits en base, le fichier est régénéré périodiquement et
 * invalidé à chaque publication (cf. lib/actus/cache.ts, lib/events/cache.ts,
 * lib/docs/cache.ts). Aucune de ces lectures ne lève : un sitemap amputé vaut
 * mieux qu'une erreur sur cette route.
 *
 * Les documents qui ne sont qu'un FICHIER n'y figurent pas : ils n'ont pas
 * d'adresse propre — leur fiche est un panneau de la liste, déjà annoncée.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const pages = ALL_PATHS.map((path) => {
    const isHome = path === "/fr" || path === "/en";
    const isNews = path.endsWith(NAV.actualites) || path.endsWith(NAV.evenements);
    return {
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: (isHome || isNews ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: isHome ? 1 : 0.7,
    };
  });

  const [lignesArticles, lignesEvenements, lignesDocuments] = await Promise.all([
    urlsArticles(),
    urlsEvenements(),
    urlsDocuments(),
  ]);

  const articles = lignesArticles.map((article) => ({
    url: `${SITE_URL}/${article.locale}${NAV.actualites}/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "monthly" as const,
    // Sous les pages de navigation : un article est une feuille, pas une porte
    // d'entrée du site.
    priority: 0.6,
  }));

  const evenements = lignesEvenements.map((evenement) => ({
    url: `${SITE_URL}/${evenement.locale}${NAV.evenements}/${evenement.slug}`,
    lastModified: evenement.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Une entrée par langue : le slug d'une publication est commun aux deux, et
  // les deux adresses existent réellement (cf. le modèle `Document` au schéma).
  const documents = lignesDocuments.flatMap((doc) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${NAV.ressources}/${doc.slug}`,
      lastModified: doc.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [...pages, ...articles, ...evenements, ...documents];
}
