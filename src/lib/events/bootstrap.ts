/**
 * Amorçage des événements.
 *
 * Le site a d'abord vécu avec cinq rencontres écrites en dur dans
 * `src/content/carbon.ts`. Les basculer en base à la première ouverture du
 * module évite deux écueils : une page « Événements » vide au lendemain de la
 * mise en service, et une reprise manuelle du contenu existant.
 *
 * Même contrat que `lib/actus/bootstrap.ts` : ne s'exécute QUE sur une table
 * vide, ne lève jamais, et ne recrée pas ce qu'un administrateur a supprimé.
 *
 * ⚠️ Le contenu d'origine ne portait qu'une date RÉDIGÉE (« 12 sept. 2026 »),
 * pas une donnée. Reprendre ces libellés tels quels donnerait un calendrier
 * qu'aucun tri ne peut ordonner : la table `CALENDRIER` ci-dessous fixe donc,
 * une fois pour toutes, l'instant que chaque libellé désignait.
 */
import { events as evenementsStatiques } from "@/content/carbon";
import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/html/sanitize";
import { slugify, uniqueSlug } from "@/lib/actus/slug";
import { describeError } from "@/lib/errors";
import type { EvenementMode } from "@/lib/events/statut";

/**
 * Instant réel de chaque rencontre reprise, à l'heure de Kinshasa (UTC+1).
 *
 * `allDay` marque celles dont l'horaire n'a jamais été publié : le lancement
 * officiel n'était daté que du mois, et une heure inventée serait affichée
 * comme si elle faisait foi.
 */
const CALENDRIER: Record<string, {
  debut: string;
  fin?: string;
  allDay?: boolean;
  mode: EvenementMode;
}> = {
  forum: { debut: "2026-09-12T08:30:00+01:00", fin: "2026-09-12T17:00:00+01:00", mode: "HYBRIDE" },
  femmes: { debut: "2026-10-03T09:00:00+01:00", fin: "2026-10-03T16:00:00+01:00", mode: "PRESENTIEL" },
  webinaire: { debut: "2026-08-25T14:00:00+01:00", fin: "2026-08-25T15:30:00+01:00", mode: "EN_LIGNE" },
  consultation: { debut: "2026-10-20T09:00:00+01:00", fin: "2026-10-22T17:00:00+01:00", mode: "PRESENTIEL" },
  lancement: { debut: "2025-10-01T09:00:00+01:00", allDay: true, mode: "PRESENTIEL" },
};

const escapeText = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const enHtml = (texte: string): string => sanitizeHtml(`<p>${escapeText(texte)}</p>`);

let amorce = false;

/** Ne lève jamais : l'écran du module doit s'afficher même base indisponible. */
export async function ensureEvenements(): Promise<void> {
  if (amorce) return;

  try {
    if ((await db().evenement.count()) > 0) {
      amorce = true;
      return;
    }

    // Catégories d'abord : chaque événement s'y rattache. Le `type` du contenu
    // statique (« Forum », « Atelier »…) EST la catégorie — c'est ce que la
    // pastille de la carte affichait déjà.
    const categories = new Map<string, string>();
    let position = 0;

    for (const item of evenementsStatiques) {
      const slug = slugify(item.type.fr);
      if (!slug || categories.has(slug)) continue;

      const categorie = await db().evenementCategory.upsert({
        where: { slug },
        update: {},
        create: { slug, nomFr: item.type.fr, nomEn: item.type.en, color: item.color, position },
      });
      categories.set(slug, categorie.id);
      position += 1;
    }

    const slugsFr = new Set<string>();
    const slugsEn = new Set<string>();

    // Du plus ancien au plus récent : sans incidence sur l'affichage (trié par
    // date), mais rend la table lisible en console.
    const ordonnes = [...evenementsStatiques].sort((a, b) => {
      const da = CALENDRIER[a.id]?.debut ?? "";
      const dbb = CALENDRIER[b.id]?.debut ?? "";
      return da < dbb ? -1 : 1;
    });

    for (const item of ordonnes) {
      // Une rencontre sans instant connu n'entre pas : elle ne pourrait être
      // ni triée, ni classée « à venir » ou « terminée ».
      const quand = CALENDRIER[item.id];
      if (!quand) continue;

      const slugFr = uniqueSlug(slugify(item.titre.fr), slugsFr);
      const slugEn = uniqueSlug(slugify(item.titre.en), slugsEn);
      slugsFr.add(slugFr);
      slugsEn.add(slugEn);

      await db().evenement.create({
        data: {
          status: "PUBLISHED",
          startAt: new Date(quand.debut),
          endAt: quand.fin ? new Date(quand.fin) : null,
          allDay: quand.allDay ?? false,
          mode: quand.mode,
          color: item.color,
          coverKey: item.img,
          categoryId: categories.get(slugify(item.type.fr)) ?? null,
          organiserName: "UGPTN",
          translations: {
            create: [
              {
                locale: "fr",
                title: item.titre.fr,
                slug: slugFr,
                excerpt: item.desc.fr,
                contentHtml: enHtml(item.desc.fr),
                lieu: item.lieu.fr,
                places: item.places.fr || null,
              },
              {
                locale: "en",
                title: item.titre.en,
                slug: slugEn,
                excerpt: item.desc.en,
                contentHtml: enHtml(item.desc.en),
                lieu: item.lieu.en,
                places: item.places.en || null,
              },
            ],
          },
        },
      });
    }

    amorce = true;
    console.info(`[events] ${ordonnes.length} événements repris depuis le contenu statique.`);
  } catch (error) {
    console.error(`[events] Amorçage des événements impossible : ${describeError(error)}`);
  }
}
