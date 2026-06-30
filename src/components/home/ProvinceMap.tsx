"use client";

import { useState } from "react";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { provincesPrio, provincesAutres, meta } from "@/content/data";

/** Interactive stylised map of the 26 provinces (10 priority highlighted). */
export function ProvinceMap({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div style={{ position: "relative", border: "1px solid var(--c-20)", background: "var(--c-10)", aspectRatio: "1.18 / 1", backgroundImage: "linear-gradient(#e8e8e8 1px,transparent 1px),linear-gradient(90deg,#e8e8e8 1px,transparent 1px)", backgroundSize: "34px 34px" }}>
      <div className="mono" style={{ position: "absolute", top: 12, left: 14, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-50)" }}>
        RDC · {t.words.provinces}
      </div>
      {provincesAutres.map((p) => (
        <button
          key={p.nom}
          onMouseEnter={() => setHover(p.nom)}
          onMouseLeave={() => setHover(null)}
          aria-label={p.nom}
          style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", width: 9, height: 9, background: "#fff", border: "1px solid var(--c-50)", transition: "all .2s" }}
        />
      ))}
      {provincesPrio.map((p) => (
        <button
          key={p.nom}
          onMouseEnter={() => setHover(p.nom)}
          onMouseLeave={() => setHover(null)}
          aria-label={p.nom}
          style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", width: 14, height: 14, background: "var(--ac)", transition: "all .2s" }}
        />
      ))}
      {hover && (
        <div className="mono" style={{ position: "absolute", left: "50%", bottom: 14, transform: "translateX(-50%)", background: "var(--c-black)", color: "#fff", fontSize: 12, padding: "8px 14px", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
          {hover}
        </div>
      )}
    </div>
  );
}
