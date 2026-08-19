import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/* Lecture par le SYSTÈME DE FICHIERS, et non par `fetch(new URL(...))` que
   montrent bien des exemples : `fetch` ne sait pas ouvrir une URL `file://`
   sous Node, et échouait donc en silence — la vignette se générait sans le
   signe, sans que rien ne le signale.
   Cette route est prérendue au build (`○ /opengraph-image`), au moment où le
   dépôt est entier : `public/` est donc bien là. */
function lireSigne(): Buffer | null {
  try {
    return readFileSync(join(process.cwd(), "public", "marque", "ugptn-signe.png"));
  } catch {
    return null;
  }
}

/* Image de partage social (Open Graph / Twitter), générée par Next au build.
   Aucune police externe n'est chargée (police par défaut de next/og) →
   génération fiable, y compris hors-ligne. Appliquée à toutes les routes. */

export const alt = "UGPTN — Projet de Transformation Numérique de la RDC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Hauteur du signe. Il occupe le quart droit, sans concurrencer le mot UGPTN. */
const SIGNE_H = 230;

export default function OpengraphImage() {
  const marque = lireSigne();

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
          /* Ancre du signe, posé hors du flux ci-dessous. */
          position: "relative",
        }}
      >
        {/* Hors du flux, exprès : posé DANS la colonne, le signe grandissait la
            première rangée et rognait l'espace que `space-between` distribuait
            au reste — les mentions de bas de vignette venaient coller au
            sous-titre. Absolu, il ne coûte plus une ligne à personne. */}
        {marque && (
          <img
            src={`data:image/png;base64,${marque.toString("base64")}`}
            alt=""
            height={SIGNE_H}
            width={Math.round((328 / 449) * SIGNE_H)}
            style={{ position: "absolute", top: 76, right: 84 }}
          />
        )}
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
