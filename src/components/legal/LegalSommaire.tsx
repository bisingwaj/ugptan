"use client";
/* Sommaire des pages légales : rail collant à gauche sur grand écran, bloc
   déroulant en tête sur mobile. Indicateur de position par IntersectionObserver.
   Les sauts d'ancre passent par Lenis quand l'instance existe — un saut de hash
   natif serait repris en main par la boucle d'inertie. */
import { useCallback, useEffect, useState } from "react";

export type LegalAnchor = { id: string; label: string };

type LenisLike = { scrollTo: (t: string | HTMLElement, o?: { offset?: number }) => void };

/** Hauteur du header collant + une respiration. */
const OFFSET = 96;

export function LegalSommaire({ titre, anchors }: { titre: string; anchors: LegalAnchor[] }) {
  const [active, setActive] = useState<string>(anchors[0]?.id ?? "");

  useEffect(() => {
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
      { rootMargin: `-${OFFSET + 10}px 0px -68% 0px`, threshold: 0 },
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
    <nav className="legal-toc" aria-label={titre}>
      <div className="legal-toc__label mono">{titre}</div>
      <ol className="legal-toc__list">
        {anchors.map((a, i) => (
          <li key={a.id}>
            <a
              href={`#${a.id}`}
              onClick={(e) => goTo(e, a.id)}
              aria-current={active === a.id ? "true" : undefined}
              className={active === a.id ? "legal-toc__link legal-toc__link--on" : "legal-toc__link"}
            >
              <span className="mono legal-toc__n">{String(i + 1).padStart(2, "0")}</span>
              <span>{a.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
