/**
 * Les 17 Objectifs de développement durable (Programme 2030 des Nations
 * unies) — intitulés courts officiels et couleurs de la charte ONU.
 */
import type { Bilingual } from "@/lib/pick";

export type Odd = { n: number; titre: Bilingual; couleur: string };

export const ODD: Odd[] = [
  { n: 1, couleur: "#E5243B", titre: { fr: "Pas de pauvreté", en: "No poverty" } },
  { n: 2, couleur: "#DDA63A", titre: { fr: "Faim « zéro »", en: "Zero hunger" } },
  { n: 3, couleur: "#4C9F38", titre: { fr: "Bonne santé et bien-être", en: "Good health and well-being" } },
  { n: 4, couleur: "#C5192D", titre: { fr: "Éducation de qualité", en: "Quality education" } },
  { n: 5, couleur: "#FF3A21", titre: { fr: "Égalité entre les sexes", en: "Gender equality" } },
  { n: 6, couleur: "#26BDE2", titre: { fr: "Eau propre et assainissement", en: "Clean water and sanitation" } },
  { n: 7, couleur: "#FCC30B", titre: { fr: "Énergie propre et d'un coût abordable", en: "Affordable and clean energy" } },
  { n: 8, couleur: "#A21942", titre: { fr: "Travail décent et croissance économique", en: "Decent work and economic growth" } },
  { n: 9, couleur: "#FD6925", titre: { fr: "Industrie, innovation et infrastructure", en: "Industry, innovation and infrastructure" } },
  { n: 10, couleur: "#DD1367", titre: { fr: "Inégalités réduites", en: "Reduced inequalities" } },
  { n: 11, couleur: "#FD9D24", titre: { fr: "Villes et communautés durables", en: "Sustainable cities and communities" } },
  { n: 12, couleur: "#BF8B2E", titre: { fr: "Consommation et production responsables", en: "Responsible consumption and production" } },
  { n: 13, couleur: "#3F7E44", titre: { fr: "Mesures relatives à la lutte contre les changements climatiques", en: "Climate action" } },
  { n: 14, couleur: "#0A97D9", titre: { fr: "Vie aquatique", en: "Life below water" } },
  { n: 15, couleur: "#56C02B", titre: { fr: "Vie terrestre", en: "Life on land" } },
  { n: 16, couleur: "#00689D", titre: { fr: "Paix, justice et institutions efficaces", en: "Peace, justice and strong institutions" } },
  { n: 17, couleur: "#19486A", titre: { fr: "Partenariats pour la réalisation des objectifs", en: "Partnerships for the goals" } },
];

export const oddParNumero = (n: number): Odd | undefined => ODD.find((o) => o.n === n);
