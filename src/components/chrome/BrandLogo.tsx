import { cn } from "@/lib/cn";

/**
 * Les deux formats livrés dans `public/brand/` (cf. scripts/brand-assets.mjs).
 *
 * `signature` retire du logotype la mention « Unité de gestion du projet de
 * transformation numérique » : quatre lignes hautes de quatorze pixels dans le
 * fichier d'origine, elles ne forment plus qu'une salissure grise ramenées à la
 * hauteur d'un bandeau de 64px. Le mot-symbole et la carte suffisent à cette
 * échelle, et le nom complet figure de toute façon en clair sous le logo du
 * pied de page.
 *
 * `complet` garde la mention et ne vaut qu'au-delà de 500px de large : le seul
 * usage est l'image de partage social, qui l'affiche à 520px.
 */
const FORMATS = {
  signature: {
    clair: "/brand/ugptn-signature.png",
    sombre: "/brand/ugptn-signature-light.png",
    width: 316,
    height: 160,
  },
  complet: {
    clair: "/brand/ugptn-logo.png",
    sombre: "/brand/ugptn-logo-light.png",
    width: 630,
    height: 320,
  },
} as const;

type Props = {
  format?: keyof typeof FORMATS;
  /** Fond sombre : bascule sur la déclinaison au lettrage blanc. */
  sombre?: boolean;
  /** Porte la hauteur ; la largeur suit le rapport intrinsèque. */
  className?: string;
  alt?: string;
  /** Marque du bandeau : présente au premier rendu, jamais différée. */
  priority?: boolean;
};

/**
 * Logotype UGPTN.
 *
 * Balise `img` nue plutôt que `next/image` : l'optimiseur ré-encode en AVIF ou
 * WebP à qualité 75, et cette compression avec perte fabrique des salissures
 * sur un aplat de lettrage — un liseré parasite apparaît sous le mot-symbole.
 * Les fichiers sont déjà détourés, dimensionnés au triple de leur taille
 * d'affichage et compressés sans perte ; `next/image` avec `unoptimized`
 * rendrait la même balise sans rien apporter.
 *
 * `width` et `height` ne fixent pas la taille affichée, ils portent le rapport
 * intrinsèque : la hauteur vient du CSS, la largeur s'en déduit, et la place
 * est réservée avant le chargement (aucun décalage de mise en page).
 */
export function BrandLogo({
  format = "signature",
  sombre = false,
  className,
  alt = "UGPTN",
  priority = false,
}: Props) {
  const f = FORMATS[format];
  return (
    <img
      src={sombre ? f.sombre : f.clair}
      alt={alt}
      width={f.width}
      height={f.height}
      className={cn("w-auto", className)}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}
