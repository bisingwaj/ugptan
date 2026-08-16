/* ============================================================================
   Page « Le projet » — contenu d'origine du site, repris à l'identique.

   Rôle et invariants : cf. l'en-tête de `index.ts`.

   Provenance, bloc par bloc :
     · contexte, chiffres ....... `content/i18n.ts` (`dict().projet`)
     · pour qui ................. `content/carbon.ts` (`projetPersonas`)
     · questions citoyennes ..... `content/carbon.ts` (`citoyenFaq`)
     · en-têtes d'aperçu ........ `content/i18n.ts` (`projet`, `comp`, `cta`)

   ⚠️ Deux blocs de cette page N'Y SONT PAS : la frise des jalons et le diptyque
   « Ce que ça change » appartiennent au module « Histoires & impact », qui les
   administre depuis l'origine (cf. `EMPLACEMENT_MODULE`).

   Ce que la console ne touche pas : les cinq composantes et les indicateurs
   ODP. Ce sont des données de structure du Projet, tenues par le manuel
   d'exécution ; seuls leurs en-têtes se rédigent ici.
   ========================================================================== */
import type { ImpactSeedSection } from "./types";

export const projetSeed: ImpactSeedSection[] = [
  /* --- Contexte & raison d'être ------------------------------------------- */
  {
    key: "projet-contexte",
    emplacement: "PROJET_CONTEXTE",
    layout: "CONTEXTE",
    theme: "CLAIR",
    position: 0,
    fr: {
      kicker: "Contexte & raison d'être",
      titre: "Le retard n'est pas technologique. Il est géographique, énergétique et institutionnel.",
      lead: "Les technologies de réseau sont disponibles et éprouvées ; ce qui manque, ce sont les conditions qui les rendent rentables à déployer. Un territoire de 2,3 millions de kilomètres carrés, une population dispersée, une électrification partielle et des systèmes publics conçus séparément les uns des autres : chacun de ces facteurs renchérit l'accès ou empêche l'usage. Le projet s'ancre dans l'approche régionale APM IDEA, qui mutualise l'intégration numérique de l'Afrique orientale et australe — parce que la capacité internationale et les corridors de transit se négocient à l'échelle de la région, pas d'un pays isolé.",
      /* Cette légende était le seul texte de la page écrit en dur dans le JSX,
         hors du dictionnaire (cf. l'ancien `project/page.tsx`). */
      note: "Déploiement fibre optique · inclusion numérique",
    },
    en: {
      kicker: "Context & rationale",
      titre: "The gap is not technological. It is geographic, energy-related and institutional.",
      lead: "Network technologies are available and proven; what is missing are the conditions that make them viable to deploy. A territory of 2.3 million square kilometres, a dispersed population, partial electrification, and public systems designed independently of one another: each of these factors raises the cost of access or prevents its use. The project is anchored in the regional APM IDEA approach, which pools digital integration across Eastern and Southern Africa — because international capacity and transit corridors are negotiated at regional, not national, scale.",
      note: "Fibre rollout · digital inclusion",
    },
    items: [
      {
        valeur: "6,56",
        fr: { surtitre: "kbit/s", texte: "Bande passante intl./hab. au démarrage" },
        en: { surtitre: "kbit/s", texte: "Intl. bandwidth per capita at start" },
      },
      {
        valeur: "26",
        fr: { texte: "provinces · 2,3 M km²" },
        en: { texte: "provinces · 2.3M km²" },
      },
      {
        valeur: "2029",
        fr: { texte: "horizon de la transformation" },
        en: { texte: "horizon of the transformation" },
      },
    ],
  },

  /* --- Pour qui ----------------------------------------------------------- */
  {
    key: "projet-pour-qui",
    emplacement: "PROJET_POUR_QUI",
    layout: "PERSONAS",
    theme: "CLAIR",
    position: 0,
    fr: { kicker: "Pour qui ?", titre: "À qui cela profite, et à quelle condition." },
    en: { kicker: "Who benefits", titre: "Who benefits, and on what condition." },
    items: [
      {
        fr: {
          titre: "Citoyens",
          texte: "Moins de pièces à réunir et moins de déplacements — à condition que les registres publics puissent se parler et qu'une identité fiable existe.",
        },
        en: {
          titre: "Citizens",
          texte: "Fewer documents to gather and fewer journeys — provided public registries can talk to each other and a reliable identity exists.",
        },
      },
      {
        fr: {
          titre: "Jeunes & étudiants",
          texte: "Des parcours techniques alignés sur les métiers qui recrutent, dans des établissements équipés et raccordés — la qualification vaut par le signal qu'elle donne à l'employeur.",
        },
        en: {
          titre: "Youth & students",
          texte: "Technical pathways aligned with the trades that are hiring, in equipped and connected institutions — a qualification is worth the signal it sends to employers.",
        },
      },
      {
        fr: {
          titre: "Femmes",
          texte: "Une part suivie et rapportée dans la formation comme dans l'entrepreneuriat : l'inclusion est une cible mesurée, pas une intention affichée.",
        },
        en: {
          titre: "Women",
          texte: "A share that is tracked and reported, in training as in entrepreneurship: inclusion is a measured target, not a stated intention.",
        },
      },
      {
        fr: {
          titre: "Entrepreneurs & startups",
          texte: "Un financement versé au fil de jalons atteints, et des équipements mutualisés en centre d'innovation plutôt qu'à acquérir seul.",
        },
        en: {
          titre: "Entrepreneurs & startups",
          texte: "Financing released as milestones are met, and equipment pooled in innovation centres rather than bought alone.",
        },
      },
      {
        fr: {
          titre: "Communautés rurales",
          texte: "Une couverture là où le calcul commercial ne mène pas, et une consultation préalable lorsque les travaux traversent leurs terres.",
        },
        en: {
          titre: "Rural communities",
          texte: "Coverage where commercial logic does not lead, and prior consultation where works cross their land.",
        },
      },
      {
        fr: {
          titre: "Services publics",
          texte: "Des briques communes — identité, échange de données, hébergement, sécurité — qui évitent à chaque ministère de reconstruire les mêmes fonctions.",
        },
        en: {
          titre: "Public services",
          texte: "Shared building blocks — identity, data exchange, hosting, security — that spare each ministry from rebuilding the same functions.",
        },
      },
    ],
  },

  /* --- Aperçu des composantes : l'en-tête seul ---------------------------- */
  {
    key: "projet-composantes",
    emplacement: "PROJET_COMPOSANTES",
    layout: "COMPOSANTES",
    theme: "GRIS",
    position: 0,
    ctaUrl: "/components",
    fr: {
      kicker: "Les cinq composantes",
      titre: "Cinq composantes, un seul projet.",
      lead: "Le projet se découpe en cinq volets, dont chacun a sa page : périmètre, objectifs, projets phares et responsable.",
      ctaLabel: "Découvrir les 5 composantes",
    },
    en: {
      kicker: "The five components",
      titre: "Five components, one project.",
      lead: "The project is split into five strands, each with its own page: scope, objectives, flagship projects and lead.",
      ctaLabel: "Explore the 5 components",
    },
    items: [],
  },

  /* --- Aperçu des résultats : l'en-tête seul ------------------------------ */
  {
    key: "projet-resultats",
    emplacement: "PROJET_RESULTATS",
    layout: "INDICATEURS",
    theme: "SOMBRE",
    position: 0,
    ctaUrl: "/results",
    fr: {
      kicker: "Ce que nous nous engageons à mesurer",
      titre: "Des ambitions chiffrées, revues au fil de l'exécution.",
      ctaLabel: "Voir le cadre de résultats",
    },
    en: {
      kicker: "What we commit to measuring",
      titre: "Quantified ambitions, reviewed as implementation proceeds.",
      ctaLabel: "See the results framework",
    },
    items: [],
  },

  /* --- Le projet & vous --------------------------------------------------- */
  {
    key: "projet-questions",
    emplacement: "PROJET_QUESTIONS",
    layout: "FAQ",
    theme: "GRIS",
    position: 0,
    fr: { kicker: "Le projet & vous", titre: "Les questions qu'on nous pose, et nos réponses." },
    en: { kicker: "The project & you", titre: "The questions we are asked, and our answers." },
    items: [
      {
        fr: {
          titre: "En quoi ce projet me concerne-t-il, concrètement ?",
          texte: "De trois façons, selon votre situation : le réseau se rapproche de chez vous, les démarches qui exigeaient un déplacement passent progressivement en ligne, et des formations techniques s'ouvrent dans les établissements du pays. L'effet n'arrive pas partout en même temps : le déploiement suit un ordre de priorité publié.",
        },
        en: {
          titre: "How does this project concern me, concretely?",
          texte: "In three ways, depending on your situation: the network moves closer to you, procedures that required travel move progressively online, and technical training opens in the country's institutions. The effect does not reach everywhere at once: deployment follows a published order of priority.",
        },
      },
      {
        fr: {
          titre: "Quand verra-t-on les premiers effets ?",
          texte: "Par étapes, et pas dans le même ordre partout. Un marché d'infrastructure se prépare, se met en concurrence, s'attribue puis s'exécute : entre la publication d'un avis et la mise en service d'un tronçon, il s'écoule normalement plusieurs saisons. Les premiers marchés structurants sont lancés ; leur calendrier prévisionnel est publié sur la page Marchés.",
        },
        en: {
          titre: "When will the first effects be visible?",
          texte: "In stages, and not in the same order everywhere. An infrastructure contract is prepared, competed, awarded and then delivered: between the publication of a notice and a section entering service, several seasons normally pass. The first structuring contracts are under way; their indicative schedules are published on the Tenders page.",
        },
      },
      {
        fr: {
          titre: "Je vis loin d'une grande ville — suis-je concerné ?",
          texte: "Oui, et c'est même le sens de l'intervention publique : les zones que le marché dessert déjà n'ont pas besoin d'être subventionnées. La couverture vise les 26 provinces, avec une priorité donnée aux dix provinces du Cadre de Partenariat-Pays et aux localités non desservies.",
        },
        en: {
          titre: "I live far from a big city — am I included?",
          texte: "Yes — and that is precisely the point of public action: areas the market already serves do not need subsidising. Coverage targets all 26 provinces, with priority given to the ten Country Partnership Framework provinces and to underserved localities.",
        },
      },
      {
        fr: {
          titre: "Que puis-je faire si quelque chose ne va pas ?",
          texte: "Saisissez le Mécanisme de Gestion des Plaintes : formulaire en ligne, SMS, numéro vert gratuit, e-mail ou point focal en province. Le dépôt est gratuit, possible en plusieurs langues, et peut rester anonyme. Vous recevez un numéro de référence horodaté qui permet de suivre l'instruction ; l'Unité vise une réponse dans un délai de 30 jours. Un canal confidentiel distinct traite les cas de violences basées sur le genre.",
        },
        en: {
          titre: "What can I do if something goes wrong?",
          texte: "Use the Grievance Redress Mechanism: online form, SMS, free toll-free number, email or a provincial focal point. Filing is free, available in several languages, and may remain anonymous. You receive a timestamped reference number to follow the case; the Unit aims to reply within 30 days. A separate confidential channel handles gender-based violence cases.",
        },
      },
    ],
  },
];
