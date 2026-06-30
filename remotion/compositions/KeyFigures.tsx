import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const AC = "#0f62fe";
const BLACK = "#161616";

type Fig = { v: number; suffix: string; label: string; raw?: boolean };

const FIGS: Fig[] = [
  { v: 510, suffix: " M$", label: "Enveloppe (IDA + AFD)" },
  { v: 26, suffix: "", label: "Provinces couvertes" },
  { v: 30, suffix: " M", label: "Utilisateurs visés en 2029" },
  { v: 2029, suffix: "", label: "Horizon de transformation", raw: true },
];

/** Chiffres-clés animés (count-up séquentiel) — 16:9. */
export const KeyFigures = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const unit = Math.min(width, height);

  return (
    <AbsoluteFill style={{ background: BLACK, fontFamily: "'IBM Plex Sans', sans-serif", flexDirection: "column", justifyContent: "center", padding: unit * 0.1, gap: unit * 0.035 }}>
      {FIGS.map((f, i) => {
        const start = i * 40;
        const o = interpolate(frame, [start, start + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const prog = interpolate(frame, [start, start + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const val = f.raw ? f.v : Math.round(f.v * prog);
        const display = f.raw ? String(f.v) : val.toLocaleString("fr-FR");
        const x = interpolate(o, [0, 1], [-30, 0]);
        return (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: unit * 0.03, opacity: o, transform: `translateX(${x}px)`, borderLeft: `${unit * 0.006}px solid ${AC}`, paddingLeft: unit * 0.03 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: "#fff", fontSize: unit * 0.1, lineHeight: 1, letterSpacing: "-0.03em" }}>
              {display}
              {f.suffix}
            </span>
            <span style={{ color: "#a8a8a8", fontSize: unit * 0.026 }}>{f.label}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
