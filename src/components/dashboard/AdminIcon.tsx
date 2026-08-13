/* Jeu d'icônes des modules de la console.
   Mêmes règles de dessin que `components/ui/Icon.tsx` : grille 24×24, tracés
   rectilignes, angles vifs (aucun arrondi), trait de 1,5 px, `currentColor`.

   Fichier séparé, et non une extension du jeu public : `PATHS` est un objet
   littéral, donc non élagable — fusionner les deux ferait voyager les quinze
   icônes de la console dans le paquet du site public, et inversement. */
import type { CSSProperties, ReactElement } from "react";
import type { Permission } from "@/lib/auth/permissions";

const PATHS: Record<Permission, ReactElement> = {
  /* Tableau de bord : grille de tuiles d'indicateurs */
  "tableau-de-bord": (
    <>
      <path d="M3 3h8v8H3z" />
      <path d="M13 3h8v5h-8z" />
      <path d="M13 10h8v11h-8z" />
      <path d="M3 13h8v8H3z" />
    </>
  ),
  /* Appels d'offres : la balance de l'évaluation comparative des offres */
  marches: (
    <>
      <path d="M12 3v18" />
      <path d="M5 7h14" />
      <path d="M4 7l-2 6h4z" />
      <path d="M20 7l-2 6h4z" />
      <path d="M8 21h8" />
    </>
  ),
  /* Soumissionnaires : l'entreprise candidate */
  soumissionnaires: (
    <>
      <path d="M4 21V5h9v16" />
      <path d="M13 11h7v10" />
      <path d="M7 8.5h3M7 12.5h3M7 16.5h3" />
      <path d="M16 14.5h1.5M16 17.5h1.5" />
    </>
  ),
  /* Actualités : le journal */
  actualites: (
    <>
      <path d="M3 5h14v15H3z" />
      <path d="M17 9h4v11h-4" />
      <path d="M6 8.5h8M6 12h8M6 15.5h5" />
    </>
  ),
  /* Documents & transparence : feuilles superposées, coin coupé */
  documents: (
    <>
      <path d="M8 3h7l4 4v12H8z" />
      <path d="M15 3v4h4" />
      <path d="M5 6v15h11" />
    </>
  ),
  /* Médias : le cadre photographique */
  medias: (
    <>
      <path d="M3 5h18v14H3z" />
      <path d="M3 16l5-5 4 4 3-3 6 6" />
      <path d="M15.5 8h2.5v2.5h-2.5z" />
    </>
  ),
  /* Événements : le calendrier, avec sa date marquée */
  evenements: (
    <>
      <path d="M3 5h18v16H3z" />
      <path d="M3 10h18" />
      <path d="M8 3v4M16 3v4" />
      <path d="M6.5 13h3.5v3.5H6.5z" />
    </>
  ),
  /* Histoires & impact : le livre ouvert */
  histoires: (
    <>
      <path d="M3 4h18v14H3z" />
      <path d="M12 4v14" />
      <path d="M6 8h3M6 11.5h3M15 8h3M15 11.5h3" />
    </>
  ),
  /* Vidéos & galerie : l'écran de lecture */
  videos: (
    <>
      <path d="M3 5h18v14H3z" />
      <path d="M10 8.5l5.5 3.5-5.5 3.5z" />
    </>
  ),
  /* Ressources & publications : les volumes rangés */
  ressources: (
    <>
      <path d="M3 4h5v16H3z" />
      <path d="M9.5 4h5v16h-5z" />
      <path d="M16 7h5v13h-5z" />
    </>
  ),
  /* Newsletter : l'enveloppe et son rabat */
  newsletter: (
    <>
      <path d="M3 5h18v14H3z" />
      <path d="M3 5l9 7 9-7" />
    </>
  ),
  /* Gouvernance : l'organigramme des instances */
  gouvernance: (
    <>
      <path d="M9 3h6v4H9z" />
      <path d="M2.5 17h6v4h-6z" />
      <path d="M15.5 17h6v4h-6z" />
      <path d="M12 7v3.5" />
      <path d="M5.5 17v-6.5h13V17" />
    </>
  ),
  /* Le projet : le jalon planté */
  projet: (
    <>
      <path d="M6 3v18" />
      <path d="M6 4h13l-3 4 3 4H6z" />
    </>
  ),
  /* Plaintes (MGP) : la parole adressée, et son signalement */
  mgp: (
    <>
      <path d="M3 4h18v12h-9.5L6 21v-5H3z" />
      <path d="M12 7v3.5" />
      <path d="M11.3 12.3h1.4v1.4h-1.4z" />
    </>
  ),
  /* i18n & réglages : les curseurs de configuration */
  reglages: (
    <>
      <path d="M3 7h4.5M11.5 7h9.5" />
      <path d="M7.5 5h4v4h-4z" />
      <path d="M3 17h4.5M11.5 17h9.5" />
      <path d="M7.5 15h4v4h-4z" />
      <path d="M3 12h9.5M16.5 12h4.5" />
      <path d="M12.5 10h4v4h-4z" />
    </>
  ),
  /* Utilisateurs : le compte, et le geste d'en ouvrir un */
  utilisateurs: (
    <>
      <path d="M6.5 5h6v5h-6z" />
      <path d="M2.5 20.5V16h14v4.5" />
      <path d="M18.5 3v6M15.5 6h6" />
    </>
  ),
};

export function AdminIcon({
  name,
  size = 18,
  style,
  className,
}: {
  name: Permission;
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
