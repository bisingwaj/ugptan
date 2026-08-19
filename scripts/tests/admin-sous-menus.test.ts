/**
 * Les sous-menus de la console disent-ils la même chose que ceux du site ?
 *
 * ─── Pourquoi ce test existe ────────────────────────────────────────────────
 *
 * Deux modules de la console — « Le Projet » et « L'UGPTN » — reprennent, écran
 * par écran, le sous-menu que le visiteur voit dans l'en-tête du site.
 * L'intérêt n'est pas la symétrie pour elle-même : c'est qu'un éditeur à qui
 * l'on demande de corriger la page des composantes la cherche sous le nom
 * qu'elle porte SUR LE SITE. La première version du module « Le Projet »
 * appelait ses écrans « La page du Projet », « Les composantes » et « Le cadre
 * de résultats » — trois noms qu'aucune page publique ne porte, à traduire
 * mentalement à chaque fois.
 *
 * Les libellés ne peuvent pas être IMPORTÉS de `content/i18n.ts` : ce module
 * pèse soixante-dix kilo-octets et partirait au navigateur avec la barre
 * latérale, qui est du code client. Ils sont donc recopiés — et une copie
 * dérive. C'est ce test qui la retient : il échoue dès que l'un des deux bouge
 * sans l'autre, en nommant celui qu'il faut aligner.
 *
 * Il vérifie aussi que chaque écran vise une page publique RÉELLE : un module
 * qui prétend administrer une page inexistante administre en fait autre chose.
 *
 * ⚠️ L'ÉQUIPE n'est volontairement pas concernée. Elle a son propre module, elle
 * alimente quatre emplacements du site dont deux hors du menu « L'UGPTN », et
 * elle n'est pas une entrée de ce sous-menu.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ADMIN_PROJET_ONGLETS, ADMIN_UGPTN_ONGLETS } from "@/content/admin";
import { dict } from "@/content/i18n";
import { NAV, NAV_TREE, isGroup, type NavGroupKey, type NavItem, type NavKey } from "@/lib/routes";

const fr = dict("fr");

/** Libellé du site pour une destination, tel que le sous-menu l'affiche. */
const libellePublic = (key: NavKey): string => fr.navSub[key] ?? fr.nav[key];

/**
 * Les enfants d'un groupe, dans l'ordre du site.
 *
 * ⚠️ Lus sur `NAV_TREE`, l'arbre de l'EN-TÊTE, et surtout pas sur `NAV_FOOTER` :
 * le pied de page rattache des feuilles de premier niveau à la colonne qui les
 * concerne, pour qu'aucune page ne reste sans lien en bas de page. « Contact »
 * y rejoint ainsi « L'UGPTN », et « Marchés » la colonne « Transparence ». Ce
 * sont des pages entières, avec leur propre module ou aucun — pas des écrans du
 * sous-menu que le visiteur déroule dans l'en-tête, qui est celui que la console
 * reprend.
 *
 * La première version de ce test lisait le pied de page et réclamait un
 * troisième écran « Contact » au module « L'UGPTN ».
 */
function enfantsDuGroupe(groupe: NavGroupKey): NavItem[] {
  const noeud = NAV_TREE.find((item) => isGroup(item) && item.key === groupe);
  assert.ok(noeud && isGroup(noeud), `Le groupe « ${groupe} » a disparu du menu de l'en-tête.`);
  return noeud.children;
}

/** Ce qu'un module de console déclare : un écran, la page qu'il administre. */
type Onglet = { readonly label: string; readonly public: string };

/**
 * Les modules à deux écrans ou plus, et le groupe public qu'ils reprennent.
 *
 * Un module ajouté ici est automatiquement soumis aux quatre contrôles.
 */
const MODULES: { nom: string; groupe: NavGroupKey; onglets: readonly Onglet[] }[] = [
  { nom: "Le Projet", groupe: "gprojet", onglets: ADMIN_PROJET_ONGLETS },
  { nom: "L'UGPTN", groupe: "gunite", onglets: ADMIN_UGPTN_ONGLETS },
];

for (const { nom, groupe, onglets } of MODULES) {
  describe(`sous-menu « ${nom} » de la console`, () => {
    it("compte autant d'écrans que le site a d'entrées", () => {
      const enfants = enfantsDuGroupe(groupe);
      assert.equal(
        onglets.length,
        enfants.length,
        `Le site propose ${enfants.length} entrées sous « ${nom} » (${enfants.map((e) => e.slug).join(", ")}) ` +
          `et la console ${onglets.length} écrans. Une page publique serait sans écran, ou un écran sans page.`,
      );
    });

    it("suit le même ordre et vise les mêmes pages", () => {
      const enfants = enfantsDuGroupe(groupe);
      onglets.forEach((onglet, rang) => {
        assert.equal(
          onglet.public,
          enfants[rang].slug,
          `L'écran « ${onglet.label} » est en ${rang + 1}ᵉ position et déclare administrer « ${onglet.public} », ` +
            `alors que le site place « ${enfants[rang].slug} » à ce rang.`,
        );
      });
    });

    it("porte les libellés du site, au mot près", () => {
      const enfants = enfantsDuGroupe(groupe);
      onglets.forEach((onglet, rang) => {
        const attendu = libellePublic(enfants[rang].key);
        assert.equal(
          onglet.label,
          attendu,
          `La console appelle cet écran « ${onglet.label} », le site appelle la page « ${attendu} ». ` +
            "Alignez les onglets du module sur `navSub`/`nav` (src/content/i18n.ts), ou l'inverse.",
        );
      });
    });

    it("ne vise que des pages publiques déclarées", () => {
      const chemins = new Set(Object.values(NAV));
      for (const onglet of onglets) {
        assert.ok(
          chemins.has(onglet.public),
          `L'écran « ${onglet.label} » déclare administrer « ${onglet.public} », qui n'est pas un chemin de NAV. ` +
            "Le module administrerait une page qui n'existe pas.",
        );
      }
    });
  });
}
