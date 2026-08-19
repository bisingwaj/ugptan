/**
 * Une fiche d'événement : l'affiche à gauche, la date, le lieu et le bouton
 * d'inscription à droite, puis la description.
 */
import { SqEcran, SqBloc, SqTexte } from "@/components/ui/Squelette";

export default function Loading() {
  return (
    <SqEcran libelle="Chargement de l'événement">
      <section className="page-hero">
        <div className="section__inner">
          <SqBloc largeur={200} hauteur={12} style={{ marginBottom: 22 }} />
          <SqBloc largeur="min(680px, 88%)" hauteur={42} />
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)",
              gap: "clamp(24px, 4vw, 56px)",
              alignItems: "start",
            }}
          >
            <SqBloc surface hauteur="100%" style={{ aspectRatio: "16 / 9" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SqBloc largeur={128} hauteur={12} />
              <SqBloc largeur="86%" hauteur={20} rang={1} />
              <SqBloc largeur="62%" hauteur={20} rang={2} />
              <SqBloc largeur={188} hauteur={44} rang={1} style={{ marginTop: 12 }} />
            </div>
          </div>
          <div style={{ maxWidth: 720, marginTop: 52, display: "flex", flexDirection: "column", gap: 24 }}>
            <SqTexte lignes={4} />
            <SqTexte lignes={3} />
          </div>
        </div>
      </section>
    </SqEcran>
  );
}
