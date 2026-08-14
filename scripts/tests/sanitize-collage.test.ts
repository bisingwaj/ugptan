/**
 * Ce que l'assainisseur fait d'un PRESSE-PAPIERS réel.
 *
 * L'éditeur de la console fait passer tout collage par `sanitizeHtml` (cf.
 * components/dashboard/actus/RichEditor.tsx). Ce filtre est donc la porte par
 * laquelle entre l'essentiel du contenu du site : un rédacteur écrit rarement
 * dans le navigateur, il colle depuis Word, depuis Google Docs ou depuis une
 * page web.
 *
 * ─── Le défaut que ces tests interdisent de refaire ─────────────────────────
 *
 * `<meta>` figurait parmi les sous-arbres JETÉS mais pas parmi les balises
 * ORPHELINES. Faute de trouver un `</meta>` qui n'existe pas, l'assainisseur
 * sautait jusqu'à la fin du fragment — et comme Chrome, Safari et Google Docs
 * préfixent le presse-papiers HTML d'un `<meta charset="utf-8">`, TOUT collage
 * ressortait vide. Le symptôme, côté rédacteur, était « on ne peut pas coller ».
 *
 * D'où la forme de ces tests : ils partent de charges utiles telles que les
 * applications les produisent, préfixe compris, et vérifient que le TEXTE
 * survit. Le balisage exact, lui, n'est pas figé — c'est le travail du filtre
 * de le réduire, et il doit pouvoir évoluer.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { htmlToText, sanitizeHtml } from "@/lib/html/sanitize";

/** Le texte survit-il au filtre ? */
const texteDe = (brut: string): string => htmlToText(sanitizeHtml(brut));

describe("collage depuis une application", () => {
  it("garde le contenu malgré le préfixe <meta> des navigateurs", () => {
    const propre = texteDe(`<meta charset='utf-8'>Simple ligne de texte collée.`);
    assert.equal(propre, "Simple ligne de texte collée.");
  });

  it("garde le contenu d'un collage Google Docs", () => {
    const docs = `<meta charset="utf-8"><b style="font-weight:normal" id="docs-internal-guid-1a2b">`
      + `<p dir="ltr" style="line-height:1.38"><span style="font-size:11pt">Un paragraphe.</span></p>`
      + `<p dir="ltr"><span style="font-weight:700">En gras</span>, puis normal.</p></b>`;

    const texte = texteDe(docs);
    assert.match(texte, /Un paragraphe\./);
    assert.match(texte, /En gras, puis normal\./);
  });

  it("garde le contenu d'un collage Word, styles et balises Office écartés", () => {
    const word = `<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8">`
      + `<style><!-- p.MsoNormal {margin:0cm} --></style></head><body lang=FR>`
      + `<p class=MsoNormal style='margin-bottom:0cm'><span style='font-size:11.0pt'>`
      + `Le déploiement progresse.<o:p></o:p></span></p></body></html>`;

    const propre = sanitizeHtml(word);
    assert.match(htmlToText(propre), /Le déploiement progresse\./);
    // La feuille de style de Word ne doit pas ressortir en texte visible.
    assert.doesNotMatch(propre, /MsoNormal/);
    assert.doesNotMatch(propre, /<style/i);
  });

  it("garde un tableau collé depuis un tableur, cellules séparées", () => {
    const excel = `<meta charset="utf-8"><table border=0 cellpadding=0>`
      + `<tr height=20><td class=xl65 style='border-top:none'>Province</td><td class=xl66>Taux</td></tr>`
      + `<tr><td>Kinshasa</td><td align=right>42,5</td></tr></table>`;

    const propre = sanitizeHtml(excel);
    assert.match(propre, /<table>/);
    // ⚠️ L'espace entre deux cellules compte : sans lui, le résumé automatique
    // et la description SEO afficheraient « Kinshasa42,5 ».
    assert.match(htmlToText(propre), /Kinshasa 42,5/);
  });

  it("garde le contenu d'une page web, liens et listes compris", () => {
    const page = `<meta charset='utf-8'><div class="article"><h2>Un titre</h2>`
      + `<p>Un paragraphe avec <a href="https://exemple.cd">un lien</a>.</p>`
      + `<ul><li>Premier</li><li>Second</li></ul></div>`;

    const propre = sanitizeHtml(page);
    assert.match(propre, /<h2>Un titre<\/h2>/);
    assert.match(propre, /href="https:\/\/exemple\.cd"/);
    assert.match(propre, /<li>Premier<\/li>/);
  });

  it("écarte toujours ce qui est dangereux, préfixe <meta> ou non", () => {
    const attaque = `<meta charset="utf-8"><p onclick="alert(1)">Texte</p>`
      + `<script>alert(2)</script><img src="x" onerror="alert(3)">`
      + `<a href="javascript:alert(4)">lien</a>`;

    const propre = sanitizeHtml(attaque);
    assert.match(propre, /Texte/);
    assert.doesNotMatch(propre, /onclick|onerror|javascript:/i);
    assert.doesNotMatch(propre, /alert\(2\)/);
  });

  it("ne laisse pas une balise orpheline emporter la suite du fragment", () => {
    // Toutes ces balises sont jetées ; aucune n'a de fermeture. Ce qui les suit
    // doit survivre.
    for (const orpheline of ["meta charset='utf-8'", "link rel='stylesheet'", "base href='/'", "input type='text'"]) {
      const propre = texteDe(`<${orpheline}><p>Contenu qui suit.</p>`);
      assert.equal(propre, "Contenu qui suit.", `emporté par <${orpheline.split(" ")[0]}>`);
    }
  });

  it("jette en revanche le CONTENU d'un sous-arbre qui en a un", () => {
    // `style` et `script` ont une fermeture : leur corps ne doit pas ressortir
    // en texte, contrairement au cas ci-dessus.
    assert.equal(texteDe("<style>p{color:red}</style><p>Après.</p>"), "Après.");
    assert.equal(texteDe("<script>var x = 1;</script><p>Après.</p>"), "Après.");
  });
});
