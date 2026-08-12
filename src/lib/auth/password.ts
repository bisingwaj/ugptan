/**
 * Vérification du mot de passe administrateur (scrypt).
 *
 * ⚠️ Module Node uniquement (`node:crypto`) — à n'importer QUE depuis
 * `actions/admin-auth.ts`. Ne jamais l'importer depuis `lib/auth/session.ts`,
 * qui doit rester agnostique du runtime (cf. proxy).
 *
 * Format stocké dans ADMIN_PASSWORD_HASH : `selHex:hashHex`.
 * Génération : cf. le commentaire de `.env.example`.
 */
import { scrypt, timingSafeEqual } from "node:crypto";

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const;
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, SCRYPT_PARAMS, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
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
