/**
 * Exécution RÉELLE des lectures publiques du module « Rapports & analyses ».
 *
 * ─── Pourquoi ce test existe ────────────────────────────────────────────────
 *
 * Une clause `where` invalide traverse tout ce qui garde ce dépôt : le
 * compilateur l'accepte (Prisma type les filtres largement), le lint ne la voit
 * pas, et `next build` ne l'exécute pas — la page des ressources est rendue À LA
 * DEMANDE. Le premier visiteur reçoit alors une 500.
 *
 * Le cas s'est produit : `{ NOT: { fileUrl: null } }` est lu par Prisma comme un
 * argument ABSENT, pas comme une négation, et fait échouer la requête entière.
 * La forme juste est `{ fileUrl: { not: null } }`. Ces tests JOUENT les requêtes
 * pour que la prochaine erreur de ce genre tombe ici, et non en production.
 *
 * Ce qui est vérifié est la VALIDITÉ des requêtes, jamais leur résultat : le
 * contenu de la base varie, et un test qui compterait les documents publiés
 * échouerait au premier ajout dans la console.
 *
 * Lecture seule, aucune écriture. Sans `DATABASE_URL`, le test s'ANNONCE ignoré
 * plutôt que de passer en silence — même règle que l'intégration Cloudinary.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { config } from "dotenv";
import {
  documentsLies, getDocument, listerCategoriesDoc, listerDocuments, listerTypesDoc, urlsDocuments,
} from "@/lib/docs/query";
import { DOC_TRIS } from "@/lib/docs/statut";

/**
 * `.env.local` AVANT `.env`, et pas seulement `dotenv/config`.
 *
 * C'est `.env.local` que lit Next et où vivent les identifiants de
 * développement de ce projet ; `.env` n'y existe pas. Se contenter de la
 * convention `import "dotenv/config"` ferait s'ignorer ce test sur toutes les
 * machines — un test qui ne s'exécute jamais ne garde rien. `dotenv` n'écrase
 * pas une variable déjà posée : l'ordre reproduit donc la précédence de Next,
 * et un `DATABASE_URL` déjà présent dans l'environnement l'emporte sur les deux.
 */
config({ path: ".env.local", quiet: true });
config({ quiet: true });

const raison = process.env.DATABASE_URL ? false : "DATABASE_URL absente de l'environnement";

describe("lectures publiques des documents", { skip: raison }, () => {
  it("liste les documents servis, sans filtre", async () => {
    const documents = await listerDocuments({ lang: "fr", tri: "RANG" });
    assert.ok(Array.isArray(documents));
    // Chaque pièce servie mène quelque part : un fichier, ou un texte.
    for (const document of documents) {
      assert.ok(
        document.fichier !== null || document.contenu.trim().length > 0,
        `« ${document.titre} » n'a ni fichier ni corps : la clause « consultable » ne filtre plus.`,
      );
    }
  });

  it("accepte les quatre axes de tri", async () => {
    for (const tri of DOC_TRIS) {
      await listerDocuments({ lang: "fr", tri });
    }
  });

  it("accepte la recherche, dont la clause voisine celle de « consultable »", async () => {
    // ⚠️ Les deux sont des `OR` : fusionnés au même niveau, le second écraserait
    // le premier. La recherche doit donc descendre par `AND` (cf. query.ts).
    const trouves = await listerDocuments({ lang: "en", recherche: "rapport", tri: "DATE" });
    for (const document of trouves) {
      assert.ok(document.fichier !== null || document.contenu.trim().length > 0);
    }
  });

  it("accepte les filtres de thématique et de nature", async () => {
    await listerDocuments({ lang: "fr", categorie: "reference" });
    await listerDocuments({ lang: "fr", type: "RAPPORT" });
  });

  it("compte les catégories et les natures effectivement représentées", async () => {
    assert.ok(Array.isArray(await listerCategoriesDoc("fr")));
    assert.ok(Array.isArray(await listerTypesDoc("en")));
  });

  it("renvoie null sur une adresse de lecture inconnue, sans lever", async () => {
    assert.equal(await getDocument("fr", "adresse-qui-n-existe-pas-xyz"), null);
  });

  it("liste les adresses du sitemap", async () => {
    for (const ligne of await urlsDocuments()) {
      assert.ok(ligne.slug.length > 0, "une adresse vide produirait une entrée de sitemap morte");
    }
  });

  it("cherche les pièces liées, avec et sans thématique", async () => {
    const [premier] = await listerDocuments({ lang: "fr" });
    if (!premier) return; // base vide : rien à rapprocher

    await documentsLies(premier, "fr");
    await documentsLies({ ...premier, categorie: null }, "fr");
  });
});
