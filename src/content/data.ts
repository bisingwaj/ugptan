/* ============================================================================
   UGPTN — Données canoniques (MEP du 23 juin 2025).
   Montants, dates, indicateurs et structures IMMUABLES (conformité MEP).
   ========================================================================== */
import type {
  Meta, Chiffre, Repere, Odp, Intermediaire, Composante, GouvBody,
  Pole, Province, Langue, Profil, CompColorMap,
} from "./types";
import type { Bilingual } from "@/lib/pick";

export const meta: Meta = {
  unite: "UGPTN",
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
  { value: 165, unit: "M USD", label: { fr: "Capitaux privés (cible)", en: "Private capital (target)" }, sub: { fr: "Partenariats public-privé — mobilisation visée", en: "Public-private partnerships — mobilisation sought" } },
];

/* Repères mis en avant sur les pages publiques : la portée et le calendrier du
   projet, plutôt que son enveloppe. Les montants restent disponibles dans
   `chiffres` pour les usages qui l'exigent (documents, reporting). */
export const reperes: Repere[] = [
  { v: "26", label: { fr: "Provinces couvertes", en: "Provinces covered" }, sub: { fr: "déploiement priorisé sur 10 d'entre elles", en: "rollout prioritised across 10 of them" } },
  { v: "05", label: { fr: "Composantes", en: "Components" }, sub: { fr: "un seul programme national", en: "a single national programme" } },
  { v: "2029", label: { fr: "Horizon de la transformation", en: "Horizon of the transformation" }, sub: { fr: "achèvement technique visé", en: "targeted technical completion" } },
  { v: "IDA · AFD", label: { fr: "Cofinancement", en: "Co-financing" }, sub: { fr: "Banque mondiale & Agence Française de Développement", en: "World Bank & French Development Agency" } },
];

export const odp: Odp[] = [
  { code: "ODP-1", value: 30, unit: { fr: "millions", en: "million" }, baseline: "0", femmes: "dont 15 millions de femmes", label: { fr: "Personnes utilisant l'internet haut débit", en: "People using broadband internet" } },
  { code: "ODP-2", value: 20, unit: { fr: "kbit/s", en: "kbit/s" }, baseline: "6,65 kbit/s", femmes: null, label: { fr: "Bande passante internationale par habitant", en: "International bandwidth per capita" } },
  { code: "ODP-3", value: 1, unit: { fr: "million", en: "million" }, baseline: "0", femmes: "dont environ la moitié de femmes", label: { fr: "Personnes utilisant des services numériques", en: "People using digital services" } },
  { code: "ODP-4", value: 3000, unit: { fr: "", en: "" }, baseline: "0", femmes: "dont environ un tiers de femmes", label: { fr: "Diplômés de formations numériques avancées", en: "Graduates of advanced digital training" } },
];

export const intermediaires: Intermediaire[] = [
  { value: "10 000", unit: { fr: "km", en: "km" }, text: { fr: "de fibre optique additionnelle visés à l'horizon du projet", en: "of additional fibre optic targeted over the project horizon" } },
  { value: "650", unit: { fr: "", en: "" }, text: { fr: "nouvelles communautés à couvrir en mobile haut débit", en: "new communities to be covered by mobile broadband" } },
  { value: "1 000", unit: { fr: "", en: "" }, text: { fr: "institutions publiques à raccorder", en: "public institutions to be connected" } },
  { value: "100", unit: { fr: "", en: "" }, text: { fr: "startups à soutenir, dont environ un tiers dirigées par des femmes", en: "startups to support, around a third of them women-led" } },
  { value: "10", unit: { fr: "", en: "" }, text: { fr: "centres d'innovation à établir", en: "innovation centres to be established" } },
  { value: "6 000", unit: { fr: "", en: "" }, text: { fr: "personnes à inscrire en formation", en: "people to be enrolled in training" } },
  { value: "30", unit: { fr: "jours", en: "days" }, text: { fr: "délai visé pour le traitement d'un grief MGP", en: "target time frame for handling a grievance" } },
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
  { sigle: "COPIL", nom: { fr: "Comité de Pilotage", en: "Steering Committee" }, nature: { fr: "Stratégique / décisionnel", en: "Strategic / decision-making" }, effectif: { fr: "8 membres", en: "8 members" }, presidence: "MPTN", decision: { fr: "Consensus → majorité simple", en: "Consensus → simple majority" }, frequence: { fr: "Semestrielle (min.)", en: "Semi-annual (min.)" } },
  { sigle: "CTP", nom: { fr: "Comité Technique du Projet", en: "Project Technical Committee" }, nature: { fr: "Technique / coordination", en: "Technical / coordination" }, effectif: { fr: "12 représentants", en: "12 representatives" }, presidence: "MPTN", decision: { fr: "Consensus → majorité 2/3", en: "Consensus → two-thirds majority" }, frequence: { fr: "Trimestrielle (min.)", en: "Quarterly (min.)" } },
  { sigle: "UGPTN", nom: { fr: "Unité de Gestion du Projet", en: "Project Management Unit" }, nature: { fr: "Exécution / gestion", en: "Execution / management" }, effectif: { fr: "5 pôles", en: "5 clusters" }, presidence: { fr: "Coordonnateur", en: "Coordinator" }, decision: { fr: "Application des décisions", en: "Implementation of decisions" }, frequence: { fr: "Permanente", en: "Permanent" } },
];

/* ⚠️ Le MANDAT et les PRINCIPES ne sont plus ici : ils sont administrés
   depuis la console (module « L'UGPTN »), et leur état initial vit dans
   `src/content/impact/ugptn.ts`. Les retirer de ce fichier évite qu'une
   correction faite en console laisse derrière elle une seconde version,
   toujours lisible dans le code et démentie par la page. */

/**
 * Les cinq pôles de l'arrêté, avec ce que chacun porte en ce moment.
 *
 * `mission`, `dossier` et `color` proviennent de l'ancien `polesAction` de
 * `carbon.ts` : la même organisation y était décrite une seconde fois, sous
 * cinq intitulés différents, dans une autre section de la même page. La
 * correspondance retenue est indiquée ligne par ligne ci-dessous.
 *
 * ⚠️ Deux rattachements restent À VALIDER par l'Unité, marqués en commentaire.
 */
export const poles: Pole[] = [
  {
    /* ← « Coordination & administration ». Sûr sur l'arbitrage et la relation
       aux cofinanceurs ; le contrôle interne porté par l'Auditeur n'apparaît
       pas dans la mission reprise. */
    nom: { fr: "Direction", en: "Management" },
    role: { fr: "Pilotage, arbitrage, contrôle interne", en: "Steering, arbitration, internal control" },
    mission: { fr: "Arbitre les priorités entre composantes et tient la relation avec les ministères bénéficiaires et les cofinanceurs.", en: "Arbitrates priorities between components and holds the relationship with beneficiary ministries and co-financiers." },
    dossier: { fr: "Plan de travail glissant 18 mois et reporting bailleurs.", en: "Rolling 18-month work plan and donor reporting." },
    color: "#0f62fe",
    roles: ["Coordonnateur", "Coordonnateur Adjoint", "Auditeur Interne"],
  },
  {
    /* ⚠️ À VALIDER — rattaché à l'ancien « Technique & normes ». Le dossier en
       cours (identité, interopérabilité) relève bien du RC2, mais l'intitulé
       d'origine décrivait la supervision technique, qui est une fonction de
       l'Unité entière et non d'un pôle. */
    nom: { fr: "Composantes", en: "Components" },
    role: { fr: "Mise en œuvre technique des activités", en: "Technical implementation of activities" },
    mission: { fr: "Fixe les spécifications et les normes en amont, puis vérifie la conformité des livrables avant réception.", en: "Sets specifications and standards upstream, then verifies deliverables against them before acceptance." },
    dossier: { fr: "Architecture d'identité numérique et interopérabilité.", en: "Digital identity and interoperability architecture." },
    color: "#8a3ffc",
    roles: ["Responsable Composante 1 (RC1)", "Responsable Composante 2 (RC2)", "Responsable Composante 3 (RC3)"],
  },
  {
    /* ← « Gestion fiduciaire ». Rattachement direct. */
    nom: { fr: "Fiduciaire", en: "Fiduciary" },
    role: { fr: "Gestion financière et comptable", en: "Financial and accounting management" },
    mission: { fr: "Tient la traçabilité de chaque dépense, du compte désigné au justificatif, et prépare la revue des auditeurs externes.", en: "Maintains the traceability of every expenditure, from designated account to supporting document, and prepares external audit review." },
    dossier: { fr: "Compte désigné et rapports financiers trimestriels.", en: "Designated account and quarterly financial reports." },
    color: "#ee5396",
    roles: ["Responsable Administratif et Financier (RAF)", "Comptable", "Caissier", "Logisticien"],
  },
  {
    /* ← « Passation des marchés ». Rattachement direct. */
    nom: { fr: "Passation", en: "Procurement" },
    role: { fr: "Marchés publics et ANO", en: "Public procurement and NOL" },
    mission: { fr: "Traduit un besoin technique en dossier d'appel d'offres défendable, et conduit la mise en concurrence jusqu'à l'attribution.", en: "Translates a technical need into a defensible bidding document, and runs the competition through to award." },
    dossier: { fr: "Appel d'offres pour le backbone fibre des provinces de l'Est (AOI/C1).", en: "Tender for the Eastern provinces' fibre backbone (AOI/C1)." },
    color: "#009d9a",
    roles: ["Responsable Passation des Marchés (RPM)", "Chargé de Passation des Marchés"],
  },
  {
    /* ⚠️ À VALIDER — rattaché à l'ancien « Suivi-évaluation & sauvegardes ».
       Le pôle couvre en plus la communication et l'informatique, que la
       mission reprise n'évoque pas. */
    nom: { fr: "Sauvegardes & transversal", en: "Safeguards & cross-cutting" },
    role: { fr: "Conformité E&S, suivi, communication, systèmes", en: "E&S compliance, M&E, communication, systems" },
    mission: { fr: "Documente l'état initial avant travaux, mesure l'écart ensuite, et traite les effets sociaux et environnementaux du chantier.", en: "Documents the baseline before works, measures the gap afterwards, and handles the social and environmental effects of the worksite." },
    dossier: { fr: "Étude de référence et déploiement du MGP dans les provinces.", en: "Baseline study and rollout of the GRM across the provinces." },
    color: "#198038",
    roles: ["Spécialiste Environnement", "Spécialiste Développement Social", "Spécialiste VBG/EAS", "Spécialiste Suivi & Évaluation", "Spécialiste Communication", "Responsable Informatique (IT)", "Agent de liaison provincial"],
  },
];

/**
 * Nombre de sous-rôles publiés, dérivé plutôt qu'écrit.
 *
 * ⚠️ Il vaut 19, alors que l'Unité en compte 21. L'écart est connu et assumé :
 * les deux rôles manquants seront saisis depuis la console, sur la section de
 * l'organigramme (module « L'UGPTN »). D'ici là, le site n'affiche AUCUN total
 * de sous-rôles — mieux vaut ne rien annoncer qu'annoncer un chiffre que la
 * liste publiée dément.
 *
 * Cette table ne sert plus la page « L'UGPTN », qui lit désormais la base ;
 * elle reste ici pour l'accueil, qui compte encore les pôles.
 */
export const polesSousRoles = poles.reduce((n, p) => n + p.roles.length, 0);

/* ⚠️ Les membres de l'équipe ne sont plus ici : ils sont administrés depuis la
   console (module « L'équipe de l'Unité »), et leur état initial vit dans
   `src/content/equipe.ts`. Une fiche y vaut pour les quatre emplacements du
   site — grille de l'accueil, page « L'Unité », cartes de coordination de
   « Gouvernance », profil du responsable d'une composante — là où ce fichier,
   `content/carbon.ts` et `content/composantes-detail.ts` en tenaient trois
   copies, que rien n'obligeait à concorder. */

/* ⚠️ Les jalons du projet ne sont plus ici : ils sont administrés depuis la
   console (module « Histoires & impact », gabarit « Frise de jalons »), et leur
   état initial vit dans `src/content/impact.ts`. Ils y gagnent de vraies dates,
   là où ce fichier ne portait qu'un libellé français affiché tel quel sur la
   version anglaise du site. */

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
  { label: { fr: "UGPTN / Gouvernement", en: "UGPTN / Government" }, page: { fr: "Cockpit", en: "Cockpit" } },
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
  fr: "Faire du numérique un droit, et non un privilège : un investissement structurant pour qu'un nombre croissant de Congolaises et de Congolais puisse accéder, apprendre et entreprendre.",
  en: "Making digital a right, not a privilege: a structuring investment so that a growing number of Congolese women and men can connect, learn and build.",
};

/* Component colour code → accent (C1 blue, C2 teal, C3 violet, C4 magenta, C5 grey). */
export const compColors: CompColorMap = {
  C1: "#0f62fe", C2: "#009d9a", C3: "#8a3ffc", C4: "#ee5396", C5: "#6f6f6f",
};
/** Default illustration key per component (used by the tenders page). */
export const compImg: Record<string, import("./types").ImgKey> = {
  C1: "fibre", C2: "datacenter", C3: "formation", C4: "hub", C5: "tour",
};
