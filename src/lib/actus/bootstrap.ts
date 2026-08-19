/**
 * Amorçage des actualités.
 *
 * Le site a d'abord vécu avec quatre communiqués écrits en dur dans
 * `src/content/actualites.ts`. Les basculer en base à la première ouverture du
 * module évite deux écueils : une page « Actualités » vide au lendemain de la
 * mise en service, et une reprise manuelle du contenu existant.
 *
 * Même contrat que `lib/auth/bootstrap.ts` : ne s'exécute QUE sur une table
 * vide, ne lève jamais, et ne recrée pas ce qu'un administrateur a supprimé.
 * Le fichier de contenu reste la source de cette reprise ; il n'est plus lu par
 * aucune page une fois l'amorçage passé.
 */
import { actualites } from "@/content/actualites";
import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/html/sanitize";
import { slugify, uniqueSlug } from "@/lib/actus/slug";
import { describeError } from "@/lib/errors";

/** Heure de publication attribuée aux communiqués repris (heure de Kinshasa). */
const HEURE_REPRISE = "T09:00:00+01:00";

/** Couleurs d'origine des pastilles, reprises du design system. */
const COULEURS: Record<string, string> = {
  institutionnel: "#0f62fe",
  gouvernance: "#8a3ffc",
  financement: "#009d9a",
  jalon: "#ff832b",
};

const escapeText = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Paragraphes du contenu historique → corps HTML de l'éditeur. */
const enHtml = (paragraphes: string[]): string =>
  sanitizeHtml(paragraphes.map((p) => `<p>${escapeText(p)}</p>`).join(""));

let amorce = false;

/** Ne lève jamais : l'écran du module doit s'afficher même base indisponible. */
export async function ensureActualites(): Promise<void> {
  if (amorce) return;

  try {
    if ((await db().article.count()) > 0) {
      amorce = true;
      return;
    }

    // Catégories d'abord : chaque article s'y rattache.
    const categories = new Map<string, string>();
    const vues = new Set<string>();
    let position = 0;

    for (const item of actualites) {
      const slug = slugify(item.cat.fr);
      if (vues.has(slug)) continue;
      vues.add(slug);

      const categorie = await db().articleCategory.upsert({
        where: { slug },
        update: {},
        create: { slug, nomFr: item.cat.fr, nomEn: item.cat.en, color: COULEURS[slug] ?? null, position },
      });
      categories.set(slug, categorie.id);
      position += 1;
    }

    const slugsFr = new Set<string>();
    const slugsEn = new Set<string>();

    // Du plus ancien au plus récent : l'ordre d'insertion n'a pas d'incidence
    // sur l'affichage (trié par date), mais rend la table lisible en console.
    const ordonnees = [...actualites].sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));

    for (const item of ordonnees) {
      const slugFr = uniqueSlug(slugify(item.title.fr), slugsFr);
      const slugEn = uniqueSlug(slugify(item.title.en), slugsEn);
      slugsFr.add(slugFr);
      slugsEn.add(slugEn);

      await db().article.create({
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(`${item.dateISO}${HEURE_REPRISE}`),
          lieu: item.lieu,
          videoYt: item.videoYt ?? null,
          comps: item.comps ?? [],
          coverKey: item.img,
          categoryId: categories.get(slugify(item.cat.fr)) ?? null,
          authorName: "UGPTN",
          translations: {
            create: [
              {
                locale: "fr",
                title: item.title.fr,
                slug: slugFr,
                excerpt: item.corps.fr[0] ?? null,
                contentHtml: enHtml(item.corps.fr),
                authorRole: "Cellule communication",
              },
              {
                locale: "en",
                title: item.title.en,
                slug: slugEn,
                excerpt: item.corps.en[0] ?? null,
                contentHtml: enHtml(item.corps.en),
                authorRole: "Communications Unit",
              },
            ],
          },
        },
      });
    }

    amorce = true;
    console.info(`[actus] ${ordonnees.length} communiqués repris depuis le contenu statique.`);
  } catch (error) {
    console.error(`[actus] Amorçage des actualités impossible : ${describeError(error)}`);
  }
}
