/**
 * Vidéos & galeries : le bandeau d'albums, puis la mosaïque.
 *
 * La grille réelle mêle des cellules simples et des cellules doubles
 * (`.gal-cell--large`). Le squelette reprend cette alternance : une mosaïque
 * régulière annoncerait une mise en page qui n'arrive jamais.
 */
import { SqEcran, SqPageHero, SqBloc } from "@/components/ui/Squelette";

const LARGES = new Set([0, 5]);

export default function Loading() {
  return (
    <SqEcran libelle="Chargement de la galerie">
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
              <li key={i} className={LARGES.has(i) ? "gal-cell gal-cell--large" : "gal-cell"}>
                <SqBloc surface rang={i} hauteur="100%" style={{ aspectRatio: LARGES.has(i) ? "16 / 9" : "4 / 3" }} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SqEcran>
  );
}
