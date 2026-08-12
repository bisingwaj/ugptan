/* « La problématique » — le problème auquel la composante répond, exposé avant
   la description de ce qu'elle fait. Suit la chaîne d'argumentation définie
   dans .claude/skills/redaction-institutionnelle : constat structurel →
   mécanisme du blocage → coût du statu quo → légitimité de l'intervention →
   interconnexions avec les autres composantes. */
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { composantes } from "@/content/data";
import type { CompProblematique as Pb } from "@/content/types";
import { compRoute } from "@/lib/routes";
import { compColor } from "@/lib/comp";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function CompProblematique({ pb, lang }: { pb?: Pb; lang: Lang }) {
  if (!pb) return null;
  const t = dict(lang).comp;

  return (
    <section className="section comp-pb" id="problematique" data-anchor>
      <div className="section__inner">
        <Reveal>
          <Kicker>{t.secProblematique}</Kicker>
          <h2 className="h2--sm comp-pb__h2">{pick(pb.titre, lang)}</h2>
          <p className="comp-pb__lead">{pick(pb.lead, lang)}</p>
        </Reveal>

        <RevealGroup className="comp-pb__axes celled-flow" gap={0.05}>
          {pb.axes.map((a, i) => (
            <RevealItem key={i} className="comp-pb__axe">
              <span className="mono comp-pb__n">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="comp-pb__t">{pick(a.t, lang)}</h3>
              <p className="comp-pb__d">{pick(a.d, lang)}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="comp-pb__split">
          <Reveal className="comp-pb__appui">
            <div className="mono label-mono">{t.pbAppui}</div>
            {(lang === "en" ? pb.appui.en : pb.appui.fr).map((para, i) => (
              <p key={i} className="comp-pb__p">{para}</p>
            ))}
          </Reveal>

          {pb.liens.length > 0 && (
            <Reveal delay={0.08} className="comp-pb__liens">
              <div className="mono label-mono">{t.pbLiens}</div>
              <ul>
                {pb.liens.map((l, i) => {
                  const comp = l.code ? composantes.find((c) => c.code === l.code) : undefined;
                  const body = (
                    <>
                      {l.code && (
                        <span className="mono comp-pb__lien-code" style={{ color: compColor(l.code) }}>
                          {l.code}
                        </span>
                      )}
                      <span>{pick(l.t, lang)}</span>
                    </>
                  );
                  return (
                    <li key={i}>
                      {comp ? (
                        <Link href={compRoute(lang, l.code!)} className="comp-pb__lien">{body}</Link>
                      ) : (
                        <span className="comp-pb__lien comp-pb__lien--plain">{body}</span>
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
