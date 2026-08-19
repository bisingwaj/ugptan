/* « La problématique » — le problème auquel la composante répond, exposé avant
   la description de ce qu'elle fait. Suit la chaîne d'argumentation définie
   dans .claude/skills/redaction-institutionnelle : constat structurel →
   mécanisme du blocage → coût du statu quo → légitimité de l'intervention →
   interconnexions avec les autres composantes. */
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import type { ComposanteVue } from "@/lib/projet/query";
import { compRoute } from "@/lib/routes";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function CompProblematique({
  comp,
  voisines,
  lang,
}: {
  comp: ComposanteVue;
  /** Les autres composantes servies : elles rendent les renvois cliquables. */
  voisines: ComposanteVue[];
  lang: Lang;
}) {
  const pb = comp.problematique;
  if (!pb) return null;

  const t = dict(lang).comp;
  const parCode = new Map(voisines.map((item) => [item.code.toUpperCase(), item]));

  return (
    <section className="section comp-pb" id="problematique" data-anchor>
      <div className="section__inner">
        <Reveal>
          <Kicker>{t.secProblematique}</Kicker>
          <h2 className="h2--sm comp-pb__h2">{pb.titre}</h2>
          {pb.lead && <p className="comp-pb__lead">{pb.lead}</p>}
        </Reveal>

        <RevealGroup className="comp-pb__axes celled-flow" gap={0.05}>
          {pb.axes.map((axe, i) => (
            <RevealItem key={axe.id} className="comp-pb__axe">
              <span className="mono comp-pb__n">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="comp-pb__t">{axe.titre}</h3>
              <p className="comp-pb__d">{axe.texte}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="comp-pb__split">
          {pb.appui.length > 0 && (
            <Reveal className="comp-pb__appui">
              <div className="mono label-mono">{t.pbAppui}</div>
              {pb.appui.map((para, i) => (
                <p key={i} className="comp-pb__p">{para}</p>
              ))}
            </Reveal>
          )}

          {pb.liens.length > 0 && (
            <Reveal delay={0.08} className="comp-pb__liens">
              <div className="mono label-mono">{t.pbLiens}</div>
              <ul>
                {pb.liens.map((lien) => {
                  const cible = lien.cible ? parCode.get(lien.cible.toUpperCase()) : undefined;
                  const corps = (
                    <>
                      {cible && (
                        <span className="mono comp-pb__lien-code" style={{ color: cible.color }}>
                          {cible.code}
                        </span>
                      )}
                      <span>{lien.texte}</span>
                    </>
                  );
                  return (
                    <li key={lien.id}>
                      {cible ? (
                        <Link href={compRoute(lang, cible.slug)} className="comp-pb__lien">{corps}</Link>
                      ) : (
                        <span className="comp-pb__lien comp-pb__lien--plain">{corps}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
