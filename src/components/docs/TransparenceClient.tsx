"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { documents, documentsCats } from "@/content/marches";
import type { Document } from "@/content/types";

export function TransparenceClient({ lang }: { lang: Lang }) {
  const t = dict(lang).docs;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("tous");
  const [sort, setSort] = useState<"sigle" | "taille">("sigle");
  const [sel, setSel] = useState<Document | null>(null);

  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSel(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  const catLabel = (code: string) => {
    const c = documentsCats.find((x) => x.code === code);
    return c ? pick(c.label, lang) : code;
  };

  const view = useMemo(() => {
    const out = documents.filter((d) => (cat === "tous" || d.cat === cat) && (!q.trim() || `${d.titre} ${d.sigle}`.toLowerCase().includes(q.toLowerCase().trim())));
    return out.slice().sort((a, b) => {
      if (sort === "sigle") return a.sigle.localeCompare(b.sigle);
      return parseFloat(b.taille.replace(",", ".")) - parseFloat(a.taille.replace(",", "."));
    });
  }, [q, cat, sort, lang]);

  const chips = [{ k: "tous", label: t.search === "" ? "" : (lang === "en" ? "All" : "Tous") }, ...documentsCats.map((c) => ({ k: c.code, label: pick(c.label, lang) }))];

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 260, maxWidth: 520 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--c-50)", fontSize: 15 }}>⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className="field" style={{ paddingLeft: 40 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--c-50)" }}>{t.sortBy}</span>
          {([["sigle", t.sortRef], ["taille", t.sortSize]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setSort(k)} className={sort === k ? "chip chip--on" : "chip"}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
        {chips.map((c) => (
          <button key={c.k} onClick={() => setCat(c.k)} className={cat === c.k ? "chip chip--on" : "chip"}>{c.k === "tous" ? (lang === "en" ? "All" : "Tous") : c.label}</button>
        ))}
      </div>

      {view.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 20px", border: "1px solid var(--c-20)", background: "var(--c-10)", marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 15, color: "var(--c-70)" }}>{t.noResult}</p>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--c-black)", borderTopWidth: 2 }}>
          <div className="mono hide-sm" style={{ display: "flex", alignItems: "center", gap: 16, padding: "13px 22px", background: "var(--c-10)", borderBottom: "1px solid var(--c-20)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--c-50)" }}>
            <span style={{ width: 54 }}>Réf</span><span style={{ flex: 1 }}>{t.colDoc}</span><span style={{ width: 260, textAlign: "right" }}>{t.colMeta}</span>
          </div>
          {view.map((d) => (
            <button key={d.sigle} onClick={() => setSel(d)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 16, padding: "17px 22px", borderBottom: "1px solid var(--c-20)", background: "#fff" }}>
              <span className="mono" style={{ width: 54, flex: "0 0 auto", fontWeight: 600, fontSize: 12, color: "var(--ac)" }}>{d.sigle}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 600, display: "block" }}>{d.titre}</span>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--c-50)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{catLabel(d.cat)}</span>
              </span>
              <span className="mono hide-sm" style={{ width: 260, flex: "0 0 auto", textAlign: "right", fontSize: 11.5, color: "var(--c-70)" }}>{d.version} · {d.date} · {d.langue} · {d.taille}</span>
              <span style={{ flex: "0 0 auto", width: 34, height: 34, background: "var(--ac-pale)", color: "var(--ac)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⤢</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: 22, display: "flex", gap: 12, padding: "18px 22px", background: "var(--c-10)", borderLeft: "3px solid var(--ac)" }}>
        <span style={{ fontSize: 15 }}>ℹ</span>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--c-70)" }}>{t.disclaimer}</p>
      </div>

      {sel && (
        <div className="scrim scrim--center" onClick={() => setSel(null)}>
          <div className="modal" style={{ width: "100%", maxWidth: 560, background: "#fff", border: "1px solid var(--c-80)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, padding: "24px 26px", borderBottom: "1px solid var(--c-20)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 46, height: 46, background: "var(--ac-pale)", color: "var(--ac)", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{sel.sigle}</span>
                <div><div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{sel.titre}</div><div className="mono" style={{ fontSize: 11, color: "var(--c-50)", marginTop: 4, textTransform: "uppercase" }}>{catLabel(sel.cat)}</div></div>
              </div>
              <button onClick={() => setSel(null)} aria-label="Fermer" style={{ width: 38, height: 38, flex: "0 0 auto", background: "var(--c-10)", border: "1px solid var(--c-20)", color: "var(--c-70)", fontSize: 15 }}>✕</button>
            </div>
            <div style={{ padding: 26, background: "var(--c-10)" }}>
              <div style={{ background: "#fff", border: "1px solid var(--c-20)", padding: "30px 28px", aspectRatio: "1 / 1.32", overflow: "hidden", position: "relative" }}>
                <div style={{ width: 40, height: 5, background: "var(--ac)", marginBottom: 18 }} />
                <div style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.25, marginBottom: 6 }}>{sel.titre}</div>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--c-50)", marginBottom: 20 }}>{sel.sigle} · {sel.version} · {sel.date}</div>
                {[96, 88, 92, 70].map((w, i) => <div key={i} style={{ height: 8, background: "var(--c-10)", marginBottom: i === 3 ? 22 : 10, width: `${w}%` }} />)}
                {[90, 62].map((w, i) => <div key={i} style={{ height: 8, background: "var(--c-10)", marginBottom: 10, width: `${w}%` }} />)}
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "linear-gradient(180deg,rgba(255,255,255,0),#fff)" }} />
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--c-50)", textAlign: "center", marginTop: 14 }}>{t.previewNote}</div>
            </div>
            <div style={{ padding: "20px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, borderTop: "1px solid var(--c-20)" }}>
              <span className="mono" style={{ fontSize: 12, color: "var(--c-70)" }}>{sel.langue} · {sel.taille}</span>
              <a className="btn btn--primary btn--sm" style={{ cursor: "pointer" }}><span className="arrow">↓</span> {t.download}</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
