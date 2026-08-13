"use server";

/**
 * Écritures du module « Actualités ».
 *
 * ⚠️ INVARIANT : chaque action commence par `assertPermission("actualites")`.
 * Le proxy laisse passer les POST (rediriger un POST de server action casserait
 * le protocole Flight), la barrière d'autorisation est donc ici, et nulle part
 * ailleurs.
 *
 * Trois règles portent la cohérence du contenu :
 *   1. le corps d'article est ASSAINI avant écriture — l'éditeur envoie du HTML
 *      produit par le navigateur de l'auteur, jamais une donnée de confiance ;
 *   2. une langue sans titre n'a pas de ligne de traduction : c'est ce qui
 *      permet à la console de signaler une traduction manquante et au site
 *      public de ne pas la servir ;
 *   3. rien ne se publie sans une langue complète (titre + corps), sans quoi on
 *      mettrait en ligne une page vide.
 */
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertPermission } from "@/lib/auth/guard";
import { adminPath } from "@/lib/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { isEmptyHtml, sanitizeHtml } from "@/lib/html/sanitize";
import { fromDateTimeLocal } from "@/lib/format";
import { slugify, uniqueSlug } from "@/lib/actus/slug";
import { isArticleStatut, type ArticleStatut } from "@/lib/actus/statut";
import { idYouTube } from "@/lib/actus/video";
import { revaliderActualites } from "@/lib/actus/cache";
import { composantes } from "@/content/data";

/** État partagé par tous les formulaires du module. */
export type ActuFormState = { error: string | null; ok: string | null };

const ACTUS_PATH = adminPath("/actualites");

const CODES_COMPOSANTE = new Set(composantes.map((c) => c.code));

/* -------------------------------------------------------------------------- */
/* Lecture du formulaire                                                       */
/* -------------------------------------------------------------------------- */

const texte = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();
const optionnel = (value: string): string | null => (value.length ? value : null);
const coche = (formData: FormData, key: string): boolean => formData.get(key) === "on" || formData.get(key) === "1";

/** Contenu d'une langue, tel que soumis par le formulaire. */
type Traduction = {
  locale: Lang;
  title: string;
  slug: string;
  excerpt: string | null;
  contentHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
  coverAlt: string | null;
};

function lireTraductions(formData: FormData): Traduction[] {
  return LOCALES.map((locale) => {
    const title = texte(formData, `${locale}_title`);
    // Le corps est assaini ICI, à la frontière : tout ce qui descend plus bas
    // est réputé sûr, y compris ce qui sera relu par l'éditeur.
    const contentHtml = sanitizeHtml(String(formData.get(`${locale}_content`) ?? ""));
    return {
      locale,
      title,
      slug: slugify(texte(formData, `${locale}_slug`) || title),
      excerpt: optionnel(texte(formData, `${locale}_excerpt`)),
      contentHtml: isEmptyHtml(contentHtml) ? "" : contentHtml,
      seoTitle: optionnel(texte(formData, `${locale}_seoTitle`)),
      seoDescription: optionnel(texte(formData, `${locale}_seoDescription`)),
      coverAlt: optionnel(texte(formData, `${locale}_coverAlt`)),
    };
  });
}

/**
 * Rend chaque slug unique dans sa langue, en écartant les traductions de
 * l'article courant : réenregistrer une fiche sans y toucher ne doit pas
 * transformer `mon-article` en `mon-article-2`.
 */
async function resoudreSlugs(traductions: Traduction[], articleId: string | null): Promise<void> {
  for (const traduction of traductions) {
    if (!traduction.title) continue;

    const pris = await db().articleTranslation.findMany({
      where: {
        locale: traduction.locale,
        slug: { startsWith: traduction.slug },
        ...(articleId ? { articleId: { not: articleId } } : {}),
      },
      select: { slug: true },
    });

    traduction.slug = uniqueSlug(traduction.slug || "article", pris.map((row) => row.slug));
  }
}

/** Codes de composante cochés, réduits à ceux qui existent réellement. */
function lireComposantes(formData: FormData): string[] {
  return formData.getAll("comps").map(String).filter((code) => CODES_COMPOSANTE.has(code));
}

/**
 * Étiquettes : celles cochées, plus celles saisies à la volée dans le champ
 * libre. Créer une étiquette depuis la fiche d'article évite un aller-retour
 * vers l'écran de taxonomie au moment où l'on écrit.
 */
async function resoudreTags(formData: FormData): Promise<string[]> {
  const ids = new Set(formData.getAll("tags").map(String).filter(Boolean));

  const nouveaux = texte(formData, "nouveauxTags")
    .split(",")
    .map((nom) => nom.trim())
    .filter(Boolean)
    .slice(0, 12);

  for (const nom of nouveaux) {
    const slug = slugify(nom);
    if (!slug) continue;
    const tag = await db().tag.upsert({
      where: { slug },
      update: {},
      create: { slug, nomFr: nom, nomEn: nom },
    });
    ids.add(tag.id);
  }

  // Filtrage final : une case cochée reste une proposition du navigateur.
  const existants = await db().tag.findMany({ where: { id: { in: [...ids] } }, select: { id: true } });
  return existants.map((tag) => tag.id);
}

/**
 * Date de publication effective.
 * - `PUBLISHED` sans date : l'article paraît maintenant, c'est le geste attendu
 *   quand on clique « Publier » sans avoir touché au calendrier.
 * - `SCHEDULED` : la date est obligatoire et doit être à venir, sinon la
 *   programmation n'en est pas une.
 */
function resoudreDate(
  statut: ArticleStatut,
  saisie: string,
  actuelle: Date | null,
): { date: Date | null } | { error: string } {
  const choisie = fromDateTimeLocal(saisie);

  if (statut === "SCHEDULED") {
    if (!choisie) return { error: "Une publication programmée exige une date et une heure." };
    if (choisie.getTime() <= Date.now()) {
      return { error: "La date de programmation doit être postérieure à maintenant." };
    }
    return { date: choisie };
  }

  if (statut === "PUBLISHED") return { date: choisie ?? actuelle ?? new Date() };

  return { date: choisie ?? actuelle };
}

/* -------------------------------------------------------------------------- */
/* Création / modification                                                     */
/* -------------------------------------------------------------------------- */

export async function enregistrerArticleAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  const acteur = await assertPermission("actualites");

  const id = optionnel(texte(formData, "id"));
  const statutBrut = texte(formData, "status");
  if (!isArticleStatut(statutBrut)) return { error: "Statut inconnu.", ok: null };
  const statut = statutBrut;

  const traductions = lireTraductions(formData);
  const renseignees = traductions.filter((t) => t.title.length > 0);

  if (renseignees.length === 0) {
    return { error: "Un titre est requis dans au moins une langue.", ok: null };
  }

  // Publier une fiche sans corps mettrait en ligne une page vide : on refuse
  // au moment de la publication, jamais à l'enregistrement d'un brouillon.
  if (statut === "PUBLISHED" || statut === "SCHEDULED") {
    const complete = renseignees.some((t) => t.contentHtml.length > 0);
    if (!complete) {
      return { error: "Le corps de l'article est vide : impossible de publier. Enregistrez-le en brouillon.", ok: null };
    }
  }

  const existant = id
    ? await db().article.findUnique({ where: { id }, select: { id: true, publishedAt: true } })
    : null;
  if (id && !existant) return { error: "Article introuvable.", ok: null };

  const date = resoudreDate(statut, texte(formData, "publishedAt"), existant?.publishedAt ?? null);
  if ("error" in date) return { error: date.error, ok: null };

  await resoudreSlugs(traductions, existant?.id ?? null);
  const tagIds = await resoudreTags(formData);

  const categoryId = optionnel(texte(formData, "categoryId"));
  const authorId = optionnel(texte(formData, "authorId"));
  const coverMediaId = optionnel(texte(formData, "coverMediaId"));

  const commun = {
    status: statut,
    publishedAt: date.date,
    featured: coche(formData, "featured"),
    lieu: optionnel(texte(formData, "lieu")),
    videoYt: idYouTube(texte(formData, "videoYt")),
    comps: lireComposantes(formData),
    categoryId,
    coverMediaId,
    coverKey: coverMediaId ? null : optionnel(texte(formData, "coverKey")),
    authorId,
    authorName: optionnel(texte(formData, "authorName")),
    authorRole: optionnel(texte(formData, "authorRole")),
  };

  const articleId = existant
    ? existant.id
    : (await db().article.create({ data: { ...commun, createdById: acteur.id }, select: { id: true } })).id;

  if (existant) {
    await db().article.update({ where: { id: articleId }, data: commun });
  }

  // Traductions : une langue vidée de son titre perd sa ligne. C'est ce qui
  // fait qu'« absence de traduction » se lit en base, et pas seulement à l'œil.
  for (const traduction of traductions) {
    if (!traduction.title) {
      await db().articleTranslation.deleteMany({
        where: { articleId, locale: traduction.locale },
      });
      continue;
    }

    const { locale, ...donnees } = traduction;
    await db().articleTranslation.upsert({
      where: { articleId_locale: { articleId, locale } },
      update: donnees,
      create: { articleId, locale, ...donnees },
    });
  }

  await db().articleTag.deleteMany({ where: { articleId, tagId: { notIn: tagIds } } });
  if (tagIds.length) {
    await db().articleTag.createMany({
      data: tagIds.map((tagId) => ({ articleId, tagId })),
      skipDuplicates: true,
    });
  }

  revaliderActualites();

  // Création : on rejoint la fiche, qui porte l'aperçu et l'historique.
  // redirect() lève NEXT_REDIRECT — appelé en dernier, hors de tout try/catch.
  if (!existant) redirect(`${ACTUS_PATH}/${articleId}?cree=1`);

  return { error: null, ok: "Article enregistré." };
}

/* -------------------------------------------------------------------------- */
/* Actions rapides                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Bascule publication / retrait depuis la liste.
 *
 * Le retrait choisit `DRAFT` et non `ARCHIVED` : dépublier, c'est reprendre la
 * main sur un texte, pas le clore. L'archivage reste un geste explicite, posé
 * depuis la fiche.
 */
export async function basculerPublicationAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  await assertPermission("actualites");

  const id = texte(formData, "id");
  if (!id) return { error: "Article introuvable.", ok: null };

  const article = await db().article.findUnique({
    where: { id },
    select: { status: true, publishedAt: true, translations: { select: { title: true, contentHtml: true } } },
  });
  if (!article) return { error: "Article introuvable.", ok: null };

  const enLigne = article.status === "PUBLISHED" || article.status === "SCHEDULED";

  if (!enLigne) {
    const complet = article.translations.some((t) => t.title.trim() && !isEmptyHtml(t.contentHtml));
    if (!complet) return { error: "Aucune langue complète : renseignez un titre et un corps avant de publier.", ok: null };
  }

  await db().article.update({
    where: { id },
    data: enLigne
      ? { status: "DRAFT" }
      : { status: "PUBLISHED", publishedAt: article.publishedAt ?? new Date() },
  });

  revaliderActualites();
  return { error: null, ok: enLigne ? "Article dépublié." : "Article publié." };
}

/**
 * Duplication : la copie repart en brouillon, sans date de publication et avec
 * des slugs neufs. C'est le geste courant du communiqué de série (« Réunion du
 * COPIL — 3ᵉ session »), qui reprend la structure sans reprendre l'identité.
 */
export async function dupliquerArticleAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  const acteur = await assertPermission("actualites");

  const id = texte(formData, "id");
  if (!id) return { error: "Article introuvable.", ok: null };

  const source = await db().article.findUnique({
    where: { id },
    include: { translations: true, tags: { select: { tagId: true } } },
  });
  if (!source) return { error: "Article introuvable.", ok: null };

  const traductions: Traduction[] = source.translations
    .filter((t) => t.locale === "fr" || t.locale === "en")
    .map((t) => ({
      locale: t.locale as Lang,
      title: `${t.title} (copie)`,
      slug: slugify(`${t.slug}-copie`),
      excerpt: t.excerpt,
      contentHtml: t.contentHtml,
      seoTitle: t.seoTitle,
      seoDescription: t.seoDescription,
      coverAlt: t.coverAlt,
    }));

  await resoudreSlugs(traductions, null);

  const copie = await db().article.create({
    data: {
      status: "DRAFT",
      publishedAt: null,
      featured: false,
      lieu: source.lieu,
      videoYt: source.videoYt,
      comps: source.comps,
      categoryId: source.categoryId,
      coverMediaId: source.coverMediaId,
      coverKey: source.coverKey,
      authorId: source.authorId,
      authorName: source.authorName,
      authorRole: source.authorRole,
      createdById: acteur.id,
      translations: { create: traductions.map(({ locale, ...rest }) => ({ locale, ...rest })) },
      tags: { create: source.tags.map(({ tagId }) => ({ tagId })) },
    },
    select: { id: true },
  });

  revaliderActualites();
  redirect(`${ACTUS_PATH}/${copie.id}?copie=1`);
}

export async function supprimerArticleAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  await assertPermission("actualites");

  const id = texte(formData, "id");
  if (!id) return { error: "Article introuvable.", ok: null };

  const existe = await db().article.findUnique({ where: { id }, select: { id: true } });
  if (!existe) return { error: "Article introuvable.", ok: null };

  // Traductions et rattachements d'étiquettes tombent en cascade (cf. schéma).
  await db().article.delete({ where: { id } });

  revaliderActualites();
  redirect(`${ACTUS_PATH}?supprime=1`);
}
