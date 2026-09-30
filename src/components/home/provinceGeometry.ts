/**
 * Convertit les tracés SVG des 26 provinces (mapData.ts) en géométrie
 * Three.js, pour la carte en relief de l'accueil (cf. ProvinceMap3D.tsx).
 *
 * Analyseur maison plutôt que `SVGLoader` de three.js : ce dernier passe par
 * `DOMParser`, absent côté serveur, ce qui casserait le rendu SSR de la page
 * d'accueil. Les tracés ne portent de toute façon que M/L/Z (vérifié sur les
 * 26 provinces) — aucune courbe à interpréter, un analyseur de quelques
 * lignes suffit et reste exécutable sur les deux moteurs.
 */
import * as THREE from "three";
import { provincePaths, MAP_VIEWBOX } from "./mapData";

const [, , VB_W, VB_H] = MAP_VIEWBOX.split(" ").map(Number);

/** Taille (unités Three.js) du plus grand côté de la carte une fois posée. */
export const WORLD_SIZE = 7.2;

const SCALE = WORLD_SIZE / Math.max(VB_W, VB_H);

/**
 * Tolérance de simplification (Douglas-Peucker, cf. plus bas), en unités
 * SVG — donc avant mise à l'échelle. Les tracés sources viennent d'un relevé
 * réel et comptent des centaines de points par province, la plupart quasi
 * alignés : extrudés tels quels, ils sculptaient des parois en dents de scie
 * (visible sur le panneau, surtout aux provinces prioritaires, plus hautes)
 * plutôt que des faces nettes. La valeur reste petite au regard des ~1000
 * unités du repère source : elle élague le bruit de relevé, pas la forme.
 */
const SIMPLIFY_EPSILON = 3.2;

/**
 * Repère SVG → repère de la scène : centré sur l'origine, mis à l'échelle, et
 * Y inversé. Le SVG croît vers le sud ; une fois la forme couchée à plat par
 * `rotateX(-90°)` (cf. ProvinceMap3D), l'axe local Y devient l'axe monde -Z —
 * sans cette inversion ici, le nord et le sud se retrouvaient échangés à
 * l'écran (vérifié à l'affichage : Lualaba et Haut-Lomami, bien au sud,
 * apparaissaient en haut de la carte).
 */
function toLocal(x: number, y: number): [number, number] {
  return [(x - VB_W / 2) * SCALE, -(y - VB_H / 2) * SCALE];
}

/**
 * Douglas-Peucker sur une polyligne OUVERTE : réduit à ses points
 * structurants sous une tolérance donnée. Suppose `points[0]` et
 * `points[last]` réellement distincts — la corde qu'ils forment est la
 * référence dont on mesure l'écart de chaque point intermédiaire. Récursif
 * par nature, réécrit en pile explicite pour ne pas empiler des centaines
 * d'appels sur les contours les plus longs.
 */
function simplifyOuverte(points: [number, number][], epsilon: number): [number, number][] {
  if (points.length < 3) return points;

  const garder = new Array(points.length).fill(false);
  garder[0] = true;
  garder[points.length - 1] = true;

  const pile: [number, number][] = [[0, points.length - 1]];
  while (pile.length > 0) {
    const [debut, fin] = pile.pop()!;
    const [x1, y1] = points[debut];
    const [x2, y2] = points[fin];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const norme = Math.sqrt(dx * dx + dy * dy) || 1;

    let distMax = 0;
    let indexMax = -1;
    for (let i = debut + 1; i < fin; i++) {
      const [x, y] = points[i];
      const dist = Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / norme;
      if (dist > distMax) {
        distMax = dist;
        indexMax = i;
      }
    }

    if (distMax > epsilon && indexMax !== -1) {
      garder[indexMax] = true;
      pile.push([debut, indexMax], [indexMax, fin]);
    }
  }

  return points.filter((_, i) => garder[i]);
}

/**
 * Douglas-Peucker sur un ANNEAU FERMÉ (le cas de chaque province : `Z` referme
 * le tracé sur son point de départ).
 *
 * ⚠️ `simplifyOuverte` ne peut pas s'appliquer telle quelle : sur un anneau,
 * le premier et le dernier point sont IDENTIQUES (vérifié sur les 26
 * provinces — un contour fermé répète son point de départ avant `Z`). La
 * « corde » premier-dernier est alors de longueur nulle, la distance de
 * CHAQUE point à cette corde dégénérée tombe à zéro, et l'algorithme
 * réduisait tout le contour à ce seul point double — constaté à l'écran :
 * la carte entière avait disparu.
 *
 * Le remède classique : choisir comme second point d'ancrage celui le plus
 * ÉLOIGNÉ du premier, ce qui scinde l'anneau en deux moitiés non dégénérées,
 * simplifiées ensuite chacune comme une polyligne ouverte normale.
 */
function simplifyFermee(points: [number, number][], epsilon: number): [number, number][] {
  if (points.length < 4) return points;

  let indexLoin = 0;
  let distLoin = 0;
  const [x0, y0] = points[0];
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    const d = (x - x0) ** 2 + (y - y0) ** 2;
    if (d > distLoin) {
      distLoin = d;
      indexLoin = i;
    }
  }
  // Point dégénéré (anneau quasi ponctuel) : rien à simplifier.
  if (indexLoin === 0) return points;

  const premiereMoitie = simplifyOuverte(points.slice(0, indexLoin + 1), epsilon);
  const secondeMoitie = simplifyOuverte(points.slice(indexLoin), epsilon);
  return [...premiereMoitie.slice(0, -1), ...secondeMoitie];
}

/**
 * Un tracé `d` en une ou plusieurs sous-formes (`THREE.Shape`). Certaines
 * provinces (littoral, îles d'un lac) dessinent plusieurs sous-tracés
 * disjoints — Kongo Central en porte 14, Tanganyika 2 — d'où le tableau.
 *
 * La simplification s'applique AVANT le passage au repère de la scène : la
 * tolérance (`SIMPLIFY_EPSILON`) est ainsi indépendante de `WORLD_SIZE`.
 */
function pathToShapes(d: string): THREE.Shape[] {
  const sousTraces: [number, number][][] = [];
  let courante: [number, number][] | null = null;

  const commands = d.match(/[MLZ][^MLZ]*/g) ?? [];
  for (const command of commands) {
    const type = command[0];
    if (type === "Z") {
      courante = null;
      continue;
    }
    const [xStr, yStr] = command.slice(1).split(",");
    const point: [number, number] = [Number(xStr), Number(yStr)];
    if (type === "M" || !courante) {
      courante = [point];
      sousTraces.push(courante);
    } else {
      courante.push(point);
    }
  }

  return sousTraces.map((points) => {
    const reduits = simplifyFermee(points, SIMPLIFY_EPSILON);
    const shape = new THREE.Shape();
    reduits.forEach(([x, y], i) => {
      const [lx, ly] = toLocal(x, y);
      if (i === 0) shape.moveTo(lx, ly);
      else shape.lineTo(lx, ly);
    });
    return shape;
  });
}

export type ProvinceGeometry = {
  name: string;
  shapes: THREE.Shape[];
  /** Centroïde en repère local (avant extrusion/mise à plat). */
  cx: number;
  cy: number;
};

let cache: ProvinceGeometry[] | null = null;

/** Les 26 provinces, tracés convertis. Calculé une fois, réutilisé ensuite —
 * la donnée source est statique, aucune raison de reparser à chaque montage. */
export function provinceGeometries(): ProvinceGeometry[] {
  if (cache) return cache;
  cache = Object.entries(provincePaths).map(([name, { path, cx, cy }]) => {
    const [x, y] = toLocal(cx, cy);
    return { name, shapes: pathToShapes(path), cx: x, cy: y };
  });
  return cache;
}
