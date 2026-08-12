"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/admin-auth";
import { ADMIN } from "@/content/admin";
import type { LoginState } from "@/lib/auth/session";

const initialState: LoginState = { error: null };

/**
 * Écran de connexion de la console — reprend la mise en page split-screen de
 * l'ancienne page publique /connexion, branchée cette fois sur une vraie
 * vérification serveur (cf. actions/admin-auth.ts).
 */
export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const t = ADMIN.login;

  return (
    <section className="auth-split">
      <div className="auth-brand">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 30, height: 30, background: "var(--ac)", position: "relative", display: "inline-flex", flex: "0 0 auto" }}>
            <span style={{ position: "absolute", right: 5, bottom: 5, width: 11, height: 11, background: "#fff" }} />
          </span>
          <span style={{ fontWeight: 700, fontSize: 19 }}>{ADMIN.brand}</span>
        </div>

        <div>
          <div className="mono" style={{ fontSize: 11.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ac-light)", marginBottom: 18 }}>
            {t.kicker}
          </div>
          <h2 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(23px,2.7vw,36px)", lineHeight: 1.12, letterSpacing: "-0.02em", maxWidth: "15ch" }}>
            {t.heroTitle}
          </h2>
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 13 }}>
            {t.benefits.map((benefit) => (
              <div key={benefit} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--c-30)" }}>
                <span style={{ width: 24, height: 24, flex: "0 0 auto", border: "1px solid var(--c-80)", color: "var(--ac-light)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✓</span>
                {benefit}
              </div>
            ))}
          </div>
        </div>

        <div className="mono" style={{ fontSize: 11, color: "var(--c-60)" }}>{t.accessNote}</div>
      </div>

      <div className="auth-form">
        <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", animation: "revFade .3s both" }}>
          <h1 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(24px,2.6vw,32px)", letterSpacing: "-0.02em" }}>{t.title}</h1>
          <p style={{ margin: "10px 0 26px", fontSize: 14, color: "var(--c-60)" }}>{t.lead}</p>

          {state.error && (
            <div className="auth-error" role="alert" aria-live="polite">{state.error}</div>
          )}

          <form action={formAction}>
            <label className="label-mono" htmlFor="admin-password">{t.passwordLabel}</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              placeholder="••••••••"
              className="field"
              style={{ background: "var(--c-10)", marginBottom: 22 }}
            />
            <button type="submit" disabled={pending} className="btn btn--primary" style={{ width: "100%", justifyContent: "center", padding: 15 }}>
              {pending ? t.submitting : t.submit}
              {!pending && <span className="arrow">→</span>}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
