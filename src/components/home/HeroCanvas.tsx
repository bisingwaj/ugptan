"use client";

import { useEffect, useRef } from "react";

/** The animated dot-grid + scanning light used behind the home hero. */
export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0, t = 0;
    const gap = 38;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.012;
      for (let x = gap; x < w; x += gap) {
        for (let y = gap; y < h; y += gap) {
          const d = Math.sin(x * 0.01 + y * 0.012 + t) * 0.5 + 0.5;
          const s = 1 + d * 1.6;
          ctx.fillStyle = `rgba(141,141,141,${0.12 + d * 0.14})`;
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }
      const wave = Math.sin(t * 0.6) * 0.5 + 0.5;
      const lx = w * wave;
      const grd = ctx.createLinearGradient(lx - 60, 0, lx + 60, 0);
      grd.addColorStop(0, "rgba(15,98,254,0)");
      grd.addColorStop(0.5, "rgba(15,98,254,0.10)");
      grd.addColorStop(1, "rgba(15,98,254,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(lx - 60, 0, 120, h);
      ctx.strokeStyle = "#0f62fe";
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, h);
      ctx.stroke();
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }} />;
}
