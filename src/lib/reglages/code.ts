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

/**
 * Nom du cookie de laissez-passer.
 *
 * Sans point ni caractère réservé : le nom se retrouve tel quel dans l'en-tête
 * `Cookie`, et un point y passerait mais complique les inspections manuelles.
 */
export const COOKIE_ACCES = "ugptn_acces_maintenance";

/** Durée du laissez-passer. Une reprise s'étale rarement au-delà. */
export const ACCES_DUREE_S = 12 * 60 * 60;

/** Forme attendue d'un code : six chiffres, ni plus ni moins. */
export const CODE_MOTIF = /^[0-9]{6}$/;

/**
 * Code tiré au sort, proposé par la console.
 *
 * ⚠️ `crypto.getRandomValues` et NON `Math.random()`. Ce code est le seul
 * secret qui rouvre le site entier pendant douze heures : c'est un secret, et
 * un secret ne se tire pas avec un générateur prévisible. `Math.random()` n'est
 * pas conçu pour résister à la prédiction — son état interne se reconstitue à
 * partir de quelques tirages observés, et la console en produit un par
 * fermeture, toujours dans le même onglet.
 *
 * Aucun import : `crypto` est global dans le navigateur comme dans Node depuis
 * la v19, ce qui préserve la règle de ce module (cf. son en-tête) — il est lu
 * des deux côtés et ne doit rien importer.
 *
 * Le tirage est fait par REJET plutôt qu'en repliant un entier par modulo : un
 * modulo sur une plage qui ne divise pas 2³² rend certains codes plus probables
 * que d'autres. L'écart est minime ici, mais un tirage biaisé se corrige une
 * fois et se prouve, là où il s'explique mal.
 */
export function codeAleatoire(): string {
  // Zéro exclu du premier chiffre : un code affiché « 042137 » se recopie mal
  // au téléphone, et son zéro de tête disparaît dans un tableur.
  const PLAGE = 900_000; // de 100000 à 999999 inclus
  const LIMITE = Math.floor(0x1_0000_0000 / PLAGE) * PLAGE;

  const tampon = new Uint32Array(1);
  let tirage: number;
  do {
    crypto.getRandomValues(tampon);
    tirage = tampon[0];
  } while (tirage >= LIMITE);

  return String(100_000 + (tirage % PLAGE));
}
