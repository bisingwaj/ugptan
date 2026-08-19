/**
 * Écran de chargement par DÉFAUT des pages publiques.
 *
 * Next retient le `loading.tsx` le plus proche de la route : les sections qui
 * ont le leur (actualités, événements, galerie, transparence…) ne voient jamais
 * celui-ci. Il couvre le reste — pages éditoriales, pages de contenu — et
 * garantit qu'aucune route n'attend sur un écran blanc.
 */
import { SqEcran, SqPageHero, SqBloc, SqTexte } from "@/components/ui/Squelette";

export default function Loading() {
  return (
    <SqEcran>
      <SqPageHero />
      <section className="section">
        <div className="section__inner" style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 14 }}>
            <SqBloc largeur={140} hauteur={12} />
            <SqBloc largeur="70%" hauteur={30} />
            <SqTexte lignes={4} />
          </div>
          <div style={{ maxWidth: 720 }}>
            <SqTexte lignes={3} />
          </div>
        </div>
      </section>
    </SqEcran>
  );
}
