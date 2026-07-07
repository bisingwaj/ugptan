"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { NAV, route } from "@/lib/routes";

type Mode = "login" | "register" | "creating";

export function ConnexionClient({ lang }: { lang: Lang }) {
  const t = dict(lang).connexion;
  const [mode, setMode] = useState<Mode>("login");
  const [authStep, setAuthStep] = useState(0);
  const [soum, setSoum] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const startCreate = () => {
    setMode("creating");
    setAuthStep(0);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setAuthStep((n) => {
        if (n >= 3) { if (timer.current) clearInterval(timer.current); setSoum(true); setMode("login"); return 0; }
        return n + 1;
      });
    }, 850);
  };

  if (soum) return <Dashboard lang={lang} onLogout={() => setSoum(false)} />;

  if (mode === "creating") {
    const pct = Math.min(100, Math.round((authStep / 4) * 100));
    return (
      <section style={{ minHeight: "calc(100svh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--c-black)", color: "#fff", padding: "clamp(24px,5vw,60px)" }}>
        <div style={{ width: "100%", maxWidth: 440, textAlign: "center" }}>
          <div className="spin" style={{ width: 54, height: 54, margin: "0 auto 26px", border: "3px solid var(--c-90)", borderTopColor: "var(--ac)", borderRadius: "50%" }} />
          <div style={{ fontWeight: 600, fontSize: "clamp(20px,2.4vw,26px)", letterSpacing: "-0.02em" }}>{t.creatingSteps[Math.min(3, authStep)]}…</div>
          <div className="mono" style={{ marginTop: 10, fontSize: 12, color: "var(--ac-light)" }}>{pct}%</div>
          <div style={{ marginTop: 26, height: 3, background: "var(--c-90)", overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: "var(--ac)", transition: "width .6s cubic-bezier(.16,1,.3,1)" }} /></div>
          <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 13, textAlign: "left" }}>
            {t.creatingSteps.map((label, i) => {
              const done = i < authStep, cur = i === authStep;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <span className="mono" style={{ width: 24, height: 24, flex: "0 0 auto", border: `1.5px solid ${done || cur ? "var(--ac)" : "var(--c-80)"}`, background: done ? "var(--ac)" : "transparent", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{done ? "✓" : ""}</span>
                  <span style={{ fontSize: 14.5, color: done || cur ? "#fff" : "var(--c-60)" }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ minHeight: "calc(100svh - 64px)", overflow: "hidden", background: "var(--c-10)", display: "flex" }}>
      <div className="auth-split" style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 0 }}>
        {/* Brand */}
        <div className="auth-brand" style={{ position: "relative", background: "var(--c-black)", color: "#fff", padding: "clamp(28px,4vw,56px)", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 120% at 88% 8%, rgba(15,98,254,.34), transparent 55%)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 30, height: 30, background: "var(--ac)", position: "relative", display: "inline-flex", flex: "0 0 auto" }}><span style={{ position: "absolute", right: 5, bottom: 5, width: 11, height: 11, background: "#fff" }} /></span>
            <span style={{ fontWeight: 700, fontSize: 19 }}>UGPTN</span>
          </div>
          <div style={{ position: "relative" }}>
            <div className="mono" style={{ fontSize: 11.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ac-light)", marginBottom: 18 }}>{t.bidderSpace}</div>
            <h2 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(23px,2.7vw,36px)", lineHeight: 1.12, letterSpacing: "-0.02em", maxWidth: "15ch" }}>{t.heroTitle}</h2>
            <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 13 }}>
              {t.benefits.map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--c-30)" }}>
                  <span style={{ width: 24, height: 24, flex: "0 0 auto", border: "1px solid var(--c-80)", color: "var(--ac-light)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</span>{b}
                </div>
              ))}
            </div>
          </div>
          <div className="mono" style={{ position: "relative", fontSize: 11, color: "var(--c-60)" }}>{t.rbacNote}</div>
        </div>

        {/* Form */}
        <div style={{ background: "#fff", padding: "clamp(26px,4vw,52px)", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "auto" }}>
          <div style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
            {mode === "login" ? (
              <div style={{ animation: "revFade .3s both" }}>
                <h1 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(24px,2.6vw,32px)", letterSpacing: "-0.02em" }}>{t.signin}</h1>
                <p style={{ margin: "10px 0 26px", fontSize: 14, color: "var(--c-60)" }}>{t.signinLead}</p>
                <form onSubmit={(e) => { e.preventDefault(); setSoum(true); }}>
                  <label className="label-mono">{t.emailLabel}</label>
                  <input type="email" placeholder="nom@entreprise.cd" className="field" style={{ background: "var(--c-10)", marginBottom: 16 }} />
                  <label className="label-mono">{t.passwordLabel}</label>
                  <input type="password" placeholder="••••••••" className="field" style={{ background: "var(--c-10)", marginBottom: 22 }} />
                  <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center", padding: 15 }}>{t.signin} <span className="arrow">→</span></button>
                </form>
                <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--c-20)", fontSize: 14, color: "var(--c-70)" }}>{t.noAccount} <button onClick={() => setMode("register")} style={{ color: "var(--ac)", fontWeight: 600 }}>{t.createAccount} →</button></div>
              </div>
            ) : (
              <div style={{ animation: "revFade .3s both" }}>
                <button onClick={() => setMode("login")} className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-70)", marginBottom: 16 }}>← {t.backSignin}</button>
                <h1 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(23px,2.5vw,30px)", letterSpacing: "-0.02em" }}>{t.registerTitle}</h1>
                <p style={{ margin: "10px 0 22px", fontSize: 14, color: "var(--c-60)" }}>{t.registerLead}</p>
                <form onSubmit={(e) => { e.preventDefault(); startCreate(); }}>
                  <label className="label-mono">{t.orgName}</label>
                  <input required placeholder="Entreprise / Groupement" className="field" style={{ background: "var(--c-10)", marginBottom: 13 }} />
                  <label className="label-mono">{t.emailPro}</label>
                  <input required type="email" placeholder="contact@entreprise.cd" className="field" style={{ background: "var(--c-10)", marginBottom: 13 }} />
                  <div className="cols2-sm" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginBottom: 8 }}>
                    <div><label className="label-mono">{t.country}</label><input placeholder="RDC" className="field" style={{ background: "var(--c-10)" }} /></div>
                    <div><label className="label-mono">{t.passwordLabel}</label><input type="password" placeholder="••••••••" className="field" style={{ background: "var(--c-10)" }} /></div>
                  </div>
                  <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center", padding: 15, marginTop: 8 }}>{t.create} <span className="arrow">→</span></button>
                </form>
                <p style={{ margin: "14px 0 0", fontSize: 11.5, color: "var(--c-50)", lineHeight: 1.5 }}>{t.kycNote}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Dashboard({ lang, onLogout }: { lang: Lang; onLogout: () => void }) {
  const t = dict(lang).connexion;
  const counts = ["3", "1", "1"];
  return (
    <section style={{ padding: "clamp(40px,5vw,64px) var(--pad-x) clamp(64px,8vw,110px)" }}>
      <div className="section__inner">
        <div style={{ background: "var(--c-black)", color: "#fff", padding: "clamp(24px,3vw,36px)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--ac-light)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.bidderSpace} · DÉMO</div>
            <div style={{ fontWeight: 600, fontSize: "clamp(20px,2.4vw,28px)", letterSpacing: "-0.02em" }}>{t.hello}</div>
            <div className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 11, color: "var(--green-soft)", border: "1px solid #0e6027", background: "#0a2e16", padding: "6px 12px" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green-soft)" }} />{t.kycVerified}</div>
          </div>
          <button onClick={onLogout} className="btn btn--on-dark btn--sm">{t.logout} →</button>
        </div>

        <div className="grid-3" style={{ marginTop: 1 }}>
          {t.stats.map((s, i) => (
            <div key={i} className="cell" style={{ padding: 24 }}><div className="mono" style={{ fontWeight: 600, fontSize: 36, lineHeight: 1 }}>{counts[i]}</div><div style={{ fontSize: 13, color: "var(--c-70)", marginTop: 8 }}>{s.l}</div></div>
          ))}
        </div>

        <div style={{ marginTop: 1, border: "1px solid var(--c-20)" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--c-20)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600, fontSize: 17 }}>{t.myBids}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--c-50)" }}>{t.demoNote}</span>
          </div>
          {t.offres.map((o) => (
            <div key={o.ref} className="stack-sm" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 22px", borderBottom: "1px solid var(--c-20)", flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--c-70)", width: 150, flex: "0 0 auto" }}>{o.ref}</span>
              <span style={{ flex: 1, minWidth: 140, fontSize: 14, fontWeight: 600 }}>{o.objet}</span>
              <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 600, color: o.color }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: o.color }} />{o.statut}</span>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--c-50)", width: 110, textAlign: "right", flex: "0 0 auto" }}>{o.date}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href={route(lang, NAV.marches)} className="btn btn--primary">{t.deposit} →</Link>
          <button onClick={onLogout} className="btn btn--outline">← {t.logout}</button>
        </div>
      </div>
    </section>
  );
}
