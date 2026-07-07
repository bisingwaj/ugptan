"use client";

import { useState } from "react";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { mgpPipeline } from "@/content/mgp";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function MgpTracker({ lang }: { lang: Lang }) {
  const t = dict(lang).mgp;
  const [ref, setRef] = useState("");
  const [status, setStatus] = useState<{ ref: string; idx: number; restant: number } | { err: true } | null>(null);

  const track = () => {
    const r = ref.trim();
    if (!r) { setStatus({ err: true }); return; }
    let h = 0;
    for (let i = 0; i < r.length; i++) h = (h * 31 + r.charCodeAt(i)) >>> 0;
    const idx = h % mgpPipeline.length;
    setStatus({ ref: r.toUpperCase(), idx, restant: Math.max(1, 30 - idx * 6) });
  };

  const stages = mgpPipeline.map((s) => pick(s, lang));
  const ok = status && !("err" in status);

  return (
    <div style={{ background: "var(--c-black)", color: "#fff", padding: "clamp(26px,3vw,38px)" }}>
      <h2 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(20px,2.4vw,26px)", letterSpacing: "-0.02em" }}>{t.trackTitle}</h2>
      <p style={{ margin: "10px 0 0", fontSize: 13.5, color: "var(--c-40)", lineHeight: 1.55 }}>{t.trackLead}</p>
      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        <input value={ref} onChange={(e) => setRef(e.target.value)} onKeyDown={(e) => e.key === "Enter" && track()} placeholder="UGPTN-MGP-2026-…" className="field field--dark mono" style={{ flex: 1, minWidth: 0 }} />
        <button onClick={track} className="btn btn--primary btn--sm" style={{ whiteSpace: "nowrap" }}>{t.track}</button>
      </div>

      {status && "err" in status && <div style={{ marginTop: 16, fontSize: 13, color: "#ffb3b8" }}>{t.trackErr}</div>}

      {ok && (
        <div style={{ marginTop: 22, border: "1px solid var(--c-80)", padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span className="mono" style={{ fontSize: 12.5, color: "var(--ac-light)" }}>{status.ref}</span>
            <span style={{ fontSize: 12, color: "var(--c-40)" }}>{status.restant} {t.daysRemaining}</span>
          </div>
          <div style={{ marginTop: 16, height: 6, background: "var(--c-80)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.round(((status.idx + 1) / stages.length) * 100)}%`, background: "var(--ac)" }} />
          </div>
          <RevealGroup style={{ marginTop: 18, display: "flex", flexDirection: "column" }} gap={0.045}>
            {stages.map((label, i) => {
              const done = i < status.idx, cur = i === status.idx;
              return (
                <RevealItem key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0" }}>
                  <span className="mono" style={{ width: 24, height: 24, flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, background: done ? "var(--ac)" : cur ? "var(--ac-pale)" : "#fff", color: done ? "#fff" : cur ? "var(--ac)" : "var(--c-50)", border: `1px solid ${cur ? "var(--ac)" : "var(--c-20)"}` }}>{done ? "✓" : cur ? "●" : i + 1}</span>
                  <span style={{ fontSize: 13, color: i <= status.idx ? "#fff" : "var(--c-50)", fontWeight: cur ? 600 : 400 }}>{label}</span>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      )}

      <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--c-80)" }}>
        <div className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--c-60)", marginBottom: 12 }}>{t.pipelineTitle}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {stages.map((s, i) => (
            <span key={i} className="mono" style={{ fontSize: 11, color: "var(--c-40)" }}>{s} <span style={{ color: "var(--ac-light)", marginLeft: 6 }}>›</span></span>
          ))}
        </div>
      </div>
    </div>
  );
}
