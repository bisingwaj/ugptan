/**
 * Vocabulaire du module « L'équipe de l'Unité ».
 *
 * ⚠️ Aucun import : ce module est lu par les formulaires clients de la console,
 * par les gardes serveur, par la couche de lecture publique et par les
 * composants d'affichage. Les valeurs reproduisent volontairement les enums du
 * schéma Prisma — les deux doivent rester alignées.
 *
 * ─── Ce qu'une fiche décide, et ce qu'elle ne décide pas ─────────────────────
 *
 * Une fiche vaut pour quatre emplacements du site. Elle n'en choisit qu'un
 * seul explicitement — la composante dont elle est responsable. Les trois
 * autres découlent de son état :
 *
 *   · publiée              → la grille de l'accueil et de la page « L'Unité » ;
 *   · publiée et en avant  → les cartes de coordination de « Gouvernance » ;
 *   · composante « C2 »    → le profil du responsable, sur la fiche de la C2.
 *
 * Aucune case « afficher ici » n'est demandée à la rédaction : elle décrit un
 * poste, le site en tire les conséquences. C'est ce qui garantit qu'un titre
 * corrigé l'est aux quatre endroits, ce que trois fichiers séparés ne
 * garantissaient pas.
 */

/* -------------------------------------------------------------------------- */
/* Statut de publication                                                       */
/* -------------------------------------------------------------------------- */

export const TEAM_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type TeamStatut = (typeof TEAM_STATUSES)[number];

export const isTeamStatut = (value: string): value is TeamStatut =>
  (TEAM_STATUSES as readonly string[]).includes(value);

export const TEAM_STATUT_LABEL: Record<TeamStatut, string> = {
  DRAFT: "Masqué",
  PUBLISHED: "Publié",
};

export const TEAM_STATUT_HINT: Record<TeamStatut, string> = {
  DRAFT: "Visible de la seule console. La fiche n'apparaît nulle part sur le site.",
  PUBLISHED: "En ligne dans la grille de l'équipe, et dans les langues traduites.",
};

/* -------------------------------------------------------------------------- */
/* Composantes                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Composantes du projet, telles qu'elles existent dans le code
 * (cf. src/content/data.ts). Une fiche rattachée à l'une d'elles s'affiche sur
 * sa page publique, à la place du profil écrit en dur jusqu'ici.
 *
 * ⚠️ Liste FERMÉE, et volontairement : les composantes sont une donnée de
 * structure du financement, fixée par l'accord de projet. En ouvrir une
 * cinquième relève d'un avenant, pas d'un écran d'administration.
 */
export const TEAM_COMPOSANTES = ["C1", "C2", "C3", "C4", "C5"] as const;
export type TeamComposante = (typeof TEAM_COMPOSANTES)[number];

export const isTeamComposante = (value: string): value is TeamComposante =>
  (TEAM_COMPOSANTES as readonly string[]).includes(value);

/* -------------------------------------------------------------------------- */
/* Ce qui rend une langue servie                                               */
/* -------------------------------------------------------------------------- */

/** Traduction d'une fiche, réduite à ce qui décide de sa publication. */
export type TeamTraductionMinimale = { locale: string; role?: string | null };

/**
 * Une langue est servie dès qu'elle porte une FONCTION.
 *
 * Le reste — nom, mandat, biographie, citation — est facultatif par
 * construction : le site affiche déjà des postes vacants, réduits à leur
 * intitulé et à une pastille d'initiales. Exiger davantage retirerait de la
 * grille anglaise onze des douze fiches d'origine, qui n'ont jamais eu de
 * biographie.
 */
export const membreTraduit = (
  traductions: readonly TeamTraductionMinimale[],
  locale: string,
): boolean => traductions.some((t) => t.locale === locale && Boolean(t.role?.trim()));

/** Traduction d'un pôle, réduite à ce qui décide de son affichage. */
export type TeamPoleTraductionMinimale = { locale: string; nom?: string | null };

/** Un pôle est servi dès qu'il porte un nom dans la langue lue. */
export const poleTraduit = (
  traductions: readonly TeamPoleTraductionMinimale[],
  locale: string,
): boolean => traductions.some((t) => t.locale === locale && Boolean(t.nom?.trim()));

/* -------------------------------------------------------------------------- */
/* Libellés de la console                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Intitulés des champs de traduction. Groupés ici pour que la console et l'aide
 * en ligne ne divergent pas : le formulaire lit ces libellés, la page d'aide
 * les cite.
 */
export const TEAM_CHAMPS = {
  nom: {
    label: "Nom",
    hint: "À renseigner seulement si la graphie diffère dans cette langue. Vide, le nom de la fiche est repris.",
  },
  role: {
    label: "Fonction",
    hint: "L'intitulé du poste, tel qu'il s'affiche sur toutes les cartes. Seul champ obligatoire.",
  },
  mandat: {
    label: "Responsabilités",
    hint: "Ce dont la personne répond, en une phrase. Affiché par les cartes de coordination de la page « Gouvernance ».",
  },
  bio: {
    label: "Biographie",
    hint: "Présentation développée. Affichée sur la fiche de la composante dont la personne est responsable.",
  },
  verbatim: {
    label: "Citation",
    hint: "Une phrase attribuée à la personne, affichée entre guillemets sous sa biographie.",
  },
} as const;
