/**
 * Marque de l'UGPTN.
 *
 * Trois fichiers, un seul composant : l'en-tête, le pied de page, la console et
 * son écran de connexion posaient chacun leur propre carré bleu dessiné en CSS,
 * doublé d'un « UGPTN » écrit à la main. Quatre copies d'un logo qui n'en était
 * pas un — et qu'une charte à jour laissait sans effet.
 *
 * ─── Choisir la variante ────────────────────────────────────────────────────
 *
 * Le mot-symbole existe en deux encres, et c'est le FOND qui tranche :
 *
 *   · `mot`    → le seul mot-symbole, en bleu de marque, sans la carte. C'est
 *     la marque de l'en-tête : à 64 px de barre, la carte du logo complet se
 *     réduisait à un enchevêtrement de traits d'un millimètre. Détouré, donc
 *     bon sur clair comme sur sombre ;
 *   · `sombre` → logo complet, encre noire, pour les fonds clairs ;
 *   · `claire` → encre blanche, pour les fonds sombres (pied de page, écran de
 *     connexion de la console) ;
 *   · `signe`  → la seule carte du réseau, détourée, sans mot-symbole. Elle est
 *     bleue sur transparent, donc lisible sur l'un comme sur l'autre. Réservée
 *     aux emplacements trop étroits pour le mot-symbole : le rail de la console,
 *     l'icône de l'onglet.
 *
 * ⚠️ `claire` porte un mot-symbole BLANC OPAQUE. Sur un fond clair, il
 * disparaît, et il ne reste que la carte — l'erreur est silencieuse, aucune
 * alerte ne la signale. Dans le doute, `signe` ne trompe jamais.
 *
 * Le dimensionnement se fait par la HAUTEUR, jamais par la largeur : les trois
 * fichiers n'ont pas le même rapport, et c'est la hauteur qui doit s'accorder à
 * la barre qui les accueille.
 */
import Image from "next/image";

export type VarianteMarque = "mot" | "sombre" | "claire" | "signe";

/** Dimensions natives : elles fixent le rapport, jamais la taille d'affichage. */
const FICHIERS: Record<VarianteMarque, { src: string; largeur: number; hauteur: number }> = {
  mot: { src: "/marque/ugptn-mot-bleu.png", largeur: 1959, hauteur: 719 },
  sombre: { src: "/marque/ugptn.png", largeur: 780, hauteur: 462 },
  claire: { src: "/marque/ugptn-blanc.png", largeur: 780, hauteur: 462 },
  signe: { src: "/marque/ugptn-signe.png", largeur: 328, hauteur: 449 },
};

type Props = {
  variante?: VarianteMarque;
  /** Hauteur d'affichage en pixels ; la largeur suit le rapport du fichier. */
  hauteur?: number;
  /**
   * Texte de remplacement. Vide quand un « UGPTN » écrit accompagne déjà la
   * marque : le répéter ferait annoncer le nom deux fois de suite.
   */
  alt?: string;
  className?: string;
  /** Vrai dans l'en-tête : la marque est au-dessus de la ligne de flottaison. */
  priority?: boolean;
};

export function Marque({
  variante = "sombre",
  hauteur = 32,
  alt = "UGPTN",
  className,
  priority = false,
}: Props) {
  const fichier = FICHIERS[variante];
  const largeur = Math.round((fichier.largeur / fichier.hauteur) * hauteur);

  return (
    <Image
      src={fichier.src}
      alt={alt}
      width={largeur}
      height={hauteur}
      className={className}
      priority={priority}
      style={{ height: hauteur, width: "auto" }}
    />
  );
}
