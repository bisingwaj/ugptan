"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN, ADMIN_NAV } from "@/content/admin";
import { adminPath } from "@/lib/admin";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="adm__side">
      <div className="adm__brand">
        <span className="adm__mark" />
        <span>
          <span style={{ display: "block", fontWeight: 700, fontSize: 16 }}>{ADMIN.brand}</span>
          <span className="mono" style={{ display: "block", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-60)" }}>
            Console
          </span>
        </span>
      </div>

      <nav className="adm__nav">
        {ADMIN_NAV.map((item) => {
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
          const active = pathname === href;
          return (
            <Link key={item.key} href={href} className={`adm__nav-item${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
