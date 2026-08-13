/**
 * Vocabulaire des demandes de participation.
 *
 * ⚠️ Aucun import : ce module est lu par le formulaire public (client), par la
 * server action qui l'enregistre et par la console. Les valeurs de
 * `InscriptionStatut` reproduisent volontairement l'enum `InscriptionStatus` du
 * schéma Prisma — les deux doivent rester alignées.
 */

export const INSCRIPTION_STATUSES = ["RECUE", "CONFIRMEE", "LISTE_ATTENTE", "ANNULEE"] as const;
export type InscriptionStatut = (typeof INSCRIPTION_STATUSES)[number];

export const isInscriptionStatut = (value: string): value is InscriptionStatut =>
  (INSCRIPTION_STATUSES as readonly string[]).includes(value);

/** Libellés de la console. Le public ne voit jamais ces états. */
export const INSCRIPTION_LABEL: Record<InscriptionStatut, string> = {
  RECUE: "Reçue",
  CONFIRMEE: "Confirmée",
  LISTE_ATTENTE: "Liste d'attente",
  ANNULEE: "Annulée",
};

export const INSCRIPTION_HINT: Record<InscriptionStatut, string> = {
  RECUE: "Demande déposée, pas encore arbitrée.",
  CONFIRMEE: "Place accordée. La personne est attendue.",
  LISTE_ATTENTE: "Retenue si une place se libère.",
  ANNULEE: "Retirée, par l'Unité ou à la demande de la personne.",
};

/**
 * Une demande occupe-t-elle une place ?
 *
 * Seules les confirmations comptent. Une demande reçue n'est pas encore
 * arbitrée, une liste d'attente attend précisément qu'une place se libère, et
 * une annulation en rend une. Compter les quatre états ferait afficher une
 * salle pleine avant le premier arbitrage.
 */
export const occupeUnePlace = (statut: InscriptionStatut): boolean => statut === "CONFIRMEE";

/** Longueurs maximales acceptées à la saisie, appliquées côté serveur. */
export const INSCRIPTION_LIMITES = {
  nom: 120,
  email: 180,
  organisation: 140,
  telephone: 40,
  message: 600,
} as const;
