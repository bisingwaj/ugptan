/* ============================================================================
   FlowLines — état de survol « nappes de couleur » d'une cellule.
   Réf. visuelle : flux/rubans colorés sur bleu nuit (style macOS).

   Au survol, la cellule bascule sur une SURFACE bleu nuit, puis les RUBANS
   colorés en éventail SE TRACENT progressivement (gauche → droite, décalés)
   pour REMPLIR la zone ; un VOILE garde le texte lisible (qui passe en clair
   côté cellules claires, cf. .cell--invert dans globals.css).
   Pile (du fond vers le texte) : surface → rubans (glow + lignes) → voile.

   Le tracé progressif = stroke-dashoffset animé (pathLength normalisé à 1) avec
   un délai par ruban (--d). Pur SVG + CSS, aucun JS. Dégradés partagés via
   <FlowLinesDefs/> (1×/page).
   ========================================================================== */
import type { CSSProperties } from "react";

const RIBBONS: { d: string; g: string; w: number }[] = [
  { d: "M-40 150 C 90 130 150 100 250 64  S 430 22 520 6",   g: "url(#flowBlue)",  w: 28 },
  { d: "M-40 162 C 100 150 170 128 270 96  S 440 62 520 50",  g: "url(#flowCoral)", w: 26 },
  { d: "M-40 174 C 110 168 180 150 280 124 S 450 100 520 92", g: "url(#flowTeal)",  w: 25 },
  { d: "M-40 186 C 110 186 190 178 285 162 S 452 146 520 140", g: "url(#flowLav)",  w: 24 },
  { d: "M-40 196 C 115 202 195 206 290 200 S 452 190 520 186", g: "url(#flowGold)", w: 23 },
  { d: "M-40 206 C 120 214 200 224 295 224 S 456 220 520 218", g: "url(#flowBlue)", w: 21 },
  { d: "M-40 216 C 125 226 205 242 300 248 S 460 250 520 252", g: "url(#flowTeal)", w: 20 },
];

/** Pile d'effet posée DERRIÈRE le texte. `variant` décale/miroite les rubans pour varier d'une cellule à l'autre. */
export function FlowLines({ variant = 0 }: { variant?: number }) {
  const ty = [-12, -4, 4, 12][variant % 4];
  const mirror = variant % 2 === 1;
  const transform = `${mirror ? "scale(-1 1) translate(-480 0) " : ""}translate(0 ${ty})`;
  const delay = (i: number) => ({ ["--d"]: 120 + i * 100 } as CSSProperties);
  return (
    <span className="cell-fx" aria-hidden>
      <span className="cell-fx__surface" />
      <svg className="cell-fx__lines" viewBox="0 0 480 240" preserveAspectRatio="none">
        <g transform={transform}>
          <g className="cell-fx__drift">
            <g className="cell-fx__glow">
              {RIBBONS.map((r, i) => (
                <path key={i} d={r.d} pathLength={1} stroke={r.g} strokeWidth={r.w + 10} strokeLinecap="round" fill="none" style={delay(i)} />
              ))}
            </g>
            <g className="cell-fx__ribbons">
              {RIBBONS.map((r, i) => (
                <path key={i} d={r.d} pathLength={1} stroke={r.g} strokeWidth={r.w} strokeLinecap="round" fill="none" style={delay(i)} />
              ))}
            </g>
          </g>
        </g>
      </svg>
      <span className="cell-fx__scrim" />
    </span>
  );
}

/** Dégradés partagés des rubans — à inclure UNE fois par page utilisant <FlowLines/>. */
export function FlowLinesDefs() {
  const stops = (a: string, b: string, c: string) => (
    <>
      <stop offset="0" stopColor={a} stopOpacity="0" />
      <stop offset="0.26" stopColor={b} stopOpacity="0.9" />
      <stop offset="0.6" stopColor={c} stopOpacity="1" />
      <stop offset="1" stopColor={a} stopOpacity="0" />
    </>
  );
  return (
    <svg width="0" height="0" aria-hidden focusable="false" style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        <linearGradient id="flowBlue" x1="0" y1="0" x2="1" y2="0">{stops("#cfe7fa", "#7cc4f0", "#3f9fe6")}</linearGradient>
        <linearGradient id="flowCoral" x1="0" y1="0" x2="1" y2="0">{stops("#f8d2c4", "#f0a890", "#e07a5f")}</linearGradient>
        <linearGradient id="flowTeal" x1="0" y1="0" x2="1" y2="0">{stops("#bfeee2", "#7fd4c4", "#2fa68f")}</linearGradient>
        <linearGradient id="flowLav" x1="0" y1="0" x2="1" y2="0">{stops("#e7d8fa", "#cdb2f2", "#ad84e8")}</linearGradient>
        <linearGradient id="flowGold" x1="0" y1="0" x2="1" y2="0">{stops("#f4ecb0", "#e0cf72", "#b89a2e")}</linearGradient>
      </defs>
    </svg>
  );
}
