/* Contenus rattachés à une composante : actualités, avis de marché en cours et
   publications. Chaque bloc n'apparaît que s'il a de la matière ; les actualités
   affichent un état vide explicite plutôt que de disparaître sans explication. */
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { actualites } from "@/content/actualites";
import { marches } from "@/content/marches";
import { ressources } from "@/content/carbon";
import { NAV, route } from "@/lib/routes";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function CompLies({ code, lang }: { code: string; lang: Lang }) {
  const t = dict(lang);
  const c = t.comp;

  const actus = actualites
    .filter((a) => a.comps?.includes(code))
    .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
    .slice(0, 4);
  const avis = marches.filter((m) => m.comp === code && m.statut === "ouvert");
  const docs = ressources.filter((r) => r.comp === code);

  if (!actus.length && !avis.length && !docs.length) return null;

  return (
    <section className="section" id="lies" data-anchor>
      <div className="section__inner">
        <Reveal>
          <Kicker>{c.secLies}</Kicker>
        </Reveal>

        <div className="comp-lies">
          {/* --- Actualités --- */}
          <div className="comp-lies__col">
            <Reveal>
              <h3 className="comp-lies__h">{c.liesActus}</h3>
            </Reveal>
            {actus.length > 0 ? (
              <RevealGroup className="comp-lies__list" gap={0.05}>
                {actus.map((a) => (
                  <RevealItem key={a.dateISO}>
                    <Link href={route(lang, NAV.actualites)} className="comp-lie">
                      <span className="mono comp-lie__meta">{a.date} · {pick(a.cat, lang)}</span>
                      <span className="comp-lie__t">{pick(a.title, lang)}</span>
                      <span className="mono comp-lie__go" aria-hidden>→</span>
                    </Link>
                  </RevealItem>
                ))}
              </RevealGroup>
            ) : (
              <p className="comp-lies__vide">
                {c.liesActusVide}{" "}
                <Link href={route(lang, NAV.actualites)} className="comp-lies__vide-link">{t.actus.allNews} →</Link>
              </p>
            )}
          </div>

          {/* --- Marchés en cours --- */}
          <div className="comp-lies__col">
            <Reveal>
              <h3 className="comp-lies__h">{c.liesMarches}</h3>
            </Reveal>
            {avis.length > 0 ? (
              <RevealGroup className="comp-lies__list" gap={0.05}>
                {avis.map((m) => (
                  <RevealItem key={m.ref}>
                    <Link href={route(lang, NAV.marches)} className="comp-lie">
                      <span className="mono comp-lie__meta">{m.ref} · {t.marches.deadline} {m.limite}</span>
                      <span className="comp-lie__t">{pick(m.objet, lang)}</span>
                      <span className="mono comp-lie__go" aria-hidden>→</span>
                    </Link>
                  </RevealItem>
                ))}
              </RevealGroup>
            ) : (
              <p className="comp-lies__vide">
                {c.liesMarchesVide}{" "}
                <Link href={route(lang, NAV.marches)} className="comp-lies__vide-link">{t.cta.marches} →</Link>
              </p>
            )}
          </div>

          {/* --- Publications --- */}
          {docs.length > 0 && (
            <div className="comp-lies__col">
              <Reveal>
                <h3 className="comp-lies__h">{c.liesRessources}</h3>
              </Reveal>
              <RevealGroup className="comp-lies__list" gap={0.05}>
                {docs.map((r) => (
                  <RevealItem key={r.titre.fr}>
                    <Link href={route(lang, NAV.ressources)} className="comp-lie">
                      <span className="mono comp-lie__meta">{pick(r.k, lang)} · {pick(r.date, lang)} · {r.meta}</span>
                      <span className="comp-lie__t">{pick(r.titre, lang)}</span>
                      <span className="mono comp-lie__go" aria-hidden>→</span>
                    </Link>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
