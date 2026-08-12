/**
 * Génération du numéro de référence d'une plainte.
 *
 * ⚠️ Module SERVEUR (`node:crypto`) : ne jamais l'importer depuis un composant
 * client. Le vocabulaire partagé avec le navigateur vit dans `./model.ts`.
 *
 * Le numéro est le seul justificatif dont dispose le plaignant, y compris
 * anonyme : il ouvre le suivi public. Il en découle deux exigences.
 *
 *   1. Il ne porte AUCUNE information sur la personne. Pas d'identifiant de
 *      base, pas de compteur, pas de dérivation d'un nom, d'un numéro de
 *      téléphone ou d'une adresse — même hachée, une dérivation permettrait de
 *      tester une hypothèse d'identité en recalculant l'empreinte.
 *   2. Il n'est pas devinable. Le suffixe est tiré du générateur cryptographique
 *      du système sur 8 symboles d'un alphabet de 32, soit 40 bits : environ
 *      1 100 milliards de combinaisons. Un balayage reste par ailleurs freiné
 *      par la limite de débit du suivi (cf. lib/rate-limit.ts).
 *
 * L'année, elle, est délibérément lisible : elle sert au classement interne et
 * à l'archivage, et ne dit rien de la personne.
 */
import { randomInt } from "node:crypto";
import { REFERENCE_ALPHABET, REFERENCE_LENGTH, REFERENCE_PREFIX } from "./model";

/**
 * `randomInt` et non `Math.random()` : ce tirage tient lieu de secret.
 * Le rejet du biais modulo est pris en charge par `node:crypto`.
 */
function randomCode(): string {
  let code = "";
  for (let i = 0; i < REFERENCE_LENGTH; i++) {
    code += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  }
  return code;
}

/** Ex. « UGPTN-MGP-2026-4KQ9XB3D ». */
export const buildReference = (year: number): string =>
  `${REFERENCE_PREFIX}-${year}-${randomCode()}`;

/**
 * Numéro libre en base.
 *
 * La collision est improbable (40 bits) mais pas impossible, et la contrainte
 * d'unicité de `Grievance.reference` la ferait remonter en erreur au dépôt —
 * c'est-à-dire au pire moment. On vérifie donc avant d'écrire, et l'unicité en
 * base reste le filet de sécurité de dernier ressort.
 */
export async function uniqueReference(
  exists: (reference: string) => Promise<boolean>,
  year: number = new Date().getFullYear(),
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = buildReference(year);
    if (!(await exists(reference))) return reference;
  }
  throw new Error("Impossible d'attribuer un numéro de référence libre.");
}
