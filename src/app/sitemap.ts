import type { MetadataRoute } from "next";
import { SITE_URL, ALL_PATHS } from "@/lib/site";
import { NAV } from "@/lib/routes";
import { LOCALES } from "@/lib/params";
import { urlsArticles } from "@/lib/actus/query";
import { urlsEvenements } from "@/lib/events/query";
import { urlsDocuments } from "@/lib/docs/query";
import { urlsAlbums } from "@/lib/galerie/query";

/**
 * Servi sur /sitemap.xml — toutes les pages localisées (FR + EN), plus une
 * entrée par article, par événement, par publication rédigée et par album
 * publiés.
 *
 * Les quatre étant écrits en base, le fichier est régénéré périodiquement et
 * invalidé à chaque publication (cf. lib/actus/cache.ts, lib/events/cache.ts,
 * lib/docs/cache.ts, lib/galerie/cache.ts). Aucune de ces lectures ne lève : un
 * sitemap amputé vaut mieux qu'une erreur sur cette route.
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

  const [lignesArticles, lignesEvenements, lignesDocuments, lignesAlbums] = await Promise.all([
    urlsArticles(),
    urlsEvenements(),
    urlsDocuments(),
    urlsAlbums(),
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

  /**
   * Un album vaut une entrée PAR LANGUE, pour la même raison qu'une
   * publication : son slug ne dépend pas de la locale — le module tient ses
   * textes en colonnes bilingues et non en table de traduction —, donc
   * `/fr/gallery/<slug>` et `/en/gallery/<slug>` existent tous deux et servent
   * chacun sa version. Les articles, eux, portent un slug par langue et sont
   * déjà déclinés par leur requête.
   */
  const albums = lignesAlbums.flatMap((album) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${NAV.galerie}/${album.slug}`,
      lastModified: album.updatedAt,
      changeFrequency: "monthly" as const,
      // Sous les pages de navigation : un reportage est une feuille, pas une
      // porte d'entrée du site.
      priority: 0.6,
    })),
  );

  return [...pages, ...articles, ...evenements, ...documents, ...albums];
}
