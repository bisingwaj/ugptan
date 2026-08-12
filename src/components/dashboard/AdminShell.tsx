import { ADMIN } from "@/content/admin";
import type { AdminUser } from "@/lib/auth/guard";
import { grantedPermissions, ROLE_LABEL } from "@/lib/auth/permissions";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

/** Coquille des écrans authentifiés : barre latérale des modules + barre haute. */
export function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  // Calculé côté serveur : la règle d'autorisation ne descend jamais au client.
  const granted = grantedPermissions(user);

  return (
    <div className="adm">
      <AdminSidebar granted={granted} />
      <div className="adm__main">
        <header className="adm__top">
          <span style={{ minWidth: 0 }}>
            <span className="mono" style={{ display: "block", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-50)" }}>
              {ADMIN.shell.signedInAs} · {ROLE_LABEL[user.role]}
            </span>
            <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13.5 }}>
              {user.name ?? user.email}
            </span>
          </span>
          <LogoutButton />
        </header>
        <main className="adm__body">{children}</main>
      </div>
    </div>
  );
}
