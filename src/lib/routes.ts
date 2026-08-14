import type { Lang } from "./pick";

/** Build a locale-prefixed path. `slug` is "" for home, "/project" otherwise. */
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
 *
 * ⚠️ Deux vocabulaires distincts, à ne pas confondre :
 *   · la CLÉ (`actualites`, `mgp`…) est un identifiant interne. Elle nomme le
 *     libellé traduit dans `t.nav` et ne paraît jamais dans une URL ;
 *   · le SLUG est un pathname, et les pathnames sont en anglais — les mêmes
 *     sous `/fr` et sous `/en`. Le français reste dans les libellés, pas dans
 *     les adresses.
 *
 * Les anciens chemins français restent redirigés en 308 par `src/proxy.ts` :
 * ils ont été indexés et imprimés, les casser coûterait le référencement.
 */
export const NAV: Record<NavKey, string> = {
  accueil: "", projet: "/project", composantes: "/components", ugptn: "/ugptn",
  gouvernance: "/governance",
  marches: "/procurement", transparence: "/transparency", actualites: "/news",
  resultats: "/results", ressources: "/resources", evenements: "/events",
  contact: "/contact", mgp: "/grievances", mgpSuivi: "/grievances/track",
  confidentialite: "/privacy", conditions: "/terms",
};

/**
 * Anciens chemins français → chemin actuel, sans le préfixe de langue.
 *
 * Ces adresses ont été indexées, partagées et imprimées — `/fr/mgp` figure sur
 * les supports du mécanisme de gestion des plaintes. Deux usages, un seul
 * tableau : `src/proxy.ts` en fait des redirections permanentes (308), et
 * `lienPublic` ci-dessous rattrape les chemins encore stockés en base, saisis
 * en console avant le renommage.
 *
 * ⚠️ L'ordre compte : la première entrée qui correspond l'emporte, donc un
 * chemin plus spécifique doit précéder le préfixe qui le contient — sans quoi
 * `/mgp/suivi` deviendrait `/grievances/suivi`.
 */
export const LEGACY_PATHS: readonly (readonly [string, string])[] = [
  ["/actualites/apercu", `${NAV.actualites}/preview`],
  ["/mgp/suivi", NAV.mgpSuivi],
  ["/actualites", NAV.actualites],
  ["/composantes", NAV.composantes],
  ["/conditions", NAV.conditions],
  ["/confidentialite", NAV.confidentialite],
  ["/evenements", NAV.evenements],
  ["/gouvernance", NAV.gouvernance],
  ["/marches", NAV.marches],
  ["/mgp", NAV.mgp],
  ["/projet", NAV.projet],
  ["/ressources", NAV.ressources],
  ["/resultats", NAV.resultats],
  ["/transparence", NAV.transparence],
  /* Hors navigation, donc absente de NAV : la page « Médias » n'est liée nulle
     part et ne figure pas au sitemap. Reprise ici quand même — une adresse a pu
     circuler. */
  ["/medias", "/media"],
];

/**
 * Chemin actuel correspondant à `chemin` (déjà privé de son préfixe de langue).
 * Renvoie l'entrée telle quelle si elle n'a pas d'ancienne forme connue.
 */
export function cheminActuel(chemin: string): string {
  for (const [ancien, actuel] of LEGACY_PATHS) {
    if (chemin === ancien || chemin.startsWith(`${ancien}/`)) {
      return `${actuel}${chemin.slice(ancien.length)}`;
    }
  }
  return chemin;
}

/**
 * Destination publique d'un lien saisi en console.
 *
 * Trois formes admises, dans cet ordre : adresse complète ou `mailto:`/`tel:`,
 * qui partent telles quelles ; chemin interne SANS langue (« /project »), que
 * l'on préfixe ici — le stocker avec la langue enverrait un lecteur anglophone
 * sur la version française ; le reste, rendu inchangé.
 *
 * Le passage par `cheminActuel` n'est pas une politesse : des sections créées
 * avant le renommage portent encore « /projet » en base. Sans lui, le site
 * afficherait des liens qui ne valent que par une redirection.
 */
export function lienPublic(url: string, lang: Lang): string {
  if (/^https?:\/\//i.test(url) || url.startsWith("mailto:") || url.startsWith("tel:")) return url;
  if (!url.startsWith("/")) return url;
  const chemin = cheminActuel(url);
  return `/${lang}${chemin === "/" ? "" : chemin}`;
}

/** Pages légales — reléguées au bandeau bas du pied de page, hors navigation. */
export const NAV_LEGAL: NavItem[] = [
  { slug: NAV.confidentialite, key: "confidentialite" },
  { slug: NAV.conditions, key: "conditions" },
];

/** Page dédiée d'une composante — accepte « C2 » comme « c2 ». */
export const compRoute = (lang: Lang, code: string) =>
  `/${lang}${NAV.composantes}/${code.toLowerCase()}`;

/**
 * Fiche d'un événement.
 *
 * Ici et non dans un composant, contrairement à `cheminArticle` : la grille
 * d'événements est un composant CLIENT (elle porte la demande de
 * participation), et une fonction exportée d'un module `"use client"` ne peut
 * pas être appelée depuis un composant serveur. Ce module, lui, n'a pas de
 * frontière.
 */
export const evenementRoute = (lang: Lang, slug: string) =>
  `/${lang}${NAV.evenements}/${slug}`;

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
