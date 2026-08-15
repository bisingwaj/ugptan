/* Ce que chaque composante attend des autres.

   Remplace, sur l'index, une seconde liste des cinq composantes en tableau qui
   redisait les cartes situées deux cents pixels plus haut. La question à
   laquelle l'index ne répondait pas était pourtant celle-ci : pourquoi cinq
   volets plutôt que cinq projets séparés.

   Rien n'est inventé : les renvois sont ceux déjà rédigés dans le champ
   `problematique.liens` de chaque composante, filtrés sur ceux qui désignent
   une autre composante. Les renvois hors projet (énergie, cadre juridique)
   restent sur la page de la composante, où ils ont leur contexte. */
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { composantes } from "@/content/data";
import { composantesDetail } from "@/content/composantes-detail";
import { compRoute } from "@/lib/routes";
import { compColor, onComp } from "@/lib/comp";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function CompChaine({ lang }: { lang: Lang }) {
  const compOf = (code: string) => composantes.find((c) => c.code === code);
  const dependLabel = dict(lang).comp.chaineDepend;

  const blocs = composantesDetail
    .map((d) => ({
      code: d.code,
      slug: d.slug,
      titre: pick(compOf(d.code)?.titre ?? d.titreLong, lang),
      liens: (d.problematique?.liens ?? []).filter((l) => l.code),
    }))
    .filter((b) => b.liens.length > 0);

  /* Aucune composante n'a encore de renvoi rédigé : la section disparaît
     plutôt que d'afficher une grille vide. */
  if (blocs.length === 0) return null;

  return (
    <RevealGroup className="celled-flow chaine" gap={0.05}>
      {blocs.map((b) => (
        <RevealItem key={b.code} className="chaine__bloc" style={{ borderTop: `3px solid ${compColor(b.code)}` }}>
          <div className="chaine__head">
            <span className="mono chaine__code" style={{ background: compColor(b.code), color: onComp(b.code) }}>{b.code}</span>
            <h3 className="chaine__titre">{b.titre}</h3>
          </div>
          <div className="mono chaine__k">{dependLabel}</div>
          <ul className="chaine__liste">
            {b.liens.map((l, i) => {
              const code = l.code as string;
              const detail = composantesDetail.find((d) => d.code === code);
              const corps = (
                <>
                  <span className="mono chaine__vers" style={{ color: compColor(code) }}>{code}</span>
                  <span className="chaine__quoi">{pick(l.t, lang)}</span>
                  <span className="chaine__go" aria-hidden>→</span>
                </>
              );
              return (
                <li key={i}>
                  {detail ? (
                    <Link href={compRoute(lang, detail.slug)} className="chaine__lien">{corps}</Link>
                  ) : (
                    <span className="chaine__lien chaine__lien--inerte">{corps}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
