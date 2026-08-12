/**
 * Hachage et vérification des mots de passe (scrypt).
 *
 * ⚠️ Module Node uniquement (`node:crypto`) — à n'importer QUE depuis les
 * server actions et les gardes serveur. Ne jamais l'importer depuis
 * `lib/auth/session.ts`, qui doit rester agnostique du runtime (cf. proxy).
 *
 * Format stocké dans `User.passwordHash` : `selHex:hashHex`. Le sel est tiré
 * au hasard par compte, donc deux mots de passe identiques ne produisent
 * jamais la même empreinte. Le mot de passe en clair n'est jamais écrit.
 */
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, SCRYPT_PARAMS, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

/** Empreinte d'un mot de passe, prête à être stockée. */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(plain, salt);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

/** `false` plutôt qu'une exception sur toute entrée malformée. */
export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;

  const salt = Buffer.from(parts[0], "hex");
  const expected = Buffer.from(parts[1], "hex");
  if (salt.length === 0 || expected.length !== KEY_LENGTH) return false;

  const actual = await derive(plain, salt);
  // timingSafeEqual lève si les longueurs diffèrent → tester avant.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * Calcul jeté, exécuté quand l'adresse saisie ne correspond à aucun compte.
 *
 * Sans lui, une adresse inconnue répondrait sans dérivation scrypt et donc
 * bien plus vite qu'une adresse connue : le chronomètre suffirait à énumérer
 * les comptes existants.
 */
export async function burnPasswordTime(plain: string): Promise<void> {
  await derive(plain, randomBytes(SALT_LENGTH));
}
