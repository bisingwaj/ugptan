/* ============================================================================
   Contenu spécifique à la direction « Carbon » — désormais migré ici depuis le
   renderVals() codé en dur (cf. guide §6/§8 : une seule source de vérité).
   ========================================================================== */
import type {
  ProjVideo, Evenement, GouvActivite, GouvLead, MissionItem,
  PoleAction, MethodeEtape, EngagementItem, GlossaireItem, FaqItem, Partner,
  Ressource, UniteStat, GalleryItem, Persona, Contact,
} from "./types";

/* ⚠️ Quatre jeux de données ont quitté ce fichier : les témoignages de
   bénéficiaires, les chiffres d'impact humain, les diptyques avant/après et les
   dialogues sectoriels. Ils sont désormais administrés depuis la console
   (module « Histoires & impact »), et leur état initial vit dans
   `src/content/impact.ts`. En garder une copie ici aurait garanti la dérive :
   deux sources pour un même texte, dont une seule est corrigée. */

/* --- Résultats : une vidéo par composante ---------------------------------- */
export const projVideos: ProjVideo[] = [
  { comp: "C1", titre: { fr: "Accès & inclusion numériques", en: "Digital access & inclusion" }, color: "#0f62fe", img: "fibre", dur: "4:12" },
  { comp: "C2", titre: { fr: "Fondations numériques", en: "Digital foundations" }, color: "#009d9a", img: "datacenter", dur: "3:38" },
  { comp: "C3", titre: { fr: "Compétences & innovation", en: "Skills & innovation" }, color: "#8a3ffc", img: "formation", dur: "5:01" },
  { comp: "C4", titre: { fr: "Coordination & gestion", en: "Coordination & management" }, color: "#ee5396", img: "hub", dur: "2:54" },
  { comp: "C5", titre: { fr: "Réponse d'urgence (CERC)", en: "Emergency response (CERC)" }, color: "#198038", img: "tour", dur: "3:20" },
];

/* --- Événements ------------------------------------------------------------ */
export const events: Evenement[] = [
  { id: "forum", date: { fr: "12 sept. 2026", en: "12 Sep 2026" }, type: { fr: "Forum", en: "Forum" }, lieu: { fr: "Kinshasa", en: "Kinshasa" }, color: "#0f62fe", statut: "avenir", img: "hub", titre: { fr: "Forum national de la transformation numérique", en: "National Digital Transformation Forum" }, desc: { fr: "Une journée d'échange entre gouvernement, bailleurs, secteur privé et citoyens.", en: "A day of exchange between government, donors, the private sector and citizens." }, places: { fr: "320 places", en: "320 seats" } },
  { id: "femmes", date: { fr: "3 oct. 2026", en: "3 Oct 2026" }, type: { fr: "Atelier", en: "Workshop" }, lieu: { fr: "Goma", en: "Goma" }, color: "#8a3ffc", statut: "avenir", img: "femmes", titre: { fr: "Atelier — compétences numériques pour les femmes", en: "Workshop — digital skills for women" }, desc: { fr: "Formation pratique et mentorat, dans le cadre du volet inclusion des femmes.", en: "Hands-on training and mentoring, part of the women's inclusion strand." }, places: { fr: "80 places", en: "80 seats" } },
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
  { t: { fr: "Coordonner", en: "Coordinate" }, d: { fr: "Tenir un calendrier unique là où chaque institution a le sien, et arbitrer l'ordre des chantiers quand ils se conditionnent mutuellement.", en: "Holding one schedule where each institution has its own, and arbitrating the order of workstreams when they condition one another." } },
  { t: { fr: "Exécuter", en: "Deliver" }, d: { fr: "Conduire chaque marché de la spécification à la réception, en tenant les délais de revue du bailleur qui rythment l'ensemble.", en: "Running each contract from specification to acceptance, holding to the donor review timelines that set the overall pace." } },
  { t: { fr: "Rendre compte", en: "Account" }, d: { fr: "Publier ce qui est décidé et mesuré, y compris les retards, pour que l'exécution reste contestable pendant qu'elle peut encore être corrigée.", en: "Publishing what is decided and measured, including delays, so that delivery stays contestable while it can still be corrected." } },
];

/* --- UGPTN : mission + activité en cours par pôle -------------------------- */
export const polesAction: PoleAction[] = [
  { pole: { fr: "Coordination & administration", en: "Coordination & administration" }, color: "#0f62fe", mission: { fr: "Arbitre les priorités entre composantes et tient la relation avec les ministères bénéficiaires et les cofinanceurs.", en: "Arbitrates priorities between components and holds the relationship with beneficiary ministries and co-financiers." }, act: { fr: "En cours : plan de travail glissant 18 mois & reporting bailleurs.", en: "Now: rolling 18-month work plan & donor reporting." } },
  { pole: { fr: "Passation des marchés", en: "Procurement" }, color: "#009d9a", mission: { fr: "Traduit un besoin technique en dossier d'appel d'offres défendable, et conduit la mise en concurrence jusqu'à l'attribution.", en: "Translates a technical need into a defensible bidding document, and runs the competition through to award." }, act: { fr: "En cours : appel d'offres pour le backbone fibre des provinces de l'Est (AOI/C1).", en: "Now: tender for the Eastern provinces' fibre backbone (AOI/C1)." } },
  { pole: { fr: "Technique & normes", en: "Technical & standards" }, color: "#8a3ffc", mission: { fr: "Fixe les spécifications et les normes en amont, puis vérifie la conformité des livrables avant réception.", en: "Sets specifications and standards upstream, then verifies deliverables against them before acceptance." }, act: { fr: "En cours : architecture d'identité numérique & interopérabilité.", en: "Now: digital identity & interoperability architecture." } },
  { pole: { fr: "Gestion fiduciaire", en: "Fiduciary management" }, color: "#ee5396", mission: { fr: "Tient la traçabilité de chaque dépense, du compte désigné au justificatif, et prépare la revue des auditeurs externes.", en: "Maintains the traceability of every expenditure, from designated account to supporting document, and prepares external audit review." }, act: { fr: "En cours : compte désigné & rapports financiers trimestriels.", en: "Now: designated account & quarterly financial reports." } },
  { pole: { fr: "Suivi-évaluation & sauvegardes", en: "M&E & safeguards" }, color: "#198038", mission: { fr: "Documente l'état initial avant travaux, mesure l'écart ensuite, et traite les effets sociaux et environnementaux du chantier.", en: "Documents the baseline before works, measures the gap afterwards, and handles the social and environmental effects of the worksite." }, act: { fr: "En cours : étude de référence & déploiement du MGP dans les provinces.", en: "Now: baseline study & rollout of the GRM across the provinces." } },
];

/* --- UGPTN : « Du financement aux résultats » (5 étapes) -------------------- */
export const methode: MethodeEtape[] = [
  { t: { fr: "Planifier", en: "Plan" }, d: { fr: "Traduire le manuel en plan daté (PTBA / PPM), en plaçant les revues du bailleur sur le calendrier plutôt qu'en les découvrant en route.", en: "Translating the manual into a dated plan (AWPB / PP), placing donor reviews on the schedule rather than discovering them en route." } },
  { t: { fr: "Passer les marchés", en: "Procure" }, d: { fr: "Publier un dossier complet dès la première fois : une relance pour cause de pièce manquante coûte une saison de travaux.", en: "Publishing a complete file first time round: a relaunch caused by a missing document costs a construction season." } },
  { t: { fr: "Contractualiser", en: "Contract" }, d: { fr: "Évaluer selon les critères annoncés, obtenir l'avis de non-objection, puis engager — l'ordre compte et n'admet pas de raccourci.", en: "Evaluating against the announced criteria, obtaining the no-objection, then committing — the order matters and admits no shortcut." } },
  { t: { fr: "Exécuter & superviser", en: "Deliver & supervise" }, d: { fr: "Contrôler sur site et sur pièces, traiter les plaintes riveraines à mesure, et refuser une réception non conforme tant qu'elle l'est.", en: "Checking on site and on record, handling neighbouring communities’ grievances as they arise, and refusing acceptance while a deliverable remains non-compliant." } },
  { t: { fr: "Mesurer & rendre compte", en: "Measure & account" }, d: { fr: "Rapporter l'avancement province par province, publier les écarts au plan, et alimenter la revue suivante avec ce qui n'a pas fonctionné.", en: "Reporting progress province by province, publishing gaps against plan, and feeding the next review with what did not work." } },
];

/* --- UGPTN : engagements / standards --------------------------------------- */
export const engagementsList: EngagementItem[] = [
  { t: { fr: "Transparence", en: "Transparency" }, d: { fr: "Chaque avis publié, chaque attribution rendue publique — y compris quand le résultat ne nous arrange pas.", en: "Every notice published, every award made public — including when the outcome is inconvenient." }, color: "#0f62fe" },
  { t: { fr: "Traçabilité", en: "Traceability" }, d: { fr: "Toute décision se rattache à une pièce datée : un auditeur doit pouvoir la reconstituer sans nous.", en: "Every decision is attached to a dated record: an auditor must be able to reconstruct it without us." }, color: "#009d9a" },
  { t: { fr: "Réactivité", en: "Responsiveness" }, d: { fr: "Chaque plainte instruite, avec un délai de traitement visé de 30 jours.", en: "Every grievance investigated, with a target handling time of 30 days." }, color: "#8a3ffc" },
  { t: { fr: "Sauvegardes", en: "Safeguards" }, d: { fr: "Les instruments environnementaux et sociaux sont consultés et divulgués avant les travaux, jamais régularisés après.", en: "Environmental and social instruments are consulted and disclosed before works, never regularised afterwards." }, color: "#198038" },
  { t: { fr: "Protection des données", en: "Data protection" }, d: { fr: "Accès limité au strict nécessaire et cloisonnement des canaux : les données du canal confidentiel ne circulent nulle part ailleurs.", en: "Access limited to what is strictly necessary and channels kept separate: data from the confidential channel travels nowhere else." }, color: "#ee5396" },
  { t: { fr: "Conformité", en: "Compliance" }, d: { fr: "Aucune dépense engagée avant l'avis de non-objection requis, quelle que soit l'urgence invoquée.", en: "No expenditure committed before the required no-objection, whatever urgency is invoked." }, color: "#ff832b" },
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
  { q: { fr: "Qu'est-ce que l'UGPTN, exactement ?", en: "What exactly is the UGPTN?" }, r: { fr: "Une structure d'exécution à durée déterminée, créée par arrêté pour conduire un projet précis. Elle n'a pas de compétence réglementaire, ne délivre aucun service au public et disparaîtra avec le projet : sa raison d'être est de porter une capacité de gestion que l'administration ordinaire n'a pas vocation à maintenir en permanence.", en: "A time-limited delivery structure, created by ministerial order to run one specific project. It holds no regulatory powers, delivers no service to the public, and will end with the project: its purpose is to carry a management capacity that the ordinary administration is not meant to maintain permanently." } },
  { q: { fr: "Quelle différence avec le Ministère ?", en: "How is it different from the Ministry?" }, r: { fr: "Le ministère décide de la politique, fixe les priorités et exerce la tutelle ; l'Unité met en œuvre ce qui a été décidé et en rend compte. Concrètement : un ministère peut demander qu'un chantier soit engagé ; l'Unité ne peut pas décider qu'il le soit.", en: "The ministry sets policy, defines priorities and exercises oversight; the Unit implements what has been decided and accounts for it. Concretely: a ministry can require that a workstream be launched; the Unit cannot decide that it should be." } },
  { q: { fr: "Qui dirige l'Unité ?", en: "Who leads the Unit?" }, r: { fr: "Un Coordonnateur national, sous la supervision du Comité de Pilotage. L'organisation compte cinq pôles — Direction, Composantes, Fiduciaire, Passation, Sauvegardes & transversal — et vingt-et-un sous-rôles, dont des agents de liaison en province : l'exécution ne se pilote pas uniquement depuis Kinshasa.", en: "A National Coordinator, under the supervision of the Steering Committee. The organisation has five clusters — Management, Components, Fiduciary, Procurement, Safeguards & cross-cutting — and twenty-one sub-roles, including provincial liaison officers: delivery cannot be steered from Kinshasa alone." } },
  { q: { fr: "Comment est-elle financée ?", en: "How is it financed?" }, r: { fr: "Par le Projet lui-même, cofinancé par la Banque mondiale (IDA) et l'Agence Française de Développement. Le fonctionnement de l'Unité relève de la composante de coordination et de gestion.", en: "Through the Project itself, co-financed by the World Bank (IDA) and the French Development Agency. The Unit's own operating costs fall under the coordination and management component." } },
  { q: { fr: "L'Unité décide-t-elle des attributions ?", en: "Does the Unit decide who wins contracts?" }, r: { fr: "Non, pas seule. L'évaluation applique les critères publiés dans le dossier d'appel d'offres, elle est conduite par une commission et son résultat est soumis à l'avis de non-objection du bailleur avant toute notification. C'est ce triple verrou — critères annoncés, évaluation collégiale, revue externe — qui rend une attribution contestable et défendable.", en: "No, not alone. Evaluation applies the criteria published in the bidding document, is conducted by a committee, and its result is submitted for the donor's no-objection before any notification. It is this triple lock — announced criteria, collegial evaluation, external review — that makes an award both challengeable and defensible." } },
  { q: { fr: "Comment travailler avec l'Unité ?", en: "How can I work with the Unit?" }, r: { fr: "Selon ce que vous êtes. Une entreprise crée un compte vérifié et répond aux avis publiés. Une institution bénéficiaire passe par le comité technique. Un chercheur ou un journaliste trouve les documents divulgables dans le dépôt public. Un citoyen peut assister aux consultations, ou saisir le mécanisme de plaintes s'il constate une difficulté.", en: "It depends who you are. A company creates a verified account and responds to published notices. A beneficiary institution goes through the technical committee. A researcher or journalist finds disclosable documents in the public repository. A citizen can attend consultations, or use the grievance mechanism if they encounter a difficulty." } },
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
  { k: { fr: "Note d'orientation", en: "Sector note" }, color: "#009d9a", pole: { fr: "Accès & inclusion", en: "Access & inclusion" }, comp: "C1", date: { fr: "Juin 2026", en: "Jun 2026" }, titre: { fr: "Réduire la fracture rurale : cadre de priorisation", en: "Closing the rural connectivity gap: prioritisation framework" }, meta: "PDF · 1,8 Mo" },
  { k: { fr: "Note d'orientation", en: "Sector note" }, color: "#009d9a", pole: { fr: "Fondations & confiance", en: "Foundations & trust" }, comp: "C2", date: { fr: "Mai 2026", en: "May 2026" }, titre: { fr: "Identité numérique & interopérabilité : principes de conception", en: "Digital identity & interoperability: design principles" }, meta: "PDF · 2,2 Mo" },
  { k: { fr: "Note d'orientation", en: "Sector note" }, color: "#009d9a", pole: { fr: "Compétences & innovation", en: "Skills & innovation" }, comp: "C3", date: { fr: "Avril 2026", en: "Apr 2026" }, titre: { fr: "Compétences avancées : aligner la formation au marché de l'emploi", en: "Advanced digital skills: aligning training with the job market" }, meta: "PDF · 1,4 Mo" },
  { k: { fr: "Rapport", en: "Report" }, color: "#0f62fe", pole: { fr: "Coordination", en: "Coordination" }, comp: "C4", date: { fr: "T1 2026", en: "Q1 2026" }, titre: { fr: "Rapport d'avancement trimestriel — T1 2026", en: "Quarterly implementation report — Q1 2026" }, meta: "PDF · 3,6 Mo" },
  { k: { fr: "Rapport", en: "Report" }, color: "#0f62fe", pole: { fr: "Coordination", en: "Coordination" }, comp: "C4", date: { fr: "2025", en: "2025" }, titre: { fr: "Rapport annuel du projet 2025", en: "Annual project report 2025" }, meta: "PDF · 5,1 Mo" },
  { k: { fr: "Analyse", en: "Analysis" }, color: "#8a3ffc", pole: { fr: "Suivi-évaluation", en: "M&E" }, comp: "C4", date: { fr: "Mars 2026", en: "Mar 2026" }, titre: { fr: "Analyse coûts-bénéfices du backbone fibre Est", en: "Cost-benefit analysis of the Eastern fibre backbone" }, meta: "PDF · 2,9 Mo" },
  { k: { fr: "Analyse", en: "Analysis" }, color: "#8a3ffc", pole: { fr: "Sauvegardes", en: "Safeguards" }, comp: "C4", date: { fr: "Février 2026", en: "Feb 2026" }, titre: { fr: "Étude de référence environnementale & sociale", en: "Environmental & social baseline study" }, meta: "PDF · 4,3 Mo" },
  { k: { fr: "Note d'orientation", en: "Sector note" }, color: "#009d9a", pole: { fr: "Passation & fiduciaire", en: "Procurement & fiduciary" }, comp: "C4", date: { fr: "Janvier 2026", en: "Jan 2026" }, titre: { fr: "Passation ouverte et traçable : application des règles de la Banque mondiale", en: "Open, traceable procurement: applying World Bank rules" }, meta: "PDF · 1,1 Mo" },
];

/* --- UGPTN : chiffres de l'Unité ------------------------------------------- */
export const uniteStats: UniteStat[] = [
  { v: "5", l: { fr: "pôles", en: "clusters" } },
  { v: "21", l: { fr: "sous-rôles", en: "sub-roles" } },
  { v: "2025", l: { fr: "créée par arrêté", en: "created by order" } },
  { v: "3", l: { fr: "niveaux de gouvernance", en: "levels of governance" } },
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

/* --- Projet : pour qui (bénéficiaires) ------------------------------------- */
export const projetPersonas: Persona[] = [
  { k: { fr: "Citoyens", en: "Citizens" }, d: { fr: "Moins de pièces à réunir et moins de déplacements — à condition que les registres publics puissent se parler et qu'une identité fiable existe.", en: "Fewer documents to gather and fewer journeys — provided public registries can talk to each other and a reliable identity exists." } },
  { k: { fr: "Jeunes & étudiants", en: "Youth & students" }, d: { fr: "Des parcours techniques alignés sur les métiers qui recrutent, dans des établissements équipés et raccordés — la qualification vaut par le signal qu'elle donne à l'employeur.", en: "Technical pathways aligned with the trades that are hiring, in equipped and connected institutions — a qualification is worth the signal it sends to employers." } },
  { k: { fr: "Femmes", en: "Women" }, d: { fr: "Une part suivie et rapportée dans la formation comme dans l'entrepreneuriat : l'inclusion est une cible mesurée, pas une intention affichée.", en: "A share that is tracked and reported, in training as in entrepreneurship: inclusion is a measured target, not a stated intention." } },
  { k: { fr: "Entrepreneurs & startups", en: "Entrepreneurs & startups" }, d: { fr: "Un financement versé au fil de jalons atteints, et des équipements mutualisés en centre d'innovation plutôt qu'à acquérir seul.", en: "Financing released as milestones are met, and equipment pooled in innovation centres rather than bought alone." } },
  { k: { fr: "Communautés rurales", en: "Rural communities" }, d: { fr: "Une couverture là où le calcul commercial ne mène pas, et une consultation préalable lorsque les travaux traversent leurs terres.", en: "Coverage where commercial logic does not lead, and prior consultation where works cross their land." } },
  { k: { fr: "Services publics", en: "Public services" }, d: { fr: "Des briques communes — identité, échange de données, hébergement, sécurité — qui évitent à chaque ministère de reconstruire les mêmes fonctions.", en: "Shared building blocks — identity, data exchange, hosting, security — that spare each ministry from rebuilding the same functions." } },
];

/* --- Projet : FAQ citoyen -------------------------------------------------- */
export const citoyenFaq: FaqItem[] = [
  { q: { fr: "En quoi ce projet me concerne-t-il, concrètement ?", en: "How does this project concern me, concretely?" }, r: { fr: "De trois façons, selon votre situation : le réseau se rapproche de chez vous, les démarches qui exigeaient un déplacement passent progressivement en ligne, et des formations techniques s'ouvrent dans les établissements du pays. L'effet n'arrive pas partout en même temps : le déploiement suit un ordre de priorité publié.", en: "In three ways, depending on your situation: the network moves closer to you, procedures that required travel move progressively online, and technical training opens in the country's institutions. The effect does not reach everywhere at once: deployment follows a published order of priority." } },
  { q: { fr: "Quand verra-t-on les premiers effets ?", en: "When will the first effects be visible?" }, r: { fr: "Par étapes, et pas dans le même ordre partout. Un marché d'infrastructure se prépare, se met en concurrence, s'attribue puis s'exécute : entre la publication d'un avis et la mise en service d'un tronçon, il s'écoule normalement plusieurs saisons. Les premiers marchés structurants sont lancés ; leur calendrier prévisionnel est publié sur la page Marchés.", en: "In stages, and not in the same order everywhere. An infrastructure contract is prepared, competed, awarded and then delivered: between the publication of a notice and a section entering service, several seasons normally pass. The first structuring contracts are under way; their indicative schedules are published on the Tenders page." } },
  { q: { fr: "Je vis loin d'une grande ville — suis-je concerné ?", en: "I live far from a big city — am I included?" }, r: { fr: "Oui, et c'est même le sens de l'intervention publique : les zones que le marché dessert déjà n'ont pas besoin d'être subventionnées. La couverture vise les 26 provinces, avec une priorité donnée aux dix provinces du Cadre de Partenariat-Pays et aux localités non desservies.", en: "Yes — and that is precisely the point of public action: areas the market already serves do not need subsidising. Coverage targets all 26 provinces, with priority given to the ten Country Partnership Framework provinces and to underserved localities." } },
  { q: { fr: "Que puis-je faire si quelque chose ne va pas ?", en: "What can I do if something goes wrong?" }, r: { fr: "Saisissez le Mécanisme de Gestion des Plaintes : formulaire en ligne, SMS, numéro vert gratuit, e-mail ou point focal en province. Le dépôt est gratuit, possible en plusieurs langues, et peut rester anonyme. Vous recevez un numéro de référence horodaté qui permet de suivre l'instruction ; l'Unité vise une réponse dans un délai de 30 jours. Un canal confidentiel distinct traite les cas de violences basées sur le genre.", en: "Use the Grievance Redress Mechanism: online form, SMS, free toll-free number, email or a provincial focal point. Filing is free, available in several languages, and may remain anonymous. You receive a timestamped reference number to follow the case; the Unit aims to reply within 30 days. A separate confidential channel handles gender-based violence cases." } },
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
