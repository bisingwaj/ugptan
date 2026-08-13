/**
 * Vocabulaire des événements : statut de publication d'un côté, phase dans le
 * temps de l'autre.
 *
 * ⚠️ Aucun import : ce module est lu par les formulaires clients de la console,
 * par les gardes serveur et par la couche de lecture publique. Les valeurs de
 * `EvenementStatut` reproduisent volontairement l'enum `EvenementStatus` du
 * schéma Prisma — les deux doivent rester alignées.
 *
 * ─── Deux axes, jamais confondus ─────────────────────────────────────────────
 *
 *   · le STATUT dit si la rédaction a mis la fiche en ligne (brouillon, publié,
 *     archivé). C'est une décision, elle se stocke ;
 *   · la PHASE dit où l'événement en est dans le temps (à venir, en cours,
 *     terminé). C'est un constat, il se calcule.
 *
 * Stocker la phase obligerait à repasser sur chaque fiche le lendemain de sa
 * tenue. La calculer à la lecture la rend exacte à la seconde et insensible à
 * une panne de planificateur — même choix que `statutEffectif` côté actualités.
 */

/* -------------------------------------------------------------------------- */
/* Statut de publication                                                       */
/* -------------------------------------------------------------------------- */

export const EVENEMENT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type EvenementStatut = (typeof EVENEMENT_STATUSES)[number];

export const isEvenementStatut = (value: string): value is EvenementStatut =>
  (EVENEMENT_STATUSES as readonly string[]).includes(value);

export const EVT_STATUT_LABEL: Record<EvenementStatut, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

export const EVT_STATUT_HINT: Record<EvenementStatut, string> = {
  DRAFT: "Visible de la seule console. Rien n'est servi au public.",
  PUBLISHED: "En ligne. L'événement apparaît dans la liste correspondant à sa date.",
  ARCHIVED: "Retiré du site, conservé en base avec son historique.",
};

/** Un événement est-il servi au public ? La date n'entre pas en jeu ici : un
 *  événement passé reste consultable, c'est la mémoire de l'activité. */
export const estPublie = (status: EvenementStatut): boolean => status === "PUBLISHED";

/* -------------------------------------------------------------------------- */
/* Modalité de participation                                                   */
/* -------------------------------------------------------------------------- */

export const EVENEMENT_MODES = ["PRESENTIEL", "EN_LIGNE", "HYBRIDE"] as const;
export type EvenementMode = (typeof EVENEMENT_MODES)[number];

export const isEvenementMode = (value: string): value is EvenementMode =>
  (EVENEMENT_MODES as readonly string[]).includes(value);

export const EVT_MODE_LABEL: Record<EvenementMode, string> = {
  PRESENTIEL: "Sur place",
  EN_LIGNE: "En ligne",
  HYBRIDE: "Sur place et en ligne",
};

export const EVT_MODE_HINT: Record<EvenementMode, string> = {
  PRESENTIEL: "Une adresse est attendue : c'est ce que le visiteur vient chercher.",
  EN_LIGNE: "Aucune adresse. Le lien de connexion tient lieu de lieu.",
  HYBRIDE: "Les deux : une salle et un lien de connexion.",
};

/* -------------------------------------------------------------------------- */
/* Phase dans le temps                                                         */
/* -------------------------------------------------------------------------- */

export const EVENEMENT_PHASES = ["A_VENIR", "EN_COURS", "TERMINE"] as const;
export type EvenementPhase = (typeof EVENEMENT_PHASES)[number];

export const isEvenementPhase = (value: string): value is EvenementPhase =>
  (EVENEMENT_PHASES as readonly string[]).includes(value);

/** Libellés de la console. Le site public a les siens, traduits (cf. content/i18n.ts). */
export const EVT_PHASE_LABEL: Record<EvenementPhase, string> = {
  A_VENIR: "À venir",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
};

/**
 * Décalage de Kinshasa (UTC+1), constant : la RDC n'applique pas d'heure d'été.
 * Répété ici plutôt qu'importé de `lib/format.ts` pour tenir la règle « aucun
 * import » de ce module, qui descend jusque dans le paquet du navigateur.
 */
const KINSHASA_OFFSET = "+01:00";

const jourKinshasa = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Africa/Kinshasa",
});

/**
 * Instant où un événement cesse d'être « en cours ».
 *
 * Sans `endAt`, la fin retenue est la FIN DU JOUR de début, à Kinshasa — et non
 * l'instant de début. Une rencontre annoncée à 9 h sans heure de fin serait
 * sinon « terminée » à 9 h 01, alors qu'elle se tient toute la matinée. Même
 * règle pour une journée entière, où l'heure saisie ne veut rien dire.
 */
export function finEffective(startAt: Date, endAt: Date | null): Date {
  if (endAt && endAt.getTime() > startAt.getTime()) return endAt;
  return new Date(`${jourKinshasa.format(startAt)}T23:59:59${KINSHASA_OFFSET}`);
}

/** Où en est l'événement, à l'instant où on le regarde. */
export function phaseEvenement(
  startAt: Date,
  endAt: Date | null,
  now: Date = new Date(),
): EvenementPhase {
  if (now.getTime() < startAt.getTime()) return "A_VENIR";
  return now.getTime() <= finEffective(startAt, endAt).getTime() ? "EN_COURS" : "TERMINE";
}

/**
 * Un événement en cours compte comme « à venir » partout où le site propose de
 * participer : il n'est pas trop tard pour rejoindre une session qui a commencé
 * ce matin. Cette règle est isolée ici pour que la liste publique, l'accueil et
 * le compteur du tableau de bord la partagent, au lieu de la réécrire chacun.
 */
export const estAVenir = (phase: EvenementPhase): boolean => phase !== "TERMINE";

/** Minuit à Kinshasa, pour le jour de `now`. */
export const debutDuJour = (now: Date = new Date()): Date =>
  new Date(`${jourKinshasa.format(now)}T00:00:00${KINSHASA_OFFSET}`);

/**
 * Traduction de `phaseEvenement` en clause Prisma, pour les écrans qui doivent
 * FILTRER et COMPTER dans la même requête — la console, dont la pagination
 * mentirait si le tri se faisait après lecture de la page.
 *
 * La règle de fin de journée est reproduite par une alternative :
 *   · une fin saisie fait foi ;
 *   · sans fin saisie, l'événement court jusqu'au bout de son jour de début,
 *     ce qui se teste en comparant `startAt` à MINUIT et non à l'instant.
 *
 * ⚠️ Les trois phases sont exprimées POSITIVEMENT, jamais par la négation de
 * l'une des autres. Écrit `NOT: { OR: [...] }`, le filtre « terminé » perdait
 * silencieusement toutes les fiches sans heure de fin : en SQL, `endAt >= now`
 * sur une colonne NULL ne vaut pas FAUX mais INCONNU, et `NOT (inconnu)` reste
 * inconnu — la ligne n'est donc retenue par aucune branche. Mesuré : le
 * lancement d'octobre 2025, pourtant affiché « Terminé » dans la liste,
 * disparaissait dès qu'on filtrait sur « Terminé ».
 *
 * ⚠️ Cette fonction et `phaseEvenement` disent la même chose de deux façons.
 * Toute correction de l'une appelle la même correction sur l'autre. Un écart
 * subsiste, assumé : `finEffective` ignore une fin ANTÉRIEURE OU ÉGALE au
 * début, ce qui suppose de comparer deux colonnes entre elles. La saisie
 * refusant déjà une fin antérieure au début (cf. actions/admin-evenements.ts),
 * le seul cas divergent est une fin strictement égale au début.
 */
export function clausePhase(phase: EvenementPhase, now: Date = new Date()): Record<string, unknown> {
  const minuit = debutDuJour(now);

  if (phase === "A_VENIR") return { startAt: { gt: now } };

  /** Fin dépassée : soit la fin saisie, soit le jour de début révolu. */
  const termine = {
    OR: [{ endAt: { lt: now } }, { endAt: null, startAt: { lt: minuit } }],
  };
  if (phase === "TERMINE") return termine;

  // En cours : commencé, et pas encore terminé — l'exacte réciproque, écrite
  // elle aussi sans négation.
  return {
    startAt: { lte: now },
    OR: [{ endAt: { gte: now } }, { endAt: null, startAt: { gte: minuit } }],
  };
}
