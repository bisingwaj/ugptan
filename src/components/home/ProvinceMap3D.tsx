"use client";

/**
 * Carte en relief des 26 provinces — un bloc extrudé par province, sur ses
 * vraies frontières (cf. provinceGeometry.ts), les 10 provinces prioritaires
 * ressortant plus hautes et teintées à l'accent. Balancement au repos,
 * glisser pour orienter, survol pour faire ressortir le bloc vers soi et
 * faire apparaître le nom.
 *
 * ⚠️ DEBOUT, pas à plat sur une table. La carte d'origine (avant Three.js)
 * se regardait de face, comme un poster — c'est CE cadrage qu'il fallait
 * garder en passant à la 3D, pas le remplacer par une vue plongeante à
 * l'oblique façon maquette d'architecte. Concrètement : aucune rotation
 * n'est appliquée à la géométrie extrudée. Le tracé plat occupe le plan
 * X/Y (nord en haut, ouest à gauche, exactement comme un plan), et
 * l'extrusion (la « hauteur » qui distingue les provinces prioritaires)
 * pointe vers la caméra sur l'axe Z, en relief, plutôt que vers le
 * plafond sur l'axe Y.
 *
 * Chaque province garde son propre contour, net et visible — un tracé
 * commun sans lui se lit comme un aplat plutôt qu'un découpage — et se
 * distingue en plus par un ton légèrement différent (cf. `teinteAutre`),
 * comme une mosaïque.
 *
 * Chargé UNIQUEMENT côté client (cf. ProvinceMap.tsx, qui l'importe en
 * `dynamic(..., { ssr:false })`) : WebGL n'existe pas côté serveur.
 */
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, PerspectiveCamera, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { provincesPrio } from "@/content/data";
import { provinceGeometries, type ProvinceGeometry } from "./provinceGeometry";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

const COLOR_PRIO = "#2f7dff"; // --ac, éclairci : la teinte de marque à plat lit sombre sous cet éclairage
const COLOR_PRIO_H = 217 / 360;
const COLOR_AUTRE_H = 213 / 360; // ardoise bleutée plutôt qu'un gris clinique
const COLOR_EDGE = "#1b2433"; // un seul trait, sombre : plus de fond noir à détacher ni de lueur à traverser

const DEPTH_PRIO = 1.0;
const DEPTH_AUTRE = 0.28;
const HOVER_POP = 0.32; // vers la caméra, pas « vers le haut » : la carte est debout
const STAGGER_S = 0.045;
const GROW_DURATION_S = 0.85;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Teinte d'une province « autre » : même famille (ardoise bleutée), luminosité
 * légèrement différente d'une voisine à l'autre. Une valeur déterministe — pas
 * `Math.random()`, qui romprait le SSR/CSR et changerait à chaque rendu — pour
 * que chaque province garde SA teinte, stable, comme une tesselle de mosaïque.
 */
function teinteAutre(index: number): THREE.Color {
  const frac = (index * 0.6180339887) % 1; // suite dorée : répartition régulière, sans motif visible
  const l = 0.62 + frac * 0.16; // 0.62–0.78 : lisible sur fond BLANC (plus sombre qu'avant, réglé pour le noir)
  return new THREE.Color().setHSL(COLOR_AUTRE_H, 0.14, l);
}

/**
 * Même principe pour les prioritaires : sans lui, dix provinces du même bleu
 * plat, collées les unes aux autres, ne laissaient voir aucune séparation
 * entre elles — seul le contour (fin) les distinguait. Écart plus resserré
 * que `teinteAutre` : il s'agit de les nuancer, pas de casser la lecture
 * « ce sont les dix prioritaires », toutes de la même famille de bleu.
 */
function teintePrio(index: number): THREE.Color {
  const frac = (index * 0.6180339887) % 1;
  const l = 0.46 + frac * 0.14; // 0.46–0.60 : plus dense qu'avant, pour rester riche sur blanc
  return new THREE.Color().setHSL(COLOR_PRIO_H, 0.92, l);
}

function ProvinceBlock({
  geo,
  prio,
  index,
  active,
  animate,
  onEnter,
  onLeave,
  onSelect,
}: {
  geo: ProvinceGeometry;
  prio: boolean;
  index: number;
  active: boolean;
  animate: boolean;
  onEnter: (name: string) => void;
  onLeave: (name: string) => void;
  onSelect: (name: string) => void;
}) {
  const group = useRef<THREE.Group>(null!);
  const started = useRef<number | null>(null);
  const depth = prio ? DEPTH_PRIO : DEPTH_AUTRE;
  const color = useMemo(() => (prio ? teintePrio(index) : teinteAutre(index)), [prio, index]);

  const [geometry, edges] = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(geo.shapes, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 5, // lisse le biseau : à 3, chaque facette accrochait son propre reflet net
      curveSegments: 1,
    });
    // Aucune rotation : le tracé reste dans le plan X/Y (la carte, debout,
    // fait face à la caméra), l'extrusion pointe vers elle sur Z.
    return [g, new THREE.EdgesGeometry(g, 25)];
  }, [geo, depth]);

  // Un seul groupe animé pour le bloc ET son contour : les déplacer
  // séparément les aurait vus se désolidariser pendant l'entrée ou le survol.
  useFrame((state, delta) => {
    if (!group.current) return;

    if (animate) {
      if (started.current === null) started.current = state.clock.elapsedTime + index * STAGGER_S;
      const t = (state.clock.elapsedTime - started.current) / GROW_DURATION_S;
      if (t < 0) {
        group.current.visible = false;
        return;
      }
      group.current.visible = true;
      if (t < 1) {
        // Sort du mur vers la caméra plutôt que de « pousser vers le haut » :
        // cohérent avec une carte debout, pas couchée.
        group.current.position.z = THREE.MathUtils.lerp(-depth - 0.4, 0, easeOutCubic(t));
        return;
      }
    } else {
      group.current.visible = true;
    }

    const target = active ? HOVER_POP : 0;
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, target, 6, delta);
  });

  const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

  return (
    <group ref={group} position={[0, 0, -depth - 0.4]}>
      <mesh
        geometry={geometry}
        onPointerOver={(e) => { stop(e); onEnter(geo.name); }}
        onPointerOut={(e) => { stop(e); onLeave(geo.name); }}
        onClick={(e) => { stop(e); onSelect(geo.name); }}
      >
        <meshStandardMaterial
          color={color}
          emissive={prio ? COLOR_PRIO : "#000000"}
          emissiveIntensity={prio ? (active ? 0.85 : 0.4) : 0}
          roughness={prio ? 0.55 : 0.75}
          metalness={prio ? 0.05 : 0.02}
        />
      </mesh>
      {/* Contour net sur CHAQUE province, prioritaire ou non — c'est le
          découpage administratif que la carte existe pour montrer. */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={COLOR_EDGE} transparent opacity={prio ? 0.5 : 0.35} />
      </lineSegments>
    </group>
  );
}

function Scene({ lang, reduceMotion }: { lang: Lang; reduceMotion: boolean }) {
  const t = dict(lang);
  const geometries = useMemo(() => provinceGeometries(), []);
  const prioSet = useMemo(() => new Set(provincesPrio.map((p) => p.nom)), []);

  const [hover, setHover] = useState<string | null>(null);
  const [clicked, setClicked] = useState<string | null>(null);
  const activeName = clicked || hover;
  const groupRef = useRef<THREE.Group>(null!);

  // Balancement, pas un tour complet : une rotation pleine finit forcément,
  // la moitié du temps, par montrer la tranche du panneau plutôt que sa face.
  // Un léger va-et-vient — comme un panneau qu'on regarde en s'approchant —
  // reste toujours proche de l'angle où la carte se lit d'un coup d'œil.
  useFrame((state) => {
    if (!reduceMotion && !activeName && groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.16;
    }
  });

  const active = geometries.find((g) => g.name === activeName);
  const activeIsPrio = activeName ? prioSet.has(activeName) : false;
  const activeDepth = activeIsPrio ? DEPTH_PRIO : DEPTH_AUTRE;

  return (
    <>
      {/* Éclairage neutre, en trois quarts avant, comme une vitrine : ça
          sculpte les tranches de chaque bloc (donc leur relief) sans jamais
          assombrir la face qui regarde la caméra. Plus de liseré teinté pour
          « détacher » la carte d'un fond sombre — la page, blanche, s'en
          charge déjà toute seule. */}
      <ambientLight intensity={0.62} />
      <directionalLight position={[5, 5, 9]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[-6, -1, 5]} intensity={0.3} color="#ffffff" />

      <group ref={groupRef}>
        {geometries.map((geo, index) => (
          <ProvinceBlock
            key={geo.name}
            geo={geo}
            prio={prioSet.has(geo.name)}
            index={index}
            active={geo.name === activeName}
            animate={!reduceMotion}
            onEnter={setHover}
            onLeave={(name) => setHover((current) => (current === name ? null : current))}
            onSelect={(name) => setClicked((current) => (current === name ? null : name))}
          />
        ))}

        {active && (
          // X/Y directement — aucune rotation à compenser ici, la carte est
          // dans le plan de la caméra. Z place l'étiquette devant le relief.
          //
          // ⚠️ `wrapperClass`, pas la prop `pointerEvents` : cette dernière ne
          // s'applique qu'en mode `transform` de <Html> (cf. son code source),
          // qu'on n'utilise pas ici. `wrapperClass` cible en revanche le vrai
          // conteneur externe que drei pose dans le DOM — celui qui, laissé à
          // son défaut, vole le survol au canvas dès que l'étiquette flotte
          // sous le curseur (cf. .map-etiquette-hors-clic, globals.css) : la
          // province retombe, l'étiquette disparaît, la souris retrouve le
          // canvas, la province se relève, l'étiquette revient — clignotement
          // en boucle tant qu'on ne bouge pas la souris.
          <Html
            position={[active.cx, active.cy + 0.32, activeDepth + HOVER_POP + 0.05]}
            center
            wrapperClass="map-etiquette-hors-clic"
          >
            <div
              className="mono"
              data-testid="map-tooltip"
              style={{
                background: "var(--c-black)",
                color: "#fff",
                fontSize: 12,
                padding: "8px 14px",
                whiteSpace: "nowrap",
                letterSpacing: "0.04em",
                boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
              }}
            >
              {active.name}
              {activeIsPrio && (
                <div style={{ marginTop: 3, fontSize: 10, letterSpacing: "0.08em", color: "var(--ac-light)" }}>
                  {t.words.prio.toUpperCase()}
                </div>
              )}
            </div>
          </Html>
        )}
      </group>

      {/* Vue de face, comme la carte plate d'origine : la carte est un
          panneau DEBOUT qu'on regarde, pas une maquette posée sur une table
          qu'on regarde d'en haut. La plage reste étroite et centrée sur
          l'horizontale — de quoi l'incliner légèrement à la souris, jamais de
          quoi en voir la tranche ou le dos. */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 2 - 0.32}
        maxPolarAngle={Math.PI / 2 + 0.26}
        minAzimuthAngle={-0.6}
        maxAzimuthAngle={0.6}
        rotateSpeed={0.4}
      />

      {/* Lueur douce sur les provinces prioritaires (matière émissive) — plus
          mesurée que sur fond noir : une lueur qui se voyait dans le noir
          délave sur blanc si on n'y touche pas. Seuil relevé pour ne prendre
          que le bleu, réellement plus lumineux que le reste de la scène. */}
      <EffectComposer enableNormalPass={false}>
        <Bloom mipmapBlur intensity={0.35} luminanceThreshold={0.55} luminanceSmoothing={0.25} radius={0.5} />
      </EffectComposer>
    </>
  );
}

export function ProvinceMap3D({ lang }: { lang: Lang }) {
  const reduceMotion = Boolean(usePrefersReducedMotion());
  const [dragging, setDragging] = useState(false);

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%", cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={() => setDragging(true)}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
    >
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        {/* De face, reculée pour cadrer le pays entier avec marge — le
            cadrage qu'avait la carte plate, avant Three.js. */}
        <PerspectiveCamera makeDefault position={[0, 0.3, 13]} fov={30} />
        <Scene lang={lang} reduceMotion={reduceMotion} />
      </Canvas>
    </div>
  );
}
