"use client";

/**
 * Actualités : barre de filtres, puis la grille à filets.
 *
 * Le gabarit reprend celui de la page (`.celled-flow`, colonnes de 358 px) et
 * six cartes — la première page en affiche davantage, mais six suffisent à
 * remplir l'écran, et un squelette n'a pas à annoncer ce qui est sous la ligne
 * de flottaison.
 */
import { SqEcran, SqPageHero, SqFiltres, SqCarte } from "@/components/ui/Squelette";
import { useParams } from "next/navigation";
import { libelleChargement } from "@/lib/chargement";

export default function Loading() {
  // Libellé dans la langue du segment : cf. lib/chargement.ts.
  const { lang } = useParams<{ lang?: string }>();
  return (
    <SqEcran libelle={libelleChargement(lang, "actus")}>
      <SqPageHero />
      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(56px,7vw,90px)" }}>
        <div className="section__inner">
          <SqFiltres pastilles={5} />
          <div className="celled-flow" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(358px,1fr))" }}>
            {Array.from({ length: 6 }, (_, i) => (
              <SqCarte key={i} rang={i} rapport="3 / 2" lignes={2} />
            ))}
          </div>
        </div>
      </section>
    </SqEcran>
  );
}
