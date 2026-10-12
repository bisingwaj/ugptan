/* Actualités / communiqués institutionnels. */
import type { Actualite } from "./types";

export const actualites: Actualite[] = [
  {
    date: "23 juin 2025", dateISO: "2025-06-23", cat: { fr: "Institutionnel", en: "Institutional" }, img: "hub", lieu: "Kinshasa", comps: ["C4"],
    title: { fr: "Validation du Manuel d'Exécution du Projet par le Gouvernement, la Banque mondiale et l'AFD.", en: "Project Implementation Manual validated by the Government, the World Bank and AFD." },
    corps: {
      fr: [
        "Réunis à Kinshasa, les représentants du Gouvernement, de la Banque mondiale et de l'AFD ont validé le Manuel d'Exécution du Projet (MEP), document de référence qui fixe les règles de gouvernance, de passation, de gestion financière et de sauvegardes du PTN-RDC.",
        "Le MEP est désormais le document de référence du projet, que l'Unité applique.",
      ],
      en: [
        "Meeting in Kinshasa, representatives of the Government, the World Bank and AFD validated the Project Implementation Manual (PIM), the reference document setting out governance, procurement, financial-management and safeguard rules for the PTN-RDC.",
        "The PIM is now the project's reference document, which the Unit applies.",
      ],
    },
  },
  {
    date: "15 avr. 2025", dateISO: "2025-04-15", cat: { fr: "Gouvernance", en: "Governance" }, img: "ville", lieu: "Kinshasa", comps: ["C4"],
    title: { fr: "Création officielle de l'UGPTN par arrêté ministériel du MPTN.", en: "Official creation of the UGPTN by ministerial order of the MPTN." },
    corps: {
      fr: [
        "Par arrêté ministériel, le Ministre des Postes, Télécommunications et Numérique a institué l'Unité de Gestion du Projet de Transformation Numérique, structure d'exécution dotée de cinq pôles et de vingt-et-un sous-rôles.",
        "L'arrêté fixe l'articulation COPIL · CTP · UGPTN et maintient les prérogatives des bailleurs.",
      ],
      en: [
        "By ministerial order, the Minister of Posts, Telecommunications and Digital established the Digital Transformation Project Management Unit, an execution structure with five clusters and twenty-one sub-roles.",
        "The order sets out the COPIL · CTP · UGPTN arrangement and maintains donors' prerogatives.",
      ],
    },
  },
  {
    date: "14 mars 2025", dateISO: "2025-03-14", cat: { fr: "Financement", en: "Financing" }, img: "data", lieu: "Paris / Kinshasa",
    title: { fr: "Signature de la convention de financement avec l'Agence Française de Développement.", en: "Financing convention signed with the French Development Agency." },
    corps: {
      fr: [
        "La convention de financement signée avec l'Agence Française de Développement complète le financement de l'IDA (Banque mondiale).",
        "Ce cofinancement s'inscrit dans l'approche régionale de digitalisation inclusive.",
      ],
      en: [
        "The financing convention signed with the French Development Agency complements the World Bank's IDA financing.",
        "This co-financing is part of the regional inclusive-digitalisation approach.",
      ],
    },
  },
  {
    date: "31 octobre 2025", dateISO: "2025-10-31", cat: { fr: "Jalon", en: "Milestone" }, img: "fibre", lieu: "Kinshasa", comps: ["C1", "C4"],
    title: { fr: "Entrée en vigueur du Projet de Transformation Numérique de la RDC.", en: "Effectiveness of the DRC Digital Transformation Project." },
    corps: {
      fr: [
        "Les conditions d'entrée en vigueur étant remplies, le projet devient effectif : les décaissements peuvent commencer et les premiers marchés du Plan de Passation sont lancés.",
        "L'échéance d'achèvement technique est fixée au 31 décembre 2029, avec une date limite de décaissement IDA au 30 avril 2030.",
      ],
      en: [
        "With effectiveness conditions met, the project becomes operational: disbursements can begin and the first contracts of the Procurement Plan are launched.",
        "Technical completion is set for 31 December 2029, with an IDA disbursement deadline of 30 April 2030.",
      ],
    },
  },
];
