"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { langues } from "@/content/data";
import { NAV, NAV_PRIMARY, NAV_DRAWER, route } from "@/lib/routes";

const Logo = ({ dark = false }: { dark?: boolean }) => (
  <span style={{ width: 30, height: 30, background: "var(--ac)", position: "relative", display: "inline-flex", flex: "0 0 auto" }}>
    <span style={{ position: "absolute", right: 5, bottom: 5, width: 11, height: 11, background: dark ? "var(--c-black)" : "#fff" }} />
  </span>
);

export function Header({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
    setLangOpen(false);
  }, [pathname]);

  const rest = pathname.replace(/^\/(fr|en)/, "");
  const localePath = (l: Lang) => `/${l}${rest || ""}`;
  const isActive = (slug: string) => pathname === route(lang, slug);

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50 }}>
      {/* Header bar */}
      <header className="blur-sm" style={{ background: "rgba(255,255,255,0.96)", borderBottom: "1px solid var(--c-20)", backdropFilter: "blur(6px)" }}>
        <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "var(--sa-t) max(var(--pad-x), var(--sa-r)) 0 max(var(--pad-x), var(--sa-l))", height: "calc(64px + var(--sa-t))", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
          <Link href={route(lang)} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo />
            <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: "0.02em" }}>UGPTAN</span>
          </Link>

          <nav className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {NAV_PRIMARY.map((item) => (
              <Link key={item.key} href={route(lang, item.slug)} style={{ padding: "9px 15px", fontSize: 14.5, fontWeight: 500, color: isActive(item.slug) ? "var(--ac)" : "var(--c-80)", borderBottom: `2px solid ${isActive(item.slug) ? "var(--ac)" : "transparent"}` }}>
                {t.nav[item.key]}
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setLangOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={langOpen} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 11px", border: "1px solid var(--c-20)", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--c-80)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {lang}
                <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
              </button>
              {langOpen && (
                <div role="listbox" style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", border: "1px solid var(--c-20)", boxShadow: "0 12px 40px rgba(0,0,0,0.13)", minWidth: 172, zIndex: 60 }}>
                  {langues.map((lg) => {
                    const active = lg.code === "fr" || lg.code === "en";
                    const inner = (
                      <span style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "11px 14px", fontSize: 13.5 }}>
                        {lg.label}
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--c-50)", textTransform: "uppercase" }}>{lg.code}</span>
                      </span>
                    );
                    return active ? (
                      <Link key={lg.code} href={localePath(lg.code as Lang)} style={{ display: "block", borderBottom: "1px solid var(--c-10)", color: "var(--c-black)" }}>{inner}</Link>
                    ) : (
                      <div key={lg.code} title="À venir" style={{ borderBottom: "1px solid var(--c-10)", color: "var(--c-40)", cursor: "default" }}>{inner}</div>
                    );
                  })}
                </div>
              )}
            </div>

            <Link href={route(lang, NAV.connexion)} className="btn btn--primary btn--sm hide-sm">
              {t.cta.connect}<span className="arrow">→</span>
            </Link>

            <button onClick={() => setNavOpen(true)} aria-label="Menu" className="nav-burger" style={{ alignItems: "center", gap: 10, padding: "10px 14px", border: "1px solid var(--c-black)", background: "var(--c-black)", color: "#fff", fontSize: 13.5, fontWeight: 600 }}>
              <span style={{ display: "inline-flex", flexDirection: "column", gap: 3 }}>
                {[0, 1, 2].map((i) => <span key={i} style={{ width: 16, height: 1.5, background: "#fff", display: "block" }} />)}
              </span>
              <span className="hide-xs">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Drawer */}
      {navOpen && (
        <>
          <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 210, background: "rgba(22,22,22,0.5)", animation: "ovF .2s both" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 211, width: "min(444px,100%)", background: "var(--c-black)", color: "#fff", display: "flex", flexDirection: "column", animation: "revSlideR .32s cubic-bezier(.16,1,.3,1) both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "calc(20px + var(--sa-t)) var(--pad-x) 20px", borderBottom: "1px solid var(--c-80)", flex: "0 0 auto" }}>
              <span className="mono" style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ac-light)" }}>Navigation</span>
              <button onClick={() => setNavOpen(false)} aria-label="Fermer" style={{ width: 40, height: 40, border: "1px solid var(--c-80)", color: "#fff", fontSize: 16, background: "var(--c-90)" }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              {NAV_DRAWER.map((item) => (
                <Link key={item.key} href={route(lang, item.slug)} onClick={() => setNavOpen(false)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "15px var(--pad-x)", fontSize: 16.5, fontWeight: 500, color: "#fff", borderBottom: "1px solid #232323" }}>
                  <span>{t.nav[item.key]}</span>
                  <span className="mono" style={{ fontSize: 13, color: "var(--c-70)" }}>→</span>
                </Link>
              ))}
            </div>
            <div style={{ flex: "0 0 auto", padding: "18px var(--pad-x) calc(18px + var(--sa-b))", borderTop: "1px solid var(--c-80)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                {(["fr", "en"] as Lang[]).map((l) => (
                  <Link key={l} href={localePath(l)} onClick={() => setNavOpen(false)} className="mono" style={{ flex: 1, minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--c-80)", background: lang === l ? "var(--ac)" : "transparent", color: lang === l ? "#fff" : "var(--c-30)", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</Link>
                ))}
              </div>
              <Link href={route(lang, NAV.connexion)} onClick={() => setNavOpen(false)} className="btn btn--primary" style={{ justifyContent: "center" }}>{t.cta.connect}<span className="arrow">→</span></Link>
              <Link href={route(lang, NAV.mgp)} onClick={() => setNavOpen(false)} className="btn btn--on-dark" style={{ justifyContent: "center" }}>{t.cta.mgp}</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
