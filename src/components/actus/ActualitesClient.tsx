"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { actualites } from "@/content/actualites";
import { media } from "@/content/media";
import { Photo } from "@/components/ui/Photo";
import { useVideo } from "@/components/video/VideoProvider";

export function ActualitesClient({ lang }: { lang: Lang }) {
  const t = dict(lang).actus;
  const openVideo = useVideo();
  const [cat, setCat] = useState<string>("tous");
  const [sel, setSel] = useState<number | null>(null);

  useEffect(() => {
    if (sel === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSel(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  const cats = ["tous", ...Array.from(new Set(actualites.map((a) => a.cat.fr)))];
  const view = actualites.map((a, i) => ({ a, i })).filter(({ a }) => cat === "tous" || a.cat.fr === cat);
  const article = sel !== null ? actualites[sel] : null;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cat === c ? "chip chip--on" : "chip"}>
            {c === "tous" ? t.allFilter : pick(actualites.find((a) => a.cat.fr === c)!.cat, lang)}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(358px,1fr))", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)" }}>
        {view.map(({ a, i }) => (
          <button key={i} onClick={() => setSel(i)} style={{ textAlign: "left", background: "#fff", display: "flex", flexDirection: "column", padding: 0 }}>
            <div className="duo" style={{ aspectRatio: "16/9" }}>
              <Photo src={media.img[a.img]} alt={pick(a.title, lang)} />
              <span className="mono" style={{ position: "absolute", top: 12, left: 12, fontSize: 10.5, color: "#fff", background: "var(--ac)", padding: "5px 10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{pick(a.cat, lang)}</span>
            </div>
            <div style={{ padding: "22px clamp(18px,2vw,24px) 24px", display: "flex", flexDirection: "column", flex: 1 }}>
              <div className="mono" style={{ fontSize: 11.5, color: "var(--c-50)" }}>{a.date} · {a.lieu}</div>
              <h3 style={{ margin: "12px 0 0", fontSize: 17.5, fontWeight: 600, lineHeight: 1.32, flex: 1 }}>{pick(a.title, lang)}</h3>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 18, fontSize: 13, fontWeight: 600, color: "var(--ac)" }}>{t.readArticle} →</span>
            </div>
          </button>
        ))}
      </div>

      {article && (
        <div className="scrim scrim--right" onClick={() => setSel(null)}>
          <div className="drawer" style={{ width: "min(820px,100%)" }} onClick={(e) => e.stopPropagation()}>
            <div className="duo" style={{ aspectRatio: "16/7" }}>
              <Photo src={media.img[article.img]} alt={pick(article.title, lang)} />
              <button onClick={() => setSel(null)} aria-label="Fermer" style={{ position: "absolute", top: 18, right: 18, width: 42, height: 42, border: "1px solid rgba(255,255,255,.3)", color: "#fff", fontSize: 16, background: "rgba(22,22,22,.5)" }}>✕</button>
              <div style={{ position: "absolute", left: "clamp(24px,3.2vw,40px)", right: "clamp(24px,3.2vw,40px)", bottom: "clamp(22px,3vw,34px)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span className="mono" style={{ fontSize: 10.5, color: "#fff", background: "var(--ac)", padding: "5px 11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{pick(article.cat, lang)}</span>
                  <span className="mono" style={{ fontSize: 12, color: "rgba(255,255,255,.85)" }}>{article.date} · {article.lieu}</span>
                </div>
                <h2 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(22px,2.8vw,34px)", lineHeight: 1.18, letterSpacing: "-0.02em", color: "#fff" }}>{pick(article.title, lang)}</h2>
              </div>
            </div>
            <div style={{ padding: "clamp(26px,3.4vw,46px)", maxWidth: 680 }}>
              {(lang === "en" ? article.corps.en : article.corps.fr).map((p, i) => (
                <p key={i} style={{ margin: "0 0 20px", fontSize: 16, lineHeight: 1.75, color: "var(--c-80)" }}>{p}</p>
              ))}
              {article.videoYt && (
                <button onClick={() => openVideo(article.videoYt)} className="btn btn--ghost" style={{ marginTop: 8, paddingLeft: 13 }}>
                  <span style={{ width: 36, height: 36, background: "var(--ac)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, paddingLeft: 2 }}>▶</span>{t.relatedVideo}
                </button>
              )}
              <div style={{ marginTop: 30, paddingTop: 24, borderTop: "1px solid var(--c-20)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                <button onClick={() => setSel(null)} className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13, fontWeight: 600, color: "var(--ac)" }}>← {t.allNews}</button>
                <span className="mono" style={{ fontSize: 11, color: "var(--c-50)" }}>UGPTN · {article.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
