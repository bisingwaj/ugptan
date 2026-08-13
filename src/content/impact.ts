/* ============================================================================
   « Histoires & impact » — contenu d'origine du site, repris à l'identique.

   Ce fichier joue DEUX rôles, et un seul à la fois :

     1. il AMORCE la base à la première ouverture du module dans la console
        (cf. src/lib/impact/bootstrap.ts) : la rédaction récupère l'existant au
        lieu de le ressaisir ;
     2. il sert de REPLI tant qu'aucune section n'est publiée pour un
        emplacement (cf. src/lib/impact/query.ts). Sans lui, une base neuve ou
        une console jamais ouverte videraient trois pages publiques de leurs
        blocs — ce qui est exactement ce qu'on ne veut pas d'une mise en ligne.

   ⚠️ Dès qu'une section publiée existe pour un emplacement, c'est elle qui fait
   foi, et ce fichier n'est plus lu pour cet emplacement. Il n'est donc pas du
   contenu « codé en dur » : c'est l'état initial d'un contenu administrable.

   Les textes proviennent de `content/carbon.ts` (témoignages, impact humain,
   avant/après, dialogues), de `content/data.ts` (jalons) et des en-têtes de
   section de `content/i18n.ts`.
   ========================================================================== */
import type { ImgKey } from "./types";
import type { ImpactEmplacement, ImpactLayout, ImpactTheme } from "@/lib/impact/statut";

/** Textes d'une entrée dans une langue. */
export type ImpactSeedTextes = {
  surtitre?: string;
  titre?: string;
  texte?: string;
  texteSecondaire?: string;
  mediaAlt?: string;
  lienLabel?: string;
};

export type ImpactSeedItem = {
  valeur?: string;
  color?: string;
  videoYt?: string;
  lienUrl?: string;
  /** Jalons : la date réelle, mise en forme dans la langue de lecture. */
  dateISO?: string;
  coverKey?: ImgKey;
  fr: ImpactSeedTextes;
  en: ImpactSeedTextes;
};

/** En-tête d'une section dans une langue. */
export type ImpactSeedEntete = {
  kicker?: string;
  titre?: string;
  lead?: string;
  ctaLabel?: string;
};

export type ImpactSeedSection = {
  /** Identifiant stable. C'est lui qui rend l'amorçage rejouable sans doublon. */
  key: string;
  emplacement: ImpactEmplacement;
  layout: ImpactLayout;
  theme: ImpactTheme;
  position: number;
  numero?: string;
  compact?: boolean;
  grandTitre?: boolean;
  /** Chemin interne : la langue est ajoutée à l'affichage (« /projet »). */
  ctaUrl?: string;
  /** `key` de la section dont les entrées sont reprises. */
  sourceKey?: string;
  limite?: number;
  fr: ImpactSeedEntete;
  en: ImpactSeedEntete;
  items: ImpactSeedItem[];
};

/* -------------------------------------------------------------------------- */
/* Témoignages — partagés par l'accueil et la page « Résultats »               */
/* -------------------------------------------------------------------------- */

const temoignages: ImpactSeedItem[] = [
  {
    color: "#8a3ffc", videoYt: "lLIB8fyagio", coverKey: "formation",
    fr: {
      titre: "Esther, 24 ans",
      surtitre: "Étudiante — Goma",
      texte: "« Avant, on se partageait un manuel rare. Aujourd'hui je suis des cours en ligne — et j'ai commencé à coder. »",
    },
    en: {
      titre: "Esther, 24",
      surtitre: "Student — Goma",
      texte: "“I used to share one rare textbook. Now I follow courses online — and I've started to code.”",
    },
  },
  {
    color: "#0f62fe", videoYt: "xQpTar5oOgA", coverKey: "citoyens",
    fr: {
      titre: "Jean-Pierre",
      surtitre: "Commerçant — Tshikapa",
      texte: "« Je vends maintenant dans tout le pays et j'encaisse par mobile. »",
    },
    en: {
      titre: "Jean-Pierre",
      surtitre: "Trader — Tshikapa",
      texte: "“I now sell across the whole country and get paid by mobile money.”",
    },
  },
  {
    color: "#009d9a", videoYt: "2ZJGxoF610c", coverKey: "sante",
    fr: {
      titre: "Dr Mwamba",
      surtitre: "Médecin — Kindu",
      texte: "« Le dossier partagé et la téléconsultation changent la prise en charge des patients. »",
    },
    en: {
      titre: "Dr Mwamba",
      surtitre: "Doctor — Kindu",
      texte: "“Shared records and tele-consultation are changing how we care for patients.”",
    },
  },
  {
    color: "#198038", videoYt: "1MKgrHH04dM", coverKey: "agri",
    fr: {
      titre: "Mama Kavira",
      surtitre: "Agricultrice — Butembo",
      texte: "« Je connais enfin les vrais prix du marché — en temps réel, avant de vendre. »",
    },
    en: {
      titre: "Mama Kavira",
      surtitre: "Farmer — Butembo",
      texte: "“I finally know the real market prices — in real time, before I sell.”",
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

export const impactSeed: ImpactSeedSection[] = [
  /* --- Accueil : impact humain (chiffres) --------------------------------- */
  {
    key: "accueil-impact-humain",
    emplacement: "ACCUEIL_IMPACT",
    layout: "STATS",
    theme: "GRIS",
    position: 0,
    grandTitre: true,
    ctaUrl: "/projet",
    fr: {
      kicker: "Impact humain",
      titre: "Ce que ces ambitions représentent, une fois traduites.",
      lead: "Ces ambitions ne sont pas des abstractions — ce sont des écoles en ligne, des femmes dans les métiers du numérique et des villages raccordés.",
      ctaLabel: "Découvrir le projet",
    },
    en: {
      kicker: "Human impact",
      titre: "What these ambitions mean, once translated.",
      lead: "These ambitions are not abstractions — they are schools online, women in digital careers and villages brought onto the network.",
      ctaLabel: "Discover the project",
    },
    items: [
      {
        valeur: "30 M",
        fr: { surtitre: "utilisateurs visés", texte: "— l'ambition d'un Congolais sur trois en ligne à l'horizon du projet." },
        en: { surtitre: "users targeted", texte: "— the ambition of one Congolese in three online over the project horizon." },
      },
      {
        valeur: "1 000",
        fr: { surtitre: "institutions", texte: "écoles, hôpitaux et administrations à raccorder progressivement." },
        en: { surtitre: "institutions", texte: "schools, hospitals and public offices to be connected progressively." },
      },
      {
        valeur: "1 000",
        fr: { surtitre: "femmes", texte: "visées parmi les diplômés du programme de compétences numériques avancées." },
        en: { surtitre: "women", texte: "targeted among the graduates of the advanced digital skills programme." },
      },
      {
        valeur: "180",
        fr: { surtitre: "communautés", texte: "rurales non desservies visées par les premiers lots de déploiement." },
        en: { surtitre: "communities", texte: "underserved rural communities targeted by the first deployment lots." },
      },
    ],
  },

  /* --- Résultats : témoignages (la collection de référence) ---------------- */
  {
    key: "resultats-histoires",
    emplacement: "RESULTATS_HISTOIRES",
    layout: "TEMOIGNAGES",
    theme: "GRIS",
    position: 0,
    fr: {
      kicker: "Histoires & impact",
      titre: "Au-delà des chiffres, des vies qui changent.",
      lead: "Celles et ceux pour qui le Projet existe — des visages, des métiers, des territoires.",
    },
    en: {
      kicker: "Stories & impact",
      titre: "Beyond the numbers, lives that change.",
      lead: "The people the Project is for — faces, trades and places across the country.",
    },
    items: temoignages,
  },

  /* --- Accueil : aperçu des mêmes témoignages ------------------------------
     La section ne porte aucune entrée : elle reprend celles de la page
     « Résultats ». Corriger une citation la corrige aux deux endroits. */
  {
    key: "accueil-histoires",
    emplacement: "ACCUEIL_HISTOIRES",
    layout: "TEMOIGNAGES",
    theme: "CLAIR",
    position: 0,
    compact: true,
    grandTitre: true,
    ctaUrl: "/resultats",
    sourceKey: "resultats-histoires",
    fr: {
      kicker: "Histoires & impact",
      titre: "Au-delà des chiffres, des vies qui changent.",
      lead: "Celles et ceux pour qui le Projet existe — des visages, des métiers, des territoires.",
      ctaLabel: "Voir toutes les histoires & vidéos",
    },
    en: {
      kicker: "Stories & impact",
      titre: "Beyond the numbers, lives that change.",
      lead: "The people the Project is for — faces, trades and places across the country.",
      ctaLabel: "See all stories & videos",
    },
    items: [],
  },

  /* --- Résultats : dialogues sectoriels ------------------------------------ */
  {
    key: "resultats-dialogues",
    emplacement: "RESULTATS_DIALOGUES",
    layout: "CARTES",
    theme: "CLAIR",
    position: 0,
    fr: {
      kicker: "Dialogues sectoriels",
      titre: "Le numérique n'est utile qu'appliqué à un métier.",
      lead: "Une infrastructure ne produit d'effet qu'à travers les politiques sectorielles qui s'en saisissent. Ces dialogues servent à identifier, avec chaque ministère et chaque profession, l'usage précis qui justifie l'investissement.",
    },
    en: {
      kicker: "Sector dialogues",
      titre: "Digital is only useful when applied to a trade.",
      lead: "Infrastructure only produces effects through the sector policies that take hold of it. These dialogues serve to identify, with each ministry and each profession, the precise use that justifies the investment.",
    },
    items: [
      {
        color: "#da1e28",
        fr: {
          surtitre: "Santé",
          titre: "Santé numérique & établissements connectés",
          texte: "Rendre l'antériorité médicale portable d'un établissement à l'autre, et permettre l'avis spécialisé sans déplacer le patient — ce qui suppose un identifiant fiable avant tout dossier partagé.",
        },
        en: {
          surtitre: "Health",
          titre: "Digital health & connected facilities",
          texte: "Making a patient's medical history portable between facilities, and enabling specialist advice without moving the patient — which requires a reliable identifier before any shared record.",
        },
      },
      {
        color: "#8a3ffc",
        fr: {
          surtitre: "Éducation",
          titre: "Écoles connectées & apprentissage en ligne",
          texte: "Raccorder les établissements pour que l'accès aux fonds documentaires ne dépende plus du nombre d'exemplaires physiques disponibles sur place.",
        },
        en: {
          surtitre: "Education",
          titre: "Connected schools & online learning",
          texte: "Connecting institutions so that access to collections no longer depends on how many physical copies are available on site.",
        },
      },
      {
        color: "#198038",
        fr: {
          surtitre: "Agriculture",
          titre: "Prix du marché & services ruraux",
          texte: "Réduire l'asymétrie d'information entre le producteur et l'acheteur : connaître le prix pratiqué ailleurs change la position de négociation avant la vente.",
        },
        en: {
          surtitre: "Agriculture",
          titre: "Market prices & rural services",
          texte: "Reducing the information asymmetry between producer and buyer: knowing the price paid elsewhere changes the bargaining position before the sale.",
        },
      },
      {
        color: "#0f62fe",
        fr: {
          surtitre: "Finance",
          titre: "Inclusion financière & mobile money",
          texte: "Lever l'obstacle d'entrée que constitue l'identification du client, puis transformer l'historique de transaction en preuve d'activité mobilisable pour un crédit.",
        },
        en: {
          surtitre: "Finance",
          titre: "Financial inclusion & mobile money",
          texte: "Removing the entry barrier of customer identification, then turning transaction history into evidence of activity that can support a loan.",
        },
      },
      {
        color: "#009d9a",
        fr: {
          surtitre: "Administration",
          titre: "Services publics numériques par défaut",
          texte: "Cesser de demander à l'usager une information que l'administration détient déjà, ce qui suppose des registres capables de se vérifier mutuellement.",
        },
        en: {
          surtitre: "Public services",
          titre: "Digital-by-default public services",
          texte: "Ceasing to ask users for information the administration already holds, which requires registries able to verify one another.",
        },
      },
      {
        color: "#ff832b",
        fr: {
          surtitre: "Secteur privé",
          titre: "Startups, hubs & économie numérique",
          texte: "Créer la demande locale sans laquelle les compétences formées quittent le pays : services, contenus et hébergement produits en RDC.",
        },
        en: {
          surtitre: "Private sector",
          titre: "Startups, hubs & the digital economy",
          texte: "Creating the local demand without which trained skills leave the country: services, content and hosting produced in the DRC.",
        },
      },
    ],
  },

  /* --- Le projet : ce que ça change (avant / après) ------------------------ */
  {
    key: "projet-changements",
    emplacement: "PROJET_CHANGEMENTS",
    layout: "AVANT_APRES",
    theme: "GRIS",
    position: 0,
    fr: {
      kicker: "Ce que ça change pour vous",
      titre: "Ce qui change vraiment tient souvent à une seule chose : ne plus avoir à se déplacer pour prouver ce que l'administration sait déjà.",
      lead: "Un projet d'infrastructure ne se juge pas à ce qu'il installe, mais à ce qu'il rend possible — et à ce qu'il cesse d'imposer. Voici, secteur par secteur, la contrainte d'aujourd'hui et le mécanisme précis qui la lève.",
    },
    en: {
      kicker: "What it changes for you",
      titre: "What really changes often comes down to one thing: no longer travelling to prove what the administration already knows.",
      lead: "An infrastructure project is judged not by what it installs, but by what it makes possible — and by what it stops imposing. Here, sector by sector, is today's constraint and the precise mechanism that lifts it.",
    },
    items: [
      {
        valeur: "01",
        fr: {
          titre: "Démarches administratives",
          texteSecondaire: "Le même justificatif est redemandé à chaque guichet, parce qu'aucun service ne peut vérifier ce que détient le service voisin. La charge de la preuve pèse sur l'usager.",
          texte: "Une information déjà détenue par l'administration est vérifiée à sa source, entre systèmes. Ce qui reste demandé à l'usager, c'est ce que l'État ne sait pas.",
        },
        en: {
          titre: "Administrative paperwork",
          texteSecondaire: "The same supporting document is demanded at every counter, because no office can check what the neighbouring office holds. The burden of proof falls on the user.",
          texte: "Information the administration already holds is checked at source, system to system. What is still asked of the user is what the State does not know.",
        },
      },
      {
        valeur: "02",
        fr: {
          titre: "École & université",
          texteSecondaire: "L'accès aux ressources dépend d'exemplaires physiques rares et d'une bande passante partagée, quand le campus est raccordé. Le savoir circule à la vitesse du papier.",
          texte: "Un établissement raccordé ouvre à tous ses étudiants les mêmes fonds documentaires, au même moment, quelle que soit la province.",
        },
        en: {
          titre: "School & university",
          texteSecondaire: "Access to resources depends on scarce physical copies and shared bandwidth, where the campus is connected at all. Knowledge travels at the speed of paper.",
          texte: "A connected institution opens the same collections to all its students, at the same time, whatever the province.",
        },
      },
      {
        valeur: "03",
        fr: {
          titre: "Petite entreprise",
          texteSecondaire: "Le marché s'arrête où s'arrête le déplacement physique, et le paiement en espèces ne laisse aucune trace utilisable pour obtenir un crédit.",
          texte: "La vente à distance élargit la clientèle, et l'historique de paiement devient un actif : une preuve d'activité opposable à un prêteur.",
        },
        en: {
          titre: "Small business",
          texteSecondaire: "The market ends where physical travel ends, and cash payment leaves no record usable to obtain credit.",
          texte: "Remote selling widens the customer base, and payment history becomes an asset: evidence of activity that a lender can rely on.",
        },
      },
      {
        valeur: "04",
        fr: {
          titre: "Santé",
          texteSecondaire: "L'historique du patient reste dans l'établissement où il a été écrit. Un transfert, une épidémie ou un déplacement de population fait perdre l'antériorité médicale.",
          texte: "Un identifiant fiable et un dossier consultable à distance rendent l'antériorité portable, et permettent l'avis spécialisé sans déplacer le patient.",
        },
        en: {
          titre: "Health",
          texteSecondaire: "The patient's history stays in the facility where it was written. A transfer, an epidemic or a population movement erases the medical record.",
          texte: "A reliable identifier and a remotely accessible record make that history portable, and allow specialist advice without moving the patient.",
        },
      },
      {
        valeur: "05",
        fr: {
          titre: "Inclusion financière",
          texteSecondaire: "Sans identité vérifiable, l'ouverture d'un compte se heurte aux obligations de connaissance du client : l'exclusion est réglementaire autant qu'économique.",
          texte: "Une identité numérique inclusive lève cet obstacle d'entrée, et rend possibles l'épargne, le paiement et, progressivement, le crédit.",
        },
        en: {
          titre: "Financial inclusion",
          texteSecondaire: "Without verifiable identity, opening an account runs into know-your-customer obligations: exclusion is regulatory as much as economic.",
          texte: "An inclusive digital identity removes that entry barrier, making saving, payment and, progressively, credit possible.",
        },
      },
      {
        valeur: "06",
        fr: {
          titre: "Zones rurales",
          texteSecondaire: "La faible densité et le coût de l'énergie placent ces zones sous le seuil de rentabilité d'un déploiement commercial : le réseau s'y arrête, durablement.",
          texte: "Un appui ciblé au déploiement et des solutions énergétiques adaptées déplacent ce seuil, et rendent la couverture soutenable là où elle ne l'était pas.",
        },
        en: {
          titre: "Rural areas",
          texteSecondaire: "Low density and energy costs place these areas below the profitability threshold for a commercial rollout: the network stops there, lastingly.",
          texte: "Targeted deployment support and adapted energy solutions move that threshold, making coverage sustainable where it was not.",
        },
      },
    ],
  },

  /* --- Le projet : calendrier & jalons -------------------------------------
     Aucun titre : la frise n'a jamais porté de H2 sur le site, et lui en
     ajouter un changerait le dessin de la page. Le champ reste ouvert en
     console pour qui voudra en poser un. */
  {
    key: "projet-jalons",
    emplacement: "PROJET_JALONS",
    layout: "JALONS",
    theme: "CLAIR",
    position: 0,
    fr: { kicker: "Calendrier & jalons" },
    en: { kicker: "Timeline & milestones" },
    items: [
      {
        dateISO: "2024-11-25",
        fr: { texte: "Signature de l'accord avec la Banque mondiale" },
        en: { texte: "Financing agreement signed with the World Bank" },
      },
      {
        dateISO: "2025-03-14",
        fr: { texte: "Signature de la convention avec l'AFD" },
        en: { texte: "Financing convention signed with AFD" },
      },
      {
        dateISO: "2025-04-15",
        fr: { texte: "Création de l'UGPTN (arrêté ministériel)" },
        en: { texte: "Creation of the UGPTN (ministerial order)" },
      },
      {
        dateISO: "2025-06-23",
        fr: { texte: "Validation du Manuel d'Exécution (MEP)" },
        en: { texte: "Validation of the Implementation Manual (PIM)" },
      },
      {
        dateISO: "2025-10-31",
        fr: { texte: "Entrée en vigueur du projet" },
        en: { texte: "Project effectiveness" },
      },
      {
        dateISO: "2029-12-31",
        fr: { texte: "Achèvement technique" },
        en: { texte: "Technical completion" },
      },
      {
        dateISO: "2030-04-30",
        fr: { texte: "Date limite de décaissement IDA" },
        en: { texte: "IDA disbursement deadline" },
      },
    ],
  },
];

/** Sections d'amorçage d'un emplacement donné, dans l'ordre d'affichage. */
export const seedPourEmplacement = (emplacement: ImpactEmplacement): ImpactSeedSection[] =>
  impactSeed.filter((s) => s.emplacement === emplacement).sort((a, b) => a.position - b.position);

/** Entrées effectives d'une section d'amorçage, reprise comprise. */
export function seedItems(section: ImpactSeedSection): ImpactSeedItem[] {
  const source = section.sourceKey
    ? impactSeed.find((s) => s.key === section.sourceKey)
    : section;
  const items = source?.items ?? [];
  return section.limite && section.limite > 0 ? items.slice(0, section.limite) : items;
}
