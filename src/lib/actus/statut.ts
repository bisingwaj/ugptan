/**
 * Cycle de vie d'un article — vocabulaire partagé.
 *
 * ⚠️ Aucun import : ce module est lu par les formulaires clients de la console,
 * par les gardes serveur et par la couche de lecture publique. Les valeurs
 * reproduisent volontairement l'enum `ArticleStatus` du schéma Prisma — les
 * deux doivent rester alignées.
 */

export const ARTICLE_STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"] as const;
export type ArticleStatut = (typeof ARTICLE_STATUSES)[number];

export const isArticleStatut = (value: string): value is ArticleStatut =>
  (ARTICLE_STATUSES as readonly string[]).includes(value);

export const STATUT_LABEL: Record<ArticleStatut, string> = {
  DRAFT: "Brouillon",
  SCHEDULED: "Programmé",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

export const STATUT_HINT: Record<ArticleStatut, string> = {
  DRAFT: "Visible de la seule console. Rien n'est servi au public.",
  SCHEDULED: "Paraîtra tout seul à la date choisie, sans intervention.",
  PUBLISHED: "En ligne dès que la date de publication est atteinte.",
  ARCHIVED: "Retiré du site, conservé en base avec son historique.",
};

/**
 * Statut RÉELLEMENT observé par un visiteur, date comprise.
 *
 * La distinction compte : un article `PUBLISHED` daté de la semaine prochaine
 * n'est pas en ligne, et un article `SCHEDULED` dont l'heure est passée l'est.
 * Aucune tâche planifiée n'entre en jeu — la bascule se fait à la lecture, ce
 * qui la rend exacte à la seconde et insensible à une panne de planificateur.
 */
export function statutEffectif(
  status: ArticleStatut,
  publishedAt: Date | null,
  now: Date = new Date(),
): ArticleStatut {
  if (status === "DRAFT" || status === "ARCHIVED") return status;
  if (!publishedAt) return "DRAFT";
  return publishedAt.getTime() <= now.getTime() ? "PUBLISHED" : "SCHEDULED";
}

/** Un article est-il servi au public à cet instant ? */
export const estEnLigne = (
  status: ArticleStatut,
  publishedAt: Date | null,
  now: Date = new Date(),
): boolean => statutEffectif(status, publishedAt, now) === "PUBLISHED";
