"use client";

/**
 * Carte des 26 provinces (10 prioritaires) — coquille : cadre, libellé de
 * coin, et point d'entrée vers la carte, en DEUX rendus selon l'appareil.
 *
 * ─── Pourquoi deux rendus ────────────────────────────────────────────────────
 * La scène Three.js (relief + postprocessing Bloom) est superbe sur un poste de
 * travail, mais sur un téléphone c'est un canvas WebGL qui rend 60 fps en
 * continu — pic thermique, jank, INP dégradé — et ses `OrbitControls`
 * PIÈGENT le défilement vertical au tactile (un balayage fait pivoter la carte
 * au lieu de faire défiler la page). Sur mobile / appareil modeste, on rend donc
 * le SVG statique des provinces (`DRCMapSvg`), au coût quasi nul : three.js n'y
 * est jamais téléchargé.
 *
 *   · `capable === true`  → scène 3D, chargée en `dynamic(ssr:false)` et différée
 *     jusqu'à l'approche du viewport (IntersectionObserver, `rootMargin` 300 px).
 *   · `capable === false` → SVG immédiat, léger, interactif au tap.
 *   · `capable === null`  → indéterminé (rendu serveur et première frame) : on
 *     n'affiche rien plutôt que de faire clignoter un rendu qu'on remplacerait.
 *
 * Le critère « capable » exige un pointeur FIN (donc pas un téléphone) et un
 * minimum de mémoire/cœurs. Un canvas WebGL n'existe de toute façon pas côté
 * serveur, d'où `ssr:false` conservé sur la scène.
 *
 * ⚠️ Le conteneur est `aria-hidden` : la carte est décorative, l'information
 * qu'elle porte (26 provinces / 10 prioritaires + légende) figure en toutes
 * lettres dans le texte adjacent (cf. page d'accueil et page contact).
 *
 * ⚠️ Pas de fond sombre ici : la relief flotte directement sur le blanc de la
 * page. Une ombre douce (halo radial ci-dessous) l'ancre sans dessiner de cadre.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { DRCMapSvg } from "./DRCMapSvg";

const ProvinceMap3D = dynamic(
  () => import("./ProvinceMap3D").then((m) => m.ProvinceMap3D),
  { ssr: false, loading: () => null },
);

/** L'appareil peut-il rendre la 3D sans nuire à l'expérience ? */
function estCapable(): boolean {
  if (typeof window === "undefined" || typeof matchMedia === "undefined") return false;
  // Pointeur fin ET survol : écarte les téléphones et tablettes tactiles, où la
  // 3D piège le scroll et coûte cher.
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memoire = nav.deviceMemory ?? 8; // absente sur Safari → on suppose correct
  const coeurs = nav.hardwareConcurrency ?? 8;
  return memoire >= 4 && coeurs >= 4;
}

export function ProvinceMap({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const pays = lang === "en" ? "DRC" : "RDC";

  const cadre = useRef<HTMLDivElement>(null);
  // null = indéterminé (SSR + première frame), avant que le client ne tranche.
  const [capable, setCapable] = useState<boolean | null>(null);
  const [proche, setProche] = useState(false);

  // État d'interaction du SVG (survol souris, tap tactile) — inoffensif si la 3D
  // est choisie, ce fil ne sert alors jamais.
  const [survol, setSurvol] = useState<string | null>(null);
  const [actif, setActif] = useState<string | null>(null);

  useEffect(() => {
    setCapable(estCapable());
  }, []);

  useEffect(() => {
    if (capable !== true || proche) return;
    const cible = cadre.current;
    if (!cible || typeof IntersectionObserver === "undefined") {
      setProche(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((e) => e.isIntersecting)) {
          setProche(true);
          obs.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    obs.observe(cible);
    return () => obs.disconnect();
  }, [capable, proche]);

  return (
    <div
      ref={cadre}
      data-testid="province-map"
      aria-hidden
      style={{ position: "relative", aspectRatio: "1.32 / 1" }}
    >
      {/* Ombre au sol : dégradé radial très doux, qui pose la pièce sur la page. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "6%",
          transform: "translateX(-50%)",
          width: "72%",
          height: "18%",
          background: "radial-gradient(ellipse at center, rgba(15,20,30,0.16) 0%, rgba(15,20,30,0) 72%)",
          filter: "blur(2px)",
          zIndex: 0,
        }}
      />

      <div
        className="mono"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--c-50)",
          zIndex: 30,
          pointerEvents: "none",
        }}
      >
        {t.words.provinces}
      </div>

      <div
        className="mono"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.06em",
          color: "var(--c-black)",
          zIndex: 30,
          pointerEvents: "none",
        }}
      >
        {pays}
      </div>

      <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 10 }}>
        {capable === false && (
          // Repli mobile / appareil modeste : SVG statique, léger, au tap.
          <DRCMapSvg
            hovered={survol}
            clicked={actif}
            onHover={setSurvol}
            onClick={setActif}
            style={{ width: "100%", height: "100%", touchAction: "pan-y" }}
          />
        )}
        {capable === true && proche && <ProvinceMap3D lang={lang} />}
      </div>
    </div>
  );
}
