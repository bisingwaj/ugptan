/**
 * Écran d'attente de la recherche.
 *
 * La page est en rendu dynamique et interroge six fonds : sur une liaison lente,
 * l'intervalle entre l'envoi du formulaire et la réponse est le moment précis où
 * l'on doute d'avoir cliqué. Le squelette reprend la forme de ce qui arrive —
 * la barre, puis deux groupes de lignes — plutôt qu'un indicateur tournant qui
 * n'annonce rien.
 */
import { SqEcran, SqPageHero, SqBloc, SqTexte } from "@/components/ui/Squelette";

export default function Loading() {
  return (
    <SqEcran>
      <SqPageHero />
      <section className="section">
        <div className="section__inner" style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          <SqBloc largeur="100%" hauteur={52} />
          {[0, 1].map((groupe) => (
            <div key={groupe} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SqBloc largeur={190} hauteur={16} />
              {[0, 1, 2].map((ligne) => (
                <div key={ligne} style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  <SqBloc largeur={120} hauteur={10} />
                  <SqBloc largeur="62%" hauteur={19} />
                  <SqTexte lignes={2} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </SqEcran>
  );
}
