import type { Metadata, Viewport } from "next";
import "@/styles/dashboard.css";
import { NavigationProgress } from "@/components/motion/NavigationProgress";

/**
 * Layout racine de la console d'administration.
 *
 * Second layout racine de l'application, à côté de `src/app/[lang]/layout.tsx` :
 * un segment statique l'emporte sur le segment dynamique `[lang]`, donc
 * `/<slug>` arrive bien ici et n'hérite d'aucune chrome publique (Header,
 * Footer, Lenis, curseur custom, providers vidéo/motion).
 *
 * La barre de progression fait exception : c'est le SEUL composant de la chrome
 * publique repris ici, et la console en a plus besoin encore que le site. Ses
 * pages lisent toutes la base au rendu — une liste de plaintes, un article, un
 * export — et l'App Router laisse l'écran précédent affiché pendant ce temps,
 * sans rien signaler. La reprendre plutôt que d'en écrire une seconde garantit
 * que l'attente se lit de la même façon des deux côtés.
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
    // suppressHydrationWarning : cf. le même garde dans app/[lang]/layout.tsx.
    // Les extensions de navigateur écrivent sur <html> et <body> avant
    // l'hydratation ; l'attribut ne couvre que ces deux éléments, pas la console.
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
