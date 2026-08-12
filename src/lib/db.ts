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

const globalForPrisma = globalThis as unknown as { __ugptnPrisma?: PrismaClient };

/** Client Prisma, créé à la première requête puis réutilisé. */
export function db(): PrismaClient {
  if (!globalForPrisma.__ugptnPrisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL n'est pas défini — la console d'administration ne peut pas démarrer.");
    }
    globalForPrisma.__ugptnPrisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
  }
  return globalForPrisma.__ugptnPrisma;
}
