/**
 * Vocabulaire du module « Le projet » — composantes et cadre de résultats.
 *
 * ⚠️ Aucun import : ce module est lu par les formulaires clients de la console,
 * par les gardes serveur, par la couche de lecture publique et par les
 * composants d'affichage. Les valeurs reproduisent volontairement les enums du
 * schéma Prisma — les deux doivent rester alignées.
 *
 * ─── Le type de bloc gouverne le formulaire ──────────────────────────────────
 *
 * Une composante porte huit listes : ses sous-composantes, les paragraphes de
 * son contexte, les axes de sa problématique, l'appui qui la légitime, ses
 * renvois vers les autres composantes, ses objectifs, ses projets phares, les
 * couches de son écosystème et les points de sa finalité. Toutes vivent dans la
 * même table, distinguées par leur TYPE (cf. `ComposanteBlocType`).
 *
 * Ce fichier est le seul endroit où l'on traduit « le champ `texte` d'un bloc
 * PB_AXE » en « Ce que ce constat recouvre ». Ailleurs, personne n'a à le
 * savoir.
 */

/* -------------------------------------------------------------------------- */
/* Statut de publication                                                       */
/* -------------------------------------------------------------------------- */

export const PROJET_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type ProjetStatut = (typeof PROJET_STATUSES)[number];

export const isProjetStatut = (value: string): value is ProjetStatut =>
  (PROJET_STATUSES as readonly string[]).includes(value);

export const PROJET_STATUT_LABEL: Record<ProjetStatut, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publiée",
};

export const PROJET_STATUT_HINT: Record<ProjetStatut, string> = {
  DRAFT: "Visible de la seule console. La composante n'apparaît pas sur le site.",
  PUBLISHED: "En ligne : sa page dédiée, sa carte d'index et ses lignes d'aperçu.",
};

/** Libellés au masculin, pour les blocs. */
export const PROJET_BLOC_STATUT_LABEL: Record<ProjetStatut, string> = {
  DRAFT: "Masqué",
  PUBLISHED: "Affiché",
};

/* -------------------------------------------------------------------------- */
/* Sections d'une composante                                                   */
/* -------------------------------------------------------------------------- */

export const COMPOSANTE_BLOC_TYPES = [
  "SOUS_COMPOSANTE",
  "CHAPEAU",
  "PB_AXE",
  "PB_APPUI",
  "PB_LIEN",
  "OBJECTIF",
  "PROJET",
  "ECO_COUCHE",
  "FIN_POINT",
] as const;
export type ComposanteBlocType = (typeof COMPOSANTE_BLOC_TYPES)[number];

export const isComposanteBlocType = (value: string): value is ComposanteBlocType =>
  (COMPOSANTE_BLOC_TYPES as readonly string[]).includes(value);

/**
 * SECTIONS de la fiche, dans l'ordre de la page publique.
 *
 * La console range les blocs sous ces sections plutôt que sous leur type brut :
 * la rédaction cherche « la problématique », pas « les blocs PB_AXE ». Une
 * section peut donc porter plusieurs types — la problématique en porte trois,
 * qui s'affichent dans trois colonnes du même bloc.
 */
export const COMPOSANTE_SECTIONS = [
  "identite",
  "mep",
  "problematique",
  "contexte",
  "video",
  "objectifs",
  "projets",
  "ecosysteme",
  "finalite",
] as const;
export type ComposanteSection = (typeof COMPOSANTE_SECTIONS)[number];

export const isComposanteSection = (value: string): value is ComposanteSection =>
  (COMPOSANTE_SECTIONS as readonly string[]).includes(value);

export const COMPOSANTE_SECTION_LABEL: Record<ComposanteSection, string> = {
  identite: "Identité & héros",
  mep: "Données du MEP",
  problematique: "La problématique",
  contexte: "Le contexte",
  video: "Vidéo de présentation",
  objectifs: "Les objectifs",
  projets: "Les projets phares",
  ecosysteme: "L'écosystème",
  finalite: "La finalité",
};

export const COMPOSANTE_SECTION_HINT: Record<ComposanteSection, string> = {
  identite:
    "Le code, l'accent, l'adresse de la page et le héros : titre éditorial, chapô et visuel.",
  mep:
    "Dotation, clé IDA/AFD, sous-composantes et indicateurs rattachés. Ces valeurs viennent du Manuel d'Exécution : elles se corrigent, elles ne se rédigent pas.",
  problematique:
    "Le problème auquel la composante répond, avant la description de ce qu'elle fait : les axes du constat, l'appui qui légitime l'intervention, les renvois vers les autres composantes.",
  contexte:
    "Les paragraphes de la colonne de gauche, en regard des sous-composantes. Un paragraphe par entrée.",
  video:
    "L'affiche, le titre et la source. Sans fichier ni identifiant, la page affiche l'état « à venir » plutôt qu'une zone vide.",
  objectifs: "Ce que la composante vise, une ligne par objectif.",
  projets:
    "Les projets phares, avec leur corps rédigé, leurs puces et leur chute. Ils alimentent aussi l'index collant de la page et le compteur des cartes.",
  ecosysteme: "Les briques de l'écosystème, numérotées, sur fond sombre.",
  finalite: "Ce à quoi la composante aboutit, une ligne par point.",
};

/** Ancre de la section sur la page publique — lien « Voir sur le site ». */
export const COMPOSANTE_SECTION_ANCRE: Record<ComposanteSection, string> = {
  identite: "",
  mep: "contexte",
  problematique: "problematique",
  contexte: "contexte",
  video: "video",
  objectifs: "objectifs",
  projets: "projets",
  ecosysteme: "ecosysteme",
  finalite: "finalite",
};

/** Types de blocs administrés par une section, dans l'ordre du formulaire. */
export const SECTION_BLOCS: Record<ComposanteSection, readonly ComposanteBlocType[]> = {
  identite: [],
  mep: ["SOUS_COMPOSANTE"],
  problematique: ["PB_AXE", "PB_APPUI", "PB_LIEN"],
  contexte: ["CHAPEAU"],
  video: [],
  objectifs: ["OBJECTIF"],
  projets: ["PROJET"],
  ecosysteme: ["ECO_COUCHE"],
  finalite: ["FIN_POINT"],
};

/** Section qui administre un type de bloc — l'inverse de `SECTION_BLOCS`. */
export const BLOC_SECTION: Record<ComposanteBlocType, ComposanteSection> = {
  SOUS_COMPOSANTE: "mep",
  CHAPEAU: "contexte",
  PB_AXE: "problematique",
  PB_APPUI: "problematique",
  PB_LIEN: "problematique",
  OBJECTIF: "objectifs",
  PROJET: "projets",
  ECO_COUCHE: "ecosysteme",
  FIN_POINT: "finalite",
};

export const BLOC_LABEL: Record<ComposanteBlocType, string> = {
  SOUS_COMPOSANTE: "Sous-composante",
  CHAPEAU: "Paragraphe de contexte",
  PB_AXE: "Axe du constat",
  PB_APPUI: "Paragraphe d'appui",
  PB_LIEN: "Renvoi",
  OBJECTIF: "Objectif",
  PROJET: "Projet phare",
  ECO_COUCHE: "Brique de l'écosystème",
  FIN_POINT: "Point de la finalité",
};

export const BLOC_HINT: Record<ComposanteBlocType, string> = {
  SOUS_COMPOSANTE: "Référence du MEP, intitulé et dotation. Affichée dans l'encart du contexte.",
  CHAPEAU: "Un paragraphe. Le premier est mis en valeur sur la page.",
  PB_AXE: "Un constat, son mécanisme ou le coût du statu quo. Le numéro est calculé.",
  PB_APPUI: "Un paragraphe de la colonne « Ce qui justifie l'intervention publique ».",
  PB_LIEN: "Une dépendance assumée. Rattachée à une composante, elle devient un lien cliquable.",
  OBJECTIF: "Une ligne. Le numéro d'ordre est calculé, pas saisi.",
  PROJET: "Un projet, avec son corps rédigé, ses puces et sa chute.",
  ECO_COUCHE: "Un intitulé et ce qu'il recouvre. Le numéro est calculé.",
  FIN_POINT: "Une ligne, précédée d'un repère d'accent.",
};

/* -------------------------------------------------------------------------- */
/* Champs traduisibles d'une composante, par section                           */
/* -------------------------------------------------------------------------- */

/**
 * Les onze textes traduisibles d'une composante.
 *
 * Ils vivent tous sur la MÊME ligne de traduction — c'est une seule relecture,
 * une seule langue —, mais la console les présente section par section : la
 * rédaction corrige l'en-tête de la problématique en même temps que ses axes,
 * pas en même temps que le chapô du héros.
 */
export const CHAMPS_COMPOSANTE = [
  "titre", "desc", "titreLong", "soustitre",
  "pbTitre", "pbLead", "ecoTitre", "ecoLead", "finTitre", "finLead", "videoTitre",
] as const;
export type ChampComposante = (typeof CHAMPS_COMPOSANTE)[number];

export const isChampComposante = (value: string): value is ChampComposante =>
  (CHAMPS_COMPOSANTE as readonly string[]).includes(value);

type ChampSpecComposante = {
  champ: ChampComposante;
  label: string;
  aide?: string;
  placeholder?: string;
  long?: boolean;
  requis?: boolean;
};

/**
 * Textes demandés par chaque section, dans l'ordre du formulaire.
 *
 * ⚠️ Cette table décide aussi de ce qu'un envoi ÉCRIT : un formulaire de
 * section déclare les champs qu'il porte, et l'action ne touche qu'à eux
 * (cf. actions/admin-projet.ts). Sans cela, enregistrer l'en-tête de la
 * finalité effacerait le chapô du héros, absent de cet envoi.
 */
export const CHAMPS_SECTION: Record<ComposanteSection, ChampSpecComposante[]> = {
  identite: [
    {
      champ: "titre",
      label: "Intitulé court",
      aide: "Celui du MEP. Il paraît sur les cartes, dans le fil d'Ariane et dans les lignes d'aperçu.",
      placeholder: "Accès & inclusion numériques",
      requis: true,
    },
    {
      champ: "desc",
      label: "Description courte",
      aide: "Deux à trois lignes, sous l'intitulé dans les lignes d'aperçu.",
      long: true,
    },
    {
      champ: "titreLong",
      label: "Titre de la page",
      aide: "Le grand titre éditorial du héros. Vide : l'intitulé court en tient lieu.",
      placeholder: "Connecter le pays, du backbone national au dernier kilomètre",
      long: true,
    },
    {
      champ: "soustitre",
      label: "Chapô du héros",
      aide: "Vide : la description courte en tient lieu.",
      long: true,
    },
  ],
  mep: [],
  problematique: [
    {
      champ: "pbTitre",
      label: "Titre de la problématique",
      aide: "Une affirmation, pas une question. Sans lui, la section entière ne s'affiche pas.",
      placeholder: "Le réseau s'arrête là où le marché cesse d'être rentable.",
      long: true,
    },
    { champ: "pbLead", label: "Chapô de la problématique", long: true },
  ],
  contexte: [],
  video: [
    {
      champ: "videoTitre",
      label: "Titre de la vidéo",
      aide: "Sert aussi d'alternative à l'affiche. Sans lui, l'emplacement vidéo n'existe pas.",
    },
  ],
  objectifs: [],
  projets: [],
  ecosysteme: [
    {
      champ: "ecoTitre",
      label: "Titre de l'écosystème",
      aide: "Sans lui, la section entière ne s'affiche pas.",
    },
    { champ: "ecoLead", label: "Chapô de l'écosystème", long: true },
  ],
  finalite: [
    {
      champ: "finTitre",
      label: "Titre de la finalité",
      aide: "Sans lui, la section entière ne s'affiche pas.",
    },
    { champ: "finLead", label: "Chapô de la finalité", long: true },
  ],
};

/* -------------------------------------------------------------------------- */
/* Champs d'un bloc, par type                                                  */
/* -------------------------------------------------------------------------- */

/** Champs traduisibles d'un bloc. */
export type ChampBloc = "titre" | "texte" | "texteSecondaire" | "paragraphes" | "puces";

/** Champs non linguistiques qu'un type de bloc rend pertinents. */
export type ReglageBloc = "reference" | "sigle" | "slug" | "montant" | "cible" | "visuel";

type ChampSpecBloc = {
  champ: ChampBloc;
  label: string;
  aide?: string;
  placeholder?: string;
  /** Zone de texte plutôt que ligne simple. */
  long?: boolean;
  /** Sans lui, la traduction n'est pas servie au public. */
  requis?: boolean;
};

/**
 * Ce que chaque type de bloc demande, dans l'ordre où le formulaire le présente.
 *
 * L'intitulé n'est jamais le nom de la colonne : une rédactrice qui décrit un
 * axe lit « Ce que ce constat recouvre », pas « texte ».
 */
export const CHAMPS_BLOC: Record<ComposanteBlocType, ChampSpecBloc[]> = {
  SOUS_COMPOSANTE: [
    {
      champ: "titre",
      label: "Intitulé",
      placeholder: "Extension des réseaux de transmission",
      requis: true,
    },
  ],
  CHAPEAU: [
    { champ: "texte", label: "Paragraphe", long: true, requis: true },
  ],
  PB_AXE: [
    {
      champ: "titre",
      label: "Le constat",
      placeholder: "Une géographie qui multiplie les coûts fixes",
      requis: true,
    },
    { champ: "texte", label: "Ce que ce constat recouvre", long: true, requis: true },
  ],
  PB_APPUI: [
    { champ: "texte", label: "Paragraphe", long: true, requis: true },
  ],
  PB_LIEN: [
    {
      champ: "texte",
      label: "La dépendance",
      aide: "Une phrase : ce que cette composante attend de l'autre, ou du reste de l'action publique.",
      long: true,
      requis: true,
    },
  ],
  OBJECTIF: [
    { champ: "titre", label: "L'objectif", long: true, requis: true },
  ],
  PROJET: [
    { champ: "titre", label: "Titre du projet", placeholder: "Cloud souverain", requis: true },
    {
      champ: "texteSecondaire",
      label: "Statut affiché",
      aide: "La ligne mono sous le titre. Vide : aucune.",
      placeholder: "Infrastructure stratégique",
    },
    {
      champ: "paragraphes",
      label: "Corps",
      aide: "Un paragraphe par ligne. Une ligne vide sépare deux paragraphes à l'affichage, elle n'en crée pas un troisième.",
      long: true,
      requis: true,
    },
    {
      champ: "puces",
      label: "Puces",
      aide: "Une puce par ligne. Vide : aucune liste.",
      long: true,
    },
    {
      champ: "texte",
      label: "Chute",
      aide: "Le dernier paragraphe, mis en valeur. Vide : le corps se termine sur son dernier paragraphe.",
      long: true,
    },
  ],
  ECO_COUCHE: [
    { champ: "titre", label: "Intitulé de la brique", requis: true },
    { champ: "texte", label: "Ce qu'elle recouvre", long: true, requis: true },
  ],
  FIN_POINT: [
    { champ: "titre", label: "Le point", long: true, requis: true },
  ],
};

/** Réglages non linguistiques pertinents, par type. */
export const REGLAGES_BLOC: Record<ComposanteBlocType, readonly ReglageBloc[]> = {
  SOUS_COMPOSANTE: ["reference", "montant"],
  CHAPEAU: [],
  PB_AXE: [],
  PB_APPUI: [],
  PB_LIEN: ["cible"],
  OBJECTIF: [],
  PROJET: ["reference", "sigle", "slug", "visuel"],
  ECO_COUCHE: [],
  FIN_POINT: [],
};

export const reglageBlocActif = (type: ComposanteBlocType, reglage: ReglageBloc): boolean =>
  REGLAGES_BLOC[type].includes(reglage);

/** Intitulé du champ « référence », qui ne dit pas la même chose d'un type à l'autre. */
export const LABEL_REFERENCE: Partial<Record<ComposanteBlocType, { label: string; aide: string }>> = {
  SOUS_COMPOSANTE: {
    label: "Référence du MEP",
    aide: "Telle qu'elle figure au Manuel : « 1.2 ». Elle s'affiche en mono devant l'intitulé.",
  },
  PROJET: {
    label: "Numéro",
    aide: "Deux chiffres, dans l'ordre de lecture : « 01 », « 02 ».",
  },
};

/**
 * Une traduction de bloc est-elle servie au public ?
 *
 * La règle dépend du type, parce que le champ qui porte le sens n'est pas le
 * même : un paragraphe de contexte n'a pas de titre et n'en aura jamais, un
 * objectif n'a que cela. Exiger partout les mêmes champs interdirait la moitié
 * des listes.
 */
export function blocTraduit(
  type: ComposanteBlocType,
  valeurs: Partial<Record<ChampBloc, string | string[] | null>>,
): boolean {
  return CHAMPS_BLOC[type]
    .filter((spec) => spec.requis)
    .every((spec) => {
      const valeur = valeurs[spec.champ];
      if (Array.isArray(valeur)) return valeur.some((ligne) => ligne.trim().length > 0);
      return (valeur ?? "").trim().length > 0;
    });
}

/**
 * Une traduction de composante est-elle servie ?
 *
 * L'intitulé court suffit : c'est lui qui paraît sur les cartes, dans le fil
 * d'Ariane et dans les listes d'aperçu, et une composante sans page dédiée
 * rédigée doit pouvoir y figurer quand même. Le héros de la page dédiée se
 * replie sur lui à défaut de formulation éditoriale (cf. lib/projet/query.ts).
 */
export const composanteTraduite = (valeurs: { titre?: string | null }): boolean =>
  (valeurs.titre ?? "").trim().length > 0;

/* -------------------------------------------------------------------------- */
/* Cadre de résultats                                                          */
/* -------------------------------------------------------------------------- */

export const INDICATEUR_FAMILLES = ["ODP", "INTERMEDIAIRE"] as const;
export type IndicateurFamille = (typeof INDICATEUR_FAMILLES)[number];

export const isIndicateurFamille = (value: string): value is IndicateurFamille =>
  (INDICATEUR_FAMILLES as readonly string[]).includes(value);

export const FAMILLE_LABEL: Record<IndicateurFamille, string> = {
  ODP: "Indicateurs d'objectif (ODP)",
  INTERMEDIAIRE: "Indicateurs intermédiaires",
};

export const FAMILLE_HINT: Record<IndicateurFamille, string> = {
  ODP: "La grille qui coiffe l'accueil, « Le projet », « Résultats » et les pages de composante. Le point de départ et la part de femmes ne s'affichent que sur les deux dernières.",
  INTERMEDIAIRE: "Le bandeau de cellules de la page « Résultats ». Seule page du site à les porter.",
};

/** Le compteur animé n'a de sens que pour une famille. */
export const familleAnimee = (famille: IndicateurFamille): boolean => famille === "ODP";

/**
 * Une traduction d'indicateur est-elle servie ?
 *
 * Le libellé porte tout le sens : une cellule sans lui n'afficherait qu'un
 * chiffre nu, que rien ne rattacherait à une mesure.
 */
export const indicateurTraduit = (valeurs: { label?: string | null }): boolean =>
  (valeurs.label ?? "").trim().length > 0;
