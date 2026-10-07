import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN } from "@/content/admin";
import { mgpCategoryLabel } from "@/content/mgp";
import { ADMIN_GRIEVANCES } from "@/lib/admin";
import { db } from "@/lib/db";
import type { AdminRole } from "@/lib/auth/permissions";
import { canHandleCategory, requireGrievanceAccess, within } from "@/lib/mgp/acces";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  EVENT_TYPE_LABEL,
  PRIORITY_LABEL,
  STAGE_LABEL,
  STATUS_HINT,
  STATUS_LABEL,
  daysUntil,
  isClosingStatus,
  isEasCategory,
  isGrievancePriority,
  isGrievanceStage,
  isGrievanceStatus,
  type GrievanceEventType,
  type GrievancePriority,
  type GrievanceStage,
  type GrievanceStatus,
} from "@/lib/mgp/model";
import { AnonymityBadge, StatusBadge } from "@/components/dashboard/GrievanceBadges";
import { GrievanceWorkflow, type AssignableUser } from "@/components/dashboard/GrievanceWorkflow";
import {
  GrievanceContactForm,
  GrievanceMessageForm,
  GrievanceNoteForm,
} from "@/components/dashboard/GrievanceForms";
import { GrievanceReadMarker } from "@/components/dashboard/GrievanceUnread";

export const metadata: Metadata = { title: ADMIN.grievances.caseTitle };

/**
 * Traduit une entrée du journal en une ligne lisible.
 *
 * Les valeurs stockées sont des codes (`EN_TRAITEMENT`, `DECISION`…) : les
 * afficher tels quels obligerait chaque agent à connaître l'enum. On les
 * retraduit ici, en laissant passer intact ce qui n'est pas reconnu — un
 * dossier ancien ou importé doit rester lisible.
 */
function describeChange(type: GrievanceEventType, value: string | null): string | null {
  if (!value) return null;
  if (type === "STATUT") return isGrievanceStatus(value) ? STATUS_LABEL[value].fr : value;
  if (type === "ETAPE") return isGrievanceStage(value) ? STAGE_LABEL[value].fr : value;
  if (type === "PRIORITE") return isGrievancePriority(value) ? PRIORITY_LABEL[value] : value;
  return value;
}

export default async function PlaintePage({ params }: { params: Promise<{ id: string }> }) {
  const { scope } = await requireGrievanceAccess();
  const t = ADMIN.grievances;
  const { id } = await params;

  // `findFirst` dans le périmètre, et non `findUnique` par identifiant : un
  // signalement EAS/HS ouvert par l'URL depuis un compte non habilité répond
  // 404, exactement comme un dossier qui n'existe pas. Un refus explicite
  // confirmerait son existence (cf. lib/mgp/acces.ts).
  const grievance = await db().grievance.findFirst({
    where: within(scope, { id }),
    select: {
      id: true,
      reference: true,
      category: true,
      description: true,
      fullName: true,
      email: true,
      phone: true,
      province: true,
      lang: true,
      isAnonymous: true,
      status: true,
      stage: true,
      priority: true,
      assigneeId: true,
      submittedAt: true,
      dueAt: true,
      closedAt: true,
      readAt: true,
      attachments: { select: { id: true, name: true, sizeKb: true } },
      events: {
        select: {
          id: true, type: true, isPublic: true, message: true,
          fromValue: true, toValue: true, authorLabel: true, createdAt: true,
        },
        // Le plus récent en tête : on ouvre un dossier pour savoir où il en est.
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!grievance) notFound();

  const status = grievance.status as GrievanceStatus;
  const stage = grievance.stage as GrievanceStage;
  const closed = isClosingStatus(status) || grievance.closedAt !== null;
  const remaining = daysUntil(grievance.dueAt);

  // Comptes à qui le dossier peut être confié. Le filtrage est refait dans la
  // server action : cette liste est une commodité de saisie, pas un droit.
  const candidates = await db().user.findMany({
    where: { banned: false },
    select: { id: true, name: true, email: true, role: true, permissions: true },
    orderBy: [{ role: "asc" }, { email: "asc" }],
  });
  // Filtrés sur la catégorie du dossier : un signalement EAS/HS ne se confie
  // qu'à un titulaire de l'accès nominatif.
  const eas = isEasCategory(grievance.category);
  const users: AssignableUser[] = candidates
    .filter((user) =>
      canHandleCategory({ role: user.role as AdminRole, permissions: user.permissions }, grievance.category),
    )
    .map((user) => ({ id: user.id, label: user.name ?? user.email }));

  const reachable = Boolean(grievance.email || grievance.phone);

  return (
    <>
      {/* Première ouverture : le dossier sort du compte des non lues. */}
      {grievance.readAt === null && <GrievanceReadMarker id={grievance.id} />}

      <Link href={ADMIN_GRIEVANCES} className="adm-back">← {t.back}</Link>

      <h1 className="adm__title mono" style={{ marginTop: 14 }}>{grievance.reference}</h1>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 12 }}>
        <StatusBadge status={status} />
        <AnonymityBadge isAnonymous={grievance.isAnonymous} />
        <span className="adm-badge adm-badge--off">{STAGE_LABEL[stage].fr}</span>
        <span className="adm-badge adm-badge--off">{PRIORITY_LABEL[grievance.priority as GrievancePriority]}</span>
      </div>
      <p className="adm__lead">{STATUS_HINT[status].fr}</p>

      {eas && (
        <div className="adm-panel" role="note" style={{ marginTop: 18, borderLeft: "3px solid var(--orange)" }}>
          <div className="label-mono">{t.easCaseTitle}</div>
          <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.6 }}>{t.easCaseNotice}</p>
        </div>
      )}

      {/* Repères du dossier */}
      <div className="adm-grid" style={{ marginTop: 22 }}>
        <div className="adm-card">
          <div className="label-mono">{t.colSubmitted}</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{formatDateTime(grievance.submittedAt)}</div>
        </div>
        <div className="adm-card">
          <div className="label-mono">{closed ? t.closedOn : t.colDeadline}</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {formatDate(grievance.closedAt ?? grievance.dueAt)}
          </div>
          {!closed && (
            <div className={`adm-kpi__label${remaining < 0 ? " adm-late" : ""}`}>
              {remaining < 0 ? `${Math.abs(remaining)} ${t.lateBy}` : `${remaining} ${t.dueIn}`}
            </div>
          )}
        </div>
        <div className="adm-card">
          <div className="label-mono">{t.colCategory}</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{mgpCategoryLabel(grievance.category).fr}</div>
        </div>
        <div className="adm-card">
          <div className="label-mono">{t.fieldLang}</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{grievance.lang === "en" ? "Anglais" : "Français"}</div>
        </div>
      </div>

      {/* Plaignant */}
      <div className="adm__section-title">{t.identityTitle}</div>
      <div className="adm-panel">
        {grievance.isAnonymous && <p className="adm-hint" style={{ marginBottom: 16 }}>{t.identityAnonymous}</p>}
        {!reachable && <p className="adm-hint" style={{ marginBottom: 16 }}>{t.identityNone}</p>}

        <dl className="adm-defs">
          <Def label={t.fieldName} value={grievance.fullName} />
          <Def
            label={t.fieldEmail}
            value={grievance.email}
            action={grievance.email ? { href: `mailto:${grievance.email}?subject=${encodeURIComponent(`[${grievance.reference}] Mécanisme de gestion des plaintes — UGPTN`)}`, label: t.write } : undefined}
          />
          <Def
            label={t.fieldPhone}
            value={grievance.phone}
            action={grievance.phone ? { href: `tel:${grievance.phone.replace(/[^+\d]/g, "")}`, label: t.call } : undefined}
          />
          <Def label={t.fieldProvince} value={grievance.province} />
        </dl>
      </div>

      {/* Faits rapportés */}
      <div className="adm__section-title">{t.descriptionTitle}</div>
      <div className="adm-panel">
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{grievance.description}</p>
      </div>

      {/* Pièces */}
      <div className="adm__section-title">{t.attachmentsTitle}</div>
      <div className="adm-list">
        {grievance.attachments.length === 0 ? (
          <div className="adm-list__row">{t.attachmentsEmpty}</div>
        ) : (
          grievance.attachments.map((file) => (
            <div key={file.id} className="adm-list__row">
              <span>{file.name}</span>
              <span className="mono adm-table__meta">{file.sizeKb} Ko</span>
            </div>
          ))
        )}
      </div>
      <p className="adm-hint" style={{ marginTop: 10 }}>{t.attachmentsNote}</p>

      {/* Traitement */}
      <div className="adm__section-title">{t.workflowTitle}</div>
      <p className="adm__lead" style={{ marginTop: 0, marginBottom: 18 }}>{t.workflowLead}</p>
      <div className="adm-panel">
        <GrievanceWorkflow
          id={grievance.id}
          status={status}
          stage={stage}
          priority={grievance.priority as GrievancePriority}
          assigneeId={grievance.assigneeId}
          users={users}
          assigneeHint={eas ? t.assigneeHintEas : undefined}
        />
      </div>

      {/* Message au plaignant */}
      <div className="adm__section-title">{t.messageTitle}</div>
      <p className="adm__lead" style={{ marginTop: 0, marginBottom: 18 }}>{eas ? t.easMessageLead : t.messageLead}</p>
      <div className="adm-panel">
        <GrievanceMessageForm id={grievance.id} />
      </div>

      {/* Note interne */}
      <div className="adm__section-title">{t.noteTitle}</div>
      <p className="adm__lead" style={{ marginTop: 0, marginBottom: 18 }}>{t.noteLead}</p>
      <div className="adm-panel">
        <GrievanceNoteForm id={grievance.id} />
      </div>

      {/* Contact journalisé */}
      <div className="adm__section-title">{t.contactTitle}</div>
      <p className="adm__lead" style={{ marginTop: 0, marginBottom: 18 }}>{t.contactLead}</p>
      <div className="adm-panel">
        <GrievanceContactForm id={grievance.id} disabled={!reachable} />
      </div>

      {/* Historique */}
      <div className="adm__section-title">{t.historyTitle}</div>
      <p className="adm__lead" style={{ marginTop: 0, marginBottom: 18 }}>{t.historyLead}</p>
      {grievance.events.length === 0 ? (
        <div className="adm-list">
          <div className="adm-list__row">{t.historyEmpty}</div>
        </div>
      ) : (
        <ol className="adm-timeline">
          {grievance.events.map((event) => {
            const type = event.type as GrievanceEventType;
            const from = describeChange(type, event.fromValue);
            const to = describeChange(type, event.toValue);
            return (
              <li key={event.id} className="adm-timeline__item">
                <div className="adm-timeline__head">
                  <span className="adm-timeline__type">{EVENT_TYPE_LABEL[type]}</span>
                  {event.isPublic && <span className="adm-badge adm-badge--info">{t.historyPublic}</span>}
                  <span className="adm-timeline__meta mono">
                    {formatDateTime(event.createdAt)}
                    {event.authorLabel && ` · ${t.by} ${event.authorLabel}`}
                  </span>
                </div>
                {to && type !== "CONTACT" && (
                  <div className="adm-timeline__change">
                    {from ? <><span className="adm-timeline__from">{from}</span> → </> : null}
                    <strong>{to}</strong>
                  </div>
                )}
                {type === "CONTACT" && to && <div className="adm-timeline__change"><strong>{to}</strong></div>}
                {event.message && <p className="adm-timeline__msg">{event.message}</p>}
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}

/** Ligne d'une liste de définitions, avec son geste de contact éventuel. */
function Def({
  label,
  value,
  action,
}: {
  label: string;
  value: string | null;
  action?: { href: string; label: string };
}) {
  return (
    <div className="adm-defs__row">
      <dt className="label-mono" style={{ margin: 0 }}>{label}</dt>
      <dd className="adm-defs__val">
        {value ? <span>{value}</span> : <span className="adm-hint">—</span>}
        {action && <a href={action.href} className="adm-link">{action.label}</a>}
      </dd>
    </div>
  );
}
