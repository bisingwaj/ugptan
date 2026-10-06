"use client";

/**
 * Carte des 26 provinces (10 prioritaires) — un SVG à plat, le même sur tous
 * les appareils.
 *
 * Remplace l'ancienne scène Three.js (relief, bloom, balancement) et son repli
 * SVG mobile : la 3D chargeait three.js, piégeait le défilement au tactile et
 * se lisait mal ; deux rendus différents donnaient deux cartes différentes.
 * Ici : aplats francs (accent pour les prioritaires, gris très clair pour les
 * autres), frontières blanches, entrée en fondu d'ouest en est au premier
 * passage dans le viewport, province soulevée + nom au survol ou au tap.
 *
 * ⚠️ Le conteneur est `aria-hidden` : la carte est décorative, l'information
 * qu'elle porte (26 provinces / 10 prioritaires + légende) figure en toutes
 * lettres dans le texte adjacent (cf. page d'accueil et page contact).
 *
 * Le conteneur a exactement le ratio du viewBox : un point (cx, cy) du SVG se
 * place donc en pourcentage dans le conteneur, ce qui positionne l'étiquette
 * HTML sans aucun calcul de mise à l'échelle.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { provincesPrio } from "@/content/data";
import { provincePaths, MAP_VIEWBOX } from "./mapData";

const [, , VB_W, VB_H] = MAP_VIEWBOX.split(" ").map(Number);
const PRIO = new Set(provincesPrio.map((p) => p.nom));
const STAGGER_MS = 28;

export function ProvinceMap({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const cadre = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [survol, setSurvol] = useState<string | null>(null);
  const [actif, setActif] = useState<string | null>(null);
  const courant = actif ?? survol;

  // Ordre d'apparition : d'ouest en est, comme un balayage.
  const provinces = useMemo(
    () =>
      Object.entries(provincePaths)
        .map(([nom, p]) => ({ nom, ...p, prio: PRIO.has(nom) }))
        .sort((a, b) => a.cx - b.cx),
    [],
  );

  useEffect(() => {
    const cible = cadre.current;
    if (!cible || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(cible);
    return () => obs.disconnect();
  }, []);

  const enAvant = courant ? provinces.find((p) => p.nom === courant) : undefined;
  const kin = provincePaths.Kinshasa;

  return (
    <div
      ref={cadre}
      data-testid="province-map"
      aria-hidden
      className={`carte-rdc${visible ? " is-visible" : ""}`}
      style={{ position: "relative", width: "100%", maxWidth: 620, margin: "0 auto", aspectRatio: `${VB_W} / ${VB_H}` }}
    >
      <svg
        viewBox={MAP_VIEWBOX}
        style={{ display: "block", width: "100%", height: "100%", overflow: "visible", touchAction: "pan-y" }}
        onMouseLeave={() => setSurvol(null)}
      >
        <g stroke="#fff" strokeWidth={1.6} strokeLinejoin="round">
          {provinces.map((p, i) => (
            <path
              key={p.nom}
              d={p.path}
              className={`carte-rdc__prov${p.prio ? " is-prio" : ""}${p.nom === courant ? " is-on" : ""}`}
              style={{ animationDelay: `${i * STAGGER_MS}ms` }}
              onMouseEnter={() => setSurvol(p.nom)}
              onClick={() => setActif((c) => (c === p.nom ? null : p.nom))}
            />
          ))}
        </g>

        {/* Province active redessinée par-dessus : soulevée, ombre douce. */}
        {enAvant && (
          <path
            d={enAvant.path}
            className={`carte-rdc__lift${enAvant.prio ? " is-prio" : ""}`}
            stroke="#fff"
            strokeWidth={2.4}
            strokeLinejoin="round"
            pointerEvents="none"
          />
        )}

        {/* Repère de la capitale. */}
        <g className="carte-rdc__kin" pointerEvents="none">
          <circle cx={kin.cx} cy={kin.cy} r={14} fill="var(--ac)" opacity={0.18} />
          <circle cx={kin.cx} cy={kin.cy} r={6} fill="#fff" stroke="var(--acd)" strokeWidth={3} />
        </g>
      </svg>

      {enAvant && (
        <div
          className="mono carte-rdc__tip"
          data-testid="map-tooltip"
          style={{ left: `${(enAvant.cx / VB_W) * 100}%`, top: `${(enAvant.cy / VB_H) * 100}%` }}
        >
          {enAvant.nom}
          {enAvant.prio && <span className="carte-rdc__tip-prio">{t.words.prio}</span>}
        </div>
      )}
    </div>
  );
}
