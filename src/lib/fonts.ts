/**
 * Polices du site et de la console.
 *
 * `next/font/google` les TÉLÉCHARGE AU BUILD et les sert depuis notre propre
 * domaine. Les deux `<link>` vers fonts.googleapis.com qu'il remplace coûtaient,
 * à chaque première visite, une résolution DNS, une négociation TLS et un
 * aller-retour vers un tiers — le tout AVANT que le navigateur ne sache quelle
 * police charger, la feuille de style de Google ne faisant que désigner les
 * fichiers à aller chercher ailleurs. Deux allers-retours en cascade, sur le
 * chemin critique du rendu.
 *
 * Deux effets qui ne se voient pas dans un chronomètre :
 *   · plus rien n'est demandé à Google au chargement d'une page, ce qui retire
 *     un tiers du parcours de l'internaute ;
 *   · `next/font` génère une police de repli aux MÉTRIQUES ajustées, si bien
 *     que la bascule vers la vraie fonte ne déplace plus le texte.
 *
 * ⚠️ Les graisses déclarées ici sont celles qu'appelle le CSS. En ajouter une
 * dans une feuille sans l'ajouter ici la ferait synthétiser par le navigateur,
 * en gras approximatif.
 */
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plex-sans",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-mono",
});

/** À poser sur `<html>` : c'est là que `tokens.css` lit les deux variables. */
export const policesClassName = `${plexSans.variable} ${plexMono.variable}`;
