/* ============================================================================
   Libellés d'interface (chrome, CTA, copie de page), bilingues FR/EN.
   `dict(lang)` renvoie toutes les chaînes déjà résolues pour la langue active.
   ========================================================================== */
import type { Lang } from "@/lib/pick";
import type { NavKey } from "@/lib/routes";

export function dict(lang: Lang) {
  const en = lang === "en";
  const t = (fr: string, e: string) => (en ? e : fr);

  return {
    /* --- Navigation principale + secondaire ------------------------------- */
    nav: {
      accueil: t("Accueil", "Home"),
      projet: t("Le Projet", "The Project"),
      composantes: t("Composantes", "Components"),
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
      mgpSuivi: t("Suivre une plainte", "Track a grievance"),
      confidentialite: t("Politique de confidentialité", "Privacy policy"),
      conditions: t("Conditions d'utilisation", "Terms of use"),
    },

    /* Libellé abrégé dans un sous-menu, là où reprendre le libellé de la page
       répéterait l'intitulé du groupe qui l'ouvre. */
    navSub: {
      projet: t("Vue d'ensemble", "Overview"),
      ugptn: t("L'Unité", "The Unit"),
      transparence: t("Documents publiés", "Published documents"),
      actualites: t("Communiqués", "Releases"),
    } as Partial<Record<NavKey, string>>,

    /* Une ligne par destination, affichée sous le lien dans les sous-menus :
       le lecteur choisit sans avoir à ouvrir la page pour comprendre. */
    navDesc: {
      projet: t(
        "Objectifs, financement et calendrier d'exécution jusqu'en 2029.",
        "Objectives, financing and implementation schedule to 2029.",
      ),
      composantes: t(
        "Les cinq composantes, leur périmètre et leurs projets phares.",
        "The five components, their scope and flagship projects.",
      ),
      resultats: t(
        "Indicateurs d'objectif et intermédiaires, suivis province par province.",
        "Objective and intermediate indicators, tracked province by province.",
      ),
      ugptn: t(
        "Mandat, principes directeurs et organisation en cinq pôles.",
        "Mandate, guiding principles and organisation into five clusters.",
      ),
      gouvernance: t(
        "Comité de pilotage, comité technique et séparation des rôles.",
        "Steering committee, technical committee and separation of roles.",
      ),
      marches: t(
        "Avis en cours, méthode de passation, pièces exigées et délais.",
        "Open notices, procurement method, required documents and deadlines.",
      ),
      transparence: t(
        "Dépôt officiel des documents divulgables, versionnés et datés.",
        "Official repository of disclosable documents, versioned and dated.",
      ),
      ressources: t(
        "Notes, études et rapports sur lesquels reposent les arbitrages.",
        "Notes, studies and reports on which trade-offs rest.",
      ),
      mgp: t(
        "Déposer une plainte, suivre son traitement, canal confidentiel EAS/HS.",
        "File a grievance, track its handling, confidential SEA/SH channel.",
      ),
      actualites: t(
        "Décisions, jalons et communiqués publiés au fil de l'exécution.",
        "Decisions, milestones and releases published as implementation proceeds.",
      ),
      evenements: t(
        "Consultations publiques, ateliers et webinaires ouverts à contribution.",
        "Public consultations, workshops and webinars open for contribution.",
      ),
      contact: t(
        "Siège à Kinshasa, points focaux provinciaux et numéro vert.",
        "Head office in Kinshasa, provincial focal points and toll-free number.",
      ),
    } as Partial<Record<NavKey, string>>,
    cta: {
      docs: t("Documents", "Documents"),
      marches: t("Marchés", "Tenders"),
      mgp: t("Plaintes (MGP)", "Grievances"),
      discover: t("Découvrir le projet", "Discover the project"),
      more: t("En savoir plus", "Learn more"),
      all: t("Tout voir", "View all"),
      report: t("Déposer une plainte", "File a grievance"),
      /* Renvoie au portail des soumissionnaires, hébergé par un tiers
         (cf. lib/external.ts). Aucun lien du site public ne mène à la console
         d'administration de l'UGPTN. */
      login: t("Se connecter", "Sign in"),
      loginHint: t(
        "Espace des soumissionnaires — plateforme partenaire, ouverture dans un nouvel onglet",
        "Bidders' space — partner platform, opens in a new tab",
      ),
    },
    sec: {
      chiffres: t("Le projet en bref", "The project at a glance"),
      composantes: t("Les cinq composantes", "The five components"),
      resultats: t("Cadre de résultats — ambitions à l'horizon 2029", "Results framework — ambitions towards 2029"),
      couverture: t("Couverture géographique", "Geographic coverage"),
      gouvernance: t("Architecture de gouvernance", "Governance architecture"),
      equipe: t("L'équipe de l'Unité", "The Unit's team"),
      actus: t("Actualités & communiqués", "News & releases"),
      plateforme: t("La plateforme métier — 8 espaces", "The business platform — 8 spaces"),
    },
    lbl: {
      baseline: t("Point de départ", "Starting point"),
      cible: t("Ambition à l'horizon 2029", "Ambition towards 2029"),
      dont: t("dont", "incl."),
      prio: t("Provinces prioritaires", "Priority provinces"),
      autres: t("Autres provinces", "Other provinces"),
      total: t("Total", "Total"),
      ida: "IDA",
      afd: "AFD",
      /* Marqueur d'ordre de grandeur, apposé aux valeurs prospectives. */
      approx: "≈",
      /* Mention affichée sous tout bloc d'indicateurs prospectifs. */
      indicatif: t(
        "Ordres de grandeur issus du cadre de résultats du projet. Ces ambitions orientent l'exécution ; elles sont revues périodiquement avec les partenaires et ne constituent pas un engagement de résultat.",
        "Orders of magnitude drawn from the project's results framework. These ambitions guide implementation; they are reviewed periodically with partners and do not constitute a guarantee of results.",
      ),
    },
    foot: {
      transparence: t("Transparence", "Transparency"),
      /* Provenance des données chiffrées, déplacée sous l'identité de l'Unité. */
      source: t(
        "Source de vérité : MEP du 23 juin 2025. Montants, dates et indicateurs conformes aux documents officiels du projet.",
        "Source of truth: PIM of 23 June 2025. Amounts, dates and indicators per the project's official documents.",
      ),
      legalLabel: t("Informations légales", "Legal information"),
    },
    /* --- Pages légales ----------------------------------------------------- */
    legal: {
      crumb: t("Informations légales", "Legal information"),
      sommaire: t("Sommaire", "Contents"),
      maj: t("Dernière mise à jour", "Last updated"),
      voirAussi: t("À lire également", "Also to be read"),
      code: t(
        "Ordonnance-loi n° 23/010 du 13 mars 2023 portant Code du numérique",
        "Ordinance-Law No. 23/010 of 13 March 2023 enacting the Digital Code",
      ),
      contactTitre: t("Une question sur ce document ?", "A question about this document?"),
      contactLead: t(
        "Écrivez au responsable du traitement, ou saisissez le mécanisme de gestion des plaintes si votre demande porte sur une décision du projet.",
        "Write to the data controller, or refer the matter to the grievance mechanism if your request concerns a project decision.",
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
        "L'Unité qui pilote la transformation numérique de la RDC — un programme cofinancé par la Banque mondiale et l'AFD, engagé sur les 26 provinces pour élargir progressivement l'accès, les services et les compétences numériques.",
        "The Unit steering the DRC's digital transformation — a programme co-financed by the World Bank and AFD, engaged across all 26 provinces to progressively widen access, services and digital skills.",
      ),
      introKicker: t("Notre ambition", "Our ambition"),
      introLead: t(
        "Trois chantiers, et une seule logique : un réseau qui atteint les territoires, un socle numérique commun à l'État, et les compétences pour faire vivre l'un et l'autre. Pris séparément, aucun ne produit d'effet durable ; c'est leur enchaînement qui compte.",
        "Three efforts, one logic: a network that reaches the territories, a digital foundation shared across the State, and the skills to keep both running. Taken separately, none produces lasting effects; it is their sequence that matters.",
      ),
      statusEffective: t("Entrée en vigueur 31.10.2025", "Effectiveness 31.10.2025"),
      statusCompletion: t("Achèvement technique 31.12.2029", "Technical completion 31.12.2029"),
      resultatsTitle: t(
        "Des ambitions mesurables à l'horizon 2029 — l'impact et l'inclusion au cœur.",
        "Measurable ambitions towards 2029 — impact and inclusion at the core.",
      ),
      couvertureLead: t(
        "Le projet couvre les 26 provinces, mais pas au même rythme : dix d'entre elles, retenues dans le Cadre de Partenariat-Pays, sont traitées en priorité. Cet ordre est publié — c'est ce qui permet à chacun de savoir où en est son territoire.",
        "The project covers all 26 provinces, but not at the same pace: ten of them, identified in the Country Partnership Framework, are treated first. That order is published — which is what allows each territory to know where it stands.",
      ),
      equipeLead: t(
        "Une équipe d'exécution organisée en cinq pôles — Direction, Composantes, Fiduciaire, Passation, Sauvegardes & transversal — et vingt-et-un sous-rôles, du pilotage national à la liaison avec les provinces.",
        "An execution team organised into five clusters — Management, Components, Fiduciary, Procurement, Safeguards & cross-cutting — and twenty-one sub-roles, from national steering to provincial liaison.",
      ),
      humainLabel: t("Impact humain", "Human impact"),
      humainTitle: t("Ce que ces ambitions représentent, une fois traduites.", "What these ambitions mean, once translated."),
      humainLead: t(
        "Ces ambitions ne sont pas des abstractions — ce sont des écoles en ligne, des femmes dans les métiers du numérique et des villages raccordés.",
        "These ambitions are not abstractions — they are schools online, women in digital careers and villages brought onto the network.",
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
      evtTitle: t("Échanger, participer, contribuer.", "Exchange, take part, contribute."),
      evtLead: t(
        "Les consultations publiques ne sont pas des séances d'information : ce qui s'y dit est consigné et doit être pris en compte avant que les travaux ne démarrent. Les forums, ateliers et webinaires suivent la même règle — on y vient pour contribuer, pas pour assister.",
        "Public consultations are not briefing sessions: what is said there is recorded and must be taken into account before works begin. Forums, workshops and webinars follow the same rule — you come to contribute, not to attend.",
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
        "Un projet de cette nature ne se conduit pas depuis une seule institution : le régulateur, les ministères sectoriels, l'agence du numérique et l'organisme d'identification portent chacun une part du résultat.",
        "A project of this kind cannot be run from a single institution: the regulator, sector ministries, the digital agency and the identification body each carry part of the result.",
      ),
      plateformeTitle: t("Une plateforme, huit espaces sur mesure.", "One platform, eight tailored spaces."),
      plateformeLead: t(
        "Un soumissionnaire, un auditeur et un ministère bénéficiaire n'ont ni les mêmes droits d'accès ni les mêmes besoins. La plateforme métier attribue à chaque profil son espace et ses outils, sur une base de données commune et cloisonnée.",
        "A bidder, an auditor and a beneficiary ministry have neither the same access rights nor the same needs. The business platform gives each profile its own space and tools, on a shared and compartmentalised data foundation.",
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

    /* --- Événements -------------------------------------------------------
       Les libellés du calendrier public et de la fiche d'un événement, y
       compris la demande de participation intégrée, qui ne s'affiche que pour
       les rencontres sans lien d'inscription externe. */
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

      /* --- Sections du calendrier ---------------------------------------- */
      sectionAVenir: t("Prochaines rencontres", "Upcoming events"),
      sectionAVenirLead: t(
        "Les dates déjà arrêtées, de la plus proche à la plus lointaine.",
        "Dates already set, from the nearest to the furthest.",
      ),
      sectionPasses: t("Rencontres passées", "Past events"),
      sectionPassesLead: t(
        "Ce qui s'est tenu, conservé en ligne : les comptes rendus et les engagements pris y renvoient.",
        "What has already taken place, kept online: reports and commitments refer back to it.",
      ),
      ongoing: t("En cours", "Under way"),
      aucun: t("Aucun événement n'est annoncé pour le moment.", "No events are announced at the moment."),
      aucunAVenir: t(
        "Aucune date n'est arrêtée pour l'instant. Les prochaines rencontres seront annoncées ici.",
        "No date is set for now. Upcoming events will be announced here.",
      ),
      aucunResultat: t("Aucun événement ne correspond à cette recherche.", "No event matches this search."),
      retirerFiltre: t("Tout afficher", "Show all"),
      rechercher: t("Rechercher un événement…", "Search an event…"),
      rechercherAction: t("Rechercher", "Search"),
      filtresLabel: t("Filtrer par catégorie", "Filter by category"),
      allFilter: t("Tout", "All"),

      /* --- Carte & fiche -------------------------------------------------- */
      detail: t("Voir le détail", "See details"),
      allEvents: t("Tous les événements", "All events"),
      filArianeLabel: t("Fil d'Ariane", "Breadcrumb"),
      navigationLabel: t("Événement précédent et suivant", "Previous and next event"),
      precedent: t("Précédent", "Previous"),
      suivant: t("Suivant", "Next"),
      aVoir: t("Autres rencontres", "Other events"),

      blocPratique: t("Informations pratiques", "Practical information"),
      quand: t("Quand", "When"),
      ou: t("Où", "Where"),
      adresse: t("Adresse", "Address"),
      jauge: t("Participation", "Attendance"),
      organisateur: t("Organisateur", "Organiser"),
      complement: t("À savoir", "Good to know"),
      modality: t("Modalité", "Format"),
      modePresentiel: t("Sur place", "On site"),
      modeEnLigne: t("En ligne", "Online"),
      modeHybride: t("Sur place et en ligne", "On site and online"),
      journee: t("Journée entière", "All day"),
      rejoindre: t("Rejoindre en ligne", "Join online"),
      enSavoirPlus: t("En savoir plus", "Find out more"),
      contacter: t("Écrire à l'organisateur", "Email the organiser"),
      termine: t(
        "Cet événement est terminé. La page reste en ligne pour mémoire.",
        "This event has ended. The page remains online for the record.",
      ),
      enCoursAvis: t("Cet événement se tient en ce moment.", "This event is taking place right now."),
      /* Traduction manquante : la mention nomme la langue réellement servie,
         plutôt que de laisser croire à un texte rédigé dans celle du site. */
      traductionAbsente: (servie: Lang) =>
        t(
          `Cet événement n'est pour l'instant décrit qu'en ${servie === "en" ? "anglais" : "français"}.`,
          `This event is currently described in ${servie === "en" ? "English" : "French"} only.`,
        ),
      lireDansLaLangue: (servie: Lang) =>
        t(
          `Lire la version ${servie === "en" ? "anglaise" : "française"}`,
          `Read the ${servie === "en" ? "English" : "French"} version`,
        ),
    },

    /* --- Le Projet -------------------------------------------------------- */
    projet: {
      titre: t("Le Projet", "The Project"),
      lead: t(
        "Trois chantiers menés ensemble parce qu'aucun ne produit d'effet seul : élargir l'accès au réseau, doter l'État d'un socle numérique commun, et former les compétences qui feront vivre l'un et l'autre. Horizon 2029.",
        "Three efforts pursued together because none works alone: widening access to the network, giving the State a common digital foundation, and building the skills that will keep both running. Horizon 2029.",
      ),
      ctxLabel: t("Contexte & raison d'être", "Context & rationale"),
      ctxTitle: t(
        "Le retard n'est pas technologique. Il est géographique, énergétique et institutionnel.",
        "The gap is not technological. It is geographic, energy-related and institutional.",
      ),
      ctxLead: t(
        "Les technologies de réseau sont disponibles et éprouvées ; ce qui manque, ce sont les conditions qui les rendent rentables à déployer. Un territoire de 2,3 millions de kilomètres carrés, une population dispersée, une électrification partielle et des systèmes publics conçus séparément les uns des autres : chacun de ces facteurs renchérit l'accès ou empêche l'usage. Le projet s'ancre dans l'approche régionale APM IDEA, qui mutualise l'intégration numérique de l'Afrique orientale et australe — parce que la capacité internationale et les corridors de transit se négocient à l'échelle de la région, pas d'un pays isolé.",
        "Network technologies are available and proven; what is missing are the conditions that make them viable to deploy. A territory of 2.3 million square kilometres, a dispersed population, partial electrification, and public systems designed independently of one another: each of these factors raises the cost of access or prevents its use. The project is anchored in the regional APM IDEA approach, which pools digital integration across Eastern and Southern Africa — because international capacity and transit corridors are negotiated at regional, not national, scale.",
      ),
      ctxStats: [
        { v: "6,56", u: "kbit/s", t: t("Bande passante intl./hab. au démarrage", "Intl. bandwidth per capita at start") },
        { v: "26", u: "", t: t("provinces · 2,3 M km²", "provinces · 2.3M km²") },
        { v: "2029", u: "", t: t("horizon de la transformation", "horizon of the transformation") },
      ],
      engLabel: t("Engagements fondateurs", "Founding commitments"),
      engTitle: t("Deux partenaires, un même engagement.", "Two partners, one shared commitment."),
      eng: [
        { d: "25.11.2024", t: t("Signature de l'accord de financement avec la Banque mondiale (IDA).", "Financing agreement signed with the World Bank (IDA).") },
        { d: "14.03.2025", t: t("Signature de la convention de financement avec l'Agence Française de Développement.", "Financing convention signed with the French Development Agency.") },
      ],
      jalonsLabel: t("Calendrier & jalons", "Timeline & milestones"),
      changeLabel: t("Ce que ça change pour vous", "What it changes for you"),
      changeTitle: t(
        "Ce qui change vraiment tient souvent à une seule chose : ne plus avoir à se déplacer pour prouver ce que l'administration sait déjà.",
        "What really changes often comes down to one thing: no longer travelling to prove what the administration already knows.",
      ),
      changeLead: t(
        "Un projet d'infrastructure ne se juge pas à ce qu'il installe, mais à ce qu'il rend possible — et à ce qu'il cesse d'imposer. Voici, secteur par secteur, la contrainte d'aujourd'hui et le mécanisme précis qui la lève.",
        "An infrastructure project is judged not by what it installs, but by what it makes possible — and by what it stops imposing. Here, sector by sector, is today's constraint and the precise mechanism that lifts it.",
      ),
      whoLabel: t("Pour qui ?", "Who benefits"),
      whoTitle: t("À qui cela profite, et à quelle condition.", "Who benefits, and on what condition."),
      cfaqLabel: t("Le projet & vous", "The project & you"),
      cfaqTitle: t("Les questions qu'on nous pose, et nos réponses.", "The questions we are asked, and our answers."),
      ctaTitle: t("Prenez part à la transformation.", "Take part in the transformation."),
      ctaLead: t(
        "Candidater à un marché, suivre l'avancement province par province, ou signaler une difficulté : chacune de ces portes est ouverte et tracée.",
        "Bid for a contract, follow progress province by province, or report a difficulty: each of these doors is open and traceable.",
      ),
    },

    /* --- Composantes (index + pages dédiées) ------------------------------ */
    comp: {
      titre: t("Les composantes", "The components"),
      indexTitle: t("Cinq composantes, un seul projet.", "Five components, one project."),
      indexLead: t(
        "Cinq volets complémentaires : l'accès et l'inclusion, les fondations numériques de l'État, les compétences et l'innovation, l'exécution du projet et la réserve d'intervention. Chacun a sa page, ses projets phares et son responsable.",
        "Five complementary strands: access and inclusion, the State's digital foundations, skills and innovation, project delivery and the response reserve. Each has its own page, flagship projects and lead.",
      ),
      one: t("Composante", "Component"),
      rowsNote: t(
        "Cinq volets complémentaires : chacun a sa page, ses projets phares et son responsable.",
        "Five complementary strands: each has its own page, flagship projects and lead.",
      ),
      see: t("Voir la composante", "View the component"),
      seeAll: t("Découvrir les 5 composantes", "Explore the 5 components"),
      prev: t("Composante précédente", "Previous component"),
      next: t("Composante suivante", "Next component"),
      budget: t("Périmètre de la composante", "Component scope"),
      share: t("chantiers structurants", "structuring workstreams"),
      sousTitle: t("Sous-composantes", "Sub-components"),
      horizon: t("Horizon", "Horizon"),
      statutExec: t("En exécution", "Under implementation"),
      statutReserve: t("Réserve contingente", "Contingent reserve"),
      statut: t("Statut", "Status"),
      noSous: t("Composante conduite sans découpage en sous-composantes.", "Component run without a breakdown into sub-components."),
      noDotation: t("Mécanisme de réserve", "Reserve mechanism"),
      /* Sections */
      secProblematique: t("La problématique", "The problem"),
      pbAppui: t("Pourquoi une intervention publique", "Why public action"),
      pbLiens: t("Ce que cela suppose ailleurs", "What this requires elsewhere"),
      aProblematique: t("Problématique", "Problem"),
      secContexte: t("Contexte & périmètre", "Context & scope"),
      secObjectifs: t("Objectifs de la composante", "Component objectives"),
      secProjets: t("Projets phares", "Flagship projects"),
      secProjetsLead: t(
        "Les chantiers structurants portés par la composante.",
        "The structuring workstreams carried by the component.",
      ),
      secEcosysteme: t("Vue d'ensemble", "The bigger picture"),
      secFinalite: t("Finalité", "Purpose"),
      secResponsable: t("Responsable de la composante", "Component lead"),
      secLies: t("Rattachés à cette composante", "Attached to this component"),
      secIndicateurs: t("Indicateurs rattachés", "Attached indicators"),
      /* Libellés courts — barre d'ancres collante (place contrainte) */
      aContexte: t("Contexte", "Context"),
      aVideo: t("Vidéo", "Video"),
      aObjectifs: t("Objectifs", "Objectives"),
      aProjets: t("Projets phares", "Flagship projects"),
      aEcosysteme: t("Vue d'ensemble", "Bigger picture"),
      aFinalite: t("Finalité", "Purpose"),
      aResponsable: t("Responsable", "Lead"),
      /* Vidéo */
      videoLabel: t("Vidéo de présentation", "Presentation video"),
      videoPlay: t("Regarder la présentation", "Watch the presentation"),
      videoSoon: t("Vidéo de présentation — à venir", "Presentation video — coming soon"),
      videoSoonNote: t(
        "Cet emplacement est prévu pour le film de présentation de la composante. Format 16:9, sous-titres FR/EN.",
        "This slot is reserved for the component's presentation film. 16:9 format, FR/EN subtitles.",
      ),
      /* Responsable */
      respRole: t("Fonction", "Role"),
      respPerimetre: t("Périmètre", "Scope"),
      respContact: t("Contacter la composante", "Contact the component"),
      respSoon: t("Nomination en cours de publication.", "Appointment to be published."),
      /* Blocs liés */
      liesActus: t("Actualités de la composante", "Component news"),
      liesMarches: t("Marchés en cours", "Live tenders"),
      liesRessources: t("Rapports & publications", "Reports & publications"),
      liesActusVide: t("Aucune actualité rattachée pour l'instant.", "No news attached yet."),
      liesMarchesVide: t("Aucun avis en cours pour cette composante.", "No live notice for this component."),
      /* Divers */
      projets: t("projets phares", "flagship projects"),
      objectifsCount: t("objectifs", "objectives"),
      sommaire: t("Sommaire", "Contents"),
      toValidate: t(
        "Contenu éditorial en cours de validation par l'Unité.",
        "Editorial content pending validation by the Unit.",
      ),
    },

    /* --- L'UGPTN ---------------------------------------------------------- */
    ugptn: {
      titre: t("L'UGPTN", "The UGPTN"),
      lead: t(
        "Une unité d'exécution, pas une administration de plus. Elle prépare, passe les marchés, supervise et rend compte, dans un cadre où la décision appartient aux autorités de tutelle et où les prérogatives des cofinanceurs restent entières.",
        "A delivery unit, not another administration. It prepares, procures, supervises and accounts, within a framework where decisions belong to the supervising authorities and where co-financiers' prerogatives remain intact.",
      ),
      mandatLabel: t("Mandat", "Mandate"),
      mandatTitle: t("Quatre fonctions, exercées en continu et jamais séparément.", "Four functions, exercised continuously and never in isolation."),
      principesLabel: t("Principes directeurs", "Guiding principles"),
      principesTitle: t("Trois règles qui bornent ce que l'Unité peut décider.", "Three rules that bound what the Unit may decide."),
      polesLabel: t("Organisation interne", "Internal organisation"),
      polesTitle: t("21 sous-rôles, 5 pôles.", "21 sub-roles, 5 clusters."),
      arrete: t("Créée par arrêté ministériel", "Created by ministerial order"),
      objLabel: t("Objectif & rôle", "Objective & role"),
      objTitle: t("La capacité d'exécution est un actif. Elle se construit, elle ne se décrète pas.", "Delivery capacity is an asset. It is built, not decreed."),
      objLead: t(
        "Un financement international n'est utile qu'à proportion de ce qu'une équipe sait en faire : préparer des dossiers qui passent la revue du bailleur, mettre en concurrence sans contentieux, superviser des chantiers dispersés sur un territoire immense, et rendre compte de chaque étape. C'est ce métier-là que l'Unité exerce.",
        "International financing is only as useful as a team's ability to use it: preparing files that pass donor review, competing contracts without litigation, supervising sites scattered across a vast territory, and accounting for every step. That is the trade the Unit practises.",
      ),
      polesActLabel: t("Les pôles en action", "The clusters in action"),
      polesActTitle: t("Cinq pôles, et ce sur quoi chacun travaille en ce moment.", "Five clusters, and what each is working on right now."),
      polesActLead: t(
        "Un pôle se juge à ses livrables datés, pas à son organigramme. Chacun porte une responsabilité distincte, et un dossier en cours dont l'avancement est vérifiable.",
        "A cluster is judged by its dated deliverables, not by its org chart. Each carries a distinct responsibility, and a live file whose progress can be checked.",
      ),
      uniteBrefLabel: t("L'Unité en bref", "The Unit at a glance"),
      uniteBrefTitle: t("Une structure resserrée pour un grand mandat.", "A lean structure for a large mandate."),
      methodeLabel: t("Notre méthode", "How we work"),
      methodeTitle: t("Du financement aux résultats : un cycle, répété marché après marché.", "From financing to results: one cycle, repeated contract after contract."),
      methodeLead: t(
        "Le même enchaînement s'applique à un chantier de fibre, à une plateforme informatique ou à un programme de formation. C'est sa répétabilité qui permet de conduire des dizaines de marchés en parallèle sans improviser à chaque fois.",
        "The same sequence applies to a fibre worksite, an IT platform or a training programme. It is its repeatability that makes it possible to run dozens of contracts in parallel without improvising each time.",
      ),
      engLabel: t("Nos engagements", "Our commitments"),
      engTitle: t("Des engagements vérifiables, pas des intentions.", "Verifiable commitments, not intentions."),
      glossaireLabel: t("Comprendre les sigles", "Understanding the acronyms"),
      glossaireTitle: t("Les sigles que vous rencontrerez, et ce qu'ils recouvrent.", "The acronyms you will meet, and what they cover."),
      glossaireLead: t(
        "Le vocabulaire des projets financés par les bailleurs est technique par nécessité : chaque terme renvoie à une procédure précise. En voici la traduction.",
        "The vocabulary of donor-financed projects is technical out of necessity: each term refers to a precise procedure. Here is the translation.",
      ),
      faqLabel: t("À propos de l'Unité", "About the Unit"),
      faqTitle: t("Questions fréquentes.", "Frequently asked questions."),
    },

    /* --- Gouvernance ------------------------------------------------------ */
    gouv: {
      titre: t("Gouvernance", "Governance"),
      lead: t(
        "Trois niveaux, et une règle : celui qui oriente ne met pas en œuvre, et celui qui met en œuvre ne s'auto-évalue pas. Cette séparation est ce qui rend les décisions contrôlables.",
        "Three levels, and one rule: whoever sets direction does not implement, and whoever implements does not assess themselves. That separation is what makes decisions controllable.",
      ),
      copilComp: t("Composition — 8 membres", "Composition — 8 members"),
      ctpComp: t("Composition — 12 représentants", "Composition — 12 representatives"),
      copilDesc: t(
        "Comité de Pilotage — il fixe le cap, valide la programmation annuelle et tranche les arbitrages qui dépassent le mandat technique : priorités entre composantes, réallocations, conflits entre institutions bénéficiaires.",
        "Steering Committee — it sets the course, approves annual programming and settles the arbitrations that exceed the technical mandate: priorities between components, reallocations, disputes between beneficiary institutions.",
      ),
      ctpDesc: t(
        "Comité Technique du Projet — il instruit les dossiers avant qu'ils ne remontent : c'est là que les objections techniques des institutions concernées doivent être levées, pour que le Comité de Pilotage décide sur une base assainie.",
        "Project Technical Committee — it prepares files before they move up: this is where the technical objections of the institutions concerned must be resolved, so that the Steering Committee decides on a clean basis.",
      ),
      copilMembers: ["MPTN — Président", "Présidence / ADN", "Primature", "Min. Finances", "MIS", "MESU", "MEPME", "+1 désigné"],
      ctpMembers: ["MPTN (préside) +3", "ARPTC", "FDSU", "MIS ×2", "ONIP", "MESU", "MEPME", "MINFIN-CSPP", "ADN", "SOCOF", "Primature"],
      actLabel: t("La coordination en action", "Coordination in action"),
      actTitle: t("Ce que la gouvernance a effectivement décidé.", "What governance has actually decided."),
      actLead: t(
        "Une gouvernance ne se juge pas à sa composition mais à ses décisions et à leur date. Voici la trace de celles qui engagent l'exécution.",
        "Governance is judged not by its composition but by its decisions and their dates. Here is the record of those that commit delivery.",
      ),
      leadsLabel: t("L'équipe de coordination", "The coordination team"),
      leadsTitle: t("Qui répond de quoi.", "Who answers for what."),
      leadsLead: t(
        "Dans un projet à plusieurs bailleurs et plusieurs ministères, l'ambiguïté sur la responsabilité coûte des mois. Chaque rôle ci-dessous porte un périmètre défini et répond de ses livrables devant la coordination.",
        "In a project with several donors and several ministries, ambiguity about responsibility costs months. Each role below carries a defined scope and answers for its deliverables to the coordination.",
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
        "Une question sur un marché, une difficulté sur un chantier, une demande institutionnelle : chaque objet a son canal, et le bon canal est celui qui laisse une trace. Les points focaux provinciaux permettent de saisir l'Unité sans passer par Kinshasa.",
        "A question about a contract, a difficulty on a worksite, an institutional request: each matter has its channel, and the right channel is the one that leaves a record. Provincial focal points make it possible to reach the Unit without going through Kinshasa.",
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
      slaText: t("Objectif : traiter chaque grief dans un délai de 30 jours.", "Objective: handle every grievance within 30 days."),
      generalTitle: t("Canal général MGP", "General GRM channel"),
      generalDesc: t(
        "Réception → Classification → Instruction → Décision → Clôture. Le classement détermine qui instruit : une plainte technique, fiduciaire ou sociale ne suit pas le même circuit. Numéro de référence horodaté, retour au plaignant à chaque étape clé.",
        "Receipt → Classification → Investigation → Decision → Closure. Classification determines who investigates: a technical, fiduciary or social grievance does not follow the same route. Timestamped reference number, feedback to the complainant at each key stage.",
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
      heroTitle: t("Tout ce qu'il faut pour décider si vous candidatez.", "Everything you need to decide whether to bid."),
      heroLead: t(
        "Chaque avis indique la méthode de passation retenue, le calendrier prévisionnel, les pièces exigées et la date limite. Les Règlements de Passation de la Banque mondiale (2025) s'appliquent : les critères d'évaluation sont annoncés à l'avance et ne changent pas en cours de procédure, et le résultat est publié. Une entreprise doit pouvoir estimer son effort de réponse avant de l'engager.",
        "Each notice states the procurement method used, the indicative schedule, the documents required and the deadline. The World Bank Procurement Regulations (2025) apply: evaluation criteria are announced in advance, do not change mid-process, and the outcome is published. A company must be able to gauge the effort of responding before committing to it.",
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
      filtersAll: t("Tous", "All"),
      filterOpen: t("Ouverts", "Open"),
      bidderKicker: t("Candidature", "Bidding"),
      bidderTitle: t("Candidater : ce que cela suppose", "Bidding: what it involves"),
      bidderLead: t(
        "Le dossier complet s'obtient auprès de la cellule passation, qui enregistre votre manifestation d'intérêt : c'est cet enregistrement qui déclenche la notification des addenda. Le dépôt est horodaté — et c'est cet horodatage qui fait foi en cas de contestation sur la recevabilité.",
        "The full file is obtained from the procurement unit, which records your expression of interest: that record is what triggers notification of addenda. Submission is timestamped — and that timestamp is what counts if admissibility is disputed.",
      ),
      bidderCta: t("Nous contacter", "Contact us"),
    },

    /* --- Transparence documentaire --------------------------------------- */
    docs: {
      heroTitle: t("Ce que nous publions, et pourquoi certaines pièces ne le sont pas.", "What we publish, and why some documents are not published."),
      heroLead: t(
        "Le dépôt officiel des documents divulgables du Projet, en application de la norme environnementale et sociale n°10 et de la politique d'accès à l'information de la Banque mondiale. Le versionnage est explicite : une version remplacée reste identifiable. Ne sont pas publiés les documents contenant des données personnelles, des informations commercialement sensibles avant attribution, ou des éléments couverts par une obligation de confidentialité.",
        "The official repository of the Project's disclosable documents, under Environmental and Social Standard 10 and the World Bank's access-to-information policy. Versioning is explicit: a superseded version remains identifiable. Not published are documents containing personal data, commercially sensitive information ahead of award, or material covered by a confidentiality obligation.",
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
      heroTitle: t("Décisions, jalons et communiqués.", "Decisions, milestones and releases."),
      heroLead: t(
        "L'avancement du Projet, au plus près : décisions, jalons et communiqués officiels, publiés au fur et à mesure de leur adoption.",
        "The Project's progress, up close: decisions, milestones and official releases, published as they are adopted.",
      ),
      readArticle: t("Lire l'article", "Read the article"),
      allFilter: t("Tout", "All"),
      timeline: t("Fil chronologique", "Timeline"),
      timelineLead: t(
        "Les publications à leur date, de la plus récente à la plus ancienne. La mise en avant ne joue pas ici : l'ordre est celui du calendrier.",
        "Each release at its date, most recent first. Featured articles are not promoted here: the order is that of the calendar.",
      ),
      relatedVideo: t("Voir la vidéo associée", "Watch the related video"),
      allNews: t("Toutes les actualités", "All news"),

      /* --- Liste : filtres, recherche, pagination -------------------------- */
      aLaUne: t("À la une", "Featured"),
      filtresLabel: t("Filtrer par catégorie", "Filter by category"),
      rechercher: t("Rechercher dans les actualités…", "Search the news…"),
      rechercherAction: t("Rechercher", "Search"),
      filtreEtiquette: t("Articles portant l'étiquette", "Articles tagged"),
      retirerFiltre: t("Retirer le filtre", "Clear the filter"),
      aucunArticle: t(
        "Aucun communiqué n'est publié pour le moment. Les décisions et jalons du Projet paraissent ici au fur et à mesure de leur adoption.",
        "No release has been published yet. The Project's decisions and milestones appear here as they are adopted.",
      ),
      aucunResultat: t(
        "Aucun article ne correspond à cette recherche.",
        "No article matches this search.",
      ),
      paginationLabel: t("Pages d'actualités", "News pages"),
      page: t("Page", "Page"),
      precedent: t("Précédent", "Previous"),
      suivant: t("Suivant", "Next"),

      /* --- Page d'article --------------------------------------------------- */
      filArianeLabel: t("Fil d'Ariane", "Breadcrumb"),
      navigationLabel: t("Article précédent et suivant", "Previous and next article"),
      par: t("Par", "By"),
      minutes: t("min de lecture", "min read"),
      etiquettes: t("Étiquettes", "Tags"),
      partager: t("Partager", "Share"),
      copierLien: t("Copier le lien", "Copy link"),
      lienCopie: t("Lien copié", "Link copied"),
      aLire: t("À lire également", "Also worth reading"),

      /* Traduction manquante : la mention nomme la langue réellement servie,
         plutôt que de laisser croire à un texte rédigé dans celle du site. */
      traductionAbsente: (servie: Lang) =>
        t(
          `Cet article n'est pour l'instant disponible qu'en ${servie === "en" ? "anglais" : "français"}.`,
          `This article is currently available in ${servie === "en" ? "English" : "French"} only.`,
        ),
      lireDansLaLangue: (servie: Lang) =>
        t(
          `Lire la version ${servie === "en" ? "anglaise" : "française"}`,
          `Read the ${servie === "en" ? "English" : "French"} version`,
        ),

      /* --- Prévisualisation ------------------------------------------------- */
      apercuTitre: t("Aperçu.", "Preview."),
      apercuTexte: t(
        "Cette page n'est pas publiée : elle n'est visible que depuis ce lien, et n'est pas indexée.",
        "This page is not published: it is visible from this link only, and is not indexed.",
      ),
    },

    /* --- Résultats -------------------------------------------------------- */
    resultats: {
      heroTitle: t("Ce que nous mesurons, comment, et ce que la mesure ne dit pas.", "What we measure, how, and what measurement does not say."),
      heroLead: t(
        "Un cadre de résultats distingue deux ordres de grandeur qu'il ne faut pas confondre. Les indicateurs d'objectif mesurent l'effet recherché sur la société — des personnes connectées, des services utilisés — et bougent lentement. Les indicateurs intermédiaires mesurent ce que le projet livre — des kilomètres, des sites, des inscrits — et répondent plus vite. Les seconds ne garantissent pas les premiers : c'est précisément pourquoi les deux sont suivis, province par province, et pourquoi ces ambitions sont revues au fil de l'exécution.",
        "A results framework distinguishes two orders of magnitude that should not be confused. Objective indicators measure the intended effect on society — people connected, services used — and move slowly. Intermediate indicators measure what the project delivers — kilometres, sites, enrolments — and respond faster. The latter do not guarantee the former: that is precisely why both are tracked, province by province, and why these ambitions are reviewed as implementation proceeds.",
      ),
      odpLabel: t("ODP · ambitions à l'horizon 2029", "PDO · ambitions towards 2029"),
      interLabel: t("Indicateurs intermédiaires — ce que le projet livre", "Intermediate indicators — what the project delivers"),
      projVideosLabel: t("Le projet en vidéos", "The project in videos"),
      projVideosTitle: t("Chaque composante, racontée en images.", "Each component, told in pictures."),
      projVideosLead: t(
        "Un film par composante, présenté par son responsable : le périmètre, les chantiers en cours et ce que l'on attend d'eux.",
        "One film per component, presented by its lead: the scope, the workstreams under way and what is expected of them.",
      ),
      dialoguesLabel: t("Dialogues sectoriels", "Sector dialogues"),
      dialoguesTitle: t("Le numérique n'est utile qu'appliqué à un métier.", "Digital is only useful when applied to a trade."),
      dialoguesLead: t(
        "Une infrastructure ne produit d'effet qu'à travers les politiques sectorielles qui s'en saisissent. Ces dialogues servent à identifier, avec chaque ministère et chaque profession, l'usage précis qui justifie l'investissement.",
        "Infrastructure only produces effects through the sector policies that take hold of it. These dialogues serve to identify, with each ministry and each profession, the precise use that justifies the investment.",
      ),
    },

    /* --- Ressources ------------------------------------------------------- */
    ressources: {
      titre: t("Rapports & publications", "Reports & publications"),
      hero: t("La production analytique qui précède les décisions.", "The analytical work that precedes decisions."),
      lead: t(
        "Avant d'arbitrer un tracé, de calibrer un programme de formation ou de retenir une architecture, il faut avoir instruit la question. Ces notes, rapports et analyses sont les pièces sur lesquelles les décisions du Projet s'appuient — publiées pour être discutées.",
        "Before choosing a route, calibrating a training programme or settling on an architecture, the question has to be worked through. These notes, reports and analyses are the material on which the Project's decisions rest — published so they can be debated.",
      ),
      download: t("Télécharger", "Download"),
    },

    /* --- MGP -------------------------------------------------------------- */
    mgp: {
      heroTitle: t("Signaler une difficulté ne vous expose à rien.", "Reporting a difficulty exposes you to nothing."),
      heroLead: t(
        "Le dépôt est gratuit, possible en plusieurs langues, et peut rester anonyme. Vous recevez un numéro de référence qui permet de suivre l'instruction sans avoir à vous déplacer. Aucune représaille n'est tolérée, et un canal strictement séparé traite les cas de violences basées sur le genre. L'Unité vise un traitement dans un délai de 30 jours.",
        "Filing is free, available in several languages, and may remain anonymous. You receive a reference number that lets you follow the case without travelling. No retaliation is tolerated, and a strictly separate channel handles gender-based violence cases. The Unit aims to handle cases within 30 days.",
      ),
      slaBadge: t("Objectif 30 jours · 6 langues · numéro vert 24/7", "30-day objective · 6 languages · 24/7 toll-free"),
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
      contactStep: t("Qui êtes-vous, et comment vous recontacter ?", "Who are you, and how can we reach you?"),
      contactNote: t(
        "Tous ces champs sont facultatifs. Laissez le nom vide pour déposer anonymement : la plainte reste recevable, mais nous ne pourrons ni demander une précision ni vous transmettre la décision.",
        "All these fields are optional. Leave the name blank to file anonymously: the grievance remains admissible, but we will be unable to ask for clarification or send you the decision.",
      ),
      fullName: t("Nom complet", "Full name"),
      fullNameHint: t(
        "Laissez vide pour rester anonyme.",
        "Leave blank to remain anonymous.",
      ),
      anonymousBadge: t(
        "Aucun nom saisi : votre plainte sera enregistrée comme anonyme.",
        "No name entered: your grievance will be registered as anonymous.",
      ),
      namedBadge: t("Votre plainte sera enregistrée à votre nom.", "Your grievance will be registered in your name."),
      email: t("E-mail", "Email"),
      phone: t("Téléphone", "Phone"),
      province: t("Province", "Province"),
      reviewSubmit: t("Vérifiez et envoyez", "Review and submit"),
      category: t("Catégorie", "Category"),
      description: t("Description", "Description"),
      attachments: t("Pièces jointes", "Attachments"),
      anonymous: t("Anonyme", "Anonymous"),
      identity: t("Identité", "Identity"),
      contact: t("Contact", "Contact"),
      notProvided: t("Non renseigné", "Not provided"),
      prev: t("Précédent", "Back"),
      next: t("Suivant", "Next"),
      submitGrievance: t("Envoyer ma plainte", "Submit my grievance"),
      submitting: t("Enregistrement…", "Registering…"),
      submittedTitle: t("Plainte enregistrée", "Grievance registered"),
      refIntro: t("Votre numéro de référence horodaté :", "Your timestamped reference number:"),
      refKeep: t(
        "Conservez-le : c'est le seul justificatif de votre dépôt, et il donne accès au suivi de votre dossier. Il ne contient aucune information sur vous. Un retour vous est adressé à la clôture, dans un délai visé de 30 jours.",
        "Keep it: it is the only proof of your submission, and it opens access to your case tracking. It contains no information about you. Feedback is provided at closure, within a target of 30 days.",
      ),
      refCopy: t("Copier le numéro", "Copy the number"),
      refCopied: t("Numéro copié", "Number copied"),
      refTrackCta: t("Suivre mon dossier", "Track my case"),
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
      tracking: t("Recherche…", "Searching…"),
      trackErr: t("Veuillez saisir un numéro de référence.", "Please enter a reference number."),
      daysRemaining: t("j restants", "days left"),
      overdue: t("j de dépassement", "days overdue"),
      pipelineTitle: t("Pipeline de traitement", "Processing pipeline"),

      /* --- Page dédiée de suivi ------------------------------------------- */
      trackPageTitle: t("Suivre une plainte", "Track a grievance"),
      trackPageHeroTitle: t(
        "Où en est votre dossier, sans avoir à le demander.",
        "Where your case stands, without having to ask.",
      ),
      trackPageLead: t(
        "Votre numéro de référence ouvre l'état d'avancement de votre plainte : statut, étape de traitement, délai restant et messages que l'Unité vous adresse. Aucune donnée personnelle n'y figure, et aucun compte n'est nécessaire.",
        "Your reference number opens the progress of your grievance: status, processing stage, time remaining and messages the Unit sends you. No personal data appears there, and no account is needed.",
      ),
      trackPageMeta: t(
        "Suivez l'avancement d'une plainte déposée auprès du mécanisme de gestion des plaintes de l'UGPTN à l'aide de votre numéro de référence.",
        "Follow the progress of a grievance filed with the UGPTN grievance mechanism using your reference number.",
      ),
      trackStatus: t("Statut du dossier", "Case status"),
      trackStage: t("Étape en cours", "Current stage"),
      trackSubmitted: t("Déposée le", "Filed on"),
      trackDeadline: t("Échéance de traitement", "Processing deadline"),
      trackClosed: t("Clôturée le", "Closed on"),
      trackNextStep: t("Prochaine étape", "Next step"),
      trackUpdates: t("Messages de l'Unité", "Messages from the Unit"),
      trackNoUpdates: t(
        "Aucun message ne vous a encore été adressé. Cette page est mise à jour à chaque décision portée à votre connaissance.",
        "No message has been sent to you yet. This page is updated whenever a decision is brought to your attention.",
      ),
      trackAnonymous: t("Dépôt anonyme", "Anonymous submission"),
      trackNamed: t("Dépôt nominatif", "Named submission"),
      trackPrivacy: t(
        "Ce suivi n'affiche ni votre récit, ni vos coordonnées, ni les notes des agents : ces éléments restent au dossier, dont l'accès est limité aux agents habilités et journalisé. Un numéro de référence perdu ne peut pas être retrouvé, précisément parce qu'il faudrait vous identifier pour le faire : conservez-en une copie, ou déposez à nouveau en citant les mêmes faits.",
        "This tracker shows neither your account of the facts, nor your contact details, nor officers' notes: those remain in the case file, access to which is limited to authorised officers and logged. A lost reference number cannot be recovered, precisely because retrieving it would mean identifying you: keep a copy, or file again citing the same facts.",
      ),
      trackFileCta: t("Déposer une nouvelle plainte", "File a new grievance"),
      refKeepTitle: t("Votre numéro de référence", "Your reference number"),
      trackSlaNote: t(
        "L'Unité vise un traitement dans un délai de {days} jours à compter du dépôt. Ce délai apparaît sur votre suivi sous forme d'échéance ; son dépassement ne ferme pas le dossier et n'éteint aucun de vos droits.",
        "The Unit aims to handle cases within {days} days of filing. That deadline appears on your tracker; exceeding it neither closes the case nor extinguishes any of your rights.",
      ),
      modes: [
        { n: "01", t: t("Formulaire web", "Web form"), d: t("Catégorisé, horodaté, accusé immédiat.", "Categorised, timestamped, immediate acknowledgement.") },
        { n: "02", t: t("SMS / numéro vert", "SMS / toll-free"), d: t("Gratuit, accessible sur tout mobile.", "Free, accessible on any mobile.") },
        { n: "03", t: "E-mail", d: t("Saisine écrite avec numéro de référence.", "Written referral with reference number.") },
        { n: "04", t: t("Point focal", "Focal point"), d: t("Annuaire provincial · 26 provinces.", "Provincial directory · 26 provinces.") },
      ],
      generalTitle: t("Canal général MGP", "General GRM channel"),
      generalDesc: t(
        "Réception → Classification → Instruction → Décision → Clôture. Numéro de référence horodaté, retour au plaignant à chaque étape clé.",
        "Receipt → Classification → Investigation → Decision → Closure. Timestamped reference number, feedback to the complainant at each key stage.",
      ),
      easTitle: t("Canal confidentiel MGP-EAS/HS", "Confidential GBV/SEA-SH channel"),
      easSub: t(
        "Violences basées sur le genre · exploitation et abus sexuels · harcèlement",
        "Gender-based violence · sexual exploitation and abuse · harassment",
      ),
      easBody: t(
        "Ce canal ne suit pas la procédure ordinaire, et c'est délibéré. La survivante décide de ce qui est partagé et avec qui : rien n'est transmis sans son consentement éclairé, l'identité est facultative, et aucune donnée n'apparaît dans les statistiques ni ailleurs sur ce site. La priorité n'est pas l'instruction du dossier mais l'orientation vers les services — médical, psychosocial, juridique — sous 24 heures. Aucun export, aucune copie.",
        "This channel does not follow the ordinary procedure, and that is deliberate. The survivor decides what is shared and with whom: nothing is passed on without their informed consent, identity is optional, and no data appears in statistics or anywhere else on this site. The priority is not case investigation but referral to services — medical, psychosocial, legal — within 24 hours. No export, no copy.",
      ),
      easCta: t("Accéder au canal confidentiel", "Access the confidential channel"),
      faqLabel: "FAQ · MGP",
      faqTitle: t("Questions fréquentes.", "Frequently asked questions."),
      faqLead: t(
        "Les questions que se posent le plus souvent les personnes qui hésitent à saisir le mécanisme.",
        "The questions most often asked by people hesitating to use the mechanism.",
      ),
    },

    /* --- Frontière d'erreur du site public --------------------------------- */
    erreur: {
      titre: t("Cette page n'a pas pu être affichée", "This page could not be displayed"),
      corps: t(
        "Une donnée nécessaire à cette page n'a pas pu être lue. Rien n'est perdu : seul l'affichage a échoué. Réessayez dans un instant.",
        "Data required by this page could not be read. Nothing is lost: only the display failed. Please try again in a moment.",
      ),
      reessayer: t("Réessayer", "Try again"),
      accueil: t("Retour à l'accueil", "Back to home"),
      reference: t("Référence", "Reference"),
    },
  };
}

export type Dict = ReturnType<typeof dict>;
