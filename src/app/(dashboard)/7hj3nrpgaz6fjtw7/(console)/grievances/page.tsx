import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN } from "@/content/admin";
import { mgpCategoryLabel } from "@/content/mgp";
import { ADMIN_GRIEVANCES, adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { formatDate } from "@/lib/format";
import {
  GRIEVANCE_STATUSES,
  STAGE_LABEL,
  isClosingStatus,
  isOpenStatus,
  type GrievanceStage,
  type GrievanceStatus,
} from "@/lib/mgp/model";
import { AnonymityBadge, DeadlineCell, StatusBadge } from "@/components/dashboard/GrievanceBadges";
import { PendingLink } from "@/components/ui/PendingLink";

export const metadata: Metadata = { title: ADMIN.grievances.title };

/** Statuts qui laissent le dossier ouvert — base des compteurs et des filtres. */
const OPEN_STATUSES = GRIEVANCE_STATUSES.filter(isOpenStatus);

type FilterKey = "tous" | "nouvelles" | "en-cours" | "non-affectes" | "hors-delai";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "tous", label: ADMIN.grievances.filterAll },
  { key: "nouvelles", label: ADMIN.grievances.kpiNew },
  { key: "en-cours", label: ADMIN.grievances.filterOpen },
  { key: "non-affectes", label: ADMIN.grievances.filterUnassigned },
  { key: "hors-delai", label: ADMIN.grievances.filterOverdue },
];

/**
 * Le filtre vit dans l'URL et non dans un état de composant : un dossier
 * s'ouvre puis se referme, et l'on doit retomber sur la même liste. C'est aussi
 * ce qui rend une vue partageable entre deux agents.
 */
function whereFor(filter: FilterKey, now: Date) {
  switch (filter) {
    case "nouvelles":
      return { status: "NOUVELLE" as const };
    case "en-cours":
      return { status: { in: OPEN_STATUSES } };
    case "non-affectes":
      return { assigneeId: null, status: { in: OPEN_STATUSES } };
    case "hors-delai":
      return { dueAt: { lt: now }, status: { in: OPEN_STATUSES } };
    default:
      return {};
  }
}

const asFilter = (value: string | undefined): FilterKey =>
  FILTERS.some((f) => f.key === value) ? (value as FilterKey) : "tous";

export default async function PlaintesPage(props: { searchParams: Promise<{ f?: string }> }) {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle (cf. lib/auth/guard.ts).
  await requirePermission("mgp");
  const t = ADMIN.grievances;

  const { f } = await props.searchParams;
  const filter = asFilter(f);
  const now = new Date();

  const [grievances, total, nouvelles, ouvertes, horsDelai] = await Promise.all([
    db().grievance.findMany({
      where: whereFor(filter, now),
      select: {
        id: true,
        reference: true,
        category: true,
        status: true,
        stage: true,
        isAnonymous: true,
        submittedAt: true,
        dueAt: true,
        closedAt: true,
        assignee: { select: { name: true, email: true } },
      },
      // Les plus récentes d'abord : c'est l'ordre dans lequel on prend un poste.
      orderBy: { submittedAt: "desc" },
      take: 200,
    }),
    db().grievance.count(),
    db().grievance.count({ where: { status: "NOUVELLE" } }),
    db().grievance.count({ where: { status: { in: OPEN_STATUSES } } }),
    db().grievance.count({ where: { dueAt: { lt: now }, status: { in: OPEN_STATUSES } } }),
  ]);

  const kpis = [
    { key: "total", label: t.kpiTotal, value: total },
    { key: "new", label: t.kpiNew, value: nouvelles },
    { key: "open", label: t.kpiOpen, value: ouvertes },
    { key: "late", label: t.kpiOverdue, value: horsDelai },
  ];

  return (
    <>
      <h1 className="adm__title">{t.title}</h1>
      <p className="adm__lead">{t.lead}</p>

      <div className="adm-grid" style={{ marginTop: 26 }}>
        {kpis.map((kpi) => (
          <div key={kpi.key} className="adm-card">
            <div className="adm-kpi__num" style={{ color: kpi.value > 0 ? "var(--c-black)" : undefined }}>
              {kpi.value}
            </div>
            <div className="adm-kpi__label">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="adm__section-title">{t.listTitle}</div>

      <nav className="adm-filters" aria-label={t.filterLabel}>
        {FILTERS.map((item) => {
          const active = item.key === filter;
          return (
            <PendingLink
              key={item.key}
              href={item.key === "tous" ? ADMIN_GRIEVANCES : `${ADMIN_GRIEVANCES}?f=${item.key}`}
              className={`adm-filter${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </PendingLink>
          );
        })}
      </nav>

      {grievances.length === 0 ? (
        <div className="adm-list">
          <div className="adm-list__row">{filter === "tous" ? t.empty : t.emptyFiltered}</div>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">{t.colRef}</th>
                <th scope="col">{t.colSubmitted}</th>
                <th scope="col">{t.colCategory}</th>
                <th scope="col">{t.colStatus}</th>
                <th scope="col">{t.colStage}</th>
                <th scope="col">{t.colAssignee}</th>
                <th scope="col">{t.colDeadline}</th>
              </tr>
            </thead>
            <tbody>
              {grievances.map((g) => {
                const status = g.status as GrievanceStatus;
                return (
                  <tr key={g.id}>
                    <td>
                      <Link href={adminPath(`/grievances/${g.id}`)} className="adm-link mono">
                        {g.reference}
                      </Link>
                      <span className="adm-table__sub">
                        <AnonymityBadge isAnonymous={g.isAnonymous} />
                      </span>
                    </td>
                    <td className="adm-table__meta">{formatDate(g.submittedAt)}</td>
                    <td>{mgpCategoryLabel(g.category).fr}</td>
                    <td><StatusBadge status={status} /></td>
                    <td className="adm-table__meta">{STAGE_LABEL[g.stage as GrievanceStage].fr}</td>
                    <td>{g.assignee ? (g.assignee.name ?? g.assignee.email) : <span className="adm-hint">{t.unassigned}</span>}</td>
                    <td>
                      <DeadlineCell dueAt={g.dueAt} closed={isClosingStatus(status) || g.closedAt !== null} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
