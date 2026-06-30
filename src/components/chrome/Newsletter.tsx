"use client";

import { useState } from "react";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";

export function Newsletter({ lang }: { lang: Lang }) {
  const t = dict(lang).nl;
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="section--dark" style={{ padding: "clamp(56px,7vw,96px) var(--pad-x)" }}>
      <div className="cols2 cols2--center" style={{ maxWidth: "var(--maxw)", margin: "0 auto", gap: "clamp(28px,5vw,64px)" }}>
        <div>
          <div className="kicker kicker--light">{t.label}</div>
          <h2 className="h2--sm" style={{ marginBottom: 12 }}>{t.title}</h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--c-40)", maxWidth: 480 }}>{t.lead}</p>
        </div>
        <div>
          {!done ? (
            <>
              <form
                onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setDone(true); }}
                style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
              >
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.placeholder} aria-label={t.label} className="field field--dark" style={{ flex: 1, minWidth: 200, fontSize: 15, padding: "15px 16px" }} />
                <button type="submit" className="btn btn--primary" style={{ whiteSpace: "nowrap" }}>{t.btn}<span className="arrow">→</span></button>
              </form>
              <p className="mono" style={{ margin: "14px 0 0", fontSize: 11, color: "var(--c-60)" }}>
                {lang === "en" ? "No spam · one-click unsubscribe." : "Pas de spam · désinscription en un clic."}
              </p>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#0a2e16", border: "1px solid #0e6027", padding: "20px 22px", animation: "revFade .3s both" }}>
              <span style={{ width: 38, height: 38, flex: "0 0 auto", background: "var(--green-soft)", color: "var(--c-black)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✓</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{t.doneTitle}</div>
                <div style={{ fontSize: 13.5, color: "var(--c-40)", marginTop: 4 }}>{t.doneText}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
