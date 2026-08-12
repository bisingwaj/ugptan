"use client";
/* Lien d'ancre interne compatible avec l'inertie Lenis : un saut de hash natif
   serait repris en main par la boucle de défilement. Repli natif si Lenis est
   absent (tactile, « réduire les animations »). */
import type { CSSProperties, ReactNode } from "react";

type LenisLike = { scrollTo: (t: string | HTMLElement, o?: { offset?: number }) => void };

export function AnchorLink({
  to,
  offset = 118,
  className,
  style,
  children,
}: {
  to: string;
  offset?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <a
      href={`#${to}`}
      className={className}
      style={style}
      onClick={(e) => {
        const el = document.getElementById(to);
        if (!el) return;
        e.preventDefault();
        const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
        if (lenis) lenis.scrollTo(el, { offset: -offset });
        else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
        history.replaceState(null, "", `#${to}`);
      }}
    >
      {children}
    </a>
  );
}
