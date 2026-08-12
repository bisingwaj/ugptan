import type { Metadata } from "next";
import { ADMIN, ADMIN_KPIS, ADMIN_NAV_SECTIONS } from "@/content/admin";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";

export const metadata: Metadata = { title: ADMIN.home.title };

export default async function TableauDeBordPage() {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle, donc le redirect du layout n'empêche pas cette page d'être
  // rendue et sérialisée. Toute nouvelle page de la console doit faire pareil.
  const user = await requirePermission("tableau-de-bord");

  // Même filtrage que la barre latérale : un compte ne lit ici que les modules
  // auxquels il a effectivement accès.
  const sections = ADMIN_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => can(user, item.key)),
  })).filter((section) => section.items.length > 0);

  return (
    <>
      <h1 className="adm__title">{ADMIN.home.title}</h1>
      <p className="adm__lead">{ADMIN.home.lead}</p>

      <div className="adm__section-title">{ADMIN.home.kpisTitle}</div>
      <div className="adm-grid">
        {ADMIN_KPIS.map((kpi) => (
          <div key={kpi.key} className="adm-card">
            {/* Valeurs branchées au fil des modules — cf. GUIDE-DEV §8.2.1 */}
            <div className="adm-kpi__num">{ADMIN.home.empty}</div>
            <div className="adm-kpi__label">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="adm__section-title">{ADMIN.home.modulesTitle}</div>
      <p className="adm__lead" style={{ marginTop: 0, marginBottom: 14 }}>{ADMIN.home.modulesLead}</p>

      {sections.map((section) => (
        <div key={section.key} style={{ marginBottom: 18 }}>
          <div className="label-mono">{section.label}</div>
          <div className="adm-list">
            {section.items.map((item) => (
              <div key={item.key} className="adm-list__row">
                <span style={{ fontWeight: item.soon ? 400 : 600, color: item.soon ? "var(--c-60)" : undefined }}>
                  {item.label}
                </span>
                {item.soon ? (
                  <span className="mono" style={{ fontSize: 11, color: "var(--c-50)" }}>{ADMIN.shell.soon}</span>
                ) : (
                  <span className="mono" style={{ fontSize: 11, color: "var(--green)" }}>actif</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
