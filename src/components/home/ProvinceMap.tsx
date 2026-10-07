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
 * passage dans le viewport, province soulevée + nom au survol.
 *
 * Clic → page de la province (cf. lib/provinces/chemins.ts). Au tactile, pas de
 * survol : le premier tap montre le nom, le second ouvre la page — sans quoi
 * on naviguerait sans avoir vu sur quelle province on a posé le doigt.
 * `selection` marque la province de la page (page province) : encre foncée,
 * soulevée et nommée, quel que soit son statut. Elle le reste pendant qu'on
 * survole les autres — seule l'étiquette suit alors le survol.
 *
 * ⚠️ Le conteneur est `aria-hidden` : la carte est décorative, l'information
 * qu'elle porte (26 provinces / 10 prioritaires + légende) figure en toutes
 * lettres dans le texte adjacent, et chaque page province est aussi atteinte
 * par des liens ordinaires (liste des 26 provinces de la page province). Rien
 * n'y est focalisable : la navigation passe par `router.push`, pas des <a>.
 *
 * Le conteneur a exactement le ratio du viewBox : un point (cx, cy) du SVG se
 * place donc en pourcentage dans le conteneur, ce qui positionne l'étiquette
 * HTML sans aucun calcul de mise à l'échelle.
 *
 * Poids : les tracés (mapData.ts) sont simplifiés topologiquement (≈ 25 Ko
 * au lieu de ≈ 500 Ko, cf. l'en-tête de ce fichier). Le composant reste
 * client d'un seul tenant, à dessein : rendre les <path> dans un composant
 * serveur ne supprimerait pas le doublon, il le déplacerait. Le HTML
 * porterait les tracés une fois dans le balisage et une seconde fois dans la
 * charge RSC (flight) inline, renvoyée à chaque navigation client vers une
 * autre fiche province. Ici, le second exemplaire vit dans un chunk JS mis en
 * cache une fois pour les 55 pages qui affichent la carte.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { provincesPrio } from "@/content/data";
import { provinceRoute } from "@/lib/provinces/chemins";
import { annoncerNavigation } from "@/components/motion/NavigationProgress";
import { provincePaths, MAP_VIEWBOX } from "./mapData";

const [, , VB_W, VB_H] = MAP_VIEWBOX.split(" ").map(Number);
const PRIO = new Set(provincesPrio.map((p) => p.nom));
const STAGGER_MS = 28;

export function ProvinceMap({ lang, selection }: { lang: Lang; selection?: string }) {
  const t = dict(lang);
  const router = useRouter();
  const tactile = useRef(false);
  const cadre = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [survol, setSurvol] = useState<string | null>(null);
  const [actif, setActif] = useState<string | null>(null);
  const courant = actif ?? survol ?? selection ?? null;

  const choisir = (nom: string) => {
    if (tactile.current && actif !== nom) {
      setActif(nom);
      return;
    }
    if (nom === selection) return;
    annoncerNavigation();
    router.push(provinceRoute(lang, nom));
  };

  // Pas de <Link> ici, donc pas de préchargement automatique : on le fait au
  // survol, le clic qui suit trouve la page déjà prête.
  const survoler = (nom: string) => {
    setSurvol(nom);
    if (nom !== selection) router.prefetch(provinceRoute(lang, nom));
  };

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
  const choisie = selection ? provinces.find((p) => p.nom === selection) : undefined;
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
              className={`carte-rdc__prov${p.prio ? " is-prio" : ""}${p.nom === courant ? " is-on" : ""}${p.nom === selection ? " is-choisie" : ""}`}
              style={{ animationDelay: `${i * STAGGER_MS}ms` }}
              onPointerDown={(e) => { tactile.current = e.pointerType !== "mouse"; }}
              onMouseEnter={() => survoler(p.nom)}
              onClick={() => choisir(p.nom)}
            />
          ))}
        </g>

        {/* Province de la page, redessinée par-dessus les autres en permanence. */}
        {choisie && (
          <path
            d={choisie.path}
            className="carte-rdc__choisie"
            stroke="#fff"
            strokeWidth={2.4}
            strokeLinejoin="round"
            pointerEvents="none"
          />
        )}

        {/* Province survolée redessinée par-dessus : soulevée, ombre douce. */}
        {enAvant && enAvant !== choisie && (
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
          // Près des bords, l'étiquette s'ancre vers l'intérieur : centrée sur
          // Nord-Kivu ou Kongo Central, elle débordait de l'écran au téléphone.
          className={`mono carte-rdc__tip${enAvant === choisie ? " is-choisie" : ""}${enAvant.cx / VB_W > 0.72 ? " is-droite" : enAvant.cx / VB_W < 0.28 ? " is-gauche" : ""}`}
          data-testid="map-tooltip"
          style={{ left: `${(enAvant.cx / VB_W) * 100}%`, top: `${(enAvant.cy / VB_H) * 100}%` }}
        >
          {enAvant.nom}
          {enAvant.prio && <span className="carte-rdc__tip-prio">{t.province.prio}</span>}
        </div>
      )}
    </div>
  );
}
