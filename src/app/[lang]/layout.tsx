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
import { EcranMaintenance } from "@/components/maintenance/EcranMaintenance";
import { etatMaintenance, fermetureApplicable } from "@/lib/reglages/maintenance";
import { policesClassName } from "@/lib/fonts";

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
    keywords: ["UGPTN", "PTN-RDC", "transformation numérique", "RDC", "Banque mondiale", "AFD", "P180495", "CCD1198"],
    openGraph: { title, description, url: `/${lang}`, siteName: "UGPTN", locale: lang === "en" ? "en_US" : "fr_FR", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `/${lang}`, languages: { fr: "/fr", en: "/en" } },
    /* Site fermé : plus rien ne doit être indexé tant que dure l'intervention.
       Un moteur ne porte aucun laissez-passer, il ne verrait donc que l'écran
       de maintenance ; l'indexer reviendrait à remplacer, dans les résultats de
       recherche, le résumé de chaque page par « le portail est fermé ». */
    robots: (await etatMaintenance()).ferme ? { index: false, follow: false } : { index: true, follow: true },
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

  /**
   * Fermeture du site, décidée depuis la console (cf. lib/reglages/maintenance.ts).
   *
   * Substitution ici, et non redirection vers une page dédiée : l'adresse
   * demandée est conservée, donc la personne qui saisit le code retombe sur la
   * page qu'elle visait, et non sur l'accueil. La coquille animée n'est pas
   * montée du tout — un écran de maintenance n'a ni défilement piloté, ni
   * curseur personnalisé, ni barre de navigation qui mènerait au même écran.
   *
   * ⚠️ La page est tout de même rendue en parallèle par l'App Router : la
   * substitution masque son résultat, elle n'annule pas son exécution. Sans
   * conséquence ici, ces pages ne faisant que lire.
   */
  const fermeture = await fermetureApplicable();
  if (fermeture) {
    return (
      <html lang={lang} className={policesClassName} suppressHydrationWarning>
        <body suppressHydrationWarning>
          <EcranMaintenance lang={lang} etat={fermeture} />
        </body>
      </html>
    );
  }

  return (
    // suppressHydrationWarning : les extensions de navigateur (gestionnaires de
    // mots de passe, pipettes à couleurs, traducteurs) posent leurs propres
    // attributs sur <html> et <body> AVANT l'hydratation. React signalait alors
    // un écart serveur/client qui ne vient pas de nous et qu'on ne peut pas
    // corriger. L'attribut ne porte QUE sur cet élément-ci, jamais sur ses
    // descendants : un vrai écart dans l'application resterait signalé.
    <html lang={lang} className={policesClassName} suppressHydrationWarning>
      <head>
        {/* Presque tous les visuels gérés depuis la console sont servis par le
            CDN de Cloudinary : ouvrir la connexion pendant la lecture du HTML
            épargne à la première image la négociation DNS + TLS. Les polices,
            elles, sont auto-hébergées (cf. src/lib/fonts.ts) et n'ont plus
            d'hôte tiers à joindre. */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        {/* Secours sans JS : force la visibilité des éléments animés (data-mo)
            et des images, dont le fondu d'apparition dépend de `onLoad`
            (cf. components/ui/Photo.tsx). */}
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: "[data-mo]{opacity:1!important;transform:none!important;clip-path:none!important}[data-photo=image]{opacity:1!important}[data-photo=apercu]{display:none!important}" }} />
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
