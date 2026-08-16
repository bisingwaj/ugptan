/**
 * Vocabulaire du module « Histoires & impact ».
 *
 * ⚠️ Aucun import : ce module est lu par les formulaires clients de la console,
 * par les gardes serveur, par la couche de lecture publique et par les
 * composants d'affichage. Les valeurs reproduisent volontairement les enums du
 * schéma Prisma — les deux doivent rester alignées.
 *
 * ─── Le gabarit gouverne tout le reste ───────────────────────────────────────
 *
 * Une section porte un GABARIT (`ImpactLayout`). C'est lui qui décide :
 *   · du dessin de ses entrées, côté site (cf. src/components/impact/) ;
 *   · des champs que le formulaire demande et de leur INTITULÉ, côté console
 *     (cf. `CHAMPS_ITEM` plus bas) ;
 *   · de ce qui rend une traduction publiable (cf. `itemTraduit`).
 *
 * Les colonnes du schéma sont génériques — `surtitre`, `titre`, `texte`,
 * `texteSecondaire` — parce que cinq colonnes nommées par leur rôle couvrent
 * cinq blocs, là où cinq tables spécialisées demanderaient cinq modules. Ce
 * fichier est le seul endroit où l'on traduit « le champ `surtitre` d'un
 * témoignage » en « Rôle & lieu ». Ailleurs, personne n'a à le savoir.
 */

/* -------------------------------------------------------------------------- */
/* Statut de publication                                                       */
/* -------------------------------------------------------------------------- */

export const IMPACT_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type ImpactStatut = (typeof IMPACT_STATUSES)[number];

export const isImpactStatut = (value: string): value is ImpactStatut =>
  (IMPACT_STATUSES as readonly string[]).includes(value);

export const IMPACT_STATUT_LABEL: Record<ImpactStatut, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publiée",
};

export const IMPACT_STATUT_HINT: Record<ImpactStatut, string> = {
  DRAFT: "Visible de la seule console. La section n'apparaît pas sur le site.",
  PUBLISHED: "En ligne, à l'emplacement choisi et dans les langues traduites.",
};

/** Libellés au masculin, pour les entrées. */
export const IMPACT_ITEM_STATUT_LABEL: Record<ImpactStatut, string> = {
  DRAFT: "Masquée",
  PUBLISHED: "Affichée",
};

/* -------------------------------------------------------------------------- */
/* Emplacements                                                                */
/* -------------------------------------------------------------------------- */

export const IMPACT_EMPLACEMENTS = [
  "ACCUEIL_IMPACT",
  "ACCUEIL_HISTOIRES",
  "RESULTATS_DIALOGUES",
  "RESULTATS_HISTOIRES",
  "PROJET_CHANGEMENTS",
  "PROJET_JALONS",
  "UGPTN_ENGAGEMENT",
  "UGPTN_MANDAT",
  "UGPTN_PRINCIPES",
  "UGPTN_ORGANISATION",
  "UGPTN_METHODE",
  "UGPTN_EQUIPE",
  "UGPTN_QUESTIONS",
  "PROJET_CONTEXTE",
  "PROJET_POUR_QUI",
  "PROJET_COMPOSANTES",
  "PROJET_RESULTATS",
  "PROJET_QUESTIONS",
] as const;
export type ImpactEmplacement = (typeof IMPACT_EMPLACEMENTS)[number];

export const isImpactEmplacement = (value: string): value is ImpactEmplacement =>
  (IMPACT_EMPLACEMENTS as readonly string[]).includes(value);

/* -------------------------------------------------------------------------- */
/* Répartition entre les modules de la console                                 */
/* -------------------------------------------------------------------------- */

/**
 * Le moteur est unique, les écrans sont trois : « Histoires & impact »,
 * « L'UGPTN » et « Le projet ». Ce qui les sépare est l'EMPLACEMENT, pas la
 * table : une section n'appartient donc jamais à deux modules, et chacun n'en
 * liste que les siennes.
 *
 * ⚠️ C'est aussi la table d'autorisation. La permission d'une section suit son
 * emplacement, et non l'écran depuis lequel la modification est demandée : sans
 * quoi un compte autorisé sur le seul module « Le projet » pourrait, en forgeant
 * un identifiant, réécrire une section de l'accueil.
 */
export const IMPACT_MODULES = ["histoires", "ugptn", "projet"] as const;
export type ImpactModule = (typeof IMPACT_MODULES)[number];

export const EMPLACEMENT_MODULE: Record<ImpactEmplacement, ImpactModule> = {
  ACCUEIL_IMPACT: "histoires",
  ACCUEIL_HISTOIRES: "histoires",
  RESULTATS_DIALOGUES: "histoires",
  RESULTATS_HISTOIRES: "histoires",
  /* Ces deux-là restent au module « Histoires & impact » bien qu'ils vivent sur
     la page du Projet : ce sont des blocs de récit, dessinés comme ceux de
     l'accueil, et la rédaction les tient avec eux depuis l'origine. Les
     déplacer ferait disparaître de leur écran deux sections déjà administrées. */
  PROJET_CHANGEMENTS: "histoires",
  PROJET_JALONS: "histoires",

  UGPTN_ENGAGEMENT: "ugptn",
  UGPTN_MANDAT: "ugptn",
  UGPTN_PRINCIPES: "ugptn",
  UGPTN_ORGANISATION: "ugptn",
  UGPTN_METHODE: "ugptn",
  UGPTN_EQUIPE: "ugptn",
  UGPTN_QUESTIONS: "ugptn",

  PROJET_CONTEXTE: "projet",
  PROJET_POUR_QUI: "projet",
  PROJET_COMPOSANTES: "projet",
  PROJET_RESULTATS: "projet",
  PROJET_QUESTIONS: "projet",
};

/** Emplacements d'un module, dans l'ordre de lecture de la page. */
export const emplacementsDuModule = (module: ImpactModule): ImpactEmplacement[] =>
  IMPACT_EMPLACEMENTS.filter((emplacement) => EMPLACEMENT_MODULE[emplacement] === module);

/** Page publique qui accueille l'emplacement — sert à grouper la liste. */
export const IMPACT_PAGE_LABEL: Record<ImpactEmplacement, string> = {
  ACCUEIL_IMPACT: "Accueil",
  ACCUEIL_HISTOIRES: "Accueil",
  RESULTATS_DIALOGUES: "Résultats",
  RESULTATS_HISTOIRES: "Résultats",
  PROJET_CHANGEMENTS: "Le projet",
  PROJET_JALONS: "Le projet",
  UGPTN_ENGAGEMENT: "L'UGPTN",
  UGPTN_MANDAT: "L'UGPTN",
  UGPTN_PRINCIPES: "L'UGPTN",
  UGPTN_ORGANISATION: "L'UGPTN",
  UGPTN_METHODE: "L'UGPTN",
  UGPTN_EQUIPE: "L'UGPTN",
  UGPTN_QUESTIONS: "L'UGPTN",
  PROJET_CONTEXTE: "Le projet",
  PROJET_POUR_QUI: "Le projet",
  PROJET_COMPOSANTES: "Le projet",
  PROJET_RESULTATS: "Le projet",
  PROJET_QUESTIONS: "Le projet",
};

export const IMPACT_EMPLACEMENT_LABEL: Record<ImpactEmplacement, string> = {
  ACCUEIL_IMPACT: "Accueil · après les résultats",
  ACCUEIL_HISTOIRES: "Accueil · après les actualités",
  RESULTATS_DIALOGUES: "Résultats · après les vidéos",
  RESULTATS_HISTOIRES: "Résultats · fin de page",
  PROJET_CHANGEMENTS: "Le projet · après le contexte",
  PROJET_JALONS: "Le projet · après les résultats",
  UGPTN_ENGAGEMENT: "L'UGPTN · sous le héros",
  UGPTN_MANDAT: "L'UGPTN · le mandat",
  UGPTN_PRINCIPES: "L'UGPTN · ce qui borne ses décisions",
  UGPTN_ORGANISATION: "L'UGPTN · l'organisation interne",
  UGPTN_METHODE: "L'UGPTN · la méthode",
  UGPTN_EQUIPE: "L'UGPTN · l'équipe",
  UGPTN_QUESTIONS: "L'UGPTN · questions & glossaire",
  PROJET_CONTEXTE: "Le projet · le contexte",
  PROJET_POUR_QUI: "Le projet · pour qui",
  PROJET_COMPOSANTES: "Le projet · aperçu des composantes",
  PROJET_RESULTATS: "Le projet · aperçu des résultats",
  PROJET_QUESTIONS: "Le projet · questions citoyennes",
};

export const IMPACT_EMPLACEMENT_HINT: Record<ImpactEmplacement, string> = {
  ACCUEIL_IMPACT: "Entre la grille des indicateurs ODP et la carte des provinces.",
  ACCUEIL_HISTOIRES: "Entre le fil des actualités et les prochaines rencontres.",
  RESULTATS_DIALOGUES: "Entre « Le projet en vidéos » et les témoignages.",
  RESULTATS_HISTOIRES: "Dernier bloc de la page des résultats.",
  PROJET_CHANGEMENTS: "Entre le contexte du Projet et la section « Pour qui ».",
  PROJET_JALONS: "Entre les indicateurs et la foire aux questions citoyenne.",
  UGPTN_ENGAGEMENT: "Premier bloc après le titre de la page : la citation d'engagement.",
  UGPTN_MANDAT: "Entre la citation et les règles qui bornent les décisions.",
  UGPTN_PRINCIPES: "Entre le mandat et l'organisation interne.",
  UGPTN_ORGANISATION: "Entre les principes et la méthode.",
  UGPTN_METHODE: "Entre l'organisation et la grille de l'équipe.",
  UGPTN_EQUIPE: "L'en-tête de la grille des fiches. Les fiches viennent du module « L'équipe ».",
  UGPTN_QUESTIONS: "Dernier bloc de la page, avant la sortie.",
  PROJET_CONTEXTE: "Premier bloc après le titre de la page, avant la frise des jalons.",
  PROJET_POUR_QUI: "Entre le diptyque « Ce que ça change » et l'aperçu des composantes.",
  PROJET_COMPOSANTES: "L'en-tête de l'aperçu. Les cinq composantes viennent du Projet.",
  PROJET_RESULTATS: "L'en-tête de l'aperçu. Les indicateurs viennent du cadre de résultats.",
  PROJET_QUESTIONS: "Dernier bloc de la page, avant la sortie.",
};

/**
 * Chemin de la page publique concernée — lien « Voir sur le site ».
 *
 * ⚠️ Ces chemins DOIVENT rester alignés sur `NAV.resultats`, `NAV.projet` et
 * `NAV.ugptn` (`lib/routes.ts`), qui en est la source. Ils sont recopiés plutôt
 * qu'importés pour tenir l'invariant du module — aucun import, cf. l'en-tête.
 */
export const IMPACT_EMPLACEMENT_PATH: Record<ImpactEmplacement, string> = {
  ACCUEIL_IMPACT: "",
  ACCUEIL_HISTOIRES: "",
  RESULTATS_DIALOGUES: "/results",
  RESULTATS_HISTOIRES: "/results",
  PROJET_CHANGEMENTS: "/project",
  PROJET_JALONS: "/project",
  UGPTN_ENGAGEMENT: "/ugptn",
  UGPTN_MANDAT: "/ugptn",
  UGPTN_PRINCIPES: "/ugptn",
  UGPTN_ORGANISATION: "/ugptn",
  UGPTN_METHODE: "/ugptn",
  UGPTN_EQUIPE: "/ugptn",
  UGPTN_QUESTIONS: "/ugptn",
  PROJET_CONTEXTE: "/project",
  PROJET_POUR_QUI: "/project",
  PROJET_COMPOSANTES: "/project",
  PROJET_RESULTATS: "/project",
  PROJET_QUESTIONS: "/project",
};

/* -------------------------------------------------------------------------- */
/* Gabarits                                                                    */
/* -------------------------------------------------------------------------- */

export const IMPACT_LAYOUTS = [
  "STATS",
  "TEMOIGNAGES",
  "CARTES",
  "AVANT_APRES",
  "JALONS",
  "CITATION",
  "ETAPES",
  "PRINCIPES",
  "ENGAGEMENTS",
  "REPERES",
  "POLES",
  "EQUIPE",
  "FAQ",
  "GLOSSAIRE",
  "CONTEXTE",
  "PERSONAS",
  "COMPOSANTES",
  "INDICATEURS",
] as const;
export type ImpactLayout = (typeof IMPACT_LAYOUTS)[number];

export const isImpactLayout = (value: string): value is ImpactLayout =>
  (IMPACT_LAYOUTS as readonly string[]).includes(value);

/**
 * Gabarits qui ne prennent AUCUNE entrée : tout ce qu'ils affichent tient dans
 * l'en-tête de la section, ou vient d'un autre module.
 *
 * La console leur masque la liste des entrées et le bouton d'ajout : proposer
 * d'ajouter une carte à un bloc qui n'en dessine pas laisserait croire à une
 * saisie perdue.
 */
export const LAYOUTS_SANS_ITEMS: readonly ImpactLayout[] = [
  "CITATION",
  "EQUIPE",
  "COMPOSANTES",
  "INDICATEURS",
];

export const layoutSansItems = (layout: ImpactLayout): boolean =>
  LAYOUTS_SANS_ITEMS.includes(layout);

/**
 * Gabarits dont l'en-tête n'est PAS posé au-dessus de la grille, mais dessiné
 * par le bloc lui-même : la citation est un bandeau, le contexte range son titre
 * dans une colonne, l'équipe repousse son chapô à droite du titre, le glossaire
 * fait de son titre le résumé sur lequel on clique.
 *
 * Le rendu commun ne dessine alors pas d'en-tête et transmet les textes au bloc.
 */
export const LAYOUTS_ENTETE_INTEGREE: readonly ImpactLayout[] = [
  "CITATION",
  "CONTEXTE",
  "EQUIPE",
  "GLOSSAIRE",
];

export const enteteIntegree = (layout: ImpactLayout): boolean =>
  LAYOUTS_ENTETE_INTEGREE.includes(layout);

/**
 * Gabarits qui dessinent leur PROPRE bande, `<section>` comprise.
 *
 * Deux blocs du site ne tiennent pas dans le gabarit commun : la citation, qui
 * est une bande d'accent à son rembourrage propre, et le contexte, dont le
 * conteneur interne porte une mise en colonnes. Les y forcer changerait leur
 * dessin ; les en sortir laisse le rendu commun simple.
 *
 * ⚠️ Le fond choisi sur la fiche est alors SANS EFFET : ces blocs imposent le
 * leur. La console le signale plutôt que d'afficher un réglage inopérant.
 */
export const LAYOUTS_AUTONOMES: readonly ImpactLayout[] = ["CITATION", "CONTEXTE"];

export const layoutAutonome = (layout: ImpactLayout): boolean =>
  LAYOUTS_AUTONOMES.includes(layout);

export const IMPACT_LAYOUT_LABEL: Record<ImpactLayout, string> = {
  STATS: "Chiffres d'impact",
  TEMOIGNAGES: "Témoignages",
  CARTES: "Cartes thématiques",
  AVANT_APRES: "Avant / après",
  JALONS: "Frise de jalons",
  CITATION: "Citation en bandeau",
  ETAPES: "Cartes numérotées",
  PRINCIPES: "Règles numérotées",
  ENGAGEMENTS: "Cartes à filet coloré",
  REPERES: "Bandeau de repères",
  POLES: "Organigramme des pôles",
  EQUIPE: "En-tête de la grille d'équipe",
  FAQ: "Questions & réponses",
  GLOSSAIRE: "Glossaire replié",
  CONTEXTE: "Contexte à deux colonnes",
  PERSONAS: "Publics visés",
  COMPOSANTES: "En-tête de l'aperçu des composantes",
  INDICATEURS: "En-tête de l'aperçu des indicateurs",
};

export const IMPACT_LAYOUT_HINT: Record<ImpactLayout, string> = {
  STATS: "Grille de grands chiffres : la valeur, son unité, puis ce qu'elle recouvre.",
  TEMOIGNAGES: "Cartes à portrait cliquable : nom, rôle et lieu, citation, vidéo.",
  CARTES: "Cartes à liseré coloré : thème en accent, titre, description.",
  AVANT_APRES: "Diptyque numéroté : la situation actuelle, puis celle que le Projet vise.",
  JALONS: "Frise verticale : une date, un fait. Les entrées se rangent par date.",
  CITATION: "Bande d'accent : une citation en grand, puis une ligne de références. Sans entrées.",
  ETAPES: "Cinq cartes numérotées : numéro, titre, description. Le numéro passe en pastille sur fond sombre.",
  PRINCIPES: "Trois cartes larges : le numéro d'ordre est calculé, pas saisi.",
  ENGAGEMENTS: "Quatre cartes, chacune surmontée d'un filet de sa couleur.",
  REPERES: "Bandeau de cellules : un chiffre, un libellé. Sert à coiffer une section.",
  POLES: "Une ligne par pôle : responsabilité, mission, sous-rôles, dossier en cours.",
  EQUIPE: "Titre à gauche, chapô à droite. La grille des fiches suit, tenue depuis « L'équipe ». Sans entrées.",
  FAQ: "Questions dépliables, dans l'ordre des entrées.",
  GLOSSAIRE: "Bloc replié : un sigle, ce qu'il recouvre. S'installe sous une foire aux questions.",
  CONTEXTE: "Texte et chiffres à gauche, aplat légendé à droite.",
  PERSONAS: "Cartes à trait d'accent : le public visé, puis ce que le Projet lui apporte.",
  COMPOSANTES: "Titre et bouton, puis les cinq composantes du Projet. Sans entrées.",
  INDICATEURS: "Titre et bouton sur fond sombre, puis les indicateurs ODP. Sans entrées.",
};

/* -------------------------------------------------------------------------- */
/* Fond de section                                                             */
/* -------------------------------------------------------------------------- */

export const IMPACT_THEMES = ["CLAIR", "GRIS", "PALE", "SOMBRE"] as const;
export type ImpactTheme = (typeof IMPACT_THEMES)[number];

export const isImpactTheme = (value: string): value is ImpactTheme =>
  (IMPACT_THEMES as readonly string[]).includes(value);

export const IMPACT_THEME_LABEL: Record<ImpactTheme, string> = {
  CLAIR: "Blanc",
  GRIS: "Gris clair",
  PALE: "Bleu pâle",
  SOMBRE: "Sombre",
};

/**
 * Classe du design system correspondante (cf. `.section--*` dans globals.css).
 * Seule table de conversion : les composants d'affichage la lisent, ils
 * n'écrivent jamais un nom de classe en dur.
 */
export const IMPACT_THEME_CLASS: Record<ImpactTheme, string> = {
  CLAIR: "",
  GRIS: "section--grey",
  PALE: "section--pale",
  SOMBRE: "section--dark",
};

/** Le fond est-il sombre ? Le kicker et les cellules changent de traitement. */
export const themeSombre = (theme: ImpactTheme): boolean => theme === "SOMBRE";

/* -------------------------------------------------------------------------- */
/* Champs d'une entrée, par gabarit                                            */
/* -------------------------------------------------------------------------- */

/** Champs traduisibles d'une entrée. */
export type ChampItem = "surtitre" | "titre" | "texte" | "texteSecondaire";

/** Champs non linguistiques d'une entrée que le gabarit rend pertinents. */
export type ReglageItem = "valeur" | "color" | "videoYt" | "visuel" | "dateAt" | "tags";

type ChampSpec = {
  champ: ChampItem;
  label: string;
  aide?: string;
  placeholder?: string;
  /** Zone de texte plutôt que ligne simple. */
  long?: boolean;
  /** Sans lui, la traduction n'est pas servie au public. */
  requis?: boolean;
};

/**
 * Ce que chaque gabarit demande, dans l'ordre où le formulaire le présente.
 *
 * L'intitulé n'est jamais le nom de la colonne : une rédactrice qui saisit un
 * témoignage lit « Rôle & lieu », pas « surtitre ». C'est ce qui permet à un
 * modèle générique de ne jamais transparaître dans la console.
 */
export const CHAMPS_ITEM: Record<ImpactLayout, ChampSpec[]> = {
  STATS: [
    { champ: "surtitre", label: "Unité", placeholder: "utilisateurs visés", requis: true },
    {
      champ: "texte",
      label: "Ce que le chiffre recouvre",
      placeholder: "— l'ambition d'un Congolais sur trois en ligne à l'horizon du projet.",
      long: true,
      requis: true,
    },
  ],
  TEMOIGNAGES: [
    { champ: "titre", label: "Nom affiché", placeholder: "Esther, 24 ans", requis: true },
    { champ: "surtitre", label: "Rôle & lieu", placeholder: "Étudiante — Goma", requis: true },
    {
      champ: "texte",
      label: "Citation",
      aide: "Les guillemets font partie du texte : le dessin n'en ajoute aucun.",
      placeholder: "« Avant, on se partageait un manuel rare. »",
      long: true,
      requis: true,
    },
  ],
  CARTES: [
    { champ: "surtitre", label: "Thème", placeholder: "Santé", requis: true },
    { champ: "titre", label: "Titre de la carte", requis: true },
    { champ: "texte", label: "Description", long: true, requis: true },
  ],
  AVANT_APRES: [
    { champ: "titre", label: "Intitulé", placeholder: "Démarches administratives", requis: true },
    {
      champ: "texteSecondaire",
      label: "Avant",
      aide: "La situation actuelle, celle que le Projet entend corriger.",
      long: true,
      requis: true,
    },
    {
      champ: "texte",
      label: "Après",
      aide: "Ce que le Projet vise. C'est la ligne mise en valeur dans la carte.",
      long: true,
      requis: true,
    },
  ],
  JALONS: [
    {
      champ: "surtitre",
      label: "Date affichée",
      aide: "Laissée vide, la date du calendrier est mise en forme dans la langue de lecture.",
      placeholder: "T1 2026",
    },
    { champ: "texte", label: "Fait marquant", long: true, requis: true },
  ],

  /* Les quatre gabarits sans entrées gardent une liste vide plutôt qu'une
     absence : `CHAMPS_ITEM[layout]` reste parcourable partout, y compris par
     `itemTraduit`, sans garde particulière au point d'appel. */
  CITATION: [],
  EQUIPE: [],
  COMPOSANTES: [],
  INDICATEURS: [],

  ETAPES: [
    { champ: "titre", label: "Intitulé", placeholder: "Coordination", requis: true },
    { champ: "texte", label: "Ce que recouvre cette fonction", long: true, requis: true },
  ],
  PRINCIPES: [
    { champ: "titre", label: "La règle", placeholder: "Le MEP reste la source de vérité.", requis: true },
    { champ: "texte", label: "Ce qu'elle implique", long: true, requis: true },
  ],
  ENGAGEMENTS: [
    { champ: "titre", label: "Engagement", placeholder: "Transparence", requis: true },
    { champ: "texte", label: "Ce qui se vérifie", long: true, requis: true },
  ],
  REPERES: [
    { champ: "titre", label: "Libellé sous le chiffre", placeholder: "pôles", requis: true },
  ],
  POLES: [
    { champ: "titre", label: "Nom du pôle", placeholder: "Direction", requis: true },
    {
      champ: "surtitre",
      label: "Ce dont il répond",
      aide: "Une ligne, sous le nom.",
      placeholder: "Pilotage, arbitrage, contrôle interne",
      requis: true,
    },
    {
      champ: "texte",
      label: "Sa mission",
      aide: "Une phrase : ce que le pôle fait, pas ce qu'il est.",
      long: true,
      requis: true,
    },
    {
      champ: "texteSecondaire",
      label: "Dossier en cours",
      aide: "Affiché derrière une pastille « En cours ». Vide, la ligne disparaît.",
      placeholder: "Plan de travail glissant 18 mois et reporting bailleurs.",
      long: true,
    },
  ],
  FAQ: [
    { champ: "titre", label: "Question", requis: true },
    { champ: "texte", label: "Réponse", long: true, requis: true },
  ],
  GLOSSAIRE: [
    { champ: "texte", label: "Ce que le sigle recouvre", long: true, requis: true },
  ],
  CONTEXTE: [
    { champ: "surtitre", label: "Unité", aide: "Sous le chiffre, en accent.", placeholder: "kbit/s par habitant" },
    { champ: "texte", label: "Ce que le chiffre recouvre", long: true, requis: true },
  ],
  PERSONAS: [
    { champ: "titre", label: "Public visé", placeholder: "Jeunes & étudiants", requis: true },
    { champ: "texte", label: "Ce que le Projet lui apporte", long: true, requis: true },
  ],
};

/** Réglages non linguistiques pertinents, par gabarit. */
export const REGLAGES_ITEM: Record<ImpactLayout, ReglageItem[]> = {
  STATS: ["valeur", "color"],
  TEMOIGNAGES: ["color", "videoYt", "visuel"],
  CARTES: ["color"],
  AVANT_APRES: ["valeur", "color"],
  JALONS: ["dateAt", "color"],
  CITATION: [],
  EQUIPE: [],
  COMPOSANTES: [],
  INDICATEURS: [],
  ETAPES: ["valeur", "color"],
  /* Pas de « valeur » : le numéro d'une règle est son rang dans la liste. Le
     saisir permettrait d'afficher « 03 » en deuxième position. */
  PRINCIPES: ["color"],
  ENGAGEMENTS: ["color"],
  REPERES: ["valeur"],
  POLES: ["color", "tags"],
  FAQ: [],
  GLOSSAIRE: ["valeur"],
  CONTEXTE: ["valeur", "color"],
  PERSONAS: ["color"],
};

export const reglageActif = (layout: ImpactLayout, reglage: ReglageItem): boolean =>
  REGLAGES_ITEM[layout].includes(reglage);

/** Intitulé du champ « valeur », qui ne dit pas la même chose d'un gabarit à l'autre. */
export const LABEL_VALEUR: Record<ImpactLayout, string> = {
  STATS: "Chiffre affiché",
  TEMOIGNAGES: "Valeur",
  CARTES: "Valeur",
  AVANT_APRES: "Numéro",
  JALONS: "Valeur",
  CITATION: "Valeur",
  ETAPES: "Numéro",
  PRINCIPES: "Valeur",
  ENGAGEMENTS: "Valeur",
  REPERES: "Chiffre du repère",
  POLES: "Valeur",
  EQUIPE: "Valeur",
  FAQ: "Valeur",
  GLOSSAIRE: "Sigle",
  CONTEXTE: "Chiffre affiché",
  PERSONAS: "Valeur",
  COMPOSANTES: "Valeur",
  INDICATEURS: "Valeur",
};

export const AIDE_VALEUR: Record<ImpactLayout, string> = {
  STATS: "Tel qu'il doit s'afficher, séparateurs compris : « 30 M », « 1 000 ».",
  TEMOIGNAGES: "",
  CARTES: "",
  AVANT_APRES: "Deux chiffres, dans l'ordre de lecture : « 01 », « 02 ».",
  JALONS: "",
  CITATION: "",
  ETAPES: "Deux chiffres, dans l'ordre de lecture : « 01 », « 02 ».",
  PRINCIPES: "",
  ENGAGEMENTS: "",
  REPERES: "Tel qu'il doit s'afficher : « 05 », « 2025 », « IDA · AFD ».",
  POLES: "",
  EQUIPE: "",
  GLOSSAIRE: "Le sigle seul, sans point : « MEP », « ANO ».",
  CONTEXTE: "Tel qu'il doit s'afficher, séparateurs compris : « 6,56 », « 2,3 M ».",
  FAQ: "",
  PERSONAS: "",
  COMPOSANTES: "",
  INDICATEURS: "",
};

/**
 * Une traduction d'entrée est-elle servie au public ?
 *
 * La règle dépend du gabarit, parce que le champ qui porte le sens n'est pas le
 * même : un jalon sans texte n'a rien à dire, un témoignage sans citation non
 * plus, mais un jalon n'a pas de titre et n'en aura jamais. Exiger partout les
 * mêmes champs interdirait la moitié des blocs.
 */
export function itemTraduit(
  layout: ImpactLayout,
  valeurs: Partial<Record<ChampItem, string | null>>,
): boolean {
  return CHAMPS_ITEM[layout]
    .filter((spec) => spec.requis)
    .every((spec) => (valeurs[spec.champ] ?? "").trim().length > 0);
}

/**
 * Une traduction de section est-elle servie ?
 *
 * Un kicker suffit : la frise des jalons de la page « Le projet » n'affiche que
 * cela, et lui imposer un titre ajouterait au site un H2 que son dessin n'a
 * jamais porté.
 */
export const sectionTraduite = (valeurs: { kicker?: string | null; titre?: string | null }): boolean =>
  (valeurs.kicker ?? "").trim().length > 0 || (valeurs.titre ?? "").trim().length > 0;
