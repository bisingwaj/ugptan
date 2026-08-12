"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/actions/admin-auth";
import { ADMIN } from "@/content/admin";
import { BIDDERS_PORTAL_URL } from "@/lib/external";

const initialState: LoginState = { error: null };

/**
 * Écran de connexion de la console : adresse électronique + mot de passe,
 * vérifiés par Better Auth (cf. actions/admin-auth.ts).
 *
 * Unique page publique du sous-arbre, et unique moyen d'entrer. Aucun lien
 * « créer un compte », aucun « mot de passe oublié » : les comptes naissent et
 * se réparent depuis le module « Utilisateurs », par un administrateur. C'est
 * l'exigence, pas un manque.
 */
export function AdminLoginForm({ next }: { next?: string | null }) {
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
            {/* Destination demandée avant le renvoi vers cet écran. Refiltrée
                côté serveur par `safeAdminRedirect` : ce champ est une commodité,
                jamais une autorisation. */}
            {next && <input type="hidden" name="next" value={next} />}

            <label className="label-mono" htmlFor="admin-email">{t.emailLabel}</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              spellCheck={false}
              placeholder="prenom.nom@ugptn.cd"
              className="field"
              style={{ background: "var(--c-10)", marginBottom: 18 }}
            />

            <label className="label-mono" htmlFor="admin-password">{t.passwordLabel}</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="field"
              style={{ background: "var(--c-10)", marginBottom: 22 }}
            />

            <button type="submit" disabled={pending} className="btn btn--primary" style={{ width: "100%", justifyContent: "center", padding: 15 }}>
              {pending ? t.submitting : t.submit}
              {!pending && <span className="arrow">→</span>}
            </button>
          </form>

          <p style={{ margin: "22px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "var(--c-50)" }}>{t.noSignup}</p>

          {/* Le portail des soumissionnaires est une plateforme tierce : lien
              sortant, jamais une route de ce site. */}
          {BIDDERS_PORTAL_URL && (
            <p style={{ margin: "14px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "var(--c-50)" }}>
              {t.biddersPrompt}{" "}
              <a
                href={BIDDERS_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer external"
                style={{ color: "var(--ac)", textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                {t.biddersLink} ↗
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
