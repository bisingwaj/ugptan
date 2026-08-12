/**
 * Libellés de la console d'administration — français uniquement.
 *
 * Volontairement séparé de `content/i18n.ts` : la console n'est pas bilingue
 * (décision produit), son vocabulaire est interne, et `dict()` reconstruit un
 * objet de contenu public à chaque appel.
 */
import type { Permission } from "@/lib/auth/permissions";

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
    emailLabel: "Adresse électronique",
    passwordLabel: "Mot de passe",
    submit: "Se connecter",
    submitting: "Vérification…",
    noSignup: "Les comptes sont créés par un administrateur. Aucune inscription n'est ouverte.",
    biddersPrompt: "Vous êtes soumissionnaire ?",
    biddersLink: "Accéder à votre espace",
  },

  shell: {
    signedInAs: "Connecté",
    logout: "Déconnexion",
    soon: "bientôt",
    console: "Console",
    collapse: "Replier la barre",
    expand: "Déplier la barre",
  },

  home: {
    title: "Tableau de bord",
    lead: "Squelette de la console. Les modules de gestion arrivent progressivement.",
    kpisTitle: "Indicateurs",
    modulesTitle: "Modules",
    modulesLead: "Périmètre cible du CMS, tel que spécifié dans le guide de développement (§8.2).",
    empty: "—",
  },

  users: {
    title: "Utilisateurs",
    lead: "Comptes autorisés à accéder à la console. Seul un administrateur peut en créer, en modifier ou en supprimer.",
    listTitle: "Comptes",
    createTitle: "Nouveau compte",
    createLead: "Le mot de passe est haché avant enregistrement ; il ne sera plus jamais affiché.",
    editTitle: "Modifier le compte",
    empty: "Aucun compte pour le moment.",

    fieldEmail: "Adresse électronique",
    fieldName: "Nom affiché",
    fieldNameHint: "facultatif",
    fieldPassword: "Mot de passe",
    fieldPasswordEdit: "Nouveau mot de passe",
    fieldPasswordEditHint: "laisser vide pour conserver l'actuel",
    fieldRole: "Rôle",
    fieldPermissions: "Modules supplémentaires",
    fieldPermissionsHint: "Le rôle ouvre déjà un socle de modules. Cochez ici les accès accordés en plus.",
    fieldPermissionsAdmin: "Un administrateur accède à tous les modules : aucun ajout n'est nécessaire.",

    create: "Créer le compte",
    creating: "Création…",
    save: "Enregistrer",
    saving: "Enregistrement…",
    deactivate: "Désactiver",
    activate: "Réactiver",
    remove: "Supprimer",
    removeConfirm: "Supprimer définitivement ce compte ? Cette action est irréversible.",
    back: "Retour à la liste",

    colUser: "Compte",
    colRole: "Rôle",
    colStatus: "État",
    colLastLogin: "Dernière connexion",
    colActions: "",

    statusActive: "Actif",
    statusInactive: "Désactivé",
    neverConnected: "Jamais",
    you: "vous",

    createdOk: "Compte créé.",
    updatedOk: "Compte mis à jour.",
    deletedOk: "Compte supprimé.",
    activatedOk: "Compte réactivé.",
    deactivatedOk: "Compte désactivé.",
  },
} as const;

/** Un module de la console. `key` est aussi la permission qui l'ouvre. */
export type AdminNavItem = {
  key: Permission;
  label: string;
  /** Absent tant que le module n'est pas implémenté. */
  slug?: string;
  soon?: boolean;
};

export type AdminNavSection = {
  key: string;
  label: string;
  items: AdminNavItem[];
};

/**
 * Les modules du back-office (reference/UGPTN-GUIDE-DEV.md §8.2), groupés par
 * section. Le groupement n'est pas cosmétique : à quatorze entrées, une liste
 * plate oblige à relire toute la barre pour situer un module.
 *
 * La barre latérale masque les sections dont aucun module n'est autorisé, donc
 * l'ordre ici détermine aussi ce que voit un compte à droits réduits.
 */
export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    key: "pilotage",
    label: "Pilotage",
    items: [{ key: "tableau-de-bord", label: "Tableau de bord", slug: "/tableau-de-bord" }],
  },
  {
    key: "marches",
    label: "Marchés & recours",
    items: [
      { key: "marches", label: "Appels d'offres", soon: true },
      { key: "soumissionnaires", label: "Soumissionnaires", soon: true },
      { key: "mgp", label: "Plaintes (MGP)", soon: true },
    ],
  },
  {
    key: "contenus",
    label: "Contenus",
    items: [
      { key: "actualites", label: "Actualités", soon: true },
      { key: "documents", label: "Documents & transparence", soon: true },
      { key: "medias", label: "Médias", soon: true },
      { key: "evenements", label: "Événements", soon: true },
      { key: "histoires", label: "Histoires & impact", soon: true },
      { key: "videos", label: "Vidéos & galerie", soon: true },
      { key: "ressources", label: "Ressources & publications", soon: true },
    ],
  },
  {
    key: "institution",
    label: "Institution",
    items: [
      { key: "gouvernance", label: "Gouvernance", soon: true },
      { key: "projet", label: "Le projet", soon: true },
    ],
  },
  {
    key: "administration",
    label: "Administration",
    items: [
      { key: "utilisateurs", label: "Utilisateurs", slug: "/utilisateurs" },
      { key: "reglages", label: "i18n & réglages", soon: true },
    ],
  },
];

/** Vue à plat, pour les écrans qui listent les modules sans les grouper. */
export const ADMIN_NAV: AdminNavItem[] = ADMIN_NAV_SECTIONS.flatMap((section) => section.items);

/** Libellé d'un module par sa permission — cases à cocher du module Utilisateurs. */
export const MODULE_LABEL: Record<string, string> = Object.fromEntries(
  ADMIN_NAV.map((item) => [item.key, item.label]),
);

/** KPIs du tableau de bord (§8.2.1) — valeurs branchées au jalon Prisma. */
export const ADMIN_KPIS = [
  { key: "avis", label: "Avis ouverts" },
  { key: "plaintes", label: "Plaintes en cours" },
  { key: "articles", label: "Articles publiés" },
  { key: "events", label: "Événements à venir" },
];
