/**
 * Une fiche de document : l'identité du fichier, ses métadonnées, puis le
 * bouton de téléchargement et le résumé.
 */
import { SqEcran, SqBloc, SqTexte } from "@/components/ui/Squelette";

export default function Loading() {
  return (
    <SqEcran libelle="Chargement du document">
      <section className="page-hero">
        <div className="section__inner" style={{ maxWidth: 860 }}>
          <SqBloc largeur={182} hauteur={12} style={{ marginBottom: 22 }} />
          <SqBloc largeur="90%" hauteur={38} style={{ marginBottom: 12 }} />
          <SqBloc largeur="52%" hauteur={38} />
        </div>
      </section>

      <section className="section">
        <div className="section__inner" style={{ maxWidth: 860, display: "flex", flexDirection: "column", gap: 34 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {Array.from({ length: 4 }, (_, i) => (
              <SqBloc key={i} rang={i} largeur={124} hauteur={54} />
            ))}
          </div>
          <SqBloc largeur={224} hauteur={46} />
          <SqTexte lignes={5} />
        </div>
      </section>
    </SqEcran>
  );
}
