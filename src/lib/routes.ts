import type { Lang } from "./pick";

/** Build a locale-prefixed path. `slug` is "" for home, "/projet" otherwise. */
export const route = (lang: Lang, slug = "") => `/${lang}${slug}`;

export type NavKey =
  | "accueil" | "projet" | "composantes" | "ugptn" | "gouvernance" | "marches" | "transparence"
  | "actualites" | "resultats" | "ressources" | "evenements" | "contact" | "mgp"
  | "mgpSuivi" | "confidentialite" | "conditions";

export type NavItem = { slug: string; key: NavKey };

/**
 * Source unique des chemins publics : `lib/site.ts` en dérive ALL_PATHS, que
 * `app/sitemap.ts` publie tel quel. Toute entrée ici DOIT correspondre à une
 * route existante, sinon le sitemap annonce des 404.
 */
export const NAV: Record<NavKey, string> = {
  accueil: "", projet: "/projet", composantes: "/composantes", ugptn: "/ugptn",
  gouvernance: "/gouvernance",
  marches: "/marches", transparence: "/transparence", actualites: "/actualites",
  resultats: "/resultats", ressources: "/ressources", evenements: "/evenements",
  contact: "/contact", mgp: "/mgp", mgpSuivi: "/mgp/suivi",
  confidentialite: "/confidentialite", conditions: "/conditions",
};

/** Pages légales — reléguées au bandeau bas du pied de page, hors navigation. */
export const NAV_LEGAL: NavItem[] = [
  { slug: NAV.confidentialite, key: "confidentialite" },
  { slug: NAV.conditions, key: "conditions" },
];

/** Page dédiée d'une composante — accepte « C2 » comme « c2 ». */
export const compRoute = (lang: Lang, code: string) =>
  `/${lang}${NAV.composantes}/${code.toLowerCase()}`;

export const NAV_PRIMARY: NavItem[] = [
  { slug: NAV.projet, key: "projet" },
  { slug: NAV.composantes, key: "composantes" },
  { slug: NAV.ugptn, key: "ugptn" },
  { slug: NAV.marches, key: "marches" },
  { slug: NAV.ressources, key: "ressources" },
  { slug: NAV.actualites, key: "actualites" },
];

export const NAV_DRAWER: NavItem[] = [
  { slug: NAV.accueil, key: "accueil" },
  { slug: NAV.projet, key: "projet" },
  { slug: NAV.composantes, key: "composantes" },
  { slug: NAV.ugptn, key: "ugptn" },
  { slug: NAV.gouvernance, key: "gouvernance" },
  { slug: NAV.marches, key: "marches" },
  { slug: NAV.transparence, key: "transparence" },
  { slug: NAV.actualites, key: "actualites" },
  { slug: NAV.resultats, key: "resultats" },
  { slug: NAV.evenements, key: "evenements" },
  { slug: NAV.ressources, key: "ressources" },
  { slug: NAV.contact, key: "contact" },
];

export const NAV_FOOTER: NavItem[] = [
  { slug: NAV.projet, key: "projet" },
  { slug: NAV.composantes, key: "composantes" },
  { slug: NAV.ugptn, key: "ugptn" },
  { slug: NAV.marches, key: "marches" },
  { slug: NAV.actualites, key: "actualites" },
];
