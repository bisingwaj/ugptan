"use client";
/* Barre collante des pages de composante : onglets C1 → C5 (navigation entre
   composantes) + ancres de sections avec indicateur de position (scrollspy).
   Les ancres passent par l'instance Lenis quand elle existe — un saut de hash
   natif serait repris en main par la boucle d'inertie. */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type SubNavTab = { code: string; label: string; href: string; color: string; active: boolean };
export type SubNavAnchor = { id: string; label: string };

type LenisLike = { scrollTo: (t: string | HTMLElement, o?: { offset?: number }) => void };

/** Hauteur du header collant (64px) + de cette barre (~52px). */
const OFFSET = 118;

export function CompSubNav({ tabs, anchors }: { tabs: SubNavTab[]; anchors: SubNavAnchor[] }) {
  const [active, setActive] = useState<string>(anchors[0]?.id ?? "");
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchors.length) return;
    const targets = anchors
      .map((a) => document.getElementById(a.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: `-${OFFSET + 10}px 0px -62% 0px`, threshold: 0 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [anchors]);

  const goTo = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
    if (lenis) lenis.scrollTo(el, { offset: -OFFSET });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - OFFSET, behavior: "smooth" });
    setActive(id);
    history.replaceState(null, "", `#${id}`);
  }, []);

  return (
    <div className="comp-subnav">
      <div className="comp-subnav__inner">
        <div className="comp-subnav__tabs" ref={railRef}>
          {tabs.map((tab) => (
            <Link
              key={tab.code}
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={tab.active ? "comp-tab comp-tab--on" : "comp-tab"}
              style={{ ["--tab" as string]: tab.color }}
              title={tab.label}
            >
              <span className="mono comp-tab__code">{tab.code}</span>
              <span className="comp-tab__label">{tab.label}</span>
            </Link>
          ))}
        </div>

        {anchors.length > 0 && (
          <nav className="comp-subnav__anchors" aria-label="Sections">
            {anchors.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                onClick={(e) => goTo(e, a.id)}
                aria-current={active === a.id ? "true" : undefined}
                className={active === a.id ? "comp-anchor comp-anchor--on" : "comp-anchor"}
              >
                {a.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
