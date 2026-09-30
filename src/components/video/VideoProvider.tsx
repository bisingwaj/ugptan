"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { media, ytEmbed } from "@/content/media";
import { pick, type Lang } from "@/lib/pick";

/** Métadonnées affichées dans l'entête de la lightbox (sinon : film du projet). */
export type VideoMeta = { titre?: string; source?: string; note?: string };
type OpenVideo = (src?: string, meta?: VideoMeta) => void;
const VideoCtx = createContext<OpenVideo>(() => {});

export const useVideo = () => useContext(VideoCtx);

/** A source is a local/remote video file if it points at a media file, else it's a YouTube id. */
const isFileSrc = (s: string) => s.startsWith("/") || s.startsWith("blob:") || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(s);

export function VideoProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const [src, setSrc] = useState<string | null>(null);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const fermerRef = useRef<HTMLButtonElement>(null);
  /** Élément à re-focaliser à la fermeture (celui qui a ouvert la lightbox). */
  const restaurer = useRef<HTMLElement | null>(null);

  const open = useCallback<OpenVideo>((value, m) => {
    restaurer.current = (document.activeElement as HTMLElement) ?? null;
    setSrc(value || media.videoYt);
    setMeta(m ?? null);
  }, []);
  const close = useCallback(() => {
    setSrc(null);
    setMeta(null);
  }, []);

  // Modale : Échap ferme, le focus entre à l'ouverture et y reste piégé, puis
  // revient au déclencheur à la fermeture (aligné sur les autres modales).
  useEffect(() => {
    if (!src) return;
    fermerRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      const cibles = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, a[href], iframe, video, [tabindex]:not([tabindex="-1"])',
      );
      if (!cibles || cibles.length === 0) return;
      const premier = cibles[0];
      const dernier = cibles[cibles.length - 1];
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      restaurer.current?.focus?.();
    };
  }, [src, close]);

  const file = src ? isFileSrc(src) : false;
  const titre = meta?.titre || pick(media.videoTitre, lang);
  const source = meta?.source || pick(media.videoSource, lang);
  const note = meta?.note || pick(media.videoNote, lang);

  return (
    <VideoCtx.Provider value={open}>
      {children}
      {src && (
        <div className="scrim scrim--center backdrop-blur-[8px] max-[760px]:backdrop-blur-none" style={{ background: "rgba(22,22,22,0.86)" }} onClick={close}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={titre} className="modal" data-lenis-prevent style={{ width: "100%", maxWidth: 1080 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "clamp(16px,2vw,22px)", color: "#fff" }}>{titre}</div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.06em", color: "#a8a8a8", marginTop: 6, textTransform: "uppercase" }}>{source}</div>
              </div>
              <button ref={fermerRef} onClick={close} aria-label={lang === "en" ? "Close" : "Fermer"} style={{ width: 46, height: 46, flex: "0 0 auto", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 17, background: "rgba(255,255,255,0.08)" }}>✕</button>
            </div>
            <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.5)", background: "#000" }}>
              {file ? (
                <video src={src!} controls autoPlay playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
              ) : (
                <iframe
                  src={ytEmbed(src!)}
                  title={titre}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                />
              )}
            </div>
            <div className="mono" style={{ fontSize: 11, color: "#8d8d8d", marginTop: 12, textAlign: "center" }}>{note}</div>
          </div>
        </div>
      )}
    </VideoCtx.Provider>
  );
}
