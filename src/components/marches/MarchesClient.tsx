"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { compColors, compImg } from "@/content/data";
import { marches, marchesOuverts } from "@/content/marches";
import type { Marche } from "@/content/types";
import { media } from "@/content/media";
import { computeCountdown } from "@/lib/format";
import { thousands } from "@/lib/format";
import { NAV, route } from "@/lib/routes";
import { Photo } from "@/components/ui/Photo";
import { useVideo } from "@/components/video/VideoProvider";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

/* Types d'AVIS, et non méthodes de passation : l'avis à manifestation d'intérêt
   ouvre une sélection de consultants, il se filtre donc comme les autres même
   s'il ne figure pas au bandeau des méthodes (cf. content/marches.ts). */
const FILTERS = ["tous", "ouvert", "AOI", "AON", "AMI", "SFQC", "SBQ", "DC"] as const;

export function MarchesClient({ lang }: { lang: Lang }) {
  const t = dict(lang).marches;
  const openVideo = useVideo();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("tous");
  const [selRef, setSelRef] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const sel = useMemo(() => marches.find((m) => m.ref === selRef) || null, [selRef]);

  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelRef(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  const statut = (m: Marche) => {
    const map = {
      ouvert: { label: lang === "en" ? "Open" : "Ouvert", c: "#198038" },
      cloture: { label: lang === "en" ? "Closed" : "Clôturé", c: "#8d8d8d" },
      attribue: { label: lang === "en" ? "Awarded" : "Attribué", c: "#0f62fe" },
    } as const;
    return map[m.statut];
  };

  const view = marches.filter((m) => {
    const okF = filter === "tous" || (filter === "ouvert" && m.statut === "ouvert") || filter === m.type;
    const hay = `${pick(m.objet, lang)} ${m.ref} ${pick(m.resume, lang)} ${pick(m.lieu, lang)}`.toLowerCase();
    return okF && (!q.trim() || hay.includes(q.toLowerCase().trim()));
  });

  const filterLabel = (k: string) =>
    k === "tous" ? t.filtersAll : k === "ouvert" ? t.filterOpen : k;

  /* Aucun avis publié : ce n'est pas une recherche infructueuse, et le montrer
     comme telle serait trompeur. Ni compteur à zéro, ni champ de recherche, ni
     filtres — il n'y a rien à chercher ni à réinitialiser. Le visiteur a besoin
     d'une phrase et d'une porte, pas d'une grille vide. */
  if (marches.length === 0) {
    return (
      <div style={{ border: "1px solid var(--c-20)", background: "var(--c-10)", padding: "clamp(40px,6vw,72px) clamp(20px,4vw,40px)", textAlign: "center" }}>
        <div className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--c-50)" }}>
          {dict(lang).nav.marches}
        </div>
        <p style={{ margin: "14px auto 0", fontSize: "clamp(17px,2.2vw,22px)", fontWeight: 600, letterSpacing: "-0.01em", maxWidth: "26ch" }}>
          {t.aucunAvis}
        </p>
        <p style={{ margin: "12px auto 0", fontSize: 14.5, lineHeight: 1.65, color: "var(--c-70)", maxWidth: "62ch" }}>
          {t.aucunAvisLead}
        </p>
        <Link href={route(lang, NAV.contact)} className="btn" style={{ marginTop: 26, background: "var(--c-black)", color: "#fff" }}>
          {dict(lang).words.askQuestion} <span className="arrow">→</span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 260, maxWidth: 540 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--c-50)", fontSize: 15 }}>⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className="field" style={{ paddingLeft: 40 }} />
        </div>
        <div className="mono" style={{ fontSize: 12, color: "var(--c-50)", whiteSpace: "nowrap" }}>
          <strong style={{ color: "var(--green)" }}>{marchesOuverts}</strong> {t.open} · <strong style={{ color: "var(--c-black)" }}>{marches.length}</strong> {t.results}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 30 }}>
        {FILTERS.map((k) => (
          <button key={k} onClick={() => setFilter(k)} className={filter === k ? "chip chip--on" : "chip"}>{filterLabel(k)}</button>
        ))}
      </div>

      {view.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 20px", border: "1px solid var(--c-20)", background: "var(--c-10)" }}>
          <p style={{ margin: "0 0 14px", fontSize: 15, color: "var(--c-70)" }}>{t.noResult}</p>
          <button onClick={() => { setFilter("tous"); setQ(""); }} className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--ac)" }}>↺ {t.reset}</button>
        </div>
      ) : (
        <RevealGroup className="celled-flow" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,400px),1fr))" }} gap={0.045}>
          {view.map((m) => {
            const cc = compColors[m.comp] || "#0f62fe";
            const st = statut(m);
            const cd = now !== null ? computeCountdown(m.limiteISO, now) : null;
            const showCd = cd && m.statut === "ouvert";
            return (
              <RevealItem key={m.ref}>
              <button onClick={() => setSelRef(m.ref)} style={{ textAlign: "left", background: "#fff", padding: 24, display: "flex", flexDirection: "column" }}>
                <div style={{ height: 4, background: cc, margin: "-24px -24px 22px" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--c-70)" }}>{m.ref}</span>
                  <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 600, color: st.c }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: st.c }} />{st.label}</span>
                </div>
                <h3 style={{ margin: "14px 0 0", fontSize: 17.5, fontWeight: 600, lineHeight: 1.35, flex: 1 }}>{pick(m.objet, lang)}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 16 }}>
                  <span className="mono" style={{ fontSize: 11, color: "#fff", background: cc, padding: "5px 9px" }}>{m.type}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--c-70)", background: "var(--c-10)", padding: "5px 9px" }}>{m.comp}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--c-70)", background: "var(--c-10)", padding: "5px 9px" }}>{m.budget}</span>
                  {m.addenda.length > 0 && <span className="mono" style={{ fontSize: 11, color: "#8a3800", background: "#fff3e0", padding: "5px 9px" }}>+{m.addenda.length} addendum</span>}
                </div>
                {showCd && (
                  <div style={{ marginTop: 16 }}>
                    <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: cd!.urgent ? "var(--red)" : cc, background: cd!.urgent ? "#fff1f1" : "var(--c-10)", padding: "7px 11px" }}>⏳ {cd!.d}j {cd!.hh}:{cd!.mm}:{cd!.ss}</span>
                  </div>
                )}
                <div className="mono" style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 14, fontSize: 11.5, color: "var(--c-70)" }}>
                  <span><strong style={{ color: cc, fontSize: 13.5 }}>{m.soum}</strong> {dict(lang).words.bidders}</span>
                  <span><strong style={{ color: "var(--c-black)", fontSize: 13.5 }}>{thousands(m.vues)}</strong> {dict(lang).words.views}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--c-20)" }}>
                  <span style={{ fontSize: 12.5, color: "var(--c-70)" }}>{t.deadline} : <strong style={{ color: "var(--c-black)" }}>{m.limite}</strong></span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--ac)", whiteSpace: "nowrap" }}>{t.viewDetail} →</span>
                </div>
              </button>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}

      {sel && <MarcheDrawer lang={lang} m={sel} now={now} onClose={() => setSelRef(null)} openVideo={openVideo} />}
    </div>
  );
}

function MarcheDrawer({ lang, m, now, onClose, openVideo }: { lang: Lang; m: Marche; now: number | null; onClose: () => void; openVideo: (id?: string) => void }) {
  const t = dict(lang).marches;
  const w = dict(lang).words;
  const cc = compColors[m.comp] || "#0f62fe";
  const cd = now !== null ? computeCountdown(m.limiteISO, now) : null;
  const showCd = cd && m.statut === "ouvert";
  const statutLabel = m.statut === "ouvert" ? (lang === "en" ? "Open" : "Ouvert") : m.statut === "cloture" ? (lang === "en" ? "Closed" : "Clôturé") : lang === "en" ? "Awarded" : "Attribué";
  const statutColor = m.statut === "ouvert" ? "#198038" : m.statut === "cloture" ? "#8d8d8d" : "#0f62fe";
  let seenCur = false;

  return (
    <div className="scrim scrim--right" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        <div className="duo" data-video-slot="Bannière de l'avis (vidéo)" data-slot-ratio="16:9" style={{ minHeight: "clamp(260px,35vw,360px)", display: "flex", flexDirection: "column", ["--duo" as string]: cc }}>
          <Photo src={media.img[compImg[m.comp] || "fibre"]} alt={pick(m.objet, lang)} />
          <div style={{ position: "relative", zIndex: 10, padding: "calc(16px + var(--sa-t, 0px)) 16px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <button onClick={() => openVideo()} style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "8px 14px 8px 8px", background: "rgba(255,255,255,.92)", color: "var(--c-black)", fontSize: 12.5, fontWeight: 600 }}>
              <span style={{ width: 26, height: 26, background: cc, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, paddingLeft: 1 }}>▶</span>{dict(lang).video.watch}
            </button>
            <button onClick={onClose} aria-label="Fermer" className="backdrop-blur-[6px] max-[760px]:backdrop-blur-none" style={{ flex: "0 0 auto", width: 44, height: 44, border: "1px solid rgba(255,255,255,.3)", color: "#fff", fontSize: 16, background: "rgba(22,22,22,.55)" }}>✕</button>
          </div>
          <div style={{ position: "relative", zIndex: 5, marginTop: "auto", padding: "32px clamp(20px,3vw,34px) clamp(18px,2.6vw,28px)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: "#fff", background: cc, padding: "5px 11px" }}>{m.type}</span>
              <span className="mono" style={{ fontSize: 11, color: "#fff", border: "1px solid rgba(255,255,255,.4)", padding: "5px 10px" }}>{m.comp}</span>
              <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 600, color: "#fff" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: statutColor }} />{statutLabel}</span>
            </div>
            <div className="mono" style={{ fontSize: 12, color: "rgba(255,255,255,.85)", marginBottom: 8 }}>{m.ref}</div>
            <h2 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(20px,2.7vw,32px)", lineHeight: 1.18, letterSpacing: "-0.02em", color: "#fff", maxWidth: "24ch" }}>{pick(m.objet, lang)}</h2>
          </div>
        </div>

        {showCd && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, background: cc, color: "#fff", padding: "15px clamp(20px,3.2vw,38px)" }}>
            <span className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.88 }}>{t.daysLeft}</span>
            <div className="mono" style={{ display: "flex", alignItems: "baseline", gap: 11, fontWeight: 600 }}>
              <span style={{ fontSize: 34, lineHeight: 1 }}>{cd!.d}</span><span style={{ fontSize: 12, opacity: 0.72 }}>j</span><span style={{ fontSize: 19, opacity: 0.94 }}>{cd!.hh}:{cd!.mm}:{cd!.ss}</span>
            </div>
          </div>
        )}

        <div style={{ padding: "clamp(24px,3.2vw,38px)" }}>
          <div className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: cc, marginBottom: 14, display: "flex", alignItems: "center", gap: 9 }}><span className="blink" style={{ width: 7, height: 7, borderRadius: "50%", background: cc }} />{w.activity}</div>
          <div className="grid-3" style={{ marginBottom: 32 }}>
            {[[String(m.soum), w.bidders_registered, cc], [thousands(m.vues), w.views, "var(--c-black)"], [String(m.questions), w.questions_received, "var(--c-black)"]].map(([v, l, color], i) => (
              <div key={i} className="cell" style={{ padding: "22px 18px" }}>
                <div className="mono" style={{ fontWeight: 600, fontSize: 32, color: color as string, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 12, color: "var(--c-70)", marginTop: 9, lineHeight: 1.35 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)", borderTop: `3px solid ${cc}`, marginBottom: 32 }}>
            {[[t.published, m.publie], [t.deadline, m.limite], [t.budget, m.budget], [t.lots, String(m.lots)]].map(([k, v], i) => (
              <div key={i} style={{ background: "#fff", padding: "15px 18px" }}><div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--c-50)", marginBottom: 6 }}>{k}</div><div style={{ fontSize: 14.5, fontWeight: 600 }}>{v}</div></div>
            ))}
            <div style={{ gridColumn: "1 / -1", background: "#fff", padding: "15px 18px" }}><div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--c-50)", marginBottom: 6 }}>{t.place}</div><div style={{ fontSize: 14.5, fontWeight: 600 }}>{pick(m.lieu, lang)}</div></div>
          </div>

          <div className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: cc, marginBottom: 12 }}>{t.summary}</div>
          <p style={{ margin: "0 0 32px", fontSize: 15, lineHeight: 1.7, color: "var(--c-80)" }}>{pick(m.resume, lang)}</p>

          {m.attributaire && (
            <div style={{ marginBottom: 32, border: "1px solid var(--ok-bd)", background: "var(--ok-bg)", padding: "16px 18px" }}>
              <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ok-fg)", marginBottom: 6 }}>{t.awardee}</div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{pick(m.attributaire, lang)}</div>
            </div>
          )}

          <div className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: cc, marginBottom: 18 }}>{t.scheduleTitle}</div>
          <div style={{ marginBottom: 32 }}>
            {m.calendrier.map((c, i) => {
              const cur = !c.done && !seenCur;
              if (cur) seenCur = true;
              return (
                <div key={i} style={{ display: "flex", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
                    <span style={{ width: 26, height: 26, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, background: c.done ? cc : "#fff", color: c.done ? "#fff" : cc, border: `2px solid ${c.done || cur ? cc : "var(--c-30)"}` }}>{c.done ? "✓" : cur ? "●" : ""}</span>
                    <span style={{ flex: 1, width: 2, background: "var(--c-20)", margin: "3px 0", minHeight: 16 }} />
                  </div>
                  <div style={{ paddingBottom: 20 }}>
                    <div className="mono" style={{ fontSize: 11.5, color: "var(--c-50)" }}>{c.date}</div>
                    <div style={{ fontSize: 14.5, color: c.done || cur ? "var(--c-black)" : "var(--c-50)", fontWeight: cur ? 600 : 400, marginTop: 3 }}>{lang === "en" ? c.en : c.fr}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {m.addenda.length > 0 && (
            <>
              <div className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a3800", marginBottom: 12 }}>{t.addendaTitle}</div>
              <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", gap: 9 }}>
                {m.addenda.map((a) => (
                  <div key={a.n} style={{ border: "1px solid #ffd9a8", background: "#fff3e0", padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#8a3800" }}>Addendum {a.n}</span><span className="mono" style={{ fontSize: 11.5, color: "#9a6b3a" }}>{a.date}</span></div>
                    <p style={{ margin: "8px 0 0", fontSize: 13.5, lineHeight: 1.55, color: "#6f5230" }}>{pick(a.note, lang)}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: cc, marginBottom: 14 }}>{t.docsTitle}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--c-20)", border: "1px solid var(--c-20)", marginBottom: 32 }}>
            {m.pieces.map((p, i) => (
              <a key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#fff", cursor: "pointer" }}>
                <span style={{ width: 32, height: 32, flex: "0 0 auto", background: cc, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>↓</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{pick(p.nom, lang)}</span>
                <span className="mono" style={{ fontSize: 11.5, color: "var(--c-50)" }}>PDF · {p.taille}</span>
              </a>
            ))}
          </div>

          <div className="stack-sm" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href={route(lang, NAV.contact)} className="btn" style={{ flex: 1, minWidth: 200, justifyContent: "center", background: cc, color: "#fff" }}>{w.askQuestion} <span className="arrow">→</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
