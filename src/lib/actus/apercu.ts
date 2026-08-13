/**
 * Jeton de prévisualisation d'un article non publié.
 *
 * Pourquoi un jeton plutôt que la session de la console : le cookie de session
 * porte `Path=/7hj3nrpgaz6fjtw7` (cf. lib/auth/session.ts), il n'est donc JAMAIS
 * envoyé sur `/fr/actualites/…`. La page publique ne peut pas savoir qui la
 * consulte ; l'autorisation voyage dans l'URL, signée.
 *
 * Le jeton est volontairement court de durée et ne porte qu'un identifiant
 * d'article : divulgué, il n'ouvre qu'un brouillon, jamais la console.
 *
 * ⚠️ Web Crypto uniquement, comme `lib/auth/session.ts` : aucun import `node:`.
 */

/** Deux heures : le temps d'une relecture, pas celui d'un partage durable. */
const DUREE_MS = 2 * 60 * 60 * 1000;

/** Paramètre de requête porteur du jeton. */
export const APERCU_PARAM = "apercu";

/**
 * Séparation de domaine : le message signé est préfixé, de sorte qu'un jeton de
 * session ne puisse jamais être présenté comme un jeton d'aperçu, ni l'inverse.
 */
const PREFIXE = "apercu-actu.v1.";

const encoder = new TextEncoder();

let keyPromise: Promise<CryptoKey> | null = null;

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

function b64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64url(value: string): Uint8Array<ArrayBuffer> | null {
  try {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** Forge un lien d'aperçu pour un article. */
export async function signerApercu(articleId: string, duree = DUREE_MS): Promise<string> {
  const body = b64url(encoder.encode(JSON.stringify({ id: articleId, exp: Date.now() + duree })));
  const signature = await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(PREFIXE + body));
  return `${body}.${b64url(new Uint8Array(signature))}`;
}

/**
 * Identifiant d'article porté par un jeton valide, `null` sinon.
 * Ne lève jamais : la page publique la traverse à chaque requête portant le
 * paramètre, y compris quand il est saisi au hasard.
 */
export async function verifierApercu(token: string | null | undefined): Promise<string | null> {
  if (!token) return null;

  try {
    const [body, signature] = token.split(".");
    if (!body || !signature) return null;

    const signatureBytes = unb64url(signature);
    const bodyBytes = unb64url(body);
    if (!signatureBytes || !bodyBytes) return null;

    const valide = await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      signatureBytes,
      encoder.encode(PREFIXE + body),
    );
    if (!valide) return null;

    const payload = JSON.parse(new TextDecoder().decode(bodyBytes)) as { id?: unknown; exp?: unknown };
    if (typeof payload.id !== "string" || !payload.id) return null;
    if (typeof payload.exp !== "number" || payload.exp <= Date.now()) return null;

    return payload.id;
  } catch {
    return null;
  }
}
