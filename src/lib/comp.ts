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

/** Rapport de contraste WCAG entre deux luminances relatives (≥ 1). */
const rapport = (la: number, lb: number): number =>
  (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);

const ENCRE = "#161616";
const L_BLANC = 1;
const L_ENCRE = luminance(ENCRE);
const L_GRIS_CLAIR = luminance("#f4f4f4");

/**
 * Couleur de texte lisible sur un aplat : celle des deux (blanc, encre) qui
 * offre le plus fort contraste.
 *
 * L'ancien critère, `luminance > 0.5`, plaçait la bascule bien trop haut : le
 * point où blanc et encre se valent est vers 0,19 (0,179 avec un noir pur).
 * Entre les deux, le blanc l'emportait à tort — d'où le blanc sur sarcelle
 * (C2, 3,3:1) et sur magenta (C4, 3,3:1), sous le seuil AA de 4,5:1, quand
 * l'encre y atteint 5,4:1. On compare donc directement les deux rapports
 * plutôt que de figer un seuil.
 *
 * ⚠️ La couleur peut être une VARIABLE CSS (`var(--ac)`) quand aucune n'est
 * renseignée : sa luminance n'est pas calculable ici. Le blanc l'emporte alors,
 * comme il le faisait avec l'accent du site, qui est sombre.
 */
export const onCompDe = (color: string): string => {
  if (!color.startsWith("#")) return "#ffffff";
  const l = luminance(color);
  return rapport(l, L_ENCRE) > rapport(l, L_BLANC) ? ENCRE : "#ffffff";
};

/**
 * Variante de la couleur assez foncée pour porter du TEXTE BLANC et pour
 * s'écrire en texte sur fond blanc ou gris clair (4,5:1, seuil AA du texte
 * courant).
 *
 * C'est elle qui devient `--ac` sur une page composante : `--ac` sert à la fois
 * de fond aux boutons primaires (texte blanc) et de couleur de texte (liens,
 * libellés, `text-ac`). La sarcelle (#009d9a) et le magenta (#ee5396) n'y
 * atteignent que 3,3:1 ; on les fonce par pas de 2 % vers le noir jusqu'au
 * seuil (#007a78, #be4278 ; −22 % et −20 %), ce qui garde la teinte et ne bouge que la valeur.
 * Les couleurs déjà conformes (bleu, violet, gris) ressortent inchangées.
 * La couleur d'identité reste intacte dans `--comp`, réservée aux éléments
 * graphiques (filets, halos, pastilles), pour lesquels 3:1 suffit.
 */
const accentLisible = (hex: string): string => {
  let k = 0;
  let out = hex;
  // Mesuré contre --c-10 (#f4f4f4), le plus clair des fonds gris du site,
  // et non contre le blanc : une ligne de composante posée sur une section
  // grise (« Le Projet ») retombait sinon à 4,1:1.
  while (rapport(luminance(out), L_GRIS_CLAIR) < 4.5 && k < 0.9) {
    k += 0.02;
    out = mix(hex, -k);
  }
  return out;
};

/** Couleur de composante employée EN TEXTE sur fond clair : sa variante lisible. */
export const compTexteDe = (color: string): string =>
  color.startsWith("#") ? accentLisible(color) : color;

/**
 * Variables d'une ligne / carte hors page composante : `--comp` (la couleur
 * d'identité, pour les filets et aplats) et `--comp-texte` (sa variante
 * lisible, pour la couleur employée EN TEXTE — code « C2 » d'une ligne, par
 * exemple, où la sarcelle brute ne faisait que 3,3:1 sur blanc).
 */
export const compVarDe = (color: string): CSSProperties =>
  (color.startsWith("#")
    ? ({ "--comp": color, "--comp-texte": accentLisible(color) } as CSSProperties)
    : ({ "--comp": color } as CSSProperties));

/** Variables d'accent à poser sur le conteneur racine de la page. */
export function compTintDe(color: string): CSSProperties {
  // Les mélanges n'ont de sens que sur un hexadécimal : sur une variable CSS,
  // on laisse le site garder son propre jeu d'accents.
  if (!color.startsWith("#")) return { "--comp": color } as CSSProperties;
  const ac = accentLisible(color);
  return {
    // `--ac` / `--acd` portent du texte (et du texte blanc) : variante lisible.
    // Les teintes claires (`--ac-light`, `--ac-pale`, `--ac-line`) partent de la
    // couleur d'origine, qu'elles éclaircissent : elles servent sur fond sombre
    // ou en aplat de fond, où la couleur d'identité doit rester reconnaissable.
    "--ac": ac,
    "--acd": mix(ac, -0.24),
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
