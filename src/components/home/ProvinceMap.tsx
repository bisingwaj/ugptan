"use client";

import { useState } from "react";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { provincesPrio, provincesAutres } from "@/content/data";
import { provincePaths, MAP_VIEWBOX } from "./mapData";

/** Interactive stylised map of the 26 provinces (10 priority highlighted). */
export function ProvinceMap({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const [hover, setHover] = useState<string | null>(null);
  const [clicked, setClicked] = useState<string | null>(null);

  const activeName = clicked || hover;

  const prioSet = new Set(provincesPrio.map((p) => p.nom));

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid var(--c-20)",
        background: "var(--c-10)",
        aspectRatio: "1.18 / 1",
        backgroundImage:
          "linear-gradient(#e8e8e8 1px,transparent 1px),linear-gradient(90deg,#e8e8e8 1px,transparent 1px)",
        backgroundSize: "34px 34px",
        overflow: "hidden",
      }}
    >
      <div
        className="mono"
        style={{
          position: "absolute",
          top: 12,
          left: 14,
          fontSize: 10.5,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--c-50)",
          zIndex: 30,
        }}
      >
        RDC · {t.words.provinces}
      </div>

      {/* Single SVG containing provinces + dots */}
      <svg
        viewBox={MAP_VIEWBOX}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {/* Province shapes */}
        {Object.entries(provincePaths).map(([name, { path }]) => {
          const isHovered = hover === name;
          const isClicked = clicked === name;
          const isPrio = prioSet.has(name);

          return (
            <path
              key={name}
              d={path}
              fill={
                isClicked
                  ? "var(--c-30)"
                  : isHovered
                    ? "var(--c-20)"
                    : "transparent"
              }
              stroke="var(--c-50)"
              strokeWidth="1"
              strokeLinejoin="round"
              style={{
                transition: "fill 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={() => setHover(name)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setClicked(name === clicked ? null : name)}
            />
          );
        })}

        {/* Dots at province centroids */}
        {Object.entries(provincePaths).map(([name, { cx, cy }]) => {
          const isPrio = prioSet.has(name);
          const isActive = hover === name || clicked === name;
          const size = isPrio ? 14 : 9;
          const half = size / 2;

          return (
            <rect
              key={`dot-${name}`}
              x={cx - half}
              y={cy - half}
              width={size}
              height={size}
              fill={isPrio ? "var(--ac)" : "#fff"}
              stroke={isPrio ? "var(--ac)" : "var(--c-50)"}
              strokeWidth={isPrio ? 0 : 1}
              style={{
                transition: "all 0.2s",
                cursor: "pointer",
                filter: isActive ? "drop-shadow(0 0 4px rgba(0,0,0,0.3))" : "none",
                transform: isActive ? `scale(1.3)` : "scale(1)",
                transformOrigin: `${cx}px ${cy}px`,
              }}
              onMouseEnter={() => setHover(name)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setClicked(name === clicked ? null : name)}
            />
          );
        })}
      </svg>

      {activeName && (
        <div
          className="mono"
          style={{
            position: "absolute",
            left: "50%",
            bottom: 14,
            transform: "translateX(-50%)",
            background: "var(--c-black)",
            color: "#fff",
            fontSize: 12,
            padding: "8px 14px",
            whiteSpace: "nowrap",
            letterSpacing: "0.04em",
            zIndex: 40,
          }}
        >
          {activeName}
        </div>
      )}
    </div>
  );
}
