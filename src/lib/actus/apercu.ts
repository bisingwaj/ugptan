/**
 * Jeton de prévisualisation d'un article non publié.
 *
 * Pourquoi un jeton plutôt que la session de la console : une relecture avant
 * publication se demande à qui de droit — un responsable de composante, un
 * chargé de communication — qui n'a pas forcément de compte. Le lien doit donc
 * valoir par lui-même. Il ne dépend en outre d'aucune propriété du cookie de
 * session, dont la portée appartient à Better Auth (cf. lib/auth/server.ts) et
 * peut changer sans que ce module ait à le savoir.
 *
 * Le jeton est volontairement court de durée (deux heures) et ne porte qu'un
 * identifiant d'article : divulgué, il n'ouvre qu'un brouillon, jamais la
 * console. La page qu'il sert est `noindex, nofollow`.
 *
 * ⚠️ Web Crypto uniquement : aucun import `node:`, le module étant évalué aussi
 * bien dans une page serveur que dans une server action.
 */

/** Deux heures : le temps d'une relecture, pas celui d'un partage durable. */
const DUREE_MS = 2 * 60 * 60 * 1000;

/** Paramètre de requête porteur du jeton. */
export const APERCU_PARAM = "apercu";

/**
 * Séparation de domaine : le message signé est préfixé, de sorte qu'aucune
 * autre valeur signée avec le même secret — jeton de session Better Auth
 * compris — ne puisse être présentée comme un jeton d'aperçu, ni l'inverse.
 */
const PREFIXE = "apercu-actu.v1.";

const encoder = new TextEncoder();

let keyPromise: Promise<CryptoKey> | null = null;

function getKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    // Même secret que Better Auth : une seule valeur à provisionner par
    // environnement. La séparation de domaine ci-dessous (`PREFIXE`) garantit
    // qu'un jeton d'aperçu ne peut jamais être présenté comme une session.
    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret) return Promise.reject(new Error("BETTER_AUTH_SECRET n'est pas défini."));
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
