/* Jeu d'icônes dessiné pour ce site — pas une bibliothèque importée.
   Vocabulaire graphique aligné sur la direction artistique : tracés rectilignes,
   angles vifs (aucun arrondi), trait de 1,5 px, grille 24×24, `currentColor`
   pour hériter de la couleur du contexte. Chaque icône décrit une action
   concrète du parcours, pas une métaphore générique. */
import type { CSSProperties } from "react";

export type IconName =
  /* Parcours soumissionnaire */
  | "compte" | "dossier" | "depot" | "attribution"
  /* Modes de saisine du mécanisme de plaintes */
  | "formulaire" | "sms" | "email" | "pointfocal";

const PATHS: Record<IconName, JSX.Element> = {
  /* Compte vérifié : carte d'identification d'entreprise + coche de vérification */
  compte: (
    <>
      <path d="M3 5h18v14H3z" />
      <path d="M6.5 8.5h5v5h-5z" />
      <path d="M14 9h4M14 12h3" />
      <path d="M6.5 16.5h5" />
      <path d="M15 15.5l1.8 1.8L21 13" />
    </>
  ),
  /* Dossier d'appel d'offres : document à coin coupé + flèche descendante */
  dossier: (
    <>
      <path d="M5 3h9l5 5v13H5z" />
      <path d="M14 3v5h5" />
      <path d="M12 11v6" />
      <path d="M9 14.5l3 3 3-3" />
    </>
  ),
  /* Dépôt d'offre : versement dans le bac + horodatage du dépôt */
  depot: (
    <>
      <path d="M4 14.5V20h16v-5.5" />
      <path d="M12 16.5V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M4 11.5h3M17 11.5h3" />
    </>
  ),
  /* Suivi & attribution : avancement mesuré, puis résultat publié */
  attribution: (
    <>
      <path d="M3 20.5h18" />
      <path d="M5.5 20.5V14M11 20.5V9.5M16.5 20.5V16" />
      <path d="M15 5.5l2 2 4-4" />
    </>
  ),
  /* Formulaire en ligne */
  formulaire: (
    <>
      <path d="M4 3h16v18H4z" />
      <path d="M7.5 8h9M7.5 12h9M7.5 16h5" />
    </>
  ),
  /* SMS / numéro vert : bulle anguleuse */
  sms: (
    <>
      <path d="M3 4h18v12h-9.5L6 21v-5H3z" />
      <path d="M7 8h10M7 11.5h6" />
    </>
  ),
  /* Courrier électronique */
  email: (
    <>
      <path d="M3 5.5h18v13H3z" />
      <path d="M3 5.5l9 7 9-7" />
    </>
  ),
  /* Point focal physique en province */
  pointfocal: (
    <>
      <path d="M5 3h14v12h-5l-2 4-2-4H5z" />
      <path d="M9.5 7h5v5h-5z" />
    </>
  ),
};

export function Icon({
  name,
  size = 24,
  style,
  className,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
  className?: string;
}) {
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
      className={className}
      style={style}
    >
      {PATHS[name]}
    </svg>
  );
}
