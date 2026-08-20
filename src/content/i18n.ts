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
      evenements: t("Événements", "Events"),
      galerie: t("Vidéos & galeries", "Videos & galleries"),
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
        "Rapports, études et pièces de référence, versionnés et datés.",
        "Reports, studies and reference material, versioned and dated.",
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
      galerie: t(
        "Photographies et films des chantiers, des ateliers et des territoires.",
        "Photographs and films of works, workshops and territories.",
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
      /* Nom de la plateforme de passation et d'approvisionnement du projet,
         hébergée hors de notre périmètre avec ses propres comptes
         (cf. lib/external.ts). C'est un nom propre : il ne se traduit pas et ne
         se remplace pas par « Se connecter », qui ne disait pas où l'on entre.
         Aucun lien du site public ne mène à la console d'administration de
         l'UGPTN, qui est un tout autre espace. */
      login: t("DigiProcure", "DigiProcure"),
      /* Sorties de page ajoutées avec le partage du propos : chaque page qui
         montre un aperçu doit dire où se trouve le détail. */
      resultats: t("Voir le cadre de résultats", "See the results framework"),
      toutEquipe: t("Toute l'équipe", "The whole team"),
      voirUnite: t("Voir l'Unité", "See the Unit"),
      /* Le nom seul n'apprend rien à qui ne connaît pas la plateforme : cette
         phrase porte l'infobulle ET le libellé lu par les lecteurs d'écran. */
      loginHint: t(
        "DigiProcure, la plateforme de passation des marchés et des approvisionnements du projet. Ouverture dans un nouvel onglet.",
        "DigiProcure, the project's procurement and supply management platform. Opens in a new tab.",
      ),
      /* Légende du tiroir mobile : là, pas de survol, donc pas d'infobulle.
         Tenue courte pour ne pas casser l'équilibre du pied de tiroir. */
      loginNote: t(
        "Marchés et approvisionnements du projet",
        "Project procurement and supply",
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
      /* Repère de navigation du fil d'Ariane, lu par les lecteurs d'écran. */
      ariane: t("Fil d'Ariane", "Breadcrumb"),
      /* Mention affichée sous tout bloc d'indicateurs prospectifs. */
      indicatif: t(
        "Ordres de grandeur issus du cadre de résultats du projet. Ces ambitions orientent l'exécution ; elles sont revues périodiquement avec les partenaires et ne constituent pas un engagement de résultat.",
        "Orders of magnitude drawn from the project's results framework. These ambitions guide implementation; they are reviewed periodically with partners and do not constitute a guarantee of results.",
      ),
    },
    foot: {
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
        "Une équipe d'exécution organisée en cinq pôles, du pilotage national à la liaison avec les provinces.",
        "A delivery team organised into five clusters, from national steering to provincial liaison.",
      ),
      /* La liste nominative des cinq pôles a quitté ce chapeau : elle est
         affichée juste en dessous par la grille, et la page « L'UGPTN » la
         détaille pôle par pôle. */
      composantesTitle: t(
        "Ce que le projet construit, en cinq volets.",
        "What the project builds, in five strands.",
      ),
      composantesNote: t(
        "Chaque volet a sa page : périmètre, objectifs, projets phares et responsable.",
        "Each strand has its own page: scope, objectives, flagship projects and lead.",
      ),
      gouvLead: t(
        "Trois niveaux, et une règle : celui qui oriente ne met pas en œuvre. Qui préside, à quelle majorité et à quelle fréquence, se lit sur la page dédiée.",
        "Three levels, and one rule: whoever sets direction does not implement. Who chairs, by what majority and how often, is set out on the dedicated page.",
      ),
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
      /* Le sujet de la lettre est ce que le projet DÉPLACE, non ce qu'il fait.
         Un abonné n'ouvre pas une lettre d'unité de gestion pour l'unité de
         gestion : il l'ouvre pour savoir si son bureau d'état civil, son centre
         de santé ou sa démarche du mois prochain vont changer. Le sommaire du
         message de bienvenue tient le même cap (cf. lib/email/templates/newsletter.ts). */
      lead: t(
        "Ce qui change pour les usagers : institutions raccordées, démarches qui cessent d'exiger un déplacement, compétences formées. Et ce qui bloque, quand ça bloque.",
        "What changes for users: institutions connected, procedures that no longer require a journey, skills trained. And what is holding, when it is.",
      ),
      placeholder: t("votre@email.cd", "your@email.cd"),
      btn: t("S'inscrire", "Subscribe"),
      submitting: t("Enregistrement…", "Saving…"),
      privacy: t(
        "Pas de spam. Désinscription en un clic.",
        "No spam. One-click unsubscribe.",
      ),

      /* Retours d'inscription, par code renvoyé par `subscribeNewsletter`.
         « Déjà inscrite » et « nouvellement inscrite » partagent le même
         message : les distinguer ferait du formulaire un moyen de vérifier
         qu'une personne figure dans la liste. */
      doneTitle: t("Inscription confirmée", "You're subscribed"),
      doneText: t(
        "Vous recevrez la prochaine édition à cette adresse.",
        "You will receive the next edition at this address.",
      ),
      confirmTitle: t("Vérifiez votre boîte mail", "Check your inbox"),
      confirmText: t(
        "Cette adresse avait été désabonnée. Un message vient d'y être envoyé : ouvrez-le et confirmez pour revenir sur la liste.",
        "This address had been unsubscribed. A message has just been sent to it: open it and confirm to rejoin the list.",
      ),

      erreurs: {
        invalid: t(
          "Cette adresse ne semble pas valide. Vérifiez la saisie.",
          "This address does not look valid. Check your entry.",
        ),
        rate: t(
          "Trop de tentatives depuis cette connexion. Réessayez dans quelques minutes.",
          "Too many attempts from this connection. Try again in a few minutes.",
        ),
        robot: t(
          "L'envoi a été refusé. Rechargez la page et saisissez votre adresse à nouveau.",
          "The submission was rejected. Reload the page and enter your address again.",
        ),
        mail: t(
          "L'envoi du message de confirmation a échoué. Réessayez plus tard ou écrivez-nous depuis la page Contact.",
          "The confirmation message could not be sent. Try again later or write to us from the Contact page.",
        ),
        server: t(
          "L'enregistrement a échoué. Réessayez dans un instant.",
          "Registration failed. Try again shortly.",
        ),
      },
    },

    /* --- Newsletter : pages de gestion d'abonnement -----------------------
       Pages de service, atteintes depuis le lien d'un e-mail. Elles ne sont ni
       dans la navigation ni dans le sitemap. */
    nlp: {
      crumb: t("Lettre d'information", "Newsletter"),

      /* Désabonnement par jeton */
      unsubTitle: t("Se désabonner", "Unsubscribe"),
      unsubLead: t(
        "Cette page retire votre adresse de la liste de diffusion de la lettre d'information de l'UGPTN. Aucune autre donnée n'est concernée.",
        "This page removes your address from the mailing list of the UGPTN newsletter. No other data is affected.",
      ),
      unsubFor: t("Adresse concernée", "Address concerned"),
      unsubBtn: t("Confirmer le désabonnement", "Confirm unsubscribe"),
      unsubPending: t("Traitement…", "Processing…"),
      unsubDoneTitle: t("Désabonnement enregistré", "Unsubscribe recorded"),
      unsubDoneText: t(
        "Cette adresse ne recevra plus la lettre d'information. Vous pouvez vous réinscrire à tout moment depuis le formulaire du site.",
        "This address will no longer receive the newsletter. You can subscribe again at any time from the form on the site.",
      ),
      unsubAlreadyTitle: t("Adresse déjà désabonnée", "Address already unsubscribed"),
      unsubAlreadyText: t(
        "Aucun envoi ne part vers cette adresse. Il n'y a rien d'autre à faire.",
        "Nothing is sent to this address. There is nothing further to do.",
      ),

      /* Confirmation de réinscription */
      confirmTitle: t("Confirmer votre inscription", "Confirm your subscription"),
      confirmLead: t(
        "Cette adresse avait été désabonnée. Elle ne revient sur la liste que par cette confirmation.",
        "This address had been unsubscribed. It only returns to the list through this confirmation.",
      ),
      confirmBtn: t("Confirmer mon inscription", "Confirm my subscription"),
      confirmDoneTitle: t("Inscription rétablie", "Subscription restored"),
      confirmDoneText: t(
        "Cette adresse figure de nouveau sur la liste. Vous recevrez la prochaine édition.",
        "This address is back on the list. You will receive the next edition.",
      ),
      confirmAlreadyTitle: t("Adresse déjà inscrite", "Address already subscribed"),
      confirmAlreadyText: t(
        "Rien à confirmer : cette adresse est active sur la liste.",
        "Nothing to confirm: this address is active on the list.",
      ),

      /* Erreurs communes aux deux pages */
      invalidTitle: t("Lien inutilisable", "Link cannot be used"),
      invalidText: t(
        "Ce lien est incomplet ou ne correspond à aucune inscription. Ouvrez-le directement depuis l'e-mail reçu, sans le recopier partiellement.",
        "This link is incomplete or matches no subscription. Open it directly from the email you received, without copying it partially.",
      ),
      serverTitle: t("Opération impossible", "Operation failed"),
      serverText: t(
        "Le service est momentanément indisponible. Réessayez dans un instant.",
        "The service is temporarily unavailable. Try again shortly.",
      ),

      /* Demande de lien, quand l'e-mail d'origine a été perdu */
      askTitle: t("Recevoir le lien de désabonnement", "Get the unsubscribe link"),
      askLead: t(
        "Saisissez l'adresse inscrite. Si elle figure sur la liste, le lien de désabonnement lui est envoyé.",
        "Enter the subscribed address. If it is on the list, the unsubscribe link is sent to it.",
      ),
      askBtn: t("Envoyer le lien", "Send the link"),
      askPending: t("Envoi…", "Sending…"),
      askDoneTitle: t("Demande prise en compte", "Request received"),
      askDoneText: t(
        "Si cette adresse figure sur la liste, elle vient de recevoir le lien de désabonnement. Vérifiez également les indésirables.",
        "If this address is on the list, it has just received the unsubscribe link. Check your spam folder as well.",
      ),

      back: t("Retour à l'accueil", "Back to home"),
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
      email: t("Adresse électronique", "Email address"),
      orgOptional: t("Organisation (optionnel)", "Organisation (optional)"),
      phoneOptional: t("Téléphone (optionnel)", "Phone (optional)"),
      messageOptional: t("Message (optionnel)", "Message (optional)"),
      messagePlaceholder: t(
        "Une question, un besoin d'accessibilité, une précision à signaler.",
        "A question, an accessibility need, anything we should know.",
      ),
      regSending: t("Envoi…", "Sending…"),
      fermer: t("Fermer", "Close"),
      /* Mention de collecte : le formulaire recueille une identité et des
         coordonnées sans compte. Le dire au moment de la saisie, et non dans
         une politique qu'il faudrait aller chercher. */
      regPrivacy: t(
        "Ces informations servent uniquement à organiser votre participation et ne sont transmises à personne d'autre.",
        "This information is used solely to organise your attendance and is not shared with anyone else.",
      ),

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
      /* `titre` sert la navigation et l'onglet ; `h1` porte le propos de la
         page. Un H1 qui répète l'intitulé du menu n'apprend rien au lecteur, et
         ne dit rien de plus à un moteur de recherche. */
      titre: t("Le Projet", "The Project"),
      h1: t(
        "Trois chantiers menés ensemble, parce qu'aucun ne produit d'effet seul.",
        "Three efforts pursued together, because none produces an effect alone.",
      ),
      metaDesc: t(
        "Pourquoi le Projet de Transformation Numérique de la RDC existe, à qui il profite, ce qu'il change et selon quel calendrier jusqu'en 2029.",
        "Why the DRC Digital Transformation Project exists, who it benefits, what it changes and on what schedule to 2029.",
      ),
      lead: t(
        "Trois chantiers menés ensemble parce qu'aucun ne produit d'effet seul : élargir l'accès au réseau, doter l'État d'un socle numérique commun, et former les compétences qui feront vivre l'un et l'autre. Horizon 2029.",
        "Three efforts pursued together because none works alone: widening access to the network, giving the State a common digital foundation, and building the skills that will keep both running. Horizon 2029.",
      ),
      /* ⚠️ Les en-têtes des blocs de la page — contexte, publics visés, aperçus
         des composantes et des résultats, questions citoyennes — ne sont plus
         ici : ils sont administrés depuis la console, et leur état initial vit
         dans `src/content/impact/projet.ts`.

         La section « Engagements fondateurs » avait déjà disparu pour une raison
         voisine : les deux dates de signature qu'elle affichait en dur figurent
         dans la frise des jalons, huit cents pixels plus bas sur la même page.
         Une date publiée à deux endroits finit par diverger. */
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
      metaDesc: t(
        "Les cinq composantes du projet : périmètre, objectifs, projets phares, responsable, et ce que chacune attend des autres.",
        "The project's five components: scope, objectives, flagship projects, lead, and what each needs from the others.",
      ),
      /* `rowsNote` a été retirée : elle paraphrasait `indexLead` sur la même
         page, en dessous des mêmes cinq cartes. */
      liensLabel: t("Lecture transversale", "Cross-cutting reading"),
      liensTitle: t(
        "Aucune composante ne produit son effet seule.",
        "No component produces its effect on its own.",
      ),
      liensLead: t(
        "Les renvois ci-dessous ne sont pas de courtoisie : ils disent ce qu'une composante attend d'une autre pour que son propre résultat tienne.",
        "The cross-references below are not a courtesy: they state what one component needs from another for its own result to hold.",
      ),
      chaineDepend: t("Dépend de", "Depends on"),
      see: t("Voir la composante", "View the component"),
      seeAll: t("Découvrir les 5 composantes", "Explore the 5 components"),
      prev: t("Composante précédente", "Previous component"),
      next: t("Composante suivante", "Next component"),
      perimetre: t("Périmètre de la composante", "Component scope"),
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
      metaDesc: t(
        "L'unité d'exécution du Projet de Transformation Numérique : son mandat, les règles qui bornent ses décisions, ses cinq pôles et la méthode qu'elle répète marché après marché.",
        "The delivery unit of the Digital Transformation Project: its mandate, the rules that bound its decisions, its five clusters and the method it repeats contract after contract.",
      ),
      /* ⚠️ Les en-têtes des six blocs de la page — mandat, principes,
         organisation, méthode, équipe, questions — ne sont plus ici : ils sont
         administrés depuis la console, et leur état initial vit dans
         `src/content/impact/ugptn.ts`.

         Ne restent que le héros, le référencement, la sortie, et les deux
         libellés que le DESSIN pose lui-même : la mention « En cours » de
         l'organigramme et l'unité du compteur de fiches. Ceux-là ne sont pas du
         contenu rédigé mais des mots de gabarit, saisis nulle part. */
      orgEnCours: t("En cours", "Under way"),
      membres: t("fiches publiées", "published profiles"),
      ctaTitle: t("Une question sur l'exécution du projet ?", "A question about how the project is delivered?"),
      ctaLead: t(
        "Les décisions relèvent des organes de gouvernance, les marchés d'une procédure écrite, et toute difficulté peut être signalée sans passer par nous.",
        "Decisions rest with the governance bodies, contracts follow a written procedure, and any difficulty can be reported without going through us.",
      ),
    },

    /* --- Gouvernance ------------------------------------------------------ */
    gouv: {
      titre: t("Gouvernance", "Governance"),
      lead: t(
        "Trois niveaux, et une règle : celui qui oriente ne met pas en œuvre, et celui qui met en œuvre ne s'auto-évalue pas. Cette séparation est ce qui rend les décisions contrôlables.",
        "Three levels, and one rule: whoever sets direction does not implement, and whoever implements does not assess themselves. That separation is what makes decisions controllable.",
      ),
      metaDesc: t(
        "Les trois organes qui décident du Projet de Transformation Numérique : comité de pilotage, comité technique et unité d'exécution, leur composition, leurs règles de décision et leur trace datée.",
        "The three bodies that steer the Digital Transformation Project: steering committee, technical committee and delivery unit, their composition, decision rules and dated record.",
      ),
      /* Les deux premières sections de la page n'avaient aucun titre : ni pour
         le lecteur, ni pour la structure du document. */
      bodiesLabel: t("Les trois organes", "The three bodies"),
      bodiesTitle: t("Trois organes, trois périmètres.", "Three bodies, three remits."),
      compLabel: t("Composition", "Composition"),
      compTitle: t("Qui siège, et au nom de quoi.", "Who sits, and on whose behalf."),
      ctaTitle: t("Suivre les décisions, pièce par pièce.", "Follow decisions, record by record."),
      ctaLead: t(
        "Les comptes rendus, les rapports d'avancement et les avis de marché sont publiés à mesure. Ce qui ne l'est pas est signalé, avec son motif.",
        "Minutes, progress reports and tender notices are published as they come. What is not published is flagged, with the reason why.",
      ),
      /* `copilComp` et `ctpComp` ont disparu : ils redisaient l'effectif déjà
         porté par l'organe (« 8 membres »), préfixé de `compLabel`. La page
         compose désormais les deux, ce qui évite qu'un effectif corrigé en
         console laisse ici l'ancien chiffre.

         `copilDesc`, `ctpDesc`, `copilMembers` et `ctpMembers` restent, mais
         comme CONTENU D'ORIGINE et non comme libellés : ils n'alimentent plus
         la page, seulement la reprise en base et le repli tant qu'elle n'a pas
         eu lieu (cf. src/lib/gouvernance/origine.ts). */
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
      /* Liste vide pour de bon, à distinguer d'une recherche infructueuse : il
         n'y a rien à réinitialiser, et le visiteur doit savoir où s'adresser
         plutôt que de conclure que la page est en panne. */
      aucunAvis: t("Aucun avis n'est ouvert en ce moment.", "No notice is open at this time."),
      aucunAvisLead: t(
        "Les prochains appels d'offres et avis à manifestation d'intérêt paraîtront sur cette page dès leur publication. D'ici là, la cellule passation de l'UGPTN répond aux questions des entreprises intéressées.",
        "Upcoming invitations to bid and requests for expressions of interest will appear on this page as soon as they are published. Until then, the UGPTN procurement unit answers questions from interested companies.",
      ),
      published: t("Publié le", "Published"),
      budget: t("Budget estimé", "Estimated budget"),
      place: t("Lieu d'exécution", "Place of performance"),
      lots: t("Lots", "Lots"),
      review: t("Revue", "Review"),
      docsTitle: t("Pièces du dossier", "Bidding documents"),
      /* Le retrait du dossier se fait sur DigiProcure, ou au bureau tant que
         les pièces n'y sont pas déposées. Un avis qui ne dit pas où se procurer
         le dossier n'ouvre aucune concurrence. */
      retraitTitle: t("Retrait du dossier", "Obtaining the documents"),
      arretTitle: t("Procédure arrêtée", "Procedure stopped"),
      surPlateforme: t("Ouvrir sur DigiProcure", "Open on DigiProcure"),
      docsSurPlateforme: t(
        "Les pièces se téléchargent sur DigiProcure, après inscription. C'est cette inscription qui vous fait recevoir les additifs.",
        "The documents are downloaded from DigiProcure, after registration. That registration is what makes you receive addenda.",
      ),
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
      titre: t("Cadre de résultats", "Results framework"),
      metaDesc: t(
        "Les indicateurs d'objectif et intermédiaires du projet, leur point de départ, ce qu'ils mesurent réellement et ce que la mesure ne dit pas.",
        "The project's objective and intermediate indicators, their starting point, what they actually measure and what measurement does not say.",
      ),
      odpLabel: t("ODP · ambitions à l'horizon 2029", "PDO · ambitions towards 2029"),
      interLabel: t("Indicateurs intermédiaires — ce que le projet livre", "Intermediate indicators — what the project delivers"),
      /* La section « Le projet en vidéos » a été retirée : ses cinq cartes
         portaient un bouton de lecture et une durée devant des films qui ne
         sont pas fournis, et menaient pour C5 à une ancre inexistante. */
      ctaTitle: t("Voir ce qui produit ces résultats.", "See what produces these results."),
      ctaLead: t(
        "Les indicateurs se comprennent mieux à côté des chantiers qui les alimentent et des pièces qui les documentent.",
        "Indicators make more sense next to the workstreams that feed them and the records that document them.",
      ),
    },

    /* --- Ressources ------------------------------------------------------- */
    ressources: {
      titre: t("Documents publiés", "Published documents"),
      hero: t(
        "Ce que nous publions, et pourquoi certaines pièces ne le sont pas.",
        "What we publish, and why some documents are not published.",
      ),
      lead: t(
        "Deux natures de pièces cohabitent ici. D'abord les instruments dont la publication s'impose au Projet (manuel d'exécution, plans de passation, cadres de sauvegardes environnementales et sociales), en application de la norme environnementale et sociale n°10 et de la politique d'accès à l'information de la Banque mondiale. Ensuite les notes, études et rapports sur lesquels les arbitrages s'appuient, publiés pour être discutés. Le versionnage est explicite : une version remplacée reste identifiable. Ne sont pas publiés les documents contenant des données personnelles, des informations commercialement sensibles avant attribution, ou des éléments couverts par une obligation de confidentialité.",
        "Two kinds of material sit side by side here. First, the instruments the Project is required to disclose (project implementation manual, procurement plans, environmental and social safeguards frameworks), under Environmental and Social Standard 10 and the World Bank's access-to-information policy. Second, the notes, studies and reports on which trade-offs rest, published so they can be debated. Versioning is explicit: a superseded version remains identifiable. Not published are documents containing personal data, commercially sensitive information ahead of award, or material covered by a confidentiality obligation.",
      ),
      download: t("Télécharger", "Download"),

      /* Barre de recherche, filtres et tri de la liste dynamique. */
      search: t("Rechercher un document, un sigle, un organisme…", "Search a document, an acronym, an organisation…"),
      searchAction: t("Rechercher", "Search"),
      filterCategory: t("Thématique", "Theme"),
      filterType: t("Nature", "Type"),
      all: t("Tout", "All"),
      sortBy: t("Trier par", "Sort by"),
      sortRank: t("Pertinence", "Relevance"),
      sortDate: t("Date", "Date"),
      sortTitle: t("Titre", "Title"),
      reset: t("Réinitialiser les filtres", "Clear filters"),

      /* États de liste. */
      count: (n: number) =>
        t(`${n} document${n > 1 ? "s" : ""}`, `${n} document${n > 1 ? "s" : ""}`),
      noResult: t("Aucun document ne correspond à votre recherche.", "No document matches your search."),
      empty: t(
        "Aucun document n'est publié pour le moment. Les pièces de référence, analyses et études du Projet seront mises en ligne au fil de leur validation.",
        "No document is published yet. The Project's reference material, analyses and studies will be posted as they are cleared for release.",
      ),

      /* Panneau de détail. */
      details: t("Consulter la fiche", "View details"),
      close: t("Fermer", "Close"),
      open: t("Ouvrir le fichier", "Open the file"),
      preview: t("Aperçu du document", "Document preview"),
      previewNote: t(
        "Aperçu à l'écran — le fichier officiel est téléchargeable.",
        "On-screen preview — the official file is downloadable.",
      ),
      previewUnavailable: t(
        "Ce format ne s'affiche pas dans le navigateur. Téléchargez le fichier pour le consulter.",
        "This format cannot be displayed in the browser. Download the file to read it.",
      ),
      labelType: t("Nature", "Type"),
      labelCategory: t("Thématique", "Theme"),
      labelDocDate: t("Date du document", "Document date"),
      labelPublished: t("Mis en ligne le", "Published on"),
      labelAuthor: t("Organisme", "Organisation"),
      labelSignature: t("Rédigé par", "Written by"),
      labelReference: t("Référence", "Reference"),
      labelVersion: t("Version", "Version"),
      labelFile: t("Fichier", "File"),
      featured: t("À la une", "Featured"),

      /* Publications rédigées et page de lecture. */
      read: t("Lire la publication", "Read the publication"),
      readShort: t("Lire", "Read"),
      onlineBadge: t("À lire en ligne", "Read online"),
      minutes: t("min de lecture", "min read"),
      by: t("Par", "By"),
      attachment: t("Pièce jointe", "Attachment"),
      attachmentLead: t(
        "Le document est également disponible en fichier, à consulter ou à télécharger.",
        "The document is also available as a file, to view or download.",
      ),
      backToList: t("Tous les documents", "All documents"),
      alsoRead: t("À lire également", "Also worth reading"),
      breadcrumbLabel: t("Fil d'Ariane", "Breadcrumb"),
      notTranslated: (langue: string) =>
        t(
          `Cette publication n'est pas encore traduite : le texte ci-dessous est servi en ${langue === "en" ? "anglais" : "français"}.`,
          `This publication is not translated yet: the text below is served in ${langue === "en" ? "English" : "French"}.`,
        ),
      disclaimer: t(
        "Seuls les documents divulgables sont publiés ; aucun contenu confidentiel ou nominatif. Les fichiers sont hébergés sur le réseau de diffusion du Projet ; la date affichée est celle du document lorsqu'elle est connue, à défaut celle de sa mise en ligne. Conforme à la politique d'accès à l'information de la Banque mondiale.",
        "Only disclosable documents are published; no confidential or personal content. Files are hosted on the Project's delivery network; the date shown is the document's own where known, otherwise its date of publication. Compliant with the World Bank's access-to-information policy.",
      ),
    },

    /* --- Vidéos & galeries ------------------------------------------------ */
    galerie: {
      titre: t("Vidéos & galeries", "Videos & galleries"),
      hero: t("Ce que le Projet change, vu du terrain.", "What the Project changes, seen from the ground."),
      lead: t(
        "Un chantier de fibre optique, un atelier de formation, une salle de serveurs qui s'allume : ces images disent ce qu'un tableau d'indicateurs ne montre pas. Elles sont prises au fil de l'exécution, dans les provinces où le Projet travaille, et publiées telles quelles.",
        "A fibre-optic worksite, a training workshop, a server room powering up: these images say what a table of indicators cannot show. They are taken as implementation proceeds, in the provinces where the Project works, and published as they are.",
      ),

      /* Barre de recherche, filtres et tri. */
      search: t("Rechercher un titre, une légende, un lieu…", "Search a title, a caption, a place…"),
      searchAction: t("Rechercher", "Search"),
      filterCategory: t("Rubrique", "Section"),
      filterType: t("Nature", "Type"),
      all: t("Tout", "All"),
      sortBy: t("Trier par", "Sort by"),
      sortRank: t("Sélection", "Selection"),
      sortDate: t("Date", "Date"),
      sortTitle: t("Titre", "Title"),
      reset: t("Réinitialiser les filtres", "Clear filters"),

      /* États de liste. */
      count: (n: number) =>
        t(`${n} contenu${n > 1 ? "s" : ""}`, `${n} item${n > 1 ? "s" : ""}`),
      noResult: t("Aucun contenu ne correspond à votre recherche.", "No item matches your search."),
      empty: t(
        "La galerie n'est pas encore alimentée. Les photographies et les films des activités du Projet y seront publiés au fil de leur validation.",
        "The gallery is not yet populated. Photographs and films of the Project's activities will be posted as they are cleared for release.",
      ),

      /* Albums — les reportages, en tête de la galerie. */
      albums: t("Albums", "Albums"),
      albumsLead: t(
        "Les reportages complets : un événement, une mission, un chantier, et toutes les images qui vont avec.",
        "Full photo stories: an event, a mission, a worksite, and every image that goes with it.",
      ),
      albumOuvrir: t("Voir l'album", "View the album"),
      albumCount: (n: number) =>
        t(`${n} contenu${n > 1 ? "s" : ""}`, `${n} item${n > 1 ? "s" : ""}`),
      albumRetour: t("Retour à la galerie", "Back to the gallery"),
      albumTous: t("Voir tous les albums", "See all albums"),
      albumIntro: t("Album", "Album"),
      toutesImages: t("Toutes les images", "All images"),
      toutesImagesLead: t(
        "L'ensemble des photographies et des films publiés, albums compris.",
        "Every published photograph and film, albums included.",
      ),

      /* Vignettes et visionneuse. */
      openPhoto: t("Agrandir la photo", "Enlarge the photo"),
      openVideo: t("Lire la vidéo", "Play the video"),
      close: t("Fermer", "Close"),
      previous: t("Contenu précédent", "Previous item"),
      next: t("Contenu suivant", "Next item"),
      counter: (index: number, total: number) => `${index} / ${total}`,
      labelPlace: t("Lieu", "Place"),
      labelDate: t("Date", "Date"),
      labelSection: t("Rubrique", "Section"),
      labelDuration: t("Durée", "Duration"),
      featured: t("En avant", "Featured"),
      videoUnavailable: t(
        "Cette vidéo ne peut pas être lue ici. Réessayez depuis un autre navigateur.",
        "This video cannot be played here. Try again from another browser.",
      ),
      keyboardHint: t(
        "Flèches pour parcourir, Échap pour fermer.",
        "Arrow keys to browse, Esc to close.",
      ),
      disclaimer: t(
        "Photographies et films produits pour le Projet ou pour ses partenaires d'exécution. Les fichiers sont hébergés sur le réseau de diffusion du Projet ; la date affichée est celle de la prise de vue lorsqu'elle est connue, à défaut celle de la mise en ligne.",
        "Photographs and films produced for the Project or for its implementing partners. Files are hosted on the Project's delivery network; the date shown is the shooting date where known, otherwise the date of publication.",
      ),
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
      refMailed: t(
        "Un accusé de réception vient de partir vers votre adresse e-mail : il reprend ce numéro, le détail de votre dépôt et le lien de suivi.",
        "An acknowledgement has just been sent to your email address: it carries this number, the details of your submission and the tracking link.",
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

    /* Adresse qui ne correspond à rien : article retiré, lien mal recopié,
       publication dépubliée depuis qu'un moteur l'a indexée. À distinguer de
       `erreur`, qui parle d'une panne — ici le site fonctionne, c'est la page
       qui n'existe pas. Les sorties proposées sont donc des chemins, pas un
       bouton « réessayer » qui ne changerait rien. */
    introuvable: {
      code: "404",
      titre: t("Cette page n'existe pas", "This page does not exist"),
      corps: t(
        "L'adresse demandée ne correspond à aucune page du site. Elle a pu être retirée, renommée, ou le lien que vous avez suivi comportait une erreur.",
        "The requested address matches no page on this site. It may have been removed or renamed, or the link you followed contained a mistake.",
      ),
      pistes: t("Reprendre par une de ces entrées :", "Start again from one of these:"),
      accueil: t("Accueil", "Home"),
      actus: t("Actualités", "News"),
      docs: t("Documents publiés", "Published documents"),
      contact: t("Contact", "Contact"),
    },
  };
}

export type Dict = ReturnType<typeof dict>;
