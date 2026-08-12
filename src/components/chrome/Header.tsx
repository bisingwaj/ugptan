"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/pick";
import { cn } from "@/lib/cn";
import { dict } from "@/content/i18n";
import { langues } from "@/content/data";
import { NAV, NAV_PRIMARY, NAV_DRAWER, route } from "@/lib/routes";

const Logo = ({ dark = false }: { dark?: boolean }) => (
  <span className="relative inline-flex size-[30px] flex-none bg-ac">
    <span className={cn("absolute right-[5px] bottom-[5px] size-[11px]", dark ? "bg-c-black" : "bg-white")} />
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
    <div className="sticky top-0 z-50">
      {/* Header bar */}
      <header className="border-b border-c-20 bg-[rgba(255,255,255,0.96)] backdrop-blur-[6px] max-[760px]:backdrop-blur-none">
        {/* Les marges latérales composent le gabarit et la zone sûre : max() garde
            le contenu hors de l'encoche en paysage. */}
        <div className="mx-auto flex h-[calc(64px+var(--sa-t))] max-w-(--maxw) items-center justify-between gap-[18px] pt-(--sa-t) pr-[max(var(--pad-x),var(--sa-r))] pb-0 pl-[max(var(--pad-x),var(--sa-l))]">
          <Link href={route(lang)} className="flex items-center gap-3">
            <Logo />
            <span className="text-[19px] font-bold tracking-[0.02em]">UGPTN</span>
          </Link>

          <nav className="nav-desktop flex items-center gap-0.5">
            {NAV_PRIMARY.map((item) => (
              <Link
                key={item.key}
                href={route(lang, item.slug)}
                className={cn(
                  "border-b-2 px-[15px] py-[9px] text-[14.5px] font-medium",
                  isActive(item.slug) ? "border-ac text-ac" : "border-transparent text-c-80",
                )}
              >
                {t.nav[item.key]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                className="flex items-center gap-[7px] border border-c-20 px-[11px] py-2 font-mono text-[12px] uppercase tracking-[0.06em] text-c-80"
              >
                {lang}
                <span className="text-[9px] opacity-60">▼</span>
              </button>
              {langOpen && (
                <div
                  role="listbox"
                  className="absolute top-[calc(100%+6px)] right-0 z-[60] min-w-[172px] border border-c-20 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.13)]"
                >
                  {langues.map((lg) => {
                    const active = lg.code === "fr" || lg.code === "en";
                    const inner = (
                      <span className="flex w-full items-center justify-between gap-3 px-[14px] py-[11px] text-[13.5px]">
                        {lg.label}
                        <span className="font-mono text-[11px] uppercase text-c-50">{lg.code}</span>
                      </span>
                    );
                    return active ? (
                      <Link key={lg.code} href={localePath(lg.code as Lang)} className="block border-b border-c-10 text-c-black">{inner}</Link>
                    ) : (
                      <div key={lg.code} title="À venir" className="cursor-default border-b border-c-10 text-c-40">{inner}</div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* `.nav-burger` porte le display et sa bascule au-delà de 1120px. */}
            <button
              onClick={() => setNavOpen(true)}
              aria-label="Menu"
              className="nav-burger items-center gap-2.5 border border-c-black bg-c-black px-[14px] py-2.5 text-[13.5px] font-semibold text-white"
            >
              <span className="inline-flex flex-col gap-[3px]">
                {[0, 1, 2].map((i) => <span key={i} className="block h-[1.5px] w-4 bg-white" />)}
              </span>
              <span className="hide-xs">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Drawer */}
      {navOpen && (
        <>
          <div onClick={() => setNavOpen(false)} className="fixed inset-0 z-[210] animate-[ovF_.2s_both] bg-[rgba(22,22,22,0.5)]" />
          <div className="fixed top-0 right-0 bottom-0 z-[211] flex w-[min(444px,100%)] animate-[revSlideR_.32s_cubic-bezier(.16,1,.3,1)_both] flex-col bg-c-black text-white">
            <div className="flex flex-none items-center justify-between border-b border-c-80 px-(--pad-x) pt-[calc(20px+var(--sa-t))] pb-5">
              <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-ac-light">Navigation</span>
              <button onClick={() => setNavOpen(false)} aria-label="Fermer" className="size-10 border border-c-80 bg-c-90 text-[16px] text-white">✕</button>
            </div>
            <div className="flex-1 overflow-auto">
              {NAV_DRAWER.map((item) => (
                <Link
                  key={item.key}
                  href={route(lang, item.slug)}
                  onClick={() => setNavOpen(false)}
                  className="flex w-full items-center justify-between gap-3 border-b border-[#232323] px-(--pad-x) py-[15px] text-[16.5px] font-medium text-white"
                >
                  <span>{t.nav[item.key]}</span>
                  <span className="font-mono text-[13px] text-c-70">→</span>
                </Link>
              ))}
            </div>
            <div className="flex flex-none flex-col gap-2.5 border-t border-c-80 px-(--pad-x) pt-[18px] pb-[calc(18px+var(--sa-b))]">
              <div className="mb-1 flex gap-2">
                {(["fr", "en"] as Lang[]).map((l) => (
                  <Link
                    key={l}
                    href={localePath(l)}
                    onClick={() => setNavOpen(false)}
                    className={cn(
                      "flex min-h-12 flex-1 items-center justify-center border border-c-80 font-mono text-[14px] uppercase tracking-[0.08em]",
                      lang === l ? "bg-ac text-white" : "bg-transparent text-c-30",
                    )}
                  >
                    {l}
                  </Link>
                ))}
              </div>
              <Link href={route(lang, NAV.mgp)} onClick={() => setNavOpen(false)} className="btn btn--on-dark justify-center">{t.cta.mgp}</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
