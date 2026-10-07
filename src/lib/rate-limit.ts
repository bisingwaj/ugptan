/**
 * Limite de débit des formulaires publics.
 *
 * Sert deux besoins du MGP, tous deux ouverts au public sans authentification :
 * le dépôt d'une plainte (inondation du dossier) et le suivi par numéro de
 * référence (balayage de numéros).
 *
 * Sert aussi l'abonnement à la lettre, l'inscription aux événements et, surtout,
 * le plafond d'essais du code de maintenance à six chiffres.
 *
 * ─── Compteur PARTAGÉ (Redis), mémoire en secours ────────────────────────────
 *
 * En hébergement sans état (Vercel), plusieurs instances coexistent et chaque
 * instance froide repart de zéro : un compteur en mémoire n'y est qu'un
 * ralentisseur, contourné en multipliant les requêtes. Le compteur vit donc
 * dans Redis (Upstash, déjà présent pour le cache), commun à toutes les
 * instances : fenêtre FIXE, un `INCR` et une expiration par fenêtre.
 *
 * Redis absent (développement) ou injoignable : retombée sur le compteur en
 * mémoire, à fenêtre glissante. Une panne Redis ne doit jamais bloquer un
 * dépôt de plainte — mieux vaut une limite plus lâche qu'un service fermé.
 *
 * Le compteur mémoire est déposé sur `globalThis` pour survivre au
 * rechargement à chaud du développement, comme le client Prisma.
 */
import "server-only";
import { redisPartage } from "@/lib/cache/redis";

type Bucket = { hits: number[] };

const globalForLimiter = globalThis as unknown as { __ugptnRateLimit?: Map<string, Bucket> };

const buckets = (globalForLimiter.__ugptnRateLimit ??= new Map<string, Bucket>());

/** Au-delà, la table est purgée : un pic de trafic ne doit pas la faire enfler. */
const MAX_KEYS = 5000;

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

/**
 * Consomme un jeton pour `key`, sur le compteur partagé si Redis répond.
 *
 * @param limit   nombre d'appels tolérés sur la fenêtre
 * @param windowMs durée de la fenêtre, en millisecondes
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const redis = redisPartage();
  if (redis) {
    try {
      const now = Date.now();
      const fenetre = Math.floor(now / windowMs);
      const cle = `ug:rl:${key}:${fenetre}`;
      // INCR puis expiration à la fin de la fenêtre (+1 s de marge), en un
      // seul aller-retour.
      const [compte] = await redis
        .multi()
        .incr(cle)
        .pexpire(cle, windowMs + 1000)
        .exec<[number, number]>();
      const restant = Math.max(1, Math.ceil(((fenetre + 1) * windowMs - now) / 1000));
      return compte > limit
        ? { allowed: false, retryAfterSeconds: restant }
        : { allowed: true, retryAfterSeconds: 0 };
    } catch {
      // Redis injoignable : compteur local, cf. en-tête.
    }
  }
  return rateLimitMemoire(key, limit, windowMs);
}

/** Compteur d'une instance, à fenêtre glissante : le secours sans Redis. */
function rateLimitMemoire(key: string, limit: number, windowMs: number): RateLimitResult {
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
    if (valeur) return reseau(valeur);
  }

  /* Dernier recours. L'entrée la plus à DROITE, et non la plus à gauche : la
     chaîne se lit « client, relais 1, relais 2 », et seule la dernière a été
     écrite par un relais et non par l'appelant. */
  const chaine = headers.get("x-forwarded-for");
  if (chaine) {
    const maillons = chaine.split(",").map((m) => m.trim()).filter(Boolean);
    if (maillons.length > 0) return reseau(maillons[maillons.length - 1]);
  }

  return "local";
}

/**
 * Une adresse IPv6 est ramenée à son préfixe /64. Un abonné reçoit en général
 * un /64 entier : sans cela, changer d'adresse dans son propre bloc donnerait
 * un compteur neuf à chaque requête. IPv4 inchangée.
 */
function reseau(ip: string): string {
  if (!ip.includes(":")) return ip;
  const [tete] = ip.split("%");
  const parties = tete.split("::");
  const gauche = parties[0] ? parties[0].split(":") : [];
  const droite = parties.length > 1 && parties[1] ? parties[1].split(":") : [];
  const groupes = parties.length > 1
    ? [...gauche, ...Array(Math.max(0, 8 - gauche.length - droite.length)).fill("0"), ...droite]
    : gauche;
  return `${groupes.slice(0, 4).map((g) => g || "0").join(":")}::/64`;
}
