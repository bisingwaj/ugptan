"use server";

/**
 * Écritures du module « Actualités ».
 *
 * ⚠️ INVARIANT : chaque action commence par `assertPermission("actualites")`.
 * Le proxy laisse passer les POST (rediriger un POST de server action casserait
 * le protocole Flight), la barrière d'autorisation est donc ici, et nulle part
 * ailleurs.
 *
 * ─── Un formulaire par langue ────────────────────────────────────────────────
 *
 * La fiche et les traductions s'enregistrent SÉPARÉMENT, par des actions
 * distinctes :
 *
 *   · `enregistrerFicheAction`      → statut, date, catégorie, visuel, auteur…
 *                                     ce qui appartient à l'article, pas à une langue ;
 *   · `enregistrerTraductionAction` → UNE langue : titre, slug, résumé, corps, SEO.
 *
 * Ce découpage n'est pas cosmétique. Un article se rédige dans une langue puis
 * se traduit, souvent par quelqu'un d'autre et plus tard. Avec un envoi unique
 * portant les deux langues, l'écran du traducteur réécrit AUSSI la langue
 * d'origine telle qu'il l'a chargée : toute correction faite entre-temps par le
 * rédacteur est écrasée sans que personne ne le voie. Ici, chaque langue est
 * écrite par son propre envoi, et n'emporte qu'elle-même.
 *
 * Corollaire sur les noms de champs : ils ne sont PAS préfixés par la langue
 * (`title`, et non `fr_title`). Le formulaire porte sa langue dans un champ
 * `locale`, ce qui rend impossible la confusion de préfixe.
 *
 * Deux règles de cohérence, vérifiées côté serveur :
 *   1. le corps d'article est ASSAINI avant écriture — l'éditeur envoie du HTML
 *      produit par le navigateur de l'auteur, jamais une donnée de confiance ;
 *   2. rien ne se publie sans une langue complète (titre + corps) EN BASE, ce
 *      qui se vérifie sur l'article relu et non sur le formulaire soumis.
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
import { codesComposantes } from "@/lib/projet/query";
import { apresEnregistrementLangue } from "@/lib/ia/planifier";
import { oublierTraductions } from "@/lib/ia/suivi";
import { cloudinaryActif, deposerFichier, supprimerFichier } from "@/lib/cloudinary";
import { contenuCorrespond, poidsLisible, tailleMaxPour } from "@/lib/medias";
import { MIME_PDF } from "@/lib/actus/fichier";

/** État partagé par tous les formulaires du module. */
export type ActuFormState = { error: string | null; ok: string | null };

const ACTUS_PATH = adminPath("/news");


/** Nom des langues dans les messages rendus à l'utilisateur. */
const LANGUE_LABEL: Record<Lang, string> = { fr: "française", en: "anglaise" };

/* -------------------------------------------------------------------------- */
/* Lecture du formulaire                                                       */
/* -------------------------------------------------------------------------- */

const texte = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();
const optionnel = (value: string): string | null => (value.length ? value : null);
const coche = (formData: FormData, key: string): boolean =>
  formData.get(key) === "on" || formData.get(key) === "1";

/** Langue portée par le formulaire, ou `null` si elle n'est pas servie par le site. */
function lireLocale(formData: FormData): Lang | null {
  const brut = texte(formData, "locale");
  return (LOCALES as string[]).includes(brut) ? (brut as Lang) : null;
}

/** Contenu d'UNE langue, tel que soumis par son formulaire. */
type Traduction = {
  title: string;
  slug: string;
  excerpt: string | null;
  contentHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
  coverAlt: string | null;
  /* La FONCTION de l'auteur, pas son nom : « Cellule communication » se traduit,
     « UGPTN » non. Le nom reste donc sur la fiche. */
  authorRole: string | null;
};

function lireTraduction(formData: FormData): Traduction {
  const title = texte(formData, "title");
  // Le corps est assaini ICI, à la frontière : tout ce qui descend plus bas est
  // réputé sûr, y compris ce que l'éditeur relira ensuite.
  const contentHtml = sanitizeHtml(String(formData.get("content") ?? ""));

  return {
    title,
    slug: slugify(texte(formData, "slug") || title),
    excerpt: optionnel(texte(formData, "excerpt")),
    contentHtml: isEmptyHtml(contentHtml) ? "" : contentHtml,
    seoTitle: optionnel(texte(formData, "seoTitle")),
    seoDescription: optionnel(texte(formData, "seoDescription")),
    coverAlt: optionnel(texte(formData, "coverAlt")),
    authorRole: optionnel(texte(formData, "authorRole")),
  };
}

/**
 * Rend un slug unique DANS SA LANGUE (l'unicité est portée par
 * `@@unique([locale, slug])`), en écartant l'article courant : réenregistrer
 * une traduction sans toucher au titre ne doit pas transformer `mon-article`
 * en `mon-article-2`.
 */
async function slugUnique(locale: Lang, base: string, articleId: string | null): Promise<string> {
  const pris = await db().articleTranslation.findMany({
    where: {
      locale,
      slug: { startsWith: base || "article" },
      ...(articleId ? { articleId: { not: articleId } } : {}),
    },
    select: { slug: true },
  });

  return uniqueSlug(base || "article", pris.map((row) => row.slug));
}

/** Codes de composante cochés, réduits à ceux qui existent réellement. */
async function lireComposantes(formData: FormData): Promise<string[]> {
  const admis = await codesComposantes();
  return formData.getAll("comps").map(String).filter((code) => admis.has(code));
}

/**
 * Étiquettes : celles cochées, plus celles saisies à la volée dans le champ
 * libre. Créer une étiquette depuis la fiche évite un aller-retour vers l'écran
 * de taxonomie au moment où l'on classe.
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
    const tag = await db().tag.upsert({ where: { slug }, update: {}, create: { slug, nomFr: nom, nomEn: nom } });
    ids.add(tag.id);
  }

  // Filtrage final : une case cochée reste une proposition du navigateur.
  const existants = await db().tag.findMany({ where: { id: { in: [...ids] } }, select: { id: true } });
  return existants.map((tag) => tag.id);
}

/**
 * Date de publication effective.
 * - `PUBLISHED` sans date : l'article paraît maintenant, c'est le geste attendu
 *   quand on choisit « Publié » sans avoir touché au calendrier.
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

/** Champs de la fiche, communs à toutes les langues. */
async function lireFiche(formData: FormData) {
  const coverMediaId = optionnel(texte(formData, "coverMediaId"));

  return {
    featured: coche(formData, "featured"),
    lieu: optionnel(texte(formData, "lieu")),
    videoYt: idYouTube(texte(formData, "videoYt")),
    comps: await lireComposantes(formData),
    categoryId: optionnel(texte(formData, "categoryId")),
    coverMediaId,
    // Une couverture issue de la bibliothèque prime sur une clé du registre :
    // conserver les deux laisserait deux sources de vérité pour un seul visuel.
    coverKey: coverMediaId ? null : optionnel(texte(formData, "coverKey")),
    authorId: optionnel(texte(formData, "authorId")),
    authorName: optionnel(texte(formData, "authorName")),
    tagIds: await resoudreTags(formData),
    galerieIds: await lireGalerie(formData),
  };
}

/**
 * Images de la galerie, dans l'ordre du formulaire.
 *
 * Réduites aux médias qui existent ET sont des images : l'identifiant vient du
 * navigateur, et un document de la bibliothèque n'a rien à faire dans une
 * galerie. Les doublons sont écartés (clé primaire article + média).
 */
async function lireGalerie(formData: FormData): Promise<string[]> {
  const demandes = [...new Set(formData.getAll("galerie").map(String).filter(Boolean))].slice(0, 60);
  if (!demandes.length) return [];
  const admis = await db().mediaAsset.findMany({
    where: { id: { in: demandes }, mimeType: { startsWith: "image/" } },
    select: { id: true },
  });
  const ids = new Set(admis.map(({ id }) => id));
  return demandes.filter((id) => ids.has(id));
}

/** Lignes de galerie à créer, rang compris. */
const lignesGalerie = (ids: string[]) => ids.map((mediaId, position) => ({ mediaId, position }));

/** Une langue est-elle publiable ? Un titre ne suffit pas, il faut un corps. */
const estComplete = (t: { title: string; contentHtml: string }): boolean =>
  t.title.trim().length > 0 && !isEmptyHtml(t.contentHtml);

/* -------------------------------------------------------------------------- */
/* Création                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Crée l'article et sa PREMIÈRE langue.
 *
 * Une seule langue à la création, volontairement : un article naît dans la
 * langue où il est rédigé. Les autres versions s'ajoutent ensuite, chacune par
 * son propre formulaire, quand le traducteur s'en saisit.
 */
export async function creerArticleAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  const acteur = await assertPermission("actualites");

  const locale = lireLocale(formData);
  if (!locale) return { error: "Langue de rédaction inconnue.", ok: null };

  const statutBrut = texte(formData, "status");
  if (!isArticleStatut(statutBrut)) return { error: "Statut inconnu.", ok: null };
  const statut = statutBrut;

  const traduction = lireTraduction(formData);
  if (!traduction.title) return { error: "Un titre est requis pour créer l'article.", ok: null };

  // Publier une fiche sans corps mettrait en ligne une page vide : on refuse au
  // moment de la publication, jamais à l'enregistrement d'un brouillon.
  if ((statut === "PUBLISHED" || statut === "SCHEDULED") && !estComplete(traduction)) {
    return { error: "Le corps de l'article est vide : impossible de publier. Enregistrez-le en brouillon.", ok: null };
  }

  const date = resoudreDate(statut, texte(formData, "publishedAt"), null);
  if ("error" in date) return { error: date.error, ok: null };

  const { tagIds, galerieIds, ...fiche } = await lireFiche(formData);
  traduction.slug = await slugUnique(locale, traduction.slug, null);

  const article = await db().article.create({
    data: {
      ...fiche,
      status: statut,
      publishedAt: date.date,
      createdById: acteur.id,
      translations: { create: [{ locale, ...traduction }] },
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
      galerie: { create: lignesGalerie(galerieIds) },
    },
    select: { id: true },
  });

  revaliderActualites();
  // redirect() lève NEXT_REDIRECT : appelé en dernier, hors de tout try/catch.
  redirect(`${ACTUS_PATH}/${article.id}?cree=1`);
}

/* -------------------------------------------------------------------------- */
/* Fiche (tout sauf les langues)                                               */
/* -------------------------------------------------------------------------- */

export async function enregistrerFicheAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  await assertPermission("actualites");

  const id = texte(formData, "id");
  if (!id) return { error: "Article introuvable.", ok: null };

  const statutBrut = texte(formData, "status");
  if (!isArticleStatut(statutBrut)) return { error: "Statut inconnu.", ok: null };
  const statut = statutBrut;

  const article = await db().article.findUnique({
    where: { id },
    select: { id: true, publishedAt: true, translations: { select: { title: true, contentHtml: true } } },
  });
  if (!article) return { error: "Article introuvable.", ok: null };

  // La complétude se lit EN BASE et non dans le formulaire : cet envoi ne porte
  // aucune langue, et l'état des traductions a pu changer depuis l'affichage.
  if ((statut === "PUBLISHED" || statut === "SCHEDULED") && !article.translations.some(estComplete)) {
    return {
      error: "Aucune langue complète : renseignez un titre et un corps dans au moins une langue avant de publier.",
      ok: null,
    };
  }

  const date = resoudreDate(statut, texte(formData, "publishedAt"), article.publishedAt);
  if ("error" in date) return { error: date.error, ok: null };

  const { tagIds, galerieIds, ...fiche } = await lireFiche(formData);

  // La galerie est réécrite en entier : ordre et contenu sont ceux du
  // formulaire. Une transaction, pour qu'une lecture publique ne tombe jamais
  // entre l'effacement et la réécriture.
  await db().$transaction([
    db().article.update({
      where: { id },
      data: { ...fiche, status: statut, publishedAt: date.date },
    }),
    db().articleImage.deleteMany({ where: { articleId: id } }),
    db().articleImage.createMany({ data: lignesGalerie(galerieIds).map((l) => ({ ...l, articleId: id })) }),
  ]);

  await db().articleTag.deleteMany({ where: { articleId: id, tagId: { notIn: tagIds } } });
  if (tagIds.length) {
    await db().articleTag.createMany({
      data: tagIds.map((tagId) => ({ articleId: id, tagId })),
      skipDuplicates: true,
    });
  }

  revaliderActualites();
  return { error: null, ok: "Réglages enregistrés." };
}

/* -------------------------------------------------------------------------- */
/* Traductions                                                                 */
/* -------------------------------------------------------------------------- */

/** Enregistre UNE langue, et elle seule. */
export async function enregistrerTraductionAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  const acteur = await assertPermission("actualites");

  const articleId = texte(formData, "articleId");
  const locale = lireLocale(formData);
  if (!articleId) return { error: "Article introuvable.", ok: null };
  if (!locale) return { error: "Langue inconnue.", ok: null };

  const article = await db().article.findUnique({ where: { id: articleId }, select: { id: true } });
  if (!article) return { error: "Article introuvable.", ok: null };

  const traduction = lireTraduction(formData);
  if (!traduction.title) {
    return {
      error: "Le titre est obligatoire. Pour retirer cette langue du site, utilisez « Supprimer cette traduction ».",
      ok: null,
    };
  }

  traduction.slug = await slugUnique(locale, traduction.slug, articleId);

  await db().articleTranslation.upsert({
    where: { articleId_locale: { articleId, locale } },
    update: traduction,
    create: { articleId, locale, ...traduction },
  });

  // Cette langue appartient désormais à son auteur ; les autres, si elles sont
  // encore libres, partent en traduction (cf. lib/ia/planifier.ts).
  await apresEnregistrementLangue("article", articleId, locale, acteur.id);

  revaliderActualites();

  const incomplete = isEmptyHtml(traduction.contentHtml)
    ? " Le corps est encore vide : cette langue ne sera pas servie au public."
    : "";
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} enregistrée.${incomplete}` };
}

/**
 * Retire une langue.
 *
 * C'est le seul geste qui fait disparaître un article d'une version du site.
 * Refusé s'il ne reste qu'elle sur un article en ligne : la page publique
 * n'aurait plus rien à servir dans aucune langue.
 */
export async function supprimerTraductionAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  await assertPermission("actualites");

  const articleId = texte(formData, "articleId");
  const locale = lireLocale(formData);
  if (!articleId || !locale) return { error: "Traduction introuvable.", ok: null };

  const article = await db().article.findUnique({
    where: { id: articleId },
    select: { status: true, translations: { select: { locale: true } } },
  });
  if (!article) return { error: "Article introuvable.", ok: null };

  const autres = article.translations.filter((t) => t.locale !== locale);
  const enLigne = article.status === "PUBLISHED" || article.status === "SCHEDULED";

  if (enLigne && autres.length === 0) {
    return {
      error: "C'est la seule langue de cet article publié : dépubliez-le d'abord, ou ajoutez une autre langue.",
      ok: null,
    };
  }

  await db().articleTranslation.deleteMany({ where: { articleId, locale } });
  // Le journal ne porte pas de clé étrangère : sans cet oubli, l'écran de suivi
  // continuerait d'annoncer une traduction pour une langue qui n'existe plus.
  await oublierTraductions("article", articleId, locale);

  revaliderActualites();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} supprimée.` };
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

  if (!enLigne && !article.translations.some(estComplete)) {
    return { error: "Aucune langue complète : renseignez un titre et un corps avant de publier.", ok: null };
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
 * Toutes les langues sont copiées : traduire deux fois le même modèle n'aurait
 * pas de sens.
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
    include: {
      translations: true,
      tags: { select: { tagId: true } },
      galerie: { orderBy: { position: "asc" }, select: { mediaId: true } },
    },
  });
  if (!source) return { error: "Article introuvable.", ok: null };

  const copies: { locale: string; slug: string; title: string; excerpt: string | null;
    contentHtml: string; seoTitle: string | null; seoDescription: string | null;
    coverAlt: string | null; authorRole: string | null }[] = [];

  for (const tr of source.translations) {
    if (!(LOCALES as string[]).includes(tr.locale)) continue;
    copies.push({
      locale: tr.locale,
      title: `${tr.title} (copie)`,
      slug: await slugUnique(tr.locale as Lang, slugify(`${tr.slug}-copie`), null),
      excerpt: tr.excerpt,
      contentHtml: tr.contentHtml,
      seoTitle: tr.seoTitle,
      seoDescription: tr.seoDescription,
      coverAlt: tr.coverAlt,
      authorRole: tr.authorRole,
    });
  }

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
      createdById: acteur.id,
      translations: { create: copies },
      tags: { create: source.tags.map(({ tagId }) => ({ tagId })) },
      // Les images sont des RÉFÉRENCES à la bibliothèque : la copie peut les
      // partager sans risque, contrairement au PDF joint.
      galerie: { create: lignesGalerie(source.galerie.map(({ mediaId }) => mediaId)) },
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

  const existe = await db().article.findUnique({
    where: { id },
    select: { id: true, filePublicId: true, fileMime: true },
  });
  if (!existe) return { error: "Article introuvable.", ok: null };

  // Traductions et rattachements d'étiquettes tombent en cascade (cf. schéma).
  await db().article.delete({ where: { id } });
  // Base d'abord, hébergeur ensuite : un échec réseau laisse un fichier
  // orphelin, jamais une fiche qui désigne un fichier effacé.
  if (existe.filePublicId) await supprimerFichier(existe.filePublicId, existe.fileMime ?? MIME_PDF);
  // Le suivi des traductions, lui, n'est rattaché par aucune clé étrangère.
  await oublierTraductions("article", id);

  revaliderActualites();
  redirect(`${ACTUS_PATH}?supprime=1`);
}

/* -------------------------------------------------------------------------- */
/* Pièce jointe PDF                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Attache le PDF d'un article, ou remplace celui qui est déjà là.
 *
 * Formulaire séparé de la fiche, comme pour les documents publiés (cf.
 * actions/admin-documents.ts) : renvoyer plusieurs mégaoctets à chaque
 * correction de date n'aurait pas de sens.
 *
 * PDF seulement : c'est le format du texte officiel d'un communiqué, et le seul
 * que tous les visiteurs savent ouvrir sans logiciel bureautique.
 *
 * Ordre des opérations : dépôt du nouveau, bascule de la ligne, retrait de
 * l'ancien. À aucun instant l'article ne désigne un fichier absent.
 */
export async function joindrePdfArticleAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  await assertPermission("actualites");

  const id = texte(formData, "id");
  if (!id) return { error: "Article introuvable.", ok: null };

  const ancien = await db().article.findUnique({
    where: { id },
    select: { filePublicId: true, fileMime: true, fileName: true },
  });
  if (!ancien) return { error: "Article introuvable.", ok: null };

  const fichier = formData.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { error: "Aucun fichier reçu. Choisissez le PDF à joindre.", ok: null };
  }
  if (fichier.type !== MIME_PDF) {
    return { error: "Seuls les fichiers PDF sont acceptés.", ok: null };
  }
  const plafond = tailleMaxPour(fichier.type);
  if (fichier.size > plafond) {
    return {
      error: `Fichier trop lourd (${poidsLisible(fichier.size)}). Limite : ${poidsLisible(plafond)}.`,
      ok: null,
    };
  }
  if (!cloudinaryActif()) {
    return {
      error: "Stockage des fichiers non configuré : le dépôt est impossible tant que CLOUDINARY_URL n'est pas renseignée dans l'environnement.",
      ok: null,
    };
  }

  const nom = fichier.name.slice(0, 180) || "communique.pdf";
  const octets = new Uint8Array(await fichier.arrayBuffer());
  // Le type annoncé par le navigateur ne prouve rien ; l'en-tête « %PDF- » si.
  if (!contenuCorrespond(octets, fichier.type)) {
    return { error: "Le contenu du fichier n'est pas un PDF valide. Dépôt refusé.", ok: null };
  }

  let depot;
  try {
    depot = await deposerFichier(octets, { filename: nom, mimeType: fichier.type, sousDossier: "actualites/pdf" });
  } catch (erreur) {
    console.error("[actus] dépôt Cloudinary impossible", erreur);
    return { error: "Téléversement refusé par le service de stockage. Réessayez.", ok: null };
  }

  try {
    await db().article.update({
      where: { id },
      data: {
        fileUrl: depot.url,
        filePublicId: depot.publicId,
        fileName: nom,
        fileMime: fichier.type,
        fileSize: depot.size || fichier.size,
        fileFormat: depot.format ?? "pdf",
      },
    });
  } catch (erreur) {
    // Le fichier est déjà chez l'hébergeur : ne pas l'y laisser orphelin.
    await supprimerFichier(depot.publicId, fichier.type);
    throw erreur;
  }

  if (ancien.filePublicId) await supprimerFichier(ancien.filePublicId, ancien.fileMime ?? MIME_PDF);

  revaliderActualites();
  return {
    error: null,
    ok: ancien.fileName
      ? `PDF remplacé : « ${nom} » succède à « ${ancien.fileName} ».`
      : `PDF « ${nom} » joint à l'article.`,
  };
}

/** Retire le PDF d'un article. L'article lui-même reste en ligne. */
export async function retirerPdfArticleAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  await assertPermission("actualites");

  const id = texte(formData, "id");
  if (!id) return { error: "Article introuvable.", ok: null };

  const article = await db().article.findUnique({
    where: { id },
    select: { filePublicId: true, fileMime: true, fileName: true },
  });
  if (!article) return { error: "Article introuvable.", ok: null };
  if (!article.fileName) return { error: "Aucun PDF à retirer.", ok: null };

  await db().article.update({
    where: { id },
    data: { fileUrl: null, filePublicId: null, fileName: null, fileMime: null, fileSize: 0, fileFormat: null },
  });
  if (article.filePublicId) await supprimerFichier(article.filePublicId, article.fileMime ?? MIME_PDF);

  revaliderActualites();
  return { error: null, ok: `PDF « ${article.fileName} » retiré.` };
}
