"use client";

import { useEffect, useState, useTransition } from "react";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { mgpCategoryLabel } from "@/content/mgp";
import {
  GRIEVANCE_STAGES,
  STAGE_LABEL,
  STAGE_NEXT_STEP,
  STATUS_HINT,
  STATUS_LABEL,
  isClosingStatus,
  stageIndex,
} from "@/lib/mgp/model";
import { trackGrievance, type PublicCase } from "@/actions/mgp";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

/**
 * Suivi public d'une plainte par son numéro de référence.
 *
 * Ce composant n'affiche que ce que la server action lui envoie, et la server
 * action ne renvoie qu'une sélection close de champs (cf. actions/mgp.ts) : ni
 * récit, ni identité, ni coordonnées, ni note d'agent. Toute donnée nouvelle à
 * publier ici se décide donc côté serveur, jamais par ajout d'un affichage.
 *
 * `initialRef` permet à l'accusé de réception de renvoyer vers la page de suivi
 * avec le numéro déjà porté dans l'URL — la personne n'a rien à recopier.
 */
export function MgpTracker({ lang, initialRef = "" }: { lang: Lang; initialRef?: string }) {
  const t = dict(lang).mgp;
  const [ref, setRef] = useState(initialRef);
  const [result, setResult] = useState<PublicCase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const stages = GRIEVANCE_STAGES.map((stage) => pick(STAGE_LABEL[stage], lang));

  const lookup = (value: string) => {
    setError(null);
    startTransition(async () => {
      const answer = await trackGrievance(value, lang);
      if (answer.ok) { setResult(answer.case); setError(null); }
      else { setResult(null); setError(answer.error); }
    });
  };

  // Numéro déjà présent dans l'URL : la recherche part seule, sinon la personne
  // devrait cliquer sur un bouton alors qu'elle vient de suivre un lien.
  useEffect(() => {
    if (initialRef) lookup(initialRef);
    // Une seule fois, à l'arrivée sur la page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRef]);

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
      dateStyle: "long",
      timeZone: "Africa/Kinshasa",
    }).format(new Date(iso));

  const current = result ? stageIndex(result.stage) : 0;
  const nextStep = result && !isClosingStatus(result.status) ? STAGE_NEXT_STEP[result.stage] : null;

  return (
    <div style={{ background: "var(--c-black)", color: "#fff", padding: "clamp(26px,3vw,38px)" }}>
      <h2 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(20px,2.4vw,26px)", letterSpacing: "-0.02em" }}>{t.trackTitle}</h2>
      <p style={{ margin: "10px 0 0", fontSize: 13.5, color: "var(--c-40)", lineHeight: 1.55 }}>{t.trackLead}</p>

      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        {/* Le champ n'a pas d'étiquette visible : le titre du panneau en tient
            lieu à l'œil, mais pas pour un lecteur d'écran. */}
        <label htmlFor="mgp-ref" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" }}>{t.trackTitle}</label>
        <input
          id="mgp-ref"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup(ref)}
          placeholder="UGPTN-MGP-2026-…"
          spellCheck={false}
          autoComplete="off"
          className="field field--dark mono"
          style={{ flex: 1, minWidth: 0 }}
        />
        <button onClick={() => lookup(ref)} disabled={pending} className="btn btn--primary btn--sm" style={{ whiteSpace: "nowrap" }}>
          {pending ? t.tracking : t.track}
        </button>
      </div>

      {error && <div role="alert" style={{ marginTop: 16, fontSize: 13, lineHeight: 1.55, color: "#ffb3b8" }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 22, border: "1px solid var(--c-80)", padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span className="mono" style={{ fontSize: 12.5, color: "var(--ac-light)" }}>{result.reference}</span>
            {result.daysRemaining !== null && (
              <span style={{ fontSize: 12, color: result.daysRemaining < 0 ? "#ffb3b8" : "var(--c-40)" }}>
                {Math.abs(result.daysRemaining)} {result.daysRemaining < 0 ? t.overdue : t.daysRemaining}
              </span>
            )}
          </div>

          {/* État du dossier */}
          <div style={{ marginTop: 16, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
            <Field label={t.trackStatus} value={pick(STATUS_LABEL[result.status], lang)} strong />
            <Field label={t.trackStage} value={stages[current]} strong />
            <Field label={t.trackSubmitted} value={fmtDate(result.submittedAt)} />
            <Field
              label={result.closedAt ? t.trackClosed : t.trackDeadline}
              value={fmtDate(result.closedAt ?? result.dueAt)}
            />
          </div>

          <p style={{ margin: "14px 0 0", fontSize: 12.5, lineHeight: 1.6, color: "var(--c-40)" }}>
            {pick(STATUS_HINT[result.status], lang)}
          </p>

          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Tag>{pick(mgpCategoryLabel(result.categoryCode), lang)}</Tag>
            <Tag>{result.isAnonymous ? t.trackAnonymous : t.trackNamed}</Tag>
          </div>

          {/* Progression dans la pipeline */}
          <div style={{ marginTop: 18, height: 6, background: "var(--c-80)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.round(((current + 1) / stages.length) * 100)}%`, background: "var(--ac)" }} />
          </div>
          <RevealGroup style={{ marginTop: 16, display: "flex", flexDirection: "column" }} gap={0.045}>
            {stages.map((label, i) => {
              const done = i < current, cur = i === current;
              return (
                <RevealItem key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0" }}>
                  <span className="mono" style={{ width: 24, height: 24, flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, background: done ? "var(--ac)" : cur ? "var(--ac-pale)" : "#fff", color: done ? "#fff" : cur ? "var(--ac)" : "var(--c-50)", border: `1px solid ${cur ? "var(--ac)" : "var(--c-20)"}` }}>{done ? "✓" : cur ? "●" : i + 1}</span>
                  <span style={{ fontSize: 13, color: i <= current ? "#fff" : "var(--c-50)", fontWeight: cur ? 600 : 400 }}>{label}</span>
                </RevealItem>
              );
            })}
          </RevealGroup>

          {nextStep && (
            <div style={{ marginTop: 18, borderLeft: "2px solid var(--ac)", paddingLeft: 14 }}>
              <div className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ac-light)" }}>{t.trackNextStep}</div>
              <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.6, color: "var(--c-30)" }}>{pick(nextStep, lang)}</p>
            </div>
          )}

          {/* Messages adressés au plaignant */}
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--c-80)" }}>
            <div className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--c-60)", marginBottom: 12 }}>{t.trackUpdates}</div>
            {result.updates.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "var(--c-50)" }}>{t.trackNoUpdates}</p>
            ) : (
              <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {result.updates.map((update, i) => (
                  <li key={i} style={{ borderLeft: "1px solid var(--c-80)", paddingLeft: 14 }}>
                    <div className="mono" style={{ fontSize: 11, color: "var(--c-50)" }}>{fmtDate(update.at)}</div>
                    <p style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.6, color: "var(--c-30)", whiteSpace: "pre-wrap" }}>{update.message}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--c-80)" }}>
        <div className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--c-60)", marginBottom: 12 }}>{t.pipelineTitle}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {stages.map((s) => (
            <span key={s} className="mono" style={{ fontSize: 11, color: "var(--c-40)" }}>{s} <span style={{ color: "var(--ac-light)", marginLeft: 6 }}>›</span></span>
          ))}
        </div>
        <p style={{ margin: "16px 0 0", fontSize: 11.5, lineHeight: 1.6, color: "var(--c-50)" }}>{t.trackPrivacy}</p>
      </div>
    </div>
  );
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--c-60)" }}>{label}</div>
      <div style={{ marginTop: 5, fontSize: strong ? 15 : 13, fontWeight: strong ? 600 : 400, color: "#fff" }}>{value}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--c-30)", border: "1px solid var(--c-80)", padding: "5px 9px" }}>
      {children}
    </span>
  );
}
