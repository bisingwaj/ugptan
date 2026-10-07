/**
 * Jeton d'abonnement et liens absolus qui le portent.
 *
 * ⚠️ Module SERVEUR : il tire `node:crypto`. Les constantes qu'il utilise
 * vivent dans `./model`, sans import, pour rester lisibles du navigateur.
 *
 * Les liens sont ABSOLUS et composés depuis `APP_ORIGIN` : un e-mail n'a pas
 * d'origine, un chemin relatif n'y mène nulle part.
 */
import { createHash, randomBytes } from "node:crypto";
import type { Lang } from "@/lib/pick";
import { APP_ORIGIN } from "@/lib/email/config";
import { NEWSLETTER_CONFIRM, NEWSLETTER_UNSUBSCRIBE, TOKEN_PARAM, TOKEN_LENGTH } from "./model";

/**
 * Jeton de gestion d'abonnement : 32 octets tirés d'une source
 * cryptographique, rendus en hexadécimal.
 *
 * `randomBytes` et non `Math.random()` : ce jeton est la seule chose qui
 * autorise à désabonner une adresse, il ne doit pas être devinable à partir
 * d'un autre.
 */
export const nouveauToken = (): string => randomBytes(TOKEN_LENGTH / 2).toString("hex");

/**
 * Empreinte SHA-256 (hexadécimal) d'un jeton de confirmation : c'est elle, et
 * non le jeton, qu'enregistre `NewsletterSubscriber.confirmTokenHash`.
 *
 * Un hachage simple, sans sel ni étirement, suffit ici : le jeton est tiré au
 * sort sur 256 bits, il n'y a pas de dictionnaire à opposer à une attaque par
 * force brute. Le but est seulement qu'une copie de la table ne contienne
 * aucun lien de confirmation utilisable.
 */
export const empreinteJeton = (token: string): string =>
  createHash("sha256").update(token, "utf8").digest("hex");

/**
 * Clé de limitation de débit pour une adresse DESTINATAIRE (cf.
 * lib/rate-limit.ts). Empreinte et non adresse en clair : le compteur vit dans
 * Redis, qui n'a pas à devenir un second fichier d'adresses.
 */
export const cleAdresse = (prefixe: string, email: string): string =>
  `${prefixe}:${createHash("sha256").update(email, "utf8").digest("hex").slice(0, 32)}`;

const lien = (lang: Lang, chemin: string, token: string): string =>
  `${APP_ORIGIN}/${lang}${chemin}?${TOKEN_PARAM}=${token}`;

/** Lien de désabonnement, à porter par toute campagne comme par le message de bienvenue. */
export const lienDesabonnement = (lang: Lang, token: string): string =>
  lien(lang, NEWSLETTER_UNSUBSCRIBE, token);

/**
 * Adresse du désabonnement en UN CLIC, celle que porte l'en-tête
 * `List-Unsubscribe` des messages de liste.
 *
 * Elle diffère du lien précédent sur deux points, et les deux comptent :
 *   · elle ne porte pas de langue, n'étant jamais lue par un humain ;
 *   · elle vise une route d'API qui n'accepte que le POST (cf. RFC 8058),
 *     là où le lien humain mène à une page qui demande un geste.
 */
export const adresseDesabonnementUnClic = (token: string): string =>
  `${APP_ORIGIN}/api/newsletter/unsubscribe?${TOKEN_PARAM}=${token}`;

/**
 * Lien de confirmation d'inscription (double confirmation). Envoyé à toute
 * adresse saisie qui n'est pas déjà active, nouvelle ou désabonnée : l'inscrire
 * sans ce clic reviendrait à abonner quelqu'un parce qu'un tiers a tapé son
 * adresse (cf. actions/newsletter.ts).
 *
 * ⚠️ `token` est ici le jeton de CONFIRMATION, à usage unique, et non le jeton
 * de gestion de l'abonnement : les deux ne se confondent pas.
 */
export const lienConfirmation = (lang: Lang, token: string): string =>
  lien(lang, NEWSLETTER_CONFIRM, token);
