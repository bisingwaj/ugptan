/**
 * Règles de nommage et de diffusion des fichiers de documents.
 *
 * Ces tests figent des comportements MESURÉS sur le compte Cloudinary du
 * projet, et non des intentions :
 *
 *   · `raw` sans extension  → 200, `application/octet-stream`,
 *                             `Content-Disposition: attachment` ;
 *   · `raw` en « .docx »    → 200, type MIME exact, aucune disposition ;
 *   · `raw` en « .pdf »     → 401, y compris avec `fl_attachment`, tant que
 *                             « Allow delivery of PDF and ZIP files » est
 *                             désactivé côté compte ;
 *   · `fl_attachment:<nom>` sur une URL avec extension → `filename="<nom>.docx"`,
 *                             l'hébergeur rétablit l'extension lui-même ;
 *   · `fl_attachment:<nom>` sur une URL sans extension → `filename="<nom>"`,
 *                             extension PERDUE — d'où le refus de réécrire ces
 *                             adresses.
 *
 * Le nommage de dépôt est vérifié sans réseau ; l'aller-retour réel vit dans
 * `cloudinary-integration.test.ts`.
 */
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { nomDeDepot } from "@/lib/cloudinary";
import {
  apercuPossible, formatLisible, ligneTechnique, urlTelechargement,
} from "@/lib/docs/fichier";

const initial = process.env.CLOUDINARY_PDF_DELIVERY;

afterEach(() => {
  if (initial === undefined) delete process.env.CLOUDINARY_PDF_DELIVERY;
  else process.env.CLOUDINARY_PDF_DELIVERY = initial;
});

const BASE = "https://res.cloudinary.com/moncompte/raw/upload/v1/ugptn/documents";

describe("nom de dépôt", () => {
  it("conserve l'extension d'un fichier brut : c'est elle qui donne le type MIME", () => {
    delete process.env.CLOUDINARY_PDF_DELIVERY;
    assert.match(nomDeDepot("Rapport annuel.docx", "raw"), /^rapport-annuel-[0-9a-f]{8}\.docx$/);
    assert.match(nomDeDepot("données.xlsx", "raw"), /^donnees-[0-9a-f]{8}\.xlsx$/);
  });

  it("retire l'extension d'un PDF tant que sa diffusion n'est pas activée", () => {
    delete process.env.CLOUDINARY_PDF_DELIVERY;
    // Avec « .pdf », l'adresse répondrait 401 : un lien mort sur la page
    // publique est pire qu'un fichier servi en octet-stream.
    assert.match(nomDeDepot("Manuel.pdf", "raw"), /^manuel-[0-9a-f]{8}$/);
    assert.match(nomDeDepot("archive.zip", "raw"), /^archive-[0-9a-f]{8}$/);
  });

  it("la conserve dès que le compte autorise la diffusion des PDF", () => {
    process.env.CLOUDINARY_PDF_DELIVERY = "1";
    assert.match(nomDeDepot("Manuel.pdf", "raw"), /^manuel-[0-9a-f]{8}\.pdf$/);
  });

  it("n'ajoute jamais d'extension à une image : Cloudinary la pose lui-même", () => {
    assert.match(nomDeDepot("photo.jpg", "image"), /^photo-[0-9a-f]{8}$/);
    assert.match(nomDeDepot("photo.jpg"), /^photo-[0-9a-f]{8}$/);
  });

  it("tire un suffixe différent à chaque appel, sur un nom identique", () => {
    // Sans lui, deux dépôts homonymes viseraient le même identifiant public et
    // le second renverrait l'adresse du PREMIER fichier.
    assert.notEqual(nomDeDepot("rapport.docx", "raw"), nomDeDepot("rapport.docx", "raw"));
  });
});

describe("adresse de téléchargement", () => {
  it("insère fl_attachment et le nom lisible quand l'adresse porte une extension", () => {
    assert.equal(
      urlTelechargement(`${BASE}/rapport-9f2a1c4d.docx`, "Rapport annuel 2025.docx"),
      `${BASE.replace("/upload", "/upload/fl_attachment:rapport-annuel-2025")}/rapport-9f2a1c4d.docx`,
    );
  });

  it("laisse intacte une adresse SANS extension", () => {
    // `fl_attachment:<nom>` y livrerait « rapport » sans extension, quand
    // l'hébergeur envoie déjà `attachment` avec le nom de dépôt.
    const url = `${BASE}/manuel-9f2a1c4d`;
    assert.equal(urlTelechargement(url, "Manuel.pdf"), url);
  });

  it("laisse intacte une adresse qui n'est pas la nôtre", () => {
    const url = "https://exemple.test/fichiers/rapport.pdf";
    assert.equal(urlTelechargement(url, "rapport.pdf"), url);
  });

  it("retombe sur fl_attachment nu quand le nom ne laisse aucun caractère latin", () => {
    assert.ok(urlTelechargement(`${BASE}/a-1.docx`, "文書.docx").includes("/upload/fl_attachment/"));
  });
});

describe("aperçu", () => {
  it("accepte une image, quelle que soit son adresse", () => {
    assert.equal(apercuPossible("image/png", `${BASE}/visuel-1.png`), true);
  });

  it("n'accepte un PDF que si l'adresse le dit — sinon il sort en octet-stream", () => {
    assert.equal(apercuPossible("application/pdf", `${BASE}/manuel-1.pdf`), true);
    assert.equal(apercuPossible("application/pdf", `${BASE}/manuel-1`), false);
  });

  it("refuse les formats bureautiques, qu'aucun navigateur ne rend", () => {
    assert.equal(apercuPossible("application/msword", `${BASE}/note-1.doc`), false);
  });
});

describe("libellés", () => {
  it("préfère le format rapporté par l'hébergeur à l'extension du nom d'origine", () => {
    assert.equal(formatLisible("rapport.pdf", "docx"), "DOCX");
    assert.equal(formatLisible("rapport.pdf", null), "PDF");
    assert.equal(formatLisible("rapport", null), "DOC");
  });

  it("compose la ligne technique, et tait un poids inconnu", () => {
    assert.equal(
      ligneTechnique({ fileName: "a.pdf", fileFormat: "pdf", fileSize: 4_404_019, langue: "FR" }),
      "PDF · FR · 4,2 Mo",
    );
    assert.equal(
      ligneTechnique({ fileName: "a.pdf", fileFormat: "pdf", fileSize: 0, langue: "FR/EN" }),
      "PDF · FR/EN",
    );
  });
});
