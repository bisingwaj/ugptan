/**
 * Coquille propre à l'écran de fermeture.
 *
 * Troisième racine du dossier `app`, à côté du site public et de la console.
 * Elle existe pour une raison simple : l'écran de maintenance ne doit porter ni
 * en-tête, ni pied de page, ni avis de navigation. Le placer sous la coquille
 * publique l'aurait entouré de liens menant tous au même écran.
 *
 * Le proxy réécrit vers ce segment (cf. src/proxy.ts) : l'adresse affichée reste
 * celle que le visiteur a demandée.
 */
import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { policesClassName } from "@/lib/fonts";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#161616",
};

/* Rien à indexer : la page ne vit que le temps d'une intervention, et le proxy
   répond déjà 503. Le `noindex` couvre le cas d'un moteur qui passerait outre. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={policesClassName} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
