"use server";

/**
 * Traitement des plaintes depuis la console.
 *
 * ⚠️ INVARIANT : chaque action commence par `assertGrievanceAccess()`, et toute
 * lecture ou écriture d'un dossier passe par son périmètre (`within(scope, …)`).
 * Le proxy laisse passer les POST (cf. src/proxy.ts), la barrière est donc ici.
 * Le périmètre est ce qui cloisonne les signalements EAS/HS : un agent MGP
 * ordinaire qui forgerait l'identifiant d'un tel dossier obtient « Dossier
 * introuvable », sur chaque action, sans rien en lire ni y écrire
 * (cf. lib/mgp/acces.ts).
 *
 * Second invariant, propre à ce module : AUCUNE écriture ne se fait sans
 * inscrire l'événement correspondant au journal du dossier. C'est ce qui donne
 * sa valeur à l'historique — un mécanisme de plainte dont on ne peut pas
 * retracer les décisions ne protège personne. Les deux écritures partent dans
 * la même transaction, faute de quoi un incident laisserait un dossier modifié
 * sans trace de qui l'a fait.
 *
 * Distinction structurante entre les deux formes d'écrit :
 *   · NOTE    — interne, jamais publiée ;
 *   · MESSAGE — adressé au plaignant, visible dans le suivi public.
 * Le champ `isPublic` d'un événement n'est jamais posé ailleurs qu'ici.
 *
 * Seule exception au second invariant : le marquage « lu » (`readAt`). C'est
 * l'état de lecture de la console, qui alimente la bulle de notification, et
 * non une décision sur le dossier. Journaliser chaque ouverture noierait
 * l'historique sous des lignes qui n'apprennent rien sur le traitement.
 */
import { revalidatePath } from "next/cache";
import { ADMIN_GRIEVANCES, adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import type { AdminUser } from "@/lib/auth/guard";
import type { AdminRole } from "@/lib/auth/permissions";
import { assertGrievanceAccess, canHandleCategory, within, type GrievanceScope } from "@/lib/mgp/acces";
import {
  LIMITS,
  isClosingStatus,
  isGrievancePriority,
  isGrievanceStage,
  isGrievanceStatus,
  type GrievancePriority,
  type GrievanceStage,
  type GrievanceStatus,
} from "@/lib/mgp/model";
import { UNREAD_WHERE, countUnreadGrievances } from "@/lib/mgp/query";

export type GrievanceActionState = { error: string | null; ok: string | null };

const NOT_FOUND = "Dossier introuvable.";

/** Nom lisible de l'agent, figé dans le journal (cf. `authorLabel`). */
const authorLabel = (actor: AdminUser): string => actor.name ?? actor.email;

type EventInput = {
  type: "STATUT" | "ETAPE" | "PRIORITE" | "AFFECTATION" | "NOTE" | "MESSAGE" | "CONTACT";
  isPublic?: boolean;
  message?: string;
  fromValue?: string | null;
  toValue?: string | null;
};

const eventData = (grievanceId: string, actor: AdminUser, event: EventInput) => ({
  grievanceId,
  type: event.type,
  isPublic: event.isPublic ?? false,
  message: event.message ?? null,
  fromValue: event.fromValue ?? null,
  toValue: event.toValue ?? null,
  authorId: actor.id,
  authorLabel: authorLabel(actor),
});

function refresh(id: string) {
  revalidatePath(ADMIN_GRIEVANCES);
  revalidatePath(adminPath(`/grievances/${id}`));
}

/** Le dossier existe-t-il DANS le périmètre du compte ? */
const visible = async (scope: GrievanceScope, id: string): Promise<boolean> =>
  (await db().grievance.count({ where: within(scope, { id }) })) > 0;

const readText = (formData: FormData, field: string, max: number): string =>
  String(formData.get(field) ?? "").trim().slice(0, max);

/**
 * Comptes à qui un dossier peut être confié : actifs, et habilités pour sa
 * catégorie (`mgp-eas` pour un signalement EAS/HS, `mgp` sinon).
 * Recalculé côté serveur plutôt que d'accepter l'identifiant envoyé par le
 * formulaire — une liste d'options n'est pas une autorisation.
 */
async function assignableUserIds(category: string): Promise<Set<string>> {
  const users = await db().user.findMany({
    where: { banned: false },
    select: { id: true, role: true, permissions: true },
  });
  return new Set(
    users
      .filter((user) =>
        canHandleCategory({ role: user.role as AdminRole, permissions: user.permissions }, category),
      )
      .map((user) => user.id),
  );
}

/**
 * Qualification et traitement : statut, étape, priorité et affectation en une
 * seule soumission. Un événement par champ RÉELLEMENT modifié — journaliser des
 * changements qui n'en sont pas rendrait l'historique illisible.
 */
export async function updateGrievanceAction(
  _prev: GrievanceActionState,
  formData: FormData,
): Promise<GrievanceActionState> {
  const { user: actor, scope } = await assertGrievanceAccess();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: NOT_FOUND, ok: null };

  const current = await db().grievance.findFirst({
    where: within(scope, { id }),
    select: {
      id: true, category: true, status: true, stage: true, priority: true, closedAt: true,
      assigneeId: true, assignee: { select: { name: true, email: true } },
    },
  });
  if (!current) return { error: NOT_FOUND, ok: null };

  const rawStatus = String(formData.get("status") ?? "");
  const rawStage = String(formData.get("stage") ?? "");
  const rawPriority = String(formData.get("priority") ?? "");
  const rawAssignee = String(formData.get("assigneeId") ?? "");

  if (!isGrievanceStatus(rawStatus)) return { error: "Statut invalide.", ok: null };
  if (!isGrievanceStage(rawStage)) return { error: "Étape invalide.", ok: null };
  if (!isGrievancePriority(rawPriority)) return { error: "Priorité invalide.", ok: null };

  const status: GrievanceStatus = rawStatus;
  const stage: GrievanceStage = rawStage;
  const priority: GrievancePriority = rawPriority;

  let assigneeId: string | null = null;
  let assigneeLabel = "Non affecté";
  if (rawAssignee) {
    if (!(await assignableUserIds(current.category)).has(rawAssignee)) {
      return { error: "Ce compte ne peut pas recevoir de dossier MGP.", ok: null };
    }
    const target = await db().user.findUnique({
      where: { id: rawAssignee },
      select: { name: true, email: true },
    });
    if (!target) return { error: "Compte introuvable.", ok: null };
    assigneeId = rawAssignee;
    assigneeLabel = target.name ?? target.email;
  }

  const events: EventInput[] = [];
  if (status !== current.status) {
    events.push({ type: "STATUT", fromValue: current.status, toValue: status });
  }
  if (stage !== current.stage) {
    events.push({ type: "ETAPE", fromValue: current.stage, toValue: stage });
  }
  if (priority !== current.priority) {
    events.push({ type: "PRIORITE", fromValue: current.priority, toValue: priority });
  }
  if (assigneeId !== current.assigneeId) {
    const previous = current.assignee ? (current.assignee.name ?? current.assignee.email) : "Non affecté";
    events.push({ type: "AFFECTATION", fromValue: previous, toValue: assigneeLabel });
  }

  if (events.length === 0) return { error: null, ok: "Aucun changement à enregistrer." };

  // La date de clôture suit le statut plutôt que d'être saisie à part : deux
  // champs à tenir d'accord finiraient par diverger.
  const closing = isClosingStatus(status);
  const closedAt = closing ? (current.closedAt ?? new Date()) : null;

  await db().$transaction([
    db().grievance.update({
      where: { id },
      data: { status, stage, priority, assigneeId, closedAt },
    }),
    db().grievanceEvent.createMany({
      data: events.map((event) => eventData(id, actor, event)),
    }),
  ]);

  refresh(id);
  return { error: null, ok: "Dossier mis à jour." };
}

/** Note interne : jamais publiée, jamais transmise au plaignant. */
export async function addGrievanceNoteAction(
  _prev: GrievanceActionState,
  formData: FormData,
): Promise<GrievanceActionState> {
  const { user: actor, scope } = await assertGrievanceAccess();

  const id = String(formData.get("id") ?? "");
  const note = readText(formData, "note", LIMITS.note);
  if (!id) return { error: NOT_FOUND, ok: null };
  if (note.length < 2) return { error: "La note est vide.", ok: null };

  if (!(await visible(scope, id))) return { error: NOT_FOUND, ok: null };

  await db().grievanceEvent.create({
    data: eventData(id, actor, { type: "NOTE", message: note }),
  });

  refresh(id);
  return { error: null, ok: "Note enregistrée." };
}

/**
 * Message adressé au plaignant. C'est le SEUL écrit de la console qui devient
 * visible sur le site public : le formulaire le rappelle, et le libellé du
 * bouton le dit.
 */
export async function addGrievanceUpdateAction(
  _prev: GrievanceActionState,
  formData: FormData,
): Promise<GrievanceActionState> {
  const { user: actor, scope } = await assertGrievanceAccess();

  const id = String(formData.get("id") ?? "");
  const message = readText(formData, "message", LIMITS.message);
  if (!id) return { error: NOT_FOUND, ok: null };
  if (message.length < 2) return { error: "Le message est vide.", ok: null };

  if (!(await visible(scope, id))) return { error: NOT_FOUND, ok: null };

  await db().grievanceEvent.create({
    data: eventData(id, actor, { type: "MESSAGE", isPublic: true, message }),
  });

  refresh(id);
  return { error: null, ok: "Message publié dans le suivi du plaignant." };
}

/**
 * Journalisation d'un contact pris avec le plaignant (appel, courriel, visite).
 * L'échange lui-même a lieu hors de l'outil ; ce qui compte au dossier est
 * qu'il ait eu lieu, quand, par qui et ce qu'il en est ressorti.
 */
export async function logGrievanceContactAction(
  _prev: GrievanceActionState,
  formData: FormData,
): Promise<GrievanceActionState> {
  const { user: actor, scope } = await assertGrievanceAccess();

  const id = String(formData.get("id") ?? "");
  const channel = readText(formData, "channel", 40);
  const summary = readText(formData, "summary", LIMITS.note);
  if (!id) return { error: NOT_FOUND, ok: null };
  if (summary.length < 2) return { error: "Résumez l'échange avant de l'enregistrer.", ok: null };

  const target = await db().grievance.findFirst({
    where: within(scope, { id }),
    select: { isAnonymous: true, email: true, phone: true },
  });
  if (!target) return { error: NOT_FOUND, ok: null };
  if (!target.email && !target.phone) {
    return { error: "Ce dossier ne comporte aucune coordonnée : aucun contact ne peut y être journalisé.", ok: null };
  }

  await db().grievanceEvent.create({
    data: eventData(id, actor, { type: "CONTACT", message: summary, toValue: channel || null }),
  });

  refresh(id);
  return { error: null, ok: "Contact journalisé." };
}

/* --- Plaintes non lues ---------------------------------------------------- */

/**
 * Marque un dossier comme lu à son ouverture. Appelée par un effet client
 * (`GrievanceReadMarker`) et non pendant le rendu serveur : un préchargement de
 * lien ne doit pas faire passer pour lu un dossier que personne n'a ouvert.
 *
 * Idempotente : `readAt: null` dans le filtre garde la date de la PREMIÈRE
 * lecture, que deux agents ouvrent le dossier ensemble ou que l'effet soit
 * rejoué. Renvoie le nouveau compte, pour que la bulle baisse sans attendre.
 */
export async function markGrievanceReadAction(id: string): Promise<number> {
  const { scope } = await assertGrievanceAccess();

  if (typeof id === "string" && id) {
    const { count } = await db().grievance.updateMany({
      where: within(scope, { id, ...UNREAD_WHERE }),
      data: { readAt: new Date() },
    });
    if (count > 0) revalidatePath(ADMIN_GRIEVANCES);
  }

  return countUnreadGrievances(scope);
}

/**
 * « Tout marquer comme lu », depuis la liste.
 *
 * Borné aux plaintes reçues AVANT le chargement de la liste (`before`) : une
 * plainte arrivée entre-temps n'était pas sous les yeux de l'agent, elle doit
 * rester signalée. Une date absente ou illisible ne marque rien.
 */
export async function markAllGrievancesReadAction(formData: FormData): Promise<number> {
  // Borné au périmètre : sans quoi l'agent ordinaire ferait passer pour lus
  // des signalements EAS/HS que la spécialiste n'a jamais ouverts.
  const { scope } = await assertGrievanceAccess();

  const before = new Date(String(formData.get("before") ?? ""));
  if (!Number.isNaN(before.getTime())) {
    const { count } = await db().grievance.updateMany({
      where: within(scope, { ...UNREAD_WHERE, submittedAt: { lte: before } }),
      data: { readAt: new Date() },
    });
    if (count > 0) revalidatePath(ADMIN_GRIEVANCES);
  }

  return countUnreadGrievances(scope);
}
