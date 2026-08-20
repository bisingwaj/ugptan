import type { Lang } from "./pick";

/** Build a locale-prefixed path. `slug` is "" for home, "/project" otherwise. */
export const route = (lang: Lang, slug = "") => `/${lang}${slug}`;

export type NavKey =
  | "accueil" | "projet" | "composantes" | "ugptn" | "gouvernance" | "marches" | "transparence"
  | "soumissionnaires"
  | "actualites" | "resultats" | "evenements" | "galerie" | "contact" | "mgp"
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
  marches: "/procurement",
  /* La porte des entreprises candidates. Elle explique le parcours et renvoie
     vers DigiProcure, qui tient les comptes : une seule base, une seule
     session, une seule règle de mot de passe. */
  soumissionnaires: "/bidders",
  transparence: "/transparency", actualites: "/news",
  resultats: "/results", evenements: "/events",
  galerie: "/gallery",
  contact: "/contact", mgp: "/grievances", mgpSuivi: "/grievances/track",
  confidentialite: "/privacy", conditions: "/terms",
};

/**
 * Anciens chemins → chemin actuel, sans le préfixe de langue.
 *
 * Ces adresses ont été indexées, partagées et imprimées — `/fr/mgp` figure sur
 * les supports du mécanisme de gestion des plaintes. Deux usages, un seul
 * tableau : `src/proxy.ts` en fait des redirections permanentes (308), et
 * `lienPublic` ci-dessous rattrape les chemins encore stockés en base, saisis
 * en console avant le renommage.
 *
 * La table a d'abord servi au passage des chemins français à l'anglais, d'où
 * l'essentiel de son contenu. `/resources` fait exception : c'est un chemin
 * ANGLAIS retiré à la fusion des deux pages documentaires. « Documents
 * publiés » et « Rapports & publications » servaient le même catalogue et le
 * même modèle `Document` — deux adresses pour un seul fonds partageaient le
 * référencement entre elles et obligeaient l'administrateur à deviner sur
 * laquelle sa fiche paraîtrait. Le fonds vit désormais sous `/transparency`,
 * et les liens émis vers `/resources` continuent d'aboutir.
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
  /* Les deux orthographes mènent au même fonds : la française d'avant le
     renommage des chemins, l'anglaise d'avant la fusion. Le préfixe emporte le
     segment qui suit, donc `/resources/<slug>` retrouve sa page de lecture. */
  ["/ressources", NAV.transparence],
  ["/resources", NAV.transparence],
  ["/resultats", NAV.resultats],
  ["/transparence", NAV.transparence],
  /* Hors navigation, donc absente de NAV : la page « Médias » n'est liée nulle
     part et ne figure pas au sitemap. Reprise ici quand même — une adresse a pu
     circuler. */
  ["/medias", "/media"],
];

/**
 * Chemin de ROUTE d'une page publique — la forme attendue par
 * `revalidatePath(..., "page")`, où le segment de langue reste un paramètre.
 *
 * ⚠️ À utiliser SYSTÉMATIQUEMENT dans les modules d'invalidation — les
 * `cache.ts` de chaque module — plutôt que d'écrire le chemin en toutes lettres.
 * La raison n'est pas cosmétique : ces littéraux ont silencieusement cessé de
 * désigner quoi que ce soit au renommage des routes en anglais.
 * `revalidatePath` ne lève PAS sur un chemin inexistant — il n'invalide rien,
 * sans le dire. Une publication paraissait donc à l'expiration du `revalidate`
 * au lieu du premier rechargement, et rien dans les journaux ne le signalait.
 *
 * Dérivés de `NAV`, les chemins suivent désormais tout renommage à venir.
 *
 * `slug` vaut "" pour l'accueil, d'où `/[lang]` sans barre finale. Les segments
 * dynamiques se concatènent, par exemple `NAV.actualites` suivi de « /[slug] ».
 */
export const patronRoute = (slug = "") => `/[lang]${slug}`;

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
 * Page de lecture d'un rapport rédigé en ligne.
 *
 * Ici pour la même raison que ci-dessus : la liste des ressources est un
 * composant client (elle porte le panneau de détail), et ne peut donc pas
 * appeler une fonction exportée d'un module serveur.
 *
 * Le segment est le slug de la pièce, ou son identifiant à défaut : les fiches
 * antérieures à la page de lecture n'ont pas de slug tant qu'elles n'ont pas
 * été réenregistrées, et une adresse en identifiant vaut mieux qu'un lien mort.
 */
export const documentRoute = (lang: Lang, slug: string) =>
  `/${lang}${NAV.transparence}/${slug}`;

/**
 * Groupe de navigation : une entrée d'en-tête qui ouvre un sous-menu.
 * `labelKey` réutilise le libellé de la page mère (t.nav) ; les enfants
 * portent, si besoin, un libellé abrégé propre au sous-menu (t.navSub).
 */
export type NavGroupKey = "gprojet" | "gunite" | "gmarches" | "gtransparence" | "gactus";
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

/**
 * Les marchés, désormais un groupe et non plus une feuille.
 *
 * ⚠️ La note précédente disait de garder les marchés au premier niveau, « porte
 * d'entrée des soumissionnaires ». Elle reste vraie, et c'est pourquoi le
 * GROUPE occupe cette place : son libellé ne bouge pas de l'en-tête. Ce qui
 * change, c'est qu'une entreprise y trouve maintenant DEUX choses — les avis
 * ouverts, et ce qu'il faut faire pour y répondre. La seconde n'existait nulle
 * part dans la navigation, et le bouton qui y menait pointait vers le
 * formulaire de contact.
 */
const G_MARCHES: NavGroup = {
  key: "gmarches",
  labelKey: "marches",
  children: [
    { slug: NAV.marches, key: "marches" },
    { slug: NAV.soumissionnaires, key: "soumissionnaires" },
  ],
};

const G_TRANSPARENCE: NavGroup = {
  key: "gtransparence",
  labelKey: "transparence",
  children: [
    { slug: NAV.transparence, key: "transparence" },
    { slug: NAV.mgp, key: "mgp" },
  ],
};

const G_ACTUS: NavGroup = {
  key: "gactus",
  labelKey: "actualites",
  children: [
    { slug: NAV.actualites, key: "actualites" },
    { slug: NAV.evenements, key: "evenements" },
    /* La galerie tient sa place ici plutôt qu'avec les documents : ce qu'elle
       montre relève de la VIE du projet — chantiers, ateliers, rencontres — au
       même titre qu'un communiqué, non de la production analytique. */
    { slug: NAV.galerie, key: "galerie" },
  ],
};

export const NAV_TREE: NavNode[] = [
  G_PROJET,
  G_UNITE,
  G_MARCHES,
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
  { ...G_TRANSPARENCE, children: [...G_MARCHES.children, ...G_TRANSPARENCE.children] },
  G_ACTUS,
];
