/* ============================================================================
   « L'équipe de l'Unité » — contenu d'origine du site, repris à l'identique.

   Ce fichier joue DEUX rôles, et un seul à la fois :

     1. il AMORCE la base à la première ouverture du module dans la console
        (cf. src/lib/equipe/bootstrap.ts) : la rédaction récupère l'existant au
        lieu de le ressaisir ;
     2. il sert de REPLI tant qu'aucune fiche n'est publiée (cf.
        src/lib/equipe/query.ts). Sans lui, une base neuve ou une console
        jamais ouverte videraient de leur équipe l'accueil, la page « L'Unité »,
        la page « Gouvernance » et quatre fiches de composante.

   ⚠️ Dès qu'une fiche publiée existe, la base fait foi et ce fichier n'est plus
   lu. Il n'est donc pas du contenu « codé en dur » : c'est l'état initial d'un
   contenu administrable.

   ─── Trois sources réconciliées en une ────────────────────────────────────────

   Les mêmes personnes étaient décrites à trois endroits, et s'y contredisaient :

     · `content/data.ts` (`equipe`)          — douze postes, grille de l'accueil
       et de la page « L'Unité » ;
     · `content/carbon.ts` (`gouvLeads`)     — quatre cartes de coordination sur
       la page « Gouvernance », avec mandat et couleur ;
     · `content/composantes-detail.ts`       — quatre profils de responsable, avec
       biographie et citation.

   Les quatre cartes de coordination n'étaient pas quatre personnes de plus :
   c'étaient le coordonnateur, son adjoint, la passation et le suivi-évaluation,
   déjà présents dans la grille sous un intitulé voisin. Le coordonnateur y
   figurait trois fois, sous trois titres.

   La reprise ci-dessous les fusionne : UNE fiche par poste, qui porte le mandat
   et la couleur quand elle est mise en avant, la biographie et la citation
   quand elle répond d'une composante. Deux arbitraires ont été tranchés, et il
   faut les connaître pour relire ce fichier :

     · l'INTITULÉ retenu est celui de la grille, plus court, parce que c'est lui
       que la carte de 212 pixels doit tenir sans passer sur quatre lignes ;
     · le PÔLE retenu est celui de la grille lui aussi, de sorte que la même
       personne ne relève pas de « Direction » sur une page et de
       « Coordination » sur une autre.

   Tout cela se corrige depuis la console, fiche par fiche.
   ========================================================================== */

/** Nom et mission d'un pôle dans une langue. */
export type EquipeSeedPoleTextes = {
  nom: string;
  mission?: string;
};

export type EquipeSeedPole = {
  /** Identifiant stable. C'est lui qui rend l'amorçage rejouable sans doublon. */
  key: string;
  position: number;
  color?: string;
  fr: EquipeSeedPoleTextes;
  en: EquipeSeedPoleTextes;
};

/** Textes d'une fiche dans une langue. */
export type EquipeSeedTextes = {
  /** Graphie propre à la langue. Vide : le nom de la fiche. */
  nom?: string;
  role: string;
  mandat?: string;
  bio?: string;
  verbatim?: string;
};

export type EquipeSeedMembre = {
  /** Identifiant stable (cf. `EquipeSeedPole.key`). */
  key: string;
  nom?: string;
  position: number;
  /** `key` du pôle de rattachement. */
  poleKey: string;
  /** Ajoute la fiche aux cartes de coordination de « Gouvernance ». */
  featured?: boolean;
  color?: string;
  email?: string;
  /** Composante dont la fiche est responsable (« C1 »…« C5 »). */
  composante?: string;
  /** Portrait servi depuis `public/`. */
  photoPath?: string;
  fr: EquipeSeedTextes;
  en: EquipeSeedTextes;
};

/* -------------------------------------------------------------------------- */
/* Pôles                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Les pôles tels que la grille les affiche sous chaque poste.
 *
 * Neuf, et non les cinq de l'organigramme de la page « L'Unité » : celui-ci
 * range les trois responsables de composante sous un même pôle « Composantes »,
 * là où la grille nomme la matière de chacun (« Fondations », « Compétences »).
 * C'est la grille qui est reprise ici, parce que c'est elle que le module
 * administre. L'organigramme des cinq pôles reste écrit dans `content/data.ts`,
 * qu'aucune fiche ne lit.
 *
 * Les couleurs proviennent des cartes de coordination ; elles ne sont posées
 * que sur les pôles qui en portaient une, les autres retombant sur l'accent du
 * site.
 */
export const equipeSeedPoles: EquipeSeedPole[] = [
  {
    key: "direction",
    position: 0,
    color: "#0f62fe",
    fr: { nom: "Direction", mission: "Pilotage, arbitrage, contrôle interne" },
    en: { nom: "Management", mission: "Steering, arbitration, internal control" },
  },
  {
    key: "acces-inclusion",
    position: 1,
    fr: { nom: "Accès & inclusion", mission: "Couverture, service universel, usages" },
    en: { nom: "Access & inclusion", mission: "Coverage, universal service, uptake" },
  },
  {
    key: "fondations",
    position: 2,
    fr: { nom: "Fondations", mission: "Cloud souverain, réseau de l'État, identité" },
    en: { nom: "Foundations", mission: "Sovereign cloud, government network, identity" },
  },
  {
    key: "competences",
    position: 3,
    fr: { nom: "Compétences", mission: "Formation, innovation, emploi numérique" },
    en: { nom: "Skills", mission: "Training, innovation, digital employment" },
  },
  {
    key: "fiduciaire",
    position: 4,
    fr: { nom: "Fiduciaire", mission: "Gestion financière et comptable" },
    en: { nom: "Fiduciary", mission: "Financial and accounting management" },
  },
  {
    key: "passation",
    position: 5,
    color: "#009d9a",
    fr: { nom: "Passation", mission: "Marchés publics et avis de non-objection" },
    en: { nom: "Procurement", mission: "Public procurement and no-objection letters" },
  },
  {
    key: "sauvegardes",
    position: 6,
    fr: { nom: "Sauvegardes", mission: "Conformité environnementale et sociale, VBG/EAS" },
    en: { nom: "Safeguards", mission: "Environmental and social compliance, GBV/SEA" },
  },
  {
    key: "transversal",
    position: 7,
    color: "#198038",
    fr: { nom: "Transversal", mission: "Suivi-évaluation et communication" },
    en: { nom: "Cross-cutting", mission: "Monitoring, evaluation and communication" },
  },
  {
    key: "systemes",
    position: 8,
    fr: { nom: "Systèmes", mission: "Informatique interne de l'Unité" },
    en: { nom: "Systems", mission: "The Unit's internal IT" },
  },
];

/* -------------------------------------------------------------------------- */
/* Membres                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Les douze postes de la grille, dans leur ordre d'affichage d'origine.
 *
 * Quatre portent un `mandat` et une `color` : ce sont ceux que la page
 * « Gouvernance » met en avant. Quatre portent une `composante` : ce sont ceux
 * dont la fiche s'affiche sur la page de la composante correspondante. Un poste
 * cumule les deux — le coordonnateur, qui répond directement de la C4.
 *
 * Un poste sans nom est un poste À POURVOIR, et le site le dessine ainsi depuis
 * l'origine : intitulé, pastille d'initiales, et sur une fiche de composante la
 * mention d'un recrutement en cours. Ce n'est pas une donnée manquante.
 */
export const equipeSeedMembres: EquipeSeedMembre[] = [
  {
    key: "coordonnateur",
    nom: "Noël Jean-David Litanga",
    position: 0,
    poleKey: "direction",
    featured: true,
    color: "#0f62fe",
    composante: "C4",
    photoPath: "/portraits/coordonnateur-litanga.jpg",
    fr: {
      role: "Coordonnateur",
      mandat: "Dirige l'Unité, garantit la cohérence et la relation avec les bailleurs.",
      bio: "La Composante 4 est portée directement par la coordination de l'Unité, appuyée par les pôles fiduciaire, passation, suivi-évaluation et sauvegardes.",
    },
    en: {
      role: "Coordinator",
      mandat: "Leads the Unit, secures coherence and the relationship with donors.",
      bio: "Component 4 is carried directly by the Unit's coordination, supported by the fiduciary, procurement, M&E and safeguards clusters.",
    },
  },
  {
    key: "coordonnateur-adjoint",
    position: 1,
    poleKey: "direction",
    featured: true,
    color: "#8a3ffc",
    fr: {
      role: "Coordonnateur Adjoint",
      mandat: "Pilote la qualité des livrables et le respect des normes.",
    },
    en: {
      role: "Deputy Coordinator",
      mandat: "Drives delivery quality and compliance with standards.",
    },
  },
  {
    key: "auditeur-interne",
    position: 2,
    poleKey: "direction",
    fr: { role: "Auditeur Interne" },
    en: { role: "Internal Auditor" },
  },
  {
    key: "responsable-composante-1",
    position: 3,
    poleKey: "acces-inclusion",
    composante: "C1",
    fr: { role: "Responsable Composante 1" },
    en: { role: "Component 1 Lead" },
  },
  {
    key: "responsable-composante-2",
    nom: "Christian KAZADI",
    position: 4,
    poleKey: "fondations",
    composante: "C2",
    fr: { role: "Responsable Composante 2" },
    en: { role: "Component 2 Lead" },
  },
  {
    key: "responsable-composante-3",
    position: 5,
    poleKey: "competences",
    composante: "C3",
    fr: { role: "Responsable Composante 3" },
    en: { role: "Component 3 Lead" },
  },
  {
    key: "responsable-administratif-financier",
    position: 6,
    poleKey: "fiduciaire",
    fr: { role: "Responsable Administratif & Financier" },
    en: { role: "Admin. & Finance Lead" },
  },
  {
    key: "responsable-passation",
    position: 7,
    poleKey: "passation",
    featured: true,
    color: "#009d9a",
    fr: {
      role: "Responsable Passation des Marchés",
      mandat: "Conduit une passation ouverte et traçable selon les règles de la Banque mondiale.",
    },
    en: {
      role: "Procurement Lead",
      mandat: "Runs open, traceable procurement under World Bank rules.",
    },
  },
  {
    key: "specialiste-suivi-evaluation",
    position: 8,
    poleKey: "transversal",
    featured: true,
    color: "#198038",
    fr: {
      role: "Spécialiste Suivi & Évaluation",
      mandat: "Mesure les résultats au regard du cadre 2029, sur 26 provinces.",
    },
    en: {
      role: "M&E Specialist",
      mandat: "Measures results against the 2029 framework, across 26 provinces.",
    },
  },
  {
    key: "specialiste-vbg-eas",
    position: 9,
    poleKey: "sauvegardes",
    fr: { role: "Spécialiste VBG/EAS" },
    en: { role: "GBV/SEA Specialist" },
  },
  {
    key: "specialiste-communication",
    position: 10,
    poleKey: "transversal",
    fr: { role: "Spécialiste Communication" },
    en: { role: "Communication Specialist" },
  },
  {
    key: "responsable-informatique",
    position: 11,
    poleKey: "systemes",
    fr: { role: "Responsable Informatique" },
    en: { role: "IT Lead" },
  },
];

/* -------------------------------------------------------------------------- */
/* Lectures du repli                                                           */
/* -------------------------------------------------------------------------- */

/** Fiches mises en avant, dans l'ordre de la grille. */
export const seedMembresEnAvant = (): EquipeSeedMembre[] =>
  equipeSeedMembres.filter((membre) => membre.featured);

/** Fiche responsable d'une composante, s'il en existe une. */
export const seedMembreComposante = (code: string): EquipeSeedMembre | undefined =>
  equipeSeedMembres.find((membre) => membre.composante === code);

/** Pôle d'une fiche. Jamais `undefined` en pratique : les clés sont écrites ici. */
export const seedPole = (key: string): EquipeSeedPole | undefined =>
  equipeSeedPoles.find((pole) => pole.key === key);
