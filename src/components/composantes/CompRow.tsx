/* Ligne de composante, cliquable vers sa page dédiée.

   Le même `.comp-row` était écrit deux fois en JSX — sur l'accueil en grille de
   quatre colonnes, sur « Le Projet » en bloc suivi d'une grille de
   sous-composantes — pour la même liste et les mêmes libellés.

   Une seule variante subsiste désormais, et c'est un choix de propos, pas de
   place : le détail des sous-composantes vit sur l'index `/components` et sur
   chaque page de composante. Une ligne d'aperçu qui recopiait déjà ce détail ne
   laissait plus de raison de cliquer. */
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import type { Composante } from "@/content/types";
import { compRoute } from "@/lib/routes";
import { compVar } from "@/lib/comp";

export function CompRow({ comp, lang }: { comp: Composante; lang: Lang }) {
  return (
    <Link href={compRoute(lang, comp.code)} className="comp-row comp-row--link" style={compVar(comp.code)}>
      <span className="mono comp-row__code">{comp.code}</span>
      <span className="comp-row__corps">
        <span className="comp-row__titre">{pick(comp.titre, lang)}</span>
        <span className="comp-row__desc">{pick(comp.desc, lang)}</span>
      </span>
      <span className="comp-row__go" aria-hidden>→</span>
    </Link>
  );
}
