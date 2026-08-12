"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { mgpCategories } from "@/content/mgp";
import { NAV, route } from "@/lib/routes";
import { LIMITS } from "@/lib/mgp/model";
import { submitGrievance } from "@/actions/mgp";

type Contact = { fullName: string; email: string; tel: string; prov: string };

const EMPTY_CONTACT: Contact = { fullName: "", email: "", tel: "", prov: "" };

/**
 * Formulaire de dépôt d'une plainte, en cinq étapes.
 *
 * L'anonymat se décide au seul champ « Nom complet » (étape 4), affiché en
 * permanence et toujours facultatif : laissé vide, le dossier est enregistré
 * comme anonyme. Les coordonnées sont un autre sujet — on peut vouloir être
 * recontacté sans se nommer, et l'écran le dit explicitement à la personne
 * avant l'envoi.
 *
 * L'envoi passe par une server action qui revalide TOUT (cf. actions/mgp.ts) :
 * les contrôles ci-dessous sont du confort de saisie, pas une garantie.
 */
export function MgpForm({ lang }: { lang: Lang }) {
  const t = dict(lang).mgp;
  const [step, setStep] = useState(1);
  const [cat, setCat] = useState("");
  const [msg, setMsg] = useState("");
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [ref, setRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const catLabel = pick(mgpCategories.find((c) => c.code === cat), lang);
  const canNext = step === 1 ? !!cat : step === 2 ? msg.trim().length >= LIMITS.descriptionMin : true;
  const named = contact.fullName.trim().length > 0;
  const reachable = `${contact.email} ${contact.tel}`.trim();

  const reset = () => {
    setRef(null); setStep(1); setCat(""); setMsg(""); setFiles([]);
    setContact(EMPTY_CONTACT); setError(null); setCopied(false);
  };

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await submitGrievance({
        category: cat,
        description: msg,
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.tel,
        province: contact.prov,
        lang,
        attachments: files,
      });
      if (result.ok) setRef(result.reference);
      else setError(result.error);
    });
  };

  const copyRef = async () => {
    if (!ref) return;
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
    } catch {
      // Presse-papiers refusé (contexte non sécurisé, permission) : le numéro
      // reste sélectionnable à l'écran, il n'y a rien à signaler de plus.
    }
  };

  if (ref) {
    return (
      <div style={{ background: "#fff", padding: "clamp(26px,3vw,38px)" }}>
        <h2 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(20px,2.4vw,26px)", letterSpacing: "-0.02em" }}>{t.formTitle}</h2>
        <div style={{ marginTop: 22, border: "1px solid var(--ok-bd)", background: "var(--ok-bg)", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ok-fg)" }}><span style={{ fontSize: 17 }}>✓</span><span style={{ fontWeight: 600, fontSize: 16 }}>{t.submittedTitle}</span></div>
          <p style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.6 }}>{t.refIntro}</p>
          <div className="mono" style={{ fontWeight: 600, fontSize: 18, color: "var(--ac)", marginTop: 8, background: "#fff", border: "1px dashed var(--ac)", padding: 14, textAlign: "center", wordBreak: "break-all" }}>{ref}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            <button type="button" onClick={copyRef} className="btn btn--outline btn--sm">{copied ? `✓ ${t.refCopied}` : t.refCopy}</button>
            <Link href={`${route(lang, NAV.mgpSuivi)}?ref=${encodeURIComponent(ref)}`} className="btn btn--primary btn--sm">
              {t.refTrackCta} <span className="arrow">→</span>
            </Link>
          </div>
          <p style={{ margin: "14px 0 0", fontSize: 12.5, color: "var(--c-70)", lineHeight: 1.6 }}>{t.refKeep}</p>
          <button onClick={reset} className="mono" style={{ marginTop: 18, fontSize: 13, fontWeight: 600, color: "var(--ac)" }}>↺ {t.newGrievance}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", padding: "clamp(26px,3vw,38px)" }}>
      <h2 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(20px,2.4vw,26px)", letterSpacing: "-0.02em" }}>{t.formTitle}</h2>

      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "center", marginTop: 22 }}>
        {t.stepLabels.map((_, i) => {
          const n = i + 1;
          const done = step > n, active = step === n;
          return (
            <div key={i} style={{ display: "contents" }}>
              {i > 0 && <div style={{ flex: 1, height: 2, minWidth: 10, background: done ? "var(--c-black)" : active ? "var(--ac)" : "var(--c-20)" }} />}
              <div className="mono" style={{ width: 34, height: 34, flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, background: active ? "var(--ac)" : done ? "var(--c-black)" : "#fff", color: active || done ? "#fff" : "var(--c-50)", border: `1.5px solid ${active ? "var(--ac)" : done ? "var(--c-black)" : "var(--c-30)"}` }}>{done ? "✓" : n}</div>
            </div>
          );
        })}
      </div>
      <div className="mono" style={{ fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--ac)", marginTop: 14 }}>{t.step} {step} / 5 — {t.stepLabels[step - 1]}</div>

      <div style={{ marginTop: 24, minHeight: 184 }}>
        {step === 1 && (
          <>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 14 }}>{t.chooseCat}</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {mgpCategories.map((c) => (
                <button key={c.code} type="button" onClick={() => setCat(c.code)} className={cat === c.code ? "chip chip--on" : "chip"} style={{ fontSize: 13.5, padding: "11px 17px" }}>{pick(c, lang)}</button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <label htmlFor="mgp-desc" style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{t.describe}</label>
            <textarea id="mgp-desc" value={msg} maxLength={LIMITS.description} onChange={(e) => setMsg(e.target.value)} placeholder={t.describePlaceholder} className="field" style={{ minHeight: 150, resize: "vertical", lineHeight: 1.6 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 12, color: "var(--ac)" }}><span className="mono">✓</span>{t.category} : <strong>{catLabel}</strong></div>
          </>
        )}
        {step === 3 && (
          <>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.addFiles} <span style={{ fontWeight: 400, color: "var(--c-50)" }}>{t.optional}</span></label>
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12, padding: 28, border: "1px dashed #a8b4d0", background: "#f4f7ff", cursor: "pointer", textAlign: "center" }}>
              <span style={{ fontSize: 24 }}>📎</span>
              <span style={{ fontSize: 13, color: "var(--c-70)" }}>{t.dropHint}</span>
              <input type="file" multiple onChange={(e) => setFiles((f) => f.concat([...(e.target.files || [])].map((x) => ({ name: x.name, size: Math.max(1, Math.round(x.size / 1024)) }))).slice(0, LIMITS.attachments))} style={{ display: "none" }} />
            </label>
            {files.length > 0 && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "var(--c-10)", border: "1px solid var(--c-20)" }}>
                    <span style={{ fontSize: 15 }}>📄</span>
                    <span style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--c-50)" }}>{f.size} Ko</span>
                    <button type="button" onClick={() => setFiles((fs) => fs.filter((_, idx) => idx !== i))} style={{ color: "var(--red)", fontSize: 14 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {step === 4 && (
          <>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.contactStep}</label>
            <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "var(--c-50)", lineHeight: 1.5 }}>{t.contactNote}</p>

            <label htmlFor="mgp-name" className="mono" style={{ display: "block", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--c-50)", marginBottom: 6 }}>
              {t.fullName} <span style={{ textTransform: "none", letterSpacing: 0 }}>{t.optional}</span>
            </label>
            <input id="mgp-name" value={contact.fullName} maxLength={LIMITS.fullName} onChange={(e) => setContact({ ...contact, fullName: e.target.value })} placeholder={t.fullName} autoComplete="name" className="field" />
            <p style={{ margin: "8px 0 16px", fontSize: 12, lineHeight: 1.5, color: named ? "var(--ok-fg)" : "var(--c-60)" }}>
              {named ? t.namedBadge : t.anonymousBadge}
            </p>

            <input value={contact.email} maxLength={LIMITS.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder={t.email} type="email" autoComplete="email" className="field" style={{ marginBottom: 10 }} />
            <input value={contact.tel} maxLength={LIMITS.phone} onChange={(e) => setContact({ ...contact, tel: e.target.value })} placeholder={t.phone} type="tel" autoComplete="tel" className="field" style={{ marginBottom: 10 }} />
            <input value={contact.prov} maxLength={LIMITS.province} onChange={(e) => setContact({ ...contact, prov: e.target.value })} placeholder={t.province} className="field" />
          </>
        )}
        {step === 5 && (
          <>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 14 }}>{t.reviewSubmit}</label>
            <div style={{ border: "1px solid var(--c-20)" }}>
              <Row k={t.category} v={catLabel} />
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--c-20)" }}><div style={{ fontSize: 12.5, color: "var(--c-50)", marginBottom: 6 }}>{t.description}</div><div style={{ fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{msg}</div></div>
              <Row k={t.attachments} v={String(files.length)} />
              <Row k={t.identity} v={named ? contact.fullName.trim() : t.anonymous} />
              <Row k={t.contact} v={reachable || t.notProvided} last />
            </div>
          </>
        )}
      </div>

      {error && (
        <div role="alert" style={{ marginTop: 18, border: "1px solid var(--red)", borderLeft: "3px solid var(--red)", background: "#fff1f1", color: "#a2191f", padding: "12px 14px", fontSize: 13, lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        {step > 1 && <button onClick={() => setStep((s) => s - 1)} disabled={pending} className="btn btn--outline">← {t.prev}</button>}
        {step < 5 ? (
          <button onClick={() => canNext && setStep((s) => s + 1)} className="btn" style={{ flex: 1, justifyContent: "center", background: canNext ? "var(--ac)" : "var(--c-30)", color: "#fff" }}>{t.next} <span className="arrow">→</span></button>
        ) : (
          <button onClick={submit} disabled={pending} className="btn btn--primary" style={{ flex: 1, justifyContent: "center" }}>
            {pending ? t.submitting : t.submitGrievance}
            {!pending && <span className="arrow">→</span>}
          </button>
        )}
      </div>
      <p style={{ margin: "14px 0 0", fontSize: 11.5, color: "var(--c-50)", lineHeight: 1.5 }}>{t.formFootnote}</p>
    </div>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "14px 16px", borderBottom: last ? "none" : "1px solid var(--c-20)" }}>
      <span style={{ fontSize: 12.5, color: "var(--c-50)" }}>{k}</span>
      <span style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
}
