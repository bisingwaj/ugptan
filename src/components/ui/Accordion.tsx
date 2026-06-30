"use client";

import { useState } from "react";

export type QA = { q: string; r: string };

/** Shared FAQ accordion (UGPTN FAQ, citizen FAQ, MGP FAQ). */
export function Accordion({ items, first = 0 }: { items: QA[]; first?: number | null }) {
  const [open, setOpen] = useState<number | null>(first);
  return (
    <div style={{ borderTop: "1px solid var(--c-black)", maxWidth: 920 }}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderBottom: "1px solid var(--c-20)" }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 16, padding: "22px 4px", textAlign: "left",
              }}
            >
              <span style={{ fontSize: "clamp(16px,1.9vw,19px)", fontWeight: 600, letterSpacing: "-0.01em" }}>{it.q}</span>
              <span
                style={{
                  flex: "0 0 auto", width: 28, height: 28, border: "1px solid var(--c-30)", background: "#fff",
                  color: "var(--ac)", display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, fontWeight: 600,
                }}
              >
                {isOpen ? "–" : "+"}
              </span>
            </button>
            {isOpen && (
              <div style={{ padding: "0 4px 24px", fontSize: 15, lineHeight: 1.72, color: "var(--c-70)", maxWidth: 780 }}>
                {it.r}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
