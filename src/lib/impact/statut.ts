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
] as const;
export type ImpactEmplacement = (typeof IMPACT_EMPLACEMENTS)[number];

export const isImpactEmplacement = (value: string): value is ImpactEmplacement =>
  (IMPACT_EMPLACEMENTS as readonly string[]).includes(value);

/** Page publique qui accueille l'emplacement — sert à grouper la liste. */
export const IMPACT_PAGE_LABEL: Record<ImpactEmplacement, string> = {
  ACCUEIL_IMPACT: "Accueil",
  ACCUEIL_HISTOIRES: "Accueil",
  RESULTATS_DIALOGUES: "Résultats",
  RESULTATS_HISTOIRES: "Résultats",
  PROJET_CHANGEMENTS: "Le projet",
  PROJET_JALONS: "Le projet",
};

export const IMPACT_EMPLACEMENT_LABEL: Record<ImpactEmplacement, string> = {
  ACCUEIL_IMPACT: "Accueil · après les résultats",
  ACCUEIL_HISTOIRES: "Accueil · après les actualités",
  RESULTATS_DIALOGUES: "Résultats · après les vidéos",
  RESULTATS_HISTOIRES: "Résultats · fin de page",
  PROJET_CHANGEMENTS: "Le projet · après le contexte",
  PROJET_JALONS: "Le projet · après les résultats",
};

export const IMPACT_EMPLACEMENT_HINT: Record<ImpactEmplacement, string> = {
  ACCUEIL_IMPACT: "Entre la grille des indicateurs ODP et la carte des provinces.",
  ACCUEIL_HISTOIRES: "Entre le fil des actualités et les prochaines rencontres.",
  RESULTATS_DIALOGUES: "Entre « Le projet en vidéos » et les témoignages.",
  RESULTATS_HISTOIRES: "Dernier bloc de la page des résultats.",
  PROJET_CHANGEMENTS: "Entre le contexte du Projet et la section « Pour qui ».",
  PROJET_JALONS: "Entre les indicateurs et la foire aux questions citoyenne.",
};

/** Chemin de la page publique concernée — lien « Voir sur le site ». */
export const IMPACT_EMPLACEMENT_PATH: Record<ImpactEmplacement, string> = {
  ACCUEIL_IMPACT: "",
  ACCUEIL_HISTOIRES: "",
  RESULTATS_DIALOGUES: "/resultats",
  RESULTATS_HISTOIRES: "/resultats",
  PROJET_CHANGEMENTS: "/projet",
  PROJET_JALONS: "/projet",
};

/* -------------------------------------------------------------------------- */
/* Gabarits                                                                    */
/* -------------------------------------------------------------------------- */

export const IMPACT_LAYOUTS = ["STATS", "TEMOIGNAGES", "CARTES", "AVANT_APRES", "JALONS"] as const;
export type ImpactLayout = (typeof IMPACT_LAYOUTS)[number];

export const isImpactLayout = (value: string): value is ImpactLayout =>
  (IMPACT_LAYOUTS as readonly string[]).includes(value);

export const IMPACT_LAYOUT_LABEL: Record<ImpactLayout, string> = {
  STATS: "Chiffres d'impact",
  TEMOIGNAGES: "Témoignages",
  CARTES: "Cartes thématiques",
  AVANT_APRES: "Avant / après",
  JALONS: "Frise de jalons",
};

export const IMPACT_LAYOUT_HINT: Record<ImpactLayout, string> = {
  STATS: "Grille de grands chiffres : la valeur, son unité, puis ce qu'elle recouvre.",
  TEMOIGNAGES: "Cartes à portrait cliquable : nom, rôle et lieu, citation, vidéo.",
  CARTES: "Cartes à liseré coloré : thème en accent, titre, description.",
  AVANT_APRES: "Diptyque numéroté : la situation actuelle, puis celle que le Projet vise.",
  JALONS: "Frise verticale : une date, un fait. Les entrées se rangent par date.",
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
export type ReglageItem = "valeur" | "color" | "videoYt" | "visuel" | "dateAt";

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
};

/** Réglages non linguistiques pertinents, par gabarit. */
export const REGLAGES_ITEM: Record<ImpactLayout, ReglageItem[]> = {
  STATS: ["valeur", "color"],
  TEMOIGNAGES: ["color", "videoYt", "visuel"],
  CARTES: ["color"],
  AVANT_APRES: ["valeur", "color"],
  JALONS: ["dateAt", "color"],
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
};

export const AIDE_VALEUR: Record<ImpactLayout, string> = {
  STATS: "Tel qu'il doit s'afficher, séparateurs compris : « 30 M », « 1 000 ».",
  TEMOIGNAGES: "",
  CARTES: "",
  AVANT_APRES: "Deux chiffres, dans l'ordre de lecture : « 01 », « 02 ».",
  JALONS: "",
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
