/**
 * Grille des membres de l'Unité.
 *
 * Le même bloc était écrit DEUX FOIS, à deux pixels près : sur l'accueil
 * (section « L'équipe de l'Unité ») et sur la page « L'Unité ». Les deux
 * copies affichaient la même liste, et une correction sur l'une ne remontait
 * pas sur l'autre. Elles sont réunies ici.
 *
 * Les deux écarts de dessin subsistants sont paramétrés, parce qu'ils sont
 * voulus : l'accueil pose sa grille avec `.celled-flow` (filets portés par les
 * cellules), la page « L'Unité » avec une grille bordée d'un pixel. Le reste —
 * carré du portrait, pastille d'initiales, numéro en incrustation, filet sous
 * le nom — est identique et ne se règle plus qu'à un endroit.
 */
import type { CSSProperties } from "react";
import { initials } from "@/lib/format";
import { plafondRole } from "@/lib/equipe/affichage";
import type { MembreEquipe } from "@/lib/equipe/query";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

/** Numéro d'ordre affiché en incrustation : « 01 », « 02 »… */
const n2 = (i: number) => String(i + 1).padStart(2, "0");

type Props = {
  membres: MembreEquipe[];
  /**
   * `accueil` : filets portés par les cellules (`.celled-flow`).
   * `unite`   : grille bordée, fond gris entre les cellules.
   */
  variante?: "accueil" | "unite";
};

/** Habillage du conteneur, seul écart de dessin entre les deux pages. */
const CONTENEUR: Record<"accueil" | "unite", { className?: string; style: CSSProperties }> = {
  accueil: {
    className: "celled-flow",
    style: { gridTemplateColumns: "repeat(auto-fill,minmax(212px,1fr))" },
  },
  unite: {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(212px,1fr))",
      gap: 1,
      background: "var(--c-20)",
      border: "1px solid var(--c-20)",
    },
  },
};

export function GrilleEquipe({ membres, variante = "accueil" }: Props) {
  if (membres.length === 0) return null;

  const conteneur = CONTENEUR[variante];
  // L'accueil porte des intitulés à peine plus grands que la page « L'Unité ».
  const tailleRole = variante === "accueil" ? 15 : 14.5;

  return (
    <RevealGroup gap={0.05} className={conteneur.className} style={conteneur.style}>
      {membres.map((membre, i) => {
        const photo = membre.portrait.src;

        return (
          <RevealItem
            key={membre.id}
            style={{ background: "#fff", display: "flex", flexDirection: "column" }}
          >
            <div
              style={{
                aspectRatio: "1/1",
                backgroundColor: photo ? "#e8ebf0" : "#eef1f7",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: photo ? "flex-end" : "center",
                justifyContent: "center",
                padding: 14,
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
                    objectPosition: "center 18%",
                  }}
                />
              ) : (
                <span
                  className="mono"
                  style={{
                    fontSize: "clamp(30px,5vw,44px)",
                    fontWeight: 600,
                    color: "var(--c-30)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {initials(membre.role)}
                </span>
              )}
              <span
                className="mono"
                style={{
                  position: "absolute",
                  top: 12,
                  left: 14,
                  fontSize: 10,
                  color: photo ? "#fff" : "var(--ac)",
                  textShadow: photo ? "0 1px 3px rgba(0,0,0,.55)" : undefined,
                }}
              >
                {n2(i)}
              </span>
            </div>

            <div
              style={{
                padding: "16px 16px 20px",
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <div
                  title={membre.role}
                  style={{ fontSize: tailleRole, fontWeight: 600, lineHeight: 1.25, ...plafondRole }}
                >
                  {membre.role}
                </div>
                {membre.pole && (
                  <div style={{ fontSize: 12, color: "var(--c-60)", marginTop: 6 }}>{membre.pole}</div>
                )}
              </div>
              {membre.nom && (
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--c-black)",
                    /* Colle le nom au bas de la carte : les cellules d'une même
                       rangée ayant la même hauteur, les filets s'alignent quelle
                       que soit la longueur des intitulés au-dessus. */
                    marginTop: "auto",
                    borderTop: "1px solid var(--c-10)",
                    paddingTop: 10,
                  }}
                >
                  {membre.nom}
                </div>
              )}
            </div>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
