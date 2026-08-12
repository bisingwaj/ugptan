/**
 * Vocabulaire du mécanisme de gestion des plaintes : étapes, statuts, priorités
 * et libellés associés.
 *
 * ⚠️ Aucun import de valeur : ni Prisma, ni `node:`. Ce module est lu par le
 * formulaire public et par le suivi, qui sont des composants clients, autant
 * que par les server actions et les pages de la console. Les unions ci-dessous
 * reproduisent volontairement les enums du schéma Prisma — les deux doivent
 * rester alignées, exactement comme `AdminRole` et `Role`.
 *
 * Deux axes cohabitent, et ce n'est pas une redondance :
 *   · l'ÉTAPE dit où en est le dossier dans la pipeline publiée (Réception →
 *     Classification → Instruction → Décision → Clôture) ;
 *   · le STATUT dit dans quel état il se trouve — un dossier peut être « en
 *     attente » du plaignant tout en restant à l'étape « Instruction ».
 * Le site public affiche les deux ; la console pilote les deux séparément.
 */
import type { Bilingual } from "@/lib/pick";

/* --- Étapes de la pipeline ------------------------------------------------ */

export const GRIEVANCE_STAGES = [
  "RECEPTION",
  "CLASSIFICATION",
  "INSTRUCTION",
  "DECISION",
  "CLOTURE",
] as const;

export type GrievanceStage = (typeof GRIEVANCE_STAGES)[number];

export const STAGE_LABEL: Record<GrievanceStage, Bilingual> = {
  RECEPTION: { fr: "Réception", en: "Receipt" },
  CLASSIFICATION: { fr: "Classification", en: "Classification" },
  INSTRUCTION: { fr: "Instruction", en: "Investigation" },
  DECISION: { fr: "Décision", en: "Decision" },
  CLOTURE: { fr: "Clôture", en: "Closure" },
};

/** Ce que le dossier attend une fois l'étape courante franchie. */
export const STAGE_NEXT_STEP: Record<GrievanceStage, Bilingual | null> = {
  RECEPTION: {
    fr: "Votre dossier va être classé par catégorie, ce qui détermine le service qui l'instruira.",
    en: "Your case will be classified by category, which determines the department that will handle it.",
  },
  CLASSIFICATION: {
    fr: "Un agent responsable est désigné, puis l'instruction commence : vérifications, échanges avec les services concernés.",
    en: "A responsible officer is appointed, then the investigation begins: checks and exchanges with the departments concerned.",
  },
  INSTRUCTION: {
    fr: "À l'issue des vérifications, une décision motivée est rendue sur les suites données à votre plainte.",
    en: "Once the checks are complete, a reasoned decision is issued on the action taken on your grievance.",
  },
  DECISION: {
    fr: "La décision vous est communiquée, puis le dossier est clôturé. Vous pouvez en demander le réexamen.",
    en: "The decision is communicated to you, then the case is closed. You may request a review.",
  },
  CLOTURE: null,
};

export const stageIndex = (stage: GrievanceStage): number => GRIEVANCE_STAGES.indexOf(stage);

/* --- Statuts -------------------------------------------------------------- */

export const GRIEVANCE_STATUSES = [
  "NOUVELLE",
  "RECEVABLE",
  "IRRECEVABLE",
  "EN_TRAITEMENT",
  "EN_ATTENTE",
  "RESOLUE",
  "CLOTUREE",
] as const;

export type GrievanceStatus = (typeof GRIEVANCE_STATUSES)[number];

/**
 * Libellés lus par le plaignant. Écrits pour être compris sans connaître la
 * procédure : « Reçue » et non « Nouvelle », « Complément attendu » et non
 * « En attente », qui ne dirait pas de qui l'on attend quelque chose.
 */
export const STATUS_LABEL: Record<GrievanceStatus, Bilingual> = {
  NOUVELLE: { fr: "Reçue", en: "Received" },
  RECEVABLE: { fr: "Recevable", en: "Admissible" },
  IRRECEVABLE: { fr: "Irrecevable", en: "Inadmissible" },
  EN_TRAITEMENT: { fr: "En cours de traitement", en: "Being handled" },
  EN_ATTENTE: { fr: "Complément attendu", en: "Awaiting information" },
  RESOLUE: { fr: "Résolue", en: "Resolved" },
  CLOTUREE: { fr: "Clôturée", en: "Closed" },
};

/** Ce que le statut implique concrètement pour la personne qui suit son dossier. */
export const STATUS_HINT: Record<GrievanceStatus, Bilingual> = {
  NOUVELLE: {
    fr: "Votre plainte est enregistrée et attend son examen de recevabilité.",
    en: "Your grievance is registered and awaiting its admissibility review.",
  },
  RECEVABLE: {
    fr: "Votre plainte relève bien du mécanisme : elle est retenue pour instruction.",
    en: "Your grievance falls within the mechanism: it has been accepted for investigation.",
  },
  IRRECEVABLE: {
    fr: "Votre plainte ne relève pas du périmètre du mécanisme. Les motifs vous sont communiqués, et les voies de recours de droit commun restent ouvertes.",
    en: "Your grievance falls outside the scope of the mechanism. The reasons are communicated to you, and ordinary remedies remain open.",
  },
  EN_TRAITEMENT: {
    fr: "Un agent responsable instruit votre dossier.",
    en: "A responsible officer is handling your case.",
  },
  EN_ATTENTE: {
    fr: "L'instruction est suspendue dans l'attente d'une précision de votre part.",
    en: "The investigation is on hold pending a clarification from you.",
  },
  RESOLUE: {
    fr: "Une décision a été rendue et les suites ont été engagées.",
    en: "A decision has been issued and follow-up action has been taken.",
  },
  CLOTUREE: {
    fr: "Le dossier est clos. Vous pouvez en demander le réexamen en citant votre numéro de référence.",
    en: "The case is closed. You may request a review quoting your reference number.",
  },
};

/** Statuts qui referment le dossier : ni délai restant, ni suite attendue. */
export const isClosingStatus = (status: GrievanceStatus): boolean =>
  status === "CLOTUREE" || status === "IRRECEVABLE";

/** Dossiers comptés comme « en cours » dans les indicateurs de la console. */
export const isOpenStatus = (status: GrievanceStatus): boolean =>
  !isClosingStatus(status) && status !== "RESOLUE";

/** Tonalité de la pastille d'état, côté console comme côté public. */
export const STATUS_TONE: Record<GrievanceStatus, "new" | "info" | "warn" | "ok" | "off"> = {
  NOUVELLE: "new",
  RECEVABLE: "info",
  IRRECEVABLE: "off",
  EN_TRAITEMENT: "info",
  EN_ATTENTE: "warn",
  RESOLUE: "ok",
  CLOTUREE: "off",
};

/* --- Priorités ------------------------------------------------------------ */

export const GRIEVANCE_PRIORITIES = ["BASSE", "NORMALE", "HAUTE", "CRITIQUE"] as const;

export type GrievancePriority = (typeof GRIEVANCE_PRIORITIES)[number];

/** Interne à la console : la priorité n'est jamais publiée. */
export const PRIORITY_LABEL: Record<GrievancePriority, string> = {
  BASSE: "Basse",
  NORMALE: "Normale",
  HAUTE: "Haute",
  CRITIQUE: "Critique",
};

/* --- Historique ----------------------------------------------------------- */

export const GRIEVANCE_EVENT_TYPES = [
  "DEPOT",
  "STATUT",
  "ETAPE",
  "PRIORITE",
  "AFFECTATION",
  "NOTE",
  "MESSAGE",
  "CONTACT",
] as const;

export type GrievanceEventType = (typeof GRIEVANCE_EVENT_TYPES)[number];

export const EVENT_TYPE_LABEL: Record<GrievanceEventType, string> = {
  DEPOT: "Dépôt",
  STATUT: "Statut",
  ETAPE: "Étape",
  PRIORITE: "Priorité",
  AFFECTATION: "Affectation",
  NOTE: "Note interne",
  MESSAGE: "Message au plaignant",
  CONTACT: "Contact journalisé",
};

/* --- Délai de traitement -------------------------------------------------- */

/** Engagement public de l'Unité, affiché sur la page MGP et sur le suivi. */
export const SLA_DAYS = 30;

const DAY_MS = 86_400_000;

/** Échéance d'un dossier, figée à son dépôt. */
export const dueDateFrom = (submittedAt: Date): Date =>
  new Date(submittedAt.getTime() + SLA_DAYS * DAY_MS);

/**
 * Jours restants avant l'échéance, négatifs une fois celle-ci dépassée.
 * Arrondi au plafond : tant qu'il reste quelques heures, il reste « 1 jour ».
 */
export const daysUntil = (date: Date, now: number = Date.now()): number =>
  Math.ceil((date.getTime() - now) / DAY_MS);

/* --- Numéro de référence -------------------------------------------------- */

/**
 * Alphabet du suffixe : base 32 de Crockford, sans I, L, O ni U.
 * Motif de ce choix : le numéro se recopie à la main depuis un écran, se dicte
 * au téléphone et se lit parfois sur un papier froissé. Retirer les caractères
 * qui se confondent avec 1 et 0 supprime la faute de frappe la plus courante,
 * et écarter U évite de former des mots par hasard.
 */
export const REFERENCE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Longueur du suffixe tiré au sort : 8 symboles, soit 40 bits d'entropie. */
export const REFERENCE_LENGTH = 8;

export const REFERENCE_PREFIX = "UGPTN-MGP";

/** Construit le motif depuis l'alphabet, pour qu'un seul endroit fasse foi. */
export const REFERENCE_PATTERN = new RegExp(
  `^${REFERENCE_PREFIX}-\\d{4}-[${REFERENCE_ALPHABET}]{${REFERENCE_LENGTH}}$`,
);

/**
 * Forme canonique d'un numéro saisi à la main.
 *
 * On retire TOUT ce qui n'est pas alphanumérique avant de reformer le numéro,
 * plutôt que de traiter les séparateurs un à un : la personne recopie depuis un
 * écran ou un SMS, avec des espaces, des points ou un tiret cadratin collé par
 * un traitement de texte. Le suivi doit répondre dans tous ces cas.
 */
export const normalizeReference = (value: string): string => {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const head = REFERENCE_PREFIX.replace("-", "");
  if (!compact.startsWith(head)) return compact;
  const rest = compact.slice(head.length);
  return `${REFERENCE_PREFIX}-${rest.slice(0, 4)}-${rest.slice(4)}`;
};

export const isValidReference = (value: string): boolean => REFERENCE_PATTERN.test(value);

/* --- Garde-fous de saisie ------------------------------------------------- */

export const isGrievanceStage = (value: string): value is GrievanceStage =>
  (GRIEVANCE_STAGES as readonly string[]).includes(value);

export const isGrievanceStatus = (value: string): value is GrievanceStatus =>
  (GRIEVANCE_STATUSES as readonly string[]).includes(value);

export const isGrievancePriority = (value: string): value is GrievancePriority =>
  (GRIEVANCE_PRIORITIES as readonly string[]).includes(value);

/** Longueurs maximales acceptées par le formulaire public et par le serveur. */
export const LIMITS = {
  description: 6000,
  descriptionMin: 20,
  fullName: 120,
  email: 254,
  phone: 40,
  province: 80,
  attachments: 10,
  attachmentName: 180,
  note: 4000,
  message: 2000,
} as const;
