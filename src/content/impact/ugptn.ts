/* ============================================================================
   Page « L'UGPTN » — contenu d'origine du site, repris à l'identique.

   Rôle et invariants : cf. l'en-tête de `index.ts`.

   Provenance, bloc par bloc :
     · citation, arrêté ......... `content/data.ts` (`engagement`, `meta`)
     · mandat, principes ........ `content/data.ts` (`mandat`, `principes`)
     · organigramme ............. `content/data.ts` (`poles`)
     · engagements, méthode ..... `content/carbon.ts`
     · questions, glossaire ..... `content/carbon.ts` (`ugptnFaq`, `glossaire`)
     · en-têtes de section ...... `content/i18n.ts` (`dict().ugptn`)

   ⚠️ Les deux rattachements de pôles marqués « À VALIDER » dans `data.ts` sont
   repris TELS QUELS, commentaires compris. La mise en base n'est pas le moment
   de trancher un arbitrage qui appartient à l'Unité : elle le rend seulement
   corrigeable sans déploiement.
   ========================================================================== */
import type { ImpactSeedSection } from "./types";

export const ugptnSeed: ImpactSeedSection[] = [
  /* --- La citation d'engagement, sous le héros ----------------------------- */
  {
    key: "ugptn-engagement",
    emplacement: "UGPTN_ENGAGEMENT",
    layout: "CITATION",
    theme: "CLAIR",
    position: 0,
    fr: {
      titre:
        "Faire du numérique un droit, et non un privilège : un investissement structurant pour qu'un nombre croissant de Congolaises et de Congolais puisse accéder, apprendre et entreprendre.",
      note: "Créée par arrêté ministériel · CAB/MIN/PT&N/AKIM/KL/Kbs/017/2025 · 15 avril 2025",
    },
    en: {
      titre:
        "Making digital a right, not a privilege: a structuring investment so that a growing number of Congolese women and men can connect, learn and build.",
      note: "Created by ministerial order · CAB/MIN/PT&N/AKIM/KL/Kbs/017/2025 · 15 avril 2025",
    },
    items: [],
  },

  /* --- 1 · Mandat ---------------------------------------------------------- */
  {
    key: "ugptn-mandat",
    emplacement: "UGPTN_MANDAT",
    layout: "ETAPES",
    theme: "CLAIR",
    position: 0,
    fr: {
      kicker: "Mandat",
      titre: "La capacité d'exécution est un actif. Elle se construit, elle ne se décrète pas.",
      lead: "Un financement international n'est utile qu'à proportion de ce qu'une équipe sait en faire : préparer des dossiers qui passent la revue du bailleur, mettre en concurrence sans contentieux, superviser des chantiers dispersés sur un territoire immense, et rendre compte de chaque étape. C'est ce métier-là que l'Unité exerce.",
    },
    en: {
      kicker: "Mandate",
      titre: "Delivery capacity is an asset. It is built, not decreed.",
      lead: "International financing is only as useful as a team's ability to use it: preparing files that pass donor review, competing contracts without litigation, supervising sites scattered across a vast territory, and accounting for every step. That is the trade the Unit practises.",
    },
    items: [
      {
        valeur: "01",
        fr: {
          titre: "Coordination",
          texte: "Faire tenir ensemble des chantiers qui dépendent les uns des autres : arbitrer les séquences entre composantes, tenir le calendrier commun avec les ministères bénéficiaires, et porter une seule version des faits devant les partenaires et les bailleurs.",
        },
        en: {
          titre: "Coordination",
          texte: "Holding together workstreams that depend on one another: arbitrating sequences between components, keeping a common schedule with beneficiary ministries, and presenting one single account of the facts to partners and donors.",
        },
      },
      {
        valeur: "02",
        fr: {
          titre: "Exécution",
          texte: "Transformer un plan en contrats exécutables : programmation annuelle (PTBA), préparation des dossiers d'appel d'offres, mise en concurrence, attribution après non-objection, puis suivi de l'exécution jusqu'à la réception.",
        },
        en: {
          titre: "Execution",
          texte: "Turning a plan into executable contracts: annual programming (AWPB), preparation of bidding documents, competition, award after no-objection, then monitoring delivery through to acceptance.",
        },
      },
      {
        valeur: "03",
        fr: {
          titre: "Supervision technique",
          texte: "Vérifier que ce qui est livré correspond à ce qui a été spécifié, et que les normes structurantes — interopérabilité, identité, cybersécurité — sont respectées avant réception, pas constatées après.",
        },
        en: {
          titre: "Technical supervision",
          texte: "Checking that what is delivered matches what was specified, and that the structuring standards — interoperability, identity, cybersecurity — are met before acceptance, not observed afterwards.",
        },
      },
      {
        valeur: "04",
        fr: {
          titre: "Supervision fiduciaire",
          texte: "Tenir la chaîne de la dépense de bout en bout — compte désigné, justification des décaissements, comptabilité, rapports périodiques — de sorte qu'un auditeur externe puisse reconstituer chaque opération sans reconstitution a posteriori.",
        },
        en: {
          titre: "Fiduciary supervision",
          texte: "Holding the expenditure chain end to end — designated account, justification of disbursements, accounting, periodic reports — so that an external auditor can reconstruct every transaction without after-the-fact reconstruction.",
        },
      },
      {
        valeur: "05",
        fr: {
          titre: "Reddition de comptes",
          texte: "Publier ce qui est décidé et mesuré, y compris les retards, pour que l'exécution reste contestable pendant qu'elle peut encore être corrigée.",
        },
        en: {
          titre: "Accountability",
          texte: "Publishing what is decided and measured, including delays, so that delivery stays contestable while it can still be corrected.",
        },
      },
    ],
  },

  /* --- 2 · Ce qui borne ses décisions -------------------------------------- */
  {
    key: "ugptn-principes",
    emplacement: "UGPTN_PRINCIPES",
    layout: "PRINCIPES",
    theme: "GRIS",
    position: 0,
    fr: {
      kicker: "Ce qui borne ses décisions",
      titre: "Trois règles, et ce qu'elles engagent en pratique.",
    },
    en: {
      kicker: "What bounds its decisions",
      titre: "Three rules, and what they commit to in practice.",
    },
    items: [
      {
        fr: {
          titre: "Le MEP reste la source de vérité.",
          texte: "Un manuel validé par les trois parties fixe les règles avant les difficultés. L'Unité l'applique et, si une règle doit évoluer, elle le fait par avenant tracé — jamais par interprétation en cours d'exécution.",
        },
        en: {
          titre: "The PIM remains the source of truth.",
          texte: "A manual validated by the three parties sets the rules before difficulties arise. The Unit applies it and, where a rule must change, does so through a traceable amendment — never by interpretation mid-delivery.",
        },
      },
      {
        fr: {
          titre: "Les acteurs restent décisionnaires.",
          texte: "Un système d'information prépare, calcule et journalise ; il ne signe pas. L'attribution d'un marché, la validation d'un livrable ou la clôture d'une plainte relèvent de personnes identifiées et responsables de leur décision.",
        },
        en: {
          titre: "Stakeholders remain the decision-makers.",
          texte: "An information system prepares, computes and logs; it does not sign. Awarding a contract, accepting a deliverable or closing a grievance rests with identified people, accountable for their decision.",
        },
      },
      {
        fr: {
          titre: "Les bailleurs gardent la main.",
          texte: "L'avis de non-objection n'est pas une formalité : c'est un point de passage qui conditionne l'engagement de la dépense. La supervision conjointe et l'audit externe s'exercent en cours de projet, pas seulement à la clôture.",
        },
        en: {
          titre: "Donors keep control.",
          texte: "A no-objection is not a formality: it is a checkpoint that conditions the commitment of expenditure. Joint supervision and external audit are exercised during the project, not only at closure.",
        },
      },
    ],
  },

  /* --- 2 bis · Les engagements, dans la même bande grise ------------------- */
  {
    key: "ugptn-engagements",
    emplacement: "UGPTN_PRINCIPES",
    layout: "ENGAGEMENTS",
    theme: "GRIS",
    position: 1,
    enchaine: true,
    fr: { titre: "Des engagements vérifiables, pas des intentions." },
    en: { titre: "Verifiable commitments, not intentions." },
    items: [
      {
        color: "#0f62fe",
        fr: {
          titre: "Transparence",
          texte: "Chaque avis publié, chaque attribution rendue publique — y compris quand le résultat ne nous arrange pas.",
        },
        en: {
          titre: "Transparency",
          texte: "Every notice published, every award made public — including when the outcome is inconvenient.",
        },
      },
      {
        color: "#8a3ffc",
        fr: {
          titre: "Réactivité",
          texte: "Chaque plainte instruite, avec un délai de traitement visé de 30 jours.",
        },
        en: {
          titre: "Responsiveness",
          texte: "Every grievance investigated, with a target handling time of 30 days.",
        },
      },
      {
        color: "#198038",
        fr: {
          titre: "Sauvegardes",
          texte: "Les instruments environnementaux et sociaux sont consultés et divulgués avant les travaux, jamais régularisés après.",
        },
        en: {
          titre: "Safeguards",
          texte: "Environmental and social instruments are consulted and disclosed before works, never regularised afterwards.",
        },
      },
      {
        color: "#ee5396",
        fr: {
          titre: "Protection des données",
          texte: "Accès limité au strict nécessaire et cloisonnement des canaux : les données du canal confidentiel ne circulent nulle part ailleurs.",
        },
        en: {
          titre: "Data protection",
          texte: "Access limited to what is strictly necessary and channels kept separate: data from the confidential channel travels nowhere else.",
        },
      },
    ],
  },

  /* --- 3 · Organisation interne : les repères ------------------------------ */
  {
    key: "ugptn-organisation-reperes",
    emplacement: "UGPTN_ORGANISATION",
    layout: "REPERES",
    theme: "CLAIR",
    position: 0,
    fr: {
      kicker: "Organisation interne",
      titre: "L'organisation, pôle par pôle.",
      lead: "Un pôle se juge à ses livrables datés, pas à son organigramme. Chacun porte une responsabilité distincte, et un dossier en cours dont l'avancement est vérifiable.",
    },
    en: {
      kicker: "Internal organisation",
      titre: "The organisation, cluster by cluster.",
      lead: "A cluster is judged by its dated deliverables, not by its org chart. Each carries a distinct responsibility, and a live file whose progress can be checked.",
    },
    /* Ces trois chiffres étaient DÉRIVÉS des tables du site (nombre de pôles,
       nombre d'organes de gouvernance, année de l'arrêté). Ils deviennent
       saisis : la page les affiche désormais tels qu'on les y écrit, et non
       tels qu'une longueur de tableau les calcule. */
    items: [
      { valeur: "5", fr: { titre: "pôles" }, en: { titre: "clusters" } },
      { valeur: "3", fr: { titre: "niveaux de gouvernance" }, en: { titre: "levels of governance" } },
      { valeur: "2025", fr: { titre: "Créée par arrêté ministériel" }, en: { titre: "Created by ministerial order" } },
    ],
  },

  /* --- 3 bis · L'organigramme, sous les repères ---------------------------- */
  {
    key: "ugptn-organisation-poles",
    emplacement: "UGPTN_ORGANISATION",
    layout: "POLES",
    theme: "CLAIR",
    position: 1,
    enchaine: true,
    fr: {},
    en: {},
    items: [
      {
        /* ← « Coordination & administration ». Sûr sur l'arbitrage et la relation
           aux cofinanceurs ; le contrôle interne porté par l'Auditeur n'apparaît
           pas dans la mission reprise. */
        color: "#0f62fe",
        tags: ["Coordonnateur", "Coordonnateur Adjoint", "Auditeur Interne"],
        fr: {
          titre: "Direction",
          surtitre: "Pilotage, arbitrage, contrôle interne",
          texte: "Arbitre les priorités entre composantes et tient la relation avec les ministères bénéficiaires et les cofinanceurs.",
          texteSecondaire: "Plan de travail glissant 18 mois et reporting bailleurs.",
        },
        en: {
          titre: "Management",
          surtitre: "Steering, arbitration, internal control",
          texte: "Arbitrates priorities between components and holds the relationship with beneficiary ministries and co-financiers.",
          texteSecondaire: "Rolling 18-month work plan and donor reporting.",
        },
      },
      {
        /* ⚠️ À VALIDER — rattaché à l'ancien « Technique & normes ». Le dossier en
           cours (identité, interopérabilité) relève bien du RC2, mais l'intitulé
           d'origine décrivait la supervision technique, qui est une fonction de
           l'Unité entière et non d'un pôle. */
        color: "#8a3ffc",
        tags: ["Responsable Composante 1 (RC1)", "Responsable Composante 2 (RC2)", "Responsable Composante 3 (RC3)"],
        fr: {
          titre: "Composantes",
          surtitre: "Mise en œuvre technique des activités",
          texte: "Fixe les spécifications et les normes en amont, puis vérifie la conformité des livrables avant réception.",
          texteSecondaire: "Architecture d'identité numérique et interopérabilité.",
        },
        en: {
          titre: "Components",
          surtitre: "Technical implementation of activities",
          texte: "Sets specifications and standards upstream, then verifies deliverables against them before acceptance.",
          texteSecondaire: "Digital identity and interoperability architecture.",
        },
      },
      {
        /* ← « Gestion fiduciaire ». Rattachement direct. */
        color: "#ee5396",
        tags: ["Responsable Administratif et Financier (RAF)", "Comptable", "Caissier", "Logisticien"],
        fr: {
          titre: "Fiduciaire",
          surtitre: "Gestion financière et comptable",
          texte: "Tient la traçabilité de chaque dépense, du compte désigné au justificatif, et prépare la revue des auditeurs externes.",
          texteSecondaire: "Compte désigné et rapports financiers trimestriels.",
        },
        en: {
          titre: "Fiduciary",
          surtitre: "Financial and accounting management",
          texte: "Maintains the traceability of every expenditure, from designated account to supporting document, and prepares external audit review.",
          texteSecondaire: "Designated account and quarterly financial reports.",
        },
      },
      {
        /* ← « Passation des marchés ». Rattachement direct. */
        color: "#009d9a",
        tags: ["Responsable Passation des Marchés (RPM)", "Chargé de Passation des Marchés"],
        fr: {
          titre: "Passation",
          surtitre: "Marchés publics et ANO",
          texte: "Traduit un besoin technique en dossier d'appel d'offres défendable, et conduit la mise en concurrence jusqu'à l'attribution.",
          texteSecondaire: "Appel d'offres pour le backbone fibre des provinces de l'Est (AOI/C1).",
        },
        en: {
          titre: "Procurement",
          surtitre: "Public procurement and NOL",
          texte: "Translates a technical need into a defensible bidding document, and runs the competition through to award.",
          texteSecondaire: "Tender for the Eastern provinces' fibre backbone (AOI/C1).",
        },
      },
      {
        /* ⚠️ À VALIDER — rattaché à l'ancien « Suivi-évaluation & sauvegardes ».
           Le pôle couvre en plus la communication et l'informatique, que la
           mission reprise n'évoque pas. */
        color: "#198038",
        tags: [
          "Spécialiste Environnement",
          "Spécialiste Développement Social",
          "Spécialiste VBG/EAS",
          "Spécialiste Suivi & Évaluation",
          "Spécialiste Communication",
          "Responsable Informatique (IT)",
          "Agent de liaison provincial",
        ],
        fr: {
          titre: "Sauvegardes & transversal",
          surtitre: "Conformité E&S, suivi, communication, systèmes",
          texte: "Documente l'état initial avant travaux, mesure l'écart ensuite, et traite les effets sociaux et environnementaux du chantier.",
          texteSecondaire: "Étude de référence et déploiement du MGP dans les provinces.",
        },
        en: {
          titre: "Safeguards & cross-cutting",
          surtitre: "E&S compliance, M&E, communication, systems",
          texte: "Documents the baseline before works, measures the gap afterwards, and handles the social and environmental effects of the worksite.",
          texteSecondaire: "Baseline study and rollout of the GRM across the provinces.",
        },
      },
    ],
  },

  /* --- 4 · Méthode --------------------------------------------------------- */
  {
    key: "ugptn-methode",
    emplacement: "UGPTN_METHODE",
    layout: "ETAPES",
    theme: "SOMBRE",
    position: 0,
    fr: {
      kicker: "Notre méthode",
      titre: "Du financement aux résultats : un cycle, répété marché après marché.",
      lead: "Le même enchaînement s'applique à un chantier de fibre, à une plateforme informatique ou à un programme de formation. C'est sa répétabilité qui permet de conduire des dizaines de marchés en parallèle sans improviser à chaque fois.",
    },
    en: {
      kicker: "How we work",
      titre: "From financing to results: one cycle, repeated contract after contract.",
      lead: "The same sequence applies to a fibre worksite, an IT platform or a training programme. It is its repeatability that makes it possible to run dozens of contracts in parallel without improvising each time.",
    },
    items: [
      {
        valeur: "01",
        fr: {
          titre: "Planifier",
          texte: "Traduire le manuel en plan daté (PTBA / PPM), en plaçant les revues du bailleur sur le calendrier plutôt qu'en les découvrant en route.",
        },
        en: {
          titre: "Plan",
          texte: "Translating the manual into a dated plan (AWPB / PP), placing donor reviews on the schedule rather than discovering them en route.",
        },
      },
      {
        valeur: "02",
        fr: {
          titre: "Passer les marchés",
          texte: "Publier un dossier complet dès la première fois : une relance pour cause de pièce manquante coûte une saison de travaux.",
        },
        en: {
          titre: "Procure",
          texte: "Publishing a complete file first time round: a relaunch caused by a missing document costs a construction season.",
        },
      },
      {
        valeur: "03",
        fr: {
          titre: "Contractualiser",
          texte: "Évaluer selon les critères annoncés, obtenir l'avis de non-objection, puis engager — l'ordre compte et n'admet pas de raccourci.",
        },
        en: {
          titre: "Contract",
          texte: "Evaluating against the announced criteria, obtaining the no-objection, then committing — the order matters and admits no shortcut.",
        },
      },
      {
        valeur: "04",
        fr: {
          titre: "Exécuter & superviser",
          texte: "Contrôler sur site et sur pièces, traiter les plaintes riveraines à mesure, et refuser une réception non conforme tant qu'elle l'est.",
        },
        en: {
          titre: "Deliver & supervise",
          texte: "Checking on site and on record, handling neighbouring communities’ grievances as they arise, and refusing acceptance while a deliverable remains non-compliant.",
        },
      },
      {
        valeur: "05",
        fr: {
          titre: "Mesurer & rendre compte",
          texte: "Rapporter l'avancement province par province, publier les écarts au plan, et alimenter la revue suivante avec ce qui n'a pas fonctionné.",
        },
        en: {
          titre: "Measure & account",
          texte: "Reporting progress province by province, publishing gaps against plan, and feeding the next review with what did not work.",
        },
      },
    ],
  },

  /* --- 5 · Équipe : l'en-tête seul ---------------------------------------- */
  {
    key: "ugptn-equipe",
    emplacement: "UGPTN_EQUIPE",
    layout: "EQUIPE",
    theme: "CLAIR",
    position: 0,
    fr: {
      kicker: "L'équipe de l'Unité",
      titre: "Qui fait quoi, à l'Unité.",
      lead: "Une équipe d'exécution organisée en cinq pôles, du pilotage national à la liaison avec les provinces. Chaque fiche porte le périmètre de la personne, pas un titre seul.",
    },
    en: {
      kicker: "The Unit's team",
      titre: "Who does what, inside the Unit.",
      lead: "A delivery team organised into five clusters, from national steering to liaison with the provinces. Each profile carries the person's remit, not a job title alone.",
    },
    items: [],
  },

  /* --- 6 · Questions ------------------------------------------------------- */
  {
    key: "ugptn-questions",
    emplacement: "UGPTN_QUESTIONS",
    layout: "FAQ",
    theme: "GRIS",
    position: 0,
    fr: { kicker: "À propos de l'Unité", titre: "Questions fréquentes." },
    en: { kicker: "About the Unit", titre: "Frequently asked questions." },
    items: [
      {
        fr: {
          titre: "Qu'est-ce que l'UGPTN, exactement ?",
          texte: "Une structure d'exécution à durée déterminée, créée par arrêté pour conduire un projet précis. Elle n'a pas de compétence réglementaire, ne délivre aucun service au public et disparaîtra avec le projet : sa raison d'être est de porter une capacité de gestion que l'administration ordinaire n'a pas vocation à maintenir en permanence.",
        },
        en: {
          titre: "What exactly is the UGPTN?",
          texte: "A time-limited delivery structure, created by ministerial order to run one specific project. It holds no regulatory powers, delivers no service to the public, and will end with the project: its purpose is to carry a management capacity that the ordinary administration is not meant to maintain permanently.",
        },
      },
      {
        fr: {
          titre: "Quelle différence avec le Ministère ?",
          texte: "Le ministère décide de la politique, fixe les priorités et exerce la tutelle ; l'Unité met en œuvre ce qui a été décidé et en rend compte. Concrètement : un ministère peut demander qu'un chantier soit engagé ; l'Unité ne peut pas décider qu'il le soit.",
        },
        en: {
          titre: "How is it different from the Ministry?",
          texte: "The ministry sets policy, defines priorities and exercises oversight; the Unit implements what has been decided and accounts for it. Concretely: a ministry can require that a workstream be launched; the Unit cannot decide that it should be.",
        },
      },
      {
        fr: {
          titre: "Qui dirige l'Unité ?",
          texte: "Un Coordonnateur national, sous la supervision du Comité de Pilotage. L'organisation compte cinq pôles — Direction, Composantes, Fiduciaire, Passation, Sauvegardes & transversal — et des agents de liaison en province : l'exécution ne se pilote pas uniquement depuis Kinshasa.",
        },
        en: {
          titre: "Who leads the Unit?",
          texte: "A National Coordinator, under the supervision of the Steering Committee. The organisation has five clusters — Management, Components, Fiduciary, Procurement, Safeguards & cross-cutting — and provincial liaison officers: delivery cannot be steered from Kinshasa alone.",
        },
      },
      {
        fr: {
          titre: "Comment est-elle financée ?",
          texte: "Par le Projet lui-même, cofinancé par la Banque mondiale (IDA) et l'Agence Française de Développement. Le fonctionnement de l'Unité relève de la composante de coordination et de gestion.",
        },
        en: {
          titre: "How is it financed?",
          texte: "Through the Project itself, co-financed by the World Bank (IDA) and the French Development Agency. The Unit's own operating costs fall under the coordination and management component.",
        },
      },
      {
        fr: {
          titre: "L'Unité décide-t-elle des attributions ?",
          texte: "Non, pas seule. L'évaluation applique les critères publiés dans le dossier d'appel d'offres, elle est conduite par une commission et son résultat est soumis à l'avis de non-objection du bailleur avant toute notification. C'est ce triple verrou — critères annoncés, évaluation collégiale, revue externe — qui rend une attribution contestable et défendable.",
        },
        en: {
          titre: "Does the Unit decide who wins contracts?",
          texte: "No, not alone. Evaluation applies the criteria published in the bidding document, is conducted by a committee, and its result is submitted for the donor's no-objection before any notification. It is this triple lock — announced criteria, collegial evaluation, external review — that makes an award both challengeable and defensible.",
        },
      },
      {
        fr: {
          titre: "Comment travailler avec l'Unité ?",
          texte: "Selon ce que vous êtes. Une entreprise crée un compte vérifié et répond aux avis publiés. Une institution bénéficiaire passe par le comité technique. Un chercheur ou un journaliste trouve les documents divulgables dans le dépôt public. Un citoyen peut assister aux consultations, ou saisir le mécanisme de plaintes s'il constate une difficulté.",
        },
        en: {
          titre: "How can I work with the Unit?",
          texte: "It depends who you are. A company creates a verified account and responds to published notices. A beneficiary institution goes through the technical committee. A researcher or journalist finds disclosable documents in the public repository. A citizen can attend consultations, or use the grievance mechanism if they encounter a difficulty.",
        },
      },
    ],
  },

  /* --- 6 bis · Le glossaire, replié sous les questions --------------------- */
  {
    key: "ugptn-glossaire",
    emplacement: "UGPTN_QUESTIONS",
    layout: "GLOSSAIRE",
    theme: "GRIS",
    position: 1,
    enchaine: true,
    fr: {
      titre: "Les sigles que vous rencontrerez, et ce qu'ils recouvrent.",
      lead: "Le vocabulaire des projets financés par les bailleurs est technique par nécessité : chaque terme renvoie à une procédure précise. En voici la traduction.",
    },
    en: {
      titre: "The acronyms you will meet, and what they cover.",
      lead: "The vocabulary of donor-financed projects is technical out of necessity: each term refers to a precise procedure. Here is the translation.",
    },
    items: [
      {
        valeur: "MEP",
        fr: { texte: "Manuel d'Exécution du Projet — la source de vérité." },
        en: { texte: "Project Implementation Manual — the source of truth." },
      },
      {
        valeur: "COPIL",
        fr: { texte: "Comité de Pilotage — orientation stratégique." },
        en: { texte: "Steering Committee — strategic orientation." },
      },
      {
        valeur: "CTP",
        fr: { texte: "Comité Technique du Projet — préparation et suivi techniques." },
        en: { texte: "Technical Committee — technical preparation & follow-up." },
      },
      {
        valeur: "ANO",
        fr: { texte: "Avis de Non-Objection — l'accord préalable du bailleur." },
        en: { texte: "No-Objection — the donor's prior clearance." },
      },
      {
        valeur: "PPM",
        fr: { texte: "Plan de Passation des Marchés — le calendrier des marchés." },
        en: { texte: "Procurement Plan — the schedule of contracts." },
      },
      {
        valeur: "PTBA",
        fr: { texte: "Plan de Travail et Budget Annuel." },
        en: { texte: "Annual Work Plan & Budget." },
      },
      {
        valeur: "STEP",
        fr: { texte: "Système de suivi des marchés de la Banque mondiale." },
        en: { texte: "World Bank procurement tracking system." },
      },
      {
        valeur: "NES",
        fr: { texte: "Normes Environnementales et Sociales." },
        en: { texte: "Environmental & Social Standards." },
      },
      {
        valeur: "MGP",
        fr: { texte: "Mécanisme de Gestion des Plaintes." },
        en: { texte: "Grievance Redress Mechanism." },
      },
      {
        valeur: "IDA / AFD",
        fr: { texte: "Les deux cofinanceurs du projet." },
        en: { texte: "The project's two co-financiers." },
      },
    ],
  },
];
