/**
 * Le code d'accès de la fermeture, et rien d'autre.
 *
 * ⚠️ Module SANS AUCUN IMPORT, et il doit le rester. Il est lu des deux côtés :
 * par les actions serveur qui valident une saisie, et par l'écran de la console
 * qui tire un code au sort dans le navigateur. Y ramener `next/headers`,
 * `node:crypto` ou le client Prisma casse la compilation du bundle client —
 * c'est arrivé, la console entière est tombée en 500.
 *
 * La vérification du code et la signature du laissez-passer, elles, restent
 * dans `maintenance.ts`, côté serveur exclusivement.
 */

/** Forme attendue d'un code : six chiffres, ni plus ni moins. */
export const CODE_MOTIF = /^[0-9]{6}$/;

/** Code tiré au sort, proposé par la console. */
export function codeAleatoire(): string {
  // Zéro exclu du premier chiffre : un code affiché « 042137 » se recopie mal
  // au téléphone, et son zéro de tête disparaît dans un tableur.
  const premier = 1 + Math.floor(Math.random() * 9);
  const reste = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `${premier}${reste}`;
}
