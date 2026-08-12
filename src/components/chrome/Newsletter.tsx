"use client";

import { useState } from "react";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";

export function Newsletter({ lang }: { lang: Lang }) {
  const t = dict(lang).nl;
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="section--dark px-(--pad-x) py-[clamp(56px,7vw,96px)]">
      <div className="cols2 cols2--center mx-auto max-w-(--maxw) gap-[clamp(28px,5vw,64px)]">
        <div>
          <div className="kicker kicker--light">{t.label}</div>
          <h2 className="h2--sm mb-3">{t.title}</h2>
          <p className="max-w-[480px] text-[15.5px] leading-[1.6] text-c-40">{t.lead}</p>
        </div>
        <div>
          {!done ? (
            <>
              {/* `.stack-sm` bascule le formulaire en colonne pleine largeur ≤ 760px. */}
              <form
                onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setDone(true); }}
                className="stack-sm flex flex-wrap gap-2.5"
              >
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholder}
                  aria-label={t.label}
                  className="field field--dark min-w-[200px] flex-1 px-4 py-[15px] text-[15px]"
                />
                <button type="submit" className="btn btn--primary whitespace-nowrap">{t.btn}<span className="arrow">→</span></button>
              </form>
              <p className="mt-3.5 font-mono text-[11px] text-c-60">
                {lang === "en" ? "No spam · one-click unsubscribe." : "Pas de spam · désinscription en un clic."}
              </p>
            </>
          ) : (
            <div className="flex animate-[revFade_.3s_both] items-center gap-3.5 border border-[#0e6027] bg-[#0a2e16] px-[22px] py-5">
              <span className="flex size-[38px] flex-none items-center justify-center bg-green-soft text-[18px] text-c-black">✓</span>
              <div>
                <div className="text-[16px] font-semibold text-white">{t.doneTitle}</div>
                <div className="mt-1 text-[13.5px] text-c-40">{t.doneText}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
