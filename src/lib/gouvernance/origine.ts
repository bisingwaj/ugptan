/**
 * Le contenu d'origine de la page « Gouvernance », recomposé.
 *
 * Il vivait à TROIS endroits, et c'est le vrai motif de ce module :
 *
 *   · les trois organes et leurs attributs — `src/content/data.ts` ;
 *   · la chronique de leurs décisions — `src/content/carbon.ts` ;
 *   · la COMPOSITION du comité de pilotage et du comité technique —
 *     `src/content/i18n.ts`, c'est-à-dire le dictionnaire de traduction, à
 *     côté des libellés d'interface.
 *
 * Ce troisième emplacement est une anomalie, pas un choix : `copilDesc`,
 * `copilMembers`, `ctpDesc` et `ctpMembers` sont du CONTENU, et le fait qu'ils
 * soient nommés d'après deux organes en toutes lettres est ce qui rendait la
 * section « Composition » incapable d'en accueillir un troisième — la page les
 * appelait par leur nom.
 *
 * Ce module les rassemble sous une seule forme, que deux consommateurs lisent :
 * le repli public tant que la base est vide (`lib/gouvernance/query.ts`) et la
 * reprise en console (`lib/gouvernance/bootstrap.ts`). Ils voient donc
 * exactement le même contenu d'origine, ce qui est la condition pour que la
 * bascule ne change rien à la page.
 */
import { dict } from "@/content/i18n";
import { gouvernance } from "@/content/data";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";

/** Un organe du contenu d'origine, résolu dans une langue. */
export type OrganeOrigine = {
  sigle: string;
  nom: string;
  nature: string;
  effectif: string;
  presidence: string;
  decision: string;
  frequence: string;
  /** `null` pour un organe que la page d'origine ne montrait pas en composition. */
  composition: string | null;
  membres: string[];
};

/**
 * Composition, par sigle.
 *
 * ⚠️ Les SIÈGES ne sont pas traduits, et c'est le contenu d'origine qui le veut :
 * `copilMembers` et `ctpMembers` sont des tableaux simples dans le
 * dictionnaire, servis à l'identique aux deux versions du site. Ce sont des
 * sigles d'institutions congolaises (« MPTN — Président », « MINFIN-CSPP »),
 * qui ne se traduisent pas davantage que les sous-rôles des pôles.
 *
 * La console, elle, les range par langue comme tout le reste : rien n'interdira
 * de franciser ou d'angliciser un intitulé le jour où il le faudra.
 */
function compositionOrigine(sigle: string, lang: Lang): { texte: string | null; membres: string[] } {
  const g = dict(lang).gouv;
  if (sigle === "COPIL") return { texte: g.copilDesc, membres: [...g.copilMembers] };
  if (sigle === "CTP") return { texte: g.ctpDesc, membres: [...g.ctpMembers] };
  // L'Unité a sa page entière : la page « Gouvernance » ne la détaillait pas ici.
  return { texte: null, membres: [] };
}

/** Les organes du contenu d'origine, dans l'ordre de l'arrêté. */
export const organesOrigine = (lang: Lang): OrganeOrigine[] =>
  gouvernance.map((organe) => {
    const composition = compositionOrigine(organe.sigle, lang);
    return {
      sigle: organe.sigle,
      nom: pick(organe.nom, lang),
      nature: pick(organe.nature, lang),
      effectif: pick(organe.effectif, lang),
      presidence: pick(organe.presidence, lang),
      decision: pick(organe.decision, lang),
      frequence: pick(organe.frequence, lang),
      composition: composition.texte,
      membres: composition.membres,
    };
  });
