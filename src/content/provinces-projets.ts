/**
 * Projets affichés sur les pages province — état initial du module
 * « Provinces » (cf. lib/provinces/bootstrap.ts), et repli de la page publique
 * tant qu'aucun projet n'est publié en base.
 *
 * Source : les projets phares des composantes (content/composantes-detail.ts),
 * dont le titre et la première phrase sont repris tels quels. Aucun n'est
 * rattaché à une province nommée dans les documents publiés : tous sont donc
 * amorcés NATIONAUX (`provinces: []`), affichés sur les 26 pages. La console
 * permet ensuite de les localiser, ou d'ajouter des projets propres à une
 * province.
 *
 * ⚠️ À VALIDER par l'Unité avant d'y voir des données du projet :
 *   · l'AVANCEMENT est une proposition. « En cours » est retenu pour ce que
 *     d'autres pages du site attestent déjà en activité — le fonctionnement de
 *     l'Unité (C4), l'appel d'offres du backbone (AOI/C1), le réseau de points
 *     focaux du MGP activé en février 2026 ; tout le reste est « Prévu ».
 *     Rien n'est « Achevé ».
 *   · les ODD sont un rattachement éditorial (cible principale, puis
 *     secondaire), pas une donnée du cadre de résultats.
 */
import type { Bilingual } from "@/lib/pick";
import type { Avancement, ProvinceProjetSeed } from "@/content/types";
import { composantesDetail } from "@/content/composantes-detail";

type Ligne = [composante: string, slug: string, avancement: Avancement, odd: number[]];

const LIGNES: Ligne[] = [
  ["C1", "backbone-fibre", "EN_COURS", [9, 17]],
  ["C1", "couverture-mobile", "PREVU", [9, 10]],
  ["C1", "institutions-connectees", "PREVU", [9, 16]],
  ["C1", "universites", "PREVU", [4, 9]],
  ["C1", "cadre-reglementaire", "PREVU", [9, 17]],
  ["C1", "inclusion", "PREVU", [10, 5]],
  ["C1", "connectivite-internationale", "PREVU", [9, 17]],
  ["C1", "ppp", "PREVU", [17, 8]],
  ["C2", "cloud-souverain", "PREVU", [9, 16]],
  ["C2", "govnet", "PREVU", [16, 9]],
  ["C2", "govsoc", "PREVU", [16]],
  ["C2", "dpi", "PREVU", [16, 9]],
  ["C2", "identification", "PREVU", [16, 10]],
  ["C2", "confiance-signature", "PREVU", [16]],
  ["C2", "gouvernance-donnees", "PREVU", [16, 17]],
  ["C2", "plan-directeur-egov", "PREVU", [16]],
  ["C2", "infrastructures-internet", "PREVU", [9]],
  ["C2", "capacites-institutions", "PREVU", [16, 4]],
  ["C3", "competences-avancees", "PREVU", [4, 8]],
  ["C3", "etablissements-superieur", "PREVU", [4]],
  ["C3", "hubs-innovation", "PREVU", [9, 8]],
  ["C3", "startups", "PREVU", [8, 9]],
  ["C3", "femmes-numerique", "PREVU", [5, 4]],
  ["C3", "contenu-local", "PREVU", [8]],
  ["C4", "coordination", "EN_COURS", [17, 16]],
  ["C4", "passation", "EN_COURS", [16]],
  ["C4", "fiduciaire", "EN_COURS", [16]],
  ["C4", "suivi-evaluation", "EN_COURS", [17]],
  ["C4", "sauvegardes", "EN_COURS", [5, 16]],
  ["C4", "mgp", "EN_COURS", [16]],
  ["C4", "communication", "EN_COURS", [16]],
];

/** Première phrase d'un paragraphe — le résumé d'une carte, pas l'article. */
const premierePhrase = (texte: string): string => {
  const fin = texte.search(/[.!?](\s|$)/);
  return fin === -1 ? texte : texte.slice(0, fin + 1);
};

export const provincesProjets: ProvinceProjetSeed[] = LIGNES.flatMap(([composante, slug, avancement, odd]) => {
  const projet = composantesDetail.find((c) => c.code === composante)?.projets.find((p) => p.slug === slug);
  if (!projet) return [];
  const resume: Bilingual = {
    fr: premierePhrase(projet.corps.fr[0] ?? ""),
    en: premierePhrase(projet.corps.en[0] ?? ""),
  };
  return [{ key: `${composante}-${slug}`, composante, avancement, odd, provinces: [], titre: projet.titre, resume }];
});
