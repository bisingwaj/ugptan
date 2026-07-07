import type { MetadataRoute } from "next";

/** Served at /manifest.webmanifest — lié automatiquement par Next dans le <head>. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UGPTN — Unité de Gestion du Projet de Transformation Numérique",
    short_name: "UGPTN",
    description:
      "Portail institutionnel de l'UGPTN — Projet de Transformation Numérique de la RDC (PTN-RDC · P180495).",
    start_url: "/fr",
    scope: "/",
    display: "standalone",
    background_color: "#161616",
    theme_color: "#161616",
    lang: "fr",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
