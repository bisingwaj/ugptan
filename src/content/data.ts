/* ============================================================================
   UGPTAN — Données canoniques (MEP du 23 juin 2025).
   Montants, dates, indicateurs et structures IMMUABLES (conformité MEP).
   ========================================================================== */
import type {
  Meta, Chiffre, Odp, Intermediaire, Composante, GouvBody, Mandat, Principe,
  Pole, Membre, Jalon, Province, Langue, Profil, CompColorMap,
} from "./types";
import type { Bilingual } from "@/lib/pick";

export const meta: Meta = {
  unite: "UGPTAN",
  uniteLong: "Unité de Gestion du Projet de Transformation Numérique",
  projet: "PTN-RDC",
  projetLong:
    "Projet de Transformation Numérique de la République Démocratique du Congo",
  code: "P180495",
  tutelle: "MPTN",
  tutelleLong: "Ministère des Postes, Télécommunications et Numérique",
  bailleurs: "IDA (Banque mondiale) · AFD",
  arrete: "CAB/MIN/PT&N/AKIM/KL/Kbs/017/2025",
  arreteDate: "15 avril 2025",
  mep: "Manuel d'Exécution du Projet (MEP) — 23 juin 2025",
  ville: "Kinshasa",
  approche: "APM IDEA — Digitalisation Inclusive en Afrique Orientale et Australe",
};

export const chiffres: Chiffre[] = [
  { value: 510, unit: "M USD", label: { fr: "Enveloppe totale", en: "Total envelope" }, sub: { fr: "Investissement structurant", en: "Structuring investment" } },
  { value: 400, unit: "M USD", pct: "79 %", label: { fr: "Financement IDA", en: "IDA financing" }, sub: { fr: "Banque mondiale — chef de file", en: "World Bank — lead" } },
  { value: 110, unit: "M USD", pct: "21 %", label: { fr: "Financement AFD", en: "AFD financing" }, sub: { fr: "soit 100 M EUR", en: "i.e. EUR 100M" } },
  { value: 165, unit: "M USD", label: { fr: "Capitaux privés (cible)", en: "Private capital (target)" }, sub: { fr: "Partenariats public-privé", en: "Public-private partnerships" } },
];

export const odp: Odp[] = [
  { code: "ODP-1", value: 30, unit: "millions", baseline: "0", femmes: "15 M femmes", label: { fr: "Personnes utilisant l'internet haut débit", en: "People using broadband internet" } },
  { code: "ODP-2", value: 20, unit: "kbit/s", baseline: "6,56 kbit/s", femmes: null, label: { fr: "Bande passante internationale par habitant", en: "International bandwidth per capita" } },
  { code: "ODP-3", value: 1, unit: "million", baseline: "0", femmes: "500 000 femmes", label: { fr: "Personnes utilisant des services numériques", en: "People using digital services" } },
  { code: "ODP-4", value: 3000, unit: "", baseline: "0", femmes: "1 000 femmes", label: { fr: "Diplômés de formations numériques avancées", en: "Graduates of advanced digital training" } },
];

export const intermediaires: Intermediaire[] = [
  { value: "10 000", unit: "km", text: { fr: "de fibre optique additionnelle déployés", en: "of additional fibre optic deployed" } },
  { value: "650", unit: "", text: { fr: "nouvelles communautés couvertes en mobile haut débit", en: "new communities covered by mobile broadband" } },
  { value: "1 000", unit: "", text: { fr: "institutions publiques connectées", en: "public institutions connected" } },
  { value: "100", unit: "", text: { fr: "startups soutenues (dont 30 dirigées par des femmes)", en: "startups supported (30 women-led)" } },
  { value: "10", unit: "", text: { fr: "centres d'innovation établis", en: "innovation centres established" } },
  { value: "6 000", unit: "", text: { fr: "personnes inscrites en formation", en: "people enrolled in training" } },
  { value: "100 %", unit: "", text: { fr: "des griefs MGP traités en 30 jours ou moins", en: "of grievances handled in 30 days or less" } },
];

export const composantes: Composante[] = [
  {
    code: "C1", montant: 385, ida: 302, afd: 83,
    titre: { fr: "Accès & inclusion numériques", en: "Digital access & inclusion" },
    desc: { fr: "Porter l'accès à internet à l'échelle du pays : dorsales en fibre optique, couverture mobile haut débit et raccordement des écoles, des universités et des institutions publiques.", en: "Bring internet access to nationwide scale: fibre-optic backbones, mobile broadband coverage and the connection of schools, universities and public institutions." },
    sous: [
      { ref: "1.1", montant: 15, text: { fr: "Cadres et facilitateurs pour l'accès et l'inclusion", en: "Frameworks and enablers for access and inclusion" } },
      { ref: "1.2", montant: 190, text: { fr: "Extension des réseaux de transmission", en: "Extension of transmission networks" } },
      { ref: "1.3", montant: 180, text: { fr: "Connecter citoyens, universités et institutions publiques", en: "Connect citizens, universities and public institutions" } },
    ],
  },
  {
    code: "C2", montant: 55, ida: 43.1, afd: 11.9,
    titre: { fr: "Fondations numériques", en: "Digital foundations" },
    desc: { fr: "Poser les fondations communes des services publics numériques : identité numérique inclusive, interopérabilité des données entre administrations, cybersécurité et confiance.", en: "Lay the shared foundations of digital public services: inclusive digital identity, data interoperability across administrations, cybersecurity and trust." },
    sous: [
      { ref: "2.1", montant: 23, text: { fr: "Partage et gestion des données", en: "Data sharing and management" } },
      { ref: "2.2", montant: 17, text: { fr: "Confiance dans les services numériques", en: "Trust in digital services" } },
      { ref: "2.3", montant: 15, text: { fr: "Prestation de services dans des secteurs clés", en: "Service delivery in key sectors" } },
    ],
  },
  {
    code: "C3", montant: 45, ida: 35.3, afd: 9.7,
    titre: { fr: "Compétences & innovation", en: "Skills & innovation" },
    desc: { fr: "Former une génération aux compétences numériques avancées et soutenir l'innovation locale : universités, hubs technologiques, startups et financements à la performance.", en: "Equip a generation with advanced digital skills and back local innovation: universities, tech hubs, startups and performance-based grants." },
    sous: [
      { ref: "3.1", montant: 32, text: { fr: "Compétences numériques avancées (EES, hubs)", en: "Advanced digital skills (HEIs, hubs)" } },
      { ref: "3.2", montant: 13, text: { fr: "Système de contenu local et innovation", en: "Local content system and innovation" } },
    ],
  },
  {
    code: "C4", montant: 25, ida: 19.6, afd: 5.4,
    titre: { fr: "Coordination & gestion", en: "Coordination & management" },
    desc: { fr: "Donner à l'Unité les moyens d'exécuter avec rigueur : coordination, gestion fiduciaire, passation des marchés, suivi-évaluation, sauvegardes environnementales et sociales, communication.", en: "Give the Unit the means to deliver with rigour: coordination, fiduciary management, procurement, monitoring and evaluation, environmental and social safeguards, communication." },
    sous: [],
  },
  {
    code: "C5", montant: 0, ida: 0, afd: 0,
    titre: { fr: "Réponse d'urgence (CERC)", en: "Emergency response (CERC)" },
    desc: { fr: "Réserve d'intervention rapide, non dotée à ce stade : en cas de crise éligible, elle permet de réaffecter sans délai des ressources du projet.", en: "Rapid-response reserve, currently unfunded: in an eligible crisis, it allows project resources to be reallocated without delay." },
    sous: [],
  },
];

/** Largest funded component, used to scale the budget bars. */
export const composanteMax = Math.max(...composantes.map((c) => c.montant));

export const gouvernance: GouvBody[] = [
  { sigle: "COPIL", nom: { fr: "Comité de Pilotage", en: "Steering Committee" }, nature: { fr: "Stratégique / décisionnel", en: "Strategic / decision-making" }, effectif: "8 membres", presidence: "MPTN", decision: { fr: "Consensus → majorité simple", en: "Consensus → simple majority" }, frequence: { fr: "Semestrielle (min.)", en: "Semi-annual (min.)" } },
  { sigle: "CTP", nom: { fr: "Comité Technique du Projet", en: "Project Technical Committee" }, nature: { fr: "Technique / coordination", en: "Technical / coordination" }, effectif: "12 représentants", presidence: "MPTN", decision: { fr: "Consensus → majorité 2/3", en: "Consensus → two-thirds majority" }, frequence: { fr: "Trimestrielle (min.)", en: "Quarterly (min.)" } },
  { sigle: "UGPTAN", nom: { fr: "Unité de Gestion du Projet", en: "Project Management Unit" }, nature: { fr: "Exécution / gestion", en: "Execution / management" }, effectif: "~21 sous-rôles", presidence: { fr: "Coordonnateur", en: "Coordinator" }, decision: { fr: "Application des décisions", en: "Implementation of decisions" }, frequence: { fr: "Permanente", en: "Permanent" } },
];

export const mandat: Mandat[] = [
  { n: "01", titre: { fr: "Coordination", en: "Coordination" }, desc: { fr: "Garantir la cohérence de l'ensemble : articuler les composantes et animer la relation avec les ministères bénéficiaires, les partenaires et les bailleurs.", en: "Ensure the coherence of the whole: articulate the components and steer the relationship with beneficiary ministries, partners and donors." } },
  { n: "02", titre: { fr: "Exécution", en: "Execution" }, desc: { fr: "Conduire la mise en œuvre : planification opérationnelle (PTBA), passation des marchés, contractualisation et suivi de l'avancement.", en: "Drive implementation: operational planning (AWPB), procurement, contracting and progress monitoring." } },
  { n: "03", titre: { fr: "Supervision technique", en: "Technical supervision" }, desc: { fr: "Garantir la qualité des livrables et le respect des normes — identité numérique, cybersécurité — jusqu'à l'atteinte des résultats.", en: "Guarantee the quality of deliverables and compliance with standards — digital identity, cybersecurity — through to the achievement of results." } },
  { n: "04", titre: { fr: "Supervision fiduciaire", en: "Fiduciary supervision" }, desc: { fr: "Sécuriser les flux financiers : compte désigné, décaissements, reporting financier et préparation des audits.", en: "Safeguard financial flows: designated account, disbursements, financial reporting and audit readiness." } },
];

export const principes: Principe[] = [
  { titre: { fr: "Le MEP reste la source de vérité.", en: "The PIM remains the source of truth." }, desc: { fr: "L'Unité applique le Manuel d'Exécution du Projet : elle le met en œuvre, elle ne le réécrit pas.", en: "The Unit applies the Project Implementation Manual: it carries it out, it does not rewrite it." } },
  { titre: { fr: "Les acteurs restent décisionnaires.", en: "Stakeholders remain the decision-makers." }, desc: { fr: "Les outils proposent, exécutent et tracent. La décision appartient, toujours, aux responsables habilités.", en: "Tools propose, execute and trace. The decision always rests with authorised officials." } },
  { titre: { fr: "Les bailleurs gardent la main.", en: "Donors keep control." }, desc: { fr: "Les prérogatives de la Banque mondiale et de l'AFD — avis de non-objection, supervision, audit — sont intégralement préservées.", en: "The prerogatives of the World Bank and AFD — no-objection, supervision, audit — are fully preserved." } },
];

export const poles: Pole[] = [
  { nom: { fr: "Direction", en: "Management" }, role: { fr: "Pilotage, arbitrage, contrôle interne", en: "Steering, arbitration, internal control" }, roles: ["Coordonnateur", "Coordonnateur Adjoint", "Auditeur Interne"] },
  { nom: { fr: "Composantes", en: "Components" }, role: { fr: "Mise en œuvre technique des activités", en: "Technical implementation of activities" }, roles: ["Responsable Composante 1 (RC1)", "Responsable Composante 2 (RC2)", "Responsable Composante 3 (RC3)"] },
  { nom: { fr: "Fiduciaire", en: "Fiduciary" }, role: { fr: "Gestion financière et comptable", en: "Financial and accounting management" }, roles: ["Responsable Administratif et Financier (RAF)", "Comptable", "Caissier", "Logisticien"] },
  { nom: { fr: "Passation", en: "Procurement" }, role: { fr: "Marchés publics et ANO", en: "Public procurement and NOL" }, roles: ["Responsable Passation des Marchés (RPM)", "Chargé de Passation des Marchés"] },
  { nom: { fr: "Sauvegardes & transversal", en: "Safeguards & cross-cutting" }, role: { fr: "Conformité E&S, suivi, communication, systèmes", en: "E&S compliance, M&E, communication, systems" }, roles: ["Spécialiste Environnement", "Spécialiste Développement Social", "Spécialiste VBG/EAS", "Spécialiste Suivi & Évaluation", "Spécialiste Communication", "Responsable Informatique (IT)", "Agent de liaison provincial"] },
];

export const equipe: Membre[] = [
  { role: { fr: "Coordonnateur", en: "Coordinator" }, pole: { fr: "Direction", en: "Management" }, nom: "Noël Jean-David Litanga", img: "/portraits/coordonnateur-litanga.jpg" },
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
  { role: { fr: "Responsable Informatique", en: "IT Lead" }, pole: { fr: "Systèmes", en: "Systems" } },
];

export const jalons: Jalon[] = [
  { date: "25 nov. 2024", text: { fr: "Signature de l'accord avec la Banque mondiale", en: "Financing agreement signed with the World Bank" } },
  { date: "14 mars 2025", text: { fr: "Signature de la convention avec l'AFD", en: "Financing convention signed with AFD" } },
  { date: "15 avr. 2025", text: { fr: "Création de l'UGPTAN (arrêté ministériel)", en: "Creation of the UGPTAN (ministerial order)" } },
  { date: "23 juin 2025", text: { fr: "Validation du Manuel d'Exécution (MEP)", en: "Validation of the Implementation Manual (PIM)" } },
  { date: "31 oct. 2025", text: { fr: "Entrée en vigueur du projet", en: "Project effectiveness" } },
  { date: "31 déc. 2029", text: { fr: "Achèvement technique", en: "Technical completion" } },
  { date: "30 avr. 2030", text: { fr: "Date limite de décaissement IDA", en: "IDA disbursement deadline" } },
];

export const provinces: Province[] = [
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
  { nom: "Haut-Katanga", x: 61, y: 75, prio: false },
];

export const provincesPrio = provinces.filter((p) => p.prio);
export const provincesAutres = provinces.filter((p) => !p.prio);

export const langues: Langue[] = [
  { code: "fr", label: "Français", greeting: "Bienvenue" },
  { code: "en", label: "English", greeting: "Welcome" },
  { code: "ln", label: "Lingala", greeting: "Mbote" },
  { code: "sw", label: "Kiswahili", greeting: "Karibu" },
  { code: "lu", label: "Tshiluba", greeting: "Moyo" },
  { code: "kg", label: "Kikongo", greeting: "Mbote" },
];

export const profils: Profil[] = [
  { label: { fr: "UGPTAN / Gouvernement", en: "UGPTAN / Government" }, page: { fr: "Cockpit", en: "Cockpit" } },
  { label: { fr: "Entité bénéficiaire (MDA)", en: "Beneficiary entity (MDA)" }, page: { fr: "Tableau de bord", en: "Dashboard" } },
  { label: { fr: "Partenaire", en: "Partner" }, page: { fr: "Espace partenaire", en: "Partner space" } },
  { label: { fr: "Bailleur (BM / AFD)", en: "Donor (WB / AFD)" }, page: { fr: "Portefeuille", en: "Portfolio" } },
  { label: { fr: "Soumissionnaire", en: "Bidder" }, page: { fr: "Marketplace", en: "Marketplace" } },
  { label: { fr: "Bénéficiaire SBP", en: "PBG beneficiary" }, page: { fr: "Mon programme", en: "My programme" } },
  { label: { fr: "Auditeur / Contrôle", en: "Auditor / Control" }, page: { fr: "Plan d'audit", en: "Audit plan" } },
  { label: { fr: "Gouvernance (COPIL / CTP)", en: "Governance (Steering / Technical)" }, page: { fr: "Sessions", en: "Sessions" } },
];

export const question: Bilingual = {
  fr: "Quand un pays se connecte, tout change : l'école apprend autrement, la santé soigne plus loin, le marché s'ouvre et l'État se rapproche du citoyen.",
  en: "When a country connects, everything changes: classrooms teach in new ways, healthcare reaches further, markets open up, and the State draws closer to its citizens.",
};

export const engagement: Bilingual = {
  fr: "Faire du numérique un droit, et non un privilège : 510 millions de dollars pour que chaque Congolaise et chaque Congolais puisse accéder, apprendre et entreprendre.",
  en: "Making digital a right, not a privilege: 510 million dollars so that every Congolese woman and man can connect, learn and build.",
};

/* Component colour code → accent (C1 blue, C2 teal, C3 violet, C4 magenta, C5 grey). */
export const compColors: CompColorMap = {
  C1: "#0f62fe", C2: "#009d9a", C3: "#8a3ffc", C4: "#ee5396", C5: "#6f6f6f",
};
/** Default illustration key per component (used by the tenders page). */
export const compImg: Record<string, import("./types").ImgKey> = {
  C1: "fibre", C2: "datacenter", C3: "formation", C4: "hub", C5: "tour",
};
