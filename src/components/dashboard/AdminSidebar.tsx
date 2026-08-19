"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN, ADMIN_NAV_SECTIONS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import type { Permission } from "@/lib/auth/permissions";
import { AdminIcon } from "@/components/dashboard/AdminIcon";
import { Marque } from "@/components/chrome/Marque";

/** Chevron de la bascule. Dessiné ici : c'est de la chrome, pas un module. */
const Chevron = ({ pointsRight }: { pointsRight: boolean }) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="butt"
    strokeLinejoin="miter"
    aria-hidden
    focusable="false"
  >
    <path d={pointsRight ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} />
  </svg>
);

/**
 * Barre latérale de la console : modules groupés par section, repliable en rail
 * d'icônes par le bouton du pied.
 *
 * `granted` arrive déjà calculé du serveur (cf. AdminShell) plutôt que d'être
 * dérivé ici : la règle d'autorisation ne doit exister qu'à un seul endroit, et
 * ce composant est du code client, donc consultable.
 *
 * Filtrer la barre est une commodité de lecture, pas une protection : chaque
 * page vérifie elle-même son droit d'accès (cf. lib/auth/guard.ts).
 *
 * ⚠️ Repliée, la barre masque les libellés à l'œil mais les LAISSE dans le
 * document (classe `.adm__nav-text`, escamotée en CSS). Les remplacer par des
 * icônes nues priverait les lecteurs d'écran du nom des modules.
 */
export function AdminSidebar({
  granted,
  collapsed,
  onToggle,
  footer,
}: {
  granted: Permission[];
  collapsed: boolean;
  onToggle: () => void;
  /** Actions de pied de barre — la déconnexion, servie du serveur. */
  footer?: ReactNode;
}) {
  const pathname = usePathname();
  const allowed = new Set<string>(granted);

  const sections = ADMIN_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => allowed.has(item.key)),
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="adm__side">
      <div className="adm__brand">
        {/* Le rail replié ne laisse que 62 px : seul le signe y tient, et le
           « UGPTN » voisin nomme déjà la marque. */}
        <Marque variante="signe" hauteur={26} alt="" className="adm__mark" />
        <span className="adm__nav-text">
          <span style={{ display: "block", fontWeight: 700, fontSize: 16 }}>{ADMIN.brand}</span>
          <span className="mono" style={{ display: "block", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-60)" }}>
            {ADMIN.shell.console}
          </span>
        </span>
      </div>

      <nav className="adm__nav" aria-label={ADMIN.console}>
        {sections.map((section) => (
          // `role="group"` + `aria-label` : le regroupement reste annoncé même
          // quand le libellé visible disparaît en mode rail.
          <div key={section.key} className="adm__nav-group" role="group" aria-label={section.label}>
            <div className="adm__nav-label" aria-hidden>{section.label}</div>

            {section.items.map((item) => {
              const content = (
                <>
                  <span className="adm__nav-ico"><AdminIcon name={item.key} /></span>
                  <span className="adm__nav-text">{item.label}</span>
                </>
              );

              // Les modules non implémentés ne sont pas des liens : pas de 404.
              if (!item.slug) {
                return (
                  <span key={item.key} className="adm__nav-item is-soon" title={`${item.label} · ${ADMIN.shell.soon}`}>
                    {content}
                    <span className="adm__soon">{ADMIN.shell.soon}</span>
                  </span>
                );
              }

              const href = adminPath(item.slug);
              // startsWith et non égalité : les sous-pages (édition d'un compte)
              // doivent garder leur module allumé.
              const active = pathname === href || pathname.startsWith(`${href}/`);

              const lien = (
                <Link
                  key={item.key}
                  href={href}
                  // Seule infobulle disponible une fois la barre repliée.
                  title={item.label}
                  className={`adm__nav-item${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {content}
                </Link>
              );

              if (!item.children || !active) return lien;

              /* Les écrans du module ne se déplient que lorsqu'on y est : les
                 montrer en permanence allongerait la barre de moitié pour une
                 information dont on n'a besoin qu'une fois entré. La sous-barre
                 en tête d'écran les redit de toute façon (cf. ProjetSubNav). */
              return (
                <div key={item.key}>
                  {lien}
                  <div className="adm__nav-sub" role="group" aria-label={item.label}>
                    {item.children.map((enfant) => {
                      const enfantHref = adminPath(enfant.slug);
                      /* Égalité stricte pour le PREMIER écran, dont le chemin
                         est celui du module : sans cela « La page du Projet »
                         resterait allumée depuis les composantes, qui vivent
                         sous son propre chemin. */
                      const enfantActif =
                        enfantHref === href
                          ? pathname === href
                          : pathname === enfantHref || pathname.startsWith(`${enfantHref}/`);

                      return (
                        <Link
                          key={enfant.slug}
                          href={enfantHref}
                          title={enfant.label}
                          className={`adm__nav-subitem${enfantActif ? " is-active" : ""}`}
                          aria-current={enfantActif ? "page" : undefined}
                        >
                          <span className="adm__nav-text">{enfant.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="adm__side-foot">
        {footer}
        <button
          type="button"
          onClick={onToggle}
          className="adm__collapse"
          aria-expanded={!collapsed}
          title={collapsed ? ADMIN.shell.expand : ADMIN.shell.collapse}
        >
          <span className="adm__nav-ico"><Chevron pointsRight={collapsed} /></span>
          {/* Le libellé s'escamote avec les autres, mais reste annoncé : sans
              lui, le bouton n'aurait plus de nom accessible en mode rail. */}
          <span className="adm__nav-text">
            {collapsed ? ADMIN.shell.expand : ADMIN.shell.collapse}
          </span>
        </button>
      </div>
    </aside>
  );
}
