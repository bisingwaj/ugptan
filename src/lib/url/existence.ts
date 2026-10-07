/**
 * La fiche demandée existe-t-elle ? Réponse rendue au PROXY, avant tout rendu.
 *
 * Le pourquoi — une fiche absente répondait 200 parce que les écrans de
 * chargement font partir les en-têtes avant `notFound()` — est détaillé dans
 * src/app/api/site/adresses/route.ts, qui fournit la liste.
 *
 * ⚠️ Module lu par `src/proxy.ts`, donc exécuté sur le moteur périphérique :
 * aucun import de Prisma ni de `next/headers`, comme lib/reglages/edge.ts.
 *
 * ─── Mémoire et fraîcheur ───────────────────────────────────────────────────
 *
 * La liste est gardée UNE MINUTE par instance : une page de détail vue ne paie
 * donc pas d'aller-retour interne. Le risque propre à ce mémo est l'inverse
 * d'une fermeture tardive : une fiche publiée à l'instant serait refusée tant
 * que la liste ne la connaît pas. D'où le rafraîchissement anticipé : un slug
 * INCONNU relance la lecture, au plus une fois toutes les dix secondes — assez
 * pour qu'un article tout juste publié s'ouvre dès sa première visite, et pas
 * assez pour qu'un balayage d'adresses inventées se traduise par autant de
 * lectures en base.
 *
 * ─── En cas de doute, la fiche est réputée exister ──────────────────────────
 *
 * Route muette, clef absente, réponse illisible : `null`, que le proxy lit
 * comme « laisser passer ». La page tranche alors elle-même, au pire avec le
 * 200 + `noindex` d'avant. Un faux 404 sur une page réelle serait bien pire
 * qu'un vrai 404 manqué.
 */
import { NAV } from "@/lib/routes";

type Adresses = Record<string, Set<string>>;

const PEREMPTION_MS = 60_000;
const RELECTURE_MIN_MS = 10_000;

/** Sections dont les fiches sont vérifiées, par leur chemin public. */
const SECTIONS: Record<string, string> = {
  [NAV.actualites]: "news",
  [NAV.evenements]: "events",
  [NAV.galerie]: "gallery",
  [NAV.transparence]: "transparency",
};

let memo: { valeur: Adresses; lu: number } | null = null;

/** Lecture en vol, partagée : une salve de requêtes simultanées n'en lance qu'une. */
let enCours: Promise<Adresses | null> | null = null;

function lire(origine: string): Promise<Adresses | null> {
  enCours ??= lireReseau(origine).finally(() => {
    enCours = null;
  });
  return enCours;
}

async function lireReseau(origine: string): Promise<Adresses | null> {
  const clef = process.env.BETTER_AUTH_SECRET;
  if (!clef) return null;
  try {
    const reponse = await fetch(new URL("/api/site/adresses", origine), {
      headers: { "x-ugptn-etat": clef },
      cache: "no-store",
    });
    if (!reponse.ok) return null;
    const brut = (await reponse.json()) as Record<string, unknown>;
    const valeur: Adresses = {};
    for (const section of Object.values(SECTIONS)) {
      const liste = brut[section];
      // Forme inattendue : on ne sait rien, donc on ne refuse rien.
      if (!Array.isArray(liste)) return null;
      valeur[section] = new Set(liste.filter((s): s is string => typeof s === "string"));
    }
    memo = { valeur, lu: Date.now() };
    return valeur;
  } catch {
    return null;
  }
}

/**
 * `false` seulement quand la fiche n'existe CERTAINEMENT pas ; `true` quand
 * elle existe ; `null` quand le chemin n'est pas une fiche vérifiée, ou que la
 * liste est indisponible.
 *
 * @param chemin chemin public sans la langue (« /news/mon-article »)
 */
export async function ficheExiste(origine: string, chemin: string): Promise<boolean | null> {
  const correspondance = /^(\/[a-z-]+)\/([^/]+)\/?$/.exec(chemin);
  if (!correspondance) return null;
  const section = SECTIONS[correspondance[1]];
  if (!section) return null;

  let slug: string;
  try {
    slug = decodeURIComponent(correspondance[2]);
  } catch {
    return null;
  }
  /* Segments techniques servis par des routes statiques voisines de `[slug]`
     (`/news/preview`, variantes `/_filtre`) : ce ne sont pas des fiches. Le
     tiret bas de tête n'est jamais produit par `slugify`. */
  if (slug === "preview" || slug.startsWith("_")) return null;

  const maintenant = Date.now();
  let adresses = memo && maintenant - memo.lu < PEREMPTION_MS ? memo.valeur : await lire(origine);
  if (!adresses) return null;

  if (adresses[section].has(slug)) return true;

  // Inconnu d'une liste qui n'est pas toute fraîche : on relit, une fois.
  if (memo && maintenant - memo.lu >= RELECTURE_MIN_MS) {
    adresses = await lire(origine);
    if (!adresses) return null;
    return adresses[section].has(slug);
  }
  return false;
}
