/**
 * Aller-retour RÉEL avec Cloudinary : dépôt, lecture, suppression.
 *
 * C'est le test qui répond à la seule question qui compte après la bascule —
 * un fichier téléversé depuis la console est-il vraiment déposé, servi, puis
 * retiré ? Il consomme le quota du compte configuré, dépose sous
 * `<CLOUDINARY_FOLDER>/tests/` et efface systématiquement ce qu'il a créé.
 *
 * Sans identifiants dans l'environnement, il s'ANNONCE ignoré plutôt que de
 * passer en silence : un test vert qui n'a rien exécuté est pire qu'un test
 * absent.
 *
 * Aucune base de données n'est touchée.
 */
import "dotenv/config";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import { after, describe, it } from "node:test";
import { cloudinaryActif, deposerFichier, estUrlCloudinary, supprimerFichier } from "@/lib/cloudinary";

/* --- Fichiers d'essai, fabriqués plutôt que rangés dans le dépôt ---------- */

const CRC = Int32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

const crc32 = (buf: Buffer): number => {
  let c = 0xffffffff;
  for (const octet of buf) c = CRC[(c ^ octet) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type: string, corps: Buffer): Buffer => {
  const entete = Buffer.alloc(4);
  entete.writeUInt32BE(corps.length);
  const nomEtCorps = Buffer.concat([Buffer.from(type, "latin1"), corps]);
  const somme = Buffer.alloc(4);
  somme.writeUInt32BE(crc32(nomEtCorps));
  return Buffer.concat([entete, nomEtCorps, somme]);
};

/**
 * PNG opaque de dimensions choisies — construit ici pour que le test puisse
 * VÉRIFIER les dimensions rapportées par le service, ce qu'une image constante
 * collée en base64 ne permettrait pas de relire.
 */
function pngUni(largeur: number, hauteur: number): Uint8Array {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largeur, 0);
  ihdr.writeUInt32BE(hauteur, 4);
  ihdr[8] = 8; // 8 bits par canal
  ihdr[9] = 2; // couleur vraie, sans alpha
  const lignes = Buffer.concat(
    Array.from({ length: hauteur }, () =>
      Buffer.concat([Buffer.from([0]), Buffer.alloc(largeur * 3, 0x2b)]),
    ),
  );
  return new Uint8Array(
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk("IHDR", ihdr),
      chunk("IDAT", deflateSync(lignes)),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}

/** PDF minimal mais VALIDE : un lecteur doit pouvoir l'ouvrir. */
const pdfMinimal = (): Uint8Array =>
  new Uint8Array(
    Buffer.from(
      "%PDF-1.4\n" +
        "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
        "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
        "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\n" +
        "trailer<</Root 1 0 R>>\n%%EOF\n",
      "latin1",
    ),
  );

/* --- Tests ---------------------------------------------------------------- */

const actif = cloudinaryActif();
const aNettoyer: { publicId: string; mimeType: string }[] = [];

after(async () => {
  for (const reste of aNettoyer) await supprimerFichier(reste.publicId, reste.mimeType);
});

describe("dépôt d'une image", { skip: actif ? false : "CLOUDINARY_URL absente de l'environnement" }, () => {
  it("dépose, renvoie une adresse du service et sert les mêmes octets", async () => {
    const octets = pngUni(48, 32);

    const depot = await deposerFichier(octets, {
      filename: "Réunion du Conseil (2026).png",
      mimeType: "image/png",
      sousDossier: "tests",
    });
    aNettoyer.push({ publicId: depot.publicId, mimeType: "image/png" });

    assert.ok(estUrlCloudinary(depot.url), `adresse inattendue : ${depot.url}`);
    assert.equal(depot.resourceType, "image");
    assert.equal(depot.width, 48, "dimensions rapportées par le service");
    assert.equal(depot.height, 32);
    assert.equal(depot.size, octets.byteLength);

    // Accents, parenthèses et espaces retirés du nom : ils survivent mal à un
    // copier-coller d'URL, et Cloudinary refuse une partie d'entre eux.
    assert.match(depot.publicId, /^[a-z0-9/_-]+$/, `identifiant non assaini : ${depot.publicId}`);
    assert.ok(depot.publicId.includes("reunion-du-conseil-2026"), depot.publicId);
    assert.ok(depot.publicId.includes("/tests/"), "déposé hors du sous-dossier demandé");

    const reponse = await fetch(depot.url);
    assert.equal(reponse.status, 200);
    assert.equal(reponse.headers.get("content-type"), "image/png");
    assert.deepEqual(new Uint8Array(await reponse.arrayBuffer()), octets, "octets servis ≠ octets déposés");
  });

  it("ne remplace pas un fichier de même nom", async () => {
    const octets = pngUni(16, 16);
    const options = { filename: "doublon.png", mimeType: "image/png", sousDossier: "tests" } as const;

    const premier = await deposerFichier(octets, options);
    aNettoyer.push({ publicId: premier.publicId, mimeType: "image/png" });
    const second = await deposerFichier(octets, options);
    aNettoyer.push({ publicId: second.publicId, mimeType: "image/png" });

    // Deux visuels homonymes sont deux fichiers : écraser le premier ferait
    // changer sans prévenir l'illustration d'un article déjà publié.
    assert.notEqual(premier.publicId, second.publicId);
    assert.notEqual(premier.url, second.url);
  });
});

describe("dépôt d'un document", { skip: actif ? false : "CLOUDINARY_URL absente de l'environnement" }, () => {
  it("sert le PDF octet pour octet, sans passer par le pipeline d'images", async () => {
    const octets = pdfMinimal();

    const depot = await deposerFichier(octets, {
      filename: "rapport-annuel.pdf",
      mimeType: "application/pdf",
      sousDossier: "tests",
    });
    aNettoyer.push({ publicId: depot.publicId, mimeType: "application/pdf" });

    assert.equal(depot.resourceType, "raw", "un PDF rasterisé ne serait plus le document déposé");
    assert.ok(depot.url.includes("/raw/upload/"), depot.url);
    assert.equal(depot.size, octets.byteLength);

    const reponse = await fetch(depot.url);
    assert.equal(reponse.status, 200);
    assert.deepEqual(new Uint8Array(await reponse.arrayBuffer()), octets, "document altéré à la diffusion");
  });
});

describe("suppression", { skip: actif ? false : "CLOUDINARY_URL absente de l'environnement" }, () => {
  it("retire le fichier du compte, et se répète sans échouer", async () => {
    const depot = await deposerFichier(pngUni(8, 8), {
      filename: "a-supprimer.png",
      mimeType: "image/png",
      sousDossier: "tests",
    });

    assert.equal(await supprimerFichier(depot.publicId, "image/png"), true);
    // Idempotence : la console supprime la ligne en base AVANT le fichier, et
    // une reprise après incident ne doit pas buter sur un fichier déjà retiré.
    assert.equal(await supprimerFichier(depot.publicId, "image/png"), true);
  });

  it("ne fait rien, sans lever, quand l'identifiant est vide", async () => {
    assert.equal(await supprimerFichier("", "image/png"), false);
  });
});
