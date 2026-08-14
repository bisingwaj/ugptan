/**
 * Cartes de coordination de la page « Gouvernance ».
 *
 * Ce sont les mêmes personnes que la grille de l'accueil, montrées autrement :
 * un format plus large (5/4 au lieu du carré), un liseré de couleur, la
 * responsabilité en clair. Elles étaient pourtant saisies dans un second
 * fichier, sous des intitulés voisins mais différents — le coordonnateur y
 * apparaissait pour la deuxième fois.
 *
 * Elles proviennent désormais des fiches marquées « mise en avant ». Le dessin
 * est repris à l'identique ; seule la source change.
 */
import { initials } from "@/lib/format";
import type { MembreEquipe } from "@/lib/equipe/query";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function CartesCoordination({ membres }: { membres: MembreEquipe[] }) {
  if (membres.length === 0) return null;

  return (
    <RevealGroup
      gap={0.05}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(262px,1fr))",
        gap: 1,
        background: "var(--c-20)",
        border: "1px solid var(--c-20)",
      }}
    >
      {membres.map((membre) => {
        const photo = membre.portrait.src;
        // Sans couleur propre ni couleur de pôle, la carte reprend l'accent du
        // site : le liseré supérieur ne disparaît jamais.
        const couleur = membre.color || "var(--ac)";

        return (
          <RevealItem key={membre.id} style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                aspectRatio: "5/4",
                backgroundColor: photo ? "#e8ebf0" : "#eef1f7",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: photo ? "flex-end" : "center",
                justifyContent: "center",
                padding: 14,
                borderTop: `3px solid ${couleur}`,
              }}
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={membre.portrait.alt}
                  loading="lazy"
                  decoding="async"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 22%",
                  }}
                />
              ) : (
                <span
                  className="mono"
                  style={{
                    fontSize: "clamp(32px,4.4vw,46px)",
                    fontWeight: 600,
                    color: "var(--c-30)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {initials(membre.role)}
                </span>
              )}
            </div>

            <div style={{ padding: "18px 18px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.3 }}>{membre.role}</div>
              {membre.pole && (
                <span
                  className="mono"
                  style={{
                    display: "inline-block",
                    alignSelf: "flex-start",
                    marginTop: 10,
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: couleur,
                    border: `1px solid ${couleur}`,
                    padding: "3px 8px",
                  }}
                >
                  {membre.pole}
                </span>
              )}
              {membre.mandat && (
                <p style={{ margin: "14px 0 0", fontSize: 13, lineHeight: 1.5, color: "var(--c-70)", flex: 1 }}>
                  {membre.mandat}
                </p>
              )}
              {membre.nom && (
                <div style={{ marginTop: 14, borderTop: "1px solid var(--c-10)", paddingTop: 12 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--c-black)" }}>{membre.nom}</span>
                </div>
              )}
            </div>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
