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
 * ─── L'ordre de lecture est une décision de sécurité ─────────────────────────
 *
 * Cette fonction produit la CLÉ de la limitation de débit. Une clé que le
 * client choisit, c'est une limitation qu'il annule : il suffit de faire varier
 * un en-tête à chaque requête pour obtenir un compteur neuf à chaque fois. Ce
 * qui tomberait alors : la protection du dépôt de plaintes contre l'inondation,
 * celle des inscriptions, et surtout le plafond de six essais qui rend
 * impraticable la force brute sur le code de maintenance à six chiffres.
 *
 * La version précédente lisait `x-forwarded-for` EN PREMIER et en prenait
 * l'entrée la plus à GAUCHE. Or `x-forwarded-for` est une liste à laquelle
 * chaque relais AJOUTE : la valeur de gauche est celle que le client a
 * annoncée, et les relais qui la normalisent le font chacun à leur façon. Bâtir
 * un contrôle de sécurité sur elle, c'est le bâtir sur une valeur d'origine
 * inconnue.
 *
 * On interroge donc d'abord les en-têtes que la PLATEFORME pose elle-même et
 * qu'un client ne peut pas usurper — ils sont réécrits à l'entrée, quoi que la
 * requête ait apporté :
 *
 *   · `x-vercel-forwarded-for`      — Vercel ;
 *   · `x-nf-client-connection-ip`   — Netlify ;
 *   · `cf-connecting-ip`            — Cloudflare, si un jour il s'intercale ;
 *   · `x-real-ip`                   — proxys classiques (nginx, Traefik).
 *
 * `x-forwarded-for` ne sert qu'en DERNIER RECOURS, et l'on en prend alors
 * l'entrée la plus à DROITE : celle du relais le plus proche de nous, donc la
 * seule que le client n'a pas pu écrire.
 *
 * En développement, aucun proxy ne pose rien et tout le monde partage la clé
 * « local » : sans conséquence, personne d'autre n'y accédant.
 */
const ENTETES_PLATEFORME = [
  "x-vercel-forwarded-for",
  "x-nf-client-connection-ip",
  "cf-connecting-ip",
  "x-real-ip",
] as const;

export function requestIp(headers: Headers): string {
  for (const nom of ENTETES_PLATEFORME) {
    const valeur = headers.get(nom)?.trim();
    if (valeur) return valeur;
  }

  /* Dernier recours. L'entrée la plus à DROITE, et non la plus à gauche : la
     chaîne se lit « client, relais 1, relais 2 », et seule la dernière a été
     écrite par un relais et non par l'appelant. */
  const chaine = headers.get("x-forwarded-for");
  if (chaine) {
    const maillons = chaine.split(",").map((m) => m.trim()).filter(Boolean);
    if (maillons.length > 0) return maillons[maillons.length - 1];
  }

  return "local";
}
