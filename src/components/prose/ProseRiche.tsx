/**
 * Rendu d'un corps rédigé depuis la console — texte, visuels et graphiques.
 *
 * Le corps est du HTML assaini, à une exception près : les GRAPHIQUES n'y sont
 * pas dessinés, ils y sont DÉCRITS (cf. lib/html/graphique.ts). Ce composant est
 * l'endroit où la description redevient un dessin : il découpe le corps aux
 * figures de graphique, pose le HTML autour et confie chaque figure au
 * composant qui sait la tracer.
 *
 * ⚠️ Le corps est assaini une SECONDE fois ici, à l'affichage. Il l'est déjà à
 * l'écriture (cf. actions/admin-actualites.ts et actions/admin-documents.ts),
 * mais rien n'interdit qu'une ligne ait été insérée en base autrement que par la
 * console. Le coût est marginal, ces pages étant mises en cache.
 *
 * ─── Pourquoi le cas « aucun graphique » est traité à part ───────────────────
 *
 * Sans graphique — la quasi-totalité des articles existants — le composant rend
 * EXACTEMENT le même arbre qu'auparavant : un seul conteneur, un seul
 * `dangerouslySetInnerHTML`. C'est ce qui garantit qu'aucune page publiée ne
 * change d'apparence : la règle d'espacement `.actu-prose > * + *` s'applique
 * aux paragraphes eux-mêmes, sans niveau intermédiaire.
 *
 * Avec graphiques, les morceaux de texte sont bien enveloppés (`.prose-part`),
 * et la feuille de style rétablit l'espacement pour ce niveau supplémentaire.
 */
import type { CSSProperties } from "react";
import { sanitizeHtml } from "@/lib/html/sanitize";
import { decouperProse } from "@/lib/html/graphique";
import type { Lang } from "@/lib/pick";
import { Graphique } from "@/components/prose/Graphique";

export function ProseRiche({
  html,
  lang,
  className = "actu-prose",
  style,
}: {
  html: string;
  lang: Lang;
  /** Classe du conteneur. `actu-prose` est le gabarit de lecture du site. */
  className?: string;
  style?: CSSProperties;
}) {
  const propre = sanitizeHtml(html);
  const morceaux = decouperProse(propre);

  if (morceaux.length === 1 && morceaux[0].kind === "html") {
    return (
      <div className={className} style={style} dangerouslySetInnerHTML={{ __html: morceaux[0].html }} />
    );
  }

  return (
    <div className={className} style={style}>
      {morceaux.map((morceau, index) =>
        morceau.kind === "graphique" ? (
          <Graphique key={`graphique-${index}`} graphique={morceau.graphique} lang={lang} />
        ) : (
          <div
            key={`html-${index}`}
            className="prose-part"
            dangerouslySetInnerHTML={{ __html: morceau.html }}
          />
        ),
      )}
    </div>
  );
}
