/**
 * Vocabulaire de la newsletter : états, provenances, normalisation d'adresse.
 *
 * ⚠️ Aucun import : ce module est lu par le formulaire public (composant
 * client), par les actions serveur et par la console. Tirer Prisma ou `node:`
 * ici les ferait voyager dans le paquet du navigateur.
 *
 * Les valeurs de `NewsletterStatut` reproduisent l'enum `NewsletterStatus` du
 * schéma Prisma — les deux doivent rester alignées.
 */

export const NEWSLETTER_STATUTS = ["ACTIVE", "UNSUBSCRIBED"] as const;
export type NewsletterStatut = (typeof NEWSLETTER_STATUTS)[number];

export const STATUT_LABEL: Record<NewsletterStatut, string> = {
  ACTIVE: "Actif",
  UNSUBSCRIBED: "Désabonné",
};

/** Classe de pastille de la console (cf. styles/dashboard.css). */
export const STATUT_BADGE: Record<NewsletterStatut, string> = {
  ACTIVE: "adm-badge--on",
  UNSUBSCRIBED: "adm-badge--off",
};

export const estStatut = (valeur: string): valeur is NewsletterStatut =>
  (NEWSLETTER_STATUTS as readonly string[]).includes(valeur);

/**
 * Provenances connues. `source` reste une chaîne libre en base — un import
 * futur nommera la sienne sans migration — mais celles-ci ont un libellé.
 */
export const SOURCE_LABEL: Record<string, string> = {
  site: "Formulaire du site",
  console: "Saisie console",
  import: "Import de liste",
};

export const sourceLabel = (source: string): string => SOURCE_LABEL[source] ?? source;

/**
 * Longueur maximale acceptée pour une adresse. Alignée sur la limite de la
 * RFC 5321 et sur `isValidEmail` (cf. lib/auth/validate.ts), qui reste l'unique
 * juge de la validité : on ne réécrit pas une seconde règle ici.
 */
export const EMAIL_MAX = 254;

/**
 * Forme canonique d'une adresse : c'est elle qui est écrite, c'est sur elle que
 * porte la contrainte d'unicité, et c'est donc elle qui empêche « Jean@Mail.CD »
 * de s'inscrire une seconde fois sous « jean@mail.cd ».
 */
export const normalizeEmail = (valeur: unknown): string =>
  typeof valeur === "string" ? valeur.trim().replace(/\s+/g, "").toLowerCase().slice(0, EMAIL_MAX) : "";

/**
 * Adresse partiellement masquée, pour les pages publiques de gestion
 * d'abonnement.
 *
 * Le porteur du lien a reçu l'e-mail et connaît donc l'adresse : le masque ne
 * lui apprend rien. Il vaut pour le cas contraire — un lien transféré, ouvert
 * sur un écran partagé, retrouvé dans un historique : l'adresse complète n'a
 * pas à s'y afficher, tout en restant reconnaissable par son titulaire.
 */
export function masqueEmail(email: string): string {
  const [local, domaine] = email.split("@");
  if (!domaine) return "•••";
  const debut = local.slice(0, local.length > 3 ? 2 : 1);
  return `${debut}${"•".repeat(Math.max(3, local.length - debut.length))}@${domaine}`;
}

/* --- Protection du formulaire public -------------------------------------- */

/**
 * Nom du champ leurre. Invisible et vide pour un humain, rempli par la plupart
 * des robots qui remplissent tout ce qu'ils trouvent : une valeur non vide vaut
 * refus. Nommé comme un champ plausible — « website » — sans quoi le leurre se
 * repère.
 */
export const HONEYPOT_FIELD = "website";

/**
 * Délai minimal, en millisecondes, entre l'affichage du formulaire et son
 * envoi. Une personne qui saisit son adresse met plus de deux secondes ; un
 * script en met zéro.
 */
export const MIN_FILL_MS = 2000;

/** Cinq inscriptions par quart d'heure et par adresse IP : au-delà, c'est un script. */
export const SUBSCRIBE_LIMIT = 5;
export const SUBSCRIBE_WINDOW_MS = 15 * 60 * 1000;

/** Le renvoi d'un lien de désabonnement est plus rare encore. */
export const UNSUBSCRIBE_LINK_LIMIT = 3;
export const UNSUBSCRIBE_LINK_WINDOW_MS = 30 * 60 * 1000;

/* --- Jeton de gestion d'abonnement ---------------------------------------- */

/**
 * Longueur du jeton porté par les liens de gestion d'abonnement, en caractères
 * hexadécimaux (32 octets tirés au sort). Ce jeton n'ouvre qu'une chose :
 * l'abonnement auquel il se rattache. Il est néanmoins assez long pour qu'un
 * balayage soit sans espoir.
 */
export const TOKEN_LENGTH = 64;

export const estToken = (valeur: unknown): valeur is string =>
  typeof valeur === "string" && new RegExp(`^[a-f0-9]{${TOKEN_LENGTH}}$`).test(valeur);

/* --- Pages publiques de gestion d'abonnement ------------------------------ */

/**
 * Chemins des deux pages de service, hors navigation et hors sitemap : on n'y
 * arrive que par le lien d'un e-mail ou par le pied du formulaire.
 *
 * Déclarés ici plutôt que dans `lib/routes.ts` : ce dernier est la source du
 * sitemap, et une page de service n'a rien à y faire.
 */
export const NEWSLETTER_UNSUBSCRIBE = "/newsletter/unsubscribe";
export const NEWSLETTER_CONFIRM = "/newsletter/confirm";

/** Paramètre d'URL portant le jeton. Court, parce qu'il voyage dans un e-mail. */
export const TOKEN_PARAM = "t";
