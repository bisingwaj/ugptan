"use client";

import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { projVideos } from "@/content/carbon";
import { media } from "@/content/media";
import { Photo } from "@/components/ui/Photo";
import { useVideo } from "@/components/video/VideoProvider";

export function ProjVideos({ lang }: { lang: Lang }) {
  const openVideo = useVideo();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 1, background: "var(--c-80)", border: "1px solid var(--c-80)" }}>
      {projVideos.map((v) => (
        <button key={v.comp} onClick={() => openVideo()} data-video-slot={`Vidéo composante ${v.comp}`} data-slot-ratio="16:9" style={{ background: "var(--c-black)", display: "flex", flexDirection: "column", textAlign: "left", padding: 0 }}>
          <div className="duo" style={{ aspectRatio: "16/9", ["--duo" as string]: v.color }}>
            <Photo src={media.img[v.img]} alt={pick(v.titre, lang)} />
            <span className="mono" style={{ position: "absolute", top: 12, left: 12, fontSize: 11, fontWeight: 600, color: "#fff", background: v.color, padding: "4px 9px" }}>{v.comp}</span>
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ width: 54, height: 54, background: "rgba(255,255,255,.92)", color: "var(--c-black)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16, paddingLeft: 3 }}>▶</span>
            </span>
            <span className="mono" style={{ position: "absolute", right: 12, bottom: 12, fontSize: 11, color: "#fff", background: "rgba(22,22,22,.6)", padding: "3px 8px" }}>{v.dur}</span>
          </div>
          <div style={{ padding: "20px 22px 24px" }}><h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 600, lineHeight: 1.32, color: "#fff" }}>{pick(v.titre, lang)}</h3></div>
        </button>
      ))}
    </div>
  );
}
