/**
 * Le sous-menu « Le Projet » de la console dit-il la même chose que celui du site ?
 *
 * ─── Pourquoi ce test existe ────────────────────────────────────────────────
 *
 * Le module de la console reprend, écran par écran, le sous-menu que le
 * visiteur voit dans l'en-tête du site. L'intérêt n'est pas la symétrie pour
 * elle-même : c'est qu'un éditeur à qui l'on demande de corriger la page des
 * composantes la cherche sous le nom qu'elle porte SUR LE SITE. La première
 * version de ce module l'appelait « Les composantes », la page d'ensemble « La
 * page du Projet » et les indicateurs « Le cadre de résultats » — trois noms
 * qu'aucune page publique ne porte, à traduire mentalement à chaque fois.
 *
 * Les libellés ne peuvent pas être IMPORTÉS de `content/i18n.ts` : ce module
 * pèse soixante-dix kilo-octets et partirait au navigateur avec la barre
 * latérale, qui est du code client. Ils sont donc recopiés — et une copie
 * dérive. C'est ce test qui la retient : il échoue dès que l'un des deux bouge
 * sans l'autre, en nommant celui qu'il faut aligner.
 *
 * Il vérifie aussi que chaque écran vise une page publique RÉELLE : un module
 * qui prétend administrer une page inexistante administre en fait autre chose.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ADMIN_PROJET_ONGLETS } from "@/content/admin";
import { dict } from "@/content/i18n";
import { NAV, NAV_FOOTER, isGroup, type NavItem, type NavKey } from "@/lib/routes";

const fr = dict("fr");

/** Libellé du site pour une destination, tel que le sous-menu l'affiche. */
const libellePublic = (key: NavKey): string => fr.navSub[key] ?? fr.nav[key];

/** Les enfants du groupe « Le Projet », dans l'ordre du site. */
const enfantsDuProjet = (): NavItem[] => {
  const groupe = NAV_FOOTER.find((noeud) => noeud.key === "gprojet");
  assert.ok(groupe && isGroup(groupe), "Le groupe « gprojet » a disparu de la navigation publique.");
  return groupe.children;
};

describe("sous-menu « Le Projet » de la console", () => {
  it("compte autant d'écrans que le site a d'entrées", () => {
    const enfants = enfantsDuProjet();
    assert.equal(
      ADMIN_PROJET_ONGLETS.length,
      enfants.length,
      `Le site propose ${enfants.length} entrées sous « Le Projet » (${enfants.map((e) => e.slug).join(", ")}) ` +
        `et la console ${ADMIN_PROJET_ONGLETS.length} écrans. Une page publique serait sans écran, ` +
        "ou un écran sans page.",
    );
  });

  it("suit le même ordre et vise les mêmes pages", () => {
    const enfants = enfantsDuProjet();
    ADMIN_PROJET_ONGLETS.forEach((onglet, rang) => {
      assert.equal(
        onglet.public,
        enfants[rang].slug,
        `L'écran « ${onglet.label} » est en ${rang + 1}ᵉ position et déclare administrer « ${onglet.public} », ` +
          `alors que le site place « ${enfants[rang].slug} » à ce rang.`,
      );
    });
  });

  it("porte les libellés du site, au mot près", () => {
    const enfants = enfantsDuProjet();
    ADMIN_PROJET_ONGLETS.forEach((onglet, rang) => {
      const attendu = libellePublic(enfants[rang].key);
      assert.equal(
        onglet.label,
        attendu,
        `La console appelle cet écran « ${onglet.label} », le site appelle la page « ${attendu} ». ` +
          "Alignez ADMIN_PROJET_ONGLETS sur `navSub`/`nav` (src/content/i18n.ts), ou l'inverse.",
      );
    });
  });

  it("ne vise que des pages publiques déclarées", () => {
    const chemins = new Set(Object.values(NAV));
    for (const onglet of ADMIN_PROJET_ONGLETS) {
      assert.ok(
        chemins.has(onglet.public),
        `L'écran « ${onglet.label} » déclare administrer « ${onglet.public} », qui n'est pas un chemin de NAV. ` +
          "Le module administrerait une page qui n'existe pas.",
      );
    }
  });
});
