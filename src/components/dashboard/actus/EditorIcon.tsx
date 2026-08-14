/* Icônes de la barre d'outils de l'éditeur.
   Mêmes règles de dessin que `components/dashboard/AdminIcon.tsx` : grille
   24×24, tracés rectilignes, angles vifs, trait de 1,5 px, `currentColor`.

   Fichier séparé du jeu des modules : `PATHS` est un objet littéral, donc non
   élagable — les fusionner ferait voyager les icônes de l'éditeur dans tous les
   écrans de la console, et inversement. */
import type { ReactElement } from "react";

export type EditorIconName =
  | "puces" | "numeros" | "gauche" | "centre" | "droite" | "justifie"
  | "lien" | "delier" | "image" | "video" | "tableau" | "regle"
  | "citation" | "annuler" | "retablir" | "gomme" | "source" | "couleur" | "surlignage"
  | "graphique";

const PATHS: Record<EditorIconName, ReactElement> = {
  puces: (
    <>
      <path d="M3 6h1.5M3 12h1.5M3 18h1.5" />
      <path d="M8 6h13M8 12h13M8 18h13" />
    </>
  ),
  numeros: (
    <>
      <path d="M3 5h1.5v4M3 9h3" />
      <path d="M3 15h3v2H3v2h3" />
      <path d="M9 6h12M9 12h12M9 18h12" />
    </>
  ),
  gauche: (
    <>
      <path d="M3 5h18M3 10h11M3 15h18M3 20h11" />
    </>
  ),
  centre: (
    <>
      <path d="M3 5h18M6 10h12M3 15h18M6 20h12" />
    </>
  ),
  droite: (
    <>
      <path d="M3 5h18M10 10h11M3 15h18M10 20h11" />
    </>
  ),
  justifie: (
    <>
      <path d="M3 5h18M3 10h18M3 15h18M3 20h18" />
    </>
  ),
  lien: (
    <>
      <path d="M10 14l4-4" />
      <path d="M9 7h5v5" />
      <path d="M14 17H9v-5" />
      <path d="M4 12h4M16 12h4" />
    </>
  ),
  delier: (
    <>
      <path d="M9 7h5v3" />
      <path d="M14 17H9v-3" />
      <path d="M4 4l16 16" />
    </>
  ),
  image: (
    <>
      <path d="M3 5h18v14H3z" />
      <path d="M3 16l5-5 4 4 3-3 6 6" />
      <path d="M15.5 8h2.5v2.5h-2.5z" />
    </>
  ),
  video: (
    <>
      <path d="M3 5h18v14H3z" />
      <path d="M10 8.5l5.5 3.5-5.5 3.5z" />
    </>
  ),
  tableau: (
    <>
      <path d="M3 4h18v16H3z" />
      <path d="M3 9h18M3 14.5h18" />
      <path d="M9.5 4v16M15.5 4v16" />
    </>
  ),
  regle: <path d="M3 12h18" />,
  citation: (
    <>
      <path d="M4 5h6v7H4z" />
      <path d="M4 12v4l3-4" />
      <path d="M14 5h6v7h-6z" />
      <path d="M14 12v4l3-4" />
    </>
  ),
  annuler: (
    <>
      <path d="M4 9h11a5 5 0 0 1 0 10H9" />
      <path d="M8 5L4 9l4 4" />
    </>
  ),
  retablir: (
    <>
      <path d="M20 9H9a5 5 0 0 0 0 10h6" />
      <path d="M16 5l4 4-4 4" />
    </>
  ),
  gomme: (
    <>
      <path d="M8 3h9l-2 12H10z" />
      <path d="M6 19h13" />
      <path d="M4 7l4 4" />
    </>
  ),
  source: (
    <>
      <path d="M8 7l-5 5 5 5" />
      <path d="M16 7l5 5-5 5" />
      <path d="M13 4l-2 16" />
    </>
  ),
  couleur: (
    <>
      <path d="M7 15L12 4l5 11" />
      <path d="M9 11h6" />
      <path d="M4 20h16" />
    </>
  ),
  surlignage: (
    <>
      <path d="M5 13l7-7 4 4-7 7H5z" />
      <path d="M3 20h18" />
    </>
  ),
  /* Trois colonnes sur une ligne de base : le dessin dit « série de valeurs »,
     ce que la modale demande de saisir, et non « statistiques » en général. */
  graphique: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20V11h3v9" />
      <path d="M14 20V6h3v14" />
    </>
  ),
};

export function EditorIcon({ name, size = 17 }: { name: EditorIconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
