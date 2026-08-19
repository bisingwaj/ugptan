/**
 * Événements : filtres, puis la grille `.grid-auto` de la page. Les affiches
 * sont en 16/9, d'où le rapport passé aux cartes.
 */
import { SqEcran, SqPageHero, SqFiltres, SqCarte } from "@/components/ui/Squelette";

export default function Loading() {
  return (
    <SqEcran libelle="Chargement des événements">
      <SqPageHero />
      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(56px,7vw,90px)" }}>
        <div className="section__inner">
          <SqFiltres pastilles={4} />
          <div className="grid-auto">
            {Array.from({ length: 6 }, (_, i) => (
              <SqCarte key={i} rang={i} rapport="16 / 9" lignes={2} />
            ))}
          </div>
        </div>
      </section>
    </SqEcran>
  );
}
