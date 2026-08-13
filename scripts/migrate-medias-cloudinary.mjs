/**
 * Reprise des médias historiques : de PostgreSQL vers Cloudinary.
 *
 * Les fichiers téléversés avant la bascule ont leurs octets dans
 * `MediaAsset.data`. Ce script les dépose chez Cloudinary, enregistre l'adresse
 * et l'identifiant obtenus, puis VIDE la colonne — la base cesse alors de
 * porter du binaire.
 *
 *   node scripts/migrate-medias-cloudinary.mjs --dry-run   (n'écrit rien)
 *   node scripts/migrate-medias-cloudinary.mjs
 *
 * ⚠️ Le script ÉCRIT dans la base de production désignée par DATABASE_URL.
 * Passer d'abord en `--dry-run`, et disposer d'une sauvegarde.
 *
 * Reprenable : un média déjà porteur d'une `url` est ignoré. Une interruption
 * en cours de route se relance donc sans doublon. Chaque média est traité
 * isolément : un fichier illisible est signalé et n'arrête pas les suivants.
 *
 * Les URL `/api/medias/<id>` inscrites dans le corps des articles ne sont pas
 * réécrites, et n'ont pas à l'être : la route redirige désormais vers le
 * fichier repris (cf. src/app/api/medias/[id]/route.ts).
 */
import "dotenv/config";
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { v2 as cloudinary } from "cloudinary";

// Le client généré est du CommonJS : `createRequire` évite de dépendre de
// l'interop de nommage, qui varie d'une version de Node à l'autre.
const require = createRequire(import.meta.url);
const { PrismaClient } = require("../src/generated/prisma/client.js");

const SIMULATION = process.argv.includes("--dry-run");

/** Identifiants, sous l'une ou l'autre forme — même règle que src/lib/cloudinary.ts. */
function identifiants() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const api_key = process.env.CLOUDINARY_API_KEY?.trim();
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (cloud_name && api_key && api_secret) return { cloud_name, api_key, api_secret };

  const url = process.env.CLOUDINARY_URL?.trim();
  const parsed = url ? /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/i.exec(url) : null;
  if (!parsed) return null;
  return { api_key: parsed[1], api_secret: parsed[2], cloud_name: parsed[3].replace(/\/.*$/, "") };
}

/**
 * Même règle que `src/lib/cloudinary.ts`, suffixe aléatoire compris : imposer
 * un `public_id` désactive la déduplication du service, et deux médias nommés
 * « photo.jpg » se replieraient sur un seul fichier.
 */
const nomDeDepot = (filename) => {
  const sansExtension = String(filename ?? "").replace(/\.[^.]+$/, "");
  const ascii = sansExtension.normalize("NFD").replace(/[^\x20-\x7e]/g, "");
  const propre = ascii.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
  return `${propre || "fichier"}-${randomBytes(4).toString("hex")}`;
};

const poids = (octets) =>
  octets < 1024 * 1024 ? `${Math.round(octets / 1024)} ko` : `${(octets / (1024 * 1024)).toFixed(1)} Mo`;

function deposer(octets, filename, mimeType) {
  const image = String(mimeType ?? "").startsWith("image/");
  return new Promise((resolve, reject) => {
    const flux = cloudinary.uploader.upload_stream(
      {
        folder: `${process.env.CLOUDINARY_FOLDER?.trim() || "ugptn"}/${image ? "medias" : "documents"}`,
        public_id: nomDeDepot(filename),
        resource_type: image ? "image" : "raw",
        overwrite: false,
      },
      (erreur, reponse) => (erreur ? reject(erreur) : resolve(reponse)),
    );
    flux.on("error", reject);
    flux.end(Buffer.from(octets));
  });
}

async function main() {
  const cles = identifiants();
  if (!cles) {
    console.error("CLOUDINARY_URL absente de l'environnement. Reprise impossible.");
    process.exitCode = 1;
    return;
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL absente de l'environnement.");
    process.exitCode = 1;
    return;
  }

  cloudinary.config({ ...cles, secure: true });
  neonConfig.webSocketConstructor = ws;
  const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) });

  console.log(`Compte Cloudinary : ${cles.cloud_name}${SIMULATION ? "  (SIMULATION, aucune écriture)" : ""}`);

  try {
    // Les identifiants d'abord, sans les octets : charger cent binaires d'un
    // coup ferait tenir toute la bibliothèque en mémoire.
    const candidats = await db.mediaAsset.findMany({
      where: { url: null },
      select: { id: true, filename: true, mimeType: true, size: true },
      orderBy: { createdAt: "asc" },
    });

    if (candidats.length === 0) {
      console.log("Aucun média à reprendre : la base ne porte plus de binaire.");
      return;
    }

    console.log(`${candidats.length} média(s) à reprendre.\n`);

    let repris = 0;
    let vides = 0;
    let echecs = 0;

    for (const candidat of candidats) {
      const ligne = `${candidat.filename} (${poids(candidat.size)})`;

      const complet = await db.mediaAsset.findUnique({
        where: { id: candidat.id },
        select: { data: true },
      });

      if (!complet?.data || complet.data.length === 0) {
        console.log(`  ─ ${ligne} : ni fichier ni adresse, ignoré.`);
        vides += 1;
        continue;
      }

      if (SIMULATION) {
        console.log(`  · ${ligne} : serait déposé sous « ${nomDeDepot(candidat.filename)} » (suffixe tiré au sort).`);
        repris += 1;
        continue;
      }

      try {
        const depot = await deposer(complet.data, candidat.filename, candidat.mimeType);
        await db.mediaAsset.update({
          where: { id: candidat.id },
          data: {
            url: depot.secure_url,
            publicId: depot.public_id,
            width: depot.width ?? undefined,
            height: depot.height ?? undefined,
            size: depot.bytes ?? candidat.size,
            // Le binaire ne quitte la base qu'une fois l'adresse enregistrée
            // dans la MÊME écriture : un échec laisse le média intact.
            data: null,
          },
        });
        console.log(`  ✓ ${ligne} → ${depot.secure_url}`);
        repris += 1;
      } catch (erreur) {
        console.error(`  ✗ ${ligne} : ${erreur?.message ?? erreur}`);
        echecs += 1;
      }
    }

    console.log(`\nRepris : ${repris} · sans fichier : ${vides} · échecs : ${echecs}`);
    if (echecs > 0) process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}

await main();
