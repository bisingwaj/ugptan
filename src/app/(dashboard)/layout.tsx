import type { Metadata, Viewport } from "next";
import "@/styles/tokens.css";
import "@/styles/dashboard.css";

/**
 * Layout racine de la console d'administration.
 *
 * Second layout racine de l'application, à côté de `src/app/[lang]/layout.tsx` :
 * un segment statique l'emporte sur le segment dynamique `[lang]`, donc
 * `/<slug>` arrive bien ici et n'hérite d'aucune chrome publique (Header,
 * Footer, Lenis, curseur custom, providers vidéo/motion).
 *
 * ⚠️ Aucun contrôle d'authentification à ce niveau : l'écran de connexion vit
 * juste en dessous. Le verrou est dans `(console)/layout.tsx`.
 */

export const metadata: Metadata = {
  title: { default: "Console UGPTN", template: "%s · Console UGPTN" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#161616",
};

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
