import { ADMIN } from "@/content/admin";
import type { SessionPayload } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

/** Coquille des écrans authentifiés : barre latérale des modules + barre haute. */
export function AdminShell({ session, children }: { session: SessionPayload; children: React.ReactNode }) {
  return (
    <div className="adm">
      <AdminSidebar />
      <div className="adm__main">
        <header className="adm__top">
          <span className="mono" style={{ fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-40)" }}>
            {ADMIN.shell.signedInAs} · {session.sub}
          </span>
          <LogoutButton />
        </header>
        <main className="adm__body">{children}</main>
      </div>
    </div>
  );
}
