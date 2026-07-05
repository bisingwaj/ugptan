/* ============================================================================
   CellBloom — état de survol « floraison de couleur » d'une cellule, sur BLANC.
   Pensé pour les cartes qui portent une couleur de secteur (dialogues) : deux
   halos doux de la couleur éclosent depuis des coins opposés puis dérivent
   lentement, sur fond blanc, texte sombre conservé. Animation distincte du
   tracé de lignes (cf. FlowLines). Pur CSS, aucun JS.
   La couleur du secteur est passée via la variable CSS --sec. Voir globals.css.
   ========================================================================== */
import type { CSSProperties } from "react";

export function CellBloom({ color }: { color: string }) {
  return (
    <span className="cell-bloom" style={{ ["--sec"]: color } as CSSProperties} aria-hidden>
      <span className="cell-bloom__a" />
      <span className="cell-bloom__b" />
    </span>
  );
}
