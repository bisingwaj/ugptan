import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { notFound } from "next/navigation";
import { asLang, estLocale, LOCALES } from "@/lib/params";
import { SITE_URL } from "@/lib/site";
import { dict } from "@/content/i18n";
import { meta } from "@/content/data";
import { VideoProvider } from "@/components/video/VideoProvider";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { Newsletter } from "@/components/chrome/Newsletter";
import { AvisNavigation } from "@/components/legal/AvisNavigation";
import { SlotsOverlay } from "@/components/dev/SlotsOverlay";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { NavigationProgress } from "@/components/motion/NavigationProgress";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Cursor } from "@/components/motion/Cursor";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#161616",
};

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);
  const title = `UGPTN — ${meta.projetLong}`;
  const description = t.home.heroLead;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s · UGPTN" },
    description,
    applicationName: "UGPTN",
    authors: [{ name: meta.uniteLong }],
    keywords: ["UGPTN", "PTN-RDC", "transformation numérique", "RDC", "Banque mondiale", "AFD", meta.code],
    openGraph: { title, description, url: `/${lang}`, siteName: "UGPTN", locale: lang === "en" ? "en_US" : "fr_FR", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `/${lang}`, languages: { fr: "/fr", en: "/en" } },
    robots: { index: true, follow: true },
  };
}

export default async function LangLayout(props: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const params = await props.params;

  const {
    children
  } = props;

  /**
   * ⚠️ `dynamicParams = false` ne suffit pas : il ne ferme la porte qu'aux pages
   * PRÉRENDUES. Celles qui sont rendues à la demande — actualités, événements,
   * ressources — acceptaient donc n'importe quel premier segment, et `asLang`
   * les servait en français sans broncher.
   *
   * Conséquence observée : `/<slug-console>/actualites` renvoyait le site
   * public à l'intérieur du sous-arbre d'administration, chrome comprise. Le
   * proxy ne pouvait pas l'empêcher — il laisse passer ce sous-arbre sans le
   * réécrire, faute de connaître la table des routes de la console.
   *
   * Une langue inconnue n'est pas une langue à corriger : c'est une adresse qui
   * n'existe pas.
   */
  if (!estLocale(params.lang)) notFound();

  const lang = asLang(params.lang);
  return (
    // suppressHydrationWarning : les extensions de navigateur (gestionnaires de
    // mots de passe, pipettes à couleurs, traducteurs) posent leurs propres
    // attributs sur <html> et <body> AVANT l'hydratation. React signalait alors
    // un écart serveur/client qui ne vient pas de nous et qu'on ne peut pas
    // corriger. L'attribut ne porte QUE sur cet élément-ci, jamais sur ses
    // descendants : un vrai écart dans l'application resterait signalé.
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Secours sans JS : force la visibilité des éléments animés (data-mo). */}
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: "[data-mo]{opacity:1!important;transform:none!important;clip-path:none!important}" }} />
        </noscript>
      </head>
      <body suppressHydrationWarning>
        <MotionProvider>
          <NavigationProgress />
          <SmoothScroll />
          <Cursor />
          <VideoProvider lang={lang}>
            <Header lang={lang} />
            <main>{children}</main>
            <Newsletter lang={lang} />
            <Footer lang={lang} />
            <AvisNavigation lang={lang} />
            <SlotsOverlay />
          </VideoProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
