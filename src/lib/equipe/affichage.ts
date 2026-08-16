/**
 * Règles de dessin communes aux cartes de l'équipe.
 *
 * ⚠️ Aucun import de Prisma ni de React runtime : le module n'expose que des
 * valeurs et un type, et se lit donc aussi bien depuis un composant serveur que
 * depuis un composant client.
 *
 * Ce qui vit ici : le plafond de l'intitulé de poste. Il concerne la grille de
 * l'équipe comme les cartes de coordination, deux fichiers distincts qui
 * afficheraient sinon le même texte sous deux limites différentes — et
 * divergeraient au premier réglage.
 */
import type { CSSProperties } from "react";

/**
 * Plafond de l'intitulé de poste, en lignes.
 *
 * Les cartes sont bâties sur des colonnes étroites (212 px pour la grille,
 * 262 px pour la coordination) : un intitulé de trois lignes tient, un intitulé
 * de six repousse le nom vers le bas et désaligne le filet qui l'en sépare, sur
 * toute la rangée. Le plafond borne le dégât sans rien exiger de la rédaction,
 * qui saisit ce qu'elle veut.
 *
 * Il vaut pour les DEUX formats : une carte plus large accueille davantage de
 * signes par ligne, pas davantage de lignes. C'est la hauteur qui décale le
 * dessin, jamais la largeur.
 */
export const LIGNES_ROLE = 3;

/**
 * Coupe un texte au-delà de `LIGNES_ROLE`.
 *
 * À poser sur l'élément qui porte l'intitulé, ET à accompagner d'un attribut
 * `title` portant le texte entier : la coupure est visuelle, elle ne doit rien
 * retirer à ce que lisent les lecteurs d'écran ni à ce qu'obtient un survol.
 */
export const plafondRole: CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: LIGNES_ROLE,
  overflow: "hidden",
};
