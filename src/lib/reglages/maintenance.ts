/**
 * Fermeture du site public — lecture de l'état et laissez-passer.
 *
 * Le principe tient en trois pièces :
 *
 *   1. une ligne unique en base (`Reglages`) porte l'état, le code à six
 *      chiffres, l'heure de réouverture annoncée et le message facultatif ;
 *   2. le layout du segment `[lang]` lit cet état et, si le site est fermé,
 *      substitue l'écran de maintenance à la page demandée. L'adresse ne change
 *      pas : le visiteur qui saisit le code retombe exactement là où il allait ;
 *   3. le code ouvre un laissez-passer déposé en cookie. Ce n'est JAMAIS le code
 *      qui voyage, mais sa signature HMAC : un cookie volé ne révèle rien, et
 *      changer le code invalide d'un coup tous les laissez-passer distribués.
 *
 * ⚠️ Ce dispositif ferme une vitrine, il ne protège pas un secret. Les données
 * qui exigent une autorisation sont derrière la console et ses gardes
 * (cf. lib/auth/guard.ts). Ici, l'enjeu est de ne pas montrer un site en cours
 * de reprise, pas d'interdire l'accès à une information sensible.
 */
import { cache } from "react";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { describeError } from "@/lib/errors";

/** Identifiant de la ligne unique de réglages. */
export const REGLAGES_ID = "site";

/**
 * Nom du cookie de laissez-passer.
 *
 * Sans point ni caractère réservé : le nom se retrouve tel quel dans l'en-tête
 * `Cookie`, et un point y passerait mais complique les inspections manuelles.
 */
export const COOKIE_ACCES = "ugptn_acces_maintenance";

/** Durée du laissez-passer. Une reprise s'étale rarement au-delà. */
export const ACCES_DUREE_S = 12 * 60 * 60;

export type EtatMaintenance = {
  ferme: boolean;
  /** Code en clair. Jamais rendu au public : il ne sert qu'à vérifier une saisie. */
  code: string | null;
  depuis: Date | null;
  jusqua: Date | null;
  messages: { fr: string | null; en: string | null };
};

const OUVERT: EtatMaintenance = {
  ferme: false,
  code: null,
  depuis: null,
  jusqua: null,
  messages: { fr: null, en: null },
};

/**
 * État de fermeture, lu une seule fois par requête.
 *
 * ⚠️ EN CAS DE PANNE, LE SITE RESTE OUVERT. C'est le seul repli défendable :
 * une salve du transport vers Neon (cf. lib/lecture.ts) ne doit pas fermer un
 * site que personne n'a décidé de fermer. Le risque symétrique — laisser voir
 * une page pendant une reprise — est sans commune mesure.
 */
export const etatMaintenance = cache(async (): Promise<EtatMaintenance> => {
  try {
    const ligne = await db().reglages.findUnique({ where: { id: REGLAGES_ID } });
    if (!ligne?.maintenance) return OUVERT;
    return {
      ferme: true,
      code: ligne.maintenanceCode,
      depuis: ligne.maintenanceSince,
      jusqua: ligne.maintenanceUntil,
      messages: { fr: ligne.maintenanceFr, en: ligne.maintenanceEn },
    };
  } catch (error) {
    console.warn(`[maintenance] état illisible, site laissé ouvert. ${describeError(error)}`);
    return OUVERT;
  }
});

/**
 * Secret de signature. Celui de Better Auth, plutôt qu'un secret de plus à
 * gérer : les deux vivent le même cycle de vie et la même exigence de rotation.
 *
 * Absent, aucun laissez-passer n'est signé ni accepté. L'écran de maintenance
 * s'affiche alors sans porte de sortie, ce qui vaut mieux qu'une porte dont la
 * serrure ne ferme pas.
 */
function secret(): string | null {
  return process.env.BETTER_AUTH_SECRET || null;
}

/** Empreinte du code, seule valeur déposée dans le navigateur. */
export function laissezPasser(code: string): string | null {
  const cle = secret();
  if (!cle) return null;
  return createHmac("sha256", cle).update(`maintenance:${code}`).digest("hex");
}

/** Comparaison à durée constante de deux chaînes de même alphabet. */
function memeValeur(a: string, b: string): boolean {
  const ta = Buffer.from(a, "utf8");
  const tb = Buffer.from(b, "utf8");
  // `timingSafeEqual` exige des longueurs égales ; la comparer d'abord ne fuit
  // que la longueur, qui est ici publique (six chiffres, ou une empreinte hex).
  return ta.length === tb.length && timingSafeEqual(ta, tb);
}

/** Le cookie présenté ouvre-t-il le site, pour le code actuellement en vigueur ? */
export function accesOuvert(cookie: string | undefined, code: string | null): boolean {
  if (!cookie || !code) return false;
  const attendu = laissezPasser(code);
  return attendu !== null && memeValeur(cookie, attendu);
}

/** La saisie correspond-elle au code en vigueur ? */
export function codeValide(saisi: string, code: string | null): boolean {
  if (!code) return false;
  return memeValeur(saisi, code);
}

/**
 * L'écran de maintenance doit-il remplacer la page, pour CETTE requête ?
 *
 * Renvoie l'état quand il faut fermer, `null` quand il faut servir le site.
 *
 * ⚠️ L'ordre des deux lectures n'est pas indifférent. `cookies()` bascule le
 * rendu en dynamique : l'appeler d'abord priverait TOUTES les pages publiques
 * de leur prérendu, y compris les 364 jours où le site est ouvert. Il n'est
 * donc lu qu'une fois la fermeture constatée, cas où le rendu dynamique est de
 * toute façon ce que l'on veut.
 */
export async function fermetureApplicable(): Promise<EtatMaintenance | null> {
  const etat = await etatMaintenance();
  if (!etat.ferme) return null;
  const jeton = (await cookies()).get(COOKIE_ACCES)?.value;
  return accesOuvert(jeton, etat.code) ? null : etat;
}

/**
 * Les écritures publiques doivent-elles être refusées ?
 *
 * Même question que `fermetureApplicable`, posée depuis une action plutôt que
 * depuis un rendu. Elle a sa raison d'être : la fermeture masque les
 * formulaires, elle ne les désarme pas. Un onglet ouvert avant la fermeture, ou
 * une requête forgée, poste encore vers l'action ; or une fermeture sert le
 * plus souvent à migrer des données, et une écriture qui arrive au milieu se
 * perd ou se contredit.
 *
 * ⚠️ À ne PAS poser sur les actions de RETRAIT (désabonnement, confirmation
 * d'abonnement depuis un lien reçu par courriel) : ces gestes-là restent dus à
 * la personne quoi qu'il arrive, et les bloquer pendant une intervention
 * reviendrait à retenir un consentement qu'elle veut retirer.
 */
export async function ecrituresSuspendues(): Promise<boolean> {
  return (await fermetureApplicable()) !== null;
}
