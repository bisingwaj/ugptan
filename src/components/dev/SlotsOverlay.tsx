"use client";

import { useEffect, useState } from "react";

type Box = { label: string; ratio: string; top: number; left: number; width: number; height: number };

/**
 * Révèle les emplacements vidéo prévus directement sur la page.
 * Activation : ajouter ?slots=1 à l'URL (ex. /fr?slots=1).
 * Repère les éléments [data-video-slot] + tous les héros (.page-hero, [data-hero]).
 */
export function SlotsOverlay() {
  const [on, setOn] = useState(false);
  const [boxes, setBoxes] = useState<Box[]>([]);

  useEffect(() => {
    // Outil de repérage réservé au développement : jamais activable en production
    // (même avec ?slots=1) pour ne pas exposer d'overlays internes sur le site public.
    if (process.env.NODE_ENV !== "development") return;
    setOn(new URLSearchParams(window.location.search).get("slots") === "1");
  }, []);

  useEffect(() => {
    if (!on) return;
    let raf = 0;

    const measure = () => {
      const out: Box[] = [];
      document.querySelectorAll<HTMLElement>("[data-video-slot]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 4) return;
        out.push({ label: el.dataset.videoSlot || "Vidéo", ratio: el.dataset.slotRatio || "16:9", top: r.top, left: r.left, width: r.width, height: r.height });
      });
      document.querySelectorAll<HTMLElement>(".page-hero, [data-hero]").forEach((el) => {
        if (el.hasAttribute("data-video-slot")) return;
        const r = el.getBoundingClientRect();
        out.push({ label: "Héros — vidéo d'intro (optionnel)", ratio: "16:9", top: r.top, left: r.left, width: r.width, height: r.height });
      });
      setBoxes(out);
    };

    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    measure();
    // a couple of delayed re-measures for fonts/images settling
    const t1 = setTimeout(measure, 200);
    const t2 = setTimeout(measure, 800);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(t1); clearTimeout(t2);
    };
  }, [on]);

  if (!on) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, pointerEvents: "none" }} aria-hidden>
      {boxes.map((b, i) => (
        <div key={i} style={{ position: "fixed", top: b.top, left: b.left, width: b.width, height: b.height, border: "2px dashed #0f62fe", background: "rgba(15,98,254,0.07)", boxSizing: "border-box" }}>
          <span style={{ position: "absolute", top: 0, left: 0, maxWidth: "100%", background: "#0f62fe", color: "#fff", fontFamily: "var(--font-mono), monospace", fontSize: 11, lineHeight: 1.3, padding: "3px 7px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            📹 {b.label} · {b.ratio}
          </span>
        </div>
      ))}
      <div style={{ position: "fixed", left: 16, bottom: 16, background: "#161616", color: "#fff", fontFamily: "var(--font-mono), monospace", fontSize: 12, padding: "10px 14px", border: "1px solid #393939", pointerEvents: "auto", maxWidth: 320 }}>
        <strong style={{ color: "#78a9ff" }}>Mode emplacements vidéo</strong> · {boxes.length} repérés
        <div style={{ color: "#a8a8a8", marginTop: 6, fontSize: 11 }}>
          Retirer <code>?slots=1</code> de l&apos;URL pour quitter. Plan détaillé&nbsp;: <code>/medias</code>
        </div>
      </div>
    </div>
  );
}
