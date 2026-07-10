/* ============================================================================
   Contenu spécifique à la direction « Carbon » — désormais migré ici depuis le
   renderVals() codé en dur (cf. guide §6/§8 : une seule source de vérité).
   ========================================================================== */
import type {
  Histoire, ProjVideo, Dialogue, Evenement, GouvActivite, GouvLead, MissionItem,
  PoleAction, MethodeEtape, EngagementItem, GlossaireItem, FaqItem, Partner,
  Ressource, UniteStat, GalleryItem, HumainPoint, ProjetImpact, Persona, Contact,
} from "./types";

/* --- Accueil + Résultats : témoignages de bénéficiaires --------------------- */
export const histoires: Histoire[] = [
  { name: "Esther, 24 ans", role: { fr: "Étudiante — Goma", en: "Student — Goma" }, img: "formation", color: "#8a3ffc", videoYt: "lLIB8fyagio", story: { fr: "« Avant, on se partageait un manuel rare. Aujourd'hui je suis des cours en ligne — et j'ai commencé à coder. »", en: "“I used to share one rare textbook. Now I follow courses online — and I've started to code.”" } },
  { name: "Jean-Pierre", role: { fr: "Commerçant — Tshikapa", en: "Trader — Tshikapa" }, img: "citoyens", color: "#0f62fe", videoYt: "xQpTar5oOgA", story: { fr: "« Je vends maintenant dans tout le pays et j'encaisse par mobile. »", en: "“I now sell across the whole country and get paid by mobile money.”" } },
  { name: "Dr Mwamba", role: { fr: "Médecin — Kindu", en: "Doctor — Kindu" }, img: "sante", color: "#009d9a", videoYt: "2ZJGxoF610c", story: { fr: "« Le dossier partagé et la téléconsultation changent la prise en charge des patients. »", en: "“Shared records and tele-consultation are changing how we care for patients.”" } },
  { name: "Mama Kavira", role: { fr: "Agricultrice — Butembo", en: "Farmer — Butembo" }, img: "agri", color: "#198038", videoYt: "1MKgrHH04dM", story: { fr: "« Je connais enfin les vrais prix du marché — en temps réel, avant de vendre. »", en: "“I finally know the real market prices — in real time, before I sell.”" } },
];

/* --- Résultats : une vidéo par composante ---------------------------------- */
export const projVideos: ProjVideo[] = [
  { comp: "C1", titre: { fr: "Accès & inclusion numériques", en: "Digital access & inclusion" }, color: "#0f62fe", img: "fibre", dur: "4:12" },
  { comp: "C2", titre: { fr: "Fondations numériques", en: "Digital foundations" }, color: "#009d9a", img: "datacenter", dur: "3:38" },
  { comp: "C3", titre: { fr: "Compétences & innovation", en: "Skills & innovation" }, color: "#8a3ffc", img: "formation", dur: "5:01" },
  { comp: "C4", titre: { fr: "Coordination & gestion", en: "Coordination & management" }, color: "#ee5396", img: "hub", dur: "2:54" },
  { comp: "C5", titre: { fr: "Réponse d'urgence (CERC)", en: "Emergency response (CERC)" }, color: "#198038", img: "tour", dur: "3:20" },
];

/* --- Résultats : dialogues sectoriels -------------------------------------- */
export const dialogues: Dialogue[] = [
  { secteur: { fr: "Santé", en: "Health" }, color: "#da1e28", titre: { fr: "Santé numérique & établissements connectés", en: "Digital health & connected facilities" }, desc: { fr: "Télémédecine, dossiers partagés et couverture des centres de santé ruraux.", en: "Telemedicine, shared records and coverage of rural health centres." } },
  { secteur: { fr: "Éducation", en: "Education" }, color: "#8a3ffc", titre: { fr: "Écoles connectées & apprentissage en ligne", en: "Connected schools & online learning" }, desc: { fr: "Raccorder universités, écoles et bibliothèques au réseau.", en: "Bringing universities, schools and libraries onto the network." } },
  { secteur: { fr: "Agriculture", en: "Agriculture" }, color: "#198038", titre: { fr: "Prix du marché & services ruraux", en: "Market prices & rural services" }, desc: { fr: "Information en temps réel et services mobiles pour les agriculteurs.", en: "Real-time information and mobile services for farmers." } },
  { secteur: { fr: "Finance", en: "Finance" }, color: "#0f62fe", titre: { fr: "Inclusion financière & mobile money", en: "Financial inclusion & mobile money" }, desc: { fr: "Comptes, paiements et historique de crédit pour les non-bancarisés.", en: "Accounts, payments and credit history for the unbanked." } },
  { secteur: { fr: "Administration", en: "Public services" }, color: "#009d9a", titre: { fr: "Services publics numériques par défaut", en: "Digital-by-default public services" }, desc: { fr: "Administrations interopérables et identité numérique.", en: "Interoperable administrations and digital identity." } },
  { secteur: { fr: "Secteur privé", en: "Private sector" }, color: "#ff832b", titre: { fr: "Startups, hubs & économie numérique", en: "Startups, hubs & the digital economy" }, desc: { fr: "Financements et infrastructures pour l'innovation locale.", en: "Funding and infrastructure for local innovation." } },
];

/* --- Événements ------------------------------------------------------------ */
export const events: Evenement[] = [
  { id: "forum", date: { fr: "12 sept. 2026", en: "12 Sep 2026" }, type: { fr: "Forum", en: "Forum" }, lieu: { fr: "Kinshasa", en: "Kinshasa" }, color: "#0f62fe", statut: "avenir", img: "hub", titre: { fr: "Forum national de la transformation numérique", en: "National Digital Transformation Forum" }, desc: { fr: "Une journée d'échange entre gouvernement, bailleurs, secteur privé et citoyens.", en: "A day of exchange between government, donors, the private sector and citizens." }, places: { fr: "320 places", en: "320 seats" } },
  { id: "femmes", date: { fr: "3 oct. 2026", en: "3 Oct 2026" }, type: { fr: "Atelier", en: "Workshop" }, lieu: { fr: "Goma", en: "Goma" }, color: "#8a3ffc", statut: "avenir", img: "femmes", titre: { fr: "Atelier — compétences numériques pour les femmes", en: "Workshop — digital skills for women" }, desc: { fr: "Formation pratique et mentorat, dans le cadre de l'objectif 1 000 femmes.", en: "Hands-on training and mentoring, part of the 1,000-women target." }, places: { fr: "80 places", en: "80 seats" } },
  { id: "webinaire", date: { fr: "25 août 2026", en: "25 Aug 2026" }, type: { fr: "Webinaire", en: "Webinar" }, lieu: { fr: "En ligne", en: "Online" }, color: "#009d9a", statut: "avenir", img: "data", titre: { fr: "Webinaire soumissionnaires — répondre à un AOI", en: "Bidders' webinar — how to respond to an ICB" }, desc: { fr: "Une session pratique pour les entreprises candidates aux marchés du Projet.", en: "A practical session for companies bidding on Project contracts." }, places: { fr: "Illimité", en: "Unlimited" } },
  { id: "consultation", date: { fr: "20 oct. 2026", en: "20 Oct 2026" }, type: { fr: "Consultation publique", en: "Public consultation" }, lieu: { fr: "Goma — provinces de l'Est", en: "Goma — Eastern provinces" }, color: "#ff832b", statut: "avenir", img: "ville", titre: { fr: "Consultation publique — sauvegardes E&S (Est)", en: "Public consultation — E&S safeguards (East)" }, desc: { fr: "Écouter les communautés affectées avant les travaux fibre de l'Est.", en: "Listening to affected communities ahead of the Eastern fibre works." }, places: { fr: "Ouvert à tous", en: "Open to all" } },
  { id: "lancement", date: { fr: "oct. 2025", en: "Oct 2025" }, type: { fr: "Jalon", en: "Milestone" }, lieu: { fr: "Kinshasa", en: "Kinshasa" }, color: "#6f6f6f", statut: "passe", img: "hero", titre: { fr: "Lancement officiel du PTN-RDC", en: "Official launch of the DRC Digital Transformation Project" }, desc: { fr: "Le Projet est entré en vigueur — décaissements et premiers marchés lancés.", en: "The Project became effective — disbursements and first contracts began." }, places: { fr: "", en: "" } },
];

/* --- Gouvernance : activité récente ---------------------------------------- */
export const gouvActivites: GouvActivite[] = [
  { date: { fr: "Juin 2026", en: "Jun 2026" }, org: "COPIL", color: "#0f62fe", titre: { fr: "Le COPIL valide le plan de passation 2026", en: "Steering Committee endorses the 2026 procurement plan" }, note: { fr: "Orientations stratégiques confirmées ; premiers marchés structurants autorisés.", en: "Strategic orientations confirmed; first structuring contracts authorised." } },
  { date: { fr: "Mai 2026", en: "May 2026" }, org: "CTP", color: "#009d9a", titre: { fr: "Le CTP examine le cadre de sauvegardes", en: "Technical Committee reviews the safeguards framework" }, note: { fr: "Instruments environnementaux & sociaux validés avant travaux.", en: "Environmental & social instruments cleared ahead of works." } },
  { date: { fr: "Avril 2026", en: "Apr 2026" }, org: "Coordination", color: "#8a3ffc", titre: { fr: "Mission de supervision conjointe Banque mondiale & AFD", en: "Joint supervision mission with the World Bank & AFD" }, note: { fr: "Revue terrain de l'état de préparation dans trois provinces de l'Est.", en: "Field review of readiness in three eastern provinces." } },
  { date: { fr: "Mars 2026", en: "Mar 2026" }, org: "COPIL", color: "#0f62fe", titre: { fr: "Adoption du rapport d'avancement T1", en: "Q1 progress report adopted" }, note: { fr: "Indicateurs de décaissement et de résultats revus au regard des cibles.", en: "Disbursement and results indicators reviewed against targets." } },
  { date: { fr: "Février 2026", en: "Feb 2026" }, org: "Coordination", color: "#198038", titre: { fr: "Activation du réseau de points focaux provinciaux", en: "Provincial focal points network activated" }, note: { fr: "26 provinces reliées au dispositif de plaintes et de liaison.", en: "26 provinces connected to the grievance and liaison system." } },
];

/* --- Gouvernance : rôles de coordination ----------------------------------- */
export const gouvLeads: GouvLead[] = [
  { role: { fr: "Coordonnateur national", en: "National Coordinator" }, pole: { fr: "Coordination", en: "Coordination" }, color: "#0f62fe", mandate: { fr: "Dirige l'Unité, garantit la cohérence et la relation avec les bailleurs.", en: "Leads the Unit, secures coherence and the relationship with donors." }, nom: "Noël Jean-David Litanga", img: "/portraits/coordonnateur-litanga.jpg" },
  { role: { fr: "Coordonnateur technique adjoint", en: "Deputy Technical Coordinator" }, pole: { fr: "Technique & normes", en: "Technical & standards" }, color: "#8a3ffc", mandate: { fr: "Pilote la qualité des livrables et le respect des normes.", en: "Drives delivery quality and compliance with standards." } },
  { role: { fr: "Spécialiste principal en passation", en: "Lead Procurement Specialist" }, pole: { fr: "Passation", en: "Procurement" }, color: "#009d9a", mandate: { fr: "Conduit une passation ouverte et traçable selon les règles de la Banque mondiale.", en: "Runs open, traceable procurement under World Bank rules." } },
  { role: { fr: "Spécialiste suivi-évaluation", en: "M&E Specialist" }, pole: { fr: "Suivi-évaluation", en: "M&E" }, color: "#198038", mandate: { fr: "Mesure les résultats au regard du cadre 2029, sur 26 provinces.", en: "Measures results against the 2029 framework, across 26 provinces." } },
];

/* --- UGPTN : mission (coordonner / exécuter / rendre compte) ---------------- */
export const ugptnMission: MissionItem[] = [
  { t: { fr: "Coordonner", en: "Coordinate" }, d: { fr: "Aligner ministères, partenaires et bailleurs autour d'un seul plan et d'une seule source de vérité.", en: "Align ministries, partners and donors around one plan and one source of truth." } },
  { t: { fr: "Exécuter", en: "Deliver" }, d: { fr: "Passer les marchés, contractualiser et superviser les travaux, services et systèmes du Projet.", en: "Procure, contract and supervise the works, services and systems of the Project." } },
  { t: { fr: "Rendre compte", en: "Account" }, d: { fr: "Mesurer les résultats, sécuriser les fonds et rendre compte — aux citoyens et aux bailleurs.", en: "Measure results, safeguard funds and report — to citizens and to donors." } },
];

/* --- UGPTN : mission + activité en cours par pôle -------------------------- */
export const polesAction: PoleAction[] = [
  { pole: { fr: "Coordination & administration", en: "Coordination & administration" }, color: "#0f62fe", mission: { fr: "Tient le plan d'ensemble et fait tourner l'Unité au quotidien.", en: "Holds the plan together and runs the Unit day to day." }, act: { fr: "En cours : plan de travail glissant 18 mois & reporting bailleurs.", en: "Now: rolling 18-month work plan & donor reporting." } },
  { pole: { fr: "Passation des marchés", en: "Procurement" }, color: "#009d9a", mission: { fr: "Transforme les besoins en marchés ouverts et traçables.", en: "Turns needs into open, traceable contracts." }, act: { fr: "En cours : appel d'offres fibre Est de 2 500 km (AOI/C1).", en: "Now: 2,500 km Eastern fibre tender (AOI/C1)." } },
  { pole: { fr: "Technique & normes", en: "Technical & standards" }, color: "#8a3ffc", mission: { fr: "Garantit la qualité et la conformité — identité, cybersécurité.", en: "Guarantees quality and compliance — identity, cybersecurity." }, act: { fr: "En cours : architecture d'identité numérique & interopérabilité.", en: "Now: digital identity & interoperability architecture." } },
  { pole: { fr: "Gestion fiduciaire", en: "Fiduciary management" }, color: "#ee5396", mission: { fr: "Sécurise l'argent et prépare les audits.", en: "Safeguards the money and prepares the audits." }, act: { fr: "En cours : compte désigné & rapports financiers trimestriels.", en: "Now: designated account & quarterly financial reports." } },
  { pole: { fr: "Suivi-évaluation & sauvegardes", en: "M&E & safeguards" }, color: "#198038", mission: { fr: "Mesure l'impact et protège les personnes et l'environnement.", en: "Measures impact and protects people and the environment." }, act: { fr: "En cours : étude de référence & MGP sur 26 provinces.", en: "Now: baseline study & GRM across 26 provinces." } },
];

/* --- UGPTN : « Du financement aux résultats » (5 étapes) -------------------- */
export const methode: MethodeEtape[] = [
  { t: { fr: "Planifier", en: "Plan" }, d: { fr: "Traduire le MEP en plan d'action et de passation daté (PTBA / PPM).", en: "Translate the PIM into a dated action and procurement plan (AWPB / PP)." } },
  { t: { fr: "Passer les marchés", en: "Procure" }, d: { fr: "Mettre en concurrence, de manière ouverte et traçable, selon les règles de la Banque mondiale.", en: "Run open, traceable competition under World Bank rules." } },
  { t: { fr: "Contractualiser", en: "Contract" }, d: { fr: "Évaluer, obtenir l'avis de non-objection et engager les prestataires.", en: "Evaluate, obtain no-objection and engage the providers." } },
  { t: { fr: "Exécuter & superviser", en: "Deliver & supervise" }, d: { fr: "Piloter travaux, services et systèmes — qualité, normes, sauvegardes.", en: "Steer works, services and systems — quality, standards, safeguards." } },
  { t: { fr: "Mesurer & rendre compte", en: "Measure & account" }, d: { fr: "Suivre les indicateurs, conduire les audits et rendre compte aux citoyens et aux bailleurs.", en: "Track indicators, run audits and report to citizens and donors." } },
];

/* --- UGPTN : engagements / standards --------------------------------------- */
export const engagementsList: EngagementItem[] = [
  { t: { fr: "Transparence", en: "Transparency" }, d: { fr: "Chaque avis publié, chaque attribution rendue publique.", en: "Every notice published, every award made public." }, color: "#0f62fe" },
  { t: { fr: "Traçabilité", en: "Traceability" }, d: { fr: "Chaque processus daté et journalisé, de bout en bout.", en: "Every process dated and logged, end to end." }, color: "#009d9a" },
  { t: { fr: "Réactivité", en: "Responsiveness" }, d: { fr: "100 % des plaintes traitées en 30 jours ou moins.", en: "100% of grievances answered in 30 days or less." }, color: "#8a3ffc" },
  { t: { fr: "Sauvegardes", en: "Safeguards" }, d: { fr: "Protéger les personnes et l'environnement à chaque étape.", en: "Protecting people and the environment at every step." }, color: "#198038" },
  { t: { fr: "Protection des données", en: "Data protection" }, d: { fr: "Règles d'accès strictes (RBAC) ; données cloisonnées et confidentielles.", en: "Strict access rules (RBAC); siloed, confidential data." }, color: "#ee5396" },
  { t: { fr: "Conformité", en: "Compliance" }, d: { fr: "Prérogatives des bailleurs intégralement préservées — aucun raccourci.", en: "Donor prerogatives fully preserved — no shortcuts." }, color: "#ff832b" },
];

/* --- UGPTN : glossaire des sigles ------------------------------------------ */
export const glossaire: GlossaireItem[] = [
  { s: "MEP", d: { fr: "Manuel d'Exécution du Projet — la source de vérité.", en: "Project Implementation Manual — the source of truth." } },
  { s: "COPIL", d: { fr: "Comité de Pilotage — orientation stratégique.", en: "Steering Committee — strategic orientation." } },
  { s: "CTP", d: { fr: "Comité Technique du Projet — préparation et suivi techniques.", en: "Technical Committee — technical preparation & follow-up." } },
  { s: "ANO", d: { fr: "Avis de Non-Objection — l'accord préalable du bailleur.", en: "No-Objection — the donor's prior clearance." } },
  { s: "PPM", d: { fr: "Plan de Passation des Marchés — le calendrier des marchés.", en: "Procurement Plan — the schedule of contracts." } },
  { s: "PTBA", d: { fr: "Plan de Travail et Budget Annuel.", en: "Annual Work Plan & Budget." } },
  { s: "STEP", d: { fr: "Système de suivi des marchés de la Banque mondiale.", en: "World Bank procurement tracking system." } },
  { s: "NES", d: { fr: "Normes Environnementales et Sociales.", en: "Environmental & Social Standards." } },
  { s: "MGP", d: { fr: "Mécanisme de Gestion des Plaintes.", en: "Grievance Redress Mechanism." } },
  { s: "IDA / AFD", d: { fr: "Les deux cofinanceurs du projet.", en: "The project's two co-financiers." } },
];

/* --- UGPTN : FAQ sur l'Unité ----------------------------------------------- */
export const ugptnFaq: FaqItem[] = [
  { q: { fr: "Qu'est-ce que l'UGPTN, exactement ?", en: "What exactly is the UGPTN?" }, r: { fr: "Une unité d'exécution dédiée — pas une nouvelle administration — créée pour mettre en œuvre le Projet de Transformation Numérique pour le compte de l'État, dans le respect des règles de financement.", en: "A dedicated execution unit — not a new administration — set up to deliver the Digital Transformation Project on behalf of the State, within the financing rules." } },
  { q: { fr: "Quelle différence avec le Ministère ?", en: "How is it different from the Ministry?" }, r: { fr: "Les ministères définissent la politique et exercent la tutelle ; l'Unité exécute — elle planifie, passe les marchés, supervise et rend compte. Elle ne s'y substitue jamais.", en: "The ministries set policy and provide oversight; the Unit executes — it plans, procures, supervises and reports. It never replaces them." } },
  { q: { fr: "Qui dirige l'Unité ?", en: "Who leads the Unit?" }, r: { fr: "Un Coordonnateur national, appuyé par cinq pôles fonctionnels — Direction, Composantes, Fiduciaire, Passation et Sauvegardes & transversal — et vingt-et-un sous-rôles, du pilotage à la liaison provinciale.", en: "A National Coordinator, supported by five functional clusters — Management, Components, Fiduciary, Procurement and Safeguards & cross-cutting — and twenty-one sub-roles, from steering to provincial liaison." } },
  { q: { fr: "Comment est-elle financée ?", en: "How is it financed?" }, r: { fr: "Par le Projet : 510 millions de dollars cofinancés par la Banque mondiale (IDA) et l'AFD. Le fonctionnement de l'Unité relève de la composante de gestion.", en: "Through the Project: 510 million dollars co-financed by the World Bank (IDA) and AFD. The Unit's own operating costs are part of the management component." } },
  { q: { fr: "L'Unité décide-t-elle des attributions ?", en: "Does the Unit decide who wins contracts?" }, r: { fr: "Elle conduit le processus de manière transparente, mais les attributions suivent une évaluation traçable et l'avis de non-objection du bailleur. Les outils proposent et tracent ; les responsables habilités décident.", en: "It runs the process transparently, but awards follow traceable evaluation and the donor's no-objection. Tools propose and trace; authorised officials decide." } },
  { q: { fr: "Comment travailler avec l'Unité ?", en: "How can I work with the Unit?" }, r: { fr: "Les entreprises soumissionnent via la page Marchés et l'espace soumissionnaire ; les citoyens peuvent participer aux événements, suivre l'actualité ou saisir le mécanisme de plaintes.", en: "Companies bid through the tenders page and the bidder space; citizens can take part in events, follow the news, or use the grievance mechanism." } },
];

/* --- Accueil : partenaires (logos placeholders) ---------------------------- */
export const partners: Partner[] = [
  { name: "Banque mondiale", kind: { fr: "Bailleur · IDA", en: "Donor · IDA" }, logo: "/partenaires/banque-mondiale.png" },
  { name: "AFD", kind: { fr: "Bailleur", en: "Donor" }, logo: "/partenaires/afd.png" },
  { name: "MPTN", kind: { fr: "Tutelle", en: "Supervision" }, logo: "/partenaires/mptn.png" },
  { name: "Ministère de l'Économie Numérique", kind: { fr: "Ministère", en: "Ministry" }, logo: "/partenaires/economie-numerique.png" },
  { name: "ARPTC", kind: { fr: "Régulateur", en: "Regulator" }, logo: "/partenaires/arptc.png" },
  { name: "ADN", kind: { fr: "Agence du Numérique", en: "Digital Agency" }, logo: "/partenaires/adn.png" },
  { name: "ONIP", kind: { fr: "Identité", en: "Identity" }, logo: "/partenaires/onip.png" },
  { name: "MESU", kind: { fr: "Enseignement sup.", en: "Higher education" }, logo: "/partenaires/mesu.png" },
  { name: "MEPME", kind: { fr: "PME", en: "PME" }, logo: "/partenaires/mepme.png" },
];

/* --- Ressources & publications --------------------------------------------- */
export const ressources: Ressource[] = [
  { k: { fr: "Note d'orientation", en: "Sector note" }, color: "#009d9a", pole: { fr: "Accès & inclusion", en: "Access & inclusion" }, date: { fr: "Juin 2026", en: "Jun 2026" }, titre: { fr: "Réduire la fracture rurale : cadre de priorisation", en: "Closing the rural connectivity gap: prioritisation framework" }, meta: "PDF · 1,8 Mo" },
  { k: { fr: "Note d'orientation", en: "Sector note" }, color: "#009d9a", pole: { fr: "Fondations & confiance", en: "Foundations & trust" }, date: { fr: "Mai 2026", en: "May 2026" }, titre: { fr: "Identité numérique & interopérabilité : principes de conception", en: "Digital identity & interoperability: design principles" }, meta: "PDF · 2,2 Mo" },
  { k: { fr: "Note d'orientation", en: "Sector note" }, color: "#009d9a", pole: { fr: "Compétences & innovation", en: "Skills & innovation" }, date: { fr: "Avril 2026", en: "Apr 2026" }, titre: { fr: "Compétences avancées : aligner la formation au marché de l'emploi", en: "Advanced digital skills: aligning training with the job market" }, meta: "PDF · 1,4 Mo" },
  { k: { fr: "Rapport", en: "Report" }, color: "#0f62fe", pole: { fr: "Coordination", en: "Coordination" }, date: { fr: "T1 2026", en: "Q1 2026" }, titre: { fr: "Rapport d'avancement trimestriel — T1 2026", en: "Quarterly implementation report — Q1 2026" }, meta: "PDF · 3,6 Mo" },
  { k: { fr: "Rapport", en: "Report" }, color: "#0f62fe", pole: { fr: "Coordination", en: "Coordination" }, date: { fr: "2025", en: "2025" }, titre: { fr: "Rapport annuel du projet 2025", en: "Annual project report 2025" }, meta: "PDF · 5,1 Mo" },
  { k: { fr: "Analyse", en: "Analysis" }, color: "#8a3ffc", pole: { fr: "Suivi-évaluation", en: "M&E" }, date: { fr: "Mars 2026", en: "Mar 2026" }, titre: { fr: "Analyse coûts-bénéfices du backbone fibre Est", en: "Cost-benefit analysis of the Eastern fibre backbone" }, meta: "PDF · 2,9 Mo" },
  { k: { fr: "Analyse", en: "Analysis" }, color: "#8a3ffc", pole: { fr: "Sauvegardes", en: "Safeguards" }, date: { fr: "Février 2026", en: "Feb 2026" }, titre: { fr: "Étude de référence environnementale & sociale", en: "Environmental & social baseline study" }, meta: "PDF · 4,3 Mo" },
  { k: { fr: "Note d'orientation", en: "Sector note" }, color: "#009d9a", pole: { fr: "Passation & fiduciaire", en: "Procurement & fiduciary" }, date: { fr: "Janvier 2026", en: "Jan 2026" }, titre: { fr: "Passation ouverte et traçable : application des règles de la Banque mondiale", en: "Open, traceable procurement: applying World Bank rules" }, meta: "PDF · 1,1 Mo" },
];

/* --- UGPTN : chiffres de l'Unité ------------------------------------------- */
export const uniteStats: UniteStat[] = [
  { v: "5", l: { fr: "pôles", en: "clusters" } },
  { v: "21", l: { fr: "sous-rôles", en: "sub-roles" } },
  { v: "2025", l: { fr: "créée par arrêté", en: "created by order" } },
  { v: "510", u: "M$", l: { fr: "enveloppe gérée", en: "envelope managed" } },
  { v: "26", l: { fr: "provinces", en: "provinces" } },
  { v: "2029", l: { fr: "horizon de livraison", en: "delivery horizon" } },
];

/* --- Accueil : galerie par province ---------------------------------------- */
export const galleryProvinces: GalleryItem[] = [
  { nom: "Kinshasa", img: "ville" },
  { nom: "Nord-Kivu · Goma", img: "tour" },
  { nom: "Haut-Katanga · Lubumbashi", img: "hub" },
  { nom: "Tshopo · Kisangani", img: "fibre" },
  { nom: "Kongo Central · Matadi", img: "datacenter" },
  { nom: "Ituri · Bunia", img: "citoyens" },
  { nom: "Kasaï · Kananga", img: "formation" },
  { nom: "Sud-Kivu · Bukavu", img: "femmes" },
];

/* --- Accueil : impact humain ----------------------------------------------- */
export const humainPoints: HumainPoint[] = [
  { big: "30 M", u: { fr: "utilisateurs", en: "users" }, t: { fr: "— un Congolais sur trois en ligne d'ici 2029.", en: "— one Congolese in three online by 2029." } },
  { big: "1 000", u: { fr: "institutions", en: "institutions" }, t: { fr: "écoles, hôpitaux et administrations raccordés.", en: "schools, hospitals and public offices connected." } },
  { big: "1 000", u: { fr: "femmes", en: "women" }, t: { fr: "diplômées du programme de compétences numériques avancées.", en: "graduates of the advanced digital skills programme." } },
  { big: "180", u: { fr: "communautés", en: "communities" }, t: { fr: "rurales non desservies couvertes dès le premier lot.", en: "underserved rural communities covered in the first lot." } },
];

/* --- Projet : ce que ça change (avant / après) ----------------------------- */
export const projetImpacts: ProjetImpact[] = [
  { n: "01", t: { fr: "Démarches administratives", en: "Administrative paperwork" }, av: { fr: "Des jours d'attente et des déplacements pour un seul document.", en: "Days of queuing and travel for a single document." }, ap: { fr: "Une demande en ligne, traitée en quelques minutes.", en: "An online request, processed in minutes." } },
  { n: "02", t: { fr: "École & université", en: "School & university" }, av: { fr: "Des manuels rares, peu ou pas de connexion.", en: "Scarce textbooks, little or no connection." }, ap: { fr: "Cours, bibliothèques et examens accessibles en ligne.", en: "Courses, libraries and exams accessible online." } },
  { n: "03", t: { fr: "Petite entreprise", en: "Small business" }, av: { fr: "Un marché limité au quartier.", en: "A market limited to the neighbourhood." }, ap: { fr: "Vendre dans tout le pays et encaisser par mobile.", en: "Selling nationwide and getting paid by mobile." } },
  { n: "04", t: { fr: "Santé", en: "Health" }, av: { fr: "Des dossiers papier, dispersés et fragiles.", en: "Paper records, scattered and fragile." }, ap: { fr: "Un dossier partagé et la téléconsultation.", en: "A shared record and remote consultations." } },
  { n: "05", t: { fr: "Inclusion financière", en: "Financial inclusion" }, av: { fr: "Le tout-espèces, sans preuve ni historique.", en: "Cash only, with no proof or history." }, ap: { fr: "Un compte mobile, traçable et sécurisé.", en: "A mobile account, traceable and secure." } },
  { n: "06", t: { fr: "Zones rurales", en: "Rural areas" }, av: { fr: "Des villages hors réseau.", en: "Villages off the network." }, ap: { fr: "Une couverture mobile haut débit qui les atteint.", en: "High-speed mobile coverage that reaches them." } },
];

/* --- Projet : pour qui (bénéficiaires) ------------------------------------- */
export const projetPersonas: Persona[] = [
  { k: { fr: "Citoyens", en: "Citizens" }, d: { fr: "Un accès simplifié aux services publics, une identité numérique inclusive.", en: "Simpler access to public services, an inclusive digital identity." } },
  { k: { fr: "Jeunes & étudiants", en: "Youth & students" }, d: { fr: "Des compétences numériques avancées et des ressources d'apprentissage en ligne.", en: "Advanced digital skills and online learning resources." } },
  { k: { fr: "Femmes", en: "Women" }, d: { fr: "Une inclusion ciblée — 1 000 femmes diplômées du programme de compétences.", en: "Targeted inclusion — 1,000 women graduates of the skills programme." } },
  { k: { fr: "Entrepreneurs & startups", en: "Entrepreneurs & startups" }, d: { fr: "Des financements, des hubs et un marché numérique national.", en: "Funding, hubs and a national digital market." } },
  { k: { fr: "Communautés rurales", en: "Rural communities" }, d: { fr: "La couverture haut débit des zones non desservies.", en: "Broadband coverage of underserved areas." } },
  { k: { fr: "Services publics", en: "Public services" }, d: { fr: "Des administrations interopérables et des procédures numériques par défaut.", en: "Interoperable administrations and digital-by-default procedures." } },
];

/* --- Projet : FAQ citoyen -------------------------------------------------- */
export const citoyenFaq: FaqItem[] = [
  { q: { fr: "En quoi ce projet me concerne-t-il, concrètement ?", en: "How does this project concern me, concretely?" }, r: { fr: "Il élargit l'accès à internet, simplifie les services publics en ligne et forme aux métiers du numérique — où que vous viviez dans le pays.", en: "It widens internet access, simplifies public services online and trains for digital jobs — wherever you live in the country." } },
  { q: { fr: "Quand verra-t-on les premiers effets ?", en: "When will the first effects be visible?" }, r: { fr: "Le projet court jusqu'en 2029, avec un déploiement par étapes. Les premiers marchés structurants — fibre et couverture mobile — sont déjà lancés.", en: "The project runs to 2029, with a phased rollout. The first structuring contracts — fibre and mobile coverage — are already under way." } },
  { q: { fr: "Je vis loin d'une grande ville — suis-je concerné ?", en: "I live far from a big city — am I included?" }, r: { fr: "Oui. La couverture vise les 26 provinces, avec une priorité donnée aux zones non desservies et aux 10 provinces du Cadre de Partenariat-Pays.", en: "Yes. Coverage spans all 26 provinces, with priority given to underserved areas and the 10 provinces of the Country Partnership Framework." } },
  { q: { fr: "Que puis-je faire si quelque chose ne va pas ?", en: "What can I do if something goes wrong?" }, r: { fr: "Vous pouvez déposer une plainte via le Mécanisme de Gestion des Plaintes — gratuit, multilingue et traçable. Chaque plainte reçoit un numéro de référence et une réponse sous 30 jours.", en: "You can file a grievance through the Grievance Mechanism — free, multilingual and traceable. Every grievance gets a reference number and a reply within 30 days." } },
];

/* --- Contact + footer : coordonnées officielles ---------------------------- */
export const contact: Contact = {
  adresse: "15, Avenue Pumbu — Immeuble H, Bâtiment B, 4ᵉ étage",
  quartier: "Gombe, Kinshasa — République Démocratique du Congo",
  tel: "+243 810 000 355",
  email: "info@ugptn.cd",
  tutelles: ["Ministère des Postes et Télécommunications", "Ministère de l'Économie Numérique"],
  numeroVert: "XXX",
};
