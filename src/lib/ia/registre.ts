import "server-only";

/**
 * Ce qui se traduit, dans chaque module.
 *
 * Onze tables de traduction, onze formes différentes. Plutôt que de disperser
 * la connaissance de ces formes dans autant de services, tout est déclaré ici :
 * les champs, leur NATURE (une phrase courte ne se traduit pas comme un corps
 * HTML), les consignes particulières, et les deux accès à la base.
 *
 * Deux règles ont guidé le découpage :
 *
 *   1. Ce fichier est la SEULE chose à modifier pour couvrir un nouveau module.
 *      Le service de traduction ne connaît que ce registre ; il n'a pas de cas
 *      particulier par entité.
 *   2. Les accès sont écrits en toutes lettres, un couple `lire`/`ecrire` par
 *      entité, plutôt que dérivés d'un nom de délégué Prisma. Un accès générique
 *      supposerait de perdre le typage des modèles, ce qui coûterait plus cher
 *      à la première évolution du schéma que les quelques lignes recopiées.
 *
 * Ce qui N'EST PAS ici, délibérément : les taxonomies et les fiches à colonnes
 * jumelles (`nomFr` / `nomEn` sur les catégories, les étiquettes, les documents
 * et la galerie). Elles n'ont pas de table de traduction, donc pas de langue
 * « manquante » à détecter — leur assistance relève d'un autre geste, à la
 * frappe, et non d'un déclenchement à l'enregistrement.
 */
import { db } from "@/lib/db";
import type { Lang } from "@/lib/pick";
import type { Permission } from "@/lib/auth/permissions";
import { adminPath } from "@/lib/admin";
import { uniqueSlug } from "@/lib/actus/slug";
import { revaliderActualites } from "@/lib/actus/cache";
import { revaliderEvenements } from "@/lib/events/cache";
import { revaliderImpact } from "@/lib/impact/cache";
import { revaliderEquipe } from "@/lib/equipe/cache";
import { revaliderProjet } from "@/lib/projet/cache";
import { revaliderGouvernance } from "@/lib/gouvernance/cache";

/**
 * Nature d'un champ. Elle décide de la consigne donnée au modèle et du
 * traitement appliqué au retour.
 *
 *  · `texte`  — une ligne : titre, libellé, fonction. Pas de retour à la ligne.
 *  · `bloc`   — un paragraphe en texte brut : résumé, mandat, note.
 *  · `html`   — un corps rédigé dans l'éditeur. Le balisage est une structure,
 *               pas du texte : il doit ressortir identique.
 *  · `liste`  — un tableau de chaînes, dont le NOMBRE et l'ORDRE sont porteurs
 *               de sens (les sièges d'un organe, les puces d'un projet).
 */
export type NatureChamp = "texte" | "bloc" | "html" | "liste";

export type Champ = {
  nom: string;
  nature: NatureChamp;
  /** Ce que le champ contient, dit au modèle. Toujours utile : il ne voit pas l'écran. */
  quoi: string;
  /** Consigne propre à ce champ, ajoutée à l'invite. */
  consigne?: string;
};

/** Une ligne de traduction, telle qu'elle sort de la base. */
export type LigneTraduction = Record<string, unknown>;

export type Entite = {
  /** Clé stable, écrite en base dans `TraductionAssistee.entite`. */
  cle: string;
  /** Nom du contenu, au singulier, tel que la console le nomme. */
  libelle: string;
  /** Module de la console dont il relève — porte l'autorisation et l'écran. */
  permission: Permission;
  /** Écran de la console où l'on va le corriger. */
  ecran: string;
  /** Ce dont il s'agit, en une ligne, dit au modèle pour situer le texte. */
  contexte: string;
  champs: Champ[];
  /**
   * Champs sans lesquels la ligne ne peut pas être écrite — ils sont NON NULS
   * en base. Une génération qui les laisse vides est un échec, pas une
   * traduction partielle.
   */
  obligatoires: string[];
  /**
   * Segment d'URL à refabriquer depuis un champ traduit, le cas échéant.
   *
   * Le slug n'est JAMAIS demandé au modèle : c'est une donnée technique,
   * soumise à une unicité en base (`@@unique([locale, slug])`) qu'une
   * génération ne peut pas connaître. On le dérive du titre traduit, puis on le
   * rend unique dans sa langue.
   */
  slugDepuis?: string;
  /** Rend un slug libre DANS SA LANGUE, en écartant l'entité courante. */
  slugUnique?: (entiteId: string, locale: Lang, base: string) => Promise<string>;

  lire(entiteId: string, locale: Lang): Promise<LigneTraduction | null>;
  ecrire(entiteId: string, locale: Lang, valeurs: Record<string, unknown>): Promise<void>;
  /** Existe-t-elle encore ? Une entité supprimée entre deux appels ne doit pas lever. */
  existe(entiteId: string): Promise<boolean>;
  /** Titre affiché par la console pour désigner cette entité. */
  intitule(source: LigneTraduction): string;
  /**
   * Chemin de la fiche, pour les contenus qui ont un écran à eux. Absent pour
   * ceux qui s'éditent en ligne dans la liste de leur parent (un bloc, un
   * indicateur, une décision) : l'écran du module est alors la destination.
   */
  lienFiche?: (entiteId: string) => string;
  /** Invalidation des pages publiques après écriture. */
  revalider(): void;
};

/* -------------------------------------------------------------------------- */
/* Consignes réutilisées                                                       */
/* -------------------------------------------------------------------------- */

const SEO_TITRE =
  "Titre de référencement. Reste sous 60 caractères une fois traduit, quitte à resserrer la formule.";
const SEO_DESCRIPTION =
  "Description de référencement. Reste sous 155 caractères une fois traduite, quitte à resserrer la formule.";
const ALT =
  "Texte alternatif d'image, lu par les lecteurs d'écran : décrit ce que l'image montre, sans commencer par « image de ».";

/** Un libellé qui porte un nombre : le chiffre ne bouge pas, l'unité se traduit. */
const LIBELLE_CHIFFRE =
  "Libellé portant un nombre. Le nombre reste identique ; seule l'unité ou le mot qui l'accompagne se traduit " +
  "(« 8 membres » → « 8 members »). En anglais, la virgule décimale du français devient un point.";

/* -------------------------------------------------------------------------- */
/* Le registre                                                                 */
/* -------------------------------------------------------------------------- */

const ENTITES: Entite[] = [
  {
    cle: "article",
    libelle: "Article",
    permission: "actualites",
    ecran: adminPath("/news"),
    contexte:
      "Un article ou communiqué publié dans les actualités du site institutionnel de l'UGPTN.",
    obligatoires: ["title"],
    slugDepuis: "title",
    slugUnique: async (id, locale, base) => {
      const pris = await db().articleTranslation.findMany({
        where: { locale, slug: { startsWith: base || "article" }, articleId: { not: id } },
        select: { slug: true },
      });
      return uniqueSlug(base || "article", pris.map((ligne) => ligne.slug));
    },
    champs: [
      { nom: "title", nature: "texte", quoi: "Titre de l'article." },
      { nom: "excerpt", nature: "bloc", quoi: "Résumé affiché sur les cartes et dans les partages." },
      { nom: "contentHtml", nature: "html", quoi: "Corps de l'article." },
      { nom: "seoTitle", nature: "texte", quoi: "Titre de référencement.", consigne: SEO_TITRE },
      { nom: "seoDescription", nature: "bloc", quoi: "Description de référencement.", consigne: SEO_DESCRIPTION },
      { nom: "coverAlt", nature: "texte", quoi: "Texte alternatif de l'image de couverture.", consigne: ALT },
      {
        nom: "authorRole",
        nature: "texte",
        quoi: "Fonction affichée sous la signature de l'article.",
        consigne:
          "C'est un intitulé de fonction ou de service, pas un nom propre : traduis-le " +
          "(« Cellule communication » → « Communications Unit »).",
      },
    ],
    lire: (id, locale) =>
      db().articleTranslation.findUnique({ where: { articleId_locale: { articleId: id, locale } } }),
    ecrire: async (id, locale, valeurs) => {
      await db().articleTranslation.upsert({
        where: { articleId_locale: { articleId: id, locale } },
        create: { articleId: id, locale, ...valeurs } as never,
        update: valeurs,
      });
    },
    existe: async (id) => Boolean(await db().article.findUnique({ where: { id }, select: { id: true } })),
    lienFiche: (id) => `${adminPath("/news")}/${id}`,
    intitule: (source) => String(source.title || "Article sans titre"),
    revalider: revaliderActualites,
  },

  {
    cle: "evenement",
    libelle: "Événement",
    permission: "evenements",
    ecran: adminPath("/events"),
    contexte:
      "Un événement de l'agenda du site institutionnel de l'UGPTN : atelier, conférence, session de formation.",
    obligatoires: ["title"],
    slugDepuis: "title",
    slugUnique: async (id, locale, base) => {
      const pris = await db().evenementTranslation.findMany({
        where: { locale, slug: { startsWith: base || "evenement" }, evenementId: { not: id } },
        select: { slug: true },
      });
      return uniqueSlug(base || "evenement", pris.map((ligne) => ligne.slug));
    },
    champs: [
      { nom: "title", nature: "texte", quoi: "Titre de l'événement." },
      { nom: "excerpt", nature: "bloc", quoi: "Description courte affichée sur les cartes." },
      { nom: "contentHtml", nature: "html", quoi: "Description complète." },
      {
        nom: "lieu",
        nature: "texte",
        quoi: "Lieu tel qu'il s'affiche.",
        consigne:
          "Le nom de la ville ne se traduit pas ; ce qui l'accompagne, oui (« Goma — provinces de l'Est » " +
          "→ « Goma — Eastern provinces »). « En ligne » devient « Online ».",
      },
      {
        nom: "adresse",
        nature: "texte",
        quoi: "Adresse ou repère de localisation.",
        consigne:
          "Le nom propre d'un bâtiment ou d'une avenue reste tel quel ; seuls les mots communs qui l'entourent se traduisent.",
      },
      { nom: "places", nature: "texte", quoi: "Jauge affichée ou règle d'accès.", consigne: LIBELLE_CHIFFRE },
      { nom: "infos", nature: "bloc", quoi: "Informations complémentaires : accès, interprétation, pièces à apporter." },
      { nom: "seoTitle", nature: "texte", quoi: "Titre de référencement.", consigne: SEO_TITRE },
      { nom: "seoDescription", nature: "bloc", quoi: "Description de référencement.", consigne: SEO_DESCRIPTION },
      { nom: "coverAlt", nature: "texte", quoi: "Texte alternatif de l'image de couverture.", consigne: ALT },
    ],
    lire: (id, locale) =>
      db().evenementTranslation.findUnique({ where: { evenementId_locale: { evenementId: id, locale } } }),
    ecrire: async (id, locale, valeurs) => {
      await db().evenementTranslation.upsert({
        where: { evenementId_locale: { evenementId: id, locale } },
        create: { evenementId: id, locale, ...valeurs } as never,
        update: valeurs,
      });
    },
    existe: async (id) => Boolean(await db().evenement.findUnique({ where: { id }, select: { id: true } })),
    lienFiche: (id) => `${adminPath("/events")}/${id}`,
    intitule: (source) => String(source.title || "Événement sans titre"),
    revalider: revaliderEvenements,
  },

  {
    cle: "impactSection",
    libelle: "Section « Histoires & impact »",
    permission: "histoires",
    ecran: adminPath("/stories"),
    contexte:
      "L'en-tête d'une section de la page « Histoires & impact », qui raconte ce que le Projet change concrètement.",
    obligatoires: [],
    champs: [
      { nom: "kicker", nature: "texte", quoi: "Libellé court qui coiffe la section (« Impact humain »)." },
      { nom: "titre", nature: "texte", quoi: "Titre de la section." },
      { nom: "lead", nature: "bloc", quoi: "Chapô sous le titre." },
      { nom: "ctaLabel", nature: "texte", quoi: "Libellé du bouton d'en-tête." },
      { nom: "note", nature: "bloc", quoi: "Ligne courte : référence sous une citation, légende d'un aplat." },
    ],
    lire: (id, locale) =>
      db().impactSectionTranslation.findUnique({ where: { sectionId_locale: { sectionId: id, locale } } }),
    ecrire: async (id, locale, valeurs) => {
      await db().impactSectionTranslation.upsert({
        where: { sectionId_locale: { sectionId: id, locale } },
        create: { sectionId: id, locale, ...valeurs } as never,
        update: valeurs,
      });
    },
    existe: async (id) => Boolean(await db().impactSection.findUnique({ where: { id }, select: { id: true } })),
    lienFiche: (id) => `${adminPath("/stories")}/${id}`,
    intitule: (source) => String(source.titre || source.kicker || "Section sans titre"),
    revalider: revaliderImpact,
  },

  {
    cle: "impactItem",
    libelle: "Entrée « Histoires & impact »",
    permission: "histoires",
    ecran: adminPath("/stories"),
    contexte:
      "Une entrée d'une section « Histoires & impact » : un chiffre, un témoignage, une carte ou un jalon.",
    obligatoires: [],
    champs: [
      { nom: "surtitre", nature: "texte", quoi: "Ligne courte au-dessus ou sous le titre : unité, rôle, secteur, date." },
      { nom: "titre", nature: "texte", quoi: "Titre de l'entrée." },
      { nom: "texte", nature: "bloc", quoi: "Corps principal : explication, citation, fait marquant." },
      {
        nom: "texteSecondaire",
        nature: "bloc",
        quoi: "Second corps : la situation actuelle que le Projet entend corriger.",
      },
      { nom: "lienLabel", nature: "texte", quoi: "Libellé du lien sortant." },
      { nom: "mediaAlt", nature: "texte", quoi: "Texte alternatif du visuel.", consigne: ALT },
    ],
    lire: (id, locale) =>
      db().impactItemTranslation.findUnique({ where: { itemId_locale: { itemId: id, locale } } }),
    ecrire: async (id, locale, valeurs) => {
      await db().impactItemTranslation.upsert({
        where: { itemId_locale: { itemId: id, locale } },
        create: { itemId: id, locale, ...valeurs } as never,
        update: valeurs,
      });
    },
    existe: async (id) => Boolean(await db().impactItem.findUnique({ where: { id }, select: { id: true } })),
    intitule: (source) => String(source.titre || source.surtitre || "Entrée sans titre"),
    revalider: revaliderImpact,
  },

  {
    cle: "teamPole",
    libelle: "Pôle de l'Unité",
    permission: "equipe",
    ecran: adminPath("/equipe/poles"),
    contexte: "Un pôle de l'Unité de gestion : l'entité interne dont relèvent plusieurs membres.",
    obligatoires: ["nom"],
    champs: [
      { nom: "nom", nature: "texte", quoi: "Nom du pôle." },
      { nom: "mission", nature: "bloc", quoi: "Ce dont le pôle répond, en une ligne." },
    ],
    lire: (id, locale) =>
      db().teamPoleTranslation.findUnique({ where: { poleId_locale: { poleId: id, locale } } }),
    ecrire: async (id, locale, valeurs) => {
      await db().teamPoleTranslation.upsert({
        where: { poleId_locale: { poleId: id, locale } },
        create: { poleId: id, locale, ...valeurs } as never,
        update: valeurs,
      });
    },
    existe: async (id) => Boolean(await db().teamPole.findUnique({ where: { id }, select: { id: true } })),
    intitule: (source) => String(source.nom || "Pôle sans nom"),
    revalider: revaliderEquipe,
  },

  {
    cle: "teamMember",
    libelle: "Membre de l'Unité",
    permission: "equipe",
    ecran: adminPath("/equipe"),
    contexte: "La fiche d'une personne de l'Unité de gestion, ou d'un poste non encore pourvu.",
    obligatoires: ["role"],
    champs: [
      {
        nom: "nom",
        nature: "texte",
        quoi: "Graphie du nom de la personne dans cette langue.",
        consigne:
          "C'est un NOM PROPRE : recopie-le à l'identique, sans rien traduire ni translittérer. " +
          "N'ajuste que la casse si l'usage de la langue l'exige.",
      },
      { nom: "role", nature: "texte", quoi: "Fonction exercée (« Coordonnateur national »)." },
      { nom: "mandat", nature: "bloc", quoi: "Ce dont le membre répond, en une phrase." },
      { nom: "bio", nature: "bloc", quoi: "Présentation développée." },
      {
        nom: "verbatim",
        nature: "bloc",
        quoi: "Citation attribuée au membre.",
        consigne:
          "C'est une parole rapportée : rends-la comme une citation naturelle dans la langue cible, " +
          "sans guillemets ajoutés — la mise en forme est faite par le site.",
      },
    ],
    lire: (id, locale) =>
      db().teamMemberTranslation.findUnique({ where: { memberId_locale: { memberId: id, locale } } }),
    ecrire: async (id, locale, valeurs) => {
      await db().teamMemberTranslation.upsert({
        where: { memberId_locale: { memberId: id, locale } },
        create: { memberId: id, locale, ...valeurs } as never,
        update: valeurs,
      });
    },
    existe: async (id) => Boolean(await db().teamMember.findUnique({ where: { id }, select: { id: true } })),
    lienFiche: (id) => `${adminPath("/equipe")}/${id}`,
    intitule: (source) => String(source.nom || source.role || "Fiche sans nom"),
    revalider: revaliderEquipe,
  },

  {
    cle: "composante",
    libelle: "Composante du Projet",
    permission: "projet",
    ecran: adminPath("/project"),
    contexte:
      "Une composante du Projet de transformation numérique (PTN-RDC) : son intitulé, sa page dédiée et ses en-têtes de section.",
    obligatoires: [],
    champs: [
      { nom: "titre", nature: "texte", quoi: "Intitulé court, tel qu'il figure au document de projet." },
      { nom: "desc", nature: "bloc", quoi: "Description courte, affichée sur les cartes." },
      { nom: "titreLong", nature: "texte", quoi: "Titre éditorial de la page dédiée." },
      { nom: "soustitre", nature: "bloc", quoi: "Chapô du héros de la page dédiée." },
      { nom: "pbTitre", nature: "texte", quoi: "En-tête de la section « La problématique »." },
      { nom: "pbLead", nature: "bloc", quoi: "Chapô de la section « La problématique »." },
      { nom: "ecoTitre", nature: "texte", quoi: "En-tête de la section « L'écosystème »." },
      { nom: "ecoLead", nature: "bloc", quoi: "Chapô de la section « L'écosystème »." },
      { nom: "finTitre", nature: "texte", quoi: "En-tête de la section « La finalité »." },
      { nom: "finLead", nature: "bloc", quoi: "Chapô de la section « La finalité »." },
      { nom: "videoTitre", nature: "texte", quoi: "Titre de la vidéo de présentation, qui sert aussi d'alternative au poster." },
    ],
    lire: (id, locale) =>
      db().composanteTranslation.findUnique({ where: { composanteId_locale: { composanteId: id, locale } } }),
    ecrire: async (id, locale, valeurs) => {
      await db().composanteTranslation.upsert({
        where: { composanteId_locale: { composanteId: id, locale } },
        create: { composanteId: id, locale, ...valeurs } as never,
        update: valeurs,
      });
    },
    existe: async (id) => Boolean(await db().composante.findUnique({ where: { id }, select: { id: true } })),
    lienFiche: (id) => `${adminPath("/project")}/${id}`,
    intitule: (source) => String(source.titre || source.titreLong || "Composante sans titre"),
    revalider: revaliderProjet,
  },

  {
    cle: "composanteBloc",
    libelle: "Bloc de composante",
    permission: "projet",
    ecran: adminPath("/project"),
    contexte:
      "Une ligne d'une des listes d'une composante du Projet : un axe, un objectif, un projet phare, une couche technique.",
    obligatoires: [],
    champs: [
      { nom: "titre", nature: "texte", quoi: "Intitulé de la ligne." },
      { nom: "texte", nature: "bloc", quoi: "Corps principal de la ligne." },
      { nom: "texteSecondaire", nature: "texte", quoi: "Ligne courte : le statut affiché d'un projet phare." },
      { nom: "paragraphes", nature: "liste", quoi: "Paragraphes du corps d'un projet phare, un par entrée." },
      { nom: "puces", nature: "liste", quoi: "Puces d'un projet phare, une par entrée." },
    ],
    lire: (id, locale) =>
      db().composanteBlocTranslation.findUnique({ where: { blocId_locale: { blocId: id, locale } } }),
    ecrire: async (id, locale, valeurs) => {
      await db().composanteBlocTranslation.upsert({
        where: { blocId_locale: { blocId: id, locale } },
        create: { blocId: id, locale, ...valeurs } as never,
        update: valeurs,
      });
    },
    existe: async (id) => Boolean(await db().composanteBloc.findUnique({ where: { id }, select: { id: true } })),
    intitule: (source) => String(source.titre || "Bloc sans titre"),
    revalider: revaliderProjet,
  },

  {
    cle: "indicateur",
    libelle: "Indicateur du cadre de résultats",
    permission: "projet",
    ecran: adminPath("/project"),
    contexte:
      "Un indicateur du cadre de résultats du Projet : ce qu'il mesure, son point de départ et sa précision.",
    obligatoires: [],
    champs: [
      { nom: "label", nature: "texte", quoi: "Ce que l'indicateur mesure." },
      { nom: "baseline", nature: "texte", quoi: "Point de départ, tel qu'il doit se lire.", consigne: LIBELLE_CHIFFRE },
      { nom: "note", nature: "texte", quoi: "Précision affichée en pastille." },
      {
        nom: "unit",
        nature: "texte",
        quoi: "Unité affichée à droite de la valeur.",
        consigne:
          "Un mot d'unité se traduit et s'accorde à l'usage de la langue cible " +
          "(« millions » → « million », « jours » → « days »). Un symbole ou une unité " +
          "du système international se recopie à l'identique (« km », « kbit/s », « % »).",
      },
    ],
    lire: (id, locale) =>
      db().indicateurTranslation.findUnique({ where: { indicateurId_locale: { indicateurId: id, locale } } }),
    ecrire: async (id, locale, valeurs) => {
      await db().indicateurTranslation.upsert({
        where: { indicateurId_locale: { indicateurId: id, locale } },
        create: { indicateurId: id, locale, ...valeurs } as never,
        update: valeurs,
      });
    },
    existe: async (id) => Boolean(await db().indicateur.findUnique({ where: { id }, select: { id: true } })),
    intitule: (source) => String(source.label || "Indicateur sans libellé"),
    revalider: revaliderProjet,
  },

  {
    cle: "organe",
    libelle: "Organe de gouvernance",
    permission: "ugptn",
    ecran: adminPath("/ugptn"),
    contexte:
      "Un organe de gouvernance du Projet : comité de pilotage, comité technique, unité de gestion. Sa nature, sa composition et son rythme de réunion.",
    obligatoires: [],
    champs: [
      { nom: "nom", nature: "texte", quoi: "Nom développé de l'organe." },
      { nom: "nature", nature: "texte", quoi: "Ce qu'il est (« Stratégique / décisionnel »)." },
      { nom: "effectif", nature: "texte", quoi: "Effectif tel qu'il doit se lire.", consigne: LIBELLE_CHIFFRE },
      { nom: "presidence", nature: "texte", quoi: "Qui préside l'organe — une fonction, pas une personne." },
      { nom: "decision", nature: "texte", quoi: "Mode de décision (« Consensus », « Majorité »)." },
      { nom: "frequence", nature: "texte", quoi: "Rythme de réunion.", consigne: LIBELLE_CHIFFRE },
      { nom: "composition", nature: "bloc", quoi: "Ce que l'organe fait, en un paragraphe." },
      {
        nom: "membres",
        nature: "liste",
        quoi: "Un siège par entrée, dans l'ordre où ils s'affichent.",
        consigne:
          "Ce sont des FONCTIONS et des institutions, pas des personnes : traduis-les. " +
          "Un sigle d'institution congolaise reste tel quel s'il n'a pas d'équivalent établi.",
      },
    ],
    lire: (id, locale) =>
      db().organeTranslation.findUnique({ where: { organeId_locale: { organeId: id, locale } } }),
    ecrire: async (id, locale, valeurs) => {
      await db().organeTranslation.upsert({
        where: { organeId_locale: { organeId: id, locale } },
        create: { organeId: id, locale, ...valeurs } as never,
        update: valeurs,
      });
    },
    existe: async (id) => Boolean(await db().organe.findUnique({ where: { id }, select: { id: true } })),
    intitule: (source) => String(source.nom || "Organe sans nom"),
    revalider: revaliderGouvernance,
  },

  {
    cle: "gouvActivite",
    libelle: "Décision de gouvernance",
    permission: "ugptn",
    ecran: adminPath("/ugptn"),
    contexte: "Une décision ou une mission datée, portée à la chronique de la gouvernance du Projet.",
    obligatoires: [],
    champs: [
      {
        nom: "dateLabel",
        nature: "texte",
        quoi: "Date affichée, rédigée.",
        consigne:
          "C'est une date écrite en toutes lettres : rends-la selon l'usage de la langue cible " +
          "(« Juin 2026 » → « June 2026 »). Ne change ni le mois ni l'année.",
      },
      { nom: "titre", nature: "texte", quoi: "Intitulé de la décision." },
      { nom: "note", nature: "bloc", quoi: "Ce que la décision emporte, en une phrase." },
    ],
    lire: (id, locale) =>
      db().gouvActiviteTranslation.findUnique({ where: { activiteId_locale: { activiteId: id, locale } } }),
    ecrire: async (id, locale, valeurs) => {
      await db().gouvActiviteTranslation.upsert({
        where: { activiteId_locale: { activiteId: id, locale } },
        create: { activiteId: id, locale, ...valeurs } as never,
        update: valeurs,
      });
    },
    existe: async (id) => Boolean(await db().gouvActivite.findUnique({ where: { id }, select: { id: true } })),
    intitule: (source) => String(source.titre || source.dateLabel || "Décision sans titre"),
    revalider: revaliderGouvernance,
  },
];

const PAR_CLE = new Map(ENTITES.map((entite) => [entite.cle, entite]));

/**
 * L'entité portant cette clé, ou `null`.
 *
 * Renvoie `null` plutôt que de lever : une clé inconnue vient forcément d'une
 * ligne de journal écrite par une version antérieure du registre, et une
 * console ne doit pas tomber sur un vestige.
 */
export function entite(cle: string): Entite | null {
  return PAR_CLE.get(cle) ?? null;
}

/** Clé de tri stable pour l'écran de suivi : par module, puis par libellé. */
export const ORDRE_ENTITES: readonly string[] = ENTITES.map((e) => e.cle);
