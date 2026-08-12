/**
 * Libellés de la console d'administration — français uniquement.
 *
 * Volontairement séparé de `content/i18n.ts` : la console n'est pas bilingue
 * (décision produit), son vocabulaire est interne, et `dict()` reconstruit un
 * objet de contenu public à chaque appel.
 */

export const ADMIN = {
  brand: "UGPTN",
  console: "Console d'administration",

  login: {
    kicker: "Console d'administration",
    heroTitle: "Gestion du contenu du site UGPTN",
    benefits: [
      "Appels d'offres, actualités et documents",
      "Médias, événements et ressources",
      "Plaintes MGP et suivi des délais",
    ],
    accessNote: "Accès restreint · journalisation",
    title: "Connexion",
    lead: "Espace réservé à l'équipe UGPTN.",
    passwordLabel: "Mot de passe",
    submit: "Se connecter",
    submitting: "Vérification…",
  },

  shell: {
    signedInAs: "Connecté",
    logout: "Déconnexion",
    soon: "bientôt",
  },

  home: {
    title: "Tableau de bord",
    lead: "Squelette de la console. Les modules de gestion arrivent progressivement.",
    kpisTitle: "Indicateurs",
    modulesTitle: "Modules",
    modulesLead: "Périmètre cible du CMS, tel que spécifié dans le guide de développement (§8.2).",
    empty: "—",
  },
} as const;

export type AdminNavItem = {
  key: string;
  label: string;
  /** Absent tant que le module n'est pas implémenté. */
  slug?: string;
  soon?: boolean;
};

/** Les 14 modules du back-office (reference/UGPTN-GUIDE-DEV.md §8.2). */
export const ADMIN_NAV: AdminNavItem[] = [
  { key: "tableau-de-bord", label: "Tableau de bord", slug: "/tableau-de-bord" },
  { key: "marches", label: "Appels d'offres", soon: true },
  { key: "soumissionnaires", label: "Soumissionnaires", soon: true },
  { key: "actualites", label: "Actualités", soon: true },
  { key: "documents", label: "Documents & transparence", soon: true },
  { key: "medias", label: "Médias", soon: true },
  { key: "evenements", label: "Événements", soon: true },
  { key: "histoires", label: "Histoires & impact", soon: true },
  { key: "videos", label: "Vidéos & galerie", soon: true },
  { key: "ressources", label: "Ressources & publications", soon: true },
  { key: "gouvernance", label: "Gouvernance", soon: true },
  { key: "projet", label: "Le projet", soon: true },
  { key: "mgp", label: "Plaintes (MGP)", soon: true },
  { key: "reglages", label: "i18n & réglages", soon: true },
];

/** KPIs du tableau de bord (§8.2.1) — valeurs branchées au jalon Prisma. */
export const ADMIN_KPIS = [
  { key: "avis", label: "Avis ouverts" },
  { key: "plaintes", label: "Plaintes en cours" },
  { key: "articles", label: "Articles publiés" },
  { key: "events", label: "Événements à venir" },
];
