import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN } from "@/content/admin";
import { ADMIN_USERS } from "@/lib/admin";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { ROLE_LABEL, type AdminRole } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/format";
import { UserActions } from "@/components/dashboard/UserActions";
import { UserForm } from "@/components/dashboard/UserForm";

export const metadata: Metadata = { title: ADMIN.users.editTitle };

export default async function UtilisateurPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requirePermission("utilisateurs");
  const t = ADMIN.users;
  const { id } = await params;

  const user = await db().user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      permissions: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!user) notFound();

  const isSelf = user.id === actor.id;

  return (
    <>
      <Link href={ADMIN_USERS} className="adm-back">← {t.back}</Link>

      <h1 className="adm__title" style={{ marginTop: 14 }}>{user.name ?? user.email}</h1>
      <p className="adm__lead">
        {ROLE_LABEL[user.role as AdminRole]} · {user.isActive ? t.statusActive : t.statusInactive} ·{" "}
        <span className="mono">{t.colLastLogin.toLowerCase()} : {formatDateTime(user.lastLoginAt) ?? t.neverConnected}</span>
      </p>

      <div className="adm__section-title">{t.editTitle}</div>
      <div className="adm-panel">
        <UserForm
          mode="edit"
          isSelf={isSelf}
          user={{
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as AdminRole,
            permissions: user.permissions,
          }}
        />
      </div>

      <div className="adm__section-title">Accès du compte</div>
      <div className="adm-panel">
        <UserActions id={user.id} isActive={user.isActive} isSelf={isSelf} />
      </div>
    </>
  );
}
