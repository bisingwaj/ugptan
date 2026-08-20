import { NAV } from "./routes";
import { LOCALES } from "./params";

/**
 * Origine publique canonique du site (sans slash final).
 * Surchargée par environnement via NEXT_PUBLIC_SITE_URL (Vercel/Netlify) —
 * utilisée pour toutes les URL absolues : metadataBase, sitemap, robots, Open Graph.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.ugptn.cd").replace(/\/+$/, "");

/**
 * Tous les chemins publics localisés de la NAVIGATION — source unique du
 * sitemap pour les pages fixes.
 *
 * ⚠️ Les pages de composante n'y figurent plus : leurs adresses vivent en base
 * depuis que le module « Le projet » les administre, et une constante calculée
 * à l'import ne peut pas les lire. C'est `app/sitemap.ts` qui les ajoute, avec
 * les articles, les événements, les publications et les albums — tous
 * également écrits en base.
 */
export const ALL_PATHS: string[] = LOCALES.flatMap((lang) =>
  Object.values(NAV).map((slug) => `/${lang}${slug}`),
);
