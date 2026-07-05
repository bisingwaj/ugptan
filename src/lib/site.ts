import { NAV } from "./routes";
import { LOCALES } from "./params";

/**
 * Origine publique canonique du site (sans slash final).
 * Surchargée par environnement via NEXT_PUBLIC_SITE_URL (Vercel/Netlify) —
 * utilisée pour toutes les URL absolues : metadataBase, sitemap, robots, Open Graph.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.ugpatn.cd").replace(/\/+$/, "");

/** Tous les chemins publics localisés (source unique pour le sitemap). */
export const ALL_PATHS: string[] = LOCALES.flatMap((lang) =>
  Object.values(NAV).map((slug) => `/${lang}${slug}`),
);
