import "server-only";

import { Redis } from "@upstash/redis";
import superjson from "superjson";

/**
 * Cache applicatif partagé, sur Redis (Upstash).
 *
 * ─── Le problème qu'il résout ────────────────────────────────────────────────
 *
 * Les pages de LISTE — actualités, événements, galerie, ressources — lisent
 * `searchParams` (filtre, page). Cette seule lecture les bascule en rendu
 * DYNAMIQUE : leur `export const revalidate` n'a plus d'effet, et chaque visite
 * rejoue leurs requêtes contre Neon. Or Neon est serverless : après quelques
 * minutes d'inactivité son compute se suspend, et la requête qui le réveille se
 * paie ~3,75 s (mesuré, cf. lib/lecture.ts), plus des échecs WebSocket par
 * salves. Résultat : une liste lente à la première visite, et à chaque visite
 * qui suit une pause.
 *
 * Le cache de route (ISR) ne peut rien pour ces pages, justement parce qu'elles
 * sont dynamiques. Ce module apporte l'étage qui manque : un cache par CLÉ, sous
 * la page, qui mémorise le RÉSULTAT d'une lecture et le ressert sans toucher la
 * base. Partagé entre toutes les instances serverless (contrairement à un cache
 * mémoire, cf. lib/rate-limit.ts qui le documente), et persistant au-delà d'un
 * déploiement.
 *
 * ─── Le contrat : « ne recharge que si la base change » ───────────────────────
 *
 * Chaque entrée porte des TAGS (le module qui la produit : `actus`, `events`…).
 * Une écriture de la console appelle `invaliderTags` depuis le `cache.ts` du
 * module concerné (cf. lib/actus/cache.ts et les autres) — À CÔTÉ du
 * `revalidatePath` existant, jamais à sa place. La donnée mise en cache
 * disparaît alors, et la lecture suivante la reconstruit à neuf. Entre deux
 * écritures, elle ne bouge pas. Un TTL de sécurité (cf. `produire`) borne malgré
 * tout la fraîcheur, au cas où une invalidation manquerait.
 *
 * ─── Ne casse JAMAIS la page ─────────────────────────────────────────────────
 *
 * Même philosophie que lib/digiprocure.ts et lib/lecture.ts. Redis absent (env
 * non renseignée, développement local), injoignable, ou réponse inattendue : on
 * retombe SILENCIEUSEMENT sur la lecture directe. Le cache est un accélérateur,
 * pas une dépendance dure. Le site fonctionne à l'identique sans lui — un peu
 * plus lentement, voilà tout.
 */

/**
 * ⚠️ Version du schéma des clés. Toute modification de la FORME sérialisée d'une
 * valeur mise en cache (un champ ajouté à une vue, un type changé) doit
 * s'accompagner d'un incrément ici : les anciennes entrées, illisibles par le
 * nouveau code, sont alors ignorées d'un coup plutôt que désérialisées de
 * travers. Moins cher qu'un balayage de purge, et sans fenêtre d'incohérence.
 */
const VERSION = "v1";

/** Préfixe de toutes nos clés dans l'espace Redis (au cas où l'instance serait partagée). */
const NS = "ug";

/**
 * Les familles de données, alignées sur les modules et sur les `revaliderX` des
 * `cache.ts`. Un identifiant unique par famille : nommer un tag ici et
 * l'invalider là-bas est le même contrat des deux côtés, d'où la constante
 * partagée plutôt qu'une chaîne recopiée.
 */
export const TAG = {
  actus: "actus",
  events: "events",
  galerie: "galerie",
  docs: "docs",
  projet: "projet",
  impact: "impact",
  gouvernance: "gouvernance",
  equipe: "equipe",
  provinces: "provinces",
} as const;

export type Tag = (typeof TAG)[keyof typeof TAG];

/**
 * Durées de fraîcheur par défaut, en secondes. Ce sont des FILETS de sécurité,
 * pas le mécanisme principal : l'invalidation par tags reflète une écriture
 * immédiatement. Le TTL ne sert qu'à borner l'écart si une invalidation était
 * manquée (instance figée avant la fin de `after`, cf. les cache.ts). Les
 * valeurs reprennent les `revalidate` que portaient déjà les pages.
 */
export const TTL = {
  /** Listes et derniers éléments : cinq minutes, comme l'ISR de la galerie. */
  liste: 300,
  /** Données quasi-statiques (composantes, indicateurs, sections d'impact,
   *  organes, équipe) : une heure. Elles changent quelques fois par an. */
  socle: 3600,
} as const;

/* -------------------------------------------------------------------------- */
/* Client                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Client Upstash, construit une seule fois puis réutilisé, déposé sur
 * `globalThis` comme le client Prisma (cf. lib/db.ts) pour survivre au
 * rechargement à chaud du développement.
 *
 * `automaticDeserialization: false` : Upstash désérialise par défaut en
 * `JSON.parse`, ce qui suffirait pour des chaînes et des nombres mais
 * TRAHIRAIT nos vues — un `Date` reviendrait en chaîne ISO, un `Set` en objet
 * vide. On garde donc la main sur (dé)sérialisation et on la confie à superjson
 * (cf. `lire`/`ecrire`), seul à restituer fidèlement `Date`, `Set` et `Map` que
 * portent les objets issus de Prisma.
 *
 * `undefined` (et non un client factice) quand l'env n'est pas renseignée :
 * `cacheJson` le lit comme « pas de cache » et lit la base directement. C'est
 * l'état normal en développement et pendant `next build` sans secrets.
 */
const globalForRedis = globalThis as unknown as { __ugptnRedis?: Redis | null };

function client(): Redis | null {
  if (globalForRedis.__ugptnRedis !== undefined) return globalForRedis.__ugptnRedis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    // On mémorise `null` pour ne pas relire l'env à chaque appel.
    globalForRedis.__ugptnRedis = null;
    return null;
  }

  globalForRedis.__ugptnRedis = new Redis({
    url,
    token,
    automaticDeserialization: false,
    /* Échec RAPIDE. Le défaut du client (5 reprises échelonnées) transformerait
       un endpoint injoignable — instance stoppée en local, incident réseau en
       prod — en plusieurs SECONDES d'attente avant la retombée sur la base.
       Une seule reprise courte : au-delà, `cacheJson` capte l'erreur et lit la
       base directement, ce qui vaut mieux que d'attendre. */
    retry: { retries: 1, backoff: () => 100 },
  });
  return globalForRedis.__ugptnRedis;
}

/** La clé complète d'une entrée, préfixée et versionnée. */
const cle = (brut: string) => `${NS}:${VERSION}:${brut}`;

/** La clé du SET qui recense les entrées portant un tag donné. */
const cleTag = (tag: string) => `${NS}:${VERSION}:tag:${tag}`;

/* -------------------------------------------------------------------------- */
/* Lecture mémoïsée                                                             */
/* -------------------------------------------------------------------------- */

type Options = {
  /** Familles auxquelles rattacher l'entrée, pour l'invalidation groupée. */
  tags: Tag[];
  /** Filet de fraîcheur en secondes (cf. `TTL`). */
  ttl: number;
};

/**
 * Rend le résultat de `produire`, depuis Redis s'il y est, sinon en l'exécutant
 * puis en le déposant pour les prochaines fois.
 *
 * `identifiant` doit décrire ENTIÈREMENT ce que renvoie `produire` : deux
 * appels au même identifiant doivent être interchangeables. On y encode donc la
 * fonction, la langue et TOUS les filtres (cf. les appelants dans les query.ts).
 *
 * Le dépôt en cache est délibérément NON attendu (`void … .catch`) : sur un
 * défaut de cache le visiteur a déjà payé la lecture en base, rien ne justifie
 * de lui ajouter l'aller-retour d'écriture. Deux premières visites simultanées
 * peuvent lire la base toutes les deux — c'est rare, sans conséquence, et le
 * prix d'une page qui répond au plus tôt.
 */
export async function cacheJson<T>(
  identifiant: string,
  { tags, ttl }: Options,
  produire: () => Promise<T>,
): Promise<T> {
  const redis = client();
  if (!redis) return produire();

  const k = cle(identifiant);

  try {
    const brut = await redis.get<string>(k);
    if (typeof brut === "string") {
      return superjson.parse<T>(brut);
    }
  } catch {
    // Redis muet ou réponse inattendue : on lit la base, sans faire de bruit.
    return produire();
  }

  const valeur = await produire();
  void deposer(redis, k, tags, ttl, valeur);
  return valeur;
}

/**
 * Écrit l'entrée et l'inscrit sous chacun de ses tags, en une seule salve. Le
 * SET de tag reçoit lui-même une expiration (TTL de l'entrée + marge) : un tag
 * qu'on n'invaliderait plus jamais finit par se nettoyer seul, plutôt que
 * d'accumuler indéfiniment des clés déjà expirées.
 */
async function deposer(
  redis: Redis,
  k: string,
  tags: Tag[],
  ttl: number,
  valeur: unknown,
): Promise<void> {
  try {
    const p = redis.pipeline();
    p.set(k, superjson.stringify(valeur), { ex: ttl });
    for (const tag of tags) {
      const t = cleTag(tag);
      p.sadd(t, k);
      p.expire(t, ttl + 60);
    }
    await p.exec();
  } catch {
    // Un dépôt manqué signifie seulement une lecture en base de plus, plus tard.
  }
}

/* -------------------------------------------------------------------------- */
/* Invalidation                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Efface toutes les entrées portant l'un des tags donnés, et les SET de tags
 * eux-mêmes. Appelée depuis les `cache.ts` après une écriture de la console —
 * enveloppée dans `after()` pour s'exécuter APRÈS la réponse sans la retarder,
 * tout en restant garantie par la plateforme (cf. lib/actus/cache.ts).
 *
 * Ne lève jamais : une invalidation ratée laisse le TTL faire le ménage.
 */
export async function invaliderTags(tags: Tag[]): Promise<void> {
  const redis = client();
  if (!redis) return;

  try {
    for (const tag of tags) {
      const t = cleTag(tag);
      const cles = await redis.smembers(t);
      if (cles.length > 0) {
        await redis.del(...cles);
      }
      await redis.del(t);
    }
  } catch {
    // Silencieux : le filet de TTL borne de toute façon la fraîcheur.
  }
}
