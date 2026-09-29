/**
 * Lecture de la liste d'abonnés : filtres, tri, mise en forme des lignes.
 *
 * Ce module existe pour une raison précise : l'écran de la console et l'export
 * doivent porter sur EXACTEMENT la même sélection. Un administrateur qui filtre
 * sur « désabonnés » puis exporte doit obtenir ces lignes-là, pas la liste
 * entière. Deux constructions de requête séparées finiraient par diverger, donc
 * il n'y en a qu'une.
 *
 * ⚠️ Module SERVEUR : il parle à Prisma.
 */
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { LANGS, type Lang } from "@/lib/pick";
import { estStatut, normalizeEmail, sourceLabel, STATUT_LABEL, type NewsletterStatut } from "./model";

/**
 * Inscription que personne n'a encore vue dans la console. État partagé par
 * l'équipe (cf. `NewsletterSubscriber.readAt`). Une adresse inscrite puis
 * désabonnée avant d'avoir été vue ne compte pas : il n'y a plus rien à signaler.
 *
 * Un seul filtre, le même pour la bulle et pour les lignes « Nouveau ».
 */
export const NOUVEAUX_WHERE = {
  readAt: null,
  status: "ACTIVE",
} as const satisfies Prisma.NewsletterSubscriberWhereInput;

/** Nombre de nouvelles inscriptions — la valeur de la bulle. */
export const compterNouveauxAbonnes = (): Promise<number> =>
  db().newsletterSubscriber.count({ where: NOUVEAUX_WHERE });

/** Filtres tels qu'ils voyagent dans l'URL de la liste. */
export type FiltresBruts = {
  q?: string;
  statut?: string;
  langue?: string;
  source?: string;
};

/** Filtres validés : tout ce qui n'est pas reconnu est écarté, jamais deviné. */
export type Filtres = {
  q: string | null;
  statut: NewsletterStatut | null;
  langue: Lang | null;
  source: string | null;
};

export function lireFiltres(params: FiltresBruts): Filtres {
  const q = params.q?.trim().slice(0, 120) || null;
  const statut = params.statut && estStatut(params.statut) ? params.statut : null;
  const langue = LANGS.includes(params.langue as Lang) ? (params.langue as Lang) : null;
  const source = params.source?.trim().slice(0, 40) || null;

  return { q, statut, langue, source };
}

export const filtreActif = (filtres: Filtres): boolean =>
  Boolean(filtres.q || filtres.statut || filtres.langue || filtres.source);

/**
 * Clause `where` correspondant aux filtres.
 *
 * La recherche porte sur l'adresse normalisée : saisir « Jean@Mail.CD » doit
 * retrouver la ligne enregistrée en minuscules. `contains` et non `equals` —
 * on cherche aussi bien un domaine entier (« @gouv.cd ») qu'une adresse.
 */
export function whereAbonnes(filtres: Filtres) {
  return {
    ...(filtres.statut ? { status: filtres.statut } : {}),
    ...(filtres.langue ? { lang: filtres.langue } : {}),
    ...(filtres.source ? { source: filtres.source } : {}),
    ...(filtres.q
      ? { email: { contains: normalizeEmail(filtres.q), mode: "insensitive" as const } }
      : {}),
  };
}

/** Champs lus pour l'affichage comme pour l'export. Rien de plus n'en sort. */
export const CHAMPS_LISTE = {
  id: true,
  email: true,
  status: true,
  lang: true,
  source: true,
  subscribedAt: true,
  unsubscribedAt: true,
} as const;

export type LigneAbonne = {
  id: string;
  email: string;
  status: string;
  lang: string;
  source: string;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
};

/* --- Mise en forme pour l'export ------------------------------------------ */

/**
 * En-têtes du fichier exporté, en français : le fichier s'ouvre dans un tableur
 * et se lit sans documentation.
 */
export const COLONNES_EXPORT = [
  "Adresse e-mail",
  "Date d'inscription",
  "Statut",
  "Langue",
  "Provenance",
  "Date de désabonnement",
] as const;

/**
 * Dates au format ISO court (AAAA-MM-JJ), à l'heure de Kinshasa.
 *
 * Ni `formatDate` ni le format français : un tableur trie une date ISO
 * correctement quelle que soit la configuration régionale du poste, là où
 * « 23 juin 2025 » se retrouve trié comme du texte.
 */
const jourKinshasa = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Africa/Kinshasa",
});

const jour = (date: Date | null): string => (date ? jourKinshasa.format(date) : "");

/** Une ligne de tableur par abonné, dans l'ordre de `COLONNES_EXPORT`. */
export const ligneExport = (abonne: LigneAbonne): string[] => [
  abonne.email,
  jour(abonne.subscribedAt),
  STATUT_LABEL[abonne.status as NewsletterStatut] ?? abonne.status,
  abonne.lang.toUpperCase(),
  sourceLabel(abonne.source),
  jour(abonne.unsubscribedAt),
];
