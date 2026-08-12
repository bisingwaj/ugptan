import clsx, { type ClassValue } from "clsx";

/**
 * Composition de classes Tailwind.
 *
 * Volontairement sans `tailwind-merge` : les composants du site s'appuient sur
 * les classes du design system (`.btn`, `.cell`, `.field`…), que la fusion
 * automatique ne sait pas arbitrer face aux utilitaires. Les conflits se
 * règlent donc par l'ordre des couches (`components` < `utilities`), pas par
 * une suppression de classes au moment du rendu.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
