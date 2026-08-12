"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import type { Evenement } from "@/content/types";
import { media } from "@/content/media";
import { Photo } from "@/components/ui/Photo";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

type Props = { lang: Lang; events: Evenement[]; withImage?: boolean };

export function EventsGrid({ lang, events, withImage = false }: Props) {
  const t = dict(lang);
  const [reg, setReg] = useState<Evenement | null>(null);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ nom: "", email: "", org: "" });

  const close = () => { setReg(null); setDone(false); setForm({ nom: "", email: "", org: "" }); };

  useEffect(() => {
    if (!reg) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reg]);

  const RegisterBtn = ({ e }: { e: Evenement }) => (
    <button onClick={() => { setReg(e); setDone(false); }} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: e.color, background: "none" }}>
      {t.evt.register} →
    </button>
  );

  return (
    <>
      <RevealGroup className="grid-auto" gap={0.045}>
        {events.map((e) =>
          withImage ? (
            <RevealItem key={e.id} style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
              <div className="duo" style={{ aspectRatio: "16/9", ["--duo" as string]: e.color }}>
                <Photo src={media.img[e.img]} alt={pick(e.titre, lang)} />
                <span className="mono" style={{ position: "absolute", top: 12, left: 12, fontSize: 11, fontWeight: 600, color: "#fff", background: e.color, padding: "4px 10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{pick(e.type, lang)}</span>
              </div>
              <div style={{ padding: "22px clamp(18px,2vw,24px) 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--c-50)" }}>{pick(e.date, lang)} · {pick(e.lieu, lang)}</div>
                <h3 style={{ margin: "12px 0 0", fontSize: 17.5, fontWeight: 600, lineHeight: 1.32, flex: 1 }}>{pick(e.titre, lang)}</h3>
                <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.55, color: "var(--c-70)" }}>{pick(e.desc, lang)}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--c-20)" }}>
                  {e.statut === "avenir" ? (
                    <>
                      <span className="mono" style={{ fontSize: 11.5, color: "var(--c-70)" }}>{pick(e.places, lang)}</span>
                      <RegisterBtn e={e} />
                    </>
                  ) : (
                    <span className="mono" style={{ fontSize: 11.5, color: "var(--c-50)", marginLeft: "auto" }}>{t.evt.past} ✓</span>
                  )}
                </div>
              </div>
            </RevealItem>
          ) : (
            <RevealItem key={e.id} style={{ background: "#fff", padding: "24px clamp(20px,2.4vw,28px)", display: "flex", flexDirection: "column", borderTop: `3px solid ${e.color}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: e.color, padding: "4px 10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{pick(e.type, lang)}</span>
                <span className="mono" style={{ fontSize: 11.5, color: "var(--c-50)" }}>{pick(e.date, lang)}</span>
              </div>
              <h3 style={{ margin: "16px 0 0", fontSize: 16.5, fontWeight: 600, lineHeight: 1.32, flex: 1 }}>{pick(e.titre, lang)}</h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--c-20)" }}>
                <span className="mono" style={{ fontSize: 11.5, color: "var(--c-70)" }}>{pick(e.lieu, lang)}</span>
                <RegisterBtn e={e} />
              </div>
            </RevealItem>
          ),
        )}
      </RevealGroup>

      {reg && (
        <div className="scrim scrim--center" onClick={close}>
          <div className="modal" data-lenis-prevent style={{ width: "100%", maxWidth: 480, background: "#fff", border: "1px solid var(--c-80)" }} onClick={(ev) => ev.stopPropagation()}>
            <div style={{ background: "var(--c-black)", color: "#fff", padding: "24px 26px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 120% at 90% 0%, rgba(15,98,254,.34), transparent 55%)" }} />
              <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ac-light)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{t.evt.regTitle}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>{pick(reg.titre, lang)}</div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--c-40)", marginTop: 8 }}>{pick(reg.date, lang)} · {pick(reg.lieu, lang)}</div>
                </div>
                <button onClick={close} aria-label="Fermer" style={{ width: 44, height: 44, flex: "0 0 auto", border: "1px solid var(--c-80)", color: "#fff", fontSize: 16, background: "var(--c-90)" }}>✕</button>
              </div>
            </div>
            {!done ? (
              <form onSubmit={(ev) => { ev.preventDefault(); setDone(true); }} style={{ padding: 26 }}>
                <label className="label-mono">{t.evt.fullName}</label>
                <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className="field" style={{ marginBottom: 13, background: "var(--c-10)" }} />
                <label className="label-mono">{t.mgp.email}</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="field" style={{ marginBottom: 13, background: "var(--c-10)" }} />
                <label className="label-mono">{t.evt.orgOptional}</label>
                <input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} className="field" style={{ marginBottom: 20, background: "var(--c-10)" }} />
                <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>{t.evt.register}<span className="arrow">→</span></button>
              </form>
            ) : (
              <div style={{ padding: "36px 26px", textAlign: "center", animation: "revFade .3s both" }}>
                <div style={{ width: 54, height: 54, margin: "0 auto 20px", background: "var(--ok-bg)", border: "1px solid var(--ok-bd)", color: "var(--ok-fg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✓</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{t.evt.regDoneTitle}</div>
                <p style={{ margin: "12px auto 0", maxWidth: 320, fontSize: 14, lineHeight: 1.6, color: "var(--c-70)" }}>{t.evt.regDoneText}</p>
                <button onClick={close} className="btn btn--outline" style={{ marginTop: 22 }}>OK</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
