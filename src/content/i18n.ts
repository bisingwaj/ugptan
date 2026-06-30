/* ============================================================================
   Libellés d'interface (chrome, CTA, copie de page), bilingues FR/EN.
   `dict(lang)` renvoie toutes les chaînes déjà résolues pour la langue active.
   ========================================================================== */
import type { Lang } from "@/lib/pick";

export function dict(lang: Lang) {
  const en = lang === "en";
  const t = (fr: string, e: string) => (en ? e : fr);

  return {
    /* --- Navigation principale + secondaire ------------------------------- */
    nav: {
      accueil: t("Accueil", "Home"),
      projet: t("Le Projet", "The Project"),
      ugptn: t("L'UGPTN", "The UGPTN"),
      gouvernance: t("Gouvernance", "Governance"),
      marches: t("Marchés", "Tenders"),
      transparence: t("Transparence", "Transparency"),
      actualites: t("Actualités", "News"),
      resultats: t("Résultats", "Results"),
      ressources: t("Rapports & analyses", "Reports & analyses"),
      evenements: t("Événements", "Events"),
      contact: t("Contact", "Contact"),
      mgp: t("Plaintes (MGP)", "Grievances"),
      connexion: t("Se connecter", "Sign in"),
    },
    cta: {
      connect: t("Se connecter", "Sign in"),
      docs: t("Documents", "Documents"),
      marches: t("Marchés", "Tenders"),
      mgp: t("Plaintes (MGP)", "Grievances"),
      discover: t("Découvrir le projet", "Discover the project"),
      more: t("En savoir plus", "Learn more"),
      all: t("Tout voir", "View all"),
      report: t("Déposer une plainte", "File a grievance"),
    },
    sec: {
      chiffres: t("Le projet en chiffres", "The project in figures"),
      composantes: t("Les cinq composantes", "The five components"),
      resultats: t("Cadre de résultats — cibles 2029", "Results framework — 2029 targets"),
      couverture: t("Couverture géographique", "Geographic coverage"),
      gouvernance: t("Architecture de gouvernance", "Governance architecture"),
      equipe: t("L'équipe de l'Unité", "The Unit's team"),
      actus: t("Actualités & communiqués", "News & releases"),
      plateforme: t("La plateforme métier — 8 espaces", "The business platform — 8 spaces"),
    },
    lbl: {
      baseline: t("Référence", "Baseline"),
      cible: t("Cible 2029", "2029 target"),
      dont: t("dont", "incl."),
      prio: t("Provinces prioritaires", "Priority provinces"),
      autres: t("Autres provinces", "Other provinces"),
      total: t("Total", "Total"),
      ida: "IDA",
      afd: "AFD",
    },
    foot: {
      transparence: t("Transparence", "Transparency"),
      legal: t(
        "Source de vérité : MEP du 23 juin 2025. Montants, dates et indicateurs conformes aux documents officiels du projet.",
        "Source of truth: PIM of 23 June 2025. Amounts, dates and indicators per the project's official documents.",
      ),
    },
    tagPublic: t("Site institutionnel public", "Public institutional website"),
    langNote: t("Contenu en cours de localisation — disponible au lancement.", "Content being localised — available at launch."),

    /* --- Mots & fragments réutilisables ----------------------------------- */
    words: {
      composantes: t("composantes", "components"),
      prio: t("prioritaires", "priority"),
      provinces: t("provinces", "provinces"),
      roles: t("sous-rôles", "sub-roles"),
      poles: t("pôles", "clusters"),
      bidders: t("soumissionnaires", "bidders"),
      nomAVenir: t("Nom — à venir", "Name — to be confirmed"),
      navigation: t("Navigation", "Navigation"),
      redevabilite: t("Redevabilité", "Accountability"),
      avant: t("Aujourd'hui", "Today"),
      apres: t("Avec le projet", "With the project"),
      ressources: t("Rapports & analyses", "Reports & analyses"),
      views: t("Vues", "Views"),
      bidders_registered: t("Soumissionnaires enregistrés", "Registered bidders"),
      questions_received: t("Questions reçues", "Questions received"),
      activity: t("Activité en direct sur cet avis", "Live activity on this notice"),
      askQuestion: t("Poser une question", "Ask a question"),
      watchProjectFilm: t("Voir le film du projet", "Watch the project film"),
      year: 2026,
    },

    /* --- Accueil ---------------------------------------------------------- */
    home: {
      heroKicker: t("Projet de Transformation Numérique · RDC", "Digital Transformation Project · DRC"),
      heroTitle: t("Transformer la RDC, une connexion à la fois.", "Transforming the DRC, one connection at a time."),
      heroLead: t(
        "L'unité qui coordonne, exécute et supervise le Projet de Transformation Numérique de la RDC — un programme de 510 millions de dollars cofinancé par la Banque mondiale et l'AFD.",
        "The unit that coordinates, delivers and supervises the DRC Digital Transformation Project — a 510 million dollar programme co-financed by the World Bank and AFD.",
      ),
      introLead: t(
        "L'UGPTN s'impose une exigence simple : fonctionner avec les outils numériques qu'elle a mandat de déployer dans tout le pays — et être le premier endroit où cette transformation s'observe.",
        "The UGPTN holds itself to a simple standard: to run on the very digital tools it is mandated to deploy nationwide — and to be the first place where that transformation can be observed.",
      ),
      statusEffective: t("Entrée en vigueur 31.10.2025", "Effectiveness 31.10.2025"),
      statusCompletion: t("Achèvement technique 31.12.2029", "Technical completion 31.12.2029"),
      resultatsTitle: t(
        "Des cibles mesurables à l'horizon 2029 — l'impact et l'inclusion au cœur.",
        "Measurable targets for 2029 — impact and inclusion at the core.",
      ),
      couvertureLead: t(
        "Une couverture nationale des 26 provinces, avec un déploiement priorisé sur les 10 provinces du Cadre de Partenariat-Pays.",
        "Nationwide coverage of all 26 provinces, with a prioritised rollout across the 10 provinces of the Country Partnership Framework.",
      ),
      equipeLead: t(
        "21 sous-rôles regroupés en 5 pôles fonctionnels, de la direction à la liaison provinciale. Noms et portraits à fournir.",
        "21 sub-roles grouped into 5 functional clusters, from management to provincial liaison. Names and portraits to be provided.",
      ),
      humainLabel: t("Impact humain", "Human impact"),
      humainTitle: t("Derrière les chiffres, des vies.", "Behind the figures, real lives."),
      humainLead: t(
        "Les cibles 2029 ne sont pas des abstractions — ce sont des écoles en ligne, des femmes dans les métiers du numérique et des villages raccordés.",
        "The 2029 targets are not abstractions — they are schools online, women in digital careers and villages brought onto the network.",
      ),
      storiesLabel: t("Histoires & impact", "Stories & impact"),
      storiesTitle: t("Au-delà des chiffres, des vies qui changent.", "Beyond the numbers, lives that change."),
      storiesLead: t(
        "Celles et ceux pour qui le Projet existe — des visages, des métiers, des territoires.",
        "The people the Project is for — faces, trades and places across the country.",
      ),
      storiesTeaserCta: t("Voir toutes les histoires & vidéos", "See all stories & videos"),
      watchStory: t("Voir le témoignage", "Watch the testimonial"),
      evtLabel: t("Événements & activités", "Events & activities"),
      evtTitle: t("Rencontrer l'Unité, participer.", "Meet the Unit, take part."),
      evtLead: t(
        "Forums, ateliers, consultations publiques et webinaires organisés par ou avec l'Unité. Inscrivez-vous pour participer.",
        "Forums, workshops, public consultations and webinars organised by or with the Unit. Register to take part.",
      ),
      evtUpcoming: t("À venir", "Upcoming"),
      galleryLabel: t("En images", "In pictures"),
      galleryTitle: t("La transformation, province par province.", "The transformation, province by province."),
      galleryLead: t(
        "Le déploiement vu du terrain, d'une province à l'autre.",
        "Deployment seen from the ground, province by province.",
      ),
      partenairesLabel: t("Partenaires & institutions", "Partners & institutions"),
      partenairesTitle: t("Construit avec ceux qui le rendent possible.", "Built with those who make it possible."),
      partenairesLead: t(
        "Bailleurs, ministère de tutelle, régulateurs et institutions bénéficiaires du Projet.",
        "Donors, the supervising ministry, regulators and beneficiary institutions of the Project.",
      ),
      plateformeTitle: t("Une plateforme, huit espaces sur mesure.", "One platform, eight tailored spaces."),
      plateformeLead: t(
        "Derrière le site public, la plateforme métier offre à chacun des 8 profils son parcours, son accent et son point d'entrée — un produit unique et cohérent.",
        "Behind the public site, the business platform gives each of the 8 stakeholder profiles its own journey, accent and entry point — a single, coherent product.",
      ),
    },

    /* --- Newsletter ------------------------------------------------------- */
    nl: {
      label: "Newsletter",
      title: t("Suivez la transformation, mois après mois.", "Follow the transformation, month by month."),
      lead: t(
        "L'actualité, les résultats et les histoires du Projet — directement dans votre boîte mail.",
        "Project news, results and stories — straight to your inbox.",
      ),
      placeholder: t("votre@email.cd", "your@email.cd"),
      btn: t("S'inscrire", "Subscribe"),
      doneTitle: t("Inscription confirmée", "You're subscribed"),
      doneText: t("Merci — vous recevrez la prochaine édition.", "Thank you — you'll receive the next edition."),
    },

    /* --- Vidéo (lightbox) ------------------------------------------------- */
    video: { watch: t("Voir le film du projet", "Watch the project film") },

    /* --- Événements (inscription) ---------------------------------------- */
    evt: {
      register: t("S'inscrire", "Register"),
      upcoming: t("À venir", "Upcoming"),
      past: t("Passé", "Past"),
      regTitle: t("Demander à participer", "Request to take part"),
      regDoneTitle: t("Demande reçue", "Request received"),
      regDoneText: t(
        "Merci. L'équipe confirmera votre participation par e-mail.",
        "Thank you. The team will confirm your participation by email.",
      ),
      fullName: t("Nom complet", "Full name"),
      orgOptional: t("Organisation (optionnel)", "Organisation (optional)"),
    },

    /* --- Le Projet -------------------------------------------------------- */
    projet: {
      titre: t("Le Projet", "The Project"),
      lead: t(
        "Un programme de 510 millions de dollars pour élargir l'accès, bâtir les fondations numériques de l'État et développer les compétences de la RDC à l'horizon 2029.",
        "A 510 million dollar programme to widen access, build the State's digital foundations and grow the skills of the DRC by 2029.",
      ),
      ctxLabel: t("Contexte & raison d'être", "Context & rationale"),
      ctxTitle: t(
        "L'une des fractures numériques les plus marquées du continent.",
        "One of the most marked digital divides on the continent.",
      ),
      ctxLead: t(
        "Sur un territoire à l'échelle continentale et une population dispersée, la RDC porte l'un des plus larges déficits d'infrastructures d'Afrique. Le projet s'ancre dans l'approche régionale APM IDEA, qui mutualise l'intégration numérique de la région.",
        "Across a continental territory with a widely dispersed population, the DRC carries one of Africa's widest infrastructure gaps. The project is anchored in the regional APM IDEA approach, which pools the region's digital integration.",
      ),
      ctxStats: [
        { v: "6,56", u: "kbit/s", t: t("Bande passante intl./hab. au démarrage", "Intl. bandwidth per capita at start") },
        { v: "26", u: "", t: t("provinces · 2,3 M km²", "provinces · 2.3M km²") },
        { v: "2029", u: "", t: t("horizon de la transformation", "horizon of the transformation") },
      ],
      engLabel: t("Engagements fondateurs", "Founding commitments"),
      engTitle: t("Une structure de cofinancement à deux guichets.", "A two-window co-financing structure."),
      eng: [
        { d: "25.11.2024", t: t("Signature de l'accord de financement avec la Banque mondiale — IDA, 400 M USD.", "Financing agreement signed with the World Bank — IDA, 400 M USD.") },
        { d: "14.03.2025", t: t("Signature de la convention de financement avec l'AFD — 110 M USD / 100 M EUR.", "Financing convention signed with AFD — 110 M USD / 100 M EUR.") },
      ],
      jalonsLabel: t("Calendrier & jalons", "Timeline & milestones"),
      changeLabel: t("Ce que ça change pour vous", "What it changes for you"),
      changeTitle: t(
        "Un pays connecté, c'est d'abord le quotidien rendu plus simple.",
        "A connected country is, first of all, daily life made simpler.",
      ),
      changeLead: t(
        "Derrière les budgets et les composantes, le projet doit se mesurer dans la vie des citoyens, des étudiants, des entrepreneurs et des communautés rurales.",
        "Behind the budgets and the components, the project is meant to be felt in the lives of citizens, students, entrepreneurs and rural communities.",
      ),
      whoLabel: t("Pour qui ?", "Who benefits"),
      whoTitle: t("Un projet pour tout le pays.", "A project for the whole country."),
      cfaqLabel: t("Le projet & vous", "The project & you"),
      cfaqTitle: t("Des réponses claires.", "Straightforward answers."),
      ctaTitle: t("Prenez part à la transformation.", "Take part in the transformation."),
      ctaLead: t(
        "Suivez les appels d'offres, l'actualité, ou signalez une préoccupation.",
        "Track the calls for tender, follow the news, or report a concern.",
      ),
    },

    /* --- L'UGPTN ---------------------------------------------------------- */
    ugptn: {
      titre: t("L'UGPTN", "The UGPTN"),
      lead: t(
        "Le bras opérationnel permanent du projet : elle prépare, exécute et supervise — sans jamais se substituer aux bailleurs ni aux responsables habilités à décider.",
        "The project's permanent operational arm: it prepares, delivers and supervises — without ever standing in for the donors or the officials empowered to decide.",
      ),
      mandatLabel: t("Mandat", "Mandate"),
      mandatTitle: t("Quatre fonctions sur tout le cycle de vie du projet.", "Four functions across the project life-cycle."),
      principesLabel: t("Principes directeurs", "Guiding principles"),
      principesTitle: t("Trois principes intangibles.", "Three intangible principles."),
      polesLabel: t("Organisation interne", "Internal organisation"),
      polesTitle: t("21 sous-rôles, 5 pôles.", "21 sub-roles, 5 clusters."),
      arrete: t("Créée par arrêté ministériel", "Created by ministerial order"),
      objLabel: t("Objectif & rôle", "Objective & role"),
      objTitle: t("À quoi sert l'Unité.", "What the Unit is for."),
      objLead: t(
        "Derrière un nom technique, une mission simple : transformer 510 millions de dollars de financement en connectivité, en services et en compétences — proprement, et dans les délais.",
        "Behind a technical name, a simple mission: to turn 510 million dollars of financing into connectivity, services and skills — cleanly, and on time.",
      ),
      polesActLabel: t("Les pôles en action", "The clusters in action"),
      polesActTitle: t("Cinq pôles, un seul moteur opérationnel.", "Five clusters, one operational engine."),
      polesActLead: t(
        "Ce que fait concrètement chaque pôle — et ce sur quoi il travaille en ce moment.",
        "What each cluster concretely does — and what it is working on right now.",
      ),
      uniteBrefLabel: t("L'Unité en bref", "The Unit at a glance"),
      uniteBrefTitle: t("Une structure resserrée pour un grand mandat.", "A lean structure for a large mandate."),
      methodeLabel: t("Notre méthode", "How we work"),
      methodeTitle: t("Du financement aux résultats, en cinq temps.", "From financing to results, in five moves."),
      methodeLead: t(
        "L'Unité transforme un accord en connectivité, services et compétences — par un cycle discipliné et reproductible.",
        "The Unit turns an agreement into connectivity, services and skills — through a disciplined, repeatable cycle.",
      ),
      engLabel: t("Nos engagements", "Our commitments"),
      engTitle: t("Ce à quoi nous nous engageons.", "How we hold ourselves accountable."),
      glossaireLabel: t("Comprendre les sigles", "Understanding the acronyms"),
      glossaireTitle: t("Le langage du projet, en clair.", "The project's language, in plain words."),
      glossaireLead: t(
        "Un petit glossaire pour que chacun suive — aucun jargon laissé sans explication.",
        "A small glossary so everyone can follow — no jargon left unexplained.",
      ),
      faqLabel: t("À propos de l'Unité", "About the Unit"),
      faqTitle: t("Questions fréquentes.", "Frequently asked questions."),
    },

    /* --- Gouvernance ------------------------------------------------------ */
    gouv: {
      titre: t("Gouvernance", "Governance"),
      lead: t(
        "Trois niveaux complémentaires — stratégique, technique et exécution — chacun doté d'un mandat distinct, jamais confondu.",
        "Three complementary levels — strategic, technical and execution — each with a distinct mandate, never to be confused.",
      ),
      copilComp: t("Composition — 8 membres", "Composition — 8 members"),
      ctpComp: t("Composition — 12 représentants", "Composition — 12 representatives"),
      copilDesc: t(
        "Comité de Pilotage — orientation stratégique, validation des grandes décisions, arbitrage politique.",
        "Steering Committee — strategic orientation, validation of major decisions, political arbitration.",
      ),
      ctpDesc: t(
        "Comité Technique du Projet — préparation des travaux du COPIL, suivi technique, coordination opérationnelle.",
        "Project Technical Committee — preparing the COPIL's work, technical follow-up, operational coordination.",
      ),
      copilMembers: ["MPTN — Président", "Présidence / ADN", "Primature", "Min. Finances", "MIS", "MESU", "MEPME", "+1 désigné"],
      ctpMembers: ["MPTN (préside) +3", "ARPTC", "FDSU", "MIS ×2", "ONIP", "MESU", "MEPME", "MINFIN-CSPP", "ADN", "SOCOF", "Primature"],
      actLabel: t("La coordination en action", "Coordination in action"),
      actTitle: t("Activité récente de la gouvernance.", "Recent governance activity."),
      actLead: t(
        "La trace datée des décisions de pilotage et du travail de coordination — le COPIL, le CTP et l'Unité à l'œuvre.",
        "The dated trace of steering decisions and coordination work — the COPIL, the CTP and the Unit at work.",
      ),
      leadsLabel: t("L'équipe de coordination", "The coordination team"),
      leadsTitle: t("Les femmes et les hommes qui portent le mandat.", "The people who carry the mandate."),
      leadsLead: t(
        "Un annuaire des rôles clés — noms et portraits à confirmer par l'Unité.",
        "A directory of key roles — names and portraits to be confirmed by the Unit.",
      ),
      bodyLabels: {
        nature: t("Nature", "Nature"),
        presidence: t("Présidence", "Chairing"),
        decision: t("Décision", "Decision"),
        frequence: t("Fréquence", "Frequency"),
      },
    },

    /* --- Contact ---------------------------------------------------------- */
    contact: {
      titre: t("Contact", "Contact"),
      lead: t(
        "Joindre le bon interlocuteur — y compris en province — et signaler via un mécanisme de gestion des plaintes accessible, multilingue et entièrement traçable.",
        "Reach the right contact — including in the provinces — and report through a grievance mechanism that is accessible, multilingual and fully traceable.",
      ),
      lblAddress: t("Siège", "Head office"),
      lblPhone: t("Téléphone", "Phone"),
      lblTutelle: t("Tutelle", "Supervising ministries"),
      phoneNote: t("Standard · jours ouvrables", "Switchboard · business days"),
      emailNote: t("Saisine écrite · réponse tracée", "Written referral · traceable reply"),
      numeroVert: t("Numéro vert MGP", "GRM toll-free number"),
      numeroVertNote: t("Appel gratuit · 24h/24 · 6 langues", "Free call · 24/7 · 6 languages"),
      mgpLabel: t("Mécanisme de gestion des plaintes (MGP)", "Grievance mechanism (GRM)"),
      mgpModesTitle: t("Quatre modes de dépôt", "Four ways to file a grievance"),
      mgpModes: [
        { n: "01", t: t("Formulaire web en ligne", "Online web form"), d: t("Catégorisé, horodaté, accusé immédiat.", "Categorised, timestamped, immediate acknowledgement.") },
        { n: "02", t: t("SMS / numéro vert", "SMS / toll-free number"), d: t("Gratuit, accessible sur tout mobile.", "Free, accessible on any mobile.") },
        { n: "03", t: "E-mail", d: t("Saisine écrite avec numéro de référence.", "Written referral with reference number.") },
        { n: "04", t: t("Point focal physique", "Physical focal point"), d: t("Annuaire provincial sur 26 provinces.", "Provincial directory across 26 provinces.") },
      ],
      slaText: t("100 % des griefs traités en 30 jours ou moins.", "100% of grievances handled in 30 days or less."),
      generalTitle: t("Canal général MGP", "General GRM channel"),
      generalDesc: t(
        "Réception → Classification → Instruction → Décision → Clôture. Numéro de référence horodaté, retour systématique au plaignant.",
        "Receipt → Classification → Investigation → Decision → Closure. Timestamped reference number, systematic feedback to the complainant.",
      ),
      easLabel: t("Canal confidentiel MGP-EAS/HS", "Confidential GBV/SEA-SH channel"),
      easText: t(
        "Strictement séparé du MGP général et centré sur la survivante : identité optionnelle, consentement éclairé, aucune donnée visible ailleurs. Référencement vers les services (médical, psychosocial, juridique) sous 24 heures. Aucun export, aucune copie.",
        "A strictly separate, survivor-centred channel: optional identity, informed consent, no data visible elsewhere. Referral to services (medical, psychosocial, legal) within 24 hours. No export, no copy.",
      ),
      easSub: t(
        "Violences basées sur le genre · exploitation et abus sexuels · harcèlement",
        "Gender-based violence · sexual exploitation and abuse · harassment",
      ),
      easCta: t("Accéder au canal confidentiel", "Access the confidential channel"),
      focalLabel: t("Points focaux provinciaux", "Provincial focal points"),
    },

    /* --- Marchés publics -------------------------------------------------- */
    marches: {
      heroTitle: t("La commande publique, ouverte et tracée.", "Public procurement, open and traceable."),
      heroLead: t(
        "Tous les avis du Projet, conformes aux Règlements de Passation des Marchés de la Banque mondiale (2025). Concurrence ouverte, méthodes affichées, résultats publiés.",
        "All Project notices, compliant with the World Bank Procurement Regulations (2025). Open competition, published methods, published results.",
      ),
      search: t("Rechercher un avis, une référence, un lieu…", "Search a notice, reference, location…"),
      results: t("avis", "notice(s)"),
      open: t("ouverts", "open"),
      deadline: t("Date limite", "Deadline"),
      daysLeft: t("jours restants", "days left"),
      viewDetail: t("Voir le détail", "View details"),
      noResult: t("Aucun avis ne correspond à votre recherche.", "No notice matches your search."),
      reset: t("Réinitialiser", "Reset"),
      published: t("Publié le", "Published"),
      budget: t("Budget estimé", "Estimated budget"),
      place: t("Lieu d'exécution", "Place of performance"),
      lots: t("Lots", "Lots"),
      review: t("Revue", "Review"),
      docsTitle: t("Pièces du dossier", "Bidding documents"),
      scheduleTitle: t("Calendrier prévisionnel", "Indicative schedule"),
      addendaTitle: t("Addenda", "Addenda"),
      summary: t("Résumé", "Summary"),
      awardee: t("Attributaire", "Awardee"),
      submitBid: t("Soumettre une offre", "Submit a bid"),
      filtersAll: t("Tous", "All"),
      filterOpen: t("Ouverts", "Open"),
      bidderTitle: t("Devenez soumissionnaire", "Become a bidder"),
      bidderLead: t(
        "Créez un compte vérifié (KYC), accédez aux dossiers (DAO/RFP) et déposez vos offres en ligne, en lien avec STEP.",
        "Create a verified account (KYC), access the documents (DAO/RFP) and submit your bids online, linked to STEP.",
      ),
    },

    /* --- Transparence documentaire --------------------------------------- */
    docs: {
      heroTitle: t("Tout document divulgable, accessible et daté.", "Every disclosable document, accessible and dated."),
      heroLead: t(
        "Le dépôt public officiel du Projet, en application de l'obligation de divulgation (NES 10) et de la politique d'accès à l'information de la Banque mondiale.",
        "The Project's official public repository, under the disclosure obligation (ESS 10) and the World Bank's access-to-information policy.",
      ),
      search: t("Rechercher un document…", "Search a document…"),
      sortBy: t("Trier par", "Sort by"),
      sortRef: t("Référence", "Reference"),
      sortSize: t("Taille", "Size"),
      noResult: t("Aucun document ne correspond à votre recherche.", "No document matches your search."),
      colDoc: t("Document", "Document"),
      colMeta: t("Version · Date · Langue · Taille", "Version · Date · Language · Size"),
      download: t("Télécharger", "Download"),
      previewNote: t("Aperçu à l'écran — le fichier officiel est téléchargeable.", "On-screen preview — the official file is downloadable."),
      disclaimer: t(
        "Seuls les documents divulgables sont publiés ; aucun contenu confidentiel ou nominatif. Le versionnage est explicite. Conforme à la politique d'accès à l'information de la Banque mondiale.",
        "Only disclosable documents are published; no confidential or personal content. Versioning is explicit. Compliant with the World Bank's access-to-information policy.",
      ),
    },

    /* --- Actualités ------------------------------------------------------- */
    actus: {
      heroTitle: t("Actualités & communiqués.", "News & releases."),
      heroLead: t(
        "L'avancement du Projet, au plus près : décisions, jalons et communiqués officiels, publiés au fur et à mesure de leur adoption.",
        "The Project's progress, up close: decisions, milestones and official releases, published as they are adopted.",
      ),
      readArticle: t("Lire l'article", "Read the article"),
      allFilter: t("Tout", "All"),
      timeline: t("Fil chronologique", "Timeline"),
      relatedVideo: t("Voir la vidéo associée", "Watch the related video"),
      allNews: t("Toutes les actualités", "All news"),
    },

    /* --- Résultats -------------------------------------------------------- */
    resultats: {
      heroTitle: t("Le projet, en pleine transparence.", "The project, in full transparency."),
      heroLead: t(
        "Le cadre de résultats distingue les indicateurs d'Objectif de Développement (impact) des indicateurs intermédiaires (réalisations). Suivi via les outils SIG / GEMS sur les 26 provinces.",
        "The results framework distinguishes Development Objective indicators (impact) from intermediate indicators (outputs). Tracked via MIS / GEMS tools across 26 provinces.",
      ),
      odpLabel: t("ODP · cibles 2029", "PDO · 2029 targets"),
      interLabel: t("Indicateurs intermédiaires", "Intermediate indicators"),
      projVideosLabel: t("Le projet en vidéos", "The project in videos"),
      projVideosTitle: t("Chaque composante, racontée en images.", "Each component, told in pictures."),
      projVideosLead: t(
        "De courts films pour mettre en avant chaque volet du Projet.",
        "Short films to highlight each part of the Project.",
      ),
      dialoguesLabel: t("Dialogues sectoriels", "Sector dialogues"),
      dialoguesTitle: t("Un espace d'échange avec chaque secteur.", "A space for exchange with every sector."),
      dialoguesLead: t(
        "La transformation numérique touche tous les secteurs — voici comment, et avec qui nous travaillons.",
        "Digital transformation touches every sector — here is how, and with whom we work.",
      ),
    },

    /* --- Ressources ------------------------------------------------------- */
    ressources: {
      titre: t("Rapports & publications", "Reports & publications"),
      hero: t("Rapports, analyses et notes d'orientation sectorielles.", "Reports, analyses and sector orientation notes."),
      lead: t(
        "Produits par les pôles de l'Unité — la production analytique qui éclaire les décisions du Projet.",
        "Produced by the Unit's clusters — the analytical output that informs the Project's decisions.",
      ),
      download: t("Télécharger", "Download"),
    },

    /* --- MGP -------------------------------------------------------------- */
    mgp: {
      heroTitle: t("Votre voix compte. Et elle est tracée.", "Your voice matters. And it is traced."),
      heroLead: t(
        "Le Mécanisme de Gestion des Plaintes recueille, classe, instruit et clôture chaque doléance — avec un engagement public : 100 % des griefs traités en 30 jours ou moins.",
        "The Grievance Mechanism collects, classifies, investigates and closes every complaint — with a public commitment: 100% of grievances handled in 30 days or less.",
      ),
      slaBadge: t("SLA public · 30 jours · 6 langues · numéro vert 24/7", "Public SLA · 30 days · 6 languages · 24/7 toll-free"),
      formTitle: t("Déposer une plainte", "File a grievance"),
      step: t("Étape", "Step"),
      stepLabels: [
        t("Catégorie", "Category"),
        t("Description", "Description"),
        t("Pièces jointes", "Attachments"),
        t("Coordonnées", "Contact"),
        t("Récapitulatif", "Summary"),
      ],
      chooseCat: t("Sur quoi porte votre plainte ?", "What is your grievance about?"),
      describe: t("Décrivez les faits", "Describe the facts"),
      describePlaceholder: t("Décrivez les faits, le lieu et la date…", "Describe the facts, the location and the date…"),
      addFiles: t("Ajouter des documents (photo, PDF…)", "Add documents (photo, PDF…)"),
      optional: t("(optionnel)", "(optional)"),
      dropHint: t("Cliquez pour parcourir ou glissez un fichier ici", "Click to browse or drag a file here"),
      contactStep: t("Comment vous recontacter ?", "How can we reach you?"),
      contactNote: t(
        "Optionnel, mais cela nous permet de revenir vers vous. Laissez vide pour rester anonyme.",
        "Optional, but it lets us follow up. Leave blank to stay anonymous.",
      ),
      email: t("E-mail", "Email"),
      phone: t("Téléphone", "Phone"),
      province: t("Province", "Province"),
      reviewSubmit: t("Vérifiez et envoyez", "Review and submit"),
      category: t("Catégorie", "Category"),
      description: t("Description", "Description"),
      attachments: t("Pièces jointes", "Attachments"),
      anonymous: t("Anonyme", "Anonymous"),
      prev: t("Précédent", "Back"),
      next: t("Suivant", "Next"),
      submitGrievance: t("Envoyer ma plainte", "Submit my grievance"),
      submittedTitle: t("Plainte enregistrée", "Grievance registered"),
      refIntro: t("Votre numéro de référence horodaté :", "Your timestamped reference number:"),
      refKeep: t(
        "Conservez-le pour suivre votre dossier. Retour systématique à la clôture, sous 30 jours maximum.",
        "Keep it to track your case. Systematic feedback at closure, within 30 days maximum.",
      ),
      newGrievance: t("Déposer une autre plainte", "File another grievance"),
      formFootnote: t(
        "Multilingue (FR + langues nationales). Aucune donnée du canal confidentiel EAS/HS ne transite par ce formulaire.",
        "Multilingual (FR + national languages). No data from the confidential GBV/SEA-SH channel passes through this form.",
      ),
      trackTitle: t("Suivre ma plainte", "Track my grievance"),
      trackLead: t(
        "Saisissez votre numéro de référence pour connaître l'état d'instruction.",
        "Enter your reference number to see its status.",
      ),
      track: t("Suivre", "Track"),
      trackErr: t("Veuillez saisir un numéro de référence.", "Please enter a reference number."),
      daysRemaining: t("j restants", "days left"),
      pipelineTitle: t("Pipeline de traitement", "Processing pipeline"),
      modes: [
        { n: "01", t: t("Formulaire web", "Web form"), d: t("Catégorisé, horodaté, accusé immédiat.", "Categorised, timestamped, immediate acknowledgement.") },
        { n: "02", t: t("SMS / numéro vert", "SMS / toll-free"), d: t("Gratuit, accessible sur tout mobile.", "Free, accessible on any mobile.") },
        { n: "03", t: "E-mail", d: t("Saisine écrite avec numéro de référence.", "Written referral with reference number.") },
        { n: "04", t: t("Point focal", "Focal point"), d: t("Annuaire provincial · 26 provinces.", "Provincial directory · 26 provinces.") },
      ],
      generalTitle: t("Canal général MGP", "General GRM channel"),
      generalDesc: t(
        "Réception → Classification → Instruction → Décision → Clôture. Numéro de référence horodaté, retour systématique au plaignant.",
        "Receipt → Classification → Investigation → Decision → Closure. Timestamped reference number, systematic feedback to the complainant.",
      ),
      easTitle: t("Canal confidentiel MGP-EAS/HS", "Confidential GBV/SEA-SH channel"),
      easSub: t(
        "Violences basées sur le genre · exploitation et abus sexuels · harcèlement",
        "Gender-based violence · sexual exploitation and abuse · harassment",
      ),
      easBody: t(
        "Strictement séparé du MGP général et centré sur la survivante : identité optionnelle, consentement éclairé, aucune donnée visible ailleurs. Référencement vers les services (médical, psychosocial, juridique) sous 24 heures. Aucun export, aucune copie.",
        "Strictly separate from the general GRM and survivor-centred: optional identity, informed consent, no data visible elsewhere. Referral to services (medical, psychosocial, legal) within 24 hours. No export, no copy.",
      ),
      easCta: t("Accéder au canal confidentiel", "Access the confidential channel"),
      faqLabel: "FAQ · MGP",
      faqTitle: t("Questions fréquentes.", "Frequently asked questions."),
      faqLead: t(
        "L'essentiel sur le fonctionnement du mécanisme de gestion des plaintes.",
        "The essentials about how the grievance mechanism works.",
      ),
    },

    /* --- Connexion (espace soumissionnaire) ------------------------------ */
    connexion: {
      bidderSpace: t("Espace soumissionnaire", "Bidder space"),
      heroTitle: t("Soumissionnez aux marchés du Projet, en ligne.", "Bid for Project contracts, online."),
      benefits: [
        t("Compte vérifié (KYC) en quelques minutes", "Verified account (KYC) in minutes"),
        t("Accès aux dossiers (DAO / RFP) et dépôt d'offres", "Access to documents (DAO / RFP) and bid submission"),
        t("Suivi en temps réel, en lien avec STEP", "Real-time tracking, linked to STEP"),
      ],
      rbacNote: t("RBAC · données cloisonnées · traçabilité", "RBAC · siloed data · traceability"),
      signin: t("Se connecter", "Sign in"),
      signinLead: t("Accédez à votre espace soumissionnaire.", "Access your bidder space."),
      emailLabel: t("E-mail", "Email"),
      passwordLabel: t("Mot de passe", "Password"),
      noAccount: t("Pas encore de compte ?", "No account yet?"),
      createAccount: t("Créer un compte", "Create an account"),
      registerTitle: t("Créer un compte soumissionnaire", "Create a bidder account"),
      registerLead: t("Renseignez votre organisation pour démarrer la vérification.", "Enter your organisation to start verification."),
      orgName: t("Nom de l'organisation", "Organisation name"),
      emailPro: t("E-mail professionnel", "Business email"),
      country: t("Pays", "Country"),
      create: t("Créer le compte", "Create the account"),
      kycNote: t("Vérification KYC requise. Vos données sont traitées de manière confidentielle.", "KYC verification required. Your data is processed confidentially."),
      backSignin: t("Connexion", "Sign in"),
      creatingSteps: [
        t("Création du compte", "Creating account"),
        t("Vérification KYC", "KYC verification"),
        t("Configuration de votre espace", "Configuring your workspace"),
        t("Finalisation", "Finalising"),
      ],
      hello: t("Bonjour, Entreprise Soumissionnaire", "Hello, Bidder Company"),
      kycVerified: t("KYC vérifié", "KYC verified"),
      logout: t("Se déconnecter", "Sign out"),
      stats: [
        { l: t("Offres déposées", "Bids submitted") },
        { l: t("En évaluation", "Under evaluation") },
        { l: t("Attribuée", "Awarded") },
      ],
      myBids: t("Mes offres", "My bids"),
      demoNote: t("Espace de démonstration — données illustratives.", "Demo space — illustrative data."),
      deposit: t("Déposer une offre", "Deposit a bid"),
      offres: [
        { ref: "AOI/C1/2026-014", objet: t("Backbone fibre — lots Est", "Fibre backbone — Eastern lots"), statut: t("Déposée", "Submitted"), color: "#198038", date: "28 sept. 2026" },
        { ref: "SFQC/C3/2026-009", objet: t("Programme compétences numériques", "Advanced digital skills programme"), statut: t("En évaluation", "Under evaluation"), color: "#0f62fe", date: "19 août 2026" },
        { ref: "AOI/C1/2026-003", objet: t("Mobile haut débit — lot 1", "Mobile broadband — lot 1"), statut: t("Attribuée", "Awarded"), color: "#8a3ffc", date: "15 mai 2026" },
      ],
    },
  };
}

export type Dict = ReturnType<typeof dict>;
