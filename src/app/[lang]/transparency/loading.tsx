/**
 * Transparence : une LISTE de documents, non une grille de cartes. Chaque ligne
 * porte un type, un titre, une date et un poids de fichier.
 */
import { SqEcran, SqPageHero, SqFiltres, SqBloc } from "@/components/ui/Squelette";

export default function Loading() {
  return (
    <SqEcran libelle="Chargement des documents">
      <SqPageHero />
      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(56px,7vw,90px)" }}>
        <div className="section__inner">
          <SqFiltres pastilles={6} />
          <div style={{ borderTop: "1px solid var(--c-20)" }}>
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "20px 0",
                  borderBottom: "1px solid var(--c-20)",
                }}
              >
                <SqBloc rang={i} largeur={52} hauteur={52} surface />
                <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                  <SqBloc rang={i} largeur="min(520px, 76%)" hauteur={16} />
                  <SqBloc rang={i + 1} largeur={190} hauteur={11} />
                </span>
                <SqBloc rang={i + 2} largeur={92} hauteur={30} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </SqEcran>
  );
}
