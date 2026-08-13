/**
 * Règles de la bibliothèque de médias — vérifiées sur le module réel.
 *
 * Rien ici ne touche au réseau ni à la base : ce sont les décisions qui
 * encadrent le téléversement (ce qu'on accepte, jusqu'à quel poids, quelle
 * adresse on sert) et dont une régression passerait inaperçue en relecture.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  estImage,
  estOptimisable,
  extensionLisible,
  MIMES_ACCEPTES,
  MIMES_DOCUMENT,
  MIMES_IMAGE,
  mediaRoute,
  mediaSrc,
  poidsLisible,
  TAILLE_MAX,
  TAILLE_MAX_DOCUMENT,
  tailleMaxPour,
} from "@/lib/medias";

describe("types acceptés", () => {
  it("réunit images et documents", () => {
    for (const mime of [...MIMES_IMAGE, ...MIMES_DOCUMENT]) {
      assert.ok((MIMES_ACCEPTES as readonly string[]).includes(mime), mime);
    }
  });

  it("exclut le SVG, qui peut porter du script", () => {
    assert.ok(!(MIMES_ACCEPTES as readonly string[]).includes("image/svg+xml"));
  });

  it("exclut les exécutables et les archives", () => {
    for (const mime of ["application/x-msdownload", "application/zip", "application/octet-stream"]) {
      assert.ok(!(MIMES_ACCEPTES as readonly string[]).includes(mime), mime);
    }
  });

  it("distingue une image d'un document", () => {
    assert.equal(estImage("image/png"), true);
    assert.equal(estImage("image/*"), true, "média externe, dont le type précis est inconnu");
    assert.equal(estImage("application/pdf"), false);
  });
});

describe("plafonds de poids", () => {
  it("applique celui des images à une image", () => {
    assert.equal(tailleMaxPour("image/jpeg"), TAILLE_MAX);
  });

  it("applique celui des documents à un PDF", () => {
    assert.equal(tailleMaxPour("application/pdf"), TAILLE_MAX_DOCUMENT);
  });

  it("reste sous la limite de corps des server actions", () => {
    // `bodySizeLimit` vaut 14 Mo dans next.config.mjs : le plafond applicatif
    // doit lui laisser la marge de l'encodage multipart, sans quoi le refus
    // viendrait du serveur, sans message lisible.
    assert.ok(TAILLE_MAX_DOCUMENT < 14 * 1024 * 1024);
    assert.ok(TAILLE_MAX < TAILLE_MAX_DOCUMENT);
  });
});

describe("adresse servie", () => {
  const base = {
    id: "cm5abcdefghijklmnopqrst",
    filename: "photo.jpg",
    mimeType: "image/jpeg",
    size: 1024,
    width: 800,
    height: 600,
    altFr: null,
    altEn: null,
    legende: null,
  };

  it("sert l'adresse du stockage quand elle existe", () => {
    const url = "https://res.cloudinary.com/sk3d7xil/image/upload/v1/ugptn/medias/photo.jpg";
    assert.equal(mediaSrc({ ...base, url }), url);
  });

  it("retombe sur la route de service pour un fichier historique", () => {
    assert.equal(mediaSrc({ ...base, url: null }), mediaRoute(base.id));
  });
});

describe("optimisation next/image", () => {
  it("accepte l'hôte de Cloudinary", () => {
    // Doit rester aligné sur `images.remotePatterns` de next.config.mjs :
    // annoncer optimisable une source non déclarée fait échouer l'optimiseur.
    assert.equal(estOptimisable("https://res.cloudinary.com/sk3d7xil/image/upload/v1/a.jpg"), true);
  });

  it("refuse un hôte inconnu, sans refuser l'image", () => {
    assert.equal(estOptimisable("https://cdn.exemple.test/a.jpg"), false);
  });

  it("accepte un chemin relatif, servi par le site lui-même", () => {
    assert.equal(estOptimisable("/api/medias/cm5abcdefghijklmnopqrst"), true);
  });
});

describe("affichage", () => {
  it("nomme l'extension d'un document", () => {
    assert.equal(extensionLisible("rapport-annuel.pdf"), "PDF");
    assert.equal(extensionLisible("liste.XLSX"), "XLSX");
    assert.equal(extensionLisible("sans-extension"), "DOC");
  });

  it("écrit un poids lisible", () => {
    assert.equal(poidsLisible(512), "512 o");
    assert.equal(poidsLisible(493 * 1024), "493 ko");
    assert.equal(poidsLisible(Math.round(1.8 * 1024 * 1024)), "1,8 Mo");
  });
});
