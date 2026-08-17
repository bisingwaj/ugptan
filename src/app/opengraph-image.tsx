import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

/* Image de partage social (Open Graph / Twitter), générée par Next au build.
   Aucune police externe n'est chargée (police par défaut de next/og) →
   génération fiable, y compris hors-ligne. Appliquée à toutes les routes. */

export const alt = "UGPTN — Projet de Transformation Numérique de la RDC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* 1200 × 630 laisse enfin la place au logotype complet : à 520px de large, la
   mention en quatre lignes redevient lisible, là où le bandeau du site doit se
   contenter de la signature (cf. components/chrome/BrandLogo.tsx).

   Le fichier est lu depuis le disque et non chargé par URL : cette image est
   pré-rendue au build, moment où le site n'est joignable par aucune adresse.
   `satori`, le moteur de next/og, n'accepte pas de chemin de fichier — d'où
   l'URI de données. Le rendu se poursuit sans le logo si la lecture échoue :
   une image de partage dégradée vaut mieux qu'un build interrompu. */
const LOGO = { width: 520, height: 264 };

function logoDataUri(): string | null {
  try {
    const bytes = readFileSync(path.join(process.cwd(), "public", "brand", "ugptn-logo-light.png"));
    return `data:image/png;base64,${bytes.toString("base64")}`;
  } catch (e) {
    console.warn("[opengraph-image] logotype illisible, repli sur le titre seul :", e);
    return null;
  }
}

export default function OpengraphImage() {
  const logo = logoDataUri();

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
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" width={LOGO.width} height={LOGO.height} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ width: 22, height: 60, background: "#0f62fe" }} />
            <div style={{ fontSize: 32, letterSpacing: 2, color: "#c6c6c6" }}>UGPTN</div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 62, fontWeight: 700, letterSpacing: -1, lineHeight: 1.14, maxWidth: 1000 }}>
            Transformation numérique de la République Démocratique du Congo
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#8d8d8d" }}>
          PTN-RDC · P180495 · Banque mondiale · AFD · 26 provinces · horizon 2029
        </div>
      </div>
    ),
    { ...size },
  );
}
