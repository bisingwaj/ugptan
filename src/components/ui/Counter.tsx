"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/format";

type Props = { to: number; dur?: number; dec?: number; prefix?: string; suffix?: string };

/** Count-up that fires once when scrolled into view. SSR renders the final value. */
export function Counter({ to, dur = 1300, dec = 0, prefix = "", suffix = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    setVal(0);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(to * eased);
            if (p < 1) raf = requestAnimationFrame(tick);
            else setVal(to);
          };
          raf = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, dur]);

  return <span ref={ref}>{formatNumber(val, { dec, prefix, suffix })}</span>;
}
