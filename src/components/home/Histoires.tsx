"use client";

import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { histoires } from "@/content/carbon";
import { media } from "@/content/media";
import { Photo } from "@/components/ui/Photo";
import { useVideo } from "@/components/video/VideoProvider";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

/** Beneficiary testimonials grid (home + résultats). */
export function Histoires({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const openVideo = useVideo();

  return (
    <RevealGroup className="grid-auto" gap={0.045}>
      {histoires.map((h) => (
        <RevealItem key={h.name} style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
          <button onClick={() => openVideo(h.videoYt)} className="duo" data-video-slot={`Témoignage — ${h.name}`} data-slot-ratio="16:9" style={{ aspectRatio: "4/3", display: "block", width: "100%", padding: 0, ["--duo" as string]: h.color }}>
            <Photo src={media.img[h.img]} alt={h.name} />
            <span style={{ position: "absolute", left: 14, bottom: 14, display: "inline-flex", alignItems: "center", gap: 9, color: "#fff", fontSize: 12.5, fontWeight: 600 }}>
              <span style={{ width: 34, height: 34, background: "rgba(255,255,255,.92)", color: "var(--c-black)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, paddingLeft: 2 }}>▶</span>
              {t.home.watchStory}
            </span>
          </button>
          <div style={{ padding: "22px clamp(18px,2vw,24px) 24px", display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ fontSize: 16.5, fontWeight: 600 }}>{h.name}</div>
            <div className="mono" style={{ fontSize: 11.5, color: h.color, marginTop: 5 }}>{pick(h.role, lang)}</div>
            <p style={{ margin: "16px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "var(--c-80)", flex: 1 }}>{pick(h.story, lang)}</p>
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
