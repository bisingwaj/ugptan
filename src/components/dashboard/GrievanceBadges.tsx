/**
 * Pastilles d'état d'un dossier MGP, partagées par la liste et par la fiche.
 *
 * Composants serveur : ils ne font que de la mise en forme. La tonalité vient
 * de `STATUS_TONE` (lib/mgp/model.ts) plutôt que d'une couleur écrite ici — le
 * même statut doit se lire de la même façon partout, y compris sur le site.
 */
import { ADMIN } from "@/content/admin";
import { daysUntil, STATUS_LABEL, STATUS_TONE, type GrievanceStatus } from "@/lib/mgp/model";
import { formatDate } from "@/lib/format";

export function StatusBadge({ status }: { status: GrievanceStatus }) {
  return (
    <span className={`adm-badge adm-badge--${STATUS_TONE[status]}`}>{STATUS_LABEL[status].fr}</span>
  );
}

export function AnonymityBadge({ isAnonymous }: { isAnonymous: boolean }) {
  const t = ADMIN.grievances;
  return (
    <span className={`adm-badge ${isAnonymous ? "adm-badge--off" : "adm-badge--info"}`}>
      {isAnonymous ? t.anonymous : t.named}
    </span>
  );
}

/**
 * Échéance des 30 jours : la date, et ce qu'il en reste. Un dossier clos n'a
 * plus de compte à rebours — afficher un retard sur une affaire réglée
 * signalerait un problème qui n'existe plus.
 */
export function DeadlineCell({ dueAt, closed }: { dueAt: Date; closed: boolean }) {
  const t = ADMIN.grievances;
  const remaining = daysUntil(dueAt);
  const late = remaining < 0;

  return (
    <div>
      <span className="adm-table__meta">{formatDate(dueAt)}</span>
      {!closed && (
        <span className={`adm-table__sub${late ? " adm-late" : ""}`}>
          {late ? `${Math.abs(remaining)} ${t.lateBy}` : `${remaining} ${t.dueIn}`}
        </span>
      )}
    </div>
  );
}
