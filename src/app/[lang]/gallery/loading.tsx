"use client";

/**
 * Vidéos & galeries : le bandeau d'albums, puis la mosaïque.
 *
 * La grille réelle est régulière : toutes ses cellules partagent le même cadre
 * (`--gal-ratio`, cf. globals.css). Le squelette la reproduit telle quelle, pour
 * annoncer la mise en page qui arrive et non une autre.
 */
import { SqEcran, SqPageHero, SqBloc } from "@/components/ui/Squelette";
import { useParams } from "next/navigation";
import { libelleChargement } from "@/lib/chargement";

export default function Loading() {
  // Libellé dans la langue du segment : cf. lib/chargement.ts.
  const { lang } = useParams<{ lang?: string }>();
  return (
    <SqEcran libelle={libelleChargement(lang, "galerie")}>
      <SqPageHero />
      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(56px,7vw,90px)" }}>
        <div className="section__inner">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 30 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <SqBloc key={i} rang={i} largeur={104 + ((i * 31) % 58)} hauteur={34} />
            ))}
          </div>
          <ul className="gal-grille" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="gal-cell">
                <SqBloc surface rang={i} hauteur="100%" style={{ aspectRatio: "var(--gal-ratio)" }} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SqEcran>
  );
}
