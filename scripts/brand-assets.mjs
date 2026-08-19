/**
 * Génération des actifs de marque UGPTN.
 *
 *   node scripts/brand-assets.mjs
 *
 * Source unique : `public/assets/ugptn.jpeg`, le logotype officiel tel qu'il a
 * été fourni — fond blanc opaque, 758 × 384. Sorties dans `public/brand/`.
 * Les sorties sont versionnées : ce script ne tourne qu'à la réception d'un
 * nouveau fichier de marque, il n'est pas branché sur le build.
 *
 * Il requiert `sharp`, absent des dépendances du site : le site n'a aucun besoin
 * de traitement d'image à l'exécution. Installer à la demande :
 *
 *   pnpm add -D sharp && node scripts/brand-assets.mjs && pnpm remove sharp
 *
 * ---------------------------------------------------------------------------
 * TROIS PROBLÈMES, TROIS RÉPONSES
 *
 * 1. LE FOND. Posé tel quel sur le bandeau, le fichier source apparaîtrait dans
 *    un rectangle blanc. Le détourage se fait par rampe et non par seuil : un
 *    seuil unique laisse le choix entre garder le voile de compression du JPEG
 *    (invisible sur blanc, bien net sur fond sombre) et ronger l'anticrénelage
 *    jusqu'à découper les lettres en escalier. Au-dessus de 228 le pixel est du
 *    fond, en dessous de 195 il appartient au tracé, entre les deux l'opacité
 *    varie continûment — ce qu'est exactement un bord anticrénelé. C'est le
 *    canal LE PLUS SOMBRE qui décide, jamais la moyenne : un aplat saturé (le
 *    bleu de la carte, le rouge du filet) garde ainsi son opacité pleine.
 *
 *    Les bords sont ensuite « démultipliés » : un pixel de bord observé à 60 %
 *    d'opacité est un mélange du tracé et du blanc du fond, et sa couleur pure
 *    se retrouve en retirant la part de blanc. Sans ce calcul, les contours
 *    déposés sur le bandeau sombre garderaient un liseré clair.
 *
 * 2. LA MENTION. « Unité de gestion du projet de transformation numérique »
 *    occupe quatre lignes hautes de quatorze pixels. Réduites à la hauteur d'un
 *    bandeau de 64px, elles ne forment plus une salissure grise : la variante
 *    « signature » les retire pour ne garder que le mot-symbole et la carte.
 *
 *    Le retrait passe par un étiquetage en composantes connexes, et non par un
 *    rectangle : la carte descend jusqu'au bas du visuel et chevauche la mention
 *    en abscisse (x 476 à 527) — un rectangle emporterait son lobe inférieur.
 *    L'étiquetage sépare proprement 43 composantes : quatre pour le mot-symbole
 *    (« gp » se touchent), une pour la carte entière, une pour la pile de trois
 *    filets, trente-sept pour les lettres de la mention. Sont retirées les
 *    composantes entièrement contenues dans la zone de la mention ; la carte y
 *    échappe puisqu'elle monte jusqu'à y = 0.
 *
 * 3. LES FONDS SOMBRES. La variante « claire » ne se contente pas d'inverser :
 *    elle blanchit les pixels neutres (le lettrage anthracite) et laisse
 *    intactes les zones colorées — le bleu de la carte et les filets, qui
 *    portent l'identité et se tiennent très bien sur le #161616 de Carbon.
 * ---------------------------------------------------------------------------
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const sharp = await import("sharp").then((m) => m.default).catch(() => null);
if (!sharp) {
  console.error("Ce script requiert sharp :\n  pnpm add -D sharp");
  process.exit(1);
}

const ROOT = process.cwd();
const SRC = path.join(ROOT, "public/assets/ugptn.jpeg");
const OUT = path.join(ROOT, "public/brand");
const ICONS = path.join(ROOT, "src/app");

/** Rampe de détourage — cf. problème 1 de l'en-tête. */
const FOND = 228;
const TRACE = 195;
/** En deçà de cette opacité, la couleur démultipliée n'est plus fiable. */
const DEMUL_MIN = 0.12;
/** Écart max entre canaux pour qu'un pixel compte comme neutre (lettrage). */
const NEUTRE = 30;
/**
 * Zone de la mention, en pixels de la source. Bornes prises avec de la marge
 * sur les composantes mesurées (lettres x 330→527, filets x 314→322,
 * y 281→383) et sous les jambages du « g » et du « p », qui descendent à
 * y = 288 mais appartiennent à une composante partant de y = 104.
 */
const MENTION = { x0: 303, y0: 252, x1: 600 };
/** Bleu de la carte : #1192E8, soit Cyan 50 de Carbon. */
const CARTE_BLEU = 25;

const { data: src, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const N = W * H;

/* --- Étiquetage en composantes connexes (8 voisins) ----------------------- */

const encre = new Uint8Array(N);
for (let i = 0, p = 0; i < N; i++, p += C) {
  encre[i] = Math.min(src[p], src[p + 1], src[p + 2]) < FOND ? 1 : 0;
}

const etiq = new Int32Array(N).fill(-1);
const comps = [];
const pile = new Int32Array(N);
for (let depart = 0; depart < N; depart++) {
  if (!encre[depart] || etiq[depart] !== -1) continue;
  const id = comps.length;
  let haut = 0;
  pile[haut++] = depart;
  etiq[depart] = id;
  let x0 = W, y0 = H, x1 = -1, y1 = -1, n = 0, sr = 0, sg = 0, sb = 0;
  while (haut) {
    const i = pile[--haut];
    const x = i % W;
    const y = (i - x) / W;
    n++;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
    const p = i * C;
    sr += src[p];
    sg += src[p + 1];
    sb += src[p + 2];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx;
        if (encre[j] && etiq[j] === -1) {
          etiq[j] = id;
          pile[haut++] = j;
        }
      }
    }
  }
  comps.push({ id, x0, y0, x1, y1, n, bleu: sb / n - sr / n > CARTE_BLEU });
}

const estMention = (c) => c.x0 >= MENTION.x0 && c.y0 >= MENTION.y0 && c.x1 <= MENTION.x1;
const mention = new Set(comps.filter(estMention).map((c) => c.id));
/* La carte est la plus vaste des composantes bleues — la pile de filets, elle
   aussi bleue en moyenne, ne fait que 744 pixels contre 16 290. */
const carte = comps.filter((c) => c.bleu).sort((a, b) => b.n - a.n)[0];
if (!carte) throw new Error("Glyphe cartographique introuvable dans la source.");

const motSymbole = comps.filter((c) => !mention.has(c.id) && c.id !== carte.id);
console.log(
  `Source ${W}×${H} · ${comps.length} composantes : ` +
    `${motSymbole.length} pour le mot-symbole, 1 pour la carte, ${mention.size} pour la mention.`,
);

/* --- Détourage ------------------------------------------------------------ */

/**
 * Construit un tampon RGBA détouré.
 * @param {Set<number>} garder ids des composantes conservées
 * @param {boolean} clair blanchit le lettrage neutre (fonds sombres)
 */
function detourer(garder, clair) {
  const out = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    const q = i * 4;
    if (!encre[i] || !garder.has(etiq[i])) continue; // alpha 0, RGB 0
    const p = i * C;
    const r = src[p], g = src[p + 1], b = src[p + 2];
    const min = Math.min(r, g, b);
    const a = min <= TRACE ? 1 : (FOND - min) / (FOND - TRACE);
    let cr = r, cg = g, cb = b;
    if (a >= DEMUL_MIN && a < 1) {
      // Le pixel observé est le tracé mêlé au blanc du fond : on retire le blanc.
      const blanc = 255 * (1 - a);
      cr = Math.max(0, Math.min(255, (r - blanc) / a));
      cg = Math.max(0, Math.min(255, (g - blanc) / a));
      cb = Math.max(0, Math.min(255, (b - blanc) / a));
    }
    if (clair && Math.max(cr, cg, cb) - Math.min(cr, cg, cb) < NEUTRE) {
      cr = cg = cb = 255;
    }
    out[q] = Math.round(cr);
    out[q + 1] = Math.round(cg);
    out[q + 2] = Math.round(cb);
    out[q + 3] = Math.round(a * 255);
  }
  return out;
}

/** Rogne le tampon sur l'encre réellement opaque (le seuil écarte le résidu). */
function cadre(rgba) {
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (rgba[(y * W + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

/** Détoure, rogne, met à l'échelle, écrit. Renvoie les dimensions produites. */
async function produire(fichier, { garder, clair = false, hauteur }) {
  const rgba = detourer(garder, clair);
  const zone = cadre(rgba);
  const img = sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .extract(zone)
    .resize({ height: hauteur, kernel: "lanczos3", fit: "contain" })
    .png({ compressionLevel: 9, effort: 10 });
  const { data, info: out } = await img.toBuffer({ resolveWithObject: true });
  await writeFile(fichier, data);
  console.log(
    `  ${path.relative(ROOT, fichier).padEnd(34)} ${out.width}×${out.height}` +
      `  ${(data.length / 1024).toFixed(1)} Ko`,
  );
  return { data, width: out.width, height: out.height };
}

/* --- Sorties -------------------------------------------------------------- */

await mkdir(OUT, { recursive: true });

const TOUT = new Set(comps.map((c) => c.id));
const SANS_MENTION = new Set(comps.filter((c) => !mention.has(c.id)).map((c) => c.id));
const CARTE_SEULE = new Set([carte.id]);

/* Logotype complet : hauteur 320 pour l'image de partage social, qui l'affiche
   à 520px de large — la mention y est enfin lisible. */
await produire(path.join(OUT, "ugptn-logo.png"), { garder: TOUT, hauteur: 320 });
await produire(path.join(OUT, "ugptn-logo-light.png"), { garder: TOUT, clair: true, hauteur: 320 });

/* Signature : le format du site (bandeau, pied de page), affiché de 32 à 44px
   de haut. 160px couvre les écrans à densité 3×. */
await produire(path.join(OUT, "ugptn-signature.png"), { garder: SANS_MENTION, hauteur: 160 });
await produire(path.join(OUT, "ugptn-signature-light.png"), { garder: SANS_MENTION, clair: true, hauteur: 160 });

/* Symbole seul. */
const marque = await produire(path.join(OUT, "ugptn-mark.png"), { garder: CARTE_SEULE, hauteur: 256 });

/* Icône iOS : toujours affichée en grand, elle peut porter la carte que le
   favicon 16px ne rendrait qu'en bouillie. Fond plein obligatoire — iOS
   composite les icônes transparentes sur du noir. */
const COTE = 180;
const GLYPHE = 124;
const glyphe = await sharp(marque.data).resize({ height: GLYPHE, kernel: "lanczos3" }).toBuffer();
const icone = await sharp({
  create: { width: COTE, height: COTE, channels: 4, background: "#161616" },
})
  .composite([{ input: glyphe, gravity: "center" }])
  .png({ compressionLevel: 9, effort: 10 })
  .toBuffer();
await writeFile(path.join(ICONS, "apple-icon.png"), icone);
console.log(`  ${path.relative(ROOT, path.join(ICONS, "apple-icon.png")).padEnd(34)} ${COTE}×${COTE}  ${(icone.length / 1024).toFixed(1)} Ko`);
