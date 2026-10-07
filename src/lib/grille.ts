/* Grilles « pleines » : un nombre de colonnes qui tombe juste.

   Les grilles à filets ne montrent plus de cases grises quand une rangée reste
   incomplète (cf. le bloc « Celled grid » de globals.css) : la fin de grille
   prend le fond de la section. Mais une rangée bancale reste une rangée
   bancale — dix logos sur sept colonnes laissent trois logos seuls sous une
   ligne pleine. Quand un diviseur du nombre d'éléments existe dans la plage de
   colonnes que la grille supporte, on le prend : 10 → 5 × 2, 8 → 4 × 2,
   6 → 3 × 2. Quand il n'en existe pas (11 membres, 7 indicateurs), la grille
   garde son pas automatique et sa fin en escalier.

   Le calcul se fait côté serveur, sur le nombre d'éléments réellement publiés
   (la console peut en ajouter ou en retirer) ; la classe `.grille-pleine`
   n'applique `--cols` qu'au-delà de 1200 px, là où la grille atteint sa pleine
   largeur. En dessous, les pistes automatiques reprennent la main : imposer
   cinq colonnes sur une tablette écraserait les cellules. */
import type { CSSProperties } from "react";

/**
 * Plus grand nombre de colonnes, entre `min` et `max`, qui divise `n`.
 * `null` s'il n'en existe pas. Une grille qui tient sur une seule rangée
 * (`n ≤ max`) prend `n` colonnes : cinq fiches sur une grille de quatre
 * forment une rangée de cinq plutôt qu'une rangée de quatre et une orpheline.
 */
export function colonnesPleines(n: number, max: number, min = 2): number | null {
  if (n < min) return null;
  for (let k = Math.min(max, n); k >= min; k--) if (n % k === 0) return k;
  return null;
}

/**
 * Classe et variable à poser sur le conteneur de grille. Renvoie un objet vide
 * quand aucun diviseur ne convient : la grille reste telle quelle.
 *
 * `style` est à FUSIONNER avec le style existant du conteneur, jamais à lui
 * substituer : il ne porte que `--cols`.
 */
export function grillePleine(
  n: number,
  max: number,
  min = 2,
): { className?: string; style?: CSSProperties } {
  const k = colonnesPleines(n, max, min);
  if (k === null) return {};
  return { className: "grille-pleine", style: { "--cols": k } as CSSProperties };
}
