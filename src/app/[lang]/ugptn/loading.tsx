"use client";

/**
 * L'UGPTN : la grille de l'équipe, en colonnes de 212 px et portraits carrés,
 * comme `GrilleEquipe` variante « unite ».
 */
import { SqEcran, SqPageHero, SqBloc } from "@/components/ui/Squelette";
import { useParams } from "next/navigation";
import { libelleChargement } from "@/lib/chargement";

export default function Loading() {
  // Libellé dans la langue du segment : cf. lib/chargement.ts.
  const { lang } = useParams<{ lang?: string }>();
  return (
    <SqEcran libelle={libelleChargement(lang, "ugptn")}>
      <SqPageHero />
      <section className="section">
        <div className="section__inner">
          <SqBloc largeur={150} hauteur={12} style={{ marginBottom: 18 }} />
          <SqBloc largeur="min(400px, 66%)" hauteur={30} style={{ marginBottom: 40 }} />
          <div className="celled-flow" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(212px, 1fr))" }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
                <SqBloc surface rang={i} hauteur="100%" style={{ aspectRatio: "1 / 1" }} />
                <div style={{ padding: "16px 16px 20px", display: "flex", flexDirection: "column", gap: 9 }}>
                  <SqBloc rang={i} largeur="90%" hauteur={15} />
                  <SqBloc rang={i + 1} largeur="58%" hauteur={11} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SqEcran>
  );
}
