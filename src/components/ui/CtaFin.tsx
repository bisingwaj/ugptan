/* Bloc de sortie en bas de page.

   Le même bloc était écrit trois fois en JSX — sur « Le Projet », sur l'index
   des composantes et sur chaque page de composante — avec les mêmes classes et
   des écarts de rembourrage. Il manquait en revanche à « Résultats »,
   « L'UGPTN » et « Gouvernance », qui se terminaient sans aucune sortie : le
   lecteur arrivait en bas sans savoir où aller.

   `comp-pager-wrap` remet `--ac` au bleu institutionnel : en bas d'une page
   teintée par composante, le bloc revient donc à la couleur du site, ce qui est
   le comportement voulu puisqu'il renvoie ailleurs.

   `avant` sert au pager « ← composante précédente / suivante → », qui doit
   rester dans la même section sombre plutôt que d'en ouvrir une seconde. */
import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";

export type CtaLien = { href: string; label: ReactNode; primaire?: boolean };

export function CtaFin({
  titre,
  lead,
  liens,
  avant,
}: {
  titre?: ReactNode;
  lead?: ReactNode;
  liens: CtaLien[];
  /** Rendu au-dessus du bloc, dans la même section (le pager, par exemple). */
  avant?: ReactNode;
}) {
  /* Sans titre, la section retombe sur le conteneur simple : c'est le rendu
     actuel du bas des pages de composante, conservé au pixel. */
  const boutons = (
    <div className="comp-cta">
      {liens.map((l, i) => (
        <Link
          key={l.href}
          href={l.href}
          className={`btn ${l.primaire ?? i === 0 ? "btn--primary" : "btn--on-dark"}`}
        >
          {l.label}
          {(l.primaire ?? i === 0) && <span className="arrow"> →</span>}
        </Link>
      ))}
    </div>
  );

  return (
    <section className="section--dark comp-pager-wrap">
      <div className={titre ? "section__inner comp-cta-split" : "section__inner"}>
        {avant}
        {titre && (
          <Reveal>
            <h2 className="h2--sm" style={{ maxWidth: "16ch" }}>{titre}</h2>
            {lead && <p className="comp-cta__lead">{lead}</p>}
          </Reveal>
        )}
        {boutons}
      </div>
    </section>
  );
}
