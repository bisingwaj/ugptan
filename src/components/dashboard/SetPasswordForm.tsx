"use client";

import { useActionState } from "react";
import { setPasswordAction, type SetPasswordState } from "@/actions/admin-password";
import { ADMIN } from "@/content/admin";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/validate";

const initialState: SetPasswordState = { error: null };

/**
 * Écran de définition du mot de passe, atteint depuis le lien de l'e-mail
 * d'ouverture de compte.
 *
 * Reprend la coquille de l'écran de connexion (`.auth-split`) : c'est le même
 * moment du parcours, il n'a aucune raison de ressembler à autre chose. Le jeton
 * voyage en champ caché ; il a déjà été validé une première fois par Better Auth
 * avant d'arriver ici, et le sera de nouveau à la soumission.
 */
export function SetPasswordForm({ token, welcome }: { token: string; welcome: boolean }) {
  const [state, formAction, pending] = useActionState(setPasswordAction, initialState);
  const t = ADMIN.setPassword;

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
            {welcome ? t.heroWelcome : t.heroReset}
          </h2>
          <p style={{ margin: "22px 0 0", fontSize: 14, lineHeight: 1.6, color: "var(--c-30)", maxWidth: "40ch" }}>
            {t.heroLead}
          </p>
        </div>

        <div className="mono" style={{ fontSize: 11, color: "var(--c-60)" }}>{ADMIN.login.accessNote}</div>
      </div>

      <div className="auth-form">
        <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", animation: "revFade .3s both" }}>
          <h1 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(24px,2.6vw,32px)", letterSpacing: "-0.02em" }}>{t.title}</h1>
          <p style={{ margin: "10px 0 26px", fontSize: 14, color: "var(--c-60)" }}>{t.lead}</p>

          {state.error && <div className="auth-error" role="alert" aria-live="polite">{state.error}</div>}

          {token ? (
            <form action={formAction}>
              <input type="hidden" name="token" value={token} />

              <label className="label-mono" htmlFor="new-password">{t.fieldPassword}</label>
              <input
                id="new-password"
                name="password"
                type="password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
                autoFocus
                placeholder="••••••••"
                className="field"
                style={{ background: "var(--c-10)", marginBottom: 6 }}
              />
              <p className="adm-hint" style={{ marginBottom: 18 }}>{t.hint}</p>

              <label className="label-mono" htmlFor="confirm-password">{t.fieldConfirmation}</label>
              <input
                id="confirm-password"
                name="confirmation"
                type="password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                autoComplete="new-password"
                placeholder="••••••••"
                className="field"
                style={{ background: "var(--c-10)", marginBottom: 22 }}
              />

              <button type="submit" disabled={pending} className="btn btn--primary" style={{ width: "100%", justifyContent: "center", padding: 15 }}>
                {pending ? t.submitting : t.submit}
                {!pending && <span className="arrow">→</span>}
              </button>
            </form>
          ) : (
            <div className="auth-error" role="alert">{t.missingToken}</div>
          )}

          <p style={{ margin: "22px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "var(--c-50)" }}>{t.footnote}</p>
        </div>
      </div>
    </section>
  );
}
