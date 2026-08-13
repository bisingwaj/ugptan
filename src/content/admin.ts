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

  grievances: {
    title: "Plaintes (MGP)",
    lead: "Dossiers déposés par le formulaire public du mécanisme de gestion des plaintes. Chaque dossier porte un numéro de référence communiqué au plaignant, qui lui sert à suivre son avancement depuis le site.",
    listTitle: "Dossiers",
    empty: "Aucune plainte reçue pour le moment.",
    emptyFiltered: "Aucun dossier ne correspond à ce filtre.",
    back: "Retour aux plaintes",

    filterAll: "Tous",
    filterOpen: "En cours",
    filterUnassigned: "Non affectés",
    filterOverdue: "Hors délai",
    filterLabel: "Filtrer",

    colRef: "Référence",
    colSubmitted: "Reçue le",
    colCategory: "Catégorie",
    colStatus: "Statut",
    colStage: "Étape",
    colAssignee: "Responsable",
    colDeadline: "Échéance",

    closedOn: "Clôturé le",
    unassigned: "Non affecté",
    anonymous: "Anonyme",
    named: "Nominative",
    overdue: "Hors délai",
    dueIn: "j restants",
    lateBy: "j de retard",

    kpiTotal: "Dossiers",
    kpiNew: "Nouvelles",
    kpiOpen: "En cours",
    kpiOverdue: "Hors délai",

    identityTitle: "Plaignant",
    identityAnonymous: "Dépôt anonyme : aucun nom n'a été communiqué. Les coordonnées éventuellement laissées permettent malgré tout de recontacter la personne.",
    identityNone: "Aucune coordonnée : cette personne ne peut pas être recontactée. Le suivi public par numéro de référence est son seul retour.",
    fieldName: "Nom complet",
    fieldEmail: "Adresse électronique",
    fieldPhone: "Téléphone",
    fieldProvince: "Province",
    fieldLang: "Langue de dépôt",
    write: "Écrire",
    call: "Appeler",

    caseTitle: "Plainte",
    descriptionTitle: "Faits rapportés",
    attachmentsTitle: "Pièces annoncées",
    attachmentsNote: "Le formulaire enregistre le nom et le poids des pièces annoncées par le plaignant ; les fichiers eux-mêmes ne sont pas hébergés à ce stade. Redemandez-les par le canal de contact du dossier.",
    attachmentsEmpty: "Aucune pièce annoncée.",

    workflowTitle: "Qualification & traitement",
    workflowLead: "Statut, étape, priorité et responsable. Chaque changement est inscrit à l'historique, avec son auteur et son horodatage.",
    fieldStatus: "Statut",
    fieldStage: "Étape de la pipeline",
    fieldPriority: "Priorité",
    fieldAssignee: "Responsable du dossier",
    assigneeHint: "Comptes actifs disposant du module Plaintes.",
    save: "Enregistrer",
    saving: "Enregistrement…",

    noteTitle: "Note interne",
    noteLead: "Observations de travail. Ces notes ne quittent jamais la console : elles n'apparaissent ni dans le suivi public, ni dans les échanges avec le plaignant.",
    noteField: "Note",
    noteSubmit: "Ajouter la note",

    messageTitle: "Message au plaignant",
    messageLead: "Ce texte s'affiche tel quel dans le suivi public du dossier, dès son enregistrement. Rédigez-le pour être lu par la personne concernée, sans donnée relative à un tiers.",
    messageField: "Message publié",
    messageSubmit: "Publier dans le suivi",
    messageSubmitting: "Publication…",

    contactTitle: "Journaliser un contact",
    contactLead: "L'échange a lieu par téléphone, courriel ou en présentiel ; le dossier en garde la trace.",
    contactChannel: "Canal",
    contactSummary: "Ce qu'il en ressort",
    contactSubmit: "Enregistrer l'échange",
    contactChannels: ["Téléphone", "Courriel", "Entretien", "Point focal", "Courrier"],

    historyTitle: "Historique du dossier",
    historyLead: "Toutes les actions, dans l'ordre. Rien n'y est modifiable.",
    historyPublic: "publié",
    historyEmpty: "Aucune action enregistrée.",
    by: "par",
  },
} as const;

/**
 * Module « Actualités ».
 *
 * Séparé de l'objet `ADMIN` : le module compte à lui seul plus de libellés que
 * tout le reste de la console, et il est lu par des composants clients (fiche
 * d'article, éditeur) qu'on ne veut pas voir embarquer le vocabulaire des
 * autres écrans.
 */
export const ADMIN_ACTUS = {
  title: "Actualités",
  lead: "Communiqués, décisions et jalons publiés sur le site. Chaque article existe en français et en anglais ; une langue non traduite est signalée et n'est jamais servie au public.",

  /* --- Liste --------------------------------------------------------------- */
  nouveau: "Nouvel article",
  listeVide: "Aucun article pour le moment.",
  listeVideFiltre: "Aucun article ne correspond à ce filtre.",
  rechercher: "Rechercher un titre…",
  filtrer: "Filtrer",
  reinitialiser: "Tout afficher",
  tousStatuts: "Tous les statuts",
  toutesCategories: "Toutes les catégories",

  colArticle: "Article",
  colStatut: "État",
  colLangues: "Langues",
  colCategorie: "Catégorie",
  colDate: "Publication",
  colActions: "",

  jamaisPublie: "Non daté",
  une: "À la une",

  publier: "Publier",
  depublier: "Dépublier",
  dupliquer: "Dupliquer",
  supprimer: "Supprimer",
  supprimerConfirm: "Supprimer définitivement cet article et toutes ses traductions ? Cette action est irréversible.",
  modifier: "Modifier",
  retourListe: "Retour aux actualités",

  creeOk: "Article créé. Complétez-le puis publiez-le.",
  copieOk: "Copie créée en brouillon.",
  supprimeOk: "Article supprimé.",

  /* --- Onglets & fiche ----------------------------------------------------- */
  tradPresente: "traduit",
  tradManquante: "à traduire",
  aucuneLangue: "Renseignez au moins un titre pour enregistrer.",

  champTitre: "Titre",
  champTitreAide: "Il sert de titre H1 sur la page publique et de titre par défaut dans les moteurs de recherche.",
  champSlug: "Adresse de la page",
  champResume: "Résumé",
  champResumePlaceholder: "Deux phrases qui disent ce que l'article apporte.",
  champResumeAide: "Affiché sur les cartes et dans les partages. Laissé vide, il est déduit des premières lignes du corps.",
  champCorps: "Corps de l'article",
  champAlt: "Texte alternatif du visuel",
  champAltAide: "Décrit l'image pour les lecteurs d'écran et quand elle ne se charge pas.",

  seoTitre: "Référencement",
  seoAide: "Renseignés seulement s'ils doivent différer du titre et du résumé.",
  champSeoTitre: "Titre pour les moteurs",
  champSeoTitrePlaceholder: "Reprend le titre de l'article",
  champSeoDesc: "Description pour les moteurs",

  /* --- Réglages ------------------------------------------------------------ */
  blocPublication: "Publication",
  champStatut: "Statut",
  champDate: "Date de publication",
  champDateAide: "Heure de Kinshasa. Une date à venir programme la parution.",
  champUne: "Mettre à la une",
  enregistrer: "Enregistrer",
  enregistrement: "Enregistrement…",
  apercu: "Prévisualiser",
  apercuIndisponible: "L'aperçu sera disponible après le premier enregistrement.",

  blocVisuel: "Image de couverture",
  aucunVisuel: "Aucun visuel",
  choisirVisuel: "Choisir un visuel",
  changerVisuel: "Changer",
  retirerVisuel: "Retirer",
  champVideo: "Vidéo associée",
  champVideoAide: "Lien YouTube. Un bouton de lecture apparaît alors sur la page de l'article.",

  blocClassement: "Classement",
  champCategorie: "Catégorie",
  sansCategorie: "Sans catégorie",
  gererCategories: "Gérer les catégories et les étiquettes →",
  champTags: "Étiquettes",
  aucunTag: "Aucune étiquette enregistrée.",
  champNouveauxTags: "Créer des étiquettes",
  champNouveauxTagsAide: "Séparées par des virgules. Elles seront créées à l'enregistrement.",
  champComposantes: "Composantes rattachées",
  champComposantesAide: "L'article remonte alors dans le bloc « Actualités » des pages de composante concernées.",

  blocAuteur: "Auteur",
  champCompte: "Compte de la console",
  sansCompte: "Aucun",
  champSignature: "Signature affichée",
  champSignatureAide: "Prime sur le compte. Utile pour signer au nom d'un service.",
  champFonction: "Fonction",
  champLieu: "Lieu",

  /* --- Taxonomies ---------------------------------------------------------- */
  taxoTitle: "Catégories & étiquettes",
  taxoLead: "Référentiels partagés par tous les articles. Une catégorie classe, une étiquette relie.",
  categoriesTitle: "Catégories",
  categoriesLead: "Une seule par article. Elles alimentent les filtres de la page publique.",
  categoriesVide: "Aucune catégorie.",
  etiquettesTitle: "Étiquettes",
  etiquettesLead: "Autant que nécessaire par article.",
  etiquettesVide: "Aucune étiquette.",
  champNomFr: "Libellé français",
  champNomEn: "Libellé anglais",
  champNomEnAide: "Laissé vide, le libellé français est repris.",
  champCouleur: "Couleur",
  champCouleurAide: "Hexadécimal (#0f62fe). Vide : l'accent du site.",
  champPosition: "Ordre",
  ajouter: "Ajouter",
  colUsage: "Articles",
  supprimerCategorieConfirm: "Supprimer cette catégorie ? Les articles concernés resteront en ligne, sans catégorie.",
  supprimerTagConfirm: "Supprimer cette étiquette ? Elle sera retirée des articles qui la portent.",

  /* --- Médias -------------------------------------------------------------- */
  mediasTitle: "Médias",
  mediasLead: "Visuels des articles. Les fichiers téléversés sont conservés en base et servis par le site ; les médias externes ne sont référencés que par leur adresse.",
  mediasVide: "La bibliothèque est vide.",
  mediasTeleverser: "Téléverser un fichier",
  mediasExterne: "Référencer une image distante",
  mediasUrl: "Adresse de l'image",
  mediasAltFr: "Texte alternatif (français)",
  mediasAltEn: "Texte alternatif (anglais)",
  mediasLegende: "Légende",
  mediasEnregistrer: "Enregistrer",
  mediasSupprimer: "Supprimer",
  mediasSupprimerConfirm: "Supprimer ce média ? Les images déjà insérées dans le corps d'un article deviendraient des liens morts.",
  mediasUsage: "Couverture de",
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
      { key: "mgp", label: "Plaintes (MGP)", slug: "/plaintes" },
    ],
  },
  {
    key: "contenus",
    label: "Contenus",
    items: [
      { key: "actualites", label: "Actualités", slug: "/actualites" },
      { key: "documents", label: "Documents & transparence", soon: true },
      { key: "medias", label: "Médias", slug: "/medias" },
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
