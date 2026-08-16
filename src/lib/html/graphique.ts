/**
 * Les GRAPHIQUES du corps rédigé : description, encodage, repli.
 *
 * Un rapport se lit autant dans ses chiffres que dans ses phrases. L'éditeur
 * permet donc d'insérer une série de valeurs, que le site dessine lui-même.
 *
 * ─── Pourquoi une DESCRIPTION en base, et non un dessin ──────────────────────
 *
 * L'évidence serait de produire le SVG dans l'éditeur et de l'enregistrer avec
 * le reste du corps. C'est exactement ce que l'assainisseur refuse : `svg` fait
 * partie des sous-arbres JETÉS (cf. lib/html/sanitize.ts), parce que son espace
 * de noms admet des gestionnaires d'événements que la liste blanche des balises
 * HTML ne modélise pas. Ouvrir SVG pour dessiner des barres reviendrait à
 * ouvrir une porte d'exécution dans la console pour un gain graphique.
 *
 * Ce qui est enregistré est donc la DONNÉE — type, titre, unité, série — et
 * c'est le site qui la dessine, avec ses propres composants
 * (cf. components/prose/Graphique.tsx). Trois conséquences, toutes bonnes :
 * le dessin suit le design system même sur les graphiques d'il y a deux ans,
 * les valeurs restent lisibles par un moteur de recherche, et rien
 * d'exécutable n'entre jamais en base.
 *
 * ─── L'encodage, et pourquoi base64 ─────────────────────────────────────────
 *
 * La description voyage dans un attribut `data-graphique` de la balise
 * `<figure>`. Encodée en base64, elle ne contient que `[A-Za-z0-9+/=]` : aucun
 * guillemet, aucun chevron, aucune entité. Elle traverse donc sans dommage
 * l'assainisseur, `contenteditable`, un copier-coller et un aller-retour par le
 * mode « code source » de l'éditeur — ce qu'un JSON en clair ne garantit pas.
 *
 * ─── Le repli, et pourquoi il n'est pas décoratif ───────────────────────────
 *
 * La `<figure>` n'est pas vide : elle contient un TABLEAU des mêmes valeurs.
 * C'est ce que voit le rédacteur dans l'éditeur, et c'est ce que lirait un
 * visiteur si le rendu venait à manquer. Un graphique dont les chiffres ne sont
 * lisibles que dans son dessin est un graphique qui disparaît en entier à la
 * première anomalie.
 *
 * ⚠️ Module lu AUX DEUX BOUTS — éditeur de la console et rendu du site. Aucun
 * import, aucune API propre à un environnement.
 */

/* -------------------------------------------------------------------------- */
/* Vocabulaire                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Les quatre formes proposées, choisies sur ce qu'elles répondent :
 *   · `barres`   — comparer des grandeurs entre elles. La forme par défaut :
 *     les intitulés y tiennent en toutes lettres, quelle qu'en soit la longueur ;
 *   · `colonnes` — la même comparaison quand l'axe se lit comme une progression
 *     (des trimestres, des tranches d'âge) ;
 *   · `lignes`   — une évolution dans le temps, où c'est la pente qui informe ;
 *   · `anneau`   — une répartition dont le total fait un tout (100 %).
 *
 * Pas de camembert plein, pas d'histogramme empilé, pas de double axe : trois
 * formes qui se lisent mal et qu'aucun rapport de projet n'exige.
 */
export const GRAPHIQUE_TYPES = ["barres", "colonnes", "lignes", "anneau"] as const;
export type GraphiqueType = (typeof GRAPHIQUE_TYPES)[number];

export const isGraphiqueType = (value: string): value is GraphiqueType =>
  (GRAPHIQUE_TYPES as readonly string[]).includes(value);

/** Libellés de la console. Le site, lui, n'affiche jamais le nom d'une forme. */
export const GRAPHIQUE_TYPE_LABEL: Record<GraphiqueType, string> = {
  barres: "Barres horizontales",
  colonnes: "Colonnes verticales",
  lignes: "Courbe d'évolution",
  anneau: "Anneau de répartition",
};

export const GRAPHIQUE_TYPE_AIDE: Record<GraphiqueType, string> = {
  barres: "Comparer des grandeurs. Les intitulés longs y tiennent en entier.",
  colonnes: "Comparer sur un axe qui progresse : trimestres, tranches, exercices.",
  lignes: "Suivre une évolution. C'est la pente qui informe, pas la valeur isolée.",
  anneau: "Répartir un total en parts. À réserver aux séries qui font un tout.",
};

/** Une entrée de la série : un intitulé, une valeur. */
export type GraphiqueEntree = { label: string; valeur: number };

/** La description complète d'un graphique, telle qu'elle vit en base. */
export type Graphique = {
  type: GraphiqueType;
  /** Ce que le graphique établit. Sert de titre à la figure et d'étiquette accessible. */
  titre: string;
  /** « % », « km », « M USD ». Vide quand la valeur se suffit. */
  unite: string;
  /** Provenance des chiffres, affichée sous le graphique. */
  source: string;
  entrees: GraphiqueEntree[];
};

/* -------------------------------------------------------------------------- */
/* Garde-fous                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Plafonds de saisie. Ils ne protègent pas d'une attaque — le contenu vient de
 * la console — mais d'un collage malheureux : un tableur entier déversé dans le
 * formulaire produirait une figure illisible et un attribut de plusieurs
 * kilo-octets, que l'assainisseur écarterait sans rien dire.
 */
export const GRAPHIQUE_MAX_ENTREES = 24;
const MAX_LABEL = 60;
const MAX_TITRE = 140;
const MAX_UNITE = 12;
const MAX_SOURCE = 180;

/** Au-delà, l'attribut dépasserait la limite de l'assainisseur (4 096). */
const MAX_ENCODE = 3000;

const couper = (valeur: unknown, max: number): string =>
  typeof valeur === "string" ? valeur.replace(/\s+/g, " ").trim().slice(0, max) : "";

/**
 * Lit un nombre saisi à la main : « 12,5 », « 12.5 », « 1 200 », « 1 200,5 ».
 *
 * La virgule décimale est la norme en français et le champ est rempli par des
 * francophones : refuser « 12,5 » ferait perdre la moitié des saisies au
 * premier chiffre après la virgule. Les espaces — y compris l'insécable des
 * séparateurs de milliers — tombent avant lecture.
 */
export function lireNombre(saisie: string): number | null {
  const nettoye = saisie.replace(/\s/g, "").replace(",", ".");
  if (!nettoye || !/^-?\d*\.?\d+$/.test(nettoye)) return null;
  const nombre = Number(nettoye);
  return Number.isFinite(nombre) ? nombre : null;
}

/**
 * Ramène une description quelconque à une description valide, ou `null`.
 *
 * Point de passage OBLIGÉ : tout ce qui entre — décodage d'un attribut, envoi
 * d'un formulaire — traverse cette fonction. Une entrée sans intitulé ou sans
 * valeur numérique est écartée ; un graphique sans entrée n'existe pas.
 */
export function normaliserGraphique(entree: unknown): Graphique | null {
  if (typeof entree !== "object" || entree === null) return null;
  const brut = entree as Record<string, unknown>;

  const type = typeof brut.type === "string" && isGraphiqueType(brut.type) ? brut.type : "barres";

  const entrees: GraphiqueEntree[] = Array.isArray(brut.entrees)
    ? brut.entrees
        .map((item) => {
          if (typeof item !== "object" || item === null) return null;
          const ligne = item as Record<string, unknown>;
          const label = couper(ligne.label, MAX_LABEL);
          const valeur =
            typeof ligne.valeur === "number"
              ? ligne.valeur
              : typeof ligne.valeur === "string"
                ? lireNombre(ligne.valeur)
                : null;
          if (!label || valeur === null || !Number.isFinite(valeur)) return null;
          // Arrondi au centième : au-delà, l'axe n'a plus de sens à l'écran et
          // la description gonfle pour rien.
          return { label, valeur: Math.round(valeur * 100) / 100 };
        })
        .filter((ligne): ligne is GraphiqueEntree => ligne !== null)
        .slice(0, GRAPHIQUE_MAX_ENTREES)
    : [];

  if (entrees.length === 0) return null;

  return {
    type,
    titre: couper(brut.titre, MAX_TITRE),
    unite: couper(brut.unite, MAX_UNITE),
    source: couper(brut.source, MAX_SOURCE),
    entrees,
  };
}

/* -------------------------------------------------------------------------- */
/* Encodage                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * UTF-8 → base64. `btoa` ne sait traiter que des octets : les accents des
 * intitulés le feraient lever sans ce passage par `TextEncoder`.
 *
 * La boucle plutôt que `String.fromCharCode(...octets)` : l'étalement d'un
 * tableau en arguments a une limite de pile, et un graphique de vingt-quatre
 * entrées la frôlerait sur certains moteurs.
 */
function versBase64(texte: string): string {
  const octets = new TextEncoder().encode(texte);
  let binaire = "";
  for (const octet of octets) binaire += String.fromCharCode(octet);
  return btoa(binaire);
}

function depuisBase64(donnees: string): string {
  const binaire = atob(donnees);
  const octets = new Uint8Array(binaire.length);
  for (let i = 0; i < binaire.length; i += 1) octets[i] = binaire.charCodeAt(i);
  return new TextDecoder().decode(octets);
}

/** Jeu de caractères de l'attribut. Repris par l'assainisseur, qui l'impose. */
export const EST_BASE64 = /^[A-Za-z0-9+/=]+$/;

/** Description → valeur d'attribut. `null` si elle dépasse ce qu'un attribut porte. */
export function encoderGraphique(graphique: Graphique): string | null {
  try {
    const encode = versBase64(JSON.stringify(graphique));
    return encode.length > MAX_ENCODE ? null : encode;
  } catch {
    return null;
  }
}

/** Valeur d'attribut → description. `null` sur toute anomalie, sans lever. */
export function decoderGraphique(donnees: string): Graphique | null {
  const valeur = donnees.trim();
  if (!valeur || valeur.length > MAX_ENCODE || !EST_BASE64.test(valeur)) return null;
  try {
    return normaliserGraphique(JSON.parse(depuisBase64(valeur)));
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Marquage                                                                    */
/* -------------------------------------------------------------------------- */

/** Classe de la figure. Une seule, et elle est sur la liste blanche des classes. */
export const GRAPHIQUE_CLASSE = "prose-graphique";
/** Attribut porteur de la description. Admis sur `figure`, et sur elle seule. */
export const GRAPHIQUE_ATTR = "data-graphique";

/**
 * Repère les figures de graphique dans un fragment déjà assaini.
 *
 * L'attribut est cherché n'importe où dans la balise ouvrante, et non à une
 * place fixe : l'ordre des attributs n'est garanti ni par l'éditeur ni par
 * l'assainisseur. Le `[^>]*` est sûr parce qu'aucune valeur d'attribut réémise
 * ne contient de chevron — ils sortent échappés (cf. lib/html/sanitize.ts).
 */
export const GRAPHIQUE_FIGURE =
  /<figure\b[^>]*\sdata-graphique="([A-Za-z0-9+/=]*)"[^>]*>[\s\S]*?<\/figure>/gi;

const echapper = (valeur: string): string =>
  valeur
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Valeur affichée : « 12,5 % », « 1 200 », « 12.5% » en anglais.
 *
 * Le séparateur de milliers vient d'`Intl`, celui de l'unité est posé ici : une
 * espace insécable étroite, pour que « 4,2 Mo » ne se coupe jamais en fin de
 * ligne. L'anglais colle son signe de pourcentage, contrairement au français.
 */
export function formatValeurGraphique(valeur: number, unite: string, locale = "fr-FR"): string {
  const nombre = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(valeur);
  if (!unite) return nombre;
  const separateur = unite === "%" && locale.startsWith("en") ? "" : "\u202f";
  return `${nombre}${separateur}${unite}`;
}

/**
 * La `<figure>` telle qu'elle est enregistrée : description encodée, et tableau
 * des valeurs en clair pour tout ce qui ne sait pas la dessiner.
 *
 * Le HTML produit ne contient que des balises et des classes déjà admises par
 * l'assainisseur : il traverse `sanitizeHtml` sans perdre un attribut.
 */
export function figureGraphique(graphique: Graphique): string | null {
  const encode = encoderGraphique(graphique);
  if (!encode) return null;

  const titre = graphique.titre || "Graphique";
  const enTete = graphique.unite ? `Valeur (${graphique.unite})` : "Valeur";

  const lignes = graphique.entrees
    .map(
      (entree) =>
        `<tr><th scope="row">${echapper(entree.label)}</th>` +
        `<td>${echapper(formatValeurGraphique(entree.valeur, graphique.unite))}</td></tr>`,
    )
    .join("");

  return (
    `<figure class="${GRAPHIQUE_CLASSE}" ${GRAPHIQUE_ATTR}="${encode}">` +
    `<table><caption>${echapper(titre)}</caption>` +
    `<thead><tr><th scope="col">Intitulé</th><th scope="col">${echapper(enTete)}</th></tr></thead>` +
    `<tbody>${lignes}</tbody></table>` +
    (graphique.source ? `<figcaption>${echapper(graphique.source)}</figcaption>` : "") +
    `</figure>`
  );
}

/* -------------------------------------------------------------------------- */
/* Découpe du corps                                                            */
/* -------------------------------------------------------------------------- */

/** Un morceau de corps : du HTML ordinaire, ou un graphique à dessiner. */
export type MorceauProse =
  | { kind: "html"; html: string }
  | { kind: "graphique"; graphique: Graphique };

/**
 * Découpe un corps assaini en morceaux, les figures de graphique isolées.
 *
 * Une figure dont la description est illisible reste du HTML : elle affichera
 * son tableau de repli plutôt que de disparaître du texte.
 */
export function decouperProse(html: string): MorceauProse[] {
  if (!html.includes(GRAPHIQUE_ATTR)) return [{ kind: "html", html }];

  const morceaux: MorceauProse[] = [];
  let curseur = 0;

  // `lastIndex` est remis à zéro : l'expression est partagée (drapeau `g`) et
  // conserverait sinon la position du dernier appel.
  GRAPHIQUE_FIGURE.lastIndex = 0;
  let trouve = GRAPHIQUE_FIGURE.exec(html);

  while (trouve !== null) {
    const graphique = decoderGraphique(trouve[1]);

    if (graphique) {
      if (trouve.index > curseur) morceaux.push({ kind: "html", html: html.slice(curseur, trouve.index) });
      morceaux.push({ kind: "graphique", graphique });
      curseur = trouve.index + trouve[0].length;
    }

    trouve = GRAPHIQUE_FIGURE.exec(html);
  }

  if (curseur < html.length) morceaux.push({ kind: "html", html: html.slice(curseur) });
  return morceaux;
}
