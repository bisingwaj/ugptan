/* Helpers de couleur des composantes.
   Chaque page de composante redéfinit localement les variables d'accent à partir
   de `compColors` : tous les composants existants (Kicker, .btn--primary, .bar,
   .duo, nappes de survol) prennent alors la couleur de la composante. */
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

/** Couleur de texte lisible sur un aplat de la couleur de composante. */
export const onComp = (code: string): string => (luminance(compColor(code)) > 0.5 ? "#161616" : "#ffffff");

/** Seule la variable `--comp` (teinte d'une ligne / carte hors page composante). */
export const compVar = (code: string): CSSProperties => ({ "--comp": compColor(code) } as CSSProperties);

/** Variables d'accent à poser sur le conteneur racine de la page. */
export function compTint(code: string): CSSProperties {
  const c = compColor(code);
  return {
    "--ac": c,
    "--acd": mix(c, -0.24),
    "--ac-light": mix(c, 0.45),
    "--ac-pale": mix(c, 0.93),
    "--ac-line": mix(c, 0.76),
    "--comp": c,
  } as CSSProperties;
}
