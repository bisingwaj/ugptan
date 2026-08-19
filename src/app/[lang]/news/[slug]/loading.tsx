/**
 * Un article : titre, métadonnées, visuel de couverture, puis le corps.
 *
 * La colonne de texte reprend la largeur de lecture réelle, faute de quoi le
 * texte sauterait latéralement à son arrivée.
 */
import { SqEcran, SqBloc, SqTexte } from "@/components/ui/Squelette";

export default function Loading() {
  return (
    <SqEcran libelle="Chargement de l'article">
      <section className="page-hero">
        <div className="section__inner" style={{ maxWidth: 860 }}>
          <SqBloc largeur={210} hauteur={12} style={{ marginBottom: 22 }} />
          <SqBloc largeur="94%" hauteur={40} style={{ marginBottom: 12 }} />
          <SqBloc largeur="64%" hauteur={40} style={{ marginBottom: 24 }} />
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <SqBloc largeur={116} hauteur={12} />
            <SqBloc largeur={92} hauteur={12} rang={1} />
            <SqBloc largeur={78} hauteur={12} rang={2} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <SqBloc surface hauteur="100%" style={{ aspectRatio: "16 / 9", marginBottom: 44 }} />
          <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 26 }}>
            <SqTexte lignes={4} />
            <SqTexte lignes={5} />
            <SqTexte lignes={3} />
          </div>
        </div>
      </section>
    </SqEcran>
  );
}
