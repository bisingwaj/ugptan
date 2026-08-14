/**
 * Libellés de la console d'administration — français uniquement.
 *
 * Volontairement séparé de `content/i18n.ts` : la console n'est pas bilingue
 * (décision produit), son vocabulaire est interne, et `dict()` reconstruit un
 * objet de contenu public à chaque appel.
 */
import type { Permission } from "@/lib/auth/permissions";

export const ADMIN = {
  brand: "UGPTN",
  console: "Console d'administration",

  login: {
    kicker: "Console d'administration",
    heroTitle: "Gestion du contenu du site UGPTN",
    benefits: [
      "Appels d'offres, actualités et documents",
      "Médias, événements et ressources",
      "Plaintes MGP et suivi des délais",
    ],
    accessNote: "Accès restreint · journalisation",
    title: "Connexion",
    lead: "Espace réservé à l'équipe UGPTN.",
    emailLabel: "Adresse électronique",
    passwordLabel: "Mot de passe",
    submit: "Se connecter",
    submitting: "Vérification…",
    noSignup: "Les comptes sont créés par un administrateur. Aucune inscription n'est ouverte.",
    expired: "Votre session n'est plus valide. Reconnectez-vous pour reprendre là où vous en étiez.",
    biddersPrompt: "Vous êtes soumissionnaire ?",
    biddersLink: "Accéder à votre espace",
  },

  setPassword: {
    kicker: "Accès à la console",
    heroWelcome: "Choisissez votre mot de passe, personne d'autre ne le connaîtra.",
    heroReset: "Définissez un nouveau mot de passe.",
    heroLead:
      "Aucun mot de passe n'a été transmis par e-mail : celui que vous saisissez ici n'est connu que de vous. Il est enregistré sous forme d'empreinte, jamais en clair.",
    title: "Votre mot de passe",
    lead: "Huit caractères au minimum. Un gestionnaire de mots de passe reste la meilleure façon d'en retenir un long.",
    fieldPassword: "Nouveau mot de passe",
    fieldConfirmation: "Confirmation",
    hint: "Au moins 8 caractères.",
    submit: "Enregistrer et continuer",
    submitting: "Enregistrement…",
    missingToken:
      "Ce lien est incomplet. Ouvrez-le directement depuis l'e-mail reçu, sans le recopier partiellement.",
    footnote:
      "Ce lien ne fonctionne qu'une fois. Une fois votre mot de passe défini, vous serez conduit à l'écran de connexion.",
    doneNotice: "Mot de passe enregistré. Connectez-vous avec votre adresse et le mot de passe que vous venez de choisir.",
  },

  shell: {
    signedInAs: "Connecté",
    logout: "Déconnexion",
    loggingOut: "Déconnexion…",
    soon: "bientôt",
    console: "Console",
    collapse: "Replier la barre",
    expand: "Déplier la barre",
  },

  errors: {
    title: "Le module n'a pas pu être chargé",
    lead: "Une opération sur la base de données a échoué. Aucune donnée n'a été perdue : la page n'a simplement pas pu être construite.",
    hint: "Si l'incident se répète, vérifiez l'accès réseau à la base et la variable DATABASE_URL.",
    retry: "Réessayer",
    reference: "Référence",
  },

  home: {
    title: "Tableau de bord",
    lead: "Squelette de la console. Les modules de gestion arrivent progressivement.",
    kpisTitle: "Indicateurs",
    modulesTitle: "Modules",
    modulesLead: "Périmètre cible du CMS, tel que spécifié dans le guide de développement (§8.2).",
    empty: "—",
  },

  users: {
    title: "Utilisateurs",
    lead: "Comptes autorisés à accéder à la console. Seul un administrateur peut en créer, en modifier ou en supprimer.",
    listTitle: "Comptes",
    createTitle: "Nouveau compte",
    createLead: "Le mot de passe est haché avant enregistrement ; il ne sera plus jamais affiché.",
    editTitle: "Modifier le compte",
    empty: "Aucun compte pour le moment.",

    fieldEmail: "Adresse électronique",
    fieldName: "Nom affiché",
    fieldNameHint: "facultatif",
    fieldPassword: "Mot de passe",
    fieldPasswordEdit: "Nouveau mot de passe",
    fieldPasswordEditHint: "laisser vide pour conserver l'actuel",
    fieldRole: "Rôle",
    fieldPermissions: "Modules supplémentaires",
    fieldPermissionsHint: "Le rôle ouvre déjà un socle de modules. Cochez ici les accès accordés en plus.",
    fieldPermissionsAdmin: "Un administrateur accède à tous les modules : aucun ajout n'est nécessaire.",

    create: "Créer le compte",
    creating: "Création…",
    save: "Enregistrer",
    saving: "Enregistrement…",
    deactivate: "Désactiver",
    deactivating: "Désactivation…",
    activate: "Réactiver",
    activating: "Réactivation…",
    resendInvite: "Renvoyer l'invitation",
    resendingInvite: "Envoi…",
    remove: "Supprimer",
    removing: "Suppression…",
    removeConfirm: "Supprimer définitivement ce compte ? Cette action est irréversible.",
    back: "Retour à la liste",

    colUser: "Compte",
    colRole: "Rôle",
    colStatus: "État",
    colLastLogin: "Dernière connexion",
    colActions: "",

    statusActive: "Actif",
    statusInactive: "Désactivé",
    neverConnected: "Jamais",
    you: "vous",

    createdOk: "Compte créé.",
    updatedOk: "Compte mis à jour.",
    deletedOk: "Compte supprimé.",
    activatedOk: "Compte réactivé.",
    deactivatedOk: "Compte désactivé.",
  },

  grievances: {
    title: "Plaintes (MGP)",
    lead: "Dossiers déposés par le formulaire public du mécanisme de gestion des plaintes. Chaque dossier porte un numéro de référence communiqué au plaignant, qui lui sert à suivre son avancement depuis le site.",
    listTitle: "Dossiers",
    empty: "Aucune plainte reçue pour le moment.",
    emptyFiltered: "Aucun dossier ne correspond à ce filtre.",
    back: "Retour aux plaintes",

    filterAll: "Tous",
    filterOpen: "En cours",
    filterUnassigned: "Non affectés",
    filterOverdue: "Hors délai",
    filterLabel: "Filtrer",

    colRef: "Référence",
    colSubmitted: "Reçue le",
    colCategory: "Catégorie",
    colStatus: "Statut",
    colStage: "Étape",
    colAssignee: "Responsable",
    colDeadline: "Échéance",

    closedOn: "Clôturé le",
    unassigned: "Non affecté",
    anonymous: "Anonyme",
    named: "Nominative",
    overdue: "Hors délai",
    dueIn: "j restants",
    lateBy: "j de retard",

    kpiTotal: "Dossiers",
    kpiNew: "Nouvelles",
    kpiOpen: "En cours",
    kpiOverdue: "Hors délai",

    identityTitle: "Plaignant",
    identityAnonymous: "Dépôt anonyme : aucun nom n'a été communiqué. Les coordonnées éventuellement laissées permettent malgré tout de recontacter la personne.",
    identityNone: "Aucune coordonnée : cette personne ne peut pas être recontactée. Le suivi public par numéro de référence est son seul retour.",
    fieldName: "Nom complet",
    fieldEmail: "Adresse électronique",
    fieldPhone: "Téléphone",
    fieldProvince: "Province",
    fieldLang: "Langue de dépôt",
    write: "Écrire",
    call: "Appeler",

    caseTitle: "Plainte",
    descriptionTitle: "Faits rapportés",
    attachmentsTitle: "Pièces annoncées",
    attachmentsNote: "Le formulaire enregistre le nom et le poids des pièces annoncées par le plaignant ; les fichiers eux-mêmes ne sont pas hébergés à ce stade. Redemandez-les par le canal de contact du dossier.",
    attachmentsEmpty: "Aucune pièce annoncée.",

    workflowTitle: "Qualification & traitement",
    workflowLead: "Statut, étape, priorité et responsable. Chaque changement est inscrit à l'historique, avec son auteur et son horodatage.",
    fieldStatus: "Statut",
    fieldStage: "Étape de la pipeline",
    fieldPriority: "Priorité",
    fieldAssignee: "Responsable du dossier",
    assigneeHint: "Comptes actifs disposant du module Plaintes.",
    save: "Enregistrer",
    saving: "Enregistrement…",

    noteTitle: "Note interne",
    noteLead: "Observations de travail. Ces notes ne quittent jamais la console : elles n'apparaissent ni dans le suivi public, ni dans les échanges avec le plaignant.",
    noteField: "Note",
    noteSubmit: "Ajouter la note",

    messageTitle: "Message au plaignant",
    messageLead: "Ce texte s'affiche tel quel dans le suivi public du dossier, dès son enregistrement. Rédigez-le pour être lu par la personne concernée, sans donnée relative à un tiers.",
    messageField: "Message publié",
    messageSubmit: "Publier dans le suivi",
    messageSubmitting: "Publication…",

    contactTitle: "Journaliser un contact",
    contactLead: "L'échange a lieu par téléphone, courriel ou en présentiel ; le dossier en garde la trace.",
    contactChannel: "Canal",
    contactSummary: "Ce qu'il en ressort",
    contactSubmit: "Enregistrer l'échange",
    contactChannels: ["Téléphone", "Courriel", "Entretien", "Point focal", "Courrier"],

    historyTitle: "Historique du dossier",
    historyLead: "Toutes les actions, dans l'ordre. Rien n'y est modifiable.",
    historyPublic: "publié",
    historyEmpty: "Aucune action enregistrée.",
    by: "par",
  },

  newsletter: {
    title: "Newsletter",
    lead: "Adresses collectées par le formulaire d'inscription du site public. Une adresse désabonnée reste dans la liste, marquée comme telle : c'est ce qui garantit qu'elle ne sera pas réabonnée par erreur lors d'un import ou d'une nouvelle saisie.",
    listTitle: "Abonnés",
    empty: "Aucun abonné pour le moment.",
    emptyFiltered: "Aucun abonné ne correspond à ce filtre.",

    kpiTotal: "Adresses",
    kpiActive: "Abonnés actifs",
    kpiUnsub: "Désabonnés",
    kpiMonth: "Inscrits sur 30 jours",

    rechercher: "Rechercher une adresse…",
    filtrer: "Filtrer",
    reinitialiser: "Tout afficher",
    tousStatuts: "Tous les statuts",
    toutesLangues: "Toutes les langues",
    toutesSources: "Toutes les provenances",

    colEmail: "Adresse",
    colStatut: "Statut",
    colDate: "Inscription",
    colLangue: "Langue",
    colSource: "Provenance",
    colActions: "",

    desabonneLe: "Désabonné le",

    exportTitle: "Exporter",
    exportCsv: "Export CSV",
    exportXlsx: "Export Excel",
    exportAide:
      "L'export reprend la sélection affichée : adresse, date d'inscription, statut, langue et provenance. Le fichier CSV est encodé en UTF-8 avec point-virgule, format attendu par Excel en configuration française.",

    desabonner: "Désabonner",
    desabonnement: "Désabonnement…",
    desabonnerConfirm:
      "Marquer cette adresse comme désabonnée ? Elle ne recevra plus aucun envoi et ne pourra revenir sur la liste que par une action de son titulaire.",
    reabonner: "Réabonner",
    reabonnement: "Réabonnement…",
    reabonnerConfirm:
      "Remettre cette adresse sur la liste ? Ne le faites que si son titulaire vous l'a expressément demandé : la loi comme les filtres anti-pourriel s'appuient sur ce consentement.",
    supprimer: "Supprimer",
    suppression: "Suppression…",
    supprimerConfirm:
      "Supprimer définitivement cette adresse ? La trace du désabonnement disparaît avec elle : rien n'empêchera plus qu'elle soit réinscrite par un import. Préférez le désabonnement, sauf demande d'effacement.",

    desabonneOk: "Adresse désabonnée.",
    reabonneOk: "Adresse remise sur la liste.",
    supprimeOk: "Adresse supprimée.",
    introuvable: "Cette adresse n'existe plus dans la liste.",

    envoiTitle: "Envoi des lettres",
    envoiLead:
      "L'envoi se fait hors de la console : exportez la liste, puis chargez le fichier dans l'outil d'emailing retenu. Chaque abonné exporté porte sa langue et son statut de consentement, les deux informations dont cet outil a besoin pour ne diffuser qu'aux personnes qui l'ont accepté.",
  },
} as const;

/**
 * Module « Actualités ».
 *
 * Séparé de l'objet `ADMIN` : le module compte à lui seul plus de libellés que
 * tout le reste de la console, et il est lu par des composants clients (fiche
 * d'article, éditeur) qu'on ne veut pas voir embarquer le vocabulaire des
 * autres écrans.
 */
export const ADMIN_ACTUS = {
  title: "Actualités",
  lead: "Communiqués, décisions et jalons publiés sur le site. Chaque article existe en français et en anglais ; une langue non traduite est signalée et n'est jamais servie au public.",

  /* --- Liste --------------------------------------------------------------- */
  nouveau: "Nouvel article",
  listeVide: "Aucun article pour le moment.",
  listeVideFiltre: "Aucun article ne correspond à ce filtre.",
  rechercher: "Rechercher un titre…",
  filtrer: "Filtrer",
  reinitialiser: "Tout afficher",
  tousStatuts: "Tous les statuts",
  toutesCategories: "Toutes les catégories",

  colArticle: "Article",
  colStatut: "État",
  colLangues: "Langues",
  colCategorie: "Catégorie",
  colDate: "Publication",
  colActions: "",

  jamaisPublie: "Non daté",
  une: "À la une",

  publier: "Publier",
  publication: "Publication…",
  depublier: "Dépublier",
  depublication: "Dépublication…",
  dupliquer: "Dupliquer",
  duplication: "Duplication…",
  supprimer: "Supprimer",
  suppression: "Suppression…",
  supprimerConfirm: "Supprimer définitivement cet article et toutes ses traductions ? Cette action est irréversible.",
  modifier: "Modifier",
  retourListe: "Retour aux actualités",

  creeOk: "Article créé. Complétez-le puis publiez-le.",
  copieOk: "Copie créée en brouillon.",
  supprimeOk: "Article supprimé.",

  /* --- Langues -------------------------------------------------------------
     Chaque langue a son propre formulaire et son propre enregistrement : les
     libellés doivent dire laquelle on enregistre, sans ambiguïté. */
  langueRedaction: "Langue de rédaction",
  langueRedactionAide:
    "L'article naît dans cette langue. Les autres versions s'ajoutent ensuite depuis la fiche, chacune enregistrée séparément.",
  tradPresente: "traduit",
  tradIncomplete: "incomplet",
  tradManquante: "à traduire",
  tradNouvelle: (langue: string) =>
    `Cette version ${langue} n'existe pas encore. Renseignez-la puis enregistrez-la : elle ne touchera à aucune autre langue.`,
  enregistrerLangue: (langue: string) => `Enregistrer la version ${langue}`,
  enregistrerFiche: "Enregistrer les réglages",
  supprimerTraduction: "Supprimer cette traduction",
  suppressionTraduction: "Suppression…",
  supprimerTraductionConfirm:
    "Supprimer cette version linguistique ? L'article restera en ligne dans les autres langues.",
  majLe: "Modifié le",
  creer: "Créer l'article",
  creation: "Création…",
  aucuneLangue: "Renseignez au moins un titre pour enregistrer.",
  visuelPartage: "La couverture et la vidéo valent pour toutes les langues. Seul le texte alternatif se traduit.",

  champTitre: "Titre",
  champTitreAide: "Il sert de titre H1 sur la page publique et de titre par défaut dans les moteurs de recherche.",
  champSlug: "Adresse de la page",
  champResume: "Résumé",
  champResumePlaceholder: "Deux phrases qui disent ce que l'article apporte.",
  champResumeAide: "Affiché sur les cartes et dans les partages. Laissé vide, il est déduit des premières lignes du corps.",
  champCorps: "Corps de l'article",
  champAlt: "Texte alternatif du visuel",
  champAltAide: "Décrit l'image pour les lecteurs d'écran et quand elle ne se charge pas.",

  seoTitre: "Référencement",
  seoAide: "Renseignés seulement s'ils doivent différer du titre et du résumé.",
  champSeoTitre: "Titre pour les moteurs",
  champSeoTitrePlaceholder: "Reprend le titre de l'article",
  champSeoDesc: "Description pour les moteurs",

  /* --- Réglages ------------------------------------------------------------ */
  blocPublication: "Publication",
  champStatut: "Statut",
  champDate: "Date de publication",
  champDateAide: "Heure de Kinshasa. Une date à venir programme la parution.",
  champUne: "Mettre à la une",
  enregistrer: "Enregistrer",
  enregistrement: "Enregistrement…",
  apercu: "Prévisualiser",
  apercuIndisponible: "L'aperçu sera disponible après le premier enregistrement.",

  blocVisuel: "Image de couverture",
  aucunVisuel: "Aucun visuel",
  choisirVisuel: "Choisir un visuel",
  changerVisuel: "Changer",
  retirerVisuel: "Retirer",
  champVideo: "Vidéo associée",
  champVideoAide: "Lien YouTube. Un bouton de lecture apparaît alors sur la page de l'article.",

  blocClassement: "Classement",
  champCategorie: "Catégorie",
  sansCategorie: "Sans catégorie",
  gererCategories: "Gérer les catégories et les étiquettes →",
  champTags: "Étiquettes",
  aucunTag: "Aucune étiquette enregistrée.",
  champNouveauxTags: "Créer des étiquettes",
  champNouveauxTagsAide: "Séparées par des virgules. Elles seront créées à l'enregistrement.",
  champComposantes: "Composantes rattachées",
  champComposantesAide: "L'article remonte alors dans le bloc « Actualités » des pages de composante concernées.",

  blocAuteur: "Auteur",
  champCompte: "Compte de la console",
  sansCompte: "Aucun",
  champSignature: "Signature affichée",
  champSignatureAide: "Prime sur le compte. Utile pour signer au nom d'un service.",
  champFonction: "Fonction",
  champLieu: "Lieu",

  /* --- Taxonomies ---------------------------------------------------------- */
  taxoTitle: "Catégories & étiquettes",
  taxoLead: "Référentiels partagés par tous les articles. Une catégorie classe, une étiquette relie.",
  categoriesTitle: "Catégories",
  categoriesLead: "Une seule par article. Elles alimentent les filtres de la page publique.",
  categoriesVide: "Aucune catégorie.",
  etiquettesTitle: "Étiquettes",
  etiquettesLead: "Autant que nécessaire par article.",
  etiquettesVide: "Aucune étiquette.",
  champNomFr: "Libellé français",
  champNomEn: "Libellé anglais",
  champNomEnAide: "Laissé vide, le libellé français est repris.",
  champCouleur: "Couleur",
  champCouleurAide: "Sans couleur, la catégorie prend l'accent du site.",
  champPosition: "Ordre",
  ajouter: "Ajouter",
  colUsage: "Articles",
  supprimerCategorieConfirm: "Supprimer cette catégorie ? Les articles concernés resteront en ligne, sans catégorie.",
  supprimerTagConfirm: "Supprimer cette étiquette ? Elle sera retirée des articles qui la portent.",

  /* --- Médias -------------------------------------------------------------- */
  mediasTitle: "Médias et documents",
  mediasLead: "Visuels et documents des publications. Les fichiers téléversés sont déposés sur le stockage Cloudinary et servis par son réseau de diffusion ; les médias externes ne sont référencés que par leur adresse.",
  mediasVide: "La bibliothèque est vide.",
  mediasTeleverser: "Téléverser un fichier",
  mediasExterne: "Référencer une image distante",
  mediasUrl: "Adresse de l'image",
  mediasAltFr: "Texte alternatif (français)",
  mediasAltEn: "Texte alternatif (anglais)",
  mediasLegende: "Légende",
  mediasEnregistrer: "Enregistrer",
  mediasSupprimer: "Supprimer",
  mediasSupprimerConfirm: "Supprimer ce média ? Le fichier sera retiré du stockage, et les images déjà insérées dans le corps d'un article deviendraient des liens morts.",
  mediasUsage: "Utilisé par",
  mediasDocument: "Document",
  mediasOuvrir: "Ouvrir le fichier",
  mediasStockageAbsent: "Stockage des fichiers non configuré : le téléversement est indisponible tant que CLOUDINARY_URL n'est pas renseignée dans l'environnement. Le référencement d'un média externe reste possible.",
} as const;

/**
 * Module « Événements ».
 *
 * Séparé de l'objet `ADMIN` pour la même raison que `ADMIN_ACTUS` : il est lu
 * par des composants clients (fiche d'événement, éditeur) qu'on ne veut pas
 * voir embarquer le vocabulaire des autres écrans.
 *
 * Le vocabulaire recoupe volontairement celui des actualités là où le geste est
 * le même (publier, dupliquer, traduire) : deux modules qui se ressemblent
 * doivent se dire pareil, sinon la console s'apprend deux fois.
 */
export const ADMIN_EVTS = {
  title: "Événements",
  lead: "Forums, ateliers, webinaires et consultations publiques annoncés sur le site. Chaque événement existe en français et en anglais ; une langue non traduite est signalée et n'est jamais servie au public.",

  /* --- Liste --------------------------------------------------------------- */
  nouveau: "Nouvel événement",
  listeVide: "Aucun événement pour le moment.",
  listeVideFiltre: "Aucun événement ne correspond à ce filtre.",
  rechercher: "Rechercher un titre…",
  filtrer: "Filtrer",
  reinitialiser: "Tout afficher",
  tousStatuts: "Tous les états",
  toutesCategories: "Toutes les catégories",
  toutesPhases: "Toutes les dates",

  colEvenement: "Événement",
  colStatut: "État",
  colPhase: "Calendrier",
  colLangues: "Langues",
  colCategorie: "Catégorie",
  colDate: "Date",
  colLieu: "Lieu",

  sansCategorie: "Sans catégorie",
  sansLieu: "Lieu non renseigné",
  une: "À la une",

  publier: "Publier",
  depublier: "Dépublier",
  dupliquer: "Dupliquer",
  supprimer: "Supprimer",
  supprimerConfirm: "Supprimer définitivement cet événement et toutes ses traductions ? Cette action est irréversible.",
  modifier: "Modifier l'événement",
  retourListe: "Retour aux événements",

  creeOk: "Événement créé. Complétez-le puis publiez-le.",
  copieOk: "Copie créée en brouillon.",
  supprimeOk: "Événement supprimé.",

  /* --- Langues ------------------------------------------------------------- */
  langueRedaction: "Langue de rédaction",
  langueRedactionAide:
    "L'événement naît dans cette langue. Les autres versions s'ajoutent ensuite depuis la fiche, chacune enregistrée séparément.",
  tradPresente: "traduit",
  tradIncomplete: "incomplet",
  tradManquante: "à traduire",
  tradNouvelle: (langue: string) =>
    `Cette version ${langue} n'existe pas encore. Renseignez-la puis enregistrez-la : elle ne touchera à aucune autre langue.`,
  enregistrerLangue: (langue: string) => `Enregistrer la version ${langue}`,
  enregistrerFiche: "Enregistrer les réglages",
  supprimerTraduction: "Supprimer cette traduction",
  supprimerTraductionConfirm:
    "Supprimer cette version linguistique ? L'événement restera en ligne dans les autres langues.",
  majLe: "Modifié le",
  creer: "Créer l'événement",
  creation: "Création…",

  champTitre: "Titre",
  champTitreAide: "Il sert de titre H1 sur la page publique et de titre par défaut dans les moteurs de recherche.",
  champSlug: "Adresse de la page",
  champResume: "Description courte",
  champResumePlaceholder: "Deux phrases qui disent à quoi sert cette rencontre.",
  champResumeAide: "Affichée sur les cartes et dans les partages. Laissée vide, elle est déduite des premières lignes de la description.",
  champDescription: "Description complète",
  champAlt: "Texte alternatif du visuel",
  champAltAide: "Décrit l'image pour les lecteurs d'écran et quand elle ne se charge pas.",

  blocLieu: "Lieu & accès",
  blocLieuAide: "Ces libellés se traduisent : « Goma — provinces de l'Est » n'est pas « Goma — Eastern provinces ».",
  champLieu: "Lieu affiché",
  champLieuAide: "Ville, salle ou « En ligne ». Sans lui, la langue n'est pas servie au public.",
  champAdresse: "Adresse ou repère",
  champAdresseAide: "Facultatif. Affiché sur la fiche pour qui doit s'y rendre.",
  champPlaces: "Jauge",
  champPlacesAide: "Un libellé, pas un nombre : « 320 places », « Ouvert à tous », « Illimité ».",
  champInfos: "Informations complémentaires",
  champInfosPlaceholder: "Interprétation simultanée, pièce d'identité exigée à l'entrée…",
  champInfosAide: "Affichées dans l'encadré pratique de la fiche.",

  seoTitre: "Référencement",
  seoAide: "Renseignés seulement s'ils doivent différer du titre et de la description courte.",
  champSeoTitre: "Titre pour les moteurs",
  champSeoTitrePlaceholder: "Reprend le titre de l'événement",
  champSeoDesc: "Description pour les moteurs",

  /* --- Réglages ------------------------------------------------------------ */
  blocPublication: "Publication",
  champStatut: "État",
  champUne: "Mettre à la une",
  enregistrer: "Enregistrer",
  enregistrement: "Enregistrement…",
  voirSite: "Voir sur le site",
  voirSiteIndisponible: "La fiche publique s'ouvrira une fois l'événement publié et traduit.",

  blocCalendrier: "Calendrier",
  champDebut: "Début",
  champFin: "Fin",
  champFinAide: "Laissée vide, l'événement est réputé se tenir sur la seule journée de début.",
  champJournee: "Journée entière",
  champJourneeActive: "Les heures ne seront pas affichées au public : seule la date le sera.",
  champDateAide: "Heure de Kinshasa. Le classement « à venir » ou « terminé » en découle, sans intervention.",

  blocModalite: "Modalité",
  champMode: "Participation",
  champLienConnexion: "Lien de connexion",
  champLienConnexionAide: "Affiché sur la fiche des événements en ligne.",
  adresseRappel: "L'adresse se saisit dans l'onglet de chaque langue, avec le lieu.",

  blocVisuel: "Image de couverture",
  aucunVisuel: "Aucun visuel",
  choisirVisuel: "Choisir un visuel",
  changerVisuel: "Changer",
  retirerVisuel: "Retirer",
  visuelPartage: "La couverture vaut pour toutes les langues. Seul le texte alternatif se traduit.",

  blocClassement: "Classement",
  champCategorie: "Catégorie",
  gererCategories: "Gérer les catégories →",
  champCouleur: "Couleur d'accent",
  champCouleurAide: "Sans couleur, l'événement prend celle de sa catégorie, puis l'accent du site.",
  champPosition: "Ordre",
  champComposantes: "Composantes rattachées",
  champComposantesAide: "L'événement remonte alors dans les blocs des pages de composante concernées.",

  blocParticipation: "Participation",
  champInscription: "Lien d'inscription",
  champInscriptionAide: "Billetterie ou formulaire externe. Renseigné, il remplace la demande de participation intégrée.",
  champLienExterne: "Lien externe",
  champLienExterneAide: "Page officielle, ordre du jour, dossier de presse.",

  blocOrganisateur: "Organisateur",
  champOrganisateur: "Nom affiché",
  champOrganisateurAide: "Institution ou service organisateur, tel qu'il doit apparaître sur la fiche.",
  champOrganisateurEmail: "Adresse électronique",
  champOrganisateurTel: "Téléphone",
  champOrganisateurUrl: "Site de l'organisateur",

  /* --- Inscriptions --------------------------------------------------------
     Demandes de participation déposées par le formulaire public. Elles portent
     des données personnelles : rien de ce vocabulaire n'apparaît côté site. */
  inscrTitle: "Demandes de participation",
  inscrLien: "Inscriptions",
  inscrVide: "Aucune demande pour le moment.",
  inscrColonne: "Demandes",
  inscrConfirmees: "Places confirmées",
  inscrJauge: "jauge annoncée :",
  inscrStatut: "État de la demande",
  inscrNote: "Note interne",
  inscrNotePlaceholder: "Salle pleine, recontacter si désistement…",
  inscrSupprimerConfirm:
    "Supprimer définitivement cette demande ? Utilisez « Annulée » pour garder la trace du passage de la personne.",
  inscrExterne:
    "Les inscriptions de cet événement se font sur un service externe : cette liste ne recense que d'anciennes demandes déposées sur le site.",
  retourFiche: "Retour à la fiche",

  /* --- Catégories ---------------------------------------------------------- */
  categoriesTitle: "Catégories d'événements",
  categoriesLead: "Une seule par événement. Elles alimentent les filtres et la pastille des cartes sur la page publique.",
  categoriesVide: "Aucune catégorie.",
  champNomFr: "Libellé français",
  champNomEn: "Libellé anglais",
  champNomEnAide: "Laissé vide, le libellé français est repris.",
  ajouter: "Ajouter",
  supprimerCategorieConfirm: "Supprimer cette catégorie ? Les événements concernés resteront en ligne, sans catégorie.",
} as const;

/**
 * Module « Ressources & publications ».
 *
 * ⚠️ Le module alimente UNE seule section publique, « Documents publiés »
 * (/transparency). Les deux noms diffèrent volontairement, ce qui n'était pas
 * le cas avant la fusion : la console gère un FONDS — rapports, études, notes,
 * pièces de référence, publiés ou non —, tandis que la page publique n'en
 * montre que la part publiée, et l'annonce comme telle au visiteur. Nommer
 * l'écran de saisie « Documents publiés » aurait promis que tout ce qui s'y
 * trouve est en ligne, alors qu'un brouillon y vit aussi.
 *
 * Les identifiants techniques, eux, restent `documents` : la permission, la
 * route de la console et les tables sont des clés stables, pas des libellés.
 *
 * Séparé de l'objet `ADMIN` pour la même raison que `ADMIN_ACTUS` et
 * `ADMIN_EVTS` : il est lu par des composants clients (formulaire de dépôt,
 * aperçu) qu'on ne veut pas voir embarquer le vocabulaire des autres écrans.
 *
 * Le vocabulaire recoupe volontairement celui des deux autres modules là où le
 * geste est le même — publier, dépublier, filtrer : deux écrans qui se
 * ressemblent doivent se dire pareil, sinon la console s'apprend deux fois.
 */
export const ADMIN_DOCS = {
  title: "Ressources & publications",
  lead: "Rapports, études, analyses et pièces de référence. Ce qui est publié ici alimente la page « Documents publiés » du site. Deux façons de publier : téléverser un fichier, ou rédiger la publication ici même (texte, visuels et graphiques) pour qu'elle se lise directement sur le site.",

  /* --- Liste --------------------------------------------------------------- */
  nouveau: "Nouvelle publication",
  listeVide: "Aucun document pour le moment.",
  listeVideFiltre: "Aucun document ne correspond à ce filtre.",
  rechercher: "Rechercher un titre, un sigle, un organisme…",
  filtrer: "Filtrer",
  reinitialiser: "Tout afficher",
  tousStatuts: "Tous les états",
  toutesCategories: "Toutes les catégories",
  tousTypes: "Toutes les natures",
  trierPar: "Trier par",

  colDocument: "Document",
  colStatut: "État",
  colType: "Nature",
  colCategorie: "Catégorie",
  colDate: "Date",
  colFichier: "Support",
  colOrdre: "Ordre",
  tousSupports: "Tous les supports",
  supportRedige: "Rédigé",
  sansContenu: "Corps vide",

  sansCategorie: "Sans catégorie",
  sansDate: "Non datée",
  une: "En avant",
  dateDocument: "Date du document",
  datePublication: "Mise en ligne",

  publier: "Publier",
  depublier: "Dépublier",
  archiver: "Archiver",
  desarchiver: "Sortir de l'archive",
  supprimer: "Supprimer",
  supprimerConfirm:
    "Supprimer définitivement ce document ? Le fichier sera retiré du stockage et les liens déjà partagés cesseront de fonctionner. Pour une version remplacée, préférez l'archivage.",
  archiverConfirm:
    "Archiver ce document ? Il quitte le site public mais reste en base avec son fichier, consultable depuis la console.",
  modifier: "Modifier le document",
  retourListe: "Retour aux documents",

  deposeOk: "Document déposé en brouillon. Relisez la fiche, prévisualisez-la, puis publiez-la.",
  supprimeOk: "Document supprimé.",

  /* --- Fiche --------------------------------------------------------------- */
  blocIdentite: "Identité du document",
  champTitreFr: "Titre (français)",
  champTitreFrAide: "Il sert de titre à la fiche publique et de nom dans les listes.",
  champTitreEn: "Titre (anglais)",
  champTitreEnAide: "Laissé vide, le titre français est servi aux lecteurs anglophones — mieux vaut un titre français qu'un document invisible.",
  champDescriptionFr: "Description (français)",
  champDescriptionPlaceholder: "Deux phrases qui disent ce que le document établit.",
  champDescriptionEn: "Description (anglais)",
  champReference: "Sigle ou référence",
  champReferenceAide: "MEP, PPSD, CGES… Le code par lequel la pièce est désignée dans les échanges du projet.",
  champVersion: "Version",
  champVersionAide: "v1.0, T2 2026, évolutif… Telle qu'elle doit s'afficher. Une pièce révisée garde son sigle et change de version, ce qui permet au lecteur de repérer celle qu'il a déjà lue.",
  champAuteur: "Organisme producteur",
  champAuteurAide: "Direction, cellule, cabinet d'études ou institution d'où vient la pièce. La personne qui l'a écrite se renseigne dans « Signature ».",

  /* --- Rédaction ----------------------------------------------------------- */
  blocSupport: "Support de la publication",
  blocSupportAide: "Il décide de ce que le site sert au visiteur : un fichier à télécharger, ou une page à lire.",
  blocCorps: "Corps de la publication",
  blocCorpsAide:
    "Titres, paragraphes, visuels, tableaux et graphiques. C'est ce texte qui se lit sur le site, à l'adresse de la publication.",
  corpsFr: "Texte français",
  corpsEn: "Texte anglais",
  corpsEnAide: "Laissé vide, les lecteurs anglophones reçoivent le texte français, signalé comme tel.",
  corpsPlaceholderFr: "Rédigez le rapport…",
  corpsPlaceholderEn: "Write the English version…",
  champSlugDoc: "Adresse de la page",
  champSlugDocAide:
    "Segment d'URL de la publication, commun aux deux langues. Déduit du titre s'il est laissé vide. Le modifier casse les liens déjà partagés.",

  blocSignature: "Signature",
  blocSignatureAide:
    "Le nom qui paraît sur le site sous le titre. C'est celui de la personne qui a écrit, jamais celui du compte qui saisit la fiche.",
  champCompteAuteur: "Compte auteur",
  sansCompteAuteur: "Aucun compte",
  champSignature: "Signature affichée",
  champSignatureAide: "Prime sur le compte. À employer pour un service (« Cellule suivi & évaluation ») ou un auteur sans accès à la console.",
  champFonction: "Fonction",

  blocCouverture: "Couverture",
  blocCouvertureAide: "Image d'en-tête de la page de lecture, reprise au partage sur les réseaux.",
  couvertureChoisir: "Choisir un visuel",
  couvertureRetirer: "Retirer",
  couvertureAucune: "Aucune couverture : la page s'ouvre sur un bandeau sobre, sans image.",

  blocPublication: "Publication",
  champStatut: "État",
  champDatePublication: "Date de mise en ligne",
  champDatePublicationAide: "Laissée vide, elle est posée à la première publication.",
  champDateDocument: "Date du document",
  champDateDocumentAide: "Date de production ou d'édition de la pièce. C'est elle qui prime dans le classement public.",
  champUne: "Mettre en avant",
  champUneAide: "Le document remonte en tête de la section « Rapports & analyses » du site.",
  champPosition: "Ordre d'affichage",
  champPositionAide: "Plus petit, plus haut. Départage les documents de même mise en avant.",
  enregistrer: "Enregistrer",
  enregistrement: "Enregistrement…",
  deposer: "Déposer le document",
  depot: "Téléversement…",
  creer: "Créer la publication",
  creation: "Création…",
  voirSite: "Voir sur le site",
  voirSiteIndisponible: "La fiche publique sera accessible une fois le document publié.",

  blocClassement: "Classement",
  champType: "Nature du document",
  champCategorie: "Catégorie ou thématique",
  gererCategories: "Gérer les catégories →",
  champComposantes: "Composantes rattachées",
  champComposantesAide: "Le document est alors rattaché aux composantes concernées.",

  /* --- Fichier ------------------------------------------------------------- */
  blocFichier: "Fichier",
  blocPieceJointe: "Pièce jointe",
  fichierAide:
    "PDF, Word, Excel, PowerPoint, CSV ou image. Le fichier part sur le stockage Cloudinary ; la base n'en garde que l'adresse et le poids.",
  fichierChoisir: "Fichier à téléverser",
  fichierAucun: "Aucun fichier attaché.",
  fichierAttacher: "Attacher un fichier",
  fichierAttachement: "Téléversement…",
  fichierAttacherAide:
    "Facultatif sur une publication rédigée : la version signée d'une note, le tableau de données qui l'accompagne.",
  fichierRetirer: "Retirer la pièce jointe",
  fichierRetirerConfirm:
    "Retirer cette pièce jointe ? Le fichier sera supprimé du stockage et les liens déjà partagés cesseront de fonctionner. Le texte de la publication reste intact.",
  fichierOuvrir: "Ouvrir le fichier",
  fichierTelecharger: "Télécharger",
  fichierRemplacer: "Remplacer le fichier",
  fichierRemplacement: "Remplacement…",
  fichierRemplacerAide:
    "Le nouveau fichier prend la place de l'ancien, qui est retiré du stockage. Toutes les métadonnées sont conservées, et l'adresse publique change.",
  fichierStockageAbsent:
    "Stockage des fichiers non configuré : le dépôt est indisponible tant que CLOUDINARY_URL n'est pas renseignée dans l'environnement.",

  /* --- Aperçu -------------------------------------------------------------- */
  apercuTitre: "Prévisualisation",
  apercuLead: "La fiche telle qu'elle paraîtra dans « Rapports & analyses », avant toute mise en ligne.",
  apercuOuvrir: "Prévisualiser",
  apercuFermer: "Fermer",
  apercuFichier: "Aperçu du fichier",
  apercuCorps: "Corps de la publication",
  apercuCorpsVide: "Aucun texte rédigé pour le moment.",
  apercuIndisponible:
    "Ce format ne s'affiche pas dans le navigateur. Ouvrez le fichier pour le vérifier avant publication.",

  /* --- Catégories ---------------------------------------------------------- */
  categoriesTitle: "Catégories documentaires",
  categoriesLead: "Une seule par document. Elles alimentent les filtres et la pastille des cartes sur la page publique.",
  categoriesVide: "Aucune catégorie.",
  champNomFr: "Libellé français",
  champNomEn: "Libellé anglais",
  champNomEnAide: "Laissé vide, le libellé français est repris.",
  champSlug: "Identifiant d'URL",
  champSlugAide: "Il apparaît dans l'adresse du filtre public (?categorie=…). Laissé vide, il est déduit du libellé.",
  champCouleur: "Couleur",
  champCouleurAide: "Hexadécimal (#0f62fe). Vide : l'accent du site.",
  champOrdre: "Ordre",
  ajouter: "Ajouter",
  colUsage: "Documents",
  supprimerCategorieConfirm:
    "Supprimer cette catégorie ? Les documents concernés resteront en ligne, sans catégorie.",
} as const;

/**
 * Module « Vidéos & galeries ».
 *
 * Séparé de l'objet `ADMIN` pour la même raison que `ADMIN_ACTUS` et
 * `ADMIN_DOCS` : il est lu par des composants clients qu'on ne veut pas voir
 * embarquer le vocabulaire des autres écrans.
 *
 * Le vocabulaire reprend celui des documents là où le geste est le même —
 * déposer, classer, mettre en avant, ranger par rubrique : deux modules qui se
 * ressemblent doivent se dire pareil, sinon la console s'apprend deux fois. Il
 * s'en écarte sur un point, et volontairement : on n'y « publie » pas, on rend
 * VISIBLE. Un rapport se publie parce qu'il fait foi ; une photographie se
 * montre ou ne se montre pas.
 */
export const ADMIN_GALERIE = {
  title: "Vidéos & galeries",
  lead: "La bibliothèque de contenus visuels publiables : photographies et vidéos des activités, événements, projets et actualités du Projet, telles qu'elles paraissent dans la galerie du site. Les fichiers sont déposés sur le stockage Cloudinary et servis par son réseau de diffusion ; la base ne conserve que leurs métadonnées et leur adresse.",
  distinction:
    "À ne pas confondre avec le module « Médias », qui tient les visuels réutilisés à l'intérieur des contenus du site (couvertures d'articles, affiches d'événements, portraits). Ici, chaque entrée est une publication à part entière : elle a son titre, sa rubrique, sa date et son propre état de visibilité.",

  /* --- Liste --------------------------------------------------------------- */
  nouvellePhoto: "Ajouter une photo",
  nouvelleVideo: "Ajouter une vidéo",
  listeVide: "Aucun contenu dans la galerie pour le moment.",
  listeVideFiltre: "Aucun contenu ne correspond à ce filtre.",
  rechercher: "Rechercher un titre, une légende, un lieu…",
  filtrer: "Filtrer",
  reinitialiser: "Tout afficher",
  tousStatuts: "Tous les états",
  toutesRubriques: "Toutes les rubriques",
  tousTypes: "Photos et vidéos",
  trierPar: "Trier par",

  colMedia: "Contenu",
  colStatut: "État",
  colType: "Nature",
  colRubrique: "Rubrique",
  colDate: "Date",
  colLieu: "Lieu",

  sansRubrique: "Sans rubrique",
  sansDate: "Non datée",
  sansLieu: "Lieu non précisé",
  une: "En avant",
  datePrise: "Prise de vue",
  datePublication: "Mise en ligne",
  vignetteAbsente: "Sans vignette",

  publier: "Rendre visible",
  depublier: "Masquer",
  supprimer: "Supprimer",
  supprimerConfirm:
    "Supprimer définitivement ce contenu ? Le fichier sera retiré du stockage et les liens déjà partagés cesseront de fonctionner. Pour le retirer du site sans l'effacer, utilisez « Masquer ».",
  modifier: "Modifier le contenu",
  retourListe: "Retour à la galerie",

  ajouteOk: "Contenu ajouté, masqué pour l'instant. Vérifiez la fiche et le rendu, puis rendez-le visible.",
  supprimeOk: "Contenu supprimé.",

  /* --- Fiche --------------------------------------------------------------- */
  blocIdentite: "Ce qui se lit",
  champTitreFr: "Titre (français)",
  champTitreFrAide: "Il coiffe la vignette dans la galerie et l'écran de la visionneuse.",
  champTitreEn: "Titre (anglais)",
  champTitreEnAide: "Laissé vide, le titre français est servi aux lecteurs anglophones — mieux vaut un titre français qu'une image muette.",
  champDescriptionFr: "Légende (français)",
  champDescriptionPlaceholder: "Une ou deux phrases : ce que montre l'image, et pourquoi elle compte.",
  champDescriptionEn: "Légende (anglais)",
  champLieu: "Lieu",
  champLieuAide: "Kinshasa, Nord-Kivu, Matadi… Affiché sous le titre et cherché par la recherche.",

  blocAccessibilite: "Accessibilité",
  blocAccessibiliteAide:
    "Le texte alternatif décrit l'image à qui ne la voit pas. Il n'est pas le titre : le titre nomme la scène, l'alternatif la décrit. Laissé vide, le titre en tient lieu.",
  champAltFr: "Texte alternatif (français)",
  champAltEn: "Texte alternatif (anglais)",

  blocPublication: "Visibilité",
  champStatut: "État",
  champDatePublication: "Date de mise en ligne",
  champDatePublicationAide: "Laissée vide, elle est posée à la première mise en visibilité.",
  champDatePrise: "Date de prise de vue",
  champDatePriseAide: "Le jour où l'image a été faite. C'est elle qui prime dans le classement public.",
  champUne: "Mettre en avant",
  champUneAide: "Le contenu remonte en tête de la galerie et occupe une cellule double dans la mosaïque.",
  champPosition: "Ordre d'affichage",
  champPositionAide: "Plus petit, plus haut. Départage les contenus de même mise en avant.",
  enregistrer: "Enregistrer",
  enregistrement: "Enregistrement…",
  ajouter: "Ajouter à la galerie",
  ajout: "Téléversement…",
  voirSite: "Voir dans la galerie",
  voirSiteIndisponible: "La galerie publique montrera ce contenu une fois qu'il sera visible.",

  blocClassement: "Classement",
  champType: "Nature",
  champRubrique: "Rubrique",
  gererRubriques: "Gérer les rubriques →",
  champComposantes: "Composantes rattachées",
  champComposantesAide: "Le contenu est alors rattaché aux composantes concernées.",

  /* --- Visuel -------------------------------------------------------------- */
  blocVisuel: "Visuel",
  visuelChoisir: "Image à téléverser",
  visuelAide:
    "JPEG, PNG, WebP, AVIF ou GIF. Cadrez avant de déposer : la galerie respecte le format d'origine, elle ne recadre pas.",
  visuelVignetteAide:
    "Facultative pour une vidéo, mais vivement conseillée : sans elle, la vignette de la galerie n'affiche qu'une plaque d'accent et le titre.",
  visuelVignette: "Vignette d'attente",
  visuelAucun: "Aucun visuel attaché.",
  visuelAjouter: "Ajouter le visuel",
  visuelRemplacer: "Remplacer le visuel",
  visuelRemplacement: "Remplacement…",
  visuelRemplacerAide:
    "Le nouveau visuel prend la place de l'ancien, qui est retiré du stockage. Toutes les informations de la fiche sont conservées, et l'adresse publique change.",
  stockageAbsent:
    "Stockage des fichiers non configuré : le dépôt est indisponible tant que CLOUDINARY_URL n'est pas renseignée dans l'environnement.",

  /* --- Vidéo ---------------------------------------------------------------
     Une seule voie : le fichier téléversé. L'identifiant YouTube et l'adresse
     saisie à la main ont été retirés — ils demandaient une saisie par vidéo, ce
     que le module refuse par principe, et n'ont jamais servi. */
  blocVideo: "Fichier vidéo",
  champVideoFichier: "Vidéo à téléverser",
  champVideoFichierAide: (max: string) =>
    `MP4 ou WebM · ${max} maximum. La vignette d'attente et la durée sont relevées automatiquement — rien à saisir.`,
  videoSourceActuelle: "Fichier en place",
  videoSourceAucune: "Aucun fichier : la vidéo ne peut pas être rendue visible.",
  videoSourceFichier: "Vidéo téléversée",
  videoEnregistrer: "Téléverser la vidéo",
  videoRemplacer: "Remplacer la vidéo",
  videoEnregistrement: "Téléversement…",
  videoOuvrir: "Ouvrir la vidéo",
  videoDuree: "Durée",

  /* --- Albums --------------------------------------------------------------
     Un album est un REPORTAGE : les photos et les vidéos d'un même événement,
     d'une même mission, d'un même chantier. À ne pas confondre avec la rubrique,
     qui est une nomenclature stable et sert de filtre : l'album « Atelier de
     Goma, mars 2026 » se range DANS la rubrique « Événements ». */
  albumsTitle: "Albums",
  albumsLead:
    "Les reportages de la galerie : un album rassemble les photos et les vidéos d'un même événement. Il porte sa date, son lieu et sa propre page sur le site. Une entrée peut aussi vivre hors de tout album — la photo isolée d'un chantier n'a pas besoin d'un reportage autour d'elle.",
  albumsVide: "Aucun album pour le moment.",
  albumNouveau: "Créer un album",
  albumModifier: "Modifier l'album",
  albumRetour: "Retour aux albums",
  albumCreeOk: "Album créé, masqué pour l'instant. Versez-y vos photos, puis publiez-le.",
  albumSupprimerConfirm:
    "Supprimer cet album ? Les photos et vidéos qu'il contient NE sont pas supprimées : elles restent dans la galerie, sans album.",
  albumSupprimer: "Supprimer l'album",
  albumVoirSite: "Voir l'album sur le site",
  albumVoirSiteIndisponible: "La page de l'album sera accessible une fois qu'il sera publié.",
  albumSansContenu: "Cet album est encore vide. Versez-y vos photos et vidéos ci-dessus.",
  albumCompte: (n: number) => `${n} contenu${n > 1 ? "s" : ""}`,

  champAlbumTitreFr: "Titre de l'album (français)",
  champAlbumTitreFrAide: "Le nom de l'événement couvert : « Atelier régional de Goma ».",
  champAlbumTitreEn: "Titre de l'album (anglais)",
  champAlbumDescriptionFr: "Présentation (français)",
  champAlbumDescriptionPlaceholder: "Deux ou trois phrases : ce qui s'est passé, et pourquoi cela compte.",
  champAlbumDescriptionEn: "Présentation (anglais)",
  champAlbumDate: "Date de l'événement",
  champAlbumDateAide: "Elle situe le reportage et ordonne les albums entre eux.",
  champAlbumDateFin: "Fin de la période",
  champAlbumDateFinAide:
    "À renseigner seulement si le reportage s'étale sur plusieurs jours : le site affiche alors « 12 – 14 mars 2026 ».",
  champAlbumSlug: "Identifiant d'URL",
  champAlbumSlugAide:
    "Il forme l'adresse publique de l'album (/gallery/…). Laissé vide, il est déduit du titre. Le modifier casse les liens déjà partagés.",
  champAlbumUne: "Mettre l'album en avant",
  champAlbumUneAide: "L'album remonte en tête du bandeau de la galerie.",
  champAlbumStatutAide:
    "Un album ne peut être publié que s'il contient au moins un média visible : une page d'album vide n'aurait rien à montrer.",

  /* --- Contenus d'un album --------------------------------------------------
     ⚠️ Aucun libellé de SAISIE ici, et ce n'est pas un oubli : les informations
     vivent sur l'album. Les médias ne portent que des gestes d'accrochage. */
  contenuTitre: "Contenus de l'album",
  contenuLead:
    "Dans l'ordre où ils paraîtront. Rien à saisir : les informations sont celles de l'album. Survolez une vignette pour la déplacer, la choisir en couverture, la masquer ou la retirer.",
  contenuResume: (total: number, videos: number, masques: number) => {
    const parts = [`${total} média${total > 1 ? "s" : ""}`];
    if (videos > 0) parts.push(`dont ${videos} vidéo${videos > 1 ? "s" : ""}`);
    if (masques > 0) parts.push(`${masques} masqué${masques > 1 ? "s" : ""}`);
    return parts.join(" · ");
  },
  contenuCouverture: "Couverture",
  contenuDefinirCouverture: "Choisir comme couverture",
  contenuCouvertureAuto: "Couverture automatique",
  contenuCouvertureAutoAide:
    "Sans choix explicite, la couverture est le premier média de l'album.",
  contenuMonter: "Monter",
  contenuDescendre: "Descendre",
  contenuMasque: "Masqué",
  contenuMasquer: "Masquer ce média",
  contenuMontrer: "Remontrer ce média",
  contenuRetirer: "Retirer de l'album",
  contenuRetirerConfirm:
    "Retirer ce contenu de l'album ? Il n'est pas supprimé : il reste dans la galerie, sans album.",
  contenuDetails: "Détails (facultatif)",
  contenuSansSource: "Vidéo sans source",

  /* --- Versement en série --------------------------------------------------- */
  versementTitre: "Verser des médias dans l'album",
  versementAide:
    "Sélectionnez d'un coup autant de photos et de vidéos que vous voulez, mélangées. Elles partent trois à la fois, une par envoi : un fichier lourd ne bloque pas les autres, et un échec ne fait perdre que le sien. Aucune information à saisir — chaque média hérite de la rubrique, de la date, du lieu et des composantes de l'album, et devient visible dès que l'album l'est.",
  versementChoisir: "Photos et vidéos à verser",
  versementFormats: (maxImage: string, maxVideo: string) =>
    `Photos JPEG, PNG, WebP, AVIF ou GIF · ${maxImage} maximum. Vidéos MP4 ou WebM · ${maxVideo} maximum — compressez les films plus lourds avant de les verser.`,
  versementLancer: "Verser dans l'album",
  versementVider: "Vider la liste",
  versementEnCours: (fait: number, total: number) => `Versement… ${fait} / ${total}`,
  versementCompte: (termines: number, restants: number, erreurs: number, total: number) => {
    const parts = [`${termines} / ${total} versé${termines > 1 ? "s" : ""}`];
    if (restants > 0) parts.push(`${restants} restant${restants > 1 ? "s" : ""}`);
    if (erreurs > 0) parts.push(`${erreurs} en erreur`);
    return parts.join(" · ");
  },
  versementPhotoTag: "Photo",
  versementVideoTag: "Vidéo",

  champAlbum: "Album",
  champAlbumAide: "Le reportage auquel ce contenu appartient. Facultatif.",
  sansAlbum: "Hors album",
  gererAlbums: "Gérer les albums →",

  /* --- Rubriques ----------------------------------------------------------- */
  rubriquesTitle: "Rubriques de la galerie",
  rubriquesLead: "Une seule par contenu. Elles alimentent les filtres et la pastille des vignettes sur la page publique.",
  rubriquesVide: "Aucune rubrique.",
  champNomFr: "Libellé français",
  champNomEn: "Libellé anglais",
  champNomEnAide: "Laissé vide, le libellé français est repris.",
  champSlug: "Identifiant d'URL",
  champSlugAide: "Il apparaît dans l'adresse du filtre public (?rubrique=…). Laissé vide, il est déduit du libellé.",
  champCouleur: "Couleur",
  champCouleurAide: "Hexadécimal (#0f62fe). Vide : l'accent du site.",
  champOrdre: "Ordre",
  /** Bouton d'ajout d'une rubrique — distinct de l'ajout d'un contenu. */
  ajouterRubrique: "Ajouter",
  colUsage: "Contenus",
  supprimerRubriqueConfirm:
    "Supprimer cette rubrique ? Les contenus concernés resteront en ligne, sans rubrique.",
} as const;

/**
 * Module « Histoires & impact ».
 *
 * Séparé de l'objet `ADMIN` pour la même raison que `ADMIN_ACTUS` et
 * `ADMIN_EVTS` : il est lu par des composants clients (fiche de section,
 * formulaires d'entrée) qu'on ne veut pas voir embarquer le vocabulaire des
 * autres écrans.
 *
 * Le vocabulaire recoupe volontairement celui des deux autres modules là où le
 * geste est le même (publier, dupliquer, traduire) : deux modules qui se
 * ressemblent doivent se dire pareil, sinon la console s'apprend deux fois.
 */
export const ADMIN_IMPACT = {
  title: "Histoires & impact",
  lead: "Les blocs qui racontent d'où vient le Projet et ce qu'il change : chiffres d'impact, témoignages, dialogues sectoriels, diptyques avant/après et frise des jalons. Chaque section existe en français et en anglais ; une langue non traduite est signalée et n'est jamais servie au public.",

  /* --- Liste --------------------------------------------------------------- */
  nouveau: "Nouvelle section",
  listeVide: "Aucune section pour le moment.",
  listeVideFiltre: "Aucune section ne correspond à ce filtre.",
  filtrer: "Filtrer",
  reinitialiser: "Tout afficher",
  tousStatuts: "Tous les états",
  tousEmplacements: "Tous les emplacements",
  tousGabarits: "Tous les gabarits",

  colSection: "Section",
  colStatut: "État",
  colEmplacement: "Emplacement",
  colGabarit: "Gabarit",
  colLangues: "Langues",
  colEntrees: "Entrées",
  colOrdre: "Ordre",

  sansTitre: "(sans titre)",
  reprise: "reprend une autre section",
  repriseDe: (nom: string) => `Entrées reprises de « ${nom} ».`,

  publier: "Publier",
  depublier: "Retirer du site",
  dupliquer: "Dupliquer",
  supprimer: "Supprimer",
  supprimerConfirm: "Supprimer définitivement cette section, ses entrées et toutes leurs traductions ? Cette action est irréversible.",
  retourListe: "Retour aux histoires & impact",

  creeOk: "Section créée. Ajoutez ses entrées puis publiez-la.",
  copieOk: "Copie créée en brouillon.",
  supprimeOk: "Section supprimée.",

  /* --- Langues ------------------------------------------------------------- */
  langueRedaction: "Langue de rédaction",
  langueRedactionAide:
    "La section naît dans cette langue. Les autres versions s'ajoutent ensuite depuis la fiche, chacune enregistrée séparément.",
  tradPresente: "traduit",
  tradIncomplete: "incomplet",
  tradManquante: "à traduire",
  tradNouvelle: (langue: string) =>
    `Cette version ${langue} n'existe pas encore. Renseignez-la puis enregistrez-la : elle ne touchera à aucune autre langue.`,
  enregistrerLangue: (langue: string) => `Enregistrer la version ${langue}`,
  enregistrerFiche: "Enregistrer les réglages",
  supprimerTraduction: "Supprimer cette traduction",
  supprimerTraductionConfirm:
    "Supprimer cette version linguistique ? La section restera en ligne dans les autres langues.",
  majLe: "Modifié le",
  creer: "Créer la section",
  creation: "Création…",

  /* --- En-tête de section -------------------------------------------------- */
  blocEntete: "En-tête de la section",
  champKicker: "Libellé de section",
  champKickerAide: "La petite ligne en capitales au-dessus du titre (« Impact humain »).",
  champTitre: "Titre",
  champTitreAide: "Sert de titre H2 sur la page. Laissé vide, la section n'affiche que son libellé.",
  champLead: "Chapô",
  champLeadAide: "Le paragraphe d'introduction sous le titre.",
  champCtaLabel: "Libellé du bouton",
  champCtaLabelAide: "N'apparaît que si un lien est renseigné dans les réglages.",

  /* --- Réglages de la section ---------------------------------------------- */
  blocPublication: "Publication",
  champStatut: "État",
  champEmplacement: "Emplacement",
  champEmplacementAide: "La page et l'endroit exact où la section s'insère.",
  champGabarit: "Gabarit des entrées",
  champGabaritAide: "Il décide du dessin de la grille et des champs demandés pour chaque entrée.",
  champPosition: "Ordre",
  champPositionAide: "Entre plusieurs sections du même emplacement. Le plus petit passe en premier.",

  blocApparence: "Apparence",
  champTheme: "Fond de la section",
  champNumero: "Numéro de section",
  champNumeroAide: "Le chiffre affiché entre crochets devant le libellé (« [ 03 ] »). Vide : aucun.",
  champCompact: "Section resserrée",
  champCompactAide: "Réduit l'espace vertical autour de la section.",
  champGrandTitre: "Grand titre",
  champGrandTitreAide: "La taille des titres majeurs de l'accueil, plutôt que celle des sections secondaires.",

  blocLien: "Bouton d'en-tête",
  champCtaUrl: "Lien",
  champCtaUrlAide: "Chemin interne sans la langue (« /projet ») ou adresse complète. Vide : aucun bouton.",

  blocReprise: "Entrées",
  champSource: "Reprendre les entrées d'une autre section",
  champSourceAide:
    "Les mêmes témoignages s'affichent sur l'accueil et sur la page des résultats. Les rattacher à une seule section évite de les corriger deux fois.",
  sansSource: "Entrées propres à cette section",
  champLimite: "Nombre maximal d'entrées",
  champLimiteAide: "0 : toutes les entrées de la section.",

  /* --- Entrées ------------------------------------------------------------- */
  itemsTitle: "Entrées de la section",
  itemsVide: "Aucune entrée. Ajoutez-en une pour que la section puisse être publiée.",
  itemsReprise: "Cette section n'a pas d'entrées propres : elle affiche celles de sa source. Modifiez-les depuis la section source.",
  itemAjouter: "Ajouter une entrée",
  itemSansTitre: "Entrée sans titre",
  itemMonter: "Monter",
  itemDescendre: "Descendre",
  itemSupprimer: "Supprimer l'entrée",
  itemSupprimerConfirm: "Supprimer cette entrée et toutes ses traductions ?",
  itemReglages: "Réglages de l'entrée",
  itemStatut: "Affichage",
  itemUne: "Mettre en avant",
  itemUneAide: "Ajoute un liseré d'accent. L'ordre de la grille ne change pas.",
  itemPosition: "Rang",
  itemCouleur: "Couleur d'accent",
  itemCouleurAide: "Sans couleur, l'entrée prend l'accent du site.",
  itemVideo: "Vidéo",
  itemVideoAide: "Identifiant YouTube. Le portrait devient alors cliquable et ouvre la vidéo.",
  itemDate: "Date du jalon",
  itemDateAide: "Sert à ranger la frise et s'affiche dans la langue de lecture.",
  itemLien: "Lien sortant",
  itemLienLabel: "Libellé du lien",
  itemVisuel: "Visuel",
  itemAlt: "Texte alternatif du visuel",
  itemAltAide: "Décrit l'image pour les lecteurs d'écran et quand elle ne se charge pas.",
  aucunVisuel: "Aucun visuel",
  choisirVisuel: "Choisir un visuel",
  changerVisuel: "Changer",
  retirerVisuel: "Retirer",
  visuelPartage: "Le visuel et la vidéo valent pour toutes les langues. Seul le texte alternatif se traduit.",

  enregistrer: "Enregistrer",
  enregistrement: "Enregistrement…",
  voirSite: "Voir sur le site",
  voirSiteIndisponible: "La page publique s'ouvrira une fois la section publiée et traduite.",
} as const;

/* ===========================================================================
   Module « L'équipe de l'Unité »
   =========================================================================== */

export const ADMIN_EQUIPE = {
  title: "L'équipe de l'Unité",
  lead: "Les personnes et les postes de l'Unité. Une fiche vaut pour les quatre endroits où le site montre l'équipe : la grille de l'accueil, la page « L'Unité », les cartes de coordination de « Gouvernance » et le profil du responsable d'une composante. Chaque fiche existe en français et en anglais ; une langue non traduite est signalée et n'est jamais servie au public.",

  /* --- Liste --------------------------------------------------------------- */
  nouveau: "Nouveau membre",
  listeVide: "Aucune fiche pour le moment.",
  listeVideFiltre: "Aucune fiche ne correspond à ce filtre.",
  filtrer: "Filtrer",
  reinitialiser: "Tout afficher",
  tousStatuts: "Tous les états",
  tousPoles: "Tous les pôles",
  toutesComposantes: "Toutes les composantes",

  colMembre: "Membre",
  colStatut: "État",
  colPole: "Pôle",
  colFonction: "Fonction",
  colLangues: "Langues",
  colOu: "Affiché sur",
  colOrdre: "Ordre",

  posteVacant: "Poste à pourvoir",
  sansPole: "Sans pôle",
  sansFonction: "(fonction non renseignée)",

  /* Où la fiche s'affiche, déduit de son état plutôt que coché à la main. */
  ouGrille: "Grille",
  ouGrilleAide: "Accueil et page « L'Unité ».",
  ouCoordination: "Coordination",
  ouCoordinationAide: "Cartes de la page « Gouvernance ».",
  ouComposante: (code: string) => `Composante ${code}`,
  ouRien: "Nulle part tant que la fiche est masquée.",

  publier: "Publier",
  depublier: "Retirer du site",
  supprimer: "Supprimer",
  supprimerConfirm:
    "Supprimer définitivement cette fiche et toutes ses traductions ? Elle disparaîtra des quatre emplacements du site. Cette action est irréversible.",
  retourListe: "Retour à l'équipe",

  creeOk: "Fiche créée. Complétez-la puis publiez-la.",
  supprimeOk: "Fiche supprimée.",

  monter: "Monter",
  descendre: "Descendre",
  ordreAide:
    "L'ordre de la grille porte la hiérarchie de l'Unité : il ne se déduit ni de l'alphabet ni de la date de saisie.",

  /* --- Langues ------------------------------------------------------------- */
  langueRedaction: "Langue de rédaction",
  langueRedactionAide:
    "La fiche naît dans cette langue. L'autre version s'ajoute ensuite depuis la fiche, enregistrée séparément.",
  tradPresente: "traduit",
  tradManquante: "à traduire",
  tradNouvelle: (langue: string) =>
    `Cette version ${langue} n'existe pas encore. Renseignez-la puis enregistrez-la : elle ne touchera à aucune autre langue.`,
  enregistrerLangue: (langue: string) => `Enregistrer la version ${langue}`,
  enregistrerFiche: "Enregistrer les réglages",
  supprimerTraduction: "Supprimer cette traduction",
  supprimerTraductionConfirm:
    "Supprimer cette version linguistique ? La fiche restera en ligne dans les autres langues.",
  majLe: "Modifié le",
  creer: "Créer la fiche",
  creation: "Création…",

  /* --- Profil (par langue) ------------------------------------------------- */
  blocProfil: "Profil",

  /* --- Réglages de la fiche ------------------------------------------------ */
  blocPublication: "Publication",
  champStatut: "État",
  champNom: "Nom",
  champNomAide:
    "Le nom d'usage, identique dans les deux langues. Laissé vide, la fiche décrit un poste à pourvoir : le site affiche l'intitulé et une pastille d'initiales.",
  champPosition: "Ordre",
  champPositionAide: "Le plus petit passe en premier dans la grille.",

  blocRattachement: "Rattachement",
  champPole: "Pôle",
  champPoleAide: "Le libellé affiché sous la fonction, dans la grille comme sur les cartes.",
  champComposante: "Responsable d'une composante",
  champComposanteAide:
    "Installe cette fiche sur la page publique de la composante choisie, avec sa biographie et sa citation. Une seule fiche par composante.",
  sansComposante: "Aucune",

  blocMiseEnAvant: "Mise en avant",
  champFeatured: "Afficher parmi les cartes de coordination",
  champFeaturedAide:
    "Ajoute la fiche à la page « Gouvernance », avec ses responsabilités. Sa place dans la grille ne change pas.",
  champCouleur: "Couleur d'accent",
  champCouleurAide: "Liseré de la carte de coordination. Sans couleur, celle du pôle, puis l'accent du site.",

  blocContact: "Contact",
  champEmail: "Adresse de contact",
  champEmailAide:
    "Publiée sur la fiche de composante. Vide, l'adresse générale de l'Unité s'affiche à la place.",

  blocPortrait: "Portrait",
  champPhotoPath: "Chemin du portrait",
  champPhotoPathAide:
    "Pour les portraits servis depuis le dossier public (« /portraits/… »). Un portrait choisi dans la bibliothèque l'emporte sur ce champ.",
  aucunPortrait: "Aucun portrait",
  choisirPortrait: "Choisir un portrait",
  changerPortrait: "Changer",
  retirerPortrait: "Retirer",
  portraitPartage:
    "Le portrait vaut pour toutes les langues. Sans portrait, les cartes affichent les initiales de la fonction — c'est un état prévu par le dessin du site.",

  /* --- Pôles --------------------------------------------------------------- */
  polesTitle: "Pôles",
  polesLead:
    "Les pôles regroupent les fiches et donnent la ligne affichée sous chaque fonction. Les modifier ne touche pas aux fiches qui s'y rattachent.",
  polesLien: "Gérer les pôles",
  polesRetour: "Retour aux fiches",
  poleNouveau: "Nouveau pôle",
  poleNom: "Nom",
  poleMission: "Mission",
  poleMissionAide: "Ce dont le pôle répond, en une ligne. Affiché sur la page « L'Unité ».",
  poleCouleur: "Couleur d'accent",
  poleMembres: "Fiches rattachées",
  poleSupprimer: "Supprimer le pôle",
  poleSupprimerConfirm: "Supprimer ce pôle ? Les fiches rattachées le perdront sans être supprimées.",
  poleVide: "Aucun pôle pour le moment.",
  poleFr: "Français",
  poleEn: "English",
  poleEnAide: "Nom anglais effacé, le pôle n'apparaît plus sur la version anglaise du site.",

  enregistrer: "Enregistrer",
  enregistrement: "Enregistrement…",
  voirSite: "Voir la grille sur le site",
} as const;

/**
 * Accents proposés par le sélecteur de couleur de la console.
 *
 * Ce ne sont pas des couleurs « jolies » mais celles que le site emploie
 * réellement : les cinq accents de composante (cf. `compColors` dans
 * content/data.ts) et les trois teintes d'état du design system. Les proposer
 * d'emblée évite le geste qui abîme une charte — ouvrir une roue chromatique et
 * choisir un bleu qui n'est pas LE bleu.
 *
 * La saisie libre reste ouverte à côté : une catégorie peut légitimement sortir
 * de la palette, mais ce sera un choix, pas un accident.
 */
export const PALETTE_ACCENT: { hex: string; nom: string }[] = [
  { hex: "#0f62fe", nom: "Bleu (accent du site, C1)" },
  { hex: "#009d9a", nom: "Turquoise (C2)" },
  { hex: "#8a3ffc", nom: "Violet (C3)" },
  { hex: "#ee5396", nom: "Rose (C4)" },
  { hex: "#6f6f6f", nom: "Gris (C5)" },
  { hex: "#198038", nom: "Vert" },
  { hex: "#ff832b", nom: "Orange" },
  { hex: "#da1e28", nom: "Rouge" },
];

/** Un module de la console. `key` est aussi la permission qui l'ouvre. */
export type AdminNavItem = {
  key: Permission;
  label: string;
  /** Absent tant que le module n'est pas implémenté. */
  slug?: string;
  soon?: boolean;
};

export type AdminNavSection = {
  key: string;
  label: string;
  items: AdminNavItem[];
};

/**
 * Les modules du back-office (reference/UGPTN-GUIDE-DEV.md §8.2), groupés par
 * section. Le groupement n'est pas cosmétique : à quatorze entrées, une liste
 * plate oblige à relire toute la barre pour situer un module.
 *
 * La barre latérale masque les sections dont aucun module n'est autorisé, donc
 * l'ordre ici détermine aussi ce que voit un compte à droits réduits.
 */
export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    key: "pilotage",
    label: "Pilotage",
    items: [{ key: "tableau-de-bord", label: "Tableau de bord", slug: "/dashboard" }],
  },
  {
    key: "marches",
    label: "Marchés & recours",
    items: [
      { key: "marches", label: "Appels d'offres", soon: true },
      { key: "soumissionnaires", label: "Soumissionnaires", soon: true },
      { key: "mgp", label: "Plaintes (MGP)", slug: "/grievances" },
    ],
  },
  {
    key: "contenus",
    label: "Contenus",
    items: [
      { key: "actualites", label: "Actualités", slug: "/news" },
      /* L'entrée « Ressources & publications » a longtemps figuré ici en
         attente, à côté d'un module « Rapports & analyses » qui faisait déjà le
         travail. Les deux ont fusionné : un seul module, sous le nom attendu. */
      { key: "documents", label: "Ressources & publications", slug: "/documents" },
      { key: "medias", label: "Médias", slug: "/media" },
      { key: "evenements", label: "Événements", slug: "/events" },
      { key: "histoires", label: "Histoires & impact", slug: "/stories" },
      { key: "videos", label: "Vidéos & galeries", slug: "/gallery" },
    ],
  },
  {
    key: "diffusion",
    label: "Diffusion",
    items: [{ key: "newsletter", label: "Newsletter", slug: "/newsletter" }],
  },
  {
    key: "institution",
    label: "Institution",
    items: [
      { key: "equipe", label: "L'équipe de l'Unité", slug: "/equipe" },
      { key: "gouvernance", label: "Gouvernance", soon: true },
      { key: "projet", label: "Le projet", soon: true },
    ],
  },
  {
    key: "administration",
    label: "Administration",
    items: [
      { key: "utilisateurs", label: "Utilisateurs", slug: "/users" },
      { key: "reglages", label: "i18n & réglages", soon: true },
    ],
  },
];

/** Vue à plat, pour les écrans qui listent les modules sans les grouper. */
export const ADMIN_NAV: AdminNavItem[] = ADMIN_NAV_SECTIONS.flatMap((section) => section.items);

/** Libellé d'un module par sa permission — cases à cocher du module Utilisateurs. */
export const MODULE_LABEL: Record<string, string> = Object.fromEntries(
  ADMIN_NAV.map((item) => [item.key, item.label]),
);

/** KPIs du tableau de bord (§8.2.1) — valeurs branchées au jalon Prisma. */
export const ADMIN_KPIS = [
  { key: "avis", label: "Avis ouverts" },
  { key: "plaintes", label: "Plaintes en cours" },
  { key: "articles", label: "Articles publiés" },
  { key: "events", label: "Événements à venir" },
];
