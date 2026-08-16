/**
 * Les chemins publics annoncés existent-ils vraiment ?
 *
 * Ce test répond à une panne réelle, et silencieuse. Au renommage des routes en
 * anglais, les littéraux de `revalidatePath` sont restés en français
 * (`/[lang]/actualites`, `/[lang]/ressources`…). Or `revalidatePath` ne lève PAS
 * sur un chemin inexistant : il n'invalide rien, sans rien dire. Publier un
 * article cessait donc de rafraîchir sa page publique — le contenu n'apparaissait
 * qu'à l'expiration du `revalidate`, et aucun journal ne le signalait. Une
 * régression invisible à la relecture comme à l'exécution.
 *
 * D'où ces deux vérifications, faites sur le SYSTÈME DE FICHIERS et non sur une
 * liste recopiée : la liste recopiée est exactement ce qui a dérivé.
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { NAV, patronRoute } from "@/lib/routes";
import { ADMIN_NAV } from "@/content/admin";

const racine = path.resolve(import.meta.dirname, "..", "..");
const APP = path.join(racine, "src", "app");
const PUBLIC_DIR = path.join(APP, "[lang]");
const CONSOLE_DIR = path.join(APP, "(dashboard)", "7hj3nrpgaz6fjtw7", "(console)");

/** Un segment de route correspond-il à un dossier de page rendu par l'App Router ? */
const pageExiste = (base: string, slug: string): boolean =>
  existsSync(path.join(base, ...slug.split("/").filter(Boolean), "page.tsx"));

describe("routes publiques de NAV", () => {
  it("désignent toutes une page réelle", () => {
    for (const [cle, slug] of Object.entries(NAV)) {
      assert.ok(
        pageExiste(PUBLIC_DIR, slug),
        `NAV.${cle} vaut « ${slug} », mais src/app/[lang]${slug}/page.tsx n'existe pas. ` +
          "Le sitemap annoncerait une 404 et les invalidations de cache ne porteraient sur rien.",
      );
    }
  });

  it("sont écrites en anglais, conformément à la convention du projet", () => {
    // Les anciennes formes françaises restent dans LEGACY_PATHS, qui les
    // redirige ; elles n'ont plus rien à faire dans NAV.
    const francais = ["actualites", "evenements", "ressources", "resultats", "projet",
      "composantes", "gouvernance", "marches", "transparence", "medias"];

    for (const [cle, slug] of Object.entries(NAV)) {
      for (const mot of francais) {
        assert.ok(!slug.includes(mot), `NAV.${cle} porte encore le segment français « ${mot} ».`);
      }
    }
  });
});

describe("patron de route pour revalidatePath", () => {
  it("garde le segment de langue paramétré", () => {
    // Une URL (`/fr/news`) n'invaliderait qu'une langue ; c'est la forme de
    // ROUTE qui les prend toutes.
    assert.equal(patronRoute(NAV.actualites), "/[lang]/news");
    assert.equal(patronRoute(NAV.galerie), "/[lang]/gallery");
  });

  it("rend l'accueil sans barre finale", () => {
    assert.equal(patronRoute(NAV.accueil), "/[lang]");
    assert.equal(patronRoute(), "/[lang]");
  });

  it("accepte un segment dynamique concaténé", () => {
    assert.equal(patronRoute(`${NAV.evenements}/[slug]`), "/[lang]/events/[slug]");
  });
});

describe("modules de la console", () => {
  it("ne pointent que vers des écrans qui existent", () => {
    // Un `slug` absent signale un module non encore implémenté (`soon`) : la
    // barre latérale l'affiche sans lien, et c'est un état prévu.
    for (const item of ADMIN_NAV) {
      if (!item.slug) continue;
      assert.ok(
        pageExiste(CONSOLE_DIR, item.slug),
        `Le module « ${item.label} » pointe sur « ${item.slug} », qui n'a pas de page.`,
      );
    }
  });
});
