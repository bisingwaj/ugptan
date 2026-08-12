import { cookies } from "next/headers";
import { ADMIN } from "@/content/admin";
import type { AdminUser } from "@/lib/auth/guard";
import { grantedPermissions, ROLE_LABEL } from "@/lib/auth/permissions";
import { parseSidebarCollapsed, SIDEBAR_COOKIE } from "@/lib/sidebar";
import { AdminChrome } from "@/components/dashboard/AdminChrome";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

/**
 * Coquille des écrans authentifiés.
 *
 * Composant serveur : il calcule les droits et lit la préférence d'affichage
 * AVANT le rendu, puis confie l'interactivité à `AdminChrome`. Lire l'état de
 * la barre ici, et non après hydratation, évite qu'elle s'affiche d'abord
 * dépliée avant de se replier sous les yeux de l'utilisateur.
 */
export async function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  // Calculé côté serveur : la règle d'autorisation ne descend jamais au client.
  const granted = grantedPermissions(user);
  const collapsed = parseSidebarCollapsed((await cookies()).get(SIDEBAR_COOKIE)?.value);

  const topbar = (
    <>
      <span style={{ minWidth: 0 }}>
        <span className="mono" style={{ display: "block", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-50)" }}>
          {ADMIN.shell.signedInAs} · {ROLE_LABEL[user.role]}
        </span>
        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13.5 }}>
          {user.name ?? user.email}
        </span>
      </span>
      <LogoutButton />
    </>
  );

  return (
    <AdminChrome granted={granted} initialCollapsed={collapsed} topbar={topbar}>
      {children}
    </AdminChrome>
  );
}
