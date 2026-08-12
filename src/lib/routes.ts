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

/**
 * Groupe de navigation : une entrée d'en-tête qui ouvre un sous-menu.
 * `labelKey` réutilise le libellé de la page mère (t.nav) ; les enfants
 * portent, si besoin, un libellé abrégé propre au sous-menu (t.navSub).
 */
export type NavGroupKey = "gprojet" | "gunite" | "gtransparence" | "gactus";
export type NavGroup = { key: NavGroupKey; labelKey: NavKey; children: NavItem[] };
export type NavNode = NavItem | NavGroup;

export const isGroup = (node: NavNode): node is NavGroup => "children" in node;

/** Toutes les feuilles d'un arbre, groupes aplatis. */
export const navLeaves = (nodes: NavNode[]): NavItem[] =>
  nodes.flatMap((n) => (isGroup(n) ? n.children : [n]));

/**
 * Arbre unique de la navigation publique : l'en-tête desktop en tire ses
 * menus déroulants, le tiroir mobile ses sections, le pied de page ses
 * colonnes. Une page ajoutée ici apparaît donc aux trois endroits.
 */
const G_PROJET: NavGroup = {
  key: "gprojet",
  labelKey: "projet",
  children: [
    { slug: NAV.projet, key: "projet" },
    { slug: NAV.composantes, key: "composantes" },
    { slug: NAV.resultats, key: "resultats" },
  ],
};

const G_UNITE: NavGroup = {
  key: "gunite",
  labelKey: "ugptn",
  children: [
    { slug: NAV.ugptn, key: "ugptn" },
    { slug: NAV.gouvernance, key: "gouvernance" },
  ],
};

const G_TRANSPARENCE: NavGroup = {
  key: "gtransparence",
  labelKey: "transparence",
  children: [
    { slug: NAV.transparence, key: "transparence" },
    { slug: NAV.ressources, key: "ressources" },
    { slug: NAV.mgp, key: "mgp" },
  ],
};

const G_ACTUS: NavGroup = {
  key: "gactus",
  labelKey: "actualites",
  children: [
    { slug: NAV.actualites, key: "actualites" },
    { slug: NAV.evenements, key: "evenements" },
  ],
};

export const NAV_TREE: NavNode[] = [
  G_PROJET,
  G_UNITE,
  /* Les marchés restent au premier niveau : c'est la porte d'entrée des
     soumissionnaires, elle ne se cache pas derrière un sous-menu. */
  { slug: NAV.marches, key: "marches" },
  G_TRANSPARENCE,
  G_ACTUS,
  { slug: NAV.contact, key: "contact" },
];

/** Tiroir mobile : l'arbre, précédé de l'accueil que porte le logo en desktop. */
export const NAV_DRAWER: NavNode[] = [{ slug: NAV.accueil, key: "accueil" }, ...NAV_TREE];

/**
 * Pied de page : les quatre groupes en colonnes. Les feuilles de premier
 * niveau de l'en-tête (marchés, contact) y rejoignent la colonne qui les
 * concerne, pour qu'aucune page publique ne reste sans lien en bas de page.
 */
export const NAV_FOOTER: NavGroup[] = [
  G_PROJET,
  { ...G_UNITE, children: [...G_UNITE.children, { slug: NAV.contact, key: "contact" }] },
  { ...G_TRANSPARENCE, children: [{ slug: NAV.marches, key: "marches" }, ...G_TRANSPARENCE.children] },
  G_ACTUS,
];
