/**
 * Gouvernance : les cartes de coordination, seul bloc de la page qui interroge
 * la base (`membresEnAvant`). Le gabarit reprend celui de
 * `CartesCoordination` — colonnes de 262 px, visuel en 5/4, liseré de couleur
 * en haut de carte.
 */
import { SqEcran, SqPageHero, SqBloc } from "@/components/ui/Squelette";

export default function Loading() {
  return (
    <SqEcran libelle="Chargement de la gouvernance">
      <SqPageHero />
      <section className="section">
        <div className="section__inner">
          <SqBloc largeur={168} hauteur={12} style={{ marginBottom: 18 }} />
          <SqBloc largeur="min(440px, 70%)" hauteur={30} style={{ marginBottom: 36 }} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(262px, 1fr))",
              gap: 1,
              background: "var(--c-20)",
              border: "1px solid var(--c-20)",
            }}
          >
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
                <SqBloc surface rang={i} hauteur="100%" style={{ aspectRatio: "5 / 4" }} />
                <div style={{ padding: "18px 18px 22px", display: "flex", flexDirection: "column", gap: 11 }}>
                  <SqBloc rang={i} largeur="88%" hauteur={16} />
                  <SqBloc rang={i + 1} largeur={104} hauteur={20} />
                  <SqBloc rang={i + 2} largeur="72%" hauteur={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SqEcran>
  );
}
