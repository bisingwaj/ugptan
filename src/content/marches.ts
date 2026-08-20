/* Méthodes de passation et parcours du soumissionnaire.
   ⚠️ Les AVIS ne vivent plus ici : ils viennent de DigiProcure, la plateforme
   de passation (cf. src/lib/digiprocure.ts). */
import type { MethodePassation, EtapeCandidature } from "./types";

/**
 * Les méthodes de passation, telles que les Règlements de la Banque mondiale
 * les nomment.
 *
 * ⚠️ L'avis à manifestation d'intérêt n'y figure pas, et c'est délibéré : ce
 * n'est pas une méthode mais la PREMIÈRE ÉTAPE d'une sélection de consultants
 * (SFQC, SBQ), celle qui produit la liste restreinte. Le présenter à côté de
 * l'appel d'offres international laissait croire à une procédure autonome. Il
 * reste en revanche un type d'avis, et à ce titre un filtre de la liste.
 */
export const marchesMethodes: MethodePassation[] = [
  { sigle: "AOI", label: { fr: "Appel d'Offres International", en: "International Competitive Bidding" } },
  { sigle: "AON", label: { fr: "Appel d'Offres National", en: "National Competitive Bidding" } },
  { sigle: "SFQC", label: { fr: "Sélection Fondée sur la Qualité et le Coût", en: "Quality- and Cost-Based Selection" } },
  { sigle: "SBQ", label: { fr: "Sélection Basée sur la Qualité", en: "Quality-Based Selection" } },
  { sigle: "DC", label: { fr: "Demande de Cotation", en: "Request for Quotation" } },
];

export const candidature: EtapeCandidature[] = [
  { n: "01", titre: { fr: "Créer un compte soumissionnaire", en: "Create a bidder account" }, desc: { fr: "Vérification d'identité de l'entreprise (KYC), faite une seule fois et valable pour tous les avis suivants.", en: "Company identity verification (KYC), done once and valid for every subsequent notice." } },
  { n: "02", titre: { fr: "Télécharger le dossier (DAO/RFP)", en: "Download the bidding documents" }, desc: { fr: "Pièces, calendrier et addenda. Un addendum peut modifier la date limite ou les exigences : il fait partie du dossier, pas du commentaire.", en: "Documents, schedule and addenda. An addendum may change the deadline or the requirements: it is part of the file, not a side note." } },
  { n: "03", titre: { fr: "Préparer et déposer l'offre", en: "Prepare and submit the bid" }, desc: { fr: "Dépôt électronique horodaté. Une pièce manquante à l'heure limite rend l'offre irrecevable, quelle qu'en soit la qualité technique.", en: "Timestamped electronic submission. A document missing at the deadline makes the bid inadmissible, whatever its technical quality." } },
  { n: "04", titre: { fr: "Suivi & attribution", en: "Tracking & award" }, desc: { fr: "Évaluation selon les critères annoncés, avis de non-objection du bailleur, puis publication du résultat — y compris le nom de l'attributaire.", en: "Evaluation against the announced criteria, donor no-objection, then publication of the result — including the awardee's name." } },
];

/* Les dix pièces de référence qui vivaient ici (MEP, PPSD, CGES…) sont passées
   au CMS : elles sont désormais servies par le module « Ressources &
   publications » sur /transparency. `scripts/seed-documents-transparence.mjs`
   les a reprises. Les garder en double aurait fait diverger la liste écrite en
   dur de celle que l'Unité tient à jour. */
