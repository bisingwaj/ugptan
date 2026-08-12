/* Mécanisme de Gestion des Plaintes (MGP) — catégories, pipeline, FAQ. */
import type { Bilingual } from "@/lib/pick";
import type { MgpFaqItem } from "./types";

export const mgpCategories: Bilingual[] = [
  { fr: "Technique", en: "Technical" },
  { fr: "Fiduciaire", en: "Fiduciary" },
  { fr: "Environnementale & sociale", en: "Environmental & social" },
  { fr: "Conduite du personnel", en: "Staff conduct" },
  { fr: "Autre", en: "Other" },
];

export const mgpPipeline: Bilingual[] = [
  { fr: "Réception", en: "Receipt" },
  { fr: "Classification", en: "Classification" },
  { fr: "Instruction", en: "Investigation" },
  { fr: "Décision", en: "Decision" },
  { fr: "Clôture", en: "Closure" },
];

export const mgpFaq: MgpFaqItem[] = [
  { q: { fr: "Qui peut déposer une plainte ?", en: "Who can file a grievance?" }, r: { fr: "Toute personne, communauté ou organisation concernée par une activité du Projet : riverain d'un chantier, usager d'un service, employé d'un prestataire, entreprise candidate. Il n'y a ni condition de nationalité, ni frais, ni obligation de passer par un intermédiaire.", en: "Anyone affected by a Project activity: a neighbour of a worksite, a service user, a contractor's employee, a bidding company. There is no nationality requirement, no fee, and no obligation to go through an intermediary." } },
  { q: { fr: "Puis-je rester anonyme ?", en: "Can I remain anonymous?" }, r: { fr: "Oui, et cela ne rend pas la plainte moins recevable. La seule conséquence est pratique : sans moyen de vous joindre, nous ne pouvons ni demander une précision ni vous communiquer la décision — conservez alors votre numéro de référence pour suivre le dossier. Le canal confidentiel EAS/HS applique une protection de l'identité plus stricte encore.", en: "Yes, and it does not make the grievance less admissible. The only consequence is practical: without a way to reach you, we can neither ask for clarification nor send you the decision — keep your reference number to follow the case. The confidential SEA/SH channel applies stricter identity protection still." } },
  { q: { fr: "Sous quel délai aurai-je une réponse ?", en: "How quickly will I get a response?" }, r: { fr: "Accusé de réception immédiat avec numéro de référence ; l'Unité vise un traitement et une réponse dans un délai de 30 jours.", en: "Immediate acknowledgement with a reference number; the Unit aims to process and respond within 30 days." } },
  { q: { fr: "Ma plainte peut-elle se retourner contre moi ?", en: "Could my grievance be used against me?" }, r: { fr: "Non. La plainte n'est pas communiquée à l'entreprise ou au service mis en cause sous une forme qui vous identifie, sauf si vous y consentez. Toute mesure de représailles constatée constitue elle-même un manquement instruit par le mécanisme. L'accès aux dossiers est limité aux agents habilités et journalisé.", en: "No. The grievance is not passed to the company or department concerned in a form that identifies you, unless you consent. Any retaliation observed is itself a breach investigated by the mechanism. Access to case files is limited to authorised officers and is logged." } },
  { q: { fr: "Que se passe-t-il si je ne suis pas satisfait de la réponse ?", en: "What if I am not satisfied with the response?" }, r: { fr: "Demandez le réexamen en citant votre numéro de référence : le dossier est repris à un niveau supérieur, par une personne qui n'a pas rendu la première décision. Saisir le mécanisme ne vous prive d'aucun droit : les voies administratives et judiciaires de droit commun, ainsi que le recours auprès du bailleur, restent ouvertes en parallèle.", en: "Request a review quoting your reference number: the case is taken up at a higher level, by someone who did not make the first decision. Using the mechanism deprives you of no rights: ordinary administrative and judicial remedies, and recourse to the donor, remain open in parallel." } },
  { q: { fr: "Le canal EAS/HS est-il vraiment séparé ?", en: "Is the SEA/SH channel truly separate?" }, r: { fr: "Oui. Il est strictement cloisonné, centré sur la survivante, et géré uniquement par le Spécialiste VBG/EAS. Aucune de ses données n'apparaît ailleurs sur le site.", en: "Yes. It is strictly siloed, survivor-centred, and managed solely by the GBV/SEA Specialist. None of its data appears elsewhere on the site." } },
];
