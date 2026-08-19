/* Grille des indicateurs d'objectif du cadre de résultats.

   Le même bloc était écrit QUATRE fois à quelques pixels près — accueil, « Le
   Projet », « Résultats », et une variante filtrée sur les pages de composante.
   Les écarts n'étaient pas voulus : taille du chiffre, présence de l'étiquette
   de point de départ, mention de la part de femmes.

   Deux variantes, et la distinction porte le partage du propos entre les pages :

   · `apercu`  — accueil et « Le Projet ». La valeur et son libellé, rien de
     plus. Le lecteur voit qu'un cadre de résultats existe, et suit le lien.
   · `complet` — « Résultats » et pages de composante, qui portent la mesure.
     Point de départ, part de femmes, filets animés au survol.

   `codes` restreint la grille à certains indicateurs, ce dont une page de
   composante a besoin pour ceux qui lui sont rattachés. La grille passe alors
   en `auto-fit` : `grid-4` laisserait deux colonnes vides pour deux
   indicateurs.

   Les indicateurs viennent de la console (cf. lib/projet/query.ts). Ce
   composant est donc ASYNCHRONE : il lit la base lui-même plutôt que de le
   faire faire à ses cinq appelants, dont deux sont des blocs de section qui ne
   reçoivent que la langue. */
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { indicateurs } from "@/lib/projet/query";
import { Counter } from "@/components/ui/Counter";
import { FlowLines } from "@/components/ui/FlowLines";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export async function GrilleODP({
  lang,
  variante,
  codes,
}: {
  lang: Lang;
  variante: "apercu" | "complet";
  /** Restreint aux indicateurs listés. Sans filtre, tous les ODP publiés. */
  codes?: string[];
}) {
  const t = dict(lang);
  const complet = variante === "complet";
  const liste = await indicateurs("ODP", lang, codes);
  if (liste.length === 0) return null;

  return (
    <>
      {/* `RevealGroup` REMPLACE l'élément de grille et `RevealItem` la cellule :
          un conteneur intermédiaire ferait sauter les filets de 1 px. */}
      <RevealGroup className={`${codes ? "odp__grid" : "grid-4"} celled--dark`} gap={0.05}>
        {liste.map((o, i) => (
          <RevealItem fade={complet} key={o.id} className={complet ? "cell cell--fx odp__cell" : "cell odp__cell"}>
            {complet && <FlowLines variant={i} />}
            {o.code && <div className="mono odp__code">{o.code}</div>}
            <div className="stat__num odp__val">
              <span className="stat__approx">{t.lbl.approx}</span>
              {/* Le compteur n'anime qu'un nombre : une valeur rédigée
                  (« 10 000 », « IDA · AFD ») s'affiche telle qu'elle est saisie. */}
              {o.valeurNum !== null ? <Counter to={o.valeurNum} dur={1300} /> : o.valeur}
              <span className="odp__unit">{o.unit}</span>
            </div>
            <div className="odp__label">{o.label}</div>
            {complet && (o.baseline || o.note) && (
              <div className="odp__tags">
                {o.baseline && <span className="mono odp__tag">{t.lbl.baseline}: {o.baseline}</span>}
                {o.note && <span className="mono odp__tag odp__tag--ac">{o.note}</span>}
              </div>
            )}
          </RevealItem>
        ))}
      </RevealGroup>
      <p className="stat__note stat__note--dark">{t.lbl.indicatif}</p>
    </>
  );
}
