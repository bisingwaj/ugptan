/**
 * Couche de stockage — décisions prises sans réseau.
 *
 * La configuration est lue à CHAQUE appel de `cloudinaryActif()` : ces tests en
 * dépendent pour manipuler l'environnement d'une assertion à l'autre. Le tour
 * de passe-passe est volontaire — c'est le comportement attendu d'un module
 * dont la configuration est paresseuse (cf. le commentaire de src/lib/db.ts).
 *
 * Le vrai aller-retour vers le service vit dans `cloudinary-integration.test.ts`.
 */
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  cloudinaryActif,
  cloudinaryCloudName,
  deposerFichier,
  estUrlCloudinary,
  HOTE_CLOUDINARY,
  typeRessource,
} from "@/lib/cloudinary";

const VARIABLES = [
  "CLOUDINARY_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

const initial = Object.fromEntries(VARIABLES.map((cle) => [cle, process.env[cle]]));

const vider = () => VARIABLES.forEach((cle) => delete process.env[cle]);

afterEach(() => {
  vider();
  for (const [cle, valeur] of Object.entries(initial)) {
    if (valeur !== undefined) process.env[cle] = valeur;
  }
});

describe("lecture des identifiants", () => {
  it("comprend la forme CLOUDINARY_URL", () => {
    vider();
    process.env.CLOUDINARY_URL = "cloudinary://325729772622222:secret@sk3d7xil";
    assert.equal(cloudinaryActif(), true);
    assert.equal(cloudinaryCloudName(), "sk3d7xil");
  });

  it("tolère une barre oblique finale sur l'URL", () => {
    vider();
    process.env.CLOUDINARY_URL = "cloudinary://cle:secret@moncompte/";
    assert.equal(cloudinaryCloudName(), "moncompte");
  });

  it("comprend les trois variables décomposées", () => {
    vider();
    process.env.CLOUDINARY_CLOUD_NAME = "moncompte";
    process.env.CLOUDINARY_API_KEY = "cle";
    process.env.CLOUDINARY_API_SECRET = "secret";
    assert.equal(cloudinaryActif(), true);
    assert.equal(cloudinaryCloudName(), "moncompte");
  });

  it("donne la priorité aux variables décomposées", () => {
    vider();
    process.env.CLOUDINARY_URL = "cloudinary://cle:secret@parlurl";
    process.env.CLOUDINARY_CLOUD_NAME = "pardecomposition";
    process.env.CLOUDINARY_API_KEY = "cle";
    process.env.CLOUDINARY_API_SECRET = "secret";
    assert.equal(cloudinaryCloudName(), "pardecomposition");
  });

  it("se déclare inactif sans identifiants, plutôt que d'échouer plus tard", () => {
    vider();
    assert.equal(cloudinaryActif(), false);
    assert.equal(cloudinaryCloudName(), null);
  });

  it("refuse une URL mal formée au lieu d'en deviner les morceaux", () => {
    vider();
    process.env.CLOUDINARY_URL = "https://cloudinary.com/console";
    assert.equal(cloudinaryActif(), false);
  });

  it("ignore trois variables incomplètes", () => {
    vider();
    process.env.CLOUDINARY_CLOUD_NAME = "moncompte";
    process.env.CLOUDINARY_API_KEY = "cle";
    assert.equal(cloudinaryActif(), false, "sans secret, la configuration n'est pas utilisable");
  });
});

describe("dépôt sans configuration", () => {
  it("refuse en nommant la variable manquante, sans appeler le réseau", async () => {
    vider();
    await assert.rejects(
      () => deposerFichier(new Uint8Array([1, 2, 3]), { filename: "a.png", mimeType: "image/png" }),
      /CLOUDINARY_URL/,
    );
  });
});

describe("type de ressource", () => {
  it("range les images dans le pipeline d'images", () => {
    for (const mime of ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]) {
      assert.equal(typeRessource(mime), "image", mime);
    }
  });

  it("range les documents en ressource brute", () => {
    // Un PDF déposé en « image » serait rasterisé par Cloudinary, et sa
    // diffusion dépendrait d'un réglage de compte désactivé par défaut.
    for (const mime of [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ]) {
      assert.equal(typeRessource(mime), "raw", mime);
    }
  });
});

describe("reconnaissance d'une adresse du stockage", () => {
  it("reconnaît une URL du service", () => {
    assert.equal(estUrlCloudinary(`https://${HOTE_CLOUDINARY}/sk3d7xil/image/upload/v1/a.jpg`), true);
  });

  it("écarte un CDN tiers et les valeurs vides", () => {
    assert.equal(estUrlCloudinary("https://images.unsplash.com/photo-1"), false);
    assert.equal(estUrlCloudinary("/api/medias/cm5abcdefghijklmnopqrst"), false);
    assert.equal(estUrlCloudinary(null), false);
    assert.equal(estUrlCloudinary(undefined), false);
  });

  it("écarte un hôte qui imite le nôtre en sous-domaine", () => {
    assert.equal(estUrlCloudinary("https://res.cloudinary.com.exemple.test/a.jpg"), false);
  });
});
