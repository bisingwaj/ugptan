/* Ce que chaque composante attend des autres.

   Remplace, sur l'index, une seconde liste des cinq composantes en tableau qui
   redisait les cartes situées deux cents pixels plus haut. La question à
   laquelle l'index ne répondait pas était pourtant celle-ci : pourquoi cinq
   volets plutôt que cinq projets séparés.

   Rien n'est inventé : les renvois sont ceux rédigés dans la problématique de
   chaque composante, filtrés sur ceux qui désignent une AUTRE composante. Les
   renvois hors projet (énergie, cadre juridique) restent sur la page de la
   composante, où ils ont leur contexte. */
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import type { ComposanteVue } from "@/lib/projet/query";
import { compRoute } from "@/lib/routes";
import { compColor, onCompDe } from "@/lib/comp";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function CompChaine({ composantes, lang }: { composantes: ComposanteVue[]; lang: Lang }) {
  const dependLabel = dict(lang).comp.chaineDepend;
  const parCode = new Map(composantes.map((comp) => [comp.code.toUpperCase(), comp]));

  const blocs = composantes
    .map((comp) => ({
      comp,
      /* Un renvoi ne fait chaîne que s'il vise une composante SERVIE : viser une
         composante en brouillon, ou non traduite dans cette langue, donnerait un
         lien vers une page qui répond 404. */
      liens: (comp.problematique?.liens ?? []).filter(
        (lien) => lien.cible && parCode.has(lien.cible.toUpperCase()),
      ),
    }))
    .filter((bloc) => bloc.liens.length > 0);

  /* Aucune composante n'a de renvoi rédigé : la section disparaît plutôt que
     d'afficher une grille vide. */
  if (blocs.length === 0) return null;

  return (
    <RevealGroup className="celled-flow chaine" gap={0.05}>
      {blocs.map(({ comp, liens }) => (
        <RevealItem key={comp.id} className="chaine__bloc" style={{ borderTop: `3px solid ${comp.color}` }}>
          <div className="chaine__head">
            <span className="mono chaine__code" style={{ background: comp.color, color: onCompDe(comp.color) }}>
              {comp.code}
            </span>
            <h3 className="chaine__titre">{comp.titre}</h3>
          </div>
          <div className="mono chaine__k">{dependLabel}</div>
          <ul className="chaine__liste">
            {liens.map((lien) => {
              const cible = parCode.get((lien.cible ?? "").toUpperCase());
              const couleur = cible?.color ?? compColor(lien.cible ?? "");
              return (
                <li key={lien.id}>
                  <Link href={compRoute(lang, cible!.slug)} className="chaine__lien">
                    <span className="mono chaine__vers" style={{ color: couleur }}>{cible!.code}</span>
                    <span className="chaine__quoi">{lien.texte}</span>
                    <span className="chaine__go" aria-hidden>→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
