/* Helpers de couleur des composantes.
   Chaque page de composante redéfinit localement les variables d'accent à partir
   de sa couleur : tous les composants existants (Kicker, .btn--primary, .bar,
   .duo, nappes de survol) prennent alors la couleur de la composante.

   ⚠️ DEUX ENTRÉES, et elles ne servent pas la même chose.

   · `compTint(code)` / `compVar(code)` / `onComp(code)` lisent la table figée
     `compColors`. Elles ne subsistent que pour les écrans qui ne connaissent
     qu'un CODE et n'ont pas de composante sous la main — la carte des marchés,
     qui est un composant client, et le contenu d'origine.
   · `compTintDe(color)` / `compVarDe(color)` / `onCompDe(color)` prennent la
     couleur telle que la console la tient. C'est la voie normale depuis que les
     composantes vivent en base : ce sont elles que les pages du groupe
     « Le projet » emploient, sans quoi une couleur changée en console
     n'atteindrait jamais la page. */
import type { CSSProperties } from "react";
import { compColors } from "@/content/data";

type Rgb = [number, number, number];

const toRgb = (hex: string): Rgb => {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};

const toHex = ([r, g, b]: Rgb) =>
  "#" + [r, g, b].map((n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0")).join("");

/** Mélange vers le blanc (t > 0) ou vers le noir (t < 0). */
const mix = (hex: string, t: number): string => {
  const [r, g, b] = toRgb(hex);
  const target = t > 0 ? 255 : 0;
  const k = Math.abs(t);
  return toHex([r + (target - r) * k, g + (target - g) * k, b + (target - b) * k]);
};

export const compColor = (code: string): string => compColors[code.toUpperCase()] ?? "var(--ac)";

/** Luminance relative (WCAG) — sert à choisir un texte clair ou foncé sur la couleur. */
const luminance = (hex: string): number => {
  const chan = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = toRgb(hex);
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
};

/**
 * Couleur de texte lisible sur un aplat.
 *
 * ⚠️ La couleur peut être une VARIABLE CSS (`var(--ac)`) quand aucune n'est
 * renseignée : sa luminance n'est pas calculable ici. Le blanc l'emporte alors,
 * comme il le faisait avec l'accent du site, qui est sombre.
 */
export const onCompDe = (color: string): string =>
  color.startsWith("#") && luminance(color) > 0.5 ? "#161616" : "#ffffff";

/** Seule la variable `--comp` (teinte d'une ligne / carte hors page composante). */
export const compVarDe = (color: string): CSSProperties => ({ "--comp": color } as CSSProperties);

/** Variables d'accent à poser sur le conteneur racine de la page. */
export function compTintDe(color: string): CSSProperties {
  // Les mélanges n'ont de sens que sur un hexadécimal : sur une variable CSS,
  // on laisse le site garder son propre jeu d'accents.
  if (!color.startsWith("#")) return { "--comp": color } as CSSProperties;
  return {
    "--ac": color,
    "--acd": mix(color, -0.24),
    "--ac-light": mix(color, 0.45),
    "--ac-pale": mix(color, 0.93),
    "--ac-line": mix(color, 0.76),
    "--comp": color,
  } as CSSProperties;
}

/** Couleur de texte lisible sur un aplat de la couleur de composante. */
export const onComp = (code: string): string => onCompDe(compColor(code));

/** Seule la variable `--comp`, à partir d'un code. */
export const compVar = (code: string): CSSProperties => compVarDe(compColor(code));

/** Variables d'accent à poser sur le conteneur racine, à partir d'un code. */
export const compTint = (code: string): CSSProperties => compTintDe(compColor(code));
