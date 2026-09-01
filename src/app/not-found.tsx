import type { Metadata } from "next";
import "@/styles/globals.css";
import { policesClassName } from "@/lib/fonts";
import { Introuvable } from "@/components/chrome/Introuvable";

/**
 * Adresse qui ne correspond à aucune route du site.
 *
 * Sans cet écran, une URL mal recopiée tombait sur celui de Next : « 404 — This
 * page could not be found », en anglais, sans style ni sortie, sur le site
 * institutionnel d'une unité congolaise. C'était la seule page qu'un visiteur
 * perdu voyait.
 *
 * ⚠️ À LA RACINE, et non dans le segment de langue. Une adresse dont le premier
 * segment n'est pas une route connue est écartée AVANT que `[lang]` n'entre en
 * jeu : une frontière posée à l'intérieur n'aurait jamais été atteinte. Le prix
 * à payer est l'absence d'en-tête et de pied de page, que les quatre sorties de
 * `Introuvable` remplacent.
 *
 * ⚠️ Les polices et la feuille de style sont rappelées ici : cet écran est rendu
 * HORS du layout de langue, qui les porte pour tout le reste du site.
 */
export const metadata: Metadata = {
  title: "Page introuvable · UGPTN",
  robots: { index: false, follow: true },
};

export default function PageIntrouvable() {
  return (
    <div className={policesClassName}>
      <Introuvable />
    </div>
  );
}
