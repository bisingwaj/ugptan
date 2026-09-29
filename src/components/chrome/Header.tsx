"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import type { Lang } from "@/lib/pick";
import { cn } from "@/lib/cn";
import { dict } from "@/content/i18n";
import { langues } from "@/content/data";
import { DIGIPROCURE_URL } from "@/lib/external";
import { NAV, NAV_TREE, NAV_DRAWER, isGroup, route, type NavKey } from "@/lib/routes";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { Marque } from "@/components/chrome/Marque";
import { Icon } from "@/components/ui/Icon";

/** Courbe unique du tiroir : sortie franche, arrivée posée. */
const EASE = [0.16, 1, 0.3, 1] as const;

/* Entrées de la barre desktop — liens et boutons de groupe partagent le même
   gabarit pour que le soulignement actif reste aligné d'une entrée à l'autre.
   Entre 1121 et 1280px, la barre doit loger six entrées, le sélecteur de langue
   et le bouton de connexion : les marges internes se resserrent d'autant. */
const navTop =
  "border-b-2 px-[13px] max-[1280px]:px-[9px] py-[9px] text-[14.5px] font-medium whitespace-nowrap";
const navTopOn = "border-ac text-ac";
const navTopOff = "border-transparent text-c-80";

export function Header({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const pathname = usePathname();
  const reduce = usePrefersReducedMotion();
  const [langOpen, setLangOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  /* Sous-menu desktop ouvert (clé du groupe), ou null. */
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setNavOpen(false);
    setLangOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  /* Tiroir ouvert : Échap le referme, et le focus part sur son bouton de
     fermeture. Sans ce déplacement, la tabulation continuerait dans la page
     masquée derrière le voile, que rien n'indique au clavier. */
  useEffect(() => {
    if (!navOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navOpen]);

  /** Ferme le tiroir en rendant le focus au bouton qui l'a ouvert. */
  const closeNav = () => {
    setNavOpen(false);
    burgerRef.current?.focus();
  };

  /* Un sous-menu ouvert au clavier ou au clic se referme sur Échap et sur un
     clic hors de la barre : le survol seul ne suffit pas à le rendre. */
  useEffect(() => {
    if (!openGroup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGroup(null);
    };
    const onDown = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenGroup(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [openGroup]);

  const rest = pathname.replace(/^\/(fr|en)/, "");
  const localePath = (l: Lang) => `/${l}${rest || ""}`;
  /* Correspondance par préfixe, et pas égalité stricte : sans elle, aucune page
     de détail n'éclaire l'entrée de menu dont elle relève. Les dix pages de
     composante, les articles, les événements, les albums et les publications
     laissaient donc la navigation entièrement éteinte. L'accueil garde
     l'égalité — son slug est vide, un préfixe correspondrait à tout. */
  const isActive = (slug: string) =>
    pathname === route(lang, slug) ||
    (slug !== "" && pathname.startsWith(`${route(lang, slug)}/`));
  /* Le libellé abrégé prime dans les sous-menus, sinon celui de la page. */
  const subLabel = (key: NavKey) => t.navSub[key] ?? t.nav[key];

  return (
    <div className="sticky top-0 z-50">
      {/* Header bar */}
      <header className="border-b border-c-20 bg-[rgba(255,255,255,0.96)] backdrop-blur-[6px] max-[760px]:backdrop-blur-none">
        {/* Les marges latérales composent le gabarit et la zone sûre : max() garde
            le contenu hors de l'encoche en paysage. */}
        <div className="mx-auto flex h-[calc(64px+var(--sa-t))] max-w-(--maxw) items-center justify-between gap-[18px] pt-(--sa-t) pr-[max(var(--pad-x),var(--sa-r))] pb-0 pl-[max(var(--pad-x),var(--sa-l))]">
          <Link href={route(lang)} className="flex items-center" aria-label={`UGPTN — ${t.nav.accueil}`}>
            {/* Le mot-symbole seul : dans une barre de 64 px, la carte du logo
                complet ne rendait plus qu'un fouillis de traits. Le lien porte
                déjà le nom, l'image reste donc décorative. */}
            <Marque variante="mot" hauteur={26} alt="" priority />
          </Link>

          <nav ref={navRef} className="nav-desktop flex items-center gap-0.5" aria-label={t.words.navigation}>
            {NAV_TREE.map((node) => {
              if (!isGroup(node)) {
                return (
                  <Link
                    key={node.key}
                    href={route(lang, node.slug)}
                    className={cn(navTop, isActive(node.slug) ? navTopOn : navTopOff)}
                  >
                    {t.nav[node.key]}
                  </Link>
                );
              }
              const open = openGroup === node.key;
              const groupActive = node.children.some((c) => isActive(c.slug));
              return (
                <div
                  key={node.key}
                  className="relative"
                  onMouseEnter={() => setOpenGroup(node.key)}
                  onMouseLeave={() => setOpenGroup(null)}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={open}
                    onClick={() => setOpenGroup(open ? null : node.key)}
                    className={cn(
                      navTop,
                      "inline-flex items-center gap-[6px]",
                      groupActive || open ? navTopOn : navTopOff,
                    )}
                  >
                    {t.nav[node.labelKey]}
                    <span
                      aria-hidden
                      className={cn("text-[8px] opacity-60 transition-transform duration-200", open && "rotate-180")}
                    >
                      ▼
                    </span>
                  </button>
                  {/* Le panneau reste dans le DOM et bascule en visibilité :
                      les liens sont ainsi explorables par les moteurs, tout en
                      restant hors du parcours de tabulation une fois fermés. */}
                  <div
                    className={cn(
                      "absolute top-full left-0 z-[60] w-[336px] border border-c-20 bg-white shadow-[0_16px_44px_rgba(0,0,0,0.13)]",
                      "transition-[opacity,transform,visibility] duration-200 ease-out",
                      open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-[6px] opacity-0",
                    )}
                  >
                    {node.children.map((child) => (
                      <Link
                        key={child.key}
                        href={route(lang, child.slug)}
                        onClick={() => setOpenGroup(null)}
                        aria-current={isActive(child.slug) ? "page" : undefined}
                        className={cn(
                          "group block border-b border-c-10 px-[18px] py-[13px] last:border-b-0",
                          isActive(child.slug) ? "bg-ac-pale" : "hover:bg-c-10",
                        )}
                      >
                        <span
                          className={cn(
                            "flex items-center justify-between gap-3 text-[14.5px] font-semibold",
                            isActive(child.slug) ? "text-ac" : "text-c-black",
                          )}
                        >
                          {subLabel(child.key)}
                          <span className="font-mono text-[12px] text-c-40 transition-transform duration-200 group-hover:translate-x-[3px]">
                            →
                          </span>
                        </span>
                        {t.navDesc[child.key] && (
                          <span className="mt-[5px] block text-[12.5px] leading-[1.45] text-c-60">
                            {t.navDesc[child.key]}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Porte de la recherche globale.
                Une ICÔNE et non un champ : entre 1121 et 1280px la barre loge
                déjà six entrées, le sélecteur de langue et le bouton
                DigiProcure, et un champ déplié y aurait chassé une entrée de
                menu. La page qui s'ouvre, elle, porte un vrai champ, au premier
                plan et déjà focalisé.
                `nav-desktop` comme la navigation : en deçà de 1120px, la porte
                vit dans le tiroir, en tête de liste. */}
            <Link
              href={route(lang, NAV.recherche)}
              title={t.recherche.titre}
              aria-label={t.recherche.ariaLien}
              aria-current={isActive(NAV.recherche) ? "page" : undefined}
              className={cn(
                "nav-desktop min-h-11 min-w-11 items-center justify-center border transition-colors duration-200",
                isActive(NAV.recherche)
                  ? "border-ac text-ac"
                  : "border-c-20 text-c-80 hover:border-c-40",
              )}
            >
              <Icon name="recherche" size={18} />
            </Link>

            <div className="relative">
              {/* `min-h-11` : 44px, plancher tactile. Le bouton n'est pas un
                  `.btn` et n'héritait donc d'aucune hauteur minimale — il
                  mesurait 32px sur téléphone, sous le seuil confortable. */}
              <button
                onClick={() => setLangOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                className="flex min-h-11 items-center gap-[7px] border border-c-20 px-[11px] py-2 font-mono text-[12px] uppercase tracking-[0.06em] text-c-80 transition-colors duration-200 hover:border-c-40 max-[1120px]:min-w-11 max-[1120px]:justify-center"
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

            {/* Entrée DigiProcure : la plateforme de passation et
                d'approvisionnement du projet, hébergée hors de notre périmètre
                avec ses propres comptes (cf. lib/external.ts). La console
                d'administration de l'UGPTN, elle, n'est liée nulle part.
                Réservé au desktop comme la navigation principale : en deçà de
                1120px, le lien vit dans le tiroir.

                `aria-label` porte la phrase entière : « DigiProcure » seul est
                un nom propre, il ne dit pas où mène le lien à qui l'entend sans
                le voir. */}
            {DIGIPROCURE_URL && (
              <a
                href={DIGIPROCURE_URL}
                target="_blank"
                rel="noopener noreferrer external"
                title={t.cta.loginHint}
                aria-label={t.cta.loginHint}
                className="nav-desktop items-center gap-2 border border-ac bg-ac px-[14px] py-2.5 text-[13.5px] font-semibold text-white transition-colors duration-200 hover:border-acd hover:bg-acd"
              >
                {t.cta.login}
                <span className="font-mono text-[11px] opacity-70">↗</span>
              </a>
            )}

            {/* `.nav-burger` porte le display et sa bascule au-delà de 1120px.
                Hauteur et largeur minimales de 44px : réduit à son icône sous
                420px, le bouton devenait une cible de 30px de haut. */}
            <button
              ref={burgerRef}
              onClick={() => setNavOpen(true)}
              aria-label="Menu"
              aria-expanded={navOpen}
              aria-controls="tiroir-navigation"
              className="nav-burger min-h-11 min-w-11 items-center justify-center gap-2.5 border border-c-black bg-c-black px-[14px] py-2.5 text-[13.5px] font-semibold text-white transition-colors duration-200 hover:bg-c-90"
            >
              <span className="inline-flex flex-col gap-[3px]">
                {[0, 1, 2].map((i) => <span key={i} className="block h-[1.5px] w-4 bg-white" />)}
              </span>
              <span className="hide-xs">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tiroir — il reprend le motif d'overlay du projet : la classe `.scrim`
          est ce que guette SmoothScroll pour arrêter Lenis et verrouiller le
          fond, faute de quoi le geste de défilement part dans la page derrière
          au lieu de la liste.

          L'ouverture ET la fermeture sont animées, par `AnimatePresence` : le
          tiroir reste monté le temps de sortir. La version précédente n'animait
          que l'entrée, et disparaissait d'un coup au clic — c'est cette rupture
          qui donnait au menu son aspect brusque sur téléphone.

          `.scrim--managed` coupe l'animation CSS du voile : elle ferait doublon
          avec celle de framer-motion et l'empêcherait de sortir en fondu. */}
      <AnimatePresence>
        {navOpen && (
          <m.div
            className="scrim scrim--right scrim--managed"
            onClick={closeNav}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.12 : 0.26, ease: "easeOut" }}
          >
            <m.div
              id="tiroir-navigation"
              role="dialog"
              aria-modal="true"
              aria-label={t.words.navigation}
              onClick={(e) => e.stopPropagation()}
              /* Glissement latéral sur les appareils qui l'acceptent, simple
                 fondu quand la personne a demandé moins d'animations. */
              initial={reduce ? { opacity: 0 } : { x: "100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }}
              transition={{ duration: reduce ? 0.12 : 0.42, ease: EASE }}
              className="flex h-full w-[min(444px,100%)] flex-col bg-c-black text-white shadow-[-24px_0_60px_rgba(0,0,0,0.35)]"
            >
              <div className="flex flex-none items-center justify-between border-b border-c-80 px-(--pad-x) pt-[calc(20px+var(--sa-t))] pb-5">
                <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-ac-light">Navigation</span>
                <button
                  ref={closeRef}
                  onClick={closeNav}
                  aria-label="Fermer"
                  className="size-11 border border-c-80 bg-c-90 text-[16px] text-white transition-colors duration-200 hover:border-white"
                >
                  ✕
                </button>
              </div>
              {/* Le tiroir reprend l'arbre desktop : les groupes deviennent des
                  sections déroulées, sans clic supplémentaire pour atteindre une
                  page. Les cibles gardent une hauteur tactile confortable, et les
                  intitulés de section restent des div — le tiroir n'a pas à
                  injecter de titres dans le plan sémantique de la page. */}
              {/* `min-h-0` est indispensable : sans lui, un élément flexible garde
                  `min-height: auto` et refuse de se contracter sous la hauteur de
                  son contenu — la liste déborde du tiroir au lieu de défiler. */}
              <nav
                aria-label={t.words.navigation}
                data-lenis-prevent
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
              >
                {/* La recherche ouvre le tiroir, détachée de l'arbre : elle
                    n'est pas une section du site mais la façon d'en traverser
                    toutes les sections. Sur téléphone, c'est sa seule porte —
                    l'icône de la barre est réservée au desktop. */}
                <Link
                  href={route(lang, NAV.recherche)}
                  onClick={() => setNavOpen(false)}
                  aria-current={isActive(NAV.recherche) ? "page" : undefined}
                  className={cn(
                    "group flex w-full items-center justify-between gap-3 border-b border-[#232323] px-(--pad-x) py-[15px] text-[16.5px] font-medium",
                    "transition-colors duration-200 hover:bg-c-90 active:bg-c-90",
                    isActive(NAV.recherche) ? "text-ac-light" : "text-white",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon name="recherche" size={18} />
                    {t.recherche.titre}
                  </span>
                  <span className="font-mono text-[13px] text-c-70 transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
                </Link>

                {NAV_DRAWER.map((node) =>
                  !isGroup(node) ? (
                    <Link
                      key={node.key}
                      href={route(lang, node.slug)}
                      onClick={() => setNavOpen(false)}
                      aria-current={isActive(node.slug) ? "page" : undefined}
                      className={cn(
                        "group flex w-full items-center justify-between gap-3 border-b border-[#232323] px-(--pad-x) py-[15px] text-[16.5px] font-medium",
                        "transition-colors duration-200 hover:bg-c-90 active:bg-c-90",
                        isActive(node.slug) ? "text-ac-light" : "text-white",
                      )}
                    >
                      <span>{t.nav[node.key]}</span>
                      <span className="font-mono text-[13px] text-c-70 transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
                    </Link>
                  ) : (
                    <section key={node.key} aria-label={t.nav[node.labelKey]} className="border-b border-[#232323]">
                      <div className="px-(--pad-x) pt-[18px] pb-[6px] font-mono text-[11px] uppercase tracking-[0.12em] text-c-60">
                        {t.nav[node.labelKey]}
                      </div>
                      {node.children.map((child) => (
                        <Link
                          key={child.key}
                          href={route(lang, child.slug)}
                          onClick={() => setNavOpen(false)}
                          aria-current={isActive(child.slug) ? "page" : undefined}
                          className={cn(
                            "group flex w-full items-center justify-between gap-3 px-(--pad-x) py-[13px] text-[16.5px] font-medium",
                            "transition-colors duration-200 hover:bg-c-90 active:bg-c-90",
                            isActive(child.slug) ? "text-ac-light" : "text-white",
                          )}
                        >
                          <span>{subLabel(child.key)}</span>
                          <span className="font-mono text-[13px] text-c-70 transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
                        </Link>
                      ))}
                      <div className="h-[10px]" />
                    </section>
                  ),
                )}
              </nav>
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
                {DIGIPROCURE_URL && (
                  <a
                    href={DIGIPROCURE_URL}
                    target="_blank"
                    rel="noopener noreferrer external"
                    onClick={() => setNavOpen(false)}
                    aria-label={t.cta.loginHint}
                    className="btn btn--primary justify-center"
                  >
                    {t.cta.login}
                    <span className="arrow">↗</span>
                  </a>
                )}
                {/* Sur mobile il n'y a pas de survol : sans cette ligne, le
                    nom seul n'apprend rien à qui ne connaît pas encore la
                    plateforme. */}
                {DIGIPROCURE_URL && (
                  <p className="-mt-1 text-center text-[12px] leading-[1.45] text-c-40">
                    {t.cta.loginNote}
                  </p>
                )}
                <Link href={route(lang, NAV.mgp)} onClick={() => setNavOpen(false)} className="btn btn--on-dark justify-center">{t.cta.mgp}</Link>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
