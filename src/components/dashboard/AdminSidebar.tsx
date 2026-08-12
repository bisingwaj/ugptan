"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN, ADMIN_NAV_SECTIONS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import type { Permission } from "@/lib/auth/permissions";

/**
 * Barre latérale de la console : les modules groupés par section.
 *
 * `granted` arrive déjà calculé du serveur (cf. AdminShell) plutôt que d'être
 * dérivé ici : la règle d'autorisation ne doit exister qu'à un seul endroit, et
 * ce composant est du code client, donc consultable.
 *
 * Filtrer la barre est une commodité de lecture, pas une protection : chaque
 * page vérifie elle-même son droit d'accès (cf. lib/auth/guard.ts).
 */
export function AdminSidebar({ granted }: { granted: Permission[] }) {
  const pathname = usePathname();
  const allowed = new Set<string>(granted);

  const sections = ADMIN_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => allowed.has(item.key)),
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="adm__side">
      <div className="adm__brand">
        <span className="adm__mark" />
        <span>
          <span style={{ display: "block", fontWeight: 700, fontSize: 16 }}>{ADMIN.brand}</span>
          <span className="mono" style={{ display: "block", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-60)" }}>
            {ADMIN.shell.console}
          </span>
        </span>
      </div>

      <nav className="adm__nav" aria-label={ADMIN.console}>
        {sections.map((section) => (
          <div key={section.key} className="adm__nav-group">
            <div className="adm__nav-label">{section.label}</div>

            {section.items.map((item) => {
              // Les modules non implémentés ne sont pas des liens : pas de 404.
              if (!item.slug) {
                return (
                  <span key={item.key} className="adm__nav-item is-soon">
                    {item.label}
                    <span className="adm__soon">{ADMIN.shell.soon}</span>
                  </span>
                );
              }

              const href = adminPath(item.slug);
              // startsWith et non égalité : les sous-pages (édition d'un compte)
              // doivent garder leur module allumé.
              const active = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={item.key}
                  href={href}
                  className={`adm__nav-item${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
