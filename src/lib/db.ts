/**
 * Client Prisma partagé de l'application.
 *
 * ⚠️ Instanciation PARESSEUSE, et non au niveau module : `next build` importe
 * ce fichier pendant la collecte des routes, sans forcément disposer de
 * DATABASE_URL. Une construction immédiate ferait échouer la compilation sur
 * un environnement où la variable n'est fournie qu'à l'exécution.
 *
 * L'instance est déposée sur `globalThis` : en développement le rechargement à
 * chaud réévalue les modules à chaque édition, et une nouvelle instance par
 * évaluation épuiserait le pool de connexions Neon.
 */
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "@/generated/prisma/client";

// Neon parle WebSocket hors navigateur : sans ce constructeur, aucune requête.
neonConfig.webSocketConstructor = ws;

/**
 * Un client PAR CLASSE PrismaClient, et non un seul partagé.
 *
 * ⚠️ En `next dev`, Turbopack évalue ce module dans plusieurs graphes séparés
 * (rendu des pages, routes /api, proxy) : chacun a SA classe PrismaClient,
 * tous partagent le même `globalThis`. La version précédente gardait une seule
 * instance et la jugeait « régénérée » dès que la classe différait : chaque
 * graphe déconnectait donc le client de l'autre — `$disconnect()` ferme le
 * pool Neon sous les requêtes en cours — d'où, en boucle, « Cannot use a pool
 * after calling end on the pool » (le proxy appelle /api/site/etat à chaque
 * visite, ce qui relançait l'échange en permanence).
 *
 * Indexer par classe règle les deux cas sans rien fermer :
 * - deux graphes vivants → deux clients, chacun le sien ;
 * - client régénéré par `prisma generate` → nouvelle classe, nouveau client ;
 *   l'ancien n'est plus demandé (fuite négligeable, développement seulement).
 * En production il n'y a qu'un graphe et qu'une classe : un seul client.
 */
const globalForPrisma = globalThis as unknown as {
  __ugptnPrismaParClasse?: WeakMap<typeof PrismaClient, PrismaClient>;
};

/** Client Prisma, créé à la première requête puis réutilisé. */
export function db(): PrismaClient {
  const clients = (globalForPrisma.__ugptnPrismaParClasse ??= new WeakMap());
  const existant = clients.get(PrismaClient);
  if (existant) return existant;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL n'est pas défini — la console d'administration ne peut pas démarrer.");
  }
  const client = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
  clients.set(PrismaClient, client);
  return client;
}
