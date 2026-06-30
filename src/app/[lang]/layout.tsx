import type { Metadata } from "next";
import "@/styles/globals.css";
import { asLang, LOCALES } from "@/lib/params";
import { dict } from "@/content/i18n";
import { meta } from "@/content/data";
import { VideoProvider } from "@/components/video/VideoProvider";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { Newsletter } from "@/components/chrome/Newsletter";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = asLang(params.lang);
  const t = dict(lang);
  const title = `UGPTN — ${meta.projetLong}`;
  const description = t.home.heroLead;
  return {
    metadataBase: new URL("https://www.ugpatn.cd"),
    title: { default: title, template: "%s · UGPTN" },
    description,
    applicationName: "UGPTN",
    authors: [{ name: meta.uniteLong }],
    keywords: ["UGPTN", "PTN-RDC", "transformation numérique", "RDC", "Banque mondiale", "AFD", meta.code],
    openGraph: { title, description, siteName: "UGPTN", locale: lang === "en" ? "en_US" : "fr_FR", type: "website" },
    alternates: { languages: { fr: "/fr", en: "/en" } },
    robots: { index: true, follow: true },
  };
}

export default function LangLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
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
        <meta name="theme-color" content="#161616" />
      </head>
      <body>
        <VideoProvider lang={lang}>
          <Header lang={lang} />
          <main>{children}</main>
          <Newsletter lang={lang} />
          <Footer lang={lang} />
        </VideoProvider>
      </body>
    </html>
  );
}
