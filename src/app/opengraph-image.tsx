import { ImageResponse } from "next/og";

/* Image de partage social (Open Graph / Twitter), générée par Next au build.
   Aucune police externe n'est chargée (police par défaut de next/og) →
   génération fiable, y compris hors-ligne. Appliquée à toutes les routes. */

export const alt = "UGPTN — Projet de Transformation Numérique de la RDC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#161616",
          padding: 80,
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 22, height: 60, background: "#0f62fe" }} />
          <div style={{ fontSize: 32, letterSpacing: 2, color: "#c6c6c6" }}>PTN-RDC · P180495</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>UGPTN</div>
          <div style={{ fontSize: 44, color: "#a8c7ff", marginTop: 26, maxWidth: 940, lineHeight: 1.2 }}>
            Transformation numérique de la République Démocratique du Congo
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 27, color: "#8d8d8d" }}>
          Banque mondiale · AFD · 26 provinces · horizon 2029
        </div>
      </div>
    ),
    { ...size },
  );
}
