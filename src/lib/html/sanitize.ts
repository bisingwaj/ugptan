/**
 * Assainisseur HTML de l'éditeur d'articles.
 *
 * Aucune dépendance, aucun import `node:` : le module tourne AUX DEUX BOUTS —
 * côté serveur avant écriture en base (barrière de référence), et côté client
 * dans l'éditeur pour nettoyer un collage venu de Word ou d'une page web.
 *
 * Parti retenu : un vrai tokeniseur, et non une série de `replace()`. Le
 * remplacement par expression régulière est la façon classique de rater un
 * `<img src=x onerror=…>` écrit avec des espaces inattendus ; ici, chaque
 * balise est décomposée (nom, attributs, valeurs) puis RECONSTRUITE à partir
 * d'une liste blanche. Ce qui n'est pas explicitement autorisé n'est jamais
 * réémis, quelle qu'en soit l'orthographe.
 *
 * Trois règles structurent le tout :
 *   1. balises et attributs : liste blanche stricte, tout le reste tombe ;
 *   2. URL : schéma vérifié APRÈS décodage des entités — sans quoi
 *      `&#106;avascript:` passerait la barrière ;
 *   3. texte : réémis échappé, les entités valides étant préservées telles
 *      quelles pour ne pas afficher « &amp;amp; » au lecteur.
 */

/** Balises sans contenu : jamais empilées, jamais refermées. */
const VOID_TAGS = new Set(["br", "hr", "img", "source", "col", "wbr"]);

/**
 * Balises jetées AVEC leur contenu. Les conserver en texte échappé serait sûr
 * mais afficherait au lecteur le corps d'une feuille de style collée par
 * mégarde. `svg` et `math` en font partie : leurs espaces de noms admettent des
 * gestionnaires d'événements que la liste blanche ci-dessous ne modélise pas.
 */
const DROPPED_SUBTREES = new Set([
  "script", "style", "title", "textarea", "noscript",
  "template", "svg", "math", "head", "base", "meta", "link",
  "object", "embed", "applet", "form", "input", "button", "select", "option",
]);

/**
 * Liste blanche : balise → attributs qui lui sont propres.
 * Les attributs globaux (class, style, dir, lang) s'y ajoutent, filtrés eux
 * aussi (cf. `ALLOWED_CLASSES` et `ALLOWED_STYLE_PROPS`).
 */
const ALLOWED_TAGS: Record<string, readonly string[]> = {
  p: [], br: [], hr: [],
  strong: [], b: [], em: [], i: [], u: [], s: [], del: [], ins: [],
  mark: [], sub: [], sup: [], small: [], abbr: ["title"],
  code: [], pre: [], kbd: [],
  blockquote: ["cite"],
  h2: [], h3: [], h4: [], h5: [],
  ul: [], ol: ["start", "type"], li: [],
  dl: [], dt: [], dd: [],
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  figure: [], figcaption: [],
  table: [], thead: [], tbody: [], tfoot: [], caption: [], colgroup: [], col: ["span"],
  tr: [], th: ["colspan", "rowspan", "scope"], td: ["colspan", "rowspan"],
  div: [], span: [],
  iframe: ["src", "title", "width", "height", "allow", "allowfullscreen", "loading"],
};

const GLOBAL_ATTRS = new Set(["class", "style", "dir", "lang"]);

/**
 * Classes admises dans le corps d'un article.
 *
 * Une liste blanche et non un passe-droit : le HTML de l'éditeur est injecté
 * dans la page publique, une classe libre permettrait de repeindre n'importe
 * quel élément du design system depuis la console.
 */
const ALLOWED_CLASSES = new Set([
  "ta-left", "ta-center", "ta-right", "ta-justify",
  "actu-embed", "actu-figure", "actu-figure--wide", "actu-table",
  "mono", "lead",
]);

/** Propriétés de style admises. `url()` et compagnie sont refusés en aval. */
const ALLOWED_STYLE_PROPS = new Set([
  "text-align", "color", "background-color", "font-weight", "font-style",
  "text-decoration", "text-decoration-line", "width", "height", "max-width",
  "margin-left", "padding-left", "aspect-ratio", "vertical-align",
]);

const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

/**
 * Hôtes admis dans un `<iframe>`. Une intégration vidéo est une exécution de
 * code tiers dans la page : la liste reste courte et explicite.
 */
const ALLOWED_FRAME_HOSTS = [
  "www.youtube-nocookie.com", "youtube-nocookie.com",
  "www.youtube.com", "youtube.com",
  "player.vimeo.com",
  "www.dailymotion.com", "geo.dailymotion.com",
];

/** Longueur maximale d'une valeur d'attribut — garde-fou contre le gonflement. */
const MAX_ATTR_LENGTH = 4096;

/* -------------------------------------------------------------------------- */
/* Entités et échappement                                                      */
/* -------------------------------------------------------------------------- */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  laquo: "«", raquo: "»", hellip: "…", eacute: "é", egrave: "è",
};

function fromCodePoint(code: number): string {
  if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return "";
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

/**
 * Décode les entités d'une valeur d'attribut avant contrôle.
 *
 * Deux passes : `&amp;#x6a;` se décode en `&#x6a;` à la première, en « j » à la
 * seconde. Sans cette répétition, un double encodage traverserait le contrôle
 * de schéma pour être décodé par le navigateur.
 */
function decodeEntities(value: string): string {
  let out = value;
  for (let pass = 0; pass < 2; pass += 1) {
    out = out
      .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) => fromCodePoint(parseInt(hex, 16)))
      .replace(/&#(\d+);?/g, (_, dec: string) => fromCodePoint(parseInt(dec, 10)))
      .replace(/&([a-z]+);?/gi, (match, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
  }
  return out;
}

/** Entité déjà bien formée, ancrée en début de chaîne. */
const LEADING_ENTITY = /^&(#\d{1,7}|#x[0-9a-f]{1,6}|[a-z][a-z0-9]{1,31});/i;

/**
 * Échappe un nœud texte. `&` n'est échappé QUE s'il n'ouvre pas une entité
 * valide : sinon un « &nbsp; » saisi dans l'éditeur ressortirait en
 * « &amp;nbsp; » et s'afficherait littéralement au lecteur.
 */
function escapeText(text: string): string {
  let out = "";
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (char === "<") { out += "&lt;"; i += 1; continue; }
    if (char === ">") { out += "&gt;"; i += 1; continue; }
    if (char === "&") {
      const entity = LEADING_ENTITY.exec(text.slice(i, i + 34));
      if (entity) { out += entity[0]; i += entity[0].length; continue; }
      out += "&amp;";
      i += 1;
      continue;
    }

    // Saut jusqu'au prochain caractère à traiter : évite un passage caractère
    // par caractère sur les longs paragraphes.
    const stops = [text.indexOf("<", i), text.indexOf(">", i), text.indexOf("&", i)].filter((n) => n !== -1);
    const stop = stops.length ? Math.min(...stops) : text.length;
    out += text.slice(i, stop);
    i = stop;
  }

  return out;
}

/** Échappe une valeur d'attribut, réémise entre guillemets doubles. */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* -------------------------------------------------------------------------- */
/* Contrôles de valeur                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Valide une URL. Renvoie la valeur décodée, ou `null` si le schéma n'est pas
 * autorisé. Les caractères de contrôle sont retirés AVANT lecture du schéma :
 * `java\nscript:` et `java\tscript:` sont des vecteurs connus.
 */
export function safeUrl(raw: string): string | null {
  const value = decodeEntities(raw).replace(/[\u0000-\u0020\u007f-\u00a0\u2028\u2029]+/g, "").trim();
  if (!value) return null;
  if (value.length > MAX_ATTR_LENGTH) return null;

  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value);
  // Pas de schéma : chemin relatif, ancre ou URL protocol-relative — admis.
  if (!scheme) return value;

  return SAFE_SCHEMES.has(scheme[1].toLowerCase()) ? value : null;
}

/** Hôte d'une URL d'iframe, en minuscules, ou `null` si illisible. */
function frameHost(url: string): string | null {
  const match = /^(?:https?:)?\/\/([^/?#]+)/i.exec(url);
  if (!match) return null;
  // On coupe un éventuel `user@` et le port : ni l'un ni l'autre n'entre dans
  // la comparaison d'hôte.
  return match[1].split("@").pop()!.split(":")[0].toLowerCase();
}

/** Un `<iframe>` n'est conservé que s'il pointe vers une plateforme connue. */
function isAllowedFrame(url: string): boolean {
  const host = frameHost(url);
  return host !== null && ALLOWED_FRAME_HOSTS.includes(host);
}

/** Filtre les classes sur la liste blanche. Chaîne vide = attribut supprimé. */
function sanitizeClass(value: string): string {
  return decodeEntities(value)
    .split(/\s+/)
    .filter((token) => ALLOWED_CLASSES.has(token))
    .join(" ");
}

/**
 * Filtre un `style` en ligne, propriété par propriété.
 *
 * `url(` est refusé sans condition : c'est la porte d'entrée d'une requête
 * réseau déclenchée par le contenu (et, sur de vieux moteurs, d'une exécution).
 */
function sanitizeStyle(value: string): string {
  const declarations = decodeEntities(value).split(";");
  const kept: string[] = [];

  for (const declaration of declarations) {
    const colon = declaration.indexOf(":");
    if (colon === -1) continue;

    const prop = declaration.slice(0, colon).trim().toLowerCase();
    const raw = declaration.slice(colon + 1).trim();
    if (!ALLOWED_STYLE_PROPS.has(prop)) continue;
    if (!raw || raw.length > 120) continue;
    if (/url\s*\(|expression|javascript:|@import|\\|\/\*|<|>/i.test(raw)) continue;
    // Jeu de caractères d'une valeur CSS ordinaire : couleurs, longueurs,
    // mots-clés, fonctions rgb()/hsl()/var(). Tout le reste tombe.
    if (!/^[a-z0-9\s.,%#()\-+/]+$/i.test(raw)) continue;

    kept.push(`${prop}: ${raw}`);
  }

  return kept.join("; ");
}

/* -------------------------------------------------------------------------- */
/* Tokeniseur                                                                  */
/* -------------------------------------------------------------------------- */

type ParsedTag = {
  name: string;
  closing: boolean;
  selfClosing: boolean;
  attrs: [string, string][];
  /** Index du premier caractère APRÈS la balise. */
  end: number;
};

/**
 * Lit une balise à partir de `<`. Renvoie `null` si la balise est malformée ou
 * non terminée — l'appelant traite alors le `<` comme du texte.
 *
 * La lecture des attributs respecte les guillemets : un `>` à l'intérieur d'une
 * valeur ne termine pas la balise, ce qu'une expression régulière ignorerait.
 */
function parseTag(src: string, start: number): ParsedTag | null {
  let i = start + 1;
  const closing = src[i] === "/";
  if (closing) i += 1;

  const nameStart = i;
  while (i < src.length && /[a-z0-9]/i.test(src[i])) i += 1;
  if (i === nameStart) return null;

  const name = src.slice(nameStart, i).toLowerCase();
  const attrs: [string, string][] = [];
  let selfClosing = false;

  for (;;) {
    while (i < src.length && /\s/.test(src[i])) i += 1;
    if (i >= src.length) return null; // balise non terminée

    if (src[i] === ">") { i += 1; break; }
    if (src[i] === "/") { selfClosing = true; i += 1; continue; }

    const attrStart = i;
    while (i < src.length && !/[\s=>/]/.test(src[i])) i += 1;
    if (i === attrStart) { i += 1; continue; } // caractère parasite

    const attrName = src.slice(attrStart, i).toLowerCase();
    let value = "";

    let j = i;
    while (j < src.length && /\s/.test(src[j])) j += 1;

    if (src[j] === "=") {
      j += 1;
      while (j < src.length && /\s/.test(src[j])) j += 1;

      const quote = src[j];
      if (quote === '"' || quote === "'") {
        const end = src.indexOf(quote, j + 1);
        if (end === -1) return null; // guillemet non refermé
        value = src.slice(j + 1, end);
        i = end + 1;
      } else {
        const valueStart = j;
        while (j < src.length && !/[\s>]/.test(src[j])) j += 1;
        value = src.slice(valueStart, j);
        i = j;
      }
    }

    attrs.push([attrName, value]);
  }

  return { name, closing, selfClosing, attrs, end: i };
}

/** Saute un sous-arbre entier (`<script>…</script>`). */
function skipSubtree(src: string, name: string, from: number): number {
  const close = new RegExp(`</\\s*${name}\\b[^>]*>`, "i");
  const rest = src.slice(from);
  const match = close.exec(rest);
  return match ? from + match.index + match[0].length : src.length;
}

/** Reconstruit les attributs d'une balise à partir de la liste blanche. */
function buildAttributes(name: string, attrs: [string, string][]): string | null {
  const own = ALLOWED_TAGS[name];
  const parts: string[] = [];
  let seenSrc = false;

  for (const [attrName, rawValue] of attrs) {
    if (!/^[a-z][a-z0-9-]*$/.test(attrName)) continue;
    if (!own.includes(attrName) && !GLOBAL_ATTRS.has(attrName)) continue;
    if (rawValue.length > MAX_ATTR_LENGTH) continue;

    if (attrName === "href" || attrName === "src" || attrName === "cite") {
      const url = safeUrl(rawValue);
      if (!url) {
        // Un lien ou une image sans cible valide perd son attribut ; un iframe
        // sans source valide sera écarté entièrement (cf. plus bas).
        continue;
      }
      if (name === "iframe" && attrName === "src" && !isAllowedFrame(url)) continue;
      if (attrName === "src") seenSrc = true;
      parts.push(`${attrName}="${escapeAttr(url)}"`);
      continue;
    }

    if (attrName === "class") {
      const value = sanitizeClass(rawValue);
      if (value) parts.push(`class="${escapeAttr(value)}"`);
      continue;
    }

    if (attrName === "style") {
      const value = sanitizeStyle(rawValue);
      if (value) parts.push(`style="${escapeAttr(value)}"`);
      continue;
    }

    if (attrName === "target") {
      // Une seule cible admise, et jamais sans `rel` (posé plus bas) : sans
      // `noopener`, la page ouverte peut réécrire l'onglet d'origine.
      if (decodeEntities(rawValue).trim().toLowerCase() !== "_blank") continue;
      parts.push('target="_blank"');
      continue;
    }

    if (attrName === "rel") continue; // recalculé

    if (attrName === "colspan" || attrName === "rowspan" || attrName === "width" ||
        attrName === "height" || attrName === "start" || attrName === "span") {
      const numeric = decodeEntities(rawValue).trim();
      if (!/^\d{1,5}$/.test(numeric)) continue;
      parts.push(`${attrName}="${numeric}"`);
      continue;
    }

    if (attrName === "allowfullscreen") {
      parts.push('allowfullscreen=""');
      continue;
    }

    parts.push(`${attrName}="${escapeAttr(decodeEntities(rawValue))}"`);
  }

  // Une image ou un cadre dont la source a été refusée n'a plus d'objet :
  // laisser la balise afficherait une icône de média cassé au lecteur.
  if ((name === "iframe" || name === "img") && !seenSrc) return null;

  if (name === "a" && parts.some((part) => part.startsWith('target="'))) {
    parts.push('rel="noopener noreferrer"');
  }
  if (name === "img" && !parts.some((part) => part.startsWith('loading='))) {
    parts.push('loading="lazy"');
  }

  return parts.length ? ` ${parts.join(" ")}` : "";
}

/**
 * Nettoie un fragment HTML.
 *
 * Les balises inconnues mais inoffensives (`<section>`, `<font>`) sont
 * DÉBALLÉES : la balise tombe, son contenu reste. C'est le comportement attendu
 * d'un collage depuis un traitement de texte, où l'essentiel est le texte.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";

  const out: string[] = [];
  const stack: string[] = [];
  let i = 0;

  while (i < input.length) {
    const lt = input.indexOf("<", i);
    if (lt === -1) {
      out.push(escapeText(input.slice(i)));
      break;
    }
    if (lt > i) out.push(escapeText(input.slice(i, lt)));

    if (input.startsWith("<!--", lt)) {
      const end = input.indexOf("-->", lt + 4);
      i = end === -1 ? input.length : end + 3;
      continue;
    }
    if (input.startsWith("<!", lt) || input.startsWith("<?", lt)) {
      const end = input.indexOf(">", lt);
      i = end === -1 ? input.length : end + 1;
      continue;
    }

    const tag = parseTag(input, lt);
    if (!tag) {
      out.push("&lt;");
      i = lt + 1;
      continue;
    }

    if (tag.closing) {
      i = tag.end;
      const depth = stack.lastIndexOf(tag.name);
      // Fermeture orpheline : elle ne correspond à rien d'ouvert, on la jette
      // plutôt que de refermer une balise que l'auteur n'a pas visée.
      if (depth === -1) continue;
      while (stack.length > depth) out.push(`</${stack.pop()}>`);
      continue;
    }

    if (DROPPED_SUBTREES.has(tag.name)) {
      i = tag.selfClosing || VOID_TAGS.has(tag.name)
        ? tag.end
        : skipSubtree(input, tag.name, tag.end);
      continue;
    }

    if (!(tag.name in ALLOWED_TAGS)) {
      // Déballage : la balise disparaît, son contenu poursuit son chemin.
      i = tag.end;
      continue;
    }

    const attributes = buildAttributes(tag.name, tag.attrs);
    i = tag.end;
    if (attributes === null) {
      if (!tag.selfClosing && !VOID_TAGS.has(tag.name)) {
        i = skipSubtree(input, tag.name, tag.end);
      }
      continue;
    }

    if (VOID_TAGS.has(tag.name)) {
      out.push(`<${tag.name}${attributes} />`);
      continue;
    }

    out.push(`<${tag.name}${attributes}>`);
    if (!tag.selfClosing) stack.push(tag.name);
    else out.push(`</${tag.name}>`);
  }

  while (stack.length) out.push(`</${stack.pop()}>`);

  return out.join("");
}

/* -------------------------------------------------------------------------- */
/* Dérivés du corps                                                            */
/* -------------------------------------------------------------------------- */

/** Texte brut d'un fragment HTML — sert au résumé automatique et au SEO. */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<\/(p|div|li|h[1-6]|tr|blockquote|figcaption)>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, ""),
  )
    .replace(/\s+/g, " ")
    .trim();
}

/** Coupe un texte à la limite de mot, sans jamais trancher au milieu. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:]+$/, "")}…`;
}

/** Durée de lecture en minutes, arrondie au moins à 1. Base : 200 mots/minute. */
export function readingMinutes(html: string): number {
  const words = htmlToText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Le corps est-il vide une fois les balises retirées ? */
export function isEmptyHtml(html: string): boolean {
  if (!html) return true;
  if (/<(img|iframe|table|hr)\b/i.test(html)) return false;
  return htmlToText(html).length === 0;
}
