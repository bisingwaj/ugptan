/**
 * Vocabulaire du module « Gouvernance » — organes et chronique des décisions.
 *
 * ⚠️ Aucun import : ce module est lu par les formulaires clients de la console,
 * par les gardes serveur, par la couche de lecture publique et par les
 * composants d'affichage. Les valeurs reproduisent volontairement les enums du
 * schéma Prisma — les deux doivent rester alignées.
 */

/* -------------------------------------------------------------------------- */
/* Statut de publication                                                       */
/* -------------------------------------------------------------------------- */

export const GOUV_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type GouvStatut = (typeof GOUV_STATUSES)[number];

export const isGouvStatut = (value: string): value is GouvStatut =>
  (GOUV_STATUSES as readonly string[]).includes(value);

export const GOUV_STATUT_LABEL: Record<GouvStatut, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
};

export const GOUV_STATUT_HINT: Record<GouvStatut, string> = {
  DRAFT: "Visible de la seule console. N'apparaît pas sur le site.",
  PUBLISHED: "En ligne, dans les langues traduites.",
};

/* -------------------------------------------------------------------------- */
/* Organes                                                                     */
/* -------------------------------------------------------------------------- */

/** Champs traduisibles d'un organe. */
export type ChampOrgane =
  | "nom" | "nature" | "effectif" | "presidence" | "decision" | "frequence"
  | "composition" | "membres";

type ChampSpecOrgane = {
  champ: ChampOrgane;
  label: string;
  aide?: string;
  placeholder?: string;
  long?: boolean;
  /** Sans lui, la traduction n'est pas servie au public. */
  requis?: boolean;
};

/**
 * Ce que la fiche d'un organe demande, dans l'ordre du formulaire.
 *
 * Les quatre attributs du milieu — nature, présidence, décision, fréquence —
 * sont exactement les quatre lignes de la carte de la page « Gouvernance »
 * (cf. `bodyLabels` dans src/content/i18n.ts, qui en porte les intitulés
 * PUBLICS). Ceux d'ici s'adressent à la rédaction et disent, en plus, où la
 * valeur se voit.
 */
export const CHAMPS_ORGANE: ChampSpecOrgane[] = [
  {
    champ: "nom",
    label: "Nom développé",
    aide: "Ce que le sigle abrège. Il s'affiche sous le sigle, sur la carte.",
    placeholder: "Comité de Pilotage",
    requis: true,
  },
  {
    champ: "nature",
    label: "Nature",
    aide: "Ce que l'organe est. Seule ligne reprise par l'aperçu de l'accueil.",
    placeholder: "Stratégique / décisionnel",
    requis: true,
  },
  {
    champ: "effectif",
    label: "Effectif",
    aide: "Tel qu'il doit se lire : « 8 membres ». Il coiffe aussi la liste des sièges.",
    placeholder: "8 membres",
  },
  {
    champ: "presidence",
    label: "Présidence",
    aide: "Qui préside. Une institution, ou une fonction.",
    placeholder: "MPTN",
  },
  {
    champ: "decision",
    label: "Règle de décision",
    placeholder: "Consensus → majorité simple",
  },
  {
    champ: "frequence",
    label: "Fréquence",
    placeholder: "Semestrielle (min.)",
  },
  {
    champ: "composition",
    label: "Ce que l'organe fait",
    aide: "Le paragraphe de la section « Composition ». Vide, l'organe n'y paraît pas : il ne garde que sa carte.",
    long: true,
  },
  {
    champ: "membres",
    label: "Sièges",
    aide: "Un siège par ligne, dans l'ordre d'affichage. Vide : aucune liste.",
    long: true,
  },
];

/**
 * Une traduction d'organe est-elle servie au public ?
 *
 * Le nom et la nature portent tout ce que la carte montre hors sigle : sans
 * eux, elle n'afficherait qu'une abréviation. Le reste des attributs est
 * facultatif — un organe peut n'avoir ni règle de majorité ni périodicité
 * arrêtée, et sa ligne disparaît alors de la carte plutôt que d'y rester vide.
 */
export const organeTraduit = (
  valeurs: { nom?: string | null; nature?: string | null },
): boolean =>
  (valeurs.nom ?? "").trim().length > 0 && (valeurs.nature ?? "").trim().length > 0;

/* -------------------------------------------------------------------------- */
/* Chronique des décisions                                                     */
/* -------------------------------------------------------------------------- */

/** Champs traduisibles d'une décision. */
export type ChampActivite = "dateLabel" | "titre" | "note";

type ChampSpecActivite = {
  champ: ChampActivite;
  label: string;
  aide?: string;
  placeholder?: string;
  long?: boolean;
  requis?: boolean;
};

export const CHAMPS_ACTIVITE: ChampSpecActivite[] = [
  {
    champ: "dateLabel",
    label: "Date affichée",
    aide: "Rédigée, et non calculée : la chronique mêle des mois et des jours, et « Juin 2026 » n'est pas une date.",
    placeholder: "Juin 2026",
    requis: true,
  },
  {
    champ: "titre",
    label: "Ce qui a été décidé",
    aide: "Une phrase à l'indicatif, sujet en tête : c'est l'organe qui agit.",
    placeholder: "Le COPIL valide le plan de passation 2026",
    long: true,
    requis: true,
  },
  {
    champ: "note",
    label: "Ce que la décision emporte",
    aide: "Une phrase : la conséquence concrète, pas la reformulation du titre.",
    long: true,
    requis: true,
  },
];

/**
 * Une traduction de décision est-elle servie ?
 *
 * Les trois champs, parce que le dessin les affiche tous les trois et qu'une
 * ligne de chronique à laquelle il manque la date ou la portée n'apprend rien.
 */
export const activiteTraduite = (
  valeurs: { dateLabel?: string | null; titre?: string | null; note?: string | null },
): boolean =>
  CHAMPS_ACTIVITE.filter((spec) => spec.requis).every(
    (spec) => (valeurs[spec.champ] ?? "").trim().length > 0,
  );
