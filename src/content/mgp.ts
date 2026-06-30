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
  { q: { fr: "Qui peut déposer une plainte ?", en: "Who can file a grievance?" }, r: { fr: "Toute personne, communauté ou organisation affectée par une activité du Projet — sans condition de nationalité, et gratuitement.", en: "Any person, community or organisation affected by a Project activity — with no nationality requirement, free of charge." } },
  { q: { fr: "Puis-je rester anonyme ?", en: "Can I remain anonymous?" }, r: { fr: "Oui. L'anonymat est possible ; il peut toutefois limiter notre capacité à revenir vers vous. Le canal confidentiel EAS/HS garantit en outre la stricte protection de l'identité.", en: "Yes. Anonymity is possible; it may, however, limit our ability to follow up with you. The confidential SEA/SH channel additionally guarantees strict identity protection." } },
  { q: { fr: "Sous quel délai aurai-je une réponse ?", en: "How quickly will I get a response?" }, r: { fr: "Accusé de réception immédiat avec numéro de référence ; traitement et réponse en 30 jours ou moins (engagement public, 100 % des griefs).", en: "Immediate acknowledgement with a reference number; processing and response in 30 days or less (public commitment, 100% of grievances)." } },
  { q: { fr: "Ma plainte peut-elle se retourner contre moi ?", en: "Could my grievance be used against me?" }, r: { fr: "Non. Aucune représaille n'est tolérée. Les données sont traitées de manière confidentielle et ne sont visibles que par les agents habilités.", en: "No. No retaliation is tolerated. Data is processed confidentially and visible only to authorised officers." } },
  { q: { fr: "Que se passe-t-il si je ne suis pas satisfait de la réponse ?", en: "What if I am not satisfied with the response?" }, r: { fr: "Un recours est possible : votre dossier est réexaminé à un niveau supérieur. Les voies de recours administratives et judiciaires de droit commun restent ouvertes.", en: "An appeal is possible: your case is re-examined at a higher level. Ordinary administrative and judicial remedies remain available." } },
  { q: { fr: "Le canal EAS/HS est-il vraiment séparé ?", en: "Is the SEA/SH channel truly separate?" }, r: { fr: "Oui. Il est strictement cloisonné, centré sur la survivante, et géré uniquement par le Spécialiste VBG/EAS. Aucune de ses données n'apparaît ailleurs sur le site.", en: "Yes. It is strictly siloed, survivor-centred, and managed solely by the GBV/SEA Specialist. None of its data appears elsewhere on the site." } },
];
