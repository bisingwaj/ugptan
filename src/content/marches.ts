/* Marchés publics (appels d'offres), méthodes de passation, candidature, documents. */
import type {
  Marche, MethodePassation, EtapeCandidature, Document, DocumentCategorie,
} from "./types";

export const marches: Marche[] = [
  {
    ref: "AOI/C1/2026-014", type: "AOI", comp: "C1", publie: "2 juin 2026", limite: "30 sept. 2026", limiteISO: "2026-09-30T17:00:00", statut: "ouvert",
    revue: { fr: "Préalable", en: "Prior" }, budget: "≈ 88 M USD",
    lieu: { fr: "Provinces de l'Est (Ituri, Nord-Kivu, Sud-Kivu)", en: "Eastern provinces (Ituri, North & South Kivu)" }, lots: 3,
    soum: 14, vues: 1280, questions: 23,
    objet: { fr: "Déploiement de 2 500 km de backbone en fibre optique — lots Est", en: "Deployment of 2,500 km of fibre-optic backbone — Eastern lots" },
    resume: { fr: "Conception, fourniture, pose et mise en service de 2 500 km de fibre optique terrestre reliant les chefs-lieux de l'Est aux dorsales nationales, avec points de présence (PoP) et raccordement des institutions publiques le long du tracé.", en: "Design, supply, installation and commissioning of 2,500 km of terrestrial fibre linking eastern provincial capitals to the national backbone, with PoPs and connection of public institutions along the route." },
    addenda: [{ n: "01", date: "24 juin 2026", note: { fr: "Report de la date limite de 15 jours ; précisions sur les exigences de géoreférencement.", en: "15-day deadline extension; clarification of geo-referencing requirements." } }],
    pieces: [
      { nom: { fr: "Dossier d'Appel d'Offres (DAO)", en: "Bidding Document" }, taille: "8,4 Mo" },
      { nom: { fr: "Bordereau des prix — modèle", en: "Price schedule — template" }, taille: "0,4 Mo" },
      { nom: { fr: "Addendum n°01", en: "Addendum no. 01" }, taille: "0,3 Mo" },
    ],
    calendrier: [
      { date: "2 juin 2026", fr: "Publication de l'avis", en: "Notice published", done: true },
      { date: "15 juil. 2026", fr: "Date limite des questions", en: "Deadline for questions", done: false },
      { date: "30 sept. 2026", fr: "Dépôt & ouverture des offres", en: "Submission & bid opening", done: false },
      { date: "nov. 2026", fr: "Évaluation & ANO du bailleur", en: "Evaluation & donor NOL", done: false },
      { date: "déc. 2026", fr: "Attribution & publication", en: "Award & publication", done: false },
    ],
  },
  {
    ref: "AMI/C2/2026-007", type: "AMI", comp: "C2", publie: "26 juin 2026", limite: "12 août 2026", limiteISO: "2026-08-12T17:00:00", statut: "ouvert",
    revue: { fr: "Préalable", en: "Prior" }, budget: "≈ 4,5 M USD",
    lieu: { fr: "Kinshasa (mission nationale)", en: "Kinshasa (national assignment)" }, lots: 1,
    soum: 9, vues: 742, questions: 11,
    objet: { fr: "Cabinet — architecture d'identité numérique & interopérabilité des données", en: "Firm — digital identity architecture & data interoperability" },
    resume: { fr: "Sélection d'un cabinet pour concevoir l'architecture de l'identité numérique fondée sur les principes d'inclusion et de protection des données, et la couche d'interopérabilité (X-Road / GovStack) entre administrations.", en: "Selection of a firm to design the digital identity architecture based on inclusion and data-protection principles, and the data interoperability layer (X-Road / GovStack) across administrations." },
    addenda: [],
    pieces: [
      { nom: { fr: "Avis à Manifestation d'Intérêt", en: "Request for Expressions of Interest" }, taille: "1,2 Mo" },
      { nom: { fr: "Termes de Référence (TDR)", en: "Terms of Reference" }, taille: "0,9 Mo" },
    ],
    calendrier: [
      { date: "26 juin 2026", fr: "Publication de l'AMI", en: "REOI published", done: true },
      { date: "12 août 2026", fr: "Dépôt des manifestations", en: "Submission of expressions", done: false },
      { date: "sept. 2026", fr: "Établissement de la liste restreinte", en: "Shortlisting", done: false },
      { date: "oct. 2026", fr: "Demande de propositions (DP)", en: "Request for Proposals", done: false },
    ],
  },
  {
    ref: "SFQC/C3/2026-009", type: "SFQC", comp: "C3", publie: "24 juin 2026", limite: "20 août 2026", limiteISO: "2026-08-20T17:00:00", statut: "ouvert",
    revue: { fr: "Préalable", en: "Prior" }, budget: "≈ 6,2 M USD",
    lieu: { fr: "Kinshasa, Lubumbashi, Goma (hubs)", en: "Kinshasa, Lubumbashi, Goma (hubs)" }, lots: 1,
    soum: 18, vues: 963, questions: 16,
    objet: { fr: "Conception du programme de compétences numériques avancées (EESU & hubs)", en: "Design of the advanced digital skills programme (HEIs & hubs)" },
    resume: { fr: "Conception et appui au déploiement d'un programme de compétences numériques avancées avec les établissements d'enseignement supérieur et universitaire et les hubs d'innovation, ciblant 6 000 inscrits dont 1 000 femmes diplômées.", en: "Design and rollout support of an advanced digital skills programme with higher-education institutions and innovation hubs, targeting 6,000 enrolments including 1,000 women graduates." },
    addenda: [{ n: "01", date: "3 juil. 2026", note: { fr: "Précision sur les exigences d'expérience en Afrique subsaharienne.", en: "Clarification of Sub-Saharan Africa experience requirements." } }],
    pieces: [
      { nom: { fr: "Demande de Propositions (DP)", en: "Request for Proposals" }, taille: "2,6 Mo" },
      { nom: { fr: "Termes de Référence (TDR)", en: "Terms of Reference" }, taille: "1,1 Mo" },
    ],
    calendrier: [
      { date: "24 juin 2026", fr: "Publication de la DP", en: "RFP published", done: true },
      { date: "20 août 2026", fr: "Dépôt des propositions", en: "Proposal submission", done: false },
      { date: "sept. 2026", fr: "Évaluation technique", en: "Technical evaluation", done: false },
      { date: "oct. 2026", fr: "Ouverture financière & négociation", en: "Financial opening & negotiation", done: false },
    ],
  },
  {
    ref: "AON/C4/2026-022", type: "AON", comp: "C4", publie: "18 juin 2026", limite: "5 août 2026", limiteISO: "2026-08-05T15:00:00", statut: "ouvert",
    revue: { fr: "Postérieure", en: "Post" }, budget: "≈ 1,8 M USD",
    lieu: { fr: "Kinshasa (siège de l'UGPTAN)", en: "Kinshasa (UGPTAN headquarters)" }, lots: 2,
    soum: 7, vues: 528, questions: 5,
    objet: { fr: "Fourniture d'équipements informatiques et de visioconférence pour l'UGPTAN", en: "Supply of IT and videoconferencing equipment for the UGPTAN" },
    resume: { fr: "Fourniture, installation et garantie d'équipements informatiques, de matériel de visioconférence et d'infrastructure réseau pour le siège de l'Unité et les antennes provinciales.", en: "Supply, installation and warranty of IT equipment, videoconferencing hardware and network infrastructure for the Unit's headquarters and provincial offices." },
    addenda: [],
    pieces: [
      { nom: { fr: "Dossier d'Appel d'Offres National", en: "National Bidding Document" }, taille: "3,1 Mo" },
      { nom: { fr: "Spécifications techniques", en: "Technical specifications" }, taille: "0,7 Mo" },
    ],
    calendrier: [
      { date: "18 juin 2026", fr: "Publication de l'avis", en: "Notice published", done: true },
      { date: "5 août 2026", fr: "Dépôt & ouverture", en: "Submission & opening", done: false },
      { date: "août 2026", fr: "Évaluation", en: "Evaluation", done: false },
      { date: "sept. 2026", fr: "Attribution", en: "Award", done: false },
    ],
  },
  {
    ref: "DC/C4/2026-031", type: "DC", comp: "C4", publie: "20 mai 2026", limite: "12 juin 2026", limiteISO: "2026-06-12T15:00:00", statut: "cloture",
    revue: { fr: "Postérieure", en: "Post" }, budget: "≈ 320 000 USD",
    lieu: { fr: "Kinshasa", en: "Kinshasa" }, lots: 1,
    soum: 6, vues: 410, questions: 3,
    objet: { fr: "Services de communication institutionnelle et production audiovisuelle", en: "Institutional communication services and audiovisual production" },
    resume: { fr: "Prestations de communication institutionnelle, production audiovisuelle et couverture des événements du Projet. Évaluation des offres en cours.", en: "Institutional communication, audiovisual production and Project event coverage. Bid evaluation under way." },
    addenda: [],
    pieces: [{ nom: { fr: "Demande de Cotation", en: "Request for Quotation" }, taille: "0,6 Mo" }],
    calendrier: [
      { date: "20 mai 2026", fr: "Publication", en: "Published", done: true },
      { date: "12 juin 2026", fr: "Clôture des offres", en: "Bids closed", done: true },
      { date: "juil. 2026", fr: "Évaluation en cours", en: "Evaluation in progress", done: false },
    ],
  },
  {
    ref: "AOI/C1/2026-003", type: "AOI", comp: "C1", publie: "10 avr. 2026", limite: "15 mai 2026", limiteISO: "2026-05-15T17:00:00", statut: "attribue",
    revue: { fr: "Préalable", en: "Prior" }, budget: "≈ 22 M USD",
    lieu: { fr: "180 communautés rurales (lot 1)", en: "180 rural communities (lot 1)" }, lots: 1,
    soum: 11, vues: 1640, questions: 19,
    attributaire: { fr: "Consortium retenu — publié après ANO", en: "Selected consortium — published after NOL" },
    objet: { fr: "Couverture mobile haut débit — 180 communautés non desservies (lot 1)", en: "Mobile broadband coverage — 180 underserved communities (lot 1)" },
    resume: { fr: "Déploiement de sites mobiles haut débit dans 180 communautés non desservies. Marché attribué après évaluation tracée et avis de non-objection du bailleur.", en: "Deployment of mobile broadband sites across 180 underserved communities. Awarded after traceable evaluation and donor no-objection." },
    addenda: [],
    pieces: [{ nom: { fr: "Procès-verbal d'attribution", en: "Award notice" }, taille: "0,5 Mo" }],
    calendrier: [
      { date: "10 avr. 2026", fr: "Publication", en: "Published", done: true },
      { date: "15 mai 2026", fr: "Dépôt & ouverture", en: "Submission & opening", done: true },
      { date: "juin 2026", fr: "ANO du bailleur", en: "Donor NOL", done: true },
      { date: "juin 2026", fr: "Attribution publiée", en: "Award published", done: true },
    ],
  },
];

export const marchesMethodes: MethodePassation[] = [
  { sigle: "AOI", label: { fr: "Appel d'Offres International", en: "International Competitive Bidding" } },
  { sigle: "AON", label: { fr: "Appel d'Offres National", en: "National Competitive Bidding" } },
  { sigle: "AMI", label: { fr: "Avis à Manifestation d'Intérêt", en: "Request for Expressions of Interest" } },
  { sigle: "SFQC", label: { fr: "Sélection Fondée sur la Qualité et le Coût", en: "Quality- and Cost-Based Selection" } },
  { sigle: "DC", label: { fr: "Demande de Cotation", en: "Request for Quotation" } },
];

export const candidature: EtapeCandidature[] = [
  { n: "01", titre: { fr: "Créer un compte soumissionnaire", en: "Create a bidder account" }, desc: { fr: "Inscription en ligne et vérification d'identité de l'entreprise (KYC).", en: "Online registration and company identity verification (KYC)." } },
  { n: "02", titre: { fr: "Télécharger le dossier (DAO/RFP)", en: "Download the bidding documents" }, desc: { fr: "Accès aux pièces, addenda et calendrier prévisionnel issus du PPM.", en: "Access documents, addenda and the indicative schedule from the PPM." } },
  { n: "03", titre: { fr: "Préparer et déposer l'offre", en: "Prepare and submit the bid" }, desc: { fr: "Soumission électronique sécurisée, horodatée, conforme aux Règlements BM 2025.", en: "Secure, timestamped electronic submission, per WB 2025 Regulations." } },
  { n: "04", titre: { fr: "Suivi & attribution", en: "Tracking & award" }, desc: { fr: "Évaluation tracée, ANO du bailleur, publication transparente du résultat.", en: "Traceable evaluation, donor NOL, transparent publication of the result." } },
];

export const documents: Document[] = [
  { sigle: "MEP", titre: "Manuel d'Exécution du Projet", cat: "reference", version: "v1.0", date: "23 juin 2025", langue: "FR", taille: "4,2 Mo" },
  { sigle: "PPSD", titre: "Stratégie de Passation des Marchés (PPSD)", cat: "passation", version: "v1.0", date: "2025", langue: "FR", taille: "1,8 Mo" },
  { sigle: "PPM", titre: "Plan de Passation des Marchés (18 mois)", cat: "passation", version: "T2 2026", date: "2026", langue: "FR", taille: "0,9 Mo" },
  { sigle: "CGES", titre: "Cadre de Gestion Environnementale et Sociale", cat: "sauvegardes", version: "v2.1", date: "2025", langue: "FR", taille: "6,5 Mo" },
  { sigle: "CPR", titre: "Cadre de Politique de Réinstallation", cat: "sauvegardes", version: "v1.0", date: "2025", langue: "FR", taille: "2,3 Mo" },
  { sigle: "PPA", titre: "Plan en Faveur des Populations Autochtones", cat: "sauvegardes", version: "v1.0", date: "2025", langue: "FR", taille: "2,0 Mo" },
  { sigle: "PMPP", titre: "Plan de Mobilisation des Parties Prenantes", cat: "sauvegardes", version: "v1.2", date: "2025", langue: "FR", taille: "1,6 Mo" },
  { sigle: "PGMO", titre: "Procédures de Gestion de la Main d'Œuvre", cat: "sauvegardes", version: "v1.0", date: "2025", langue: "FR", taille: "1,1 Mo" },
  { sigle: "PEES", titre: "Plan d'Engagement Environnemental et Social", cat: "sauvegardes", version: "évolutif", date: "2025", langue: "FR", taille: "0,9 Mo" },
  { sigle: "RFI", titre: "Synthèse des Rapports Financiers Intermédiaires", cat: "fiduciaire", version: "T1 2026", date: "2026", langue: "FR", taille: "0,7 Mo" },
];

export const documentsCats: DocumentCategorie[] = [
  { code: "reference", label: { fr: "Référence", en: "Reference" } },
  { code: "passation", label: { fr: "Passation", en: "Procurement" } },
  { code: "sauvegardes", label: { fr: "Sauvegardes E&S", en: "E&S safeguards" } },
  { code: "fiduciaire", label: { fr: "Fiduciaire", en: "Fiduciary" } },
];

export const marchesOuverts = marches.filter((m) => m.statut === "ouvert").length;
