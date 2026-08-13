/**
 * Chargement des données de la fiche d'article.
 *
 * Partagé par l'écran de création et par celui de modification : les deux
 * affichent les mêmes champs, l'un sur une fiche vierge, l'autre sur une fiche
 * relue en base. Regrouper les requêtes ici évite que les deux écrans divergent
 * au premier champ ajouté.
 */
import { db } from "@/lib/db";
import { formatDateTime, toDateTimeLocal } from "@/lib/format";
import { isEmptyHtml } from "@/lib/html/sanitize";
import { mediaSrc, type MediaRef } from "@/lib/medias";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { media as registre } from "@/content/media";
import { composantes } from "@/content/data";
import type { ImgKey } from "@/content/types";
import type { ArticleSaisie, ReferentielsSaisie, TraductionSaisie } from "@/lib/actus/saisie";
import type { ArticleStatut } from "@/lib/actus/statut";

/** ⚠️ `data` exclu : cf. le commentaire de `lib/actus/query.ts`. */
const mediaSelect = {
  id: true, filename: true, mimeType: true, size: true,
  width: true, height: true, url: true, publicId: true, altFr: true, altEn: true, legende: true,
} as const;

export type Referentiels = { referentiels: ReferentielsSaisie; assets: MediaRef[] };

/** Listes déroulantes et bibliothèque, communes aux deux écrans de la fiche. */
export async function chargerReferentiels(): Promise<Referentiels> {
  const [categories, tags, comptes, assets] = await Promise.all([
    db().articleCategory.findMany({
      select: { id: true, nomFr: true },
      orderBy: [{ position: "asc" }, { nomFr: "asc" }],
    }),
    db().tag.findMany({ select: { id: true, nomFr: true }, orderBy: { nomFr: "asc" } }),
    // Seuls les comptes en activité : signer un article du nom d'un compte
    // désactivé laisserait croire à une publication qu'il n'a pas faite.
    // `banned` et non un indicateur maison — c'est Better Auth qui porte la
    // désactivation (cf. lib/auth/server.ts).
    db().user.findMany({
      where: { banned: false },
      select: { id: true, name: true, email: true },
      orderBy: [{ name: "asc" }, { email: "asc" }],
    }),
    db().mediaAsset.findMany({ select: mediaSelect, orderBy: { createdAt: "desc" }, take: 300 }),
  ]);

  return {
    referentiels: {
      categories: categories.map((item) => ({ id: item.id, nom: item.nomFr })),
      tags: tags.map((item) => ({ id: item.id, nom: item.nomFr })),
      // `name` est requis par Better Auth mais peut valoir l'adresse elle-même :
      // `||` et non `??`, pour qu'une chaîne vide retombe aussi sur l'adresse.
      auteurs: comptes.map((compte) => ({ id: compte.id, nom: compte.name || compte.email })),
      composantes: composantes.map((composante) => ({ code: composante.code, titre: composante.titre.fr })),
    },
    assets,
  };
}

const traductionVide = (): TraductionSaisie => ({
  title: "", slug: "", excerpt: "", content: "",
  seoTitle: "", seoDescription: "", coverAlt: "",
  existe: false, complete: false, majLe: null,
});

const traductionsVides = (): Record<Lang, TraductionSaisie> =>
  Object.fromEntries(LOCALES.map((lang) => [lang, traductionVide()])) as Record<Lang, TraductionSaisie>;

/** Fiche vierge — écran « Nouvel article ». */
export const articleVierge = (): ArticleSaisie => ({
  id: null,
  status: "DRAFT",
  publishedAt: "",
  featured: false,
  lieu: "",
  videoYt: "",
  comps: [],
  categoryId: "",
  coverMediaId: "",
  coverKey: "",
  coverSrc: "",
  authorId: "",
  authorName: "",
  authorRole: "",
  tagIds: [],
  traductions: traductionsVides(),
});

/**
 * Fiche relue en base, projetée dans la forme attendue par les formulaires.
 *
 * Le type de retour resserre `id` sur `string` : `ArticleSaisie.id` est nullable
 * pour couvrir la fiche vierge, mais une fiche relue en a forcément un — sans
 * quoi l'écran d'édition devrait tester partout un cas impossible.
 */
export async function chargerArticle(id: string): Promise<(ArticleSaisie & { id: string }) | null> {
  const article = await db().article.findUnique({
    where: { id },
    select: {
      id: true, status: true, publishedAt: true, featured: true, lieu: true,
      videoYt: true, comps: true, categoryId: true, coverKey: true, coverMediaId: true,
      authorId: true, authorName: true, authorRole: true,
      coverMedia: { select: mediaSelect },
      translations: {
        select: {
          locale: true, title: true, slug: true, excerpt: true, contentHtml: true,
          seoTitle: true, seoDescription: true, coverAlt: true, updatedAt: true,
        },
      },
      tags: { select: { tagId: true } },
    },
  });

  if (!article) return null;

  // Toutes les langues du site sont présentes, y compris celles qui n'ont
  // encore aucune ligne : c'est ce qui permet à l'onglet d'annoncer « à
  // traduire » plutôt que de disparaître.
  const traductions = traductionsVides();
  for (const tr of article.translations) {
    if (!LOCALES.includes(tr.locale as Lang)) continue;
    traductions[tr.locale as Lang] = {
      title: tr.title,
      slug: tr.slug,
      excerpt: tr.excerpt ?? "",
      content: tr.contentHtml,
      seoTitle: tr.seoTitle ?? "",
      seoDescription: tr.seoDescription ?? "",
      coverAlt: tr.coverAlt ?? "",
      existe: true,
      complete: tr.title.trim().length > 0 && !isEmptyHtml(tr.contentHtml),
      majLe: formatDateTime(tr.updatedAt),
    };
  }

  const cle = article.coverKey as ImgKey | null;
  const coverSrc = article.coverMedia
    ? mediaSrc(article.coverMedia)
    : cle && cle in registre.img
      ? registre.img[cle]
      : "";

  return {
    id: article.id,
    status: article.status as ArticleStatut,
    publishedAt: toDateTimeLocal(article.publishedAt),
    featured: article.featured,
    lieu: article.lieu ?? "",
    videoYt: article.videoYt ?? "",
    comps: article.comps,
    categoryId: article.categoryId ?? "",
    coverMediaId: article.coverMediaId ?? "",
    coverKey: article.coverKey ?? "",
    coverSrc,
    authorId: article.authorId ?? "",
    authorName: article.authorName ?? "",
    authorRole: article.authorRole ?? "",
    tagIds: article.tags.map(({ tagId }) => tagId),
    traductions,
  };
}
