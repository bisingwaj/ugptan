/**
 * Aller-retour d'un graphique du corps rédigé.
 *
 * Ce qui est vérifié ici n'est pas le dessin — il relève du rendu — mais la
 * CHAÎNE qui porte la donnée de la console jusqu'à la page : description →
 * figure HTML → assainisseur → découpe du corps → description. C'est le seul
 * endroit du dépôt où une donnée structurée voyage dans un attribut HTML, et le
 * maillon qui casserait sans bruit est l'assainisseur : il réécrit chaque
 * attribut à partir d'une liste blanche, et une entrée oubliée ferait
 * disparaître le graphique sans erreur ni message.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decoderGraphique, decouperProse, encoderGraphique, figureGraphique, lireNombre,
  normaliserGraphique, type Graphique,
} from "@/lib/html/graphique";
import { isEmptyHtml, sanitizeHtml } from "@/lib/html/sanitize";

const GRAPHIQUE: Graphique = {
  type: "barres",
  titre: "Bénéficiaires par province",
  unite: "%",
  source: "Rapport de suivi, T1 2026",
  entrees: [
    { label: "Kinshasa", valeur: 42.5 },
    { label: "Kongo-Central", valeur: 17 },
    { label: "Haut-Katanga", valeur: -3 },
  ],
};

describe("lecture d'un nombre saisi", () => {
  it("accepte la virgule décimale, la norme française", () => {
    assert.equal(lireNombre("12,5"), 12.5);
    assert.equal(lireNombre("12.5"), 12.5);
  });

  it("ignore les séparateurs de milliers, insécables compris", () => {
    assert.equal(lireNombre("1 200"), 1200);
    assert.equal(lireNombre("1 200,5"), 1200.5);
    assert.equal(lireNombre("1 200"), 1200);
  });

  it("refuse ce qui n'est pas un nombre", () => {
    assert.equal(lireNombre(""), null);
    assert.equal(lireNombre("douze"), null);
    assert.equal(lireNombre("12%"), null);
  });
});

describe("normalisation", () => {
  it("écarte les lignes sans intitulé ou sans valeur exploitable", () => {
    const graphique = normaliserGraphique({
      type: "anneau",
      entrees: [
        { label: "Valide", valeur: "10" },
        { label: "", valeur: 4 },
        { label: "Sans valeur", valeur: "n/a" },
      ],
    });

    assert.deepEqual(graphique?.entrees, [{ label: "Valide", valeur: 10 }]);
  });

  it("refuse un graphique sans aucune entrée : il n'y aurait rien à dessiner", () => {
    assert.equal(normaliserGraphique({ type: "barres", entrees: [] }), null);
    assert.equal(normaliserGraphique(null), null);
    assert.equal(normaliserGraphique("barres"), null);
  });

  it("retombe sur les barres devant une forme inconnue", () => {
    const graphique = normaliserGraphique({ type: "camembert", entrees: [{ label: "A", valeur: 1 }] });
    assert.equal(graphique?.type, "barres");
  });
});

describe("encodage", () => {
  it("survit à l'aller-retour, accents compris", () => {
    const encode = encoderGraphique(GRAPHIQUE);
    assert.ok(encode);
    assert.match(encode, /^[A-Za-z0-9+/=]+$/);
    assert.deepEqual(decoderGraphique(encode), GRAPHIQUE);
  });

  it("refuse une valeur qui n'est pas du base64, sans lever", () => {
    assert.equal(decoderGraphique(""), null);
    assert.equal(decoderGraphique("<script>"), null);
    assert.equal(decoderGraphique("pas du base64 !"), null);
  });

  it("refuse une série trop longue pour tenir dans un attribut", () => {
    const enorme: Graphique = {
      ...GRAPHIQUE,
      entrees: Array.from({ length: 24 }, (_, index) => ({
        label: `Intitulé volontairement très long pour gonfler la description ${index}`,
        valeur: index,
      })),
    };
    assert.equal(encoderGraphique(enorme), null);
  });
});

describe("figure et assainissement", () => {
  const figure = figureGraphique(GRAPHIQUE);

  it("produit un repli lisible : les valeurs figurent en clair", () => {
    assert.ok(figure);
    assert.match(figure, /Kinshasa/);
    assert.match(figure, /Bénéficiaires par province/);
    // Un corps réduit à un graphique n'est pas un corps vide.
    assert.equal(isEmptyHtml(figure), false);
  });

  it("TRAVERSE l'assainisseur sans perdre sa description", () => {
    assert.ok(figure);
    const propre = sanitizeHtml(figure);
    const morceaux = decouperProse(propre);

    assert.equal(morceaux.length, 1);
    assert.equal(morceaux[0].kind, "graphique");
    if (morceaux[0].kind === "graphique") assert.deepEqual(morceaux[0].graphique, GRAPHIQUE);
  });

  it("isole le graphique du texte qui l'entoure, dans l'ordre", () => {
    assert.ok(figure);
    const corps = sanitizeHtml(`<p>Avant.</p>${figure}<p>Après.</p>`);
    const morceaux = decouperProse(corps);

    assert.deepEqual(morceaux.map((morceau) => morceau.kind), ["html", "graphique", "html"]);
    assert.match((morceaux[0] as { html: string }).html, /Avant/);
    assert.match((morceaux[2] as { html: string }).html, /Après/);
  });

  it("laisse le corps intact quand il ne porte aucun graphique", () => {
    const corps = "<p>Un paragraphe ordinaire.</p>";
    assert.deepEqual(decouperProse(corps), [{ kind: "html", html: corps }]);
  });

  it("refuse une description forgée à la main dans le HTML", () => {
    // L'attribut n'admet que du base64 : tout le reste tombe à
    // l'assainissement, et la figure retombe sur son repli textuel.
    const forge = '<figure class="prose-graphique" data-graphique="{&quot;type&quot;:&quot;barres&quot;}">'
      + "<p>Repli</p></figure>";
    const propre = sanitizeHtml(forge);

    assert.doesNotMatch(propre, /data-graphique/);
    assert.deepEqual(decouperProse(propre).map((morceau) => morceau.kind), ["html"]);
  });

  it("écarte les attributs et les classes que la figure n'a pas à porter", () => {
    const propre = sanitizeHtml(
      '<figure class="prose-graphique danger" data-graphique="QQ==" onclick="alert(1)" style="position:fixed">x</figure>',
    );

    assert.doesNotMatch(propre, /onclick/);
    assert.doesNotMatch(propre, /danger/);
    assert.doesNotMatch(propre, /position/);
    assert.match(propre, /class="prose-graphique"/);
  });
});
