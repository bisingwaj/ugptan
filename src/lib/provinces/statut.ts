/**
 * Vocabulaire du module « Provinces » — fiches et projets localisés.
 *
 * ⚠️ Aucun import : ce module est lu par les formulaires clients de la console,
 * par les gardes serveur et par la couche de lecture publique. Les valeurs
 * reproduisent volontairement les enums du schéma Prisma (`ProvinceStatus`,
 * `ProjetAvancement`) — les deux doivent rester alignées.
 */

export const PROVINCE_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type ProvinceStatut = (typeof PROVINCE_STATUSES)[number];

export const isProvinceStatut = (value: string): value is ProvinceStatut =>
  (PROVINCE_STATUSES as readonly string[]).includes(value);

export const PROVINCE_STATUT_LABEL: Record<ProvinceStatut, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
};

export const AVANCEMENTS = ["EN_COURS", "PREVU", "ACHEVE"] as const;
export type AvancementProjet = (typeof AVANCEMENTS)[number];

export const isAvancement = (value: string): value is AvancementProjet =>
  (AVANCEMENTS as readonly string[]).includes(value);

/** Libellés de la console. Ceux du site public vivent dans `t.province`. */
export const AVANCEMENT_LABEL: Record<AvancementProjet, string> = {
  EN_COURS: "En cours",
  PREVU: "Prévu",
  ACHEVE: "Achevé",
};

/** Un ODD est un entier de 1 à 17. */
export const estOdd = (n: number): boolean => Number.isInteger(n) && n >= 1 && n <= 17;

/** Une traduction de projet n'est servie qu'avec son titre. */
export const projetTraduit = (tr: { titre: string | null }): boolean => Boolean(tr.titre?.trim());

/** Les dix-sept numéros d'ODD, dans l'ordre des cases à cocher. */
export const ODD_NUMEROS: readonly number[] = Array.from({ length: 17 }, (_, i) => i + 1);

/* -------------------------------------------------------------------------- */
/* Fiche d'une province                                                        */
/* -------------------------------------------------------------------------- */

/** Champs traduisibles d'une fiche : seul le texte libre se traduit. */
export type ChampFiche = "description" | "administration";

type ChampSpecFiche = {
  champ: ChampFiche;
  label: string;
  aide?: string;
  placeholder?: string;
  long?: boolean;
  requis?: boolean;
};

export const CHAMPS_FICHE: ChampSpecFiche[] = [
  {
    champ: "description",
    label: "Présentation",
    aide: "Une ou deux phrases neutres : géographie, économie. Elle sert de chapô à la page et de description aux moteurs de recherche.",
    long: true,
    requis: true,
  },
  {
    champ: "administration",
    label: "Statut administratif particulier",
    aide: "Affiché en pastille sous le titre (« État de siège depuis mai 2021 »). Vide : aucune pastille.",
    placeholder: "État de siège depuis mai 2021",
  },
];

/**
 * Une traduction de fiche est-elle complète ?
 *
 * La présentation seule : la pastille administrative est l'exception, pas la
 * règle. Les chiffres et l'administration non traduits se lisent dans toutes
 * les langues, la fiche n'est donc jamais retirée du site faute de traduction.
 */
export const ficheTraduite = (valeurs: { description?: string | null }): boolean =>
  (valeurs.description ?? "").trim().length > 0;

/* -------------------------------------------------------------------------- */
/* Projets localisés                                                           */
/* -------------------------------------------------------------------------- */

/** Champs traduisibles d'un projet. */
export type ChampProjet = "titre" | "resume" | "lieu";

type ChampSpecProjet = {
  champ: ChampProjet;
  label: string;
  aide?: string;
  placeholder?: string;
  long?: boolean;
  requis?: boolean;
};

export const CHAMPS_PROJET: ChampSpecProjet[] = [
  {
    champ: "titre",
    label: "Intitulé",
    aide: "Ce que le projet fait, en une ligne. Sans lui, la langue n'est pas servie au public.",
    placeholder: "Raccordement des hôpitaux généraux de référence",
    requis: true,
  },
  {
    champ: "resume",
    label: "Résumé",
    aide: "Une ou deux phrases sous l'intitulé : ce qui change concrètement.",
    long: true,
  },
  {
    champ: "lieu",
    label: "Localisation",
    aide: "Lisible par le visiteur (« Goma, Bukavu »). Vide : rien n'est affiché.",
    placeholder: "Goma, Bukavu",
  },
];
