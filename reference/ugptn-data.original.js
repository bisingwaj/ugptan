/* ============================================================================
   UGPTN — Données canoniques du site institutionnel
   Source de vérité : Manuel d'Exécution du Projet (MEP) du 23 juin 2025.
   Les montants, dates, indicateurs et structures sont immuables.
   Exposé en global pour être consommé par chaque proposition (DC).
   ========================================================================== */
(function () {
  const D = {};

  /* --- Identité projet ---------------------------------------------------- */
  D.meta = {
    unite: "UGPTN",
    uniteLong: "Unité de Gestion du Projet de Transformation Numérique",
    projet: "PTN-RDC",
    projetLong: "Projet de Transformation Numérique de la République Démocratique du Congo",
    code: "P180495",
    tutelle: "MPTN",
    tutelleLong: "Ministère des Postes, Télécommunications et Numérique",
    bailleurs: "IDA (Banque mondiale) · AFD",
    arrete: "CAB/MIN/PT&N/AKIM/KL/Kbs/017/2025",
    arreteDate: "15 avril 2025",
    mep: "Manuel d'Exécution du Projet (MEP) — 23 juin 2025",
    ville: "Kinshasa",
    approche: "APM IDEA — Digitalisation Inclusive en Afrique Orientale et Australe"
  };

  /* --- Chiffres clés ------------------------------------------------------ */
  D.chiffres = [
    { value: 510, unit: "M USD", label: { fr: "Enveloppe totale", en: "Total envelope" }, sub: { fr: "Investissement structurant", en: "Structuring investment" } },
    { value: 400, unit: "M USD", pct: "79 %", label: { fr: "Financement IDA", en: "IDA financing" }, sub: { fr: "Banque mondiale — chef de file", en: "World Bank — lead" } },
    { value: 110, unit: "M USD", pct: "21 %", label: { fr: "Financement AFD", en: "AFD financing" }, sub: { fr: "soit 100 M EUR", en: "i.e. EUR 100M" } },
    { value: 165, unit: "M USD", label: { fr: "Capitaux privés (cible)", en: "Private capital (target)" }, sub: { fr: "Partenariats public-privé", en: "Public-private partnerships" } }
  ];

  /* --- Indicateurs ODP (cible 2029) -------------------------------------- */
  D.odp = [
    { code: "ODP-1", value: 30, unit: "millions", baseline: "0", femmes: "15 M femmes", label: { fr: "Personnes utilisant l'internet haut débit", en: "People using broadband internet" } },
    { code: "ODP-2", value: 20, unit: "kbit/s", baseline: "6,56 kbit/s", femmes: null, label: { fr: "Bande passante internationale par habitant", en: "International bandwidth per capita" } },
    { code: "ODP-3", value: 1, unit: "million", baseline: "0", femmes: "500 000 femmes", label: { fr: "Personnes utilisant des services numériques", en: "People using digital services" } },
    { code: "ODP-4", value: 3000, unit: "", baseline: "0", femmes: "1 000 femmes", label: { fr: "Diplômés de formations numériques avancées", en: "Graduates of advanced digital training" } }
  ];

  /* --- Indicateurs intermédiaires ---------------------------------------- */
  D.intermediaires = [
    { value: "10 000", unit: "km", fr: "de fibre optique additionnelle déployés", en: "of additional fibre optic deployed" },
    { value: "650", unit: "", fr: "nouvelles communautés couvertes en mobile haut débit", en: "new communities covered by mobile broadband" },
    { value: "1 000", unit: "", fr: "institutions publiques connectées", en: "public institutions connected" },
    { value: "100", unit: "", fr: "startups soutenues (dont 30 dirigées par des femmes)", en: "startups supported (30 women-led)" },
    { value: "10", unit: "", fr: "centres d'innovation établis", en: "innovation centres established" },
    { value: "6 000", unit: "", fr: "personnes inscrites en formation", en: "people enrolled in training" },
    { value: "100 %", unit: "", fr: "des griefs MGP traités en 30 jours ou moins", en: "of grievances handled in 30 days or less" }
  ];

  /* --- Composantes -------------------------------------------------------- */
  D.composantes = [
    {
      code: "C1", montant: 385, ida: 302, afd: 83,
      titre: { fr: "Accès & inclusion numériques", en: "Digital access & inclusion" },
      desc: { fr: "Porter l'accès à internet à l'échelle du pays : dorsales en fibre optique, couverture mobile haut débit et raccordement des écoles, des universités et des institutions publiques.", en: "Bring internet access to nationwide scale: fibre-optic backbones, mobile broadband coverage and the connection of schools, universities and public institutions." },
      sous: [
        { ref: "1.1", montant: 15, fr: "Cadres et facilitateurs pour l'accès et l'inclusion", en: "Frameworks and enablers for access and inclusion" },
        { ref: "1.2", montant: 190, fr: "Extension des réseaux de transmission", en: "Extension of transmission networks" },
        { ref: "1.3", montant: 180, fr: "Connecter citoyens, universités et institutions publiques", en: "Connect citizens, universities and public institutions" }
      ]
    },
    {
      code: "C2", montant: 55, ida: 43.1, afd: 11.9,
      titre: { fr: "Fondations numériques", en: "Digital foundations" },
      desc: { fr: "Poser les fondations communes des services publics numériques : identité numérique inclusive, interopérabilité des données entre administrations, cybersécurité et confiance.", en: "Lay the shared foundations of digital public services: inclusive digital identity, data interoperability across administrations, cybersecurity and trust." },
      sous: [
        { ref: "2.1", montant: 23, fr: "Partage et gestion des données", en: "Data sharing and management" },
        { ref: "2.2", montant: 17, fr: "Confiance dans les services numériques", en: "Trust in digital services" },
        { ref: "2.3", montant: 15, fr: "Prestation de services dans des secteurs clés", en: "Service delivery in key sectors" }
      ]
    },
    {
      code: "C3", montant: 45, ida: 35.3, afd: 9.7,
      titre: { fr: "Compétences & innovation", en: "Skills & innovation" },
      desc: { fr: "Former une génération aux compétences numériques avancées et soutenir l'innovation locale : universités, hubs technologiques, startups et financements à la performance.", en: "Equip a generation with advanced digital skills and back local innovation: universities, tech hubs, startups and performance-based grants." },
      sous: [
        { ref: "3.1", montant: 32, fr: "Compétences numériques avancées (EES, hubs)", en: "Advanced digital skills (HEIs, hubs)" },
        { ref: "3.2", montant: 13, fr: "Système de contenu local et innovation", en: "Local content system and innovation" }
      ]
    },
    {
      code: "C4", montant: 25, ida: 19.6, afd: 5.4,
      titre: { fr: "Coordination & gestion", en: "Coordination & management" },
      desc: { fr: "Donner à l'Unité les moyens d'exécuter avec rigueur : coordination, gestion fiduciaire, passation des marchés, suivi-évaluation, sauvegardes environnementales et sociales, communication.", en: "Give the Unit the means to deliver with rigour: coordination, fiduciary management, procurement, monitoring and evaluation, environmental and social safeguards, communication." },
      sous: []
    },
    {
      code: "C5", montant: 0, ida: 0, afd: 0,
      titre: { fr: "Réponse d'urgence (CERC)", en: "Emergency response (CERC)" },
      desc: { fr: "Réserve d'intervention rapide, non dotée à ce stade : en cas de crise éligible, elle permet de réaffecter sans délai des ressources du projet.", en: "Rapid-response reserve, currently unfunded: in an eligible crisis, it allows project resources to be reallocated without delay." },
      sous: []
    }
  ];

  /* --- Gouvernance -------------------------------------------------------- */
  D.gouvernance = [
    { sigle: "COPIL", nom: { fr: "Comité de Pilotage", en: "Steering Committee" }, nature: { fr: "Stratégique / décisionnel", en: "Strategic / decision-making" }, effectif: "8 membres", presidence: "MPTN", decision: { fr: "Consensus → majorité simple", en: "Consensus → simple majority" }, frequence: { fr: "Semestrielle (min.)", en: "Semi-annual (min.)" } },
    { sigle: "CTP", nom: { fr: "Comité Technique du Projet", en: "Project Technical Committee" }, nature: { fr: "Technique / coordination", en: "Technical / coordination" }, effectif: "12 représentants", presidence: "MPTN", decision: { fr: "Consensus → majorité 2/3", en: "Consensus → two-thirds majority" }, frequence: { fr: "Trimestrielle (min.)", en: "Quarterly (min.)" } },
    { sigle: "UGPTN", nom: { fr: "Unité de Gestion du Projet", en: "Project Management Unit" }, nature: { fr: "Exécution / gestion", en: "Execution / management" }, effectif: "~21 sous-rôles", presidence: { fr: "Coordonnateur", en: "Coordinator" }, decision: { fr: "Application des décisions", en: "Implementation of decisions" }, frequence: { fr: "Permanente", en: "Permanent" } }
  ];

  /* --- Mandat (4 fonctions) ---------------------------------------------- */
  D.mandat = [
    { n: "01", fr: "Coordination", en: "Coordination", descFr: "Garantir la cohérence de l'ensemble : articuler les composantes et animer la relation avec les ministères bénéficiaires, les partenaires et les bailleurs.", descEn: "Ensure the coherence of the whole: articulate the components and steer the relationship with beneficiary ministries, partners and donors." },
    { n: "02", fr: "Exécution", en: "Execution", descFr: "Conduire la mise en œuvre : planification opérationnelle (PTBA), passation des marchés, contractualisation et suivi de l'avancement.", descEn: "Drive implementation: operational planning (AWPB), procurement, contracting and progress monitoring." },
    { n: "03", fr: "Supervision technique", en: "Technical supervision", descFr: "Garantir la qualité des livrables et le respect des normes — identité numérique, cybersécurité — jusqu'à l'atteinte des résultats.", descEn: "Guarantee the quality of deliverables and compliance with standards — digital identity, cybersecurity — through to the achievement of results." },
    { n: "04", fr: "Supervision fiduciaire", en: "Fiduciary supervision", descFr: "Sécuriser les flux financiers : compte désigné, décaissements, reporting financier et préparation des audits.", descEn: "Safeguard financial flows: designated account, disbursements, financial reporting and audit readiness." }
  ];

  /* --- Principes directeurs (3) ------------------------------------------ */
  D.principes = [
    { fr: "Le MEP reste la source de vérité.", en: "The PIM remains the source of truth.", descFr: "L'Unité applique le Manuel d'Exécution du Projet : elle le met en œuvre, elle ne le réécrit pas.", descEn: "The Unit applies the Project Implementation Manual: it carries it out, it does not rewrite it." },
    { fr: "Les acteurs restent décisionnaires.", en: "Stakeholders remain the decision-makers.", descFr: "Les outils proposent, exécutent et tracent. La décision appartient, toujours, aux responsables habilités.", descEn: "Tools propose, execute and trace. The decision always rests with authorised officials." },
    { fr: "Les bailleurs gardent la main.", en: "Donors keep control.", descFr: "Les prérogatives de la Banque mondiale et de l'AFD — avis de non-objection, supervision, audit — sont intégralement préservées.", descEn: "The prerogatives of the World Bank and AFD — no-objection, supervision, audit — are fully preserved." }
  ];

  /* --- Pôles & 21 sous-rôles --------------------------------------------- */
  D.poles = [
    { nom: { fr: "Direction", en: "Management" }, role: { fr: "Pilotage, arbitrage, contrôle interne", en: "Steering, arbitration, internal control" }, roles: ["Coordonnateur", "Coordonnateur Adjoint", "Auditeur Interne"] },
    { nom: { fr: "Composantes", en: "Components" }, role: { fr: "Mise en œuvre technique des activités", en: "Technical implementation of activities" }, roles: ["Responsable Composante 1 (RC1)", "Responsable Composante 2 (RC2)", "Responsable Composante 3 (RC3)"] },
    { nom: { fr: "Fiduciaire", en: "Fiduciary" }, role: { fr: "Gestion financière et comptable", en: "Financial and accounting management" }, roles: ["Responsable Administratif et Financier (RAF)", "Comptable", "Caissier", "Logisticien"] },
    { nom: { fr: "Passation", en: "Procurement" }, role: { fr: "Marchés publics et ANO", en: "Public procurement and NOL" }, roles: ["Responsable Passation des Marchés (RPM)", "Chargé de Passation des Marchés"] },
    { nom: { fr: "Sauvegardes & transversal", en: "Safeguards & cross-cutting" }, role: { fr: "Conformité E&S, suivi, communication, systèmes", en: "E&S compliance, M&E, communication, systems" }, roles: ["Spécialiste Environnement", "Spécialiste Développement Social", "Spécialiste VBG/EAS", "Spécialiste Suivi & Évaluation", "Spécialiste Communication", "Responsable Informatique (IT)", "Agent de liaison provincial"] }
  ];

  /* --- Équipe (cartes — noms à fournir) ---------------------------------- */
  D.equipe = [
    { role: { fr: "Coordonnateur", en: "Coordinator" }, pole: { fr: "Direction", en: "Management" } },
    { role: { fr: "Coordonnateur Adjoint", en: "Deputy Coordinator" }, pole: { fr: "Direction", en: "Management" } },
    { role: { fr: "Auditeur Interne", en: "Internal Auditor" }, pole: { fr: "Direction", en: "Management" } },
    { role: { fr: "Responsable Composante 1", en: "Component 1 Lead" }, pole: { fr: "Accès & inclusion", en: "Access & inclusion" } },
    { role: { fr: "Responsable Composante 2", en: "Component 2 Lead" }, pole: { fr: "Fondations", en: "Foundations" } },
    { role: { fr: "Responsable Composante 3", en: "Component 3 Lead" }, pole: { fr: "Compétences", en: "Skills" } },
    { role: { fr: "Responsable Administratif & Financier", en: "Admin. & Finance Lead" }, pole: { fr: "Fiduciaire", en: "Fiduciary" } },
    { role: { fr: "Responsable Passation des Marchés", en: "Procurement Lead" }, pole: { fr: "Passation", en: "Procurement" } },
    { role: { fr: "Spécialiste Suivi & Évaluation", en: "M&E Specialist" }, pole: { fr: "Transversal", en: "Cross-cutting" } },
    { role: { fr: "Spécialiste VBG/EAS", en: "GBV/SEA Specialist" }, pole: { fr: "Sauvegardes", en: "Safeguards" } },
    { role: { fr: "Spécialiste Communication", en: "Communication Specialist" }, pole: { fr: "Transversal", en: "Cross-cutting" } },
    { role: { fr: "Responsable Informatique", en: "IT Lead" }, pole: { fr: "Systèmes", en: "Systems" } }
  ];

  /* --- Jalons ------------------------------------------------------------ */
  D.jalons = [
    { date: "25 nov. 2024", fr: "Signature de l'accord avec la Banque mondiale", en: "Financing agreement signed with the World Bank" },
    { date: "14 mars 2025", fr: "Signature de la convention avec l'AFD", en: "Financing convention signed with AFD" },
    { date: "15 avr. 2025", fr: "Création de l'UGPTN (arrêté ministériel)", en: "Creation of the UGPTN (ministerial order)" },
    { date: "23 juin 2025", fr: "Validation du Manuel d'Exécution (MEP)", en: "Validation of the Implementation Manual (PIM)" },
    { date: "31 oct. 2025", fr: "Entrée en vigueur du projet", en: "Project effectiveness" },
    { date: "31 déc. 2029", fr: "Achèvement technique", en: "Technical completion" },
    { date: "30 avr. 2030", fr: "Date limite de décaissement IDA", en: "IDA disbursement deadline" }
  ];

  /* --- Provinces (positions stylisées ~ géographie RDC, x: O→E, y: N→S) -- */
  D.provinces = [
    { nom: "Kinshasa", x: 13, y: 59, prio: true },
    { nom: "Kongo Central", x: 6, y: 64, prio: true },
    { nom: "Kwilu", x: 22, y: 62, prio: true },
    { nom: "Kwango", x: 20, y: 71, prio: false },
    { nom: "Mai-Ndombe", x: 25, y: 49, prio: false },
    { nom: "Équateur", x: 31, y: 36, prio: false },
    { nom: "Sud-Ubangi", x: 28, y: 27, prio: false },
    { nom: "Nord-Ubangi", x: 37, y: 23, prio: false },
    { nom: "Mongala", x: 39, y: 33, prio: false },
    { nom: "Bas-Uele", x: 47, y: 24, prio: false },
    { nom: "Haut-Uele", x: 59, y: 22, prio: false },
    { nom: "Ituri", x: 67, y: 26, prio: true },
    { nom: "Tshopo", x: 52, y: 37, prio: false },
    { nom: "Tshuapa", x: 39, y: 44, prio: false },
    { nom: "Sankuru", x: 45, y: 50, prio: false },
    { nom: "Kasaï", x: 33, y: 61, prio: true },
    { nom: "Kasaï Central", x: 41, y: 61, prio: true },
    { nom: "Kasaï Oriental", x: 47, y: 60, prio: true },
    { nom: "Lomami", x: 49, y: 56, prio: true },
    { nom: "Maniema", x: 58, y: 46, prio: false },
    { nom: "Nord-Kivu", x: 67, y: 38, prio: true },
    { nom: "Sud-Kivu", x: 69, y: 48, prio: true },
    { nom: "Tanganyika", x: 63, y: 56, prio: false },
    { nom: "Haut-Lomami", x: 54, y: 66, prio: false },
    { nom: "Lualaba", x: 50, y: 75, prio: false },
    { nom: "Haut-Katanga", x: 61, y: 75, prio: false }
  ];
  D.provincesPrioritaires = ["Kinshasa", "Kwilu", "Kongo Central", "Kasaï", "Kasaï Central", "Kasaï Oriental", "Nord-Kivu", "Sud-Kivu", "Ituri", "Lomami"];

  /* --- Langues ----------------------------------------------------------- */
  D.langues = [
    { code: "fr", label: "Français", greeting: "Bienvenue" },
    { code: "en", label: "English", greeting: "Welcome" },
    { code: "ln", label: "Lingala", greeting: "Mbote" },
    { code: "sw", label: "Kiswahili", greeting: "Karibu" },
    { code: "lu", label: "Tshiluba", greeting: "Moyo" },
    { code: "kg", label: "Kikongo", greeting: "Mbote" }
  ];

  /* --- 8 profils plateforme ---------------------------------------------- */
  D.profils = [
    { fr: "UGPTN / Gouvernement", en: "UGPTN / Government", page: { fr: "Cockpit", en: "Cockpit" } },
    { fr: "Entité bénéficiaire (MDA)", en: "Beneficiary entity (MDA)", page: { fr: "Tableau de bord", en: "Dashboard" } },
    { fr: "Partenaire", en: "Partner", page: { fr: "Espace partenaire", en: "Partner space" } },
    { fr: "Bailleur (BM / AFD)", en: "Donor (WB / AFD)", page: { fr: "Portefeuille", en: "Portfolio" } },
    { fr: "Soumissionnaire", en: "Bidder", page: { fr: "Marketplace", en: "Marketplace" } },
    { fr: "Bénéficiaire SBP", en: "PBG beneficiary", page: { fr: "Mon programme", en: "My programme" } },
    { fr: "Auditeur / Contrôle", en: "Auditor / Control", page: { fr: "Plan d'audit", en: "Audit plan" } },
    { fr: "Gouvernance (COPIL / CTP)", en: "Governance (Steering / Technical)", page: { fr: "Sessions", en: "Sessions" } }
  ];

  /* --- Actualités (placeholders institutionnels) ------------------------- */
  D.actualites = [
    { date: "23 juin 2025", dateISO: "2025-06-23", cat: { fr: "Institutionnel", en: "Institutional" }, img: "hub", lieu: "Kinshasa", fr: "Validation du Manuel d'Exécution du Projet par le Gouvernement, la Banque mondiale et l'AFD.", en: "Project Implementation Manual validated by the Government, the World Bank and AFD.",
      corps: { fr: ["Réunis à Kinshasa, les représentants du Gouvernement, de la Banque mondiale et de l'AFD ont validé le Manuel d'Exécution du Projet (MEP), document de référence qui fixe les règles de gouvernance, de passation, de gestion financière et de sauvegardes du PTN-RDC.", "Le MEP constitue désormais la source de vérité du projet : l'Unité l'applique sans le modifier, et chaque processus daté et tracé du site institutionnel en découle."], en: ["Meeting in Kinshasa, representatives of the Government, the World Bank and AFD validated the Project Implementation Manual (PIM), the reference document setting out governance, procurement, financial-management and safeguard rules for the PTN-RDC.", "The PIM is now the project's source of truth: the Unit applies it without altering it, and every dated, traceable process on the institutional site derives from it."] } },
    { date: "15 avr. 2025", dateISO: "2025-04-15", cat: { fr: "Gouvernance", en: "Governance" }, img: "ville", lieu: "Kinshasa", fr: "Création officielle de l'UGPTN par arrêté ministériel du MPTN.", en: "Official creation of the UGPTN by ministerial order of the MPTN.",
      corps: { fr: ["Par arrêté ministériel, le Ministre des Postes, Télécommunications et Numérique a institué l'Unité de Gestion du Projet de Transformation Numérique, structure d'exécution dotée de cinq pôles et de vingt-et-un sous-rôles.", "L'arrêté consacre l'articulation COPIL · CTP · UGPTN et préserve intégralement les prérogatives des bailleurs."], en: ["By ministerial order, the Minister of Posts, Telecommunications and Digital established the Digital Transformation Project Management Unit, an execution structure with five clusters and twenty-one sub-roles.", "The order enshrines the COPIL · CTP · UGPTN articulation and fully preserves donors' prerogatives."] } },
    { date: "14 mars 2025", dateISO: "2025-03-14", cat: { fr: "Financement", en: "Financing" }, img: "data", lieu: "Paris / Kinshasa", fr: "Signature de la convention de financement avec l'Agence Française de Développement.", en: "Financing convention signed with the French Development Agency.",
      corps: { fr: ["La convention de financement avec l'AFD apporte 110 millions de dollars (100 millions d'euros), soit 21 % de l'enveloppe globale de 510 millions, en cofinancement avec l'IDA de la Banque mondiale.", "Ce cofinancement consolide l'assise financière du projet et son ancrage dans l'approche régionale de digitalisation inclusive."], en: ["The financing convention with AFD provides 110 million dollars (100 million euros), i.e. 21% of the global 510-million envelope, co-financed with the World Bank's IDA.", "This co-financing consolidates the project's financial base and its anchoring in the regional inclusive-digitalisation approach."] } },
    { date: "31 oct. 2025", dateISO: "2025-10-31", cat: { fr: "Jalon", en: "Milestone" }, img: "fibre", lieu: "Kinshasa", fr: "Entrée en vigueur du Projet de Transformation Numérique de la RDC.", en: "Effectiveness of the DRC Digital Transformation Project.",
      corps: { fr: ["Les conditions d'entrée en vigueur étant remplies, le projet devient effectif : les décaissements peuvent commencer et les premiers marchés structurants du Plan de Passation sont lancés.", "L'échéance d'achèvement technique est fixée au 31 décembre 2029, avec une date limite de décaissement IDA au 30 avril 2030."], en: ["With effectiveness conditions met, the project becomes operational: disbursements can begin and the first structuring contracts of the Procurement Plan are launched.", "Technical completion is set for 31 December 2029, with an IDA disbursement deadline of 30 April 2030."] } }
  ];

  /* --- Question structurante & engagement -------------------------------- */
  D.question = {
    fr: "Comment une Unité chargée de numériser un pays peut-elle être crédible si ses propres procédures restent sur papier ?",
    en: "How can a Unit tasked with digitalising a country be credible if its own procedures remain on paper?"
  };
  D.engagement = {
    fr: "510 millions de dollars nous ont été confiés pour transformer le numérique de la RDC. Notre première preuve, c'est de commencer par nous-mêmes.",
    en: "510 million dollars have been entrusted to us to transform the DRC's digital sector. Our first proof is to begin with ourselves."
  };

  /* --- i18n (chrome, titres, CTA) ---------------------------------------- */
  D.i18n = {
    fr: {
      nav_accueil: "Accueil", nav_projet: "Le Projet", nav_ugptn: "L'UGPTN", nav_gouvernance: "Gouvernance", nav_contact: "Contact",
      cta_connect: "Se connecter", cta_docs: "Documents", cta_marches: "Marchés", cta_mgp: "Plaintes (MGP)", cta_discover: "Découvrir le projet", cta_more: "En savoir plus", cta_all: "Tout voir", cta_report: "Déposer une plainte",
      tag_public: "Site institutionnel public",
      sec_chiffres: "Le projet en chiffres", sec_composantes: "Les cinq composantes", sec_resultats: "Cadre de résultats — cibles 2029", sec_couverture: "Couverture géographique", sec_gouvernance: "Architecture de gouvernance", sec_equipe: "L'équipe de l'Unité", sec_actus: "Actualités & communiqués", sec_acces: "Accès rapides", sec_plateforme: "La plateforme métier — 8 espaces",
      lbl_baseline: "Référence", lbl_cible: "Cible 2029", lbl_dont: "dont", lbl_prio: "Provinces prioritaires", lbl_autres: "Autres provinces", lbl_total: "Total", lbl_ida: "IDA", lbl_afd: "AFD",
      foot_transparence: "Transparence", foot_legal: "Source de vérité : MEP du 23 juin 2025. Montants, dates et indicateurs conformes aux documents officiels du projet.",
      langNote: "Contenu en cours de localisation — disponible au lancement."
    },
    en: {
      nav_accueil: "Home", nav_projet: "The Project", nav_ugptn: "The UGPTN", nav_gouvernance: "Governance", nav_contact: "Contact",
      cta_connect: "Sign in", cta_docs: "Documents", cta_marches: "Tenders", cta_mgp: "Grievances", cta_discover: "Discover the project", cta_more: "Learn more", cta_all: "View all", cta_report: "File a grievance",
      tag_public: "Public institutional website",
      sec_chiffres: "The project in figures", sec_composantes: "The five components", sec_resultats: "Results framework — 2029 targets", sec_couverture: "Geographic coverage", sec_gouvernance: "Governance architecture", sec_equipe: "The Unit's team", sec_actus: "News & releases", sec_acces: "Quick access", sec_plateforme: "The business platform — 8 spaces",
      lbl_baseline: "Baseline", lbl_cible: "2029 target", lbl_dont: "incl.", lbl_prio: "Priority provinces", lbl_autres: "Other provinces", lbl_total: "Total", lbl_ida: "IDA", lbl_afd: "AFD",
      foot_transparence: "Transparency", foot_legal: "Source of truth: PIM of 23 June 2025. Amounts, dates and indicators per the project's official documents.",
      langNote: "Content being localised — available at launch."
    }
  };

  /* --- Avis de marchés publics (enrichis : détail, addenda, calendrier) -- */
  D.marches = [
    { ref: "AOI/C1/2026-014", type: "AOI", comp: "C1", publie: "2 juin 2026", limite: "30 sept. 2026", limiteISO: "2026-09-30T17:00:00", statut: "ouvert", revue: { fr: "Préalable", en: "Prior" }, budget: "≈ 88 M USD", lieu: { fr: "Provinces de l'Est (Ituri, Nord-Kivu, Sud-Kivu)", en: "Eastern provinces (Ituri, North & South Kivu)" }, lots: 3,
      objet: { fr: "Déploiement de 2 500 km de backbone en fibre optique — lots Est", en: "Deployment of 2,500 km of fibre-optic backbone — Eastern lots" },
      resume: { fr: "Conception, fourniture, pose et mise en service de 2 500 km de fibre optique terrestre reliant les chefs-lieux de l'Est aux dorsales nationales, avec points de présence (PoP) et raccordement des institutions publiques le long du tracé.", en: "Design, supply, installation and commissioning of 2,500 km of terrestrial fibre linking eastern provincial capitals to the national backbone, with PoPs and connection of public institutions along the route." },
      addenda: [ { n: "01", date: "24 juin 2026", note: { fr: "Report de la date limite de 15 jours ; précisions sur les exigences de géoreférencement.", en: "15-day deadline extension; clarification of geo-referencing requirements." } } ],
      pieces: [ { nom: { fr: "Dossier d'Appel d'Offres (DAO)", en: "Bidding Document" }, taille: "8,4 Mo" }, { nom: { fr: "Bordereau des prix — modèle", en: "Price schedule — template" }, taille: "0,4 Mo" }, { nom: { fr: "Addendum n°01", en: "Addendum no. 01" }, taille: "0,3 Mo" } ],
      calendrier: [ { date: "2 juin 2026", fr: "Publication de l'avis", en: "Notice published", done: true }, { date: "15 juil. 2026", fr: "Date limite des questions", en: "Deadline for questions", done: false }, { date: "30 sept. 2026", fr: "Dépôt & ouverture des offres", en: "Submission & bid opening", done: false }, { date: "nov. 2026", fr: "Évaluation & ANO du bailleur", en: "Evaluation & donor NOL", done: false }, { date: "déc. 2026", fr: "Attribution & publication", en: "Award & publication", done: false } ] },
    { ref: "AMI/C2/2026-007", type: "AMI", comp: "C2", publie: "26 juin 2026", limite: "12 août 2026", limiteISO: "2026-08-12T17:00:00", statut: "ouvert", revue: { fr: "Préalable", en: "Prior" }, budget: "≈ 4,5 M USD", lieu: { fr: "Kinshasa (mission nationale)", en: "Kinshasa (national assignment)" }, lots: 1,
      objet: { fr: "Cabinet — architecture d'identité numérique & interopérabilité des données", en: "Firm — digital identity architecture & data interoperability" },
      resume: { fr: "Sélection d'un cabinet pour concevoir l'architecture de l'identité numérique fondée sur les principes d'inclusion et de protection des données, et la couche d'interopérabilité (X-Road / GovStack) entre administrations.", en: "Selection of a firm to design the digital identity architecture based on inclusion and data-protection principles, and the data interoperability layer (X-Road / GovStack) across administrations." },
      addenda: [],
      pieces: [ { nom: { fr: "Avis à Manifestation d'Intérêt", en: "Request for Expressions of Interest" }, taille: "1,2 Mo" }, { nom: { fr: "Termes de Référence (TDR)", en: "Terms of Reference" }, taille: "0,9 Mo" } ],
      calendrier: [ { date: "26 juin 2026", fr: "Publication de l'AMI", en: "REOI published", done: true }, { date: "12 août 2026", fr: "Dépôt des manifestations", en: "Submission of expressions", done: false }, { date: "sept. 2026", fr: "Établissement de la liste restreinte", en: "Shortlisting", done: false }, { date: "oct. 2026", fr: "Demande de propositions (DP)", en: "Request for Proposals", done: false } ] },
    { ref: "SFQC/C3/2026-009", type: "SFQC", comp: "C3", publie: "24 juin 2026", limite: "20 août 2026", limiteISO: "2026-08-20T17:00:00", statut: "ouvert", revue: { fr: "Préalable", en: "Prior" }, budget: "≈ 6,2 M USD", lieu: { fr: "Kinshasa, Lubumbashi, Goma (hubs)", en: "Kinshasa, Lubumbashi, Goma (hubs)" }, lots: 1,
      objet: { fr: "Conception du programme de compétences numériques avancées (EESU & hubs)", en: "Design of the advanced digital skills programme (HEIs & hubs)" },
      resume: { fr: "Conception et appui au déploiement d'un programme de compétences numériques avancées avec les établissements d'enseignement supérieur et universitaire et les hubs d'innovation, ciblant 6 000 inscrits dont 1 000 femmes diplômées.", en: "Design and rollout support of an advanced digital skills programme with higher-education institutions and innovation hubs, targeting 6,000 enrolments including 1,000 women graduates." },
      addenda: [ { n: "01", date: "3 juil. 2026", note: { fr: "Précision sur les exigences d'expérience en Afrique subsaharienne.", en: "Clarification of Sub-Saharan Africa experience requirements." } } ],
      pieces: [ { nom: { fr: "Demande de Propositions (DP)", en: "Request for Proposals" }, taille: "2,6 Mo" }, { nom: { fr: "Termes de Référence (TDR)", en: "Terms of Reference" }, taille: "1,1 Mo" } ],
      calendrier: [ { date: "24 juin 2026", fr: "Publication de la DP", en: "RFP published", done: true }, { date: "20 août 2026", fr: "Dépôt des propositions", en: "Proposal submission", done: false }, { date: "sept. 2026", fr: "Évaluation technique", en: "Technical evaluation", done: false }, { date: "oct. 2026", fr: "Ouverture financière & négociation", en: "Financial opening & negotiation", done: false } ] },
    { ref: "AON/C4/2026-022", type: "AON", comp: "C4", publie: "18 juin 2026", limite: "5 août 2026", limiteISO: "2026-08-05T15:00:00", statut: "ouvert", revue: { fr: "Postérieure", en: "Post" }, budget: "≈ 1,8 M USD", lieu: { fr: "Kinshasa (siège de l'UGPTN)", en: "Kinshasa (UGPTN headquarters)" }, lots: 2,
      objet: { fr: "Fourniture d'équipements informatiques et de visioconférence pour l'UGPTN", en: "Supply of IT and videoconferencing equipment for the UGPTN" },
      resume: { fr: "Fourniture, installation et garantie d'équipements informatiques, de matériel de visioconférence et d'infrastructure réseau pour le siège de l'Unité et les antennes provinciales.", en: "Supply, installation and warranty of IT equipment, videoconferencing hardware and network infrastructure for the Unit's headquarters and provincial offices." },
      addenda: [],
      pieces: [ { nom: { fr: "Dossier d'Appel d'Offres National", en: "National Bidding Document" }, taille: "3,1 Mo" }, { nom: { fr: "Spécifications techniques", en: "Technical specifications" }, taille: "0,7 Mo" } ],
      calendrier: [ { date: "18 juin 2026", fr: "Publication de l'avis", en: "Notice published", done: true }, { date: "5 août 2026", fr: "Dépôt & ouverture", en: "Submission & opening", done: false }, { date: "août 2026", fr: "Évaluation", en: "Evaluation", done: false }, { date: "sept. 2026", fr: "Attribution", en: "Award", done: false } ] },
    { ref: "DC/C4/2026-031", type: "DC", comp: "C4", publie: "20 mai 2026", limite: "12 juin 2026", limiteISO: "2026-06-12T15:00:00", statut: "cloture", revue: { fr: "Postérieure", en: "Post" }, budget: "≈ 320 000 USD", lieu: { fr: "Kinshasa", en: "Kinshasa" }, lots: 1,
      objet: { fr: "Services de communication institutionnelle et production audiovisuelle", en: "Institutional communication services and audiovisual production" },
      resume: { fr: "Prestations de communication institutionnelle, production audiovisuelle et couverture des événements du Projet. Évaluation des offres en cours.", en: "Institutional communication, audiovisual production and Project event coverage. Bid evaluation under way." },
      addenda: [],
      pieces: [ { nom: { fr: "Demande de Cotation", en: "Request for Quotation" }, taille: "0,6 Mo" } ],
      calendrier: [ { date: "20 mai 2026", fr: "Publication", en: "Published", done: true }, { date: "12 juin 2026", fr: "Clôture des offres", en: "Bids closed", done: true }, { date: "juil. 2026", fr: "Évaluation en cours", en: "Evaluation in progress", done: false } ] },
    { ref: "AOI/C1/2026-003", type: "AOI", comp: "C1", publie: "10 avr. 2026", limite: "15 mai 2026", limiteISO: "2026-05-15T17:00:00", statut: "attribue", revue: { fr: "Préalable", en: "Prior" }, budget: "≈ 22 M USD", lieu: { fr: "180 communautés rurales (lot 1)", en: "180 rural communities (lot 1)" }, lots: 1, attributaire: { fr: "Consortium retenu — publié après ANO", en: "Selected consortium — published after NOL" },
      objet: { fr: "Couverture mobile haut débit — 180 communautés non desservies (lot 1)", en: "Mobile broadband coverage — 180 underserved communities (lot 1)" },
      resume: { fr: "Déploiement de sites mobiles haut débit dans 180 communautés non desservies. Marché attribué après évaluation tracée et avis de non-objection du bailleur.", en: "Deployment of mobile broadband sites across 180 underserved communities. Awarded after traceable evaluation and donor no-objection." },
      addenda: [],
      pieces: [ { nom: { fr: "Procès-verbal d'attribution", en: "Award notice" }, taille: "0,5 Mo" } ],
      calendrier: [ { date: "10 avr. 2026", fr: "Publication", en: "Published", done: true }, { date: "15 mai 2026", fr: "Dépôt & ouverture", en: "Submission & opening", done: true }, { date: "juin 2026", fr: "ANO du bailleur", en: "Donor NOL", done: true }, { date: "juin 2026", fr: "Attribution publiée", en: "Award published", done: true } ] }
  ];
  D.marchesMethodes = [
    { sigle: "AOI", fr: "Appel d'Offres International", en: "International Competitive Bidding" },
    { sigle: "AON", fr: "Appel d'Offres National", en: "National Competitive Bidding" },
    { sigle: "AMI", fr: "Avis à Manifestation d'Intérêt", en: "Request for Expressions of Interest" },
    { sigle: "SFQC", fr: "Sélection Fondée sur la Qualité et le Coût", en: "Quality- and Cost-Based Selection" },
    { sigle: "DC", fr: "Demande de Cotation", en: "Request for Quotation" }
  ];
  D.candidature = [
    { n: "01", fr: "Créer un compte soumissionnaire", en: "Create a bidder account", d: { fr: "Inscription en ligne et vérification d'identité de l'entreprise (KYC).", en: "Online registration and company identity verification (KYC)." } },
    { n: "02", fr: "Télécharger le dossier (DAO/RFP)", en: "Download the bidding documents", d: { fr: "Accès aux pièces, addenda et calendrier prévisionnel issus du PPM.", en: "Access documents, addenda and the indicative schedule from the PPM." } },
    { n: "03", fr: "Préparer et déposer l'offre", en: "Prepare and submit the bid", d: { fr: "Soumission électronique sécurisée, horodatée, conforme aux Règlements BM 2025.", en: "Secure, timestamped electronic submission, per WB 2025 Regulations." } },
    { n: "04", fr: "Suivi & attribution", en: "Tracking & award", d: { fr: "Évaluation tracée, ANO du bailleur, publication transparente du résultat.", en: "Traceable evaluation, donor NOL, transparent publication of the result." } }
  ];

  /* --- Centre de transparence documentaire ------------------------------ */
  D.documents = [
    { sigle: "MEP", titre: "Manuel d'Exécution du Projet", cat: "reference", version: "v1.0", date: "23 juin 2025", langue: "FR", taille: "4,2 Mo" },
    { sigle: "PPSD", titre: "Stratégie de Passation des Marchés (PPSD)", cat: "passation", version: "v1.0", date: "2025", langue: "FR", taille: "1,8 Mo" },
    { sigle: "PPM", titre: "Plan de Passation des Marchés (18 mois)", cat: "passation", version: "T2 2026", date: "2026", langue: "FR", taille: "0,9 Mo" },
    { sigle: "CGES", titre: "Cadre de Gestion Environnementale et Sociale", cat: "sauvegardes", version: "v2.1", date: "2025", langue: "FR", taille: "6,5 Mo" },
    { sigle: "CPR", titre: "Cadre de Politique de Réinstallation", cat: "sauvegardes", version: "v1.0", date: "2025", langue: "FR", taille: "2,3 Mo" },
    { sigle: "PPA", titre: "Plan en Faveur des Populations Autochtones", cat: "sauvegardes", version: "v1.0", date: "2025", langue: "FR", taille: "2,0 Mo" },
    { sigle: "PMPP", titre: "Plan de Mobilisation des Parties Prenantes", cat: "sauvegardes", version: "v1.2", date: "2025", langue: "FR", taille: "1,6 Mo" },
    { sigle: "PGMO", titre: "Procédures de Gestion de la Main d'Œuvre", cat: "sauvegardes", version: "v1.0", date: "2025", langue: "FR", taille: "1,1 Mo" },
    { sigle: "PEES", titre: "Plan d'Engagement Environnemental et Social", cat: "sauvegardes", version: "évolutif", date: "2025", langue: "FR", taille: "0,9 Mo" },
    { sigle: "RFI", titre: "Synthèse des Rapports Financiers Intermédiaires", cat: "fiduciaire", version: "T1 2026", date: "2026", langue: "FR", taille: "0,7 Mo" }
  ];
  D.documentsCats = [
    { code: "reference", fr: "Référence", en: "Reference" },
    { code: "passation", fr: "Passation", en: "Procurement" },
    { code: "sauvegardes", fr: "Sauvegardes E&S", en: "E&S safeguards" },
    { code: "fiduciaire", fr: "Fiduciaire", en: "Fiduciary" }
  ];

  /* --- Catégories de plaintes (MGP) ------------------------------------- */
  D.mgpCategories = [
    { fr: "Technique", en: "Technical" },
    { fr: "Fiduciaire", en: "Fiduciary" },
    { fr: "Environnementale & sociale", en: "Environmental & social" },
    { fr: "Conduite du personnel", en: "Staff conduct" },
    { fr: "Autre", en: "Other" }
  ];
  D.mgpPipeline = [
    { fr: "Réception", en: "Receipt" },
    { fr: "Classification", en: "Classification" },
    { fr: "Instruction", en: "Investigation" },
    { fr: "Décision", en: "Decision" },
    { fr: "Clôture", en: "Closure" }
  ];

  /* --- Médias (vidéo + photographies réelles, art-dirigées duotone) ------
     Remplacer par vos visuels officiels ; structure unique à éditer ici.    */
  D.media = {
    videoYt: "2ZJGxoF610c",
    videoTitre: { fr: "Accélérer la transformation numérique de l'Afrique", en: "Accelerating Africa's Digital Transformation" },
    videoSource: { fr: "Groupe de la Banque mondiale · 2023", en: "World Bank Group · 2023" },
    videoNote: { fr: "Vidéo d'illustration provisoire — à remplacer par le film institutionnel du Projet.", en: "Interim illustrative video — to be replaced by the Project's institutional film." },
    img: {
      hero:       "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=70",
      citoyens:   "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1100&q=72",
      fibre:      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=70",
      datacenter: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=70",
      formation:  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=72",
      femmes:     "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1100&q=72",
      tour:       "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1100&q=72",
      ville:      "https://images.unsplash.com/photo-1568454537842-d933259bb258?auto=format&fit=crop&w=1100&q=72",
      hub:        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1100&q=72",
      data:       "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1100&q=72"
    },
    // Repli fiable (banque libre) si une photo ne se charge pas au runtime.
    fallbackSeed: "ugptn"
  };

  /* --- FAQ du Mécanisme de Gestion des Plaintes -------------------------- */
  D.mgpFaq = [
    { q: { fr: "Qui peut déposer une plainte ?", en: "Who can file a grievance?" }, r: { fr: "Toute personne, communauté ou organisation affectée par une activité du Projet — sans condition de nationalité, et gratuitement.", en: "Any person, community or organisation affected by a Project activity — with no nationality requirement, free of charge." } },
    { q: { fr: "Puis-je rester anonyme ?", en: "Can I remain anonymous?" }, r: { fr: "Oui. L'anonymat est possible ; il peut toutefois limiter notre capacité à revenir vers vous. Le canal confidentiel EAS/HS garantit en outre la stricte protection de l'identité.", en: "Yes. Anonymity is possible; it may, however, limit our ability to follow up with you. The confidential SEA/SH channel additionally guarantees strict identity protection." } },
    { q: { fr: "Sous quel délai aurai-je une réponse ?", en: "How quickly will I get a response?" }, r: { fr: "Accusé de réception immédiat avec numéro de référence ; traitement et réponse en 30 jours ou moins (engagement public, 100 % des griefs).", en: "Immediate acknowledgement with a reference number; processing and response in 30 days or less (public commitment, 100% of grievances)." } },
    { q: { fr: "Ma plainte peut-elle se retourner contre moi ?", en: "Could my grievance be used against me?" }, r: { fr: "Non. Aucune représaille n'est tolérée. Les données sont traitées de manière confidentielle et ne sont visibles que par les agents habilités.", en: "No. No retaliation is tolerated. Data is processed confidentially and visible only to authorised officers." } },
    { q: { fr: "Que se passe-t-il si je ne suis pas satisfait de la réponse ?", en: "What if I am not satisfied with the response?" }, r: { fr: "Un recours est possible : votre dossier est réexaminé à un niveau supérieur. Les voies de recours administratives et judiciaires de droit commun restent ouvertes.", en: "An appeal is possible: your case is re-examined at a higher level. Ordinary administrative and judicial remedies remain available." } },
    { q: { fr: "Le canal EAS/HS est-il vraiment séparé ?", en: "Is the SEA/SH channel truly separate?" }, r: { fr: "Oui. Il est strictement cloisonné, centré sur la survivante, et géré uniquement par le Spécialiste VBG/EAS. Aucune de ses données n'apparaît ailleurs sur le site.", en: "Yes. It is strictly siloed, survivor-centred, and managed solely by the GBV/SEA Specialist. None of its data appears elsewhere on the site." } }
  ];

  window.UGPTN_DATA = D;
})();
