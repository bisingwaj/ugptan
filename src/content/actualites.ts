/* Actualités / communiqués institutionnels. */
import type { Actualite } from "./types";

export const actualites: Actualite[] = [
  {
    date: "23 juin 2025", dateISO: "2025-06-23", cat: { fr: "Institutionnel", en: "Institutional" }, img: "hub", lieu: "Kinshasa",
    title: { fr: "Validation du Manuel d'Exécution du Projet par le Gouvernement, la Banque mondiale et l'AFD.", en: "Project Implementation Manual validated by the Government, the World Bank and AFD." },
    corps: {
      fr: [
        "Réunis à Kinshasa, les représentants du Gouvernement, de la Banque mondiale et de l'AFD ont validé le Manuel d'Exécution du Projet (MEP), document de référence qui fixe les règles de gouvernance, de passation, de gestion financière et de sauvegardes du PTN-RDC.",
        "Le MEP constitue désormais la source de vérité du projet : l'Unité l'applique sans le modifier, et chaque processus daté et tracé du site institutionnel en découle.",
      ],
      en: [
        "Meeting in Kinshasa, representatives of the Government, the World Bank and AFD validated the Project Implementation Manual (PIM), the reference document setting out governance, procurement, financial-management and safeguard rules for the PTN-RDC.",
        "The PIM is now the project's source of truth: the Unit applies it without altering it, and every dated, traceable process on the institutional site derives from it.",
      ],
    },
  },
  {
    date: "15 avr. 2025", dateISO: "2025-04-15", cat: { fr: "Gouvernance", en: "Governance" }, img: "ville", lieu: "Kinshasa",
    title: { fr: "Création officielle de l'UGPTAN par arrêté ministériel du MPTN.", en: "Official creation of the UGPTAN by ministerial order of the MPTN." },
    corps: {
      fr: [
        "Par arrêté ministériel, le Ministre des Postes, Télécommunications et Numérique a institué l'Unité de Gestion du Projet de Transformation Numérique, structure d'exécution dotée de cinq pôles et de vingt-et-un sous-rôles.",
        "L'arrêté consacre l'articulation COPIL · CTP · UGPTAN et préserve intégralement les prérogatives des bailleurs.",
      ],
      en: [
        "By ministerial order, the Minister of Posts, Telecommunications and Digital established the Digital Transformation Project Management Unit, an execution structure with five clusters and twenty-one sub-roles.",
        "The order enshrines the COPIL · CTP · UGPTAN articulation and fully preserves donors' prerogatives.",
      ],
    },
  },
  {
    date: "14 mars 2025", dateISO: "2025-03-14", cat: { fr: "Financement", en: "Financing" }, img: "data", lieu: "Paris / Kinshasa",
    title: { fr: "Signature de la convention de financement avec l'Agence Française de Développement.", en: "Financing convention signed with the French Development Agency." },
    corps: {
      fr: [
        "La convention de financement avec l'AFD apporte 110 millions de dollars (100 millions d'euros), soit 21 % de l'enveloppe globale de 510 millions, en cofinancement avec l'IDA de la Banque mondiale.",
        "Ce cofinancement consolide l'assise financière du projet et son ancrage dans l'approche régionale de digitalisation inclusive.",
      ],
      en: [
        "The financing convention with AFD provides 110 million dollars (100 million euros), i.e. 21% of the global 510-million envelope, co-financed with the World Bank's IDA.",
        "This co-financing consolidates the project's financial base and its anchoring in the regional inclusive-digitalisation approach.",
      ],
    },
  },
  {
    date: "31 oct. 2025", dateISO: "2025-10-31", cat: { fr: "Jalon", en: "Milestone" }, img: "fibre", lieu: "Kinshasa",
    title: { fr: "Entrée en vigueur du Projet de Transformation Numérique de la RDC.", en: "Effectiveness of the DRC Digital Transformation Project." },
    corps: {
      fr: [
        "Les conditions d'entrée en vigueur étant remplies, le projet devient effectif : les décaissements peuvent commencer et les premiers marchés structurants du Plan de Passation sont lancés.",
        "L'échéance d'achèvement technique est fixée au 31 décembre 2029, avec une date limite de décaissement IDA au 30 avril 2030.",
      ],
      en: [
        "With effectiveness conditions met, the project becomes operational: disbursements can begin and the first structuring contracts of the Procurement Plan are launched.",
        "Technical completion is set for 31 December 2029, with an IDA disbursement deadline of 30 April 2030.",
      ],
    },
  },
];
