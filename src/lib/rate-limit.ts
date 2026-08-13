/**
 * Limite de débit en mémoire, à fenêtre glissante.
 *
 * Sert deux besoins du MGP, tous deux ouverts au public sans authentification :
 * le dépôt d'une plainte (inondation du dossier) et le suivi par numéro de
 * référence (balayage de numéros).
 *
 * ⚠️ PORTÉE : une instance d'exécution. En hébergement sans état (Vercel,
 * Netlify), plusieurs instances coexistent et chacune tient son propre compteur :
 * la limite effective est donc plus lâche que la valeur annoncée. C'est un
 * ralentisseur, pas une barrière — il rend le balayage coûteux, il ne l'interdit
 * pas. Le jour où le trafic le justifiera, la même interface se rebranchera sur
 * un magasin partagé (Redis, Postgres) sans toucher aux appelants.
 *
 * Le compteur est déposé sur `globalThis` pour survivre au rechargement à chaud
 * du développement, comme le client Prisma.
 */

type Bucket = { hits: number[] };

const globalForLimiter = globalThis as unknown as { __ugptnRateLimit?: Map<string, Bucket> };

const buckets = (globalForLimiter.__ugptnRateLimit ??= new Map<string, Bucket>());

/** Au-delà, la table est purgée : un pic de trafic ne doit pas la faire enfler. */
const MAX_KEYS = 5000;

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

/**
 * Consomme un jeton pour `key`.
 *
 * @param limit   nombre d'appels tolérés sur la fenêtre
 * @param windowMs durée de la fenêtre, en millisecondes
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_KEYS) buckets.clear();

  const bucket = buckets.get(key) ?? { hits: [] };
  // Fenêtre glissante : on ne garde que les appels encore dans la fenêtre.
  bucket.hits = bucket.hits.filter((at) => now - at < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    buckets.set(key, bucket);
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)) };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Adresse d'origine de la requête, telle que la voit l'hébergeur.
 *
 * Ces en-têtes sont posés par le proxy de la plateforme et non par le client :
 * derrière Vercel ou Netlify, ils sont fiables. En développement, aucun proxy ne
 * les pose et tout le monde partage la clé « local » — ce qui est sans
 * conséquence, personne d'autre n'y accédant.
 */
export function requestIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? headers.get("x-nf-client-connection-ip") ?? "local";
}
