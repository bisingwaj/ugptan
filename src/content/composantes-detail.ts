/* ============================================================================
   Contenu ÉDITORIAL des pages dédiées par composante (cf. docs/PAGES-COMPOSANTES.md).
   Complète — sans jamais les dupliquer — les données canoniques du MEP
   (`composantes` dans data.ts : montants, IDA/AFD, sous-composantes).

   PROVENANCE DES TEXTES
   • C2 — texte institutionnel fourni par l'UGPTN (intégral). Fait foi.
   • C1, C3, C4, C5 — rédaction de mise en ligne, construite à partir du MEP,
     du cadre de résultats et du contenu déjà publié sur le site.
     >>> À VALIDER par la direction / la communication avant publication. <<<
   ========================================================================== */
import type { ComposanteDetail } from "./types";

export const composantesDetail: ComposanteDetail[] = [
  /* ======================================================================
     C1 — ACCÈS & INCLUSION NUMÉRIQUES                      [À VALIDER]
     ====================================================================== */
  {
    code: "C1",
    slug: "c1",
    img: "fibre",
    odp: ["ODP-1", "ODP-2"],
    titreLong: {
      fr: "Connecter le pays, du backbone national au dernier kilomètre",
      en: "Connecting the country, from the national backbone to the last mile",
    },
    soustitre: {
      fr: "Un accès à internet abordable, fiable et étendu aux 26 provinces — pour les citoyens, les écoles, les universités et les institutions publiques.",
      en: "Affordable, reliable internet access extended to all 26 provinces — for citizens, schools, universities and public institutions.",
    },
    problematique: {
      titre: {
        fr: "Le réseau s'arrête là où le marché cesse d'être rentable.",
        en: "The network stops where the market stops paying for itself.",
      },
      lead: {
        fr: "Le déficit de connectivité congolais n'est pas d'abord un problème de technologie : c'est un problème d'économie de la densité, aggravé par la contrainte énergétique. Tant que le coût de desservir un abonné reste supérieur à ce qu'il peut payer, aucun opérateur n'ira — et l'écart se creuse à mesure que le reste de l'économie se numérise.",
        en: "The Congolese connectivity gap is not first a technology problem: it is a problem in the economics of density, compounded by the energy constraint. As long as the cost of serving a subscriber exceeds what that subscriber can pay, no operator will go — and the gap widens as the rest of the economy digitalises.",
      },
      axes: [
        {
          t: { fr: "Une géographie qui multiplie les coûts fixes", en: "A geography that multiplies fixed costs" },
          d: {
            fr: "Sur 2,3 millions de kilomètres carrés, la population congolaise se répartit entre quelques pôles urbains denses et un semis de localités éloignées, souvent mal reliées par la route. Chaque kilomètre de fibre y coûte plus cher à poser, à protéger et à maintenir que dans un pays compact — et dessert moins d'abonnés une fois posé. C'est cette équation, et non un retard technique, qui explique une bande passante internationale de 6,56 kbit/s par habitant au démarrage du projet.",
            en: "Across 2.3 million square kilometres, the Congolese population is split between a few dense urban centres and a scattering of remote localities, often poorly served by road. Each kilometre of fibre costs more to lay, protect and maintain than in a compact country — and serves fewer subscribers once laid. That equation, not a technology lag, explains international bandwidth of 6.56 kbit/s per capita at project start.",
          },
        },
        {
          t: { fr: "Le prix payé par l'usager se décide en amont", en: "The price the user pays is set upstream" },
          d: {
            fr: "Faute de capacité de transport nationale suffisante, une part du trafic se paie en transit international ou en capacité satellitaire, aux tarifs les plus élevés de la chaîne. Ce coût de gros se répercute mécaniquement sur le détail ; le prix élevé contient l'usage ; l'usage faible ruine le dossier d'investissement qui aurait permis d'étendre le réseau. La boucle se referme sur elle-même, et la couverture s'arrête à la limite de rentabilité.",
            en: "For want of sufficient national transport capacity, part of the traffic is paid for in international transit or satellite capacity, at the highest tariffs in the chain. That wholesale cost feeds straight through to retail prices; high prices hold back usage; weak usage destroys the investment case that would have extended the network. The loop closes on itself, and coverage stops at the profitability line.",
          },
        },
        {
          t: { fr: "Une fracture qui s'aggrave à mesure que l'État se numérise", en: "A divide that widens as the State digitalises" },
          d: {
            fr: "Chaque service public porté en ligne devient, pour les territoires non couverts, un service de moins accessible qu'auparavant. Une école sans connexion ne peut pas ouvrir les ressources en ligne à ses élèves ; un centre de santé isolé reste hors du dossier partagé ; un commerçant sans réseau reste enfermé dans son marché de quartier. La modernisation, si elle n'est pas précédée par l'accès, produit de l'exclusion.",
            en: "Every public service moved online becomes, for uncovered territories, one more service that is less accessible than before. A school without a connection cannot open online resources to its pupils; an isolated health centre stays outside the shared record; a trader without a network stays confined to a neighbourhood market. Modernisation, if it is not preceded by access, produces exclusion.",
          },
        },
      ],
      appui: {
        fr: [
          "Les réseaux de transport présentent les caractéristiques classiques qui justifient un financement public : coûts fixes très élevés, coût marginal faible, rendements croissants et bénéfices largement captés par des tiers — écoles, hôpitaux, administrations, entreprises — qui ne participent pas à la décision d'investissement. Un opérateur isolé n'a aucune raison de porter seul une dorsale dont ses concurrents profiteront ; l'État, lui, a intérêt à ce qu'elle existe et soit ouverte à tous.",
          "Une partie de la réponse ne coûte d'ailleurs presque rien en investissement : le partage des infrastructures passives entre opérateurs, la simplification des droits de passage, la transparence des tarifs de gros et le suivi de la qualité de service font baisser les prix par la règle plutôt que par la dépense. La Composante 1 combine délibérément les deux leviers — poser des infrastructures, et corriger les conditions de marché qui les rendraient inutiles.",
          "Reste une contrainte que le secteur télécom ne peut pas résoudre seul : l'énergie. Un site radio sans alimentation fiable est un site hors service, et un point de présence sans secours électrique est un point de fragilité. Le déploiement s'appuie donc sur des solutions énergétiques dimensionnées pour les sites isolés, et se coordonne avec les politiques d'électrification.",
        ],
        en: [
          "Transport networks display the classic features that justify public financing: very high fixed costs, low marginal cost, increasing returns, and benefits largely captured by third parties — schools, hospitals, administrations, businesses — that take no part in the investment decision. A single operator has no reason to carry a backbone alone when its competitors will benefit from it; the State does have an interest in that backbone existing and being open to all.",
          "Part of the answer, moreover, costs almost nothing in capital: passive infrastructure sharing between operators, simpler rights of way, wholesale tariff transparency and quality-of-service monitoring bring prices down through rules rather than spending. Component 1 deliberately combines both levers — laying infrastructure, and correcting the market conditions that would otherwise render it useless.",
          "One constraint remains that the telecoms sector cannot solve alone: energy. A radio site without reliable power is an out-of-service site, and a point of presence without backup power is a point of fragility. Deployment therefore relies on energy solutions sized for isolated sites, and is coordinated with electrification policy.",
        ],
      },
      liens: [
        { code: "C2", t: { fr: "Les plateformes gouvernementales ne servent que les administrations effectivement raccordées : la connectivité est la condition matérielle de l'e-gouvernement.", en: "Government platforms only serve administrations that are actually connected: connectivity is the material precondition for e-government." } },
        { code: "C3", t: { fr: "Le raccordement des campus et des centres de formation conditionne l'accès aux ressources pédagogiques et la recherche appliquée.", en: "Connecting campuses and training centres conditions access to teaching resources and applied research." } },
        { t: { fr: "Énergie : l'électrification des sites isolés commande la disponibilité réelle du réseau.", en: "Energy: electrification of isolated sites governs the network's real availability." } },
        { t: { fr: "Régulation sectorielle : concurrence, partage d'infrastructures et droits de passage pèsent autant que l'investissement.", en: "Sector regulation: competition, infrastructure sharing and rights of way weigh as much as investment." } },
      ],
    },
    chapeau: {
      fr: [
        "La Composante 1 couvre la chaîne de la connectivité dans son entier : la capacité internationale qui ouvre le pays sur le réseau mondial, les dorsales de transmission qui relient les provinces, les réseaux régionaux qui irriguent les territoires, la couverture mobile des communautés non desservies, et le raccordement des institutions publiques au bout de cette chaîne. Chacun de ces maillons conditionne le suivant : c'est pourquoi ils relèvent d'une même composante et non de projets séparés.",
        "Elle intervient par deux leviers de nature différente, et c'est leur combinaison qui fait sa cohérence. Le premier est l'investissement dans des infrastructures de transport ouvertes, mises à disposition des opérateurs sur une base non discriminatoire. Le second est l'appui au cadre sectoriel — partage des infrastructures passives, droits de passage, transparence des tarifs de gros, suivi de la qualité de service — qui agit sur le prix payé par l'usager sans engager d'investissement supplémentaire.",
        "Son périmètre géographique est national, avec une priorisation assumée : les dix provinces du Cadre de Partenariat-Pays d'abord, puis les zones que le marché ne dessert pas spontanément. Le ciblage n'est pas seulement territorial ; il porte aussi sur les publics dont l'accès reste le plus contraint, notamment en milieu rural et parmi les femmes.",
        "La composante ne se substitue pas aux opérateurs : elle ne vend pas d'abonnement et n'exploite pas de réseau commercial. Elle crée les conditions — infrastructure de transport, règles du jeu, raccordement des institutions publiques — à partir desquelles des acteurs privés et des administrations peuvent, chacun dans son rôle, servir des usagers.",
      ],
      en: [
        "Component 1 covers the connectivity chain in full: the international capacity that opens the country to the global network, the transmission backbones that link the provinces, the regional networks that irrigate the territories, mobile coverage of underserved communities, and the connection of public institutions at the end of that chain. Each link conditions the next: hence a single component rather than separate projects.",
        "It works through two levers of different natures, and their combination is what gives it coherence. The first is investment in open transport infrastructure, made available to operators on a non-discriminatory basis. The second is support to the sector framework — passive infrastructure sharing, rights of way, wholesale tariff transparency, quality-of-service monitoring — which acts on the price paid by the user without requiring further investment.",
        "Its geographic scope is national, with an explicit prioritisation: the ten provinces of the Country Partnership Framework first, then the areas the market does not serve on its own. Targeting is not only territorial; it also concerns the groups whose access remains most constrained, particularly in rural areas and among women.",
        "The component does not stand in for operators: it sells no subscriptions and runs no commercial network. It creates the conditions — transport infrastructure, rules of the game, connection of public institutions — from which private actors and administrations can each, in their own role, serve users.",
      ],
    },
    objectifs: [
      { fr: "étendre les réseaux de transmission nationaux en fibre optique", en: "extend national fibre-optic transmission networks" },
      { fr: "améliorer la connectivité internationale et la bande passante disponible par habitant", en: "improve international connectivity and available bandwidth per capita" },
      { fr: "étendre la couverture mobile haut débit aux communautés non desservies", en: "extend mobile broadband coverage to underserved communities" },
      { fr: "raccorder les institutions publiques, les écoles et les universités", en: "connect public institutions, schools and universities" },
      { fr: "réduire le coût de l'accès à internet pour les ménages et les entreprises", en: "reduce the cost of internet access for households and businesses" },
      { fr: "renforcer le cadre réglementaire et les conditions de concurrence du secteur", en: "strengthen the sector's regulatory framework and competitive conditions" },
      { fr: "favoriser le partage des infrastructures entre opérateurs", en: "encourage infrastructure sharing between operators" },
      { fr: "mobiliser des capitaux privés en complément du financement public", en: "mobilise private capital alongside public financing" },
      { fr: "réduire les écarts d'accès entre zones urbaines et zones rurales", en: "reduce access gaps between urban and rural areas" },
      { fr: "améliorer l'inclusion numérique des femmes et des populations vulnérables", en: "improve the digital inclusion of women and vulnerable populations" },
    ],
    projets: [
      {
        n: "01", slug: "backbone-fibre", img: "fibre",
        titre: { fr: "Le backbone national en fibre optique", en: "The national fibre-optic backbone" },
        statut: { fr: "Infrastructure structurante", en: "Structuring infrastructure" },
        corps: {
          fr: [
            "L'extension des réseaux de transmission constitue la première brique de la connectivité nationale. Le projet vise le déploiement de plusieurs milliers de kilomètres de fibre optique additionnelle — de l'ordre de 10 000 km à l'horizon du projet —, en priorité sur les axes qui relient les provinces entre elles et aux points d'atterrissement internationaux.",
            "Ces liaisons de transport constituent l'ossature sur laquelle les opérateurs et les fournisseurs d'accès construisent ensuite leurs réseaux de distribution. Sans elles, la couverture de proximité reste coûteuse, instable et cantonnée aux grands centres urbains.",
          ],
          en: [
            "Extending transmission networks is the first building block of national connectivity. The project targets the deployment of several thousand kilometres of additional fibre optic — in the order of 10,000 km over the project horizon — prioritising the routes that link provinces to one another and to international landing points.",
            "These transport links form the backbone on which operators and service providers then build their distribution networks. Without them, local coverage remains costly, unstable and confined to major urban centres.",
          ],
        },
        points: [
          { fr: "de l'ordre de 10 000 km de fibre optique additionnelle", en: "in the order of 10,000 km of additional fibre optic" },
          { fr: "priorité aux axes interprovinciaux et aux corridors régionaux", en: "priority to interprovincial routes and regional corridors" },
          { fr: "ouverture des capacités aux opérateurs sur une base non discriminatoire", en: "capacity opened to operators on a non-discriminatory basis" },
          { fr: "résilience accrue par la redondance des itinéraires", en: "greater resilience through route redundancy" },
        ],
        chute: {
          fr: "L'objectif final n'est pas le linéaire déployé, mais la baisse du coût de gros de la bande passante — condition d'un accès abordable pour l'utilisateur final.",
          en: "The end goal is not kilometres deployed, but the fall in wholesale bandwidth costs — the condition for affordable access for the end user.",
        },
      },
      {
        n: "02", slug: "couverture-mobile", img: "tour",
        titre: { fr: "L'extension de la couverture mobile haut débit", en: "Extending mobile broadband coverage" },
        corps: {
          fr: [
            "Dans la plupart des territoires congolais, le mobile est — et restera pour longtemps — le principal moyen d'accéder à internet. Le projet accompagne l'extension de la couverture haut débit vers plusieurs centaines de communautés aujourd'hui non desservies.",
            "Ces zones sont, par construction, celles que le marché ne couvre pas spontanément : densité faible, revenu limité, accès énergétique difficile. Le projet y intervient par des mécanismes ciblés d'appui au déploiement, en lien avec le fonds de service universel et les opérateurs.",
          ],
          en: [
            "Across most Congolese territories, mobile is — and will long remain — the main way to access the internet. The project supports extending broadband coverage to several hundred currently underserved communities.",
            "These areas are, by construction, the ones the market does not cover spontaneously: low density, limited income, difficult energy access. The project intervenes through targeted deployment support mechanisms, working with the universal service fund and operators.",
          ],
        },
        points: [
          { fr: "environ 650 nouvelles communautés visées en mobile haut débit", en: "around 650 new communities targeted for mobile broadband" },
          { fr: "ciblage des zones rurales et périurbaines non desservies", en: "targeting underserved rural and peri-urban areas" },
          { fr: "articulation avec le fonds de service universel", en: "articulation with the universal service fund" },
          { fr: "solutions énergétiques adaptées aux sites isolés", en: "energy solutions adapted to isolated sites" },
        ],
      },
      {
        n: "03", slug: "institutions-connectees", img: "datacenter",
        titre: { fr: "Le raccordement des institutions publiques", en: "Connecting public institutions" },
        corps: {
          fr: [
            "Une administration ne peut pas se numériser sans être connectée. Le projet prévoit le raccordement progressif d'un millier d'institutions publiques — ministères, services déconcentrés, hôpitaux, centres de santé et établissements scolaires — au réseau haut débit.",
            "Ce raccordement conditionne directement les services développés par la Composante 2 : sans lien de qualité vers les plateformes gouvernementales, l'interopérabilité et les services en ligne restent théoriques pour les agents de terrain.",
          ],
          en: [
            "An administration cannot digitalise without being connected. The project provides for progressively connecting around a thousand public institutions — ministries, deconcentrated services, hospitals, health centres and schools — to the broadband network.",
            "This connection directly conditions the services built by Component 2: without a quality link to government platforms, interoperability and online services remain theoretical for frontline staff.",
          ],
        },
        points: [
          { fr: "de l'ordre d'un millier d'institutions publiques raccordées", en: "in the order of a thousand public institutions connected" },
          { fr: "priorité aux établissements de santé et d'enseignement", en: "priority to health and education facilities" },
          { fr: "articulation avec le réseau gouvernemental GOVNET (Composante 2)", en: "articulation with the GOVNET government network (Component 2)" },
          { fr: "prise en compte des coûts d'exploitation dans la durée", en: "operating costs factored in over time" },
        ],
      },
      {
        n: "04", slug: "universites", img: "formation",
        titre: { fr: "La connexion des universités et des établissements d'enseignement", en: "Connecting universities and education institutions" },
        corps: {
          fr: [
            "Les établissements d'enseignement supérieur constituent un point d'entrée décisif : ils concentrent des usages intensifs, forment les compétences dont le pays a besoin et diffusent les pratiques numériques dans leur environnement.",
            "En lien avec le Ministère de l'Enseignement Supérieur et Universitaire, le projet accompagne le raccordement des campus, l'accès aux ressources documentaires en ligne et la mise en place de réseaux d'établissements mutualisant leur connectivité.",
          ],
          en: [
            "Higher education institutions are a decisive entry point: they concentrate intensive usage, train the skills the country needs and spread digital practices across their environment.",
            "Working with the Ministry of Higher Education, the project supports campus connections, access to online scholarly resources and the creation of institution networks pooling their connectivity.",
          ],
        },
        points: [
          { fr: "raccordement des campus et des bibliothèques universitaires", en: "connection of campuses and university libraries" },
          { fr: "mutualisation de la connectivité entre établissements", en: "pooled connectivity across institutions" },
          { fr: "articulation avec les programmes de compétences de la Composante 3", en: "articulation with Component 3 skills programmes" },
        ],
      },
      {
        n: "05", slug: "cadre-reglementaire", img: "ville",
        titre: { fr: "Le cadre réglementaire et les facilitateurs de l'accès", en: "The regulatory framework and access enablers" },
        corps: {
          fr: [
            "L'investissement physique ne suffit pas : le prix et la qualité de l'accès dépendent largement des règles du secteur. La sous-composante 1.1 soutient le renforcement du cadre réglementaire, en appui au régulateur et aux autorités sectorielles.",
            "Les travaux portent notamment sur les conditions de concurrence, le partage des infrastructures passives, l'accès aux droits de passage, la transparence des tarifs de gros et la qualité de service.",
          ],
          en: [
            "Physical investment is not enough: the price and quality of access depend largely on sector rules. Sub-component 1.1 supports strengthening the regulatory framework, in support of the regulator and sector authorities.",
            "The work covers competitive conditions, passive infrastructure sharing, access to rights of way, wholesale tariff transparency and quality of service.",
          ],
        },
        points: [
          { fr: "appui au régulateur et aux autorités sectorielles", en: "support to the regulator and sector authorities" },
          { fr: "partage des infrastructures passives entre opérateurs", en: "passive infrastructure sharing between operators" },
          { fr: "transparence des tarifs de gros et suivi de la qualité de service", en: "wholesale tariff transparency and quality-of-service monitoring" },
          { fr: "simplification des procédures de déploiement", en: "simplified deployment procedures" },
        ],
      },
      {
        n: "06", slug: "inclusion", img: "femmes",
        titre: { fr: "L'inclusion numérique et l'abordabilité", en: "Digital inclusion and affordability" },
        corps: {
          fr: [
            "L'accès ne se réduit pas à la disponibilité du signal. Il suppose aussi un terminal, un forfait abordable, des contenus utiles et les compétences pour s'en servir. Le projet accorde une attention particulière aux femmes, aux populations rurales et aux publics vulnérables.",
            "Le cadre de résultats retient une ambition explicite : parmi les personnes que le projet vise à connecter à l'horizon 2029, environ la moitié devraient être des femmes.",
          ],
          en: [
            "Access is not just signal availability. It also requires a device, an affordable plan, useful content and the skills to use it. The project pays particular attention to women, rural populations and vulnerable groups.",
            "The results framework sets an explicit ambition: of the people the project aims to bring online by 2029, around half should be women.",
          ],
        },
        points: [
          { fr: "environ la moitié de femmes parmi les utilisateurs visés à l'horizon 2029", en: "around half women among the users targeted by 2029" },
          { fr: "mesures d'abordabilité des terminaux et des forfaits", en: "affordability measures for devices and plans" },
          { fr: "attention portée aux zones rurales et aux publics vulnérables", en: "attention to rural areas and vulnerable groups" },
        ],
      },
      {
        n: "07", slug: "connectivite-internationale", img: "data",
        titre: { fr: "La connectivité internationale et l'intégration régionale", en: "International connectivity and regional integration" },
        corps: {
          fr: [
            "La bande passante internationale par habitant est l'indicateur le plus direct de la capacité d'un pays à participer à l'économie numérique. Le projet vise sa progression sensible à l'horizon 2029, d'un niveau de départ de 6,56 kbit/s vers un ordre de grandeur de 20 kbit/s.",
            "Cette progression suppose des liaisons internationales renforcées et une meilleure intégration régionale, dans le cadre de l'approche APM IDEA de digitalisation inclusive en Afrique orientale et australe.",
          ],
          en: [
            "International bandwidth per capita is the most direct measure of a country's ability to take part in the digital economy. The project targets a marked rise by 2029, from a starting level of 6.56 kbit/s towards an order of magnitude of 20 kbit/s.",
            "That progression requires strengthened international links and deeper regional integration, within the APM IDEA approach to inclusive digitalisation in Eastern and Southern Africa.",
          ],
        },
        points: [
          { fr: "bande passante internationale par habitant multipliée par trois environ", en: "international bandwidth per capita roughly tripled" },
          { fr: "renforcement des points d'échange internet nationaux", en: "strengthening national internet exchange points" },
          { fr: "intégration à l'approche régionale APM IDEA", en: "integration into the regional APM IDEA approach" },
        ],
      },
      {
        n: "08", slug: "ppp", img: "hub",
        titre: { fr: "La mobilisation des capitaux privés", en: "Mobilising private capital" },
        corps: {
          fr: [
            "Le financement public ne peut pas, à lui seul, couvrir les besoins d'infrastructure du pays. Le projet vise la mobilisation de capitaux privés significatifs — de l'ordre de 165 millions de dollars — en complément de l'enveloppe publique.",
            "Cette mobilisation passe par des mécanismes de partenariat public-privé, un partage des risques adapté aux zones peu rentables et un cadre réglementaire lisible pour les investisseurs.",
          ],
          en: [
            "Public financing alone cannot cover the country's infrastructure needs. The project seeks to mobilise significant private capital — in the order of 165 million dollars — alongside the public envelope.",
            "This is pursued through public-private partnership mechanisms, risk-sharing adapted to low-return areas and a readable regulatory framework for investors.",
          ],
        },
        points: [
          { fr: "de l'ordre de 165 M USD de capitaux privés visés", en: "in the order of 165 M USD of private capital sought" },
          { fr: "partage des risques sur les zones peu rentables", en: "risk sharing in low-return areas" },
          { fr: "montages de partenariat public-privé", en: "public-private partnership structures" },
        ],
      },
    ],
    ecosysteme: {
      titre: { fr: "De la dorsale au dernier kilomètre", en: "From the backbone to the last mile" },
      lead: {
        fr: "La connectivité n'est utile que si toute la chaîne tient. Chaque maillon conditionne le suivant — et c'est l'ensemble, non un segment isolé, qui fait baisser le prix de l'accès.",
        en: "Connectivity is only useful if the whole chain holds. Each link conditions the next — and it is the whole, not an isolated segment, that brings the price of access down.",
      },
      couches: [
        { t: { fr: "Connectivité internationale", en: "International connectivity" }, d: { fr: "ouvre le pays sur le réseau mondial", en: "opens the country to the global network" } },
        { t: { fr: "Dorsales nationales", en: "National backbones" }, d: { fr: "relient les provinces entre elles", en: "link the provinces to one another" } },
        { t: { fr: "Réseaux régionaux", en: "Regional networks" }, d: { fr: "irriguent les territoires", en: "irrigate the territories" } },
        { t: { fr: "Couverture mobile", en: "Mobile coverage" }, d: { fr: "atteint les communautés", en: "reaches the communities" } },
        { t: { fr: "Raccordements", en: "Connections" }, d: { fr: "branchent écoles, santé et administrations", en: "hook up schools, health and administrations" } },
        { t: { fr: "Abordabilité", en: "Affordability" }, d: { fr: "rend l'accès possible au quotidien", en: "makes access possible day to day" } },
      ],
    },
    finalite: {
      titre: { fr: "Un accès qui change le quotidien", en: "Access that changes daily life" },
      lead: {
        fr: "La Composante 1 se mesure moins en kilomètres qu'en usages rendus possibles.",
        en: "Component 1 is measured less in kilometres than in the uses it makes possible.",
      },
      points: [
        { fr: "suivre des cours et accéder aux ressources en ligne depuis sa province", en: "study and access online resources from one's own province" },
        { fr: "consulter un médecin à distance depuis un centre de santé raccordé", en: "consult a doctor remotely from a connected health centre" },
        { fr: "vendre au-delà de son marché local et encaisser par mobile", en: "sell beyond one's local market and get paid by mobile" },
        { fr: "accéder aux services publics en ligne sans se déplacer", en: "reach public services online without travelling" },
        { fr: "réduire l'écart d'accès entre villes et campagnes", en: "narrow the access gap between towns and countryside" },
        { fr: "payer moins cher un accès de meilleure qualité", en: "pay less for better-quality access" },
      ],
    },
    responsable: {
      role: { fr: "Responsable de la Composante 1 — Accès et Inclusion Numériques", en: "Component 1 Lead — Digital Access and Inclusion" },
    },
    video: {
      titre: { fr: "Composante 1 — Accès & inclusion numériques", en: "Component 1 — Digital access & inclusion" },
      duree: "4:12",
      poster: "fibre",
    },
  },

  /* ======================================================================
     C2 — FONDATIONS NUMÉRIQUES        [texte institutionnel UGPTN — fait foi]
     ====================================================================== */
  {
    code: "C2",
    slug: "c2",
    img: "datacenter",
    odp: ["ODP-3"],
    titreLong: {
      fr: "Construire les fondations numériques de l'État congolais",
      en: "Building the digital foundations of the Congolese State",
    },
    soustitre: {
      fr: "Une transformation numérique fondée sur des infrastructures souveraines, sécurisées et interopérables.",
      en: "A digital transformation founded on sovereign, secure and interoperable infrastructure.",
    },
    problematique: {
      titre: {
        fr: "Chaque administration a construit son propre système : l'État paie plusieurs fois la même fonction.",
        en: "Each administration built its own system: the State pays several times over for the same function.",
      },
      lead: {
        fr: "La difficulté n'est pas l'absence d'informatique publique — les administrations congolaises en ont. Elle tient à ce que chaque système a été conçu verticalement, avec son propre identifiant, son propre hébergement et ses propres règles, sans socle partagé. Ce n'est pas un défaut d'équipement : c'est un défaut d'architecture.",
        en: "The difficulty is not an absence of public IT — Congolese administrations have it. It is that each system was designed vertically, with its own identifier, its own hosting and its own rules, without a shared foundation. This is not an equipment problem: it is an architecture problem.",
      },
      axes: [
        {
          t: { fr: "Des systèmes conçus les uns sans les autres", en: "Systems designed independently of one another" },
          d: {
            fr: "Les applications publiques ont été acquises projet par projet, souvent au rythme des financements disponibles. Chacune a créé son référentiel de personnes, ses formats, son mode d'authentification, son hébergement. Le résultat n'est pas un système d'information de l'État, mais une juxtaposition de systèmes d'information d'administrations, dont aucun ne sait interroger les autres.",
            en: "Public applications were acquired project by project, often at the pace of available financing. Each created its own register of people, its own formats, its own authentication, its own hosting. The result is not a State information system, but a juxtaposition of departmental information systems, none of which can query the others.",
          },
        },
        {
          t: { fr: "Sans socle commun, chaque service repart de zéro", en: "Without a common foundation, every service starts from scratch" },
          d: {
            fr: "Faute de briques réutilisables, un nouveau téléservice doit reconstruire à lui seul l'identification de l'usager, la vérification de son droit, la valeur juridique du document produit et, souvent, le paiement. Le coût et le délai de chaque service sont donc gonflés par des fonctions déjà développées ailleurs, et l'échange de données devient une négociation bilatérale entre administrations au lieu d'être une règle d'architecture.",
            en: "Lacking reusable building blocks, a new online service must itself rebuild user identification, entitlement checking, the legal value of the document produced and, often, payment. The cost and lead time of every service are therefore inflated by functions already built elsewhere, and data exchange becomes a bilateral negotiation between administrations instead of an architectural rule.",
          },
        },
        {
          t: { fr: "La charge de la preuve retombe sur le citoyen", en: "The burden of proof falls back on the citizen" },
          d: {
            fr: "Quand les registres ne se parlent pas, c'est l'usager qui fait circuler l'information à leur place : il rassemble les pièces, se déplace d'un guichet à l'autre, refait la preuve de son identité à chaque étape. Les registres divergent avec le temps, les doublons se multiplient, et la surface exposée aux incidents de sécurité s'étend sans que le niveau de protection soit homogène d'un système à l'autre.",
            en: "When registries do not talk to each other, it is the user who carries the information between them: assembling documents, travelling from counter to counter, proving their identity again at every step. Registries drift apart over time, duplicates multiply, and the surface exposed to security incidents widens while protection levels remain uneven from one system to the next.",
          },
        },
      ],
      appui: {
        fr: [
          "Une infrastructure publique numérique se comporte comme un bien commun à effet de réseau : sa valeur croît avec le nombre d'administrations qui la réutilisent, et aucune d'elles n'a intérêt à la financer seule pour le bénéfice des autres. C'est précisément ce type de défaillance qu'un investissement central corrige — d'où le choix de porter des briques mutualisées (hébergement souverain, réseau gouvernemental, supervision de sécurité, identité, échange de données) plutôt qu'une application de plus.",
          "Ce choix engage aussi la maîtrise publique des données : héberger hors du pays les registres critiques de l'État revient à déléguer une part de sa capacité de décision, et rend la continuité de service dépendante de contrats et de juridictions extérieurs. La souveraineté visée ici n'est pas une posture, c'est une condition de continuité et de sécurité juridique.",
          "Enfin, une architecture ne s'impose pas par la technique seule. Elle suppose un plan directeur opposable, des normes d'interopérabilité, un cadre juridique qui donne valeur à la signature électronique et protège les données personnelles — et une autorité capable d'arbitrer entre administrations. Sans cette part institutionnelle, les briques techniques restent inutilisées.",
        ],
        en: [
          "Digital public infrastructure behaves like a common good with network effects: its value grows with the number of administrations that reuse it, and none of them has an interest in financing it alone for the benefit of others. That is precisely the kind of failure a central investment corrects — hence the choice to build shared components (sovereign hosting, a government network, security supervision, identity, data exchange) rather than one more application.",
          "This choice also engages public control of data: hosting the State's critical registries outside the country amounts to delegating part of its decision-making capacity, and makes service continuity dependent on external contracts and jurisdictions. The sovereignty sought here is not a posture; it is a condition of continuity and legal certainty.",
          "Finally, an architecture is not imposed by technology alone. It requires an enforceable master plan, interoperability standards, a legal framework that gives electronic signature its value and protects personal data — and an authority able to arbitrate between administrations. Without that institutional dimension, the technical building blocks go unused.",
        ],
      },
      liens: [
        { code: "C1", t: { fr: "Un service en ligne reste théorique pour l'agent qui ne dispose pas d'un lien de qualité : le raccordement des institutions conditionne l'usage réel.", en: "An online service stays theoretical for staff without a quality link: connecting institutions conditions real usage." } },
        { code: "C3", t: { fr: "Exploiter un cloud, un réseau gouvernemental et un centre de cybersécurité suppose des compétences rares, à former et à retenir.", en: "Running a cloud, a government network and a cybersecurity centre requires scarce skills, to be trained and retained." } },
        { t: { fr: "Cadre juridique : identité, signature électronique et protection des données ne produisent d'effet que s'ils sont opposables.", en: "Legal framework: identity, electronic signature and data protection only take effect if they are enforceable." } },
        { t: { fr: "Santé, éducation, finances publiques : l'identité et l'interopérabilité sont des intrants de ces politiques, pas une fin en soi.", en: "Health, education, public finance: identity and interoperability are inputs to those policies, not an end in themselves." } },
      ],
    },
    chapeau: {
      fr: [
        "Dans le cadre du Projet d'Appui à la Transformation Numérique (PTN), la Composante 2 accompagne le Gouvernement de la République Démocratique du Congo dans la mise en place des fondations numériques indispensables à la modernisation de l'administration publique et au développement de services publics numériques accessibles, sécurisés et centrés sur les citoyens.",
        "La transformation numérique de l'État ne repose pas uniquement sur la dématérialisation des procédures administratives. Elle nécessite également des infrastructures fiables, une connectivité performante, des plateformes numériques communes, des mécanismes d'identification sécurisés, une gouvernance efficace des données ainsi qu'un environnement de cybersécurité capable de protéger les systèmes d'information et les données critiques de l'État.",
        "La Composante 2 du PTN intervient précisément sur ces différents piliers afin de permettre à la RDC de disposer progressivement d'un écosystème numérique public cohérent, souverain, interopérable et durable.",
        "Son ambition est de favoriser le passage d'une logique dans laquelle chaque administration développe ses propres systèmes isolés à une approche fondée sur des infrastructures numériques publiques partagées — Digital Public Infrastructure (DPI) — pouvant être réutilisées par l'ensemble des institutions de l'État.",
      ],
      en: [
        "Within the Digital Transformation Project (PTN), Component 2 supports the Government of the Democratic Republic of the Congo in putting in place the digital foundations required to modernise public administration and to develop digital public services that are accessible, secure and citizen-centred.",
        "The State's digital transformation does not rest on the dematerialisation of administrative procedures alone. It also requires reliable infrastructure, high-performance connectivity, shared digital platforms, secure identification mechanisms, effective data governance and a cybersecurity environment capable of protecting the State's information systems and critical data.",
        "Component 2 works precisely on these pillars, so that the DRC progressively acquires a coherent, sovereign, interoperable and sustainable public digital ecosystem.",
        "Its ambition is to shift from a logic in which each administration develops its own isolated systems to an approach founded on shared digital public infrastructure (DPI) that can be reused by all State institutions.",
      ],
    },
    objectifs: [
      { fr: "renforcer les infrastructures numériques critiques de l'État", en: "strengthen the State's critical digital infrastructure" },
      { fr: "améliorer la connectivité entre les institutions publiques", en: "improve connectivity between public institutions" },
      { fr: "développer des infrastructures numériques publiques partagées", en: "develop shared digital public infrastructure" },
      { fr: "renforcer la souveraineté numérique et la maîtrise des données publiques", en: "strengthen digital sovereignty and control over public data" },
      { fr: "améliorer la cybersécurité des systèmes d'information gouvernementaux", en: "improve the cybersecurity of government information systems" },
      { fr: "favoriser l'interopérabilité entre les administrations", en: "foster interoperability across administrations" },
      { fr: "accompagner la modernisation de l'identification de la population et de l'état civil", en: "support the modernisation of population identification and civil registration" },
      { fr: "développer les services de confiance numérique", en: "develop digital trust services" },
      { fr: "améliorer la gouvernance et la valorisation des données publiques", en: "improve the governance and value of public data" },
      { fr: "renforcer les compétences numériques des administrations et des agents publics", en: "strengthen the digital skills of administrations and public officials" },
    ],
    projets: [
      {
        n: "01", slug: "cloud-souverain", img: "datacenter",
        titre: { fr: "Le Cloud Souverain du Gouvernement", en: "The Government Sovereign Cloud" },
        statut: { fr: "Infrastructure stratégique", en: "Strategic infrastructure" },
        corps: {
          fr: [
            "Le Cloud Souverain de la République Démocratique du Congo constitue l'une des infrastructures stratégiques de la transformation numérique de l'État.",
            "Cette infrastructure permettra d'héberger, dans un environnement sécurisé et maîtrisé, des plateformes gouvernementales ainsi que les applications et registres critiques de l'État.",
            "Le Cloud Souverain est conçu pour fournir différents modèles de services numériques :",
          ],
          en: [
            "The Sovereign Cloud of the Democratic Republic of the Congo is one of the strategic infrastructures of the State's digital transformation.",
            "It will host government platforms as well as the State's critical applications and registries in a secure, controlled environment.",
            "The Sovereign Cloud is designed to provide several digital service models:",
          ],
        },
        points: [
          { fr: "Infrastructure as a Service — IaaS", en: "Infrastructure as a Service — IaaS" },
          { fr: "Platform as a Service — PaaS", en: "Platform as a Service — PaaS" },
          { fr: "Software as a Service — SaaS", en: "Software as a Service — SaaS" },
        ],
        chute: {
          fr: "Il permettra aux administrations publiques de disposer de capacités informatiques mutualisées sans devoir investir individuellement dans des infrastructures de centres de données. Le projet vise ainsi à améliorer la disponibilité des services publics numériques, réduire les coûts liés à la multiplication des infrastructures informatiques, renforcer la résilience des systèmes de l'État et améliorer la maîtrise ainsi que la protection des données publiques. Le Cloud Souverain constitue également une infrastructure essentielle pour accueillir progressivement les plateformes critiques et les futurs services numériques de l'administration congolaise.",
          en: "It will give public administrations pooled computing capacity without each having to invest in its own data centre infrastructure. The project therefore aims to improve the availability of digital public services, cut the costs of duplicated IT infrastructure, strengthen the resilience of State systems and improve control over and protection of public data. The Sovereign Cloud is also an essential platform for progressively hosting critical platforms and the future digital services of the Congolese administration.",
        },
      },
      {
        n: "02", slug: "govnet", sigle: "GOVNET", img: "fibre",
        titre: { fr: "Le réseau numérique sécurisé de l'État", en: "The State's secure digital network" },
        statut: { fr: "Réseau gouvernemental", en: "Government network" },
        corps: {
          fr: [
            "Le GOVNET est le projet de réseau gouvernemental destiné à interconnecter progressivement les administrations et institutions publiques de la République Démocratique du Congo. Il doit constituer la colonne vertébrale des échanges numériques de l'État.",
            "À travers cette infrastructure, les administrations pourront communiquer et accéder aux plateformes gouvernementales à travers un réseau sécurisé et maîtrisé, plutôt que de dépendre exclusivement de connexions Internet publiques indépendantes.",
            "Le GOVNET permettra notamment :",
          ],
          en: [
            "GOVNET is the government network project intended to progressively interconnect the administrations and public institutions of the Democratic Republic of the Congo. It is to become the backbone of the State's digital exchanges.",
            "Through this infrastructure, administrations will be able to communicate and reach government platforms over a secure, controlled network, rather than depending solely on separate public internet connections.",
            "GOVNET will notably enable:",
          ],
        },
        points: [
          { fr: "l'interconnexion sécurisée des institutions publiques", en: "secure interconnection of public institutions" },
          { fr: "l'accès aux services du Cloud Souverain", en: "access to Sovereign Cloud services" },
          { fr: "l'échange sécurisé de données entre administrations", en: "secure data exchange between administrations" },
          { fr: "l'amélioration de la qualité et de la disponibilité des services numériques", en: "improved quality and availability of digital services" },
          { fr: "la supervision centralisée des infrastructures réseau", en: "centralised supervision of network infrastructure" },
          { fr: "le renforcement de la résilience des communications gouvernementales", en: "greater resilience of government communications" },
        ],
        chute: {
          fr: "À terme, le GOVNET devra contribuer à connecter les institutions publiques aussi bien à Kinshasa que dans les provinces.",
          en: "In time, GOVNET is to help connect public institutions in Kinshasa and across the provinces alike.",
        },
      },
      {
        n: "03", slug: "govsoc", sigle: "GOVSOC", img: "data",
        titre: { fr: "Le Centre Gouvernemental des Opérations de Cybersécurité", en: "The Government Security Operations Centre" },
        statut: { fr: "Cybersécurité", en: "Cybersecurity" },
        corps: {
          fr: [
            "Avec la transformation numérique croissante de l'administration publique, la protection des infrastructures et des données de l'État devient une priorité nationale.",
            "Le Government Security Operations Center — GOVSOC constitue le dispositif central de surveillance et de réponse aux incidents de cybersécurité affectant les infrastructures numériques critiques du Gouvernement.",
            "Le GOVSOC permettra notamment :",
          ],
          en: [
            "As public administration digitalises further, protecting the State's infrastructure and data becomes a national priority.",
            "The Government Security Operations Center — GOVSOC is the central facility for monitoring and responding to cybersecurity incidents affecting the Government's critical digital infrastructure.",
            "GOVSOC will notably enable:",
          ],
        },
        points: [
          { fr: "la surveillance des événements de sécurité", en: "monitoring of security events" },
          { fr: "la détection des cybermenaces", en: "detection of cyber threats" },
          { fr: "l'analyse des incidents", en: "incident analysis" },
          { fr: "la coordination des réponses aux attaques informatiques", en: "coordination of responses to cyber attacks" },
          { fr: "la gestion des alertes de cybersécurité", en: "management of cybersecurity alerts" },
          { fr: "l'amélioration continue de la posture de sécurité des institutions publiques", en: "continuous improvement of public institutions' security posture" },
        ],
        chute: {
          fr: "Il aura notamment vocation à contribuer à la protection du Cloud Souverain, du GOVNET et des infrastructures numériques critiques de l'État. Le GOVSOC doit progressivement renforcer la capacité nationale à anticiper, détecter et traiter les cyberincidents affectant les services publics numériques.",
          en: "It is intended in particular to help protect the Sovereign Cloud, GOVNET and the State's critical digital infrastructure. GOVSOC is to progressively strengthen national capacity to anticipate, detect and handle cyber incidents affecting digital public services.",
        },
      },
      {
        n: "04", slug: "dpi", sigle: "DPI", img: "hub",
        titre: { fr: "Les infrastructures numériques publiques", en: "Digital public infrastructure" },
        statut: { fr: "Briques partagées", en: "Shared building blocks" },
        corps: {
          fr: [
            "La Composante 2 accompagne également le Gouvernement dans la construction d'une véritable Infrastructure Publique Numérique — Digital Public Infrastructure (DPI).",
            "La DPI repose sur des composants numériques fondamentaux pouvant être utilisés par plusieurs administrations pour développer rapidement et de manière cohérente de nouveaux services publics numériques.",
            "Ces briques peuvent notamment concerner :",
          ],
          en: [
            "Component 2 also supports the Government in building genuine Digital Public Infrastructure (DPI).",
            "DPI rests on foundational digital components that several administrations can use to build new digital public services quickly and coherently.",
            "These building blocks may notably cover:",
          ],
        },
        points: [
          { fr: "l'identité numérique", en: "digital identity" },
          { fr: "l'échange et l'interopérabilité des données", en: "data exchange and interoperability" },
          { fr: "les services de confiance numérique", en: "digital trust services" },
          { fr: "les mécanismes de paiement", en: "payment mechanisms" },
          { fr: "les plateformes gouvernementales partagées", en: "shared government platforms" },
        ],
        chute: {
          fr: "Cette approche permet d'éviter que chaque ministère ou institution développe séparément les mêmes fonctions techniques. La DPI constitue ainsi une fondation essentielle pour accélérer la digitalisation des services publics tout en améliorant leur interopérabilité, leur sécurité et leur capacité à évoluer.",
          en: "This approach avoids each ministry or institution separately rebuilding the same technical functions. DPI is therefore an essential foundation for accelerating the digitalisation of public services while improving their interoperability, security and ability to evolve.",
        },
      },
      {
        n: "05", slug: "identification", img: "citoyens",
        titre: { fr: "La modernisation de l'identification de la population et de l'état civil", en: "Modernising population identification and civil registration" },
        corps: {
          fr: [
            "Une administration numérique moderne nécessite la capacité d'identifier de manière fiable les personnes qui utilisent ses services.",
            "Dans cette perspective, la Composante 2 accompagne les institutions concernées dans les travaux visant à renforcer et moderniser les dispositifs nationaux d'identification de la population et d'état civil.",
            "Ces travaux comprennent notamment l'élaboration d'une approche intégrée de l'identification, la définition d'un schéma directeur du système national d'identification ainsi que l'analyse et la modernisation progressive des mécanismes d'état civil.",
          ],
          en: [
            "A modern digital administration needs the ability to reliably identify the people who use its services.",
            "With this in view, Component 2 supports the institutions concerned in strengthening and modernising national population identification and civil registration arrangements.",
            "This work includes designing an integrated approach to identification, defining a master plan for the national identification system, and analysing and progressively modernising civil registration mechanisms.",
          ],
        },
        chute: {
          fr: "L'objectif est de contribuer à la mise en place d'un écosystème d'identité fiable, inclusif et interopérable permettant notamment de faciliter l'accès aux services publics et de réduire les duplications entre les différents systèmes d'identification.",
          en: "The aim is to help establish a reliable, inclusive and interoperable identity ecosystem that eases access to public services and reduces duplication across identification systems.",
        },
      },
      {
        n: "06", slug: "confiance-signature", img: "ville",
        titre: { fr: "Les services de confiance et la signature électronique", en: "Trust services and electronic signature" },
        corps: {
          fr: [
            "La dématérialisation complète des procédures administratives nécessite des mécanismes permettant de garantir l'identité des utilisateurs, l'intégrité des documents et la valeur juridique des transactions électroniques.",
            "La Composante 2 accompagne ainsi le développement des services de confiance numérique, notamment à travers les travaux relatifs à la signature électronique et aux infrastructures nécessaires à son utilisation.",
          ],
          en: [
            "Fully dematerialising administrative procedures requires mechanisms that guarantee user identity, document integrity and the legal value of electronic transactions.",
            "Component 2 therefore supports the development of digital trust services, notably through work on electronic signature and the infrastructure needed to use it.",
          ],
        },
        chute: {
          fr: "Le développement de ces services doit permettre progressivement aux administrations, citoyens et entreprises de réaliser davantage de procédures entièrement en ligne, tout en garantissant l'authenticité, l'intégrité et la traçabilité des transactions électroniques.",
          en: "Developing these services should progressively allow administrations, citizens and businesses to complete more procedures entirely online, while guaranteeing the authenticity, integrity and traceability of electronic transactions.",
        },
      },
      {
        n: "07", slug: "gouvernance-donnees", img: "data",
        titre: { fr: "La gouvernance des données publiques", en: "Public data governance" },
        corps: {
          fr: [
            "Les données constituent l'un des actifs stratégiques de la transformation numérique de l'État.",
            "La Composante 2 soutient la mise en place d'un cadre national permettant d'améliorer la gouvernance, la qualité, la protection, le partage et la valorisation des données publiques.",
            "Cette démarche vise notamment à :",
          ],
          en: [
            "Data is one of the strategic assets of the State's digital transformation.",
            "Component 2 supports a national framework to improve the governance, quality, protection, sharing and value of public data.",
            "This effort aims notably to:",
          ],
        },
        points: [
          { fr: "améliorer la connaissance des données détenues par les administrations", en: "improve knowledge of the data held by administrations" },
          { fr: "définir des règles communes de gestion des données", en: "define common data management rules" },
          { fr: "améliorer la qualité et l'interopérabilité des données", en: "improve data quality and interoperability" },
          { fr: "renforcer leur sécurité et leur protection", en: "strengthen their security and protection" },
          { fr: "faciliter les échanges de données entre administrations", en: "ease data exchange between administrations" },
          { fr: "développer progressivement les capacités d'analyse et de valorisation des données publiques", en: "progressively build capacity to analyse and derive value from public data" },
        ],
        chute: {
          fr: "La gouvernance des données constitue également une condition essentielle pour permettre à l'État d'exploiter de manière responsable les technologies émergentes, notamment l'intelligence artificielle.",
          en: "Data governance is also an essential condition for the State to make responsible use of emerging technologies, notably artificial intelligence.",
        },
      },
      {
        n: "08", slug: "plan-directeur-egov", img: "hub",
        titre: { fr: "Le Plan Directeur de l'e-Gouvernement", en: "The e-Government Master Plan" },
        corps: {
          fr: [
            "La transformation numérique de l'administration nécessite une vision commune et une architecture cohérente.",
            "Le Plan Directeur de l'e-Gouvernement doit permettre de définir cette trajectoire et d'organiser progressivement le développement des services publics numériques autour d'une architecture gouvernementale commune.",
            "L'objectif est notamment de favoriser la mutualisation des infrastructures, l'interopérabilité des plateformes, la standardisation des services numériques et une meilleure coordination des investissements technologiques réalisés par les administrations publiques.",
          ],
          en: [
            "The administration's digital transformation requires a shared vision and a coherent architecture.",
            "The e-Government Master Plan is to define this trajectory and progressively organise the development of digital public services around a common government architecture.",
            "The aim is notably to encourage infrastructure pooling, platform interoperability, standardisation of digital services and better coordination of the technology investments made by public administrations.",
          ],
        },
        chute: {
          fr: "Cette démarche doit également contribuer au développement progressif d'un environnement permettant aux citoyens et aux entreprises d'accéder plus simplement aux services de l'État.",
          en: "This work should also help progressively build an environment in which citizens and businesses can reach State services more simply.",
        },
      },
      {
        n: "09", slug: "infrastructures-internet", img: "tour",
        titre: { fr: "Les infrastructures Internet stratégiques de l'État", en: "The State's strategic internet infrastructure" },
        corps: {
          fr: [
            "La Composante 2 intervient également sur plusieurs infrastructures nécessaires à la présence et à l'autonomie numérique de la République Démocratique du Congo.",
            "Ces interventions concernent notamment :",
          ],
          en: [
            "Component 2 also works on several infrastructures needed for the Democratic Republic of the Congo's digital presence and autonomy.",
            "These interventions notably concern:",
          ],
        },
        points: [
          { fr: "le renforcement de la gestion du domaine national .CD", en: "strengthening management of the national .CD domain" },
          { fr: "l'amélioration de la gestion des ressources d'adressage IP", en: "improving management of IP addressing resources" },
          { fr: "la promotion de l'IPv6", en: "promoting IPv6" },
          { fr: "le renforcement de la résilience et de la sécurité des infrastructures Internet nationales", en: "strengthening the resilience and security of national internet infrastructure" },
        ],
        chute: {
          fr: "Ces initiatives contribuent à renforcer la souveraineté numérique du pays et à créer un environnement plus favorable au développement des services numériques.",
          en: "These initiatives help strengthen the country's digital sovereignty and create a more favourable environment for digital services to develop.",
        },
      },
      {
        n: "10", slug: "capacites-institutions", img: "formation",
        titre: { fr: "Le renforcement des capacités des institutions publiques", en: "Strengthening the capacity of public institutions" },
        corps: {
          fr: [
            "La transformation numérique ne peut réussir uniquement grâce aux infrastructures et aux technologies.",
            "Elle nécessite également des compétences humaines capables de concevoir, exploiter, sécuriser et faire évoluer ces nouveaux systèmes.",
            "La Composante 2 soutient donc différentes initiatives de formation et de renforcement des capacités dans des domaines tels que :",
          ],
          en: [
            "Digital transformation cannot succeed through infrastructure and technology alone.",
            "It also requires human skills able to design, operate, secure and evolve these new systems.",
            "Component 2 therefore supports training and capacity-building initiatives in areas such as:",
          ],
        },
        points: [
          { fr: "la cybersécurité", en: "cybersecurity" },
          { fr: "les infrastructures publiques numériques", en: "digital public infrastructure" },
          { fr: "le cloud computing", en: "cloud computing" },
          { fr: "les réseaux", en: "networks" },
          { fr: "la gouvernance des données", en: "data governance" },
          { fr: "l'architecture des systèmes d'information", en: "information systems architecture" },
          { fr: "la transformation numérique", en: "digital transformation" },
        ],
        chute: {
          fr: "L'objectif est de renforcer progressivement les capacités internes de l'administration afin d'assurer la pérennité des investissements réalisés dans le cadre du projet.",
          en: "The aim is to progressively strengthen the administration's internal capacity so as to sustain the investments made under the project.",
        },
      },
    ],
    ecosysteme: {
      titre: { fr: "Vers un véritable écosystème numérique gouvernemental", en: "Towards a genuine government digital ecosystem" },
      lead: {
        fr: "L'ensemble de ces projets ne constitue pas une succession d'initiatives indépendantes : ils sont conçus comme les différentes composantes d'un écosystème numérique gouvernemental intégré. Ces infrastructures constituent ensemble les fondations nécessaires au développement de services publics numériques modernes.",
        en: "These projects are not a succession of independent initiatives: they are designed as the parts of one integrated government digital ecosystem. Together, they form the foundations required to develop modern digital public services.",
      },
      couches: [
        { t: { fr: "GOVNET", en: "GOVNET" }, d: { fr: "assure la connectivité entre les institutions", en: "provides connectivity between institutions" } },
        { t: { fr: "Cloud Souverain", en: "Sovereign Cloud" }, d: { fr: "fournit les capacités d'hébergement et de traitement", en: "provides hosting and processing capacity" } },
        { t: { fr: "GOVSOC", en: "GOVSOC" }, d: { fr: "contribue à protéger les infrastructures et les services numériques", en: "helps protect infrastructure and digital services" } },
        { t: { fr: "Interopérabilité", en: "Interoperability" }, d: { fr: "permet aux administrations d'échanger leurs données", en: "lets administrations exchange their data" } },
        { t: { fr: "Identité numérique", en: "Digital identity" }, d: { fr: "permet d'identifier les utilisateurs", en: "makes it possible to identify users" } },
        { t: { fr: "Services de confiance", en: "Trust services" }, d: { fr: "permettent de sécuriser les transactions numériques", en: "secure digital transactions" } },
        { t: { fr: "Gouvernance des données", en: "Data governance" }, d: { fr: "organise l'utilisation et la valorisation du patrimoine informationnel de l'État", en: "organises the use and value of the State's information assets" } },
      ],
    },
    finalite: {
      titre: { fr: "Une transformation numérique au service du citoyen", en: "A digital transformation serving the citizen" },
      lead: {
        fr: "La finalité de la Composante 2 dépasse la construction d'infrastructures technologiques : elle vise à contribuer à un changement durable dans la manière dont l'administration congolaise fonctionne et fournit ses services. À terme, ces investissements doivent permettre :",
        en: "Component 2's purpose goes beyond building technological infrastructure: it aims to contribute to a lasting change in how the Congolese administration works and delivers its services. In time, these investments should make it possible:",
      },
      points: [
        { fr: "de simplifier les démarches administratives", en: "to simplify administrative procedures" },
        { fr: "de réduire les délais de traitement", en: "to shorten processing times" },
        { fr: "de faciliter l'accès aux services publics", en: "to ease access to public services" },
        { fr: "d'améliorer la transparence et la traçabilité des procédures", en: "to improve the transparency and traceability of procedures" },
        { fr: "de réduire les duplications administratives", en: "to reduce administrative duplication" },
        { fr: "de renforcer la sécurité des systèmes et des données publiques", en: "to strengthen the security of public systems and data" },
        { fr: "d'améliorer l'efficacité de l'administration", en: "to improve the administration's efficiency" },
        { fr: "de rapprocher davantage les services de l'État des citoyens et des entreprises", en: "to bring State services closer to citizens and businesses" },
      ],
    },
    responsable: {
      nom: "Christian KAZADI",
      role: { fr: "Responsable de la Composante 2 — Infrastructures et Services Publics Numériques", en: "Component 2 Lead — Digital Infrastructure and Public Services" },
    },
    video: {
      titre: { fr: "Composante 2 — Fondations numériques", en: "Component 2 — Digital foundations" },
      duree: "3:38",
      poster: "datacenter",
    },
  },

  /* ======================================================================
     C3 — COMPÉTENCES & INNOVATION                          [À VALIDER]
     ====================================================================== */
  {
    code: "C3",
    slug: "c3",
    img: "formation",
    odp: ["ODP-4"],
    titreLong: {
      fr: "Former une génération et faire émerger l'innovation congolaise",
      en: "Training a generation and growing Congolese innovation",
    },
    soustitre: {
      fr: "Des compétences numériques avancées, des établissements d'enseignement outillés et un écosystème d'innovation local capable de créer des emplois et des solutions.",
      en: "Advanced digital skills, equipped education institutions and a local innovation ecosystem able to create jobs and solutions.",
    },
    problematique: {
      titre: {
        fr: "Une infrastructure se livre en trois ans. Les compétences qui la font vivre se construisent en dix.",
        en: "Infrastructure is delivered in three years. The skills that keep it running take ten to build.",
      },
      lead: {
        fr: "Le pays entre dans un cycle d'investissement numérique avec une population parmi les plus jeunes du continent — c'est un atout de long terme. Le point de tension est ailleurs : entre le moment où les systèmes sont livrés et celui où des équipes congolaises savent les exploiter, il existe un décalage que ni le matériel ni le financement ne comblent.",
        en: "The country is entering a digital investment cycle with one of the continent's youngest populations — a long-term asset. The tension lies elsewhere: between the moment systems are delivered and the moment Congolese teams can run them, there is a gap that neither equipment nor financing closes.",
      },
      axes: [
        {
          t: { fr: "Une jeunesse nombreuse, une offre de formation en décalage", en: "A large young population, a lagging training offer" },
          d: {
            fr: "Les effectifs de l'enseignement supérieur progressent, mais les cursus, les équipements et la formation des enseignants suivent difficilement le rythme des métiers demandés — administration réseau et systèmes, cybersécurité, ingénierie des données, cloud, gestion de projet numérique. Le diplôme reste souvent généraliste là où le marché recrute sur des compétences vérifiables.",
            en: "Higher-education enrolment is rising, but curricula, equipment and teacher training struggle to keep pace with the trades in demand — network and systems administration, cybersecurity, data engineering, cloud, digital project management. Degrees often remain generalist where the market recruits on verifiable skills.",
          },
        },
        {
          t: { fr: "Sans profils disponibles, l'exploitation s'importe ou se reporte", en: "Without available profiles, operations are imported or deferred" },
          d: {
            fr: "Quand les compétences manquent localement, une administration ou un opérateur a deux options : faire venir l'expertise, à un coût qui pèse durablement sur le budget de fonctionnement, ou différer la mise en service. Dans les deux cas, la valeur de l'investissement fuit hors du pays ou reste immobilisée. Symétriquement, les diplômés qui ne trouvent pas de débouché local partent : le pays finance une formation dont il ne récolte pas le rendement.",
            en: "Where skills are missing locally, an administration or an operator has two options: bring in expertise, at a cost that weighs lastingly on operating budgets, or defer commissioning. Either way, the value of the investment leaks abroad or stays idle. Symmetrically, graduates who find no local outlet leave: the country finances training whose return it does not collect.",
          },
        },
        {
          t: { fr: "Une infrastructure sans exploitants devient une dette", en: "Infrastructure without operators becomes a liability" },
          d: {
            fr: "Un équipement non maintenu se dégrade plus vite qu'il ne s'amortit ; un système non administré finit par être contourné ; un dispositif de sécurité sans analystes ne produit que des alertes que personne ne traite. Le pays paie alors deux fois : une fois pour construire, une fois pour réparer — et perd entre-temps le service qu'il attendait.",
            en: "Unmaintained equipment degrades faster than it depreciates; an unadministered system ends up being bypassed; a security facility without analysts produces only alerts that nobody handles. The country then pays twice — once to build, once to repair — and loses in the meantime the service it was expecting.",
          },
        },
      ],
      appui: {
        fr: [
          "Le marché seul sous-investit dans la formation, et pour une raison connue : une entreprise qui forme ne capte pas tout le rendement de cet effort, puisque le salarié formé peut être recruté ailleurs. L'étudiant, de son côté, hésite à s'engager dans une filière technique dont le débouché n'est pas lisible. Ce double sous-investissement justifie un cofinancement public, adossé à des cursus construits avec ceux qui recrutent.",
          "Le projet privilégie pour cela des mécanismes qui paient le résultat plutôt que l'intention : les subventions à la performance ne sont versées qu'au fil de jalons vérifiables, et les centres d'innovation mutualisent des équipements qu'un porteur de projet isolé ne pourrait pas financer. L'objectif n'est pas de multiplier les formations, mais d'aligner le contenu enseigné sur des compétences que quelqu'un est prêt à rémunérer.",
          "Une politique de compétences n'a de sens que si la demande existe. Former sans marché local revient à organiser une émigration qualifiée. C'est pourquoi le soutien aux entreprises, aux contenus et aux services numériques produits en RDC fait partie de la même composante : il crée la contrepartie qui retient les compétences sur le territoire.",
        ],
        en: [
          "The market alone underinvests in training, for a well-known reason: a firm that trains does not capture the full return, since the trained employee can be hired elsewhere. Students, for their part, hesitate to commit to a technical track whose outlet is unclear. This double underinvestment justifies public co-financing, anchored in curricula built with those who do the hiring.",
          "The project therefore favours mechanisms that pay for results rather than intentions: performance-based grants are released only as verifiable milestones are met, and innovation centres pool equipment that an isolated project holder could not finance. The aim is not to multiply training courses, but to align what is taught with skills someone is willing to pay for.",
          "A skills policy only makes sense if demand exists. Training without a local market amounts to organising qualified emigration. That is why support to businesses, content and digital services produced in the DRC belongs to the same component: it creates the counterpart that keeps skills in the country.",
        ],
      },
      liens: [
        { code: "C2", t: { fr: "Le cloud souverain, le réseau gouvernemental et le centre de cybersécurité ne tiennent que par les équipes qui les exploitent au quotidien.", en: "The sovereign cloud, the government network and the cybersecurity centre hold together only through the teams that run them day to day." } },
        { code: "C1", t: { fr: "Sans campus raccordés, la formation à distance et l'accès aux ressources scientifiques restent des intentions.", en: "Without connected campuses, distance learning and access to scientific resources remain intentions." } },
        { t: { fr: "Enseignement supérieur : la modernisation des cursus se décide avec le ministère et les établissements, pas à côté d'eux.", en: "Higher education: curriculum reform is decided with the ministry and the institutions, not alongside them." } },
        { t: { fr: "Secteur privé : sans demande d'emploi solvable, la formation produit de l'émigration qualifiée.", en: "Private sector: without solvent labour demand, training produces qualified emigration." } },
      ],
    },
    chapeau: {
      fr: [
        "La Composante 3 porte le volet humain et économique du projet, structuré en deux sous-composantes : la formation de compétences numériques avancées, en appui aux établissements d'enseignement supérieur et aux centres d'innovation, et le développement du contenu local et de l'innovation. Le lien entre les deux est intentionnel : l'une produit des compétences, l'autre crée la demande qui les retient dans le pays.",
        "Sur le versant formation, l'intervention porte moins sur le volume que sur l'alignement. Les parcours visent les métiers effectivement recherchés par les administrations, les opérateurs et les entreprises du secteur — administration réseau et systèmes, cybersécurité, ingénierie et gouvernance des données, cloud, conduite de projet numérique — et sont construits avec ceux qui recrutent, de façon que le diplôme constitue un signal vérifiable pour l'employeur.",
        "L'appui aux établissements accompagne cette exigence : laboratoires et salles équipés, formation des enseignants, actualisation des programmes, mutualisation de la connectivité entre établissements. L'objectif est que la capacité reste installée dans les institutions congolaises après le projet, plutôt que dans des dispositifs temporaires.",
        "Sur le versant innovation, la composante finance à la performance : les subventions ne sont versées qu'au fil de jalons vérifiables, et le réseau de centres d'innovation mutualise des équipements et un accompagnement qu'un porteur de projet isolé ne pourrait pas financer. L'inclusion des femmes n'y est pas un volet séparé mais une cible suivie, sur la formation comme sur l'entrepreneuriat.",
      ],
      en: [
        "Component 3 carries the project's human and economic strand, structured into two sub-components: advanced digital skills training, in support of higher-education institutions and innovation centres, and the development of local content and innovation. The link between the two is intentional: one produces skills, the other creates the demand that keeps them in the country.",
        "On the training side, the intervention is less about volume than about alignment. Pathways target the trades actually sought by administrations, operators and sector firms — network and systems administration, cybersecurity, data engineering and governance, cloud, digital project management — and are built with those who recruit, so that the qualification is a verifiable signal for employers.",
        "Support to institutions serves that requirement: equipped laboratories and classrooms, teacher training, updated syllabuses, pooled connectivity across institutions. The aim is for capacity to remain installed in Congolese institutions after the project, rather than in temporary arrangements.",
        "On the innovation side, the component finances on performance: grants are released only as verifiable milestones are met, and the innovation-centre network pools equipment and guidance that an isolated project holder could not finance. Women's inclusion is not a separate strand but a tracked target, in training as in entrepreneurship.",
      ],
    },
    objectifs: [
      { fr: "former plusieurs milliers de diplômés en compétences numériques avancées", en: "train several thousand graduates in advanced digital skills" },
      { fr: "faire des femmes environ un tiers des diplômés de ces formations", en: "make women around a third of the graduates of these programmes" },
      { fr: "renforcer les capacités des établissements d'enseignement supérieur", en: "strengthen the capacity of higher education institutions" },
      { fr: "aligner les formations sur les besoins réels du marché de l'emploi", en: "align training with real labour-market needs" },
      { fr: "établir un réseau d'une dizaine de centres d'innovation", en: "establish a network of around ten innovation centres" },
      { fr: "soutenir une centaine de startups, dont une part significative dirigées par des femmes", en: "support around a hundred startups, a significant share of them women-led" },
      { fr: "développer le contenu numérique local et l'économie du numérique", en: "grow local digital content and the digital economy" },
      { fr: "faciliter l'accès des jeunes aux métiers du numérique", en: "ease young people's access to digital careers" },
      { fr: "encourager la recherche appliquée et les partenariats université-entreprise", en: "encourage applied research and university-industry partnerships" },
      { fr: "assurer la pérennité des dispositifs de formation au-delà du projet", en: "sustain the training arrangements beyond the project" },
    ],
    projets: [
      {
        n: "01", slug: "competences-avancees", img: "formation",
        titre: { fr: "Le programme de compétences numériques avancées", en: "The advanced digital skills programme" },
        statut: { fr: "Programme national", en: "National programme" },
        corps: {
          fr: [
            "Le programme de compétences numériques avancées constitue le cœur de la Composante 3. Il vise la formation de profils directement mobilisables par l'administration, les opérateurs et les entreprises du secteur.",
            "Les parcours couvrent les domaines les plus tendus du marché : développement logiciel, cybersécurité, administration de réseaux et de systèmes, science et gouvernance des données, cloud et intelligence artificielle appliquée.",
          ],
          en: [
            "The advanced digital skills programme is the heart of Component 3. It aims to train profiles that the administration, operators and sector companies can put to work directly.",
            "The pathways cover the tightest areas of the market: software development, cybersecurity, network and systems administration, data science and governance, cloud and applied artificial intelligence.",
          ],
        },
        points: [
          { fr: "de l'ordre de 3 000 diplômés visés à l'horizon 2029", en: "in the order of 3,000 graduates targeted by 2029" },
          { fr: "plusieurs milliers de personnes inscrites en formation", en: "several thousand people enrolled in training" },
          { fr: "parcours conçus avec les employeurs du secteur", en: "pathways designed with sector employers" },
          { fr: "certification reconnue à l'issue des parcours", en: "recognised certification on completion" },
        ],
      },
      {
        n: "02", slug: "etablissements-superieur", img: "citoyens",
        titre: { fr: "L'appui aux établissements d'enseignement supérieur", en: "Support to higher education institutions" },
        corps: {
          fr: [
            "La formation à grande échelle suppose des établissements équipés, connectés et dotés d'un corps enseignant formé. En lien avec le Ministère de l'Enseignement Supérieur et Universitaire, le projet appuie la modernisation des cursus numériques et l'équipement des établissements retenus.",
            "L'appui porte sur les laboratoires informatiques, les plateformes pédagogiques, la formation des formateurs et la mise à jour des programmes d'enseignement.",
          ],
          en: [
            "Training at scale requires institutions that are equipped, connected and staffed by trained teachers. Working with the Ministry of Higher Education, the project supports the modernisation of digital curricula and the equipping of selected institutions.",
            "Support covers computer laboratories, teaching platforms, training of trainers and updating of syllabuses.",
          ],
        },
        points: [
          { fr: "équipement des laboratoires et des salles de formation", en: "equipping laboratories and training rooms" },
          { fr: "formation des enseignants et des formateurs", en: "training of teachers and trainers" },
          { fr: "modernisation des programmes d'enseignement", en: "modernised syllabuses" },
          { fr: "articulation avec le raccordement des campus (Composante 1)", en: "articulation with campus connectivity (Component 1)" },
        ],
      },
      {
        n: "03", slug: "hubs-innovation", img: "hub",
        titre: { fr: "Le réseau des centres d'innovation", en: "The innovation centre network" },
        statut: { fr: "10 centres", en: "10 centres" },
        corps: {
          fr: [
            "Les centres d'innovation offrent aux porteurs de projets un lieu, un accompagnement et un accès à des équipements qu'ils ne pourraient pas financer seuls. Le projet vise l'établissement d'une dizaine de centres, répartis au-delà de la seule capitale.",
            "Ces centres jouent un double rôle : point d'entrée vers les métiers du numérique pour les jeunes de leur territoire, et lieu d'incubation pour les startups locales.",
          ],
          en: [
            "Innovation centres give project holders a place, guidance and access to equipment they could not finance alone. The project targets around ten centres, spread beyond the capital alone.",
            "These centres play a dual role: an entry point into digital careers for young people in their territory, and an incubation venue for local startups.",
          ],
        },
        points: [
          { fr: "une dizaine de centres d'innovation", en: "around ten innovation centres" },
          { fr: "implantation au-delà de Kinshasa, dans les provinces", en: "presence beyond Kinshasa, across the provinces" },
          { fr: "accompagnement, mentorat et accès aux équipements", en: "guidance, mentoring and access to equipment" },
        ],
      },
      {
        n: "04", slug: "startups", img: "ville",
        titre: { fr: "Le soutien aux startups et le financement à la performance", en: "Startup support and performance-based financing" },
        corps: {
          fr: [
            "Le projet vise le soutien d'une centaine de startups congolaises, dont une part significative dirigées par des femmes, à travers des subventions à la performance (SBP) versées au fil de l'atteinte de jalons vérifiables.",
            "Ce mécanisme évite le financement à fonds perdus : l'appui se déploie au rythme des résultats effectivement démontrés par l'entreprise soutenue.",
          ],
          en: [
            "The project aims to support around a hundred Congolese startups, a significant share of them women-led, through performance-based grants (PBG) released as verifiable milestones are met.",
            "This mechanism avoids sunk financing: support unfolds at the pace of results the supported company actually demonstrates.",
          ],
        },
        points: [
          { fr: "une centaine de startups soutenues, dont une part significative dirigées par des femmes", en: "around a hundred startups supported, a significant share women-led" },
          { fr: "subventions versées à l'atteinte de jalons vérifiables", en: "grants released on verifiable milestones" },
          { fr: "accompagnement technique en complément du financement", en: "technical support alongside financing" },
        ],
      },
      {
        n: "05", slug: "femmes-numerique", img: "femmes",
        titre: { fr: "L'inclusion des femmes dans les métiers du numérique", en: "Including women in digital careers" },
        corps: {
          fr: [
            "L'inclusion des femmes n'est pas une ligne d'accompagnement : c'est une cible chiffrée et suivie du cadre de résultats. Une part substantielle des diplômés visés et des startups soutenues devrait concerner des femmes ou des entreprises qu'elles dirigent.",
            "Cette cible suppose des mesures spécifiques : sensibilisation en amont, dispositifs de mentorat, aménagement des conditions de formation et suivi désagrégé des inscriptions et des sorties.",
          ],
          en: [
            "Women's inclusion is not a side note: it is a quantified, tracked target of the results framework. A substantial share of the graduates targeted and of the startups supported should be women or women-led.",
            "That target requires specific measures: upstream outreach, mentoring schemes, adapted training conditions and disaggregated tracking of enrolment and completion.",
          ],
        },
        points: [
          { fr: "environ un tiers de femmes parmi les diplômés visés", en: "around a third women among the graduates targeted" },
          { fr: "une part significative de startups dirigées par des femmes", en: "a significant share of women-led startups" },
          { fr: "mentorat et accompagnement dédiés", en: "dedicated mentoring and guidance" },
        ],
      },
      {
        n: "06", slug: "contenu-local", img: "data",
        titre: { fr: "Le contenu local et l'économie numérique", en: "Local content and the digital economy" },
        corps: {
          fr: [
            "Un réseau performant ne sert pleinement le pays que si des services et des contenus congolais y circulent. La sous-composante 3.2 soutient la production de contenus locaux, l'hébergement national et le développement de services numériques adaptés aux usages du pays.",
            "L'enjeu est aussi économique : héberger et produire localement retient de la valeur sur le territoire, réduit les coûts de transit international et améliore la qualité perçue des services.",
          ],
          en: [
            "A high-performing network only fully serves the country if Congolese services and content flow across it. Sub-component 3.2 supports local content production, national hosting and the development of digital services suited to the country's uses.",
            "The stakes are economic too: hosting and producing locally retains value in the country, reduces international transit costs and improves the perceived quality of services.",
          ],
        },
        points: [
          { fr: "appui à la production de contenus et de services locaux", en: "support to local content and service production" },
          { fr: "développement de l'hébergement national", en: "development of national hosting" },
          { fr: "structuration de la filière numérique congolaise", en: "structuring the Congolese digital sector" },
        ],
      },
    ],
    ecosysteme: {
      titre: { fr: "De la formation à l'emploi, une chaîne continue", en: "From training to employment, one continuous chain" },
      lead: {
        fr: "Former sans débouché, ou financer des startups sans compétences disponibles, ne produit rien de durable. La Composante 3 est conçue comme une chaîne : chaque maillon alimente le suivant.",
        en: "Training without outlets, or financing startups without available skills, produces nothing lasting. Component 3 is designed as a chain: each link feeds the next.",
      },
      couches: [
        { t: { fr: "Établissements", en: "Institutions" }, d: { fr: "équipés, connectés, enseignants formés", en: "equipped, connected, teachers trained" } },
        { t: { fr: "Formations", en: "Training" }, d: { fr: "parcours avancés alignés sur le marché", en: "advanced pathways aligned with the market" } },
        { t: { fr: "Diplômés", en: "Graduates" }, d: { fr: "plusieurs milliers de profils, dont une part importante de femmes", en: "several thousand profiles, a large share of them women" } },
        { t: { fr: "Hubs", en: "Hubs" }, d: { fr: "une dizaine de centres d'innovation en région", en: "around ten innovation centres in the regions" } },
        { t: { fr: "Startups", en: "Startups" }, d: { fr: "une centaine d'entreprises soutenues à la performance", en: "around a hundred companies supported on performance" } },
        { t: { fr: "Contenu local", en: "Local content" }, d: { fr: "services et emplois créés sur le territoire", en: "services and jobs created in the country" } },
      ],
    },
    finalite: {
      titre: { fr: "Des compétences qui restent au pays", en: "Skills that stay in the country" },
      lead: {
        fr: "L'objectif final de la Composante 3 est qu'à l'horizon du projet, la RDC dispose des compétences nécessaires pour faire vivre elle-même son écosystème numérique.",
        en: "Component 3's ultimate goal is for the DRC to hold, over the project horizon, the skills needed to run its own digital ecosystem.",
      },
      points: [
        { fr: "des jeunes formés à des métiers réellement demandés", en: "young people trained for genuinely in-demand jobs" },
        { fr: "des femmes présentes dans les métiers techniques du numérique", en: "women present in technical digital careers" },
        { fr: "des entreprises congolaises capables de servir le marché national", en: "Congolese companies able to serve the national market" },
        { fr: "une administration qui recrute des compétences disponibles localement", en: "an administration recruiting locally available skills" },
        { fr: "des solutions conçues pour les usages et les langues du pays", en: "solutions designed for the country's uses and languages" },
        { fr: "une capacité d'innovation qui survit à la fin du projet", en: "an innovation capacity that outlives the project" },
      ],
    },
    responsable: {
      role: { fr: "Responsable de la Composante 3 — Compétences Numériques et Innovation", en: "Component 3 Lead — Digital Skills and Innovation" },
    },
    video: {
      titre: { fr: "Composante 3 — Compétences & innovation", en: "Component 3 — Skills & innovation" },
      duree: "5:01",
      poster: "formation",
    },
  },

  /* ======================================================================
     C4 — COORDINATION & GESTION                            [À VALIDER]
     ====================================================================== */
  {
    code: "C4",
    slug: "c4",
    img: "hub",
    titreLong: {
      fr: "Exécuter avec rigueur, mesurer et rendre compte",
      en: "Delivering with rigour, measuring and accounting",
    },
    soustitre: {
      fr: "La fonction d'exécution du projet : coordination, passation des marchés, gestion fiduciaire, suivi-évaluation, sauvegardes environnementales et sociales, et redevabilité envers les citoyens comme envers les bailleurs.",
      en: "The project's execution function: coordination, procurement, fiduciary management, monitoring and evaluation, environmental and social safeguards, and accountability to citizens and donors alike.",
    },
    problematique: {
      titre: {
        fr: "Le facteur limitant n'est pas le financement : c'est la capacité à l'exécuter proprement.",
        en: "The binding constraint is not financing: it is the capacity to spend it properly.",
      },
      lead: {
        fr: "Un accord signé ne construit rien. Entre la signature et la mise en service, il y a des dossiers d'appel d'offres à préparer, des avis de non-objection à obtenir, des instruments environnementaux et sociaux à faire valider, des contrats à superviser et des résultats à mesurer sur vingt-six provinces. C'est cette chaîne, et non l'enveloppe, qui détermine le rythme réel du projet.",
        en: "A signed agreement builds nothing. Between signature and commissioning there are bidding documents to prepare, no-objections to obtain, environmental and social instruments to clear, contracts to supervise and results to measure across twenty-six provinces. That chain, not the envelope, sets the project's real pace.",
      },
      axes: [
        {
          t: { fr: "Un projet multi-bailleurs, multi-secteurs, à l'échelle nationale", en: "A multi-donor, multi-sector project at national scale" },
          d: {
            fr: "Le projet mobilise plusieurs ministères bénéficiaires, deux cofinanceurs avec leurs propres procédures, des travaux d'infrastructure et des prestations intellectuelles passés selon des règles internationales, et des sauvegardes à appliquer sur le terrain. Chacun de ces registres a ses délais propres, et ils ne s'additionnent pas : ils s'imbriquent.",
            en: "The project mobilises several beneficiary ministries, two co-financiers with their own procedures, infrastructure works and consultancy services procured under international rules, and safeguards to apply on the ground. Each of these strands has its own timelines, and they do not simply add up: they interlock.",
          },
        },
        {
          t: { fr: "Un maillon mal préparé se paie en mois, pas en jours", en: "A poorly prepared link costs months, not days" },
          d: {
            fr: "Un dossier d'appel d'offres incomplet retarde l'avis de non-objection ; l'avis retardé décale la publication ; la publication décalée fait manquer la fenêtre de travaux et repousse le chantier à la saison suivante. De même, un instrument de sauvegarde non divulgué avant travaux bloque le démarrage. Les retards ne s'ajoutent pas les uns aux autres, ils se composent.",
            en: "An incomplete bidding document delays the no-objection; a delayed no-objection pushes back publication; delayed publication misses the works window and defers the site to the next season. Likewise, a safeguard instrument not disclosed before works blocks the start. Delays do not add up; they compound.",
          },
        },
        {
          t: { fr: "Un décaissement lent est une perte sèche", en: "Slow disbursement is a dead loss" },
          d: {
            fr: "Les financements ont une date limite de décaissement : ce qui n'a pas été engagé et payé dans la fenêtre n'est pas reporté, il est perdu pour le pays. À cette perte financière s'ajoute une perte de crédit : un projet incapable de démontrer la traçabilité de ses décisions fragilise la confiance qui conditionne les financements suivants.",
            en: "Financing comes with a disbursement deadline: what has not been committed and paid within the window is not carried over, it is lost to the country. To that financial loss is added a loss of credit: a project unable to demonstrate the traceability of its decisions weakens the confidence on which the next financing depends.",
          },
        },
      ],
      appui: {
        fr: [
          "C'est la raison pour laquelle la gestion du projet est une composante à part entière, et non une ligne de frais généraux. Planifier, passer les marchés, contractualiser, superviser et mesurer sont des fonctions productives : elles déterminent la part du financement qui se transforme effectivement en kilomètres de fibre, en plateformes en service et en diplômés.",
          "La redevabilité relève de la même logique. Publier les avis, rendre publiques les attributions, ouvrir le dépôt documentaire et faire fonctionner un mécanisme de plaintes accessible ne sont pas des exercices de communication : ce sont les dispositifs qui rendent l'exécution contestable, donc corrigeable, avant que l'erreur ne devienne coûteuse.",
          "Enfin, cette composante porte la protection des personnes et de l'environnement. Un chantier de fibre traverse des terrains, des activités et des communautés ; il crée des risques sociaux, dont ceux de violences basées sur le genre, que le projet doit prévenir et traiter selon des règles écrites à l'avance, non improvisées au moment où le problème survient.",
        ],
        en: [
          "This is why project management is a component in its own right, not an overhead line. Planning, procuring, contracting, supervising and measuring are productive functions: they determine how much of the financing actually turns into kilometres of fibre, platforms in service and graduates.",
          "Accountability follows the same logic. Publishing notices, making awards public, opening the document repository and operating an accessible grievance mechanism are not communication exercises: they are the arrangements that make delivery contestable, and therefore correctable, before an error becomes costly.",
          "Finally, this component carries the protection of people and the environment. A fibre worksite crosses land, activities and communities; it creates social risks, including gender-based violence, that the project must prevent and address under rules written in advance, not improvised when the problem arises.",
        ],
      },
      liens: [
        { code: "C1", t: { fr: "Le rythme de déploiement des réseaux dépend directement de la qualité et du calendrier de la passation.", en: "The pace of network deployment depends directly on the quality and timing of procurement." } },
        { code: "C2", t: { fr: "Les plateformes de l'État se contractualisent et se réceptionnent selon les mêmes règles fiduciaires.", en: "State platforms are contracted and accepted under the same fiduciary rules." } },
        { t: { fr: "Bailleurs : les avis de non-objection sont des points de passage obligés, à anticiper dans le calendrier.", en: "Donors: no-objections are mandatory checkpoints, to be anticipated in the schedule." } },
        { t: { fr: "Communautés affectées : consultation, sauvegardes et mécanisme de plaintes conditionnent le démarrage des travaux.", en: "Affected communities: consultation, safeguards and the grievance mechanism condition the start of works." } },
      ],
    },
    chapeau: {
      fr: [
        "La Composante 4 couvre les fonctions d'exécution du projet : coordination et pilotage, passation des marchés, gestion fiduciaire et audits, suivi-évaluation, sauvegardes environnementales et sociales, mécanisme de gestion des plaintes, communication et engagement citoyen. Elle ne construit pas d'infrastructure et ne forme pas directement ; elle rend possible ce que font les trois autres composantes.",
        "Son cycle de travail est le même quel que soit l'objet du marché : traduire le manuel d'exécution en plan de travail et de passation daté, mettre en concurrence selon les Règlements de Passation de la Banque mondiale, évaluer et obtenir l'avis de non-objection du bailleur, contractualiser, superviser l'exécution, puis mesurer et rendre compte. Ce cycle est reproductible : c'est ce qui permet de traiter simultanément des marchés de travaux, de fournitures et de prestations intellectuelles.",
        "Le suivi-évaluation s'appuie sur le cadre de résultats du projet et sur des outils de suivi géoréférencé, de manière à rapporter l'avancement province par province plutôt qu'en moyenne nationale — une exigence directement liée à l'étendue du territoire couvert.",
        "Le partage des rôles est intangible. Les ministères définissent la politique et exercent la tutelle ; les organes de gouvernance orientent et arbitrent ; l'Unité exécute, mesure et rend compte. Le Manuel d'Exécution du Projet reste la source de vérité : l'Unité l'applique sans le réécrire, et les prérogatives des cofinanceurs sont intégralement préservées.",
      ],
      en: [
        "Component 4 covers the project's delivery functions: coordination and steering, procurement, fiduciary management and audits, monitoring and evaluation, environmental and social safeguards, the grievance mechanism, communication and citizen engagement. It builds no infrastructure and trains no one directly; it makes possible what the other three components do.",
        "Its working cycle is the same whatever the object of the contract: translate the implementation manual into a dated work and procurement plan, compete under the World Bank Procurement Regulations, evaluate and obtain the donor's no-objection, contract, supervise delivery, then measure and account. That cycle is repeatable: it is what allows works, goods and consultancy contracts to be handled in parallel.",
        "Monitoring and evaluation draws on the project's results framework and on geo-referenced tracking tools, so that progress is reported province by province rather than as a national average — a requirement that follows directly from the extent of the territory covered.",
        "The division of roles is not negotiable. Ministries set policy and exercise oversight; the governance bodies steer and arbitrate; the Unit delivers, measures and accounts. The Project Implementation Manual remains the source of truth: the Unit applies it without rewriting it, and co-financiers' prerogatives are fully preserved.",
      ],
    },
    objectifs: [
      { fr: "coordonner l'ensemble des composantes et des parties prenantes du projet", en: "coordinate all the project's components and stakeholders" },
      { fr: "conduire une passation des marchés ouverte, concurrentielle et traçable", en: "run open, competitive and traceable procurement" },
      { fr: "sécuriser les flux financiers et préparer les audits", en: "safeguard financial flows and prepare audits" },
      { fr: "suivre et évaluer les résultats au regard du cadre 2029", en: "monitor and evaluate results against the 2029 framework" },
      { fr: "appliquer les normes environnementales et sociales sur toutes les activités", en: "apply environmental and social standards across all activities" },
      { fr: "faire fonctionner un mécanisme de gestion des plaintes accessible et traçable", en: "operate an accessible, traceable grievance mechanism" },
      { fr: "assurer la communication institutionnelle et l'engagement citoyen", en: "ensure institutional communication and citizen engagement" },
      { fr: "rendre compte aux citoyens, aux institutions et aux bailleurs", en: "account to citizens, institutions and donors" },
    ],
    projets: [
      {
        n: "01", slug: "coordination", img: "hub",
        titre: { fr: "La coordination et le pilotage du projet", en: "Project coordination and steering" },
        corps: {
          fr: [
            "La gouvernance du projet s'articule sur trois niveaux : le Comité de Pilotage (COPIL) pour l'orientation stratégique, le Comité Technique du Projet (CTP) pour la préparation et le suivi technique, et l'UGPTN pour l'exécution.",
            "La Composante 4 finance le fonctionnement de ce dispositif : préparation des sessions, plan de travail et budget annuel (PTBA), articulation avec les ministères bénéficiaires et relation avec les bailleurs.",
          ],
          en: [
            "Project governance operates at three levels: the Steering Committee (COPIL) for strategic orientation, the Project Technical Committee (CTP) for technical preparation and follow-up, and the UGPTN for execution.",
            "Component 4 finances how this operates: preparing sessions, the annual work plan and budget (AWPB), articulation with beneficiary ministries and the relationship with donors.",
          ],
        },
        points: [
          { fr: "COPIL semestriel · CTP trimestriel · UGPTN permanente", en: "semi-annual COPIL · quarterly CTP · permanent UGPTN" },
          { fr: "plan de travail et budget annuel (PTBA)", en: "annual work plan and budget (AWPB)" },
          { fr: "coordination avec les ministères et institutions bénéficiaires", en: "coordination with beneficiary ministries and institutions" },
        ],
      },
      {
        n: "02", slug: "passation", img: "ville",
        titre: { fr: "La passation des marchés", en: "Procurement" },
        corps: {
          fr: [
            "Toute la commande publique du projet suit les Règlements de Passation des Marchés de la Banque mondiale : concurrence ouverte, méthodes affichées, évaluation traçable, avis de non-objection du bailleur et publication des résultats.",
            "Les avis sont publiés sur le site du projet et suivis dans STEP, le système de suivi des marchés de la Banque mondiale. Les entreprises candidates disposent d'un espace soumissionnaire dédié.",
          ],
          en: [
            "All project procurement follows the World Bank Procurement Regulations: open competition, published methods, traceable evaluation, donor no-objection and publication of results.",
            "Notices are published on the project website and tracked in STEP, the World Bank's procurement tracking system. Bidding companies have a dedicated bidder space.",
          ],
        },
        points: [
          { fr: "Règlements de Passation de la Banque mondiale (2025)", en: "World Bank Procurement Regulations (2025)" },
          { fr: "avis publiés et attributions rendues publiques", en: "notices published and awards made public" },
          { fr: "suivi dans STEP et avis de non-objection préalables", en: "tracked in STEP with prior no-objection" },
        ],
      },
      {
        n: "03", slug: "fiduciaire", img: "data",
        titre: { fr: "La gestion fiduciaire et les audits", en: "Fiduciary management and audits" },
        corps: {
          fr: [
            "Le pôle fiduciaire sécurise les flux financiers du projet : compte désigné, exécution des décaissements, comptabilité, rapports financiers intermédiaires et préparation des audits externes.",
            "Cette fonction conditionne la confiance des cofinanceurs et la continuité des décaissements sur toute la durée du projet, jusqu'à la date limite fixée au 30 avril 2030.",
          ],
          en: [
            "The fiduciary cluster safeguards the project's financial flows: designated account, disbursement execution, accounting, interim financial reports and preparation of external audits.",
            "This function conditions co-financiers' confidence and the continuity of disbursements throughout the project, up to the deadline of 30 April 2030.",
          ],
        },
        points: [
          { fr: "compte désigné et exécution des décaissements", en: "designated account and disbursement execution" },
          { fr: "rapports financiers périodiques", en: "periodic financial reports" },
          { fr: "audits externes annuels", en: "annual external audits" },
        ],
      },
      {
        n: "04", slug: "suivi-evaluation", img: "datacenter",
        titre: { fr: "Le suivi-évaluation", en: "Monitoring and evaluation" },
        corps: {
          fr: [
            "Le suivi-évaluation mesure l'avancement réel du projet au regard du cadre de résultats : des indicateurs d'objectif de développement (ODP) et des indicateurs intermédiaires, suivis sur les 26 provinces.",
            "Les données sont collectées et consolidées à l'aide des outils de système d'information de gestion et de suivi géoréférencé, ce qui permet de rapporter l'avancement territoire par territoire plutôt qu'en moyenne nationale.",
          ],
          en: [
            "Monitoring and evaluation measures the project's real progress against the results framework: development objective indicators (PDO) and intermediate indicators, tracked across the 26 provinces.",
            "Data is collected and consolidated using management information and geo-referenced monitoring tools, allowing progress to be reported territory by territory rather than as a national average.",
          ],
        },
        points: [
          { fr: "indicateurs d'objectif et indicateurs intermédiaires", en: "objective and intermediate indicators" },
          { fr: "suivi sur les 26 provinces", en: "tracking across all 26 provinces" },
          { fr: "données désagrégées, notamment par genre", en: "disaggregated data, notably by gender" },
        ],
      },
      {
        n: "05", slug: "sauvegardes", img: "citoyens",
        titre: { fr: "Les sauvegardes environnementales et sociales", en: "Environmental and social safeguards" },
        corps: {
          fr: [
            "Les travaux d'infrastructure financés par le projet — pose de fibre, construction de sites, aménagements — sont soumis aux Normes Environnementales et Sociales (NES) de la Banque mondiale.",
            "Avant travaux, les instruments environnementaux et sociaux sont préparés, consultés publiquement et divulgués. Les communautés affectées sont consultées, et un dispositif spécifique prévient et traite les risques de violences basées sur le genre, d'exploitation et d'abus sexuels.",
          ],
          en: [
            "The infrastructure works financed by the project — fibre laying, site construction, civil works — are subject to the World Bank's Environmental and Social Standards (ESS).",
            "Before works begin, environmental and social instruments are prepared, publicly consulted and disclosed. Affected communities are consulted, and a specific mechanism prevents and handles risks of gender-based violence, sexual exploitation and abuse.",
          ],
        },
        points: [
          { fr: "instruments E&S préparés et divulgués avant travaux", en: "E&S instruments prepared and disclosed before works" },
          { fr: "consultations publiques des communautés affectées", en: "public consultation of affected communities" },
          { fr: "dispositif dédié de prévention et de traitement des risques VBG/EAS", en: "dedicated GBV/SEA prevention and response arrangements" },
        ],
      },
      {
        n: "06", slug: "mgp", img: "femmes",
        titre: { fr: "Le Mécanisme de Gestion des Plaintes", en: "The Grievance Redress Mechanism" },
        statut: { fr: "Redevabilité", en: "Accountability" },
        corps: {
          fr: [
            "Le Mécanisme de Gestion des Plaintes (MGP) recueille, classe, instruit et clôt chaque doléance liée au projet, avec un objectif public : un traitement dans un délai de 30 jours.",
            "Quatre modes de dépôt sont ouverts — formulaire en ligne, SMS et numéro vert gratuit, courrier électronique, point focal physique en province — et six langues sont prévues. Un canal confidentiel et strictement séparé traite les cas de violences basées sur le genre, d'exploitation et d'abus sexuels, avec un référencement vers les services sous 24 heures.",
          ],
          en: [
            "The Grievance Redress Mechanism (GRM) receives, classifies, investigates and closes every project-related grievance, with a public objective: handling within 30 days.",
            "Four filing channels are open — online form, SMS and free toll-free number, email, and physical focal points in the provinces — in six languages. A confidential, strictly separate channel handles gender-based violence, sexual exploitation and abuse cases, with referral to services within 24 hours.",
          ],
        },
        points: [
          { fr: "un délai de traitement visé de 30 jours", en: "a target handling time of 30 days" },
          { fr: "4 modes de dépôt · 6 langues · numéro vert 24/7", en: "4 filing channels · 6 languages · 24/7 toll-free number" },
          { fr: "canal confidentiel EAS/HS centré sur la survivante", en: "confidential, survivor-centred SEA/SH channel" },
        ],
      },
      {
        n: "07", slug: "communication", img: "ville",
        titre: { fr: "La communication et l'engagement citoyen", en: "Communication and citizen engagement" },
        corps: {
          fr: [
            "Un projet public de cette ampleur doit être compréhensible par celles et ceux qu'il concerne. La Composante 4 finance la communication institutionnelle du projet, la publication documentaire et les dispositifs d'engagement citoyen.",
            "Cela recouvre le site institutionnel et son dépôt de documents divulgables, les consultations publiques, les événements — forums, ateliers, webinaires — et la publication régulière de l'avancement.",
          ],
          en: [
            "A public project of this scale must be understandable to the people it concerns. Component 4 finances the project's institutional communication, document publication and citizen engagement arrangements.",
            "This covers the institutional website and its repository of disclosable documents, public consultations, events — forums, workshops, webinars — and regular publication of progress.",
          ],
        },
        points: [
          { fr: "publication des documents divulgables (NES 10)", en: "publication of disclosable documents (ESS 10)" },
          { fr: "consultations publiques et événements", en: "public consultations and events" },
          { fr: "information régulière sur l'avancement du projet", en: "regular reporting on project progress" },
        ],
      },
    ],
    ecosysteme: {
      titre: { fr: "Du financement aux résultats, en cinq temps", en: "From financing to results, in five moves" },
      lead: {
        fr: "L'Unité transforme un accord de financement en connectivité, en services et en compétences, par un cycle discipliné et reproductible.",
        en: "The Unit turns a financing agreement into connectivity, services and skills, through a disciplined, repeatable cycle.",
      },
      couches: [
        { t: { fr: "Planifier", en: "Plan" }, d: { fr: "traduire le MEP en plan daté (PTBA / PPM)", en: "translate the PIM into a dated plan (AWPB / PP)" } },
        { t: { fr: "Passer les marchés", en: "Procure" }, d: { fr: "mettre en concurrence, ouvert et traçable", en: "compete openly and traceably" } },
        { t: { fr: "Contractualiser", en: "Contract" }, d: { fr: "évaluer, obtenir l'ANO, engager", en: "evaluate, obtain no-objection, engage" } },
        { t: { fr: "Exécuter & superviser", en: "Deliver & supervise" }, d: { fr: "qualité, normes, sauvegardes", en: "quality, standards, safeguards" } },
        { t: { fr: "Mesurer & rendre compte", en: "Measure & account" }, d: { fr: "indicateurs, audits, publication", en: "indicators, audits, publication" } },
      ],
    },
    finalite: {
      titre: { fr: "Ce à quoi l'Unité s'engage", en: "How the Unit holds itself accountable" },
      lead: {
        fr: "La Composante 4 n'a pas de résultat visible propre : sa réussite se lit dans la qualité d'exécution des trois autres.",
        en: "Component 4 has no visible result of its own: its success is read in the delivery quality of the other three.",
      },
      points: [
        { fr: "chaque avis publié, chaque attribution rendue publique", en: "every notice published, every award made public" },
        { fr: "chaque processus daté et journalisé, de bout en bout", en: "every process dated and logged, end to end" },
        { fr: "chaque plainte instruite, dans un délai visé de 30 jours", en: "every grievance investigated, within a target of 30 days" },
        { fr: "les personnes et l'environnement protégés à chaque étape", en: "people and the environment protected at every step" },
        { fr: "des données cloisonnées et des règles d'accès strictes", en: "siloed data and strict access rules" },
        { fr: "les prérogatives des bailleurs intégralement préservées", en: "donor prerogatives fully preserved" },
      ],
    },
    responsable: {
      nom: "Noël Jean-David Litanga",
      role: { fr: "Coordonnateur national — UGPTN", en: "National Coordinator — UGPTN" },
      img: "/portraits/coordonnateur-litanga.jpg",
      bio: {
        fr: "La Composante 4 est portée directement par la coordination de l'Unité, appuyée par les pôles fiduciaire, passation, suivi-évaluation et sauvegardes.",
        en: "Component 4 is carried directly by the Unit's coordination, supported by the fiduciary, procurement, M&E and safeguards clusters.",
      },
    },
    video: {
      titre: { fr: "Composante 4 — Coordination & gestion", en: "Component 4 — Coordination & management" },
      duree: "2:54",
      poster: "hub",
    },
  },

  /* ======================================================================
     C5 — RÉPONSE D'URGENCE (CERC) — page courte            [À VALIDER]
     ====================================================================== */
  {
    code: "C5",
    slug: "c5",
    img: "tour",
    titreLong: {
      fr: "Une réserve d'intervention, mobilisable sans délai",
      en: "A response reserve, mobilisable without delay",
    },
    soustitre: {
      fr: "La composante de réponse d'urgence contingente (CERC) n'est pas dotée à ce stade : c'est un mécanisme, pas un programme de dépenses.",
      en: "The Contingent Emergency Response Component (CERC) is unfunded at this stage: it is a mechanism, not a spending programme.",
    },
    problematique: {
      titre: {
        fr: "En situation de crise, le premier coût est le temps perdu à renégocier.",
        en: "In a crisis, the first cost is the time lost renegotiating.",
      },
      lead: {
        fr: "La Composante 5 ne finance rien tant qu'elle n'est pas activée. Sa raison d'être est procédurale : préparer à froid les règles d'une réaffectation d'urgence, pour que la rapidité ne se paie pas en contrôle au moment où un choc survient.",
        en: "Component 5 finances nothing until it is activated. Its purpose is procedural: to set the rules of an emergency reallocation in calm conditions, so that speed does not come at the expense of control when a shock hits.",
      },
      axes: [
        {
          t: { fr: "Un pays exposé à des chocs récurrents", en: "A country exposed to recurrent shocks" },
          d: {
            fr: "Épidémies, déplacements de population, aléas naturels : la République Démocratique du Congo connaît des crises qui frappent souvent les mêmes provinces que celles où le projet déploie ses infrastructures. L'hypothèse d'un choc pendant la durée d'exécution n'est pas théorique ; elle doit être anticipée dans la conception même du financement.",
            en: "Epidemics, population displacement, natural hazards: the Democratic Republic of the Congo experiences crises that often strike the same provinces where the project is deploying its infrastructure. The assumption of a shock during implementation is not theoretical; it must be anticipated in the design of the financing itself.",
          },
        },
        {
          t: { fr: "Un accord de financement se rouvre lentement", en: "A financing agreement reopens slowly" },
          d: {
            fr: "Modifier un accord signé suppose une instruction, des validations internes chez chaque partenaire et une formalisation juridique : un processus qui se compte en mois. En situation d'urgence, ce délai devient la contrainte déterminante — non par mauvaise volonté, mais parce que la procédure ordinaire n'a pas été conçue pour cette temporalité.",
            en: "Amending a signed agreement requires appraisal, internal clearances at each partner and legal formalisation: a process measured in months. In an emergency, that delay becomes the binding constraint — not through ill will, but because the ordinary procedure was not designed for that timescale.",
          },
        },
        {
          t: { fr: "Sans cadre préétabli, l'urgence s'arbitre dans l'improvisation", en: "Without a pre-agreed framework, emergencies are arbitrated on the fly" },
          d: {
            fr: "À défaut de mécanisme prévu, les réaffectations se décident sous pression, avec des règles définies au moment même où elles s'appliquent. C'est la configuration qui expose le plus aux erreurs d'affectation et aux contestations ultérieures, alors même que la traçabilité importe davantage en période exceptionnelle qu'en régime courant.",
            en: "Absent a foreseen mechanism, reallocations are decided under pressure, with rules defined at the very moment they are applied. That is the configuration most exposed to misallocation and to later challenge — precisely when traceability matters more than in ordinary times.",
          },
        },
      ],
      appui: {
        fr: [
          "La composante de réponse d'urgence contingente répond à cette difficulté par un choix simple : écrire les règles avant la crise. Les cas d'éligibilité, la séquence d'activation, les dépenses admissibles et les obligations de reddition de comptes sont définis dès la conception du projet, de sorte qu'une décision rapide reste une décision encadrée.",
          "Sa dotation nulle est délibérée, et non un oubli. Immobiliser des fonds dans une ligne contingente reviendrait à les retirer aux composantes qui construisent, pour couvrir un événement qui peut ne pas survenir. Le mécanisme mobilise donc, le cas échéant, des ressources déjà engagées ailleurs — ce qui a un coût d'opportunité assumé et rend l'arbitrage explicite.",
        ],
        en: [
          "The contingent emergency response component answers this difficulty with a simple choice: write the rules before the crisis. Eligibility cases, the activation sequence, admissible expenditure and accountability obligations are defined at project design, so that a fast decision remains a governed decision.",
          "Its zero allocation is deliberate, not an oversight. Tying up funds in a contingent line would mean withdrawing them from the components that build, to cover an event that may not occur. The mechanism therefore draws, where needed, on resources already committed elsewhere — an opportunity cost that is accepted and that makes the trade-off explicit.",
        ],
      },
      liens: [
        { code: "C4", t: { fr: "Même activée en urgence, la dépense reste soumise aux règles fiduciaires et de sauvegardes du projet.", en: "Even when triggered in an emergency, spending remains subject to the project's fiduciary and safeguard rules." } },
        { code: "C1", t: { fr: "Les infrastructures déployées sont elles-mêmes exposées aux chocs : leur remise en service peut relever de ce mécanisme.", en: "The infrastructure deployed is itself exposed to shocks: restoring it to service may fall under this mechanism." } },
        { t: { fr: "Gouvernance : l'activation suppose une demande formelle du Gouvernement et l'accord du bailleur.", en: "Governance: activation requires a formal government request and the donor's agreement." } },
      ],
    },
    chapeau: {
      fr: [
        "La Composante 5 est une composante de réponse d'urgence contingente — Contingent Emergency Response Component (CERC), un instrument standard des opérations financées par la Banque mondiale. Elle figure dans l'architecture du projet sans dotation, et n'engage aucune dépense tant qu'elle n'est pas activée.",
        "Son périmètre n'est pas thématique mais procédural. Elle ne porte pas d'activités propres : elle définit à l'avance dans quelles circonstances, selon quelle séquence et sous quelles conditions des ressources déjà engagées sur les autres composantes peuvent être réaffectées vers une réponse d'urgence.",
        "L'activation relève d'une décision conjointe : elle suppose une crise entrant dans les cas d'éligibilité prévus, une demande formelle du Gouvernement, puis l'accord du bailleur sur le principe et sur le périmètre des dépenses admissibles. Elle n'est ni automatique, ni à la main de l'Unité seule.",
        "Une fois activée, la composante ne suspend rien des règles ordinaires du projet : la passation, la gestion financière, les sauvegardes environnementales et sociales et la reddition de comptes continuent de s'appliquer. C'est précisément ce qui distingue un mécanisme d'urgence préparé d'une réaffectation improvisée.",
      ],
      en: [
        "Component 5 is a Contingent Emergency Response Component (CERC), a standard instrument in World Bank-financed operations. It appears in the project architecture without an allocation, and commits no expenditure until it is activated.",
        "Its scope is procedural rather than thematic. It carries no activities of its own: it defines in advance the circumstances, the sequence and the conditions under which resources already committed to the other components may be reallocated towards an emergency response.",
        "Activation is a joint decision: it requires a crisis falling within the foreseen eligibility cases, a formal request from the Government, then the donor's agreement on the principle and on the scope of admissible expenditure. It is neither automatic nor within the Unit's sole discretion.",
        "Once activated, the component suspends none of the project's ordinary rules: procurement, financial management, environmental and social safeguards and accountability continue to apply. That is precisely what distinguishes a prepared emergency mechanism from an improvised reallocation.",
      ],
    },
    objectifs: [
      { fr: "permettre une réaffectation rapide des ressources du projet en cas de crise éligible", en: "allow rapid reallocation of project resources in an eligible crisis" },
      { fr: "éviter la renégociation intégrale de l'accord de financement en situation d'urgence", en: "avoid full renegotiation of the financing agreement in an emergency" },
      { fr: "encadrer strictement les conditions d'activation et les dépenses éligibles", en: "strictly frame activation conditions and eligible expenditure" },
      { fr: "préserver la traçabilité et les règles fiduciaires même en contexte d'urgence", en: "preserve traceability and fiduciary rules even in an emergency context" },
    ],
    projets: [],
    finalite: {
      titre: { fr: "Comment la composante s'active", en: "How the component is activated" },
      lead: {
        fr: "L'activation n'est ni automatique ni discrétionnaire : elle suit une séquence encadrée par l'accord de financement et le Manuel d'Exécution du Projet.",
        en: "Activation is neither automatic nor discretionary: it follows a sequence framed by the financing agreement and the Project Implementation Manual.",
      },
      points: [
        { fr: "survenance d'une crise entrant dans les cas d'éligibilité prévus", en: "occurrence of a crisis falling within the foreseen eligibility cases" },
        { fr: "demande formelle d'activation adressée par le Gouvernement", en: "formal activation request submitted by the Government" },
        { fr: "accord du bailleur sur l'activation et sur le périmètre des dépenses", en: "donor agreement on activation and on the scope of expenditure" },
        { fr: "réaffectation de ressources depuis les autres composantes", en: "reallocation of resources from the other components" },
        { fr: "exécution selon les règles fiduciaires et de sauvegardes du projet", en: "execution under the project's fiduciary and safeguard rules" },
        { fr: "reddition de comptes au même titre que les autres composantes", en: "accountability on the same terms as the other components" },
      ],
    },
  },
];

/** Accès par code (« C2 ») ou par slug (« c2 »), insensible à la casse. */
export const composanteDetail = (key: string): ComposanteDetail | undefined => {
  const k = key.toLowerCase();
  return composantesDetail.find((c) => c.slug === k || c.code.toLowerCase() === k);
};

/** Tous les slugs, dans l'ordre C1 → C5 (generateStaticParams, pager). */
export const composanteSlugs = composantesDetail.map((c) => c.slug);
