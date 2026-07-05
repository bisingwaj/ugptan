"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { media, ytEmbed } from "@/content/media";
import { pick, type Lang } from "@/lib/pick";

type OpenVideo = (src?: string) => void;
const VideoCtx = createContext<OpenVideo>(() => {});

export const useVideo = () => useContext(VideoCtx);

/** A source is a local/remote video file if it points at a media file, else it's a YouTube id. */
const isFileSrc = (s: string) => s.startsWith("/") || s.startsWith("blob:") || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(s);

export function VideoProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const [src, setSrc] = useState<string | null>(null);
  const open = useCallback<OpenVideo>((value) => setSrc(value || media.videoYt), []);
  const close = useCallback(() => setSrc(null), []);

  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src, close]);

  const file = src ? isFileSrc(src) : false;

  return (
    <VideoCtx.Provider value={open}>
      {children}
      {src && (
        <div className="scrim scrim--center blur-sm" style={{ backdropFilter: "blur(8px)", background: "rgba(22,22,22,0.86)" }} onClick={close}>
          <div className="modal" style={{ width: "100%", maxWidth: 1080 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "clamp(16px,2vw,22px)", color: "#fff" }}>{pick(media.videoTitre, lang)}</div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.06em", color: "#a8a8a8", marginTop: 6, textTransform: "uppercase" }}>{pick(media.videoSource, lang)}</div>
              </div>
              <button onClick={close} aria-label="Fermer" style={{ width: 46, height: 46, flex: "0 0 auto", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 17, background: "rgba(255,255,255,0.08)" }}>✕</button>
            </div>
            <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.5)", background: "#000" }}>
              {file ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={src!} controls autoPlay playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
              ) : (
                <iframe
                  src={ytEmbed(src!)}
                  title={pick(media.videoTitre, lang)}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                />
              )}
            </div>
            <div className="mono" style={{ fontSize: 11, color: "#8d8d8d", marginTop: 12, textAlign: "center" }}>{pick(media.videoNote, lang)}</div>
          </div>
        </div>
      )}
    </VideoCtx.Provider>
  );
}
