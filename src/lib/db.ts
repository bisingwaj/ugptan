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

const globalForPrisma = globalThis as unknown as {
  __ugptnPrisma?: PrismaClient;
  /** Classe qui a construit l'instance, pour reconnaître un client régénéré. */
  __ugptnPrismaClasse?: typeof PrismaClient;
};

/** Client Prisma, créé à la première requête puis réutilisé. */
export function db(): PrismaClient {
  /* ⚠️ Client régénéré pendant un `next dev` (`prisma generate` après un
     changement de schéma) : le rechargement à chaud réévalue ce module avec la
     NOUVELLE classe, mais l'instance posée sur `globalThis` appartient encore à
     l'ancienne. Elle ignore les champs ajoutés et fait échouer toute requête qui
     les nomme (« Unknown field `readAt` for select statement »), alors que la
     colonne existe en base. On la remplace donc dès que la classe a changé.
     Sans effet en production : la classe n'y change jamais. */
  if (globalForPrisma.__ugptnPrisma && globalForPrisma.__ugptnPrismaClasse !== PrismaClient) {
    void globalForPrisma.__ugptnPrisma.$disconnect().catch(() => {});
    globalForPrisma.__ugptnPrisma = undefined;
  }

  if (!globalForPrisma.__ugptnPrisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL n'est pas défini — la console d'administration ne peut pas démarrer.");
    }
    globalForPrisma.__ugptnPrisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
    globalForPrisma.__ugptnPrismaClasse = PrismaClient;
  }
  return globalForPrisma.__ugptnPrisma;
}
