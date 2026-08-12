/**
 * Compte administrateur initial — version ligne de commande.
 *
 *   pnpm db:seed
 *
 * L'application se provisionne déjà toute seule au premier affichage de
 * l'écran de connexion (cf. src/lib/auth/bootstrap.ts). Ce script sert aux cas
 * que l'amorce ne couvre pas volontairement : recréer un accès administrateur
 * après suppression, ou réinitialiser un mot de passe perdu.
 *
 * Règle de prudence : le mot de passe d'un compte EXISTANT n'est réécrit que si
 * ADMIN_PASSWORD est explicitement fourni. Sans cela, un `pnpm db:seed` lancé
 * par réflexe en production ramènerait l'administrateur au mot de passe de
 * recette.
 *
 *   ADMIN_EMAIL="dsi@ugptn.cd" ADMIN_PASSWORD="…" pnpm db:seed
 *
 * ⚠️ Fichier `.mjs`, et non `.ts` : il tourne sous Node brut, hors du bundler
 * Next, et importe le client Prisma généré (du CommonJS) sans passer par les
 * alias `@/`. Les paramètres scrypt ci-dessous DOIVENT rester identiques à
 * ceux de `src/lib/auth/password.ts` — sans quoi les empreintes produites ici
 * seraient rejetées à la connexion.
 */
import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import prismaClient from "../src/generated/prisma/client.js";

const { PrismaClient } = prismaClient;

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

const DEFAULT_EMAIL = "admin@gmail.com";
const DEFAULT_PASSWORD = "12345678";

/** Même format que `src/lib/auth/password.ts` : `selHex:hashHex`. */
function hashPassword(plain) {
  const salt = randomBytes(SALT_LENGTH);
  const key = scryptSync(plain, salt, KEY_LENGTH, SCRYPT_PARAMS);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL n'est pas défini.");

  neonConfig.webSocketConstructor = ws;
  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

  const email = (process.env.ADMIN_EMAIL || DEFAULT_EMAIL).trim().toLowerCase();
  const explicitPassword = process.env.ADMIN_PASSWORD;
  const password = explicitPassword || DEFAULT_PASSWORD;

  try {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });

    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          name: "Administrateur",
          role: "ADMIN",
          isActive: true,
          passwordHash: hashPassword(password),
        },
      });
      console.log(`Compte administrateur créé : ${email}`);
    } else if (explicitPassword) {
      await prisma.user.update({
        where: { email },
        data: {
          role: "ADMIN",
          isActive: true,
          passwordHash: hashPassword(explicitPassword),
          // Révoque les sessions ouvertes avec l'ancien mot de passe.
          passwordChangedAt: new Date(),
        },
      });
      console.log(`Compte ${email} réactivé, promu ADMIN, mot de passe réinitialisé.`);
    } else {
      await prisma.user.update({
        where: { email },
        data: { role: "ADMIN", isActive: true },
      });
      console.log(
        `Compte ${email} déjà présent : rôle ADMIN et activation confirmés, mot de passe inchangé.\n` +
          "Pour le réinitialiser, relancez avec ADMIN_PASSWORD.",
      );
    }

    if (!explicitPassword && !existing) {
      console.warn(
        "\n⚠️  Mot de passe de recette utilisé. Changez-le depuis la console, " +
          "ou définissez ADMIN_PASSWORD avant toute mise en production.",
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
