"use client";

import { useCallback, useState, type ReactNode } from "react";
import type { Permission } from "@/lib/auth/permissions";
import { sidebarCookieValue } from "@/lib/sidebar";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { NotificationBell, useNotifications } from "@/components/dashboard/Notifications";
import { estSuivi, type Notifications } from "@/lib/notifications-model";

/**
 * Coquille interactive de la console : c'est elle qui porte la grille `.adm`,
 * donc la largeur de la colonne latérale.
 *
 * L'état du repli vit ici plutôt que dans `AdminSidebar` parce qu'il pilote une
 * colonne de la grille, propriété du conteneur. La barre reçoit l'état et la
 * commande de bascule ; elle ne les possède pas.
 *
 * `initialCollapsed` vient du serveur (cookie lu dans AdminShell) : la barre est
 * donc rendue d'emblée dans le bon état, sans repli visible après hydratation.
 *
 * Les comptes de notification vivent ici pour la même raison : deux endroits
 * les affichent (les bulles de la barre latérale, la cloche de la barre du
 * haut), et ils ne doivent jamais dire deux chiffres différents.
 */
export function AdminChrome({
  granted,
  initialCollapsed,
  initialNotifications,
  topbar,
  sidebarFooter,
  children,
}: {
  granted: Permission[];
  initialCollapsed: boolean;
  /** Comptes par module ; `null` pour un module que le compte n'a pas. */
  initialNotifications: Notifications;
  topbar: ReactNode;
  sidebarFooter: ReactNode;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const notifications = useNotifications(initialNotifications);

  const toggle = useCallback(() => {
    setCollapsed((previous) => {
      const next = !previous;
      document.cookie = sidebarCookieValue(next);
      return next;
    });
  }, []);

  return (
    // Les deux largeurs sont dans la feuille de style : `data-collapsed` bascule
    // la colonne de la grille, aucun style inline à calculer ici.
    <div className="adm" data-collapsed={collapsed ? "true" : undefined}>
      <AdminSidebar
        granted={granted}
        collapsed={collapsed}
        onToggle={toggle}
        footer={sidebarFooter}
        badges={notifications}
      />
      <div className="adm__main">
        <header className="adm__top">
          {topbar}
          {estSuivi(notifications) && <NotificationBell counts={notifications} />}
        </header>
        <main className="adm__body">{children}</main>
      </div>
    </div>
  );
}
