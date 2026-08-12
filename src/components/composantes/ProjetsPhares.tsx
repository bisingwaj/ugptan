"use client";
/* Projets phares d'une composante : index collant à gauche (avec indicateur de
   position) et blocs détaillés à droite. Tous les blocs restent dans le DOM —
   rien n'est masqué derrière un accordéon : lecture continue, indexation SEO
   complète, impression correcte. En mobile, l'index devient une bande d'ancres
   défilable au-dessus du contenu. */
import { useCallback, useEffect, useState } from "react";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import type { CompProjet } from "@/content/types";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

type LenisLike = { scrollTo: (t: string | HTMLElement, o?: { offset?: number }) => void };
const OFFSET = 132;

export function ProjetsPhares({ projets, lang }: { projets: CompProjet[]; lang: Lang }) {
  const [active, setActive] = useState<string>(projets[0]?.slug ?? "");

  useEffect(() => {
    const targets = projets
      .map((p) => document.getElementById(`projet-${p.slug}`))
      .filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id.replace("projet-", ""));
      },
      { rootMargin: `-${OFFSET}px 0px -60% 0px`, threshold: 0 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [projets]);

  const goTo = useCallback((e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    const el = document.getElementById(`projet-${slug}`);
    if (!el) return;
    e.preventDefault();
    const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
    if (lenis) lenis.scrollTo(el, { offset: -OFFSET });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - OFFSET, behavior: "smooth" });
    setActive(slug);
  }, []);

  return (
    <div className="projets-split">
      <aside className="projets-index" aria-label="Projets phares">
        {projets.map((p) => (
          <a
            key={p.slug}
            href={`#projet-${p.slug}`}
            onClick={(e) => goTo(e, p.slug)}
            aria-current={active === p.slug ? "true" : undefined}
            className={active === p.slug ? "projet-link projet-link--on" : "projet-link"}
          >
            <span className="mono projet-link__n">{p.n}</span>
            <span className="projet-link__t">{p.sigle ? `${p.sigle} — ${pick(p.titre, lang)}` : pick(p.titre, lang)}</span>
          </a>
        ))}
      </aside>

      <RevealGroup className="projets-body" gap={0.05}>
        {projets.map((p) => (
          <RevealItem key={p.slug} className="projet-bloc">
            <article id={`projet-${p.slug}`} data-anchor>
              <header className="projet-bloc__head">
                <span className="mono projet-bloc__n">{p.n}</span>
                <div>
                  <h3 className="projet-bloc__titre">
                    {p.sigle && <span className="projet-bloc__sigle">{p.sigle}</span>}
                    {pick(p.titre, lang)}
                  </h3>
                  {p.statut && <span className="mono projet-bloc__statut">{pick(p.statut, lang)}</span>}
                </div>
              </header>

              {(lang === "en" ? p.corps.en : p.corps.fr).map((para, i) => (
                <p key={i} className="projet-bloc__p">{para}</p>
              ))}

              {p.points && p.points.length > 0 && (
                <ul className="projet-bloc__points">
                  {p.points.map((pt, i) => (
                    <li key={i}>{pick(pt, lang)}</li>
                  ))}
                </ul>
              )}

              {p.chute && <p className="projet-bloc__p projet-bloc__chute">{pick(p.chute, lang)}</p>}
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
