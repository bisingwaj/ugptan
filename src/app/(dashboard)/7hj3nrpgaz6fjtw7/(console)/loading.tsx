/**
 * Écran de chargement de la CONSOLE.
 *
 * Un seul fichier pour les quatorze modules, et c'est justifié ici alors que le
 * site public en a un par section : les écrans de la console partagent tous la
 * même coquille — en-tête avec titre, chapô et boutons d'action, barre de
 * filtres, puis un tableau. Ce qui change d'un module à l'autre, ce sont les
 * colonnes, que le squelette n'a pas à deviner.
 *
 * Il couvre aussi les écrans de formulaire, dont l'en-tête est identique ; le
 * tableau y annonce simplement des lignes qui seront des champs. Le décalage
 * reste sans conséquence : ces écrans ne sont vus que par la rédaction, et
 * jamais indexés.
 */
import { SqEcran, SqBloc } from "@/components/ui/Squelette";

/** Largeurs des colonnes, en pourcentage : elles imitent un vrai tableau. */
const COLONNES = ["34%", "18%", "16%", "14%", "10%"];

export default function Loading() {
  return (
    <SqEcran libelle="Chargement de la console">
      <div className="adm-entete">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SqBloc largeur={232} hauteur={26} />
          <SqBloc largeur={368} hauteur={13} rang={1} />
        </div>
        <div className="adm-entete__actions" style={{ display: "flex", gap: 10 }}>
          <SqBloc largeur={148} hauteur={40} />
          <SqBloc largeur={116} hauteur={34} rang={2} />
        </div>
      </div>

      <div className="adm-filtres">
        <SqBloc largeur={220} hauteur={38} />
        <SqBloc largeur={190} hauteur={38} rang={1} />
        <SqBloc largeur={190} hauteur={38} rang={2} />
      </div>

      <div className="adm-table-wrap" style={{ marginTop: 18 }}>
        {/* `min-width` reprise de `.adm-table` : sur un téléphone, le vrai
            tableau ne se comprime pas, il DÉFILE dans son cadre. Un squelette
            qui écraserait ses cinq colonnes en bandes de dix pixels annoncerait
            une mise en page qui n'arrive jamais. */}
        <div style={{ minWidth: 720 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--c-20)", display: "flex", gap: 18 }}>
          {COLONNES.map((largeur, i) => (
            <SqBloc key={i} rang={i} largeur={largeur} hauteur={11} />
          ))}
        </div>
        {Array.from({ length: 8 }, (_, ligne) => (
          <div
            key={ligne}
            style={{
              padding: "17px 18px",
              borderBottom: ligne === 7 ? "none" : "1px solid var(--c-20)",
              display: "flex",
              gap: 18,
            }}
          >
            {COLONNES.map((largeur, i) => (
              <SqBloc key={i} rang={ligne + i} largeur={largeur} hauteur={13} />
            ))}
          </div>
        ))}
        </div>
      </div>
    </SqEcran>
  );
}
