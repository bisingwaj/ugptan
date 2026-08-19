/**
 * États d'une traduction assistée, et ce que la console en dit.
 *
 * ⚠️ Aucun import serveur. Ce module est lu par les composants CLIENTS du
 * bandeau et des pastilles autant que par le service ; y faire entrer Prisma ou
 * `server-only` casserait le rendu. Même partage que `lib/actus/statut.ts`.
 *
 * Les valeurs reproduisent l'enum `TraductionStatut` du schéma Prisma : les
 * deux doivent rester alignées.
 */
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";

export type Statut = "EN_ATTENTE" | "EN_COURS" | "GENEREE" | "RELUE" | "ECHEC";

/** Libellé court, tel qu'il paraît dans un onglet ou une liste. */
export const STATUT_COURT: Record<Statut, string> = {
  EN_ATTENTE: "IA · en attente",
  EN_COURS: "IA · en cours",
  GENEREE: "IA · à relire",
  RELUE: "relue",
  ECHEC: "IA · échec",
};

/** Phrase complète, telle qu'elle paraît en tête du formulaire de la langue. */
export const STATUT_TITRE: Record<Statut, string> = {
  EN_ATTENTE: "Traduction demandée",
  EN_COURS: "Traduction en cours",
  GENEREE: "Traduction générée — à relire",
  RELUE: "Version relue",
  ECHEC: "La traduction n'a pas abouti",
};

/**
 * Tonalité d'affichage. Volontairement séparée du statut : `EN_COURS` interrompu
 * se peint comme une attente, pas comme un travail en cours — c'est ce que
 * l'œil doit comprendre.
 */
export type Ton = "attente" | "cours" | "relire" | "echec" | "neutre";

export function tonDe(statut: Statut, interrompue: boolean): Ton {
  if (statut === "ECHEC") return "echec";
  if (statut === "GENEREE") return "relire";
  if (statut === "EN_COURS") return interrompue ? "attente" : "cours";
  if (statut === "EN_ATTENTE") return "attente";
  return "neutre";
}

/**
 * La langue qui pourrait alimenter `cible`, ou `undefined` s'il n'y a rien à
 * composer.
 *
 * Répond à une question que le journal ne sait pas traiter : celle des contenus
 * que l'assistance n'a JAMAIS touchés. Un article publié en français avant la
 * mise en service n'a aucune ligne de suivi, donc aucun état, donc rien qui
 * proposerait de le traduire. Sans cette fonction, le seul moyen de lancer la
 * composition serait de réenregistrer le français, ce qu'aucun rédacteur ne
 * peut deviner.
 *
 * Le critère est `existe`, et non `complete` : une langue seulement ébauchée
 * appartient à la personne qui l'a commencée, et proposer de la « traduire »
 * inviterait à écraser son travail. Une ligne en base suppose au moins un
 * titre — un enregistrement vide est refusé par les actions — donc `!existe`
 * recouvre bien le « vide » qu'entend le service (cf. `aTraduire`).
 *
 * Aucune requête : les écrans connaissent déjà l'état de leurs langues.
 */
export function sourcePourTraduire(
  cible: Lang,
  existe: (locale: Lang) => boolean,
): Lang | undefined {
  if (existe(cible)) return undefined;
  return LOCALES.find((locale) => locale !== cible && existe(locale));
}

/**
 * Ce qu'un composant client reçoit : l'état, aplati et déjà mis en forme.
 *
 * Les dates arrivent en chaînes formatées côté serveur — un `Date` traversant
 * la frontière obligerait chaque composant à refaire le formatage, avec le
 * risque d'un rendu différent entre serveur et navigateur.
 */
export type EtatVue = {
  locale: Lang;
  sourceLocale: Lang;
  statut: Statut;
  interrompue: boolean;
  modele: string | null;
  erreur: string | null;
  produiteLe: string | null;
  relueLe: string | null;
  reluePar: string | null;
};
