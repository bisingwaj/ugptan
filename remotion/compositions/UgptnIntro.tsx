import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const AC = "#0f62fe";
const BLACK = "#161616";

/** Intro de marque UGPTN — fonctionne en 16:9 et en 9:16. */
export const UgptnIntro = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  const unit = Math.min(width, height);

  const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const titleY = interpolate(frame, [12, 36], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleO = interpolate(frame, [12, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subO = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineX = interpolate(frame % 90, [0, 90], [-0.2, 1.2]);

  const logo = unit * 0.14;

  return (
    <AbsoluteFill style={{ background: BLACK, fontFamily: "'IBM Plex Sans', system-ui, sans-serif", alignItems: "center", justifyContent: "center", padding: unit * 0.08 }}>
      <AbsoluteFill style={{ opacity: 0.25 }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${lineX * 100}%`, width: 2, background: AC }} />
      </AbsoluteFill>

      <div style={{ display: "flex", flexDirection: "column", alignItems: vertical ? "center" : "flex-start", maxWidth: width * 0.82, textAlign: vertical ? "center" : "left" }}>
        <div style={{ width: logo, height: logo, background: AC, position: "relative", transform: `scale(${logoScale})`, marginBottom: unit * 0.05 }}>
          <div style={{ position: "absolute", right: logo * 0.16, bottom: logo * 0.16, width: logo * 0.36, height: logo * 0.36, background: "#fff" }} />
        </div>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: unit * (vertical ? 0.062 : 0.072), lineHeight: 1.05, letterSpacing: "-0.03em", transform: `translateY(${titleY}px)`, opacity: titleO }}>
          Transformer la RDC,
          <br />
          une connexion à la fois.
        </div>
        <div style={{ color: "#78a9ff", fontFamily: "'IBM Plex Mono', monospace", fontSize: unit * 0.022, letterSpacing: "0.1em", marginTop: unit * 0.04, opacity: subO, textTransform: "uppercase" }}>
          UGPTN · PTN-RDC · P180495/CCD1198
        </div>
      </div>
    </AbsoluteFill>
  );
};
