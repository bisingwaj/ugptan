/**
 * Coquille propre à l'écran de fermeture.
 *
 * Troisième racine du dossier `app`, à côté du site public et de la console.
 * Elle existe pour une raison simple : l'écran de maintenance ne doit porter ni
 * en-tête, ni pied de page, ni avis de navigation. Le placer sous la coquille
 * publique l'aurait entouré de liens menant tous au même écran.
 *
 * Le proxy sert ce segment sous l'adresse que le visiteur a demandée (cf.
 * src/proxy.ts) : en 503 pour une page lue par un navigateur ou un moteur, par
 * réécriture pour les actions serveur et les navigations client.
 */
import type { Viewport } from "next";
import "@/styles/globals.css";
import { policesClassName } from "@/lib/fonts";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#161616",
};

/* PAS de `noindex` ici, et c'est délibéré. Le proxy sert cet écran sous
   l'adresse de CHAQUE page du site (cf. src/proxy.ts, `servirEn503`) : un
   `noindex` y serait donc lu par les moteurs comme « retirez cette page de
   l'index », pour toutes les pages à la fois. Une fermeture de quelques jours
   aurait fait sortir le site entier des résultats.

   Le statut 503 accompagné de `Retry-After` suffit à dire « momentanément
   indisponible, repassez » : les moteurs n'indexent pas le corps d'une 5xx et
   conservent l'index existant. Dans les cas où l'écran part encore en 200
   (repli décrit dans le proxy), l'absence de `noindex` reste le moindre mal :
   l'écran remplace temporairement le contenu au lieu d'en commander le
   retrait, et la réouverture rétablit tout au passage suivant. */

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={policesClassName} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
