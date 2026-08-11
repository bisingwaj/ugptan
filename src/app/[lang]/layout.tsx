import type { Metadata, Viewport } from "next";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import { asLang, LOCALES } from "@/lib/params";
import { SITE_URL } from "@/lib/site";
import { dict } from "@/content/i18n";
import { meta } from "@/content/data";
import { VideoProvider } from "@/components/video/VideoProvider";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { Newsletter } from "@/components/chrome/Newsletter";
import { SlotsOverlay } from "@/components/dev/SlotsOverlay";
import { MotionProvider } from "@/components/motion/MotionProvider";
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

  const lang = asLang(params.lang);
  return (
    <html lang={lang}>
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
      <body>
        <MotionProvider>
          <SmoothScroll />
          <Cursor />
          <VideoProvider lang={lang}>
            <Header lang={lang} />
            <main>{children}</main>
            <Newsletter lang={lang} />
            <Footer lang={lang} />
            <SlotsOverlay />
          </VideoProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
