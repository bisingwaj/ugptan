/**
 * Session administrateur : jeton `base64url(payload).base64url(HMAC-SHA256)`.
 *
 * ⚠️ Web Crypto UNIQUEMENT — aucun import `node:` ici. Ce module est évalué par
 * `src/proxy.ts` (qui tourne en Node sous Next 16, mais qu'on garde agnostique)
 * autant que par les server actions. Le scrypt du mot de passe vit à part, dans
 * `lib/auth/password.ts`, importé seulement par l'action de connexion.
 */
import { ADMIN_BASE } from "@/lib/admin";

export const SESSION_COOKIE = "ugptn_sess";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 h

export type AdminRole = "admin";

export type SessionPayload = {
  /** Identifiant du compte. Deviendra `User.id` quand la table arrivera. */
  sub: string;
  role: AdminRole;
  /** Expiration absolue, en secondes epoch. */
  exp: number;
};

/** État renvoyé par `loginAction` au formulaire (cf. actions/admin-auth.ts). */
export type LoginState = { error: string | null };

/**
 * Attributs du cookie de session.
 * - pas de préfixe `__Host-` : il imposerait `Path=/`, incompatible avec le
 *   cloisonnement ci-dessous ; pas de `__Secure-` non plus, rejeté sur http://localhost.
 * - `path: ADMIN_BASE` : le cookie n'est jamais envoyé sur les pages publiques.
 */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: ADMIN_BASE,
  maxAge: SESSION_MAX_AGE,
} as const;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let keyPromise: Promise<CryptoKey> | null = null;

/**
 * Clé HMAC dérivée de SESSION_SECRET.
 * Lue paresseusement : un accès au niveau module casserait `next build`, qui
 * évalue le module proxy sans les variables d'environnement d'exécution.
 */
function getKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return Promise.reject(new Error("SESSION_SECRET n'est pas défini."));
    keyPromise = crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
  }
  return keyPromise;
}

function b64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Uint8Array<ArrayBuffer> et non Uint8Array : crypto.subtle attend un
// BufferSource, qui exclut les vues sur SharedArrayBuffer.
function b64urlDecode(value: string): Uint8Array<ArrayBuffer> | null {
  try {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** Forge un jeton signé. Lève si SESSION_SECRET manque (échec visible côté action). */
export async function signSession(payload: SessionPayload): Promise<string> {
  const body = b64urlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(body));
  return `${body}.${b64urlEncode(new Uint8Array(signature))}`;
}

/**
 * Vérifie un jeton. Renvoie `null` sur TOUS les chemins d'échec et ne lève
 * jamais : cette fonction s'exécute à chaque requête de la console.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [body, signature] = parts;
    const signatureBytes = b64urlDecode(signature);
    const bodyBytes = b64urlDecode(body);
    if (!signatureBytes || !bodyBytes) return null;

    // subtle.verify compare en temps constant — pas de comparaison manuelle.
    const valid = await crypto.subtle.verify("HMAC", await getKey(), signatureBytes, encoder.encode(body));
    if (!valid) return null;

    const payload = JSON.parse(decoder.decode(bodyBytes)) as SessionPayload;
    if (payload?.role !== "admin" || typeof payload.sub !== "string") return null;
    if (typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

/** Payload d'une session neuve, expiration comprise. */
export function newSession(sub: string): SessionPayload {
  return { sub, role: "admin", exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
}
