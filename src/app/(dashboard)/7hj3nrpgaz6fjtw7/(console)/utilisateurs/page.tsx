import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { ROLE_LABEL, type AdminRole } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/format";
import { UserActions } from "@/components/dashboard/UserActions";
import { UserForm } from "@/components/dashboard/UserForm";

export const metadata: Metadata = { title: ADMIN.users.title };

export default async function UtilisateursPage() {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle, donc le redirect du layout n'empêche pas cette page d'être
  // rendue et sérialisée. Toute page de la console doit faire pareil.
  const actor = await requirePermission("utilisateurs");
  const t = ADMIN.users;

  const users = await db().user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
    },
    // L'enum Postgres se trie dans l'ordre de sa déclaration : les
    // administrateurs remontent donc naturellement en tête de liste.
    orderBy: [{ role: "asc" }, { email: "asc" }],
  });

  return (
    <>
      <h1 className="adm__title">{t.title}</h1>
      <p className="adm__lead">{t.lead}</p>

      <div className="adm__section-title">{t.listTitle}</div>

      {users.length === 0 ? (
        <div className="adm-list">
          <div className="adm-list__row">{t.empty}</div>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">{t.colUser}</th>
                <th scope="col">{t.colRole}</th>
                <th scope="col">{t.colStatus}</th>
                <th scope="col">{t.colLastLogin}</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === actor.id;
                return (
                  <tr key={user.id}>
                    <td>
                      <Link href={adminPath(`/utilisateurs/${user.id}`)} className="adm-link">
                        {user.name ?? user.email}
                      </Link>
                      {user.name && <span className="adm-table__sub">{user.email}</span>}
                      {isSelf && <span className="adm-badge adm-badge--self">{t.you}</span>}
                    </td>
                    <td>{ROLE_LABEL[user.role as AdminRole]}</td>
                    <td>
                      <span className={`adm-badge ${user.isActive ? "adm-badge--on" : "adm-badge--off"}`}>
                        {user.isActive ? t.statusActive : t.statusInactive}
                      </span>
                    </td>
                    <td className="mono adm-table__meta">
                      {formatDateTime(user.lastLoginAt) ?? t.neverConnected}
                    </td>
                    <td>
                      <UserActions id={user.id} isActive={user.isActive} isSelf={isSelf} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="adm__section-title">{t.createTitle}</div>
      <p className="adm__lead" style={{ marginTop: 0, marginBottom: 18 }}>{t.createLead}</p>
      <div className="adm-panel">
        <UserForm mode="create" />
      </div>
    </>
  );
}
