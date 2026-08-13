import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN, ADMIN_KPIS, ADMIN_NAV_SECTIONS } from "@/content/admin";
import { ADMIN_GRIEVANCES } from "@/lib/admin";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { compterEnLigne } from "@/lib/actus/query";
import { GRIEVANCE_STATUSES, isOpenStatus } from "@/lib/mgp/model";

export const metadata: Metadata = { title: ADMIN.home.title };

const OPEN_STATUSES = GRIEVANCE_STATUSES.filter(isOpenStatus);

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

  // Premier indicateur branché : les plaintes ouvertes, et celles dont
  // l'engagement de 30 jours est dépassé. Réservé aux comptes qui ont le
  // module — un chiffre reste une information.
  // `catch` : même règle que pour les articles ci-dessous. Sans lui, une base
  // injoignable faisait tomber le tableau de bord entier — et l'objet levé par
  // le pilote Neon n'étant pas une `Error`, l'incident ne laissait qu'une ligne
  // « ⨯ Error: [object Object] » dans le journal.
  const seesGrievances = can(user, "mgp");
  const [openGrievances, lateGrievances] = seesGrievances
    ? await Promise.all([
        db().grievance.count({ where: { status: { in: OPEN_STATUSES } } }),
        db().grievance.count({ where: { dueAt: { lt: new Date() }, status: { in: OPEN_STATUSES } } }),
      ]).catch((): [null, null] => [null, null])
    : [null, null];

  // Articles en ligne — même règle : le chiffre n'apparaît qu'aux comptes qui
  // ont le module. `catch` : une base momentanément injoignable doit coûter un
  // tiret, pas le tableau de bord entier.
  const articles = can(user, "actualites") ? await compterEnLigne().catch(() => null) : null;

  /** Valeurs branchées, par clé d'indicateur. Les absentes restent à « — ». */
  const valeurs: Record<string, number> = {};
  if (openGrievances !== null) valeurs.plaintes = openGrievances;
  if (articles !== null) valeurs.articles = articles;

  return (
    <>
      <h1 className="adm__title">{ADMIN.home.title}</h1>
      <p className="adm__lead">{ADMIN.home.lead}</p>

      <div className="adm__section-title">{ADMIN.home.kpisTitle}</div>
      <div className="adm-grid">
        {ADMIN_KPIS.map((kpi) => {
          // Les indicateurs sans module livré restent à « — » : une valeur
          // inventée serait pire qu'un tiret (cf. GUIDE-DEV §8.2.1).
          const valeur = valeurs[kpi.key];
          const branche = valeur !== undefined;
          return (
            <div key={kpi.key} className="adm-card">
              <div className="adm-kpi__num" style={branche ? { color: "var(--c-black)" } : undefined}>
                {branche ? valeur : ADMIN.home.empty}
              </div>
              <div className="adm-kpi__label">{kpi.label}</div>
              {kpi.key === "plaintes" && lateGrievances !== null && lateGrievances > 0 && (
                <Link href={`${ADMIN_GRIEVANCES}?f=hors-delai`} className="adm-kpi__label adm-late">
                  {lateGrievances} {ADMIN.grievances.overdue.toLowerCase()} →
                </Link>
              )}
            </div>
          );
        })}
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
