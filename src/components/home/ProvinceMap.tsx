"use client";

/**
 * Carte des 26 provinces (10 prioritaires) — coquille : cadre, libellé de
 * coin, et point d'entrée vers la scène Three.js (ProvinceMap3D), chargée
 * UNIQUEMENT côté client. `next/dynamic({ ssr:false })` plutôt qu'un simple
 * "use client" : WebGL n'existe pas côté serveur, et ça évite d'alourdir le
 * JS de la page d'accueil du poids de three.js avant que la carte ne soit
 * réellement affichée.
 *
 * ⚠️ Pas de carte ni de fond sombre ici : la relief flotte directement sur le
 * blanc de la page, comme un objet posé devant soi plutôt qu'encadré dans une
 * vitrine. Une ombre douce (`::after`, cf. le halo radial ci-dessous) le pose
 * sur la page au lieu de le laisser léviter sans repère.
 */
import dynamic from "next/dynamic";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";

const ProvinceMap3D = dynamic(
  () => import("./ProvinceMap3D").then((m) => m.ProvinceMap3D),
  { ssr: false, loading: () => null },
);

export function ProvinceMap({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const pays = lang === "en" ? "DRC" : "RDC";

  return (
    <div
      data-testid="province-map"
      style={{
        position: "relative",
        aspectRatio: "1.32 / 1",
      }}
    >
      {/* Ombre au sol : un dégradé radial très doux, flouté, qui ancre la
          pièce sur la page sans dessiner de cadre autour d'elle. */}
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

      {/* Nom du pays en évidence : la silhouette en relief se reconnaît vite
          une fois qu'on sait ce qu'on regarde, mais rien ne l'affirmait
          jusqu'ici à l'intérieur même de la carte. */}
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
        <ProvinceMap3D lang={lang} />
      </div>
    </div>
  );
}
