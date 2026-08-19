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
    background_color: "#ffffff",
    theme_color: "#161616",
    lang: "fr",
    /* `/icon.png` et `/apple-icon.png` sont servis par Next depuis app/ : les
       déclarer ici les rend aussi disponibles à l'installation sur l'écran
       d'accueil, que le <head> seul ne couvre pas. */
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
