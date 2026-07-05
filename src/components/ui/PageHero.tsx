/* En-tête de page interne (.page-hero) avec apparition au scroll.
   Composant serveur qui compose des primitives client (Reveal) — la page hôte
   reste un composant serveur. `children` pour des extras (badges, méthodes…). */
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

export function PageHero({
  crumb,
  title,
  lead,
  children,
}: {
  crumb: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="section__inner">
        <Reveal variant="fade">
          <div className="page-hero__crumb">{crumb}</div>
        </Reveal>
        <Reveal variant="mask">
          <h1>{title}</h1>
        </Reveal>
        {lead != null && (
          <Reveal variant="up" delay={0.1}>
            <p className="page-hero__lead">{lead}</p>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
