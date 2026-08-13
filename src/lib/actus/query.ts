/**
 * Couche de lecture des actualités — l'unique porte d'entrée du site public
 * vers la table `Article`.
 *
 * Deux invariants gouvernent ce module :
 *
 *  1. **Rien ne sort qui ne soit en ligne.** Le filtre `enLigne()` s'applique à
 *     toutes les fonctions publiques ; la seule exception est `apercuArticle()`,
 *     réservée à la prévisualisation signée (cf. lib/actus/apercu.ts).
 *  2. **Rien ne sort dans la mauvaise langue sans le dire.** Un article dont la
 *     traduction manque n'apparaît pas dans les listes de cette langue, et sa
 *     fiche indique explicitement la langue réellement servie (`traduit`,
 *     `langue`). Le CMS peut donc publier au fil de l'eau sans jamais afficher
 *     un titre français sur la version anglaise du site.
 */
import { db } from "@/lib/db";
import { anneeArticle, formatArticleDate } from "@/lib/format";
import { htmlToText, readingMinutes, truncate } from "@/lib/html/sanitize";
import { couverture, type MediaRef, type Visuel } from "@/lib/medias";
import type { Lang } from "@/lib/pick";
import { type ArticleStatut } from "@/lib/actus/statut";
import { describeError, estPanneDeLiaison } from "@/lib/errors";

/** Longueur d'un résumé déduit du corps, faute de résumé saisi. */
const EXTRAIT_AUTO = 190;

/* -------------------------------------------------------------------------- */
/* Sélections Prisma                                                           */
/* -------------------------------------------------------------------------- */

/**
 * ⚠️ `data` est volontairement absent : la colonne porte le binaire des fichiers
 * téléversés. La charger pour afficher une vignette ferait transiter plusieurs
 * mégaoctets par article (cf. app/api/medias/[id]/route.ts, seul endroit qui la lit).
 */
const mediaSelect = {
  id: true, filename: true, mimeType: true, size: true,
  width: true, height: true, url: true, altFr: true, altEn: true, legende: true,
} as const;

const articleSelect = {
  id: true,
  status: true,
  publishedAt: true,
  featured: true,
  lieu: true,
  videoYt: true,
  comps: true,
  coverKey: true,
  updatedAt: true,
  authorName: true,
  authorRole: true,
  author: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, slug: true, nomFr: true, nomEn: true, color: true } },
  coverMedia: { select: mediaSelect },
  translations: {
    select: {
      locale: true, title: true, slug: true, excerpt: true, contentHtml: true,
      seoTitle: true, seoDescription: true, coverAlt: true,
    },
  },
  tags: { select: { tag: { select: { id: true, slug: true, nomFr: true, nomEn: true } } } },
} as const;

/** Condition « servi au public à cet instant ». */
const enLigne = (now: Date = new Date()) => ({
  status: { in: ["PUBLISHED", "SCHEDULED"] as ArticleStatut[] },
  publishedAt: { lte: now },
});

/**
 * Attentes successives avant chaque reprise, en millisecondes.
 *
 * ⚠️ Ce qui est mesuré, et ce qui ne l'est pas. Le réveil d'un compute Neon
 * suspendu a été soupçonné puis ÉCARTÉ : après huit minutes sans requête, la
 * page « Actualités » se rend en 3,75 s sans déclencher une seule reprise.
 *
 * Ce qui est établi, en revanche, c'est que le transport WebSocket vers Neon
 * échoue par SALVES, là où le transport HTTP reste intact au même instant
 * (mesuré : 8/8 en HTTP contre 3/8 en WebSocket sur la même minute, et 10/10
 * dès lors qu'un même pool est réutilisé). Ces paliers absorbent une salve
 * courte — ils l'ont fait pendant un `next build` à 7 workers, qui s'est
 * terminé sans un seul abandon. Une salve plus longue que le budget ressort en
 * 500, et c'est voulu : mieux vaut une erreur visible qu'une page mise en cache
 * annonçant « aucun communiqué » sur une base pourtant pleine.
 *
 * Le coût est nul tant que la base répond : ce chemin ne s'ouvre que sur une
 * panne de LIAISON avérée.
 */
const REPRISES_MS = [300, 900, 2000];

const enCompilation = () => process.env.NEXT_PHASE === "phase-production-build";

/**
 * Enveloppe de toute lecture publique des actualités. Elle rend deux services.
 *
 * ─── 1. Des reprises sur panne de LIAISON ────────────────────────────────────
 * Neon suspend son compute après quelques minutes sans requête, et celle qui le
 * réveille échoue avant que la socket soit établie. La page « Actualités »
 * tombait alors en 500, à la vue du public. Les reprises sont échelonnées pour
 * couvrir la durée réelle d'un réveil (cf. `REPRISES_MS`), et cantonnées aux
 * pannes de liaison (cf. `estPanneDeLiaison`) : rejouer une requête que la base
 * a refusée ne ferait que la faire refuser autant de fois.
 *
 * ─── 2. Une tolérance limitée À LA COMPILATION ───────────────────────────────
 * L'accueil et les cinq pages de composante sont pré-rendus au build et lisent
 * les actualités. Une base injoignable pendant `next build` ferait échouer la
 * construction entière pour un bloc secondaire de page. Ces listes ont un état
 * vide légitime : on y retombe, en le disant dans le journal de build.
 *
 * À L'EXÉCUTION, la panne est relayée telle quelle : une page « Actualités »
 * affichant « aucun communiqué » sur une base éteinte mentirait au visiteur, et
 * le mensonge serait mis en cache. Mieux vaut une erreur, que l'exploitant voit
 * et corrige (cf. src/instrumentation.ts pour la trace serveur).
 *
 * ⚠️ `faire` est une FONCTION, pas une promesse : une promesse déjà rejetée ne
 * se rejoue pas, la reprise n'aurait servi à rien.
 */
async function lecture<T>(faire: () => Promise<T>, repli: T, contexte: string): Promise<T> {
  for (let tentative = 0; ; tentative++) {
    try {
      return await faire();
    } catch (error) {
      const attente = REPRISES_MS[tentative];

      // Deux sorties, une seule conduite : on abandonne dès que la reprise n'a
      // plus de sens — paliers épuisés, ou panne qui n'est pas de liaison.
      if (attente === undefined || !estPanneDeLiaison(error)) {
        return echec(error, repli, contexte);
      }

      console.warn(
        `[actus] ${contexte} : liaison perdue, reprise ${tentative + 1}/${REPRISES_MS.length} dans ${attente} ms. ${describeError(error)}`,
      );
      await new Promise((resoudre) => setTimeout(resoudre, attente));
    }
  }
}

function echec<T>(error: unknown, repli: T, contexte: string): T {
  if (!enCompilation()) throw error;
  console.warn(
    `[actus] ${contexte} : base injoignable pendant la compilation, bloc laissé vide. ${describeError(error)}`,
  );
  return repli;
}

/* -------------------------------------------------------------------------- */
/* Vue                                                                         */
/* -------------------------------------------------------------------------- */

export type ActuCategorie = { slug: string; nom: string; color: string | null };
export type ActuTag = { slug: string; nom: string };

/** Un article résolu dans une langue, prêt à l'affichage. */
export type ActuVue = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
  date: Date;
  dateLabel: string;
  dateISO: string;
  updatedISO: string;
  lieu: string | null;
  videoYt: string | null;
  comps: string[];
  featured: boolean;
  categorie: ActuCategorie | null;
  tags: ActuTag[];
  auteur: { nom: string; role: string | null } | null;
  visuel: Visuel;
  /** Durée de lecture estimée, en minutes. */
  lecture: number;
  /** Langue réellement servie — diffère de la langue demandée en cas de repli. */
  langue: Lang;
  /** La traduction demandée existait-elle ? */
  traduit: boolean;
  /** Langues dans lesquelles l'article existe, pour les liens alternatifs. */
  langues: Lang[];
  /** Slug par langue — alimente `alternates.languages`. */
  slugs: Partial<Record<Lang, string>>;
};

type LigneArticle = {
  id: string;
  status: string;
  publishedAt: Date | null;
  featured: boolean;
  lieu: string | null;
  videoYt: string | null;
  comps: string[];
  coverKey: string | null;
  updatedAt: Date;
  authorName: string | null;
  authorRole: string | null;
  author: { id: string; name: string | null; email: string } | null;
  category: { id: string; slug: string; nomFr: string; nomEn: string; color: string | null } | null;
  coverMedia: MediaRef | null;
  translations: {
    locale: string; title: string; slug: string; excerpt: string | null;
    contentHtml: string; seoTitle: string | null; seoDescription: string | null; coverAlt: string | null;
  }[];
  tags: { tag: { id: string; slug: string; nomFr: string; nomEn: string } }[];
};

const estLang = (value: string): value is Lang => value === "fr" || value === "en";

/**
 * Projette une ligne dans la langue demandée.
 *
 * Le repli n'est pas silencieux : quand la traduction manque, `traduit` passe à
 * `false` et `langue` porte la langue réellement servie. C'est ce couple que la
 * page de détail affiche au lecteur (« disponible uniquement en français »).
 */
function toVue(row: LigneArticle, lang: Lang): ActuVue | null {
  const demandee = row.translations.find((t) => t.locale === lang);
  // Repli : le français d'abord — c'est la langue de rédaction de l'Unité.
  const tr = demandee ?? row.translations.find((t) => t.locale === "fr") ?? row.translations[0];
  if (!tr) return null;

  const langue: Lang = estLang(tr.locale) ? tr.locale : "fr";
  const date = row.publishedAt ?? row.updatedAt;

  const langues = row.translations.map((t) => t.locale).filter(estLang);
  const slugs: Partial<Record<Lang, string>> = {};
  for (const t of row.translations) if (estLang(t.locale)) slugs[t.locale] = t.slug;

  const auteurNom = row.authorName?.trim() || row.author?.name?.trim() || null;

  return {
    id: row.id,
    slug: tr.slug,
    title: tr.title,
    excerpt: tr.excerpt?.trim() || truncate(htmlToText(tr.contentHtml), EXTRAIT_AUTO),
    contentHtml: tr.contentHtml,
    seoTitle: tr.seoTitle,
    seoDescription: tr.seoDescription,
    date,
    dateLabel: formatArticleDate(date, langue),
    dateISO: date.toISOString(),
    updatedISO: row.updatedAt.toISOString(),
    lieu: row.lieu,
    videoYt: row.videoYt,
    comps: row.comps,
    featured: row.featured,
    categorie: row.category
      ? { slug: row.category.slug, nom: langue === "en" ? row.category.nomEn : row.category.nomFr, color: row.category.color }
      : null,
    tags: row.tags.map(({ tag }) => ({ slug: tag.slug, nom: langue === "en" ? tag.nomEn : tag.nomFr })),
    auteur: auteurNom ? { nom: auteurNom, role: row.authorRole } : null,
    visuel: couverture({ coverMedia: row.coverMedia, coverKey: row.coverKey, coverAlt: tr.coverAlt }, langue, tr.title),
    lecture: readingMinutes(tr.contentHtml),
    langue,
    traduit: demandee !== undefined,
    langues,
    slugs,
  };
}

/* -------------------------------------------------------------------------- */
/* Listes                                                                      */
/* -------------------------------------------------------------------------- */

export type ListeOptions = {
  lang: Lang;
  categorie?: string | null;
  tag?: string | null;
  recherche?: string | null;
  /** Code de composante (« C2 ») — bloc « Actualités » des pages composante. */
  comp?: string | null;
  page?: number;
  parPage?: number;
};

export type ListeActus = {
  items: ActuVue[];
  total: number;
  page: number;
  pages: number;
  parPage: number;
};

export const PAR_PAGE = 9;

/**
 * Contrainte portée par la relation `translations` : la langue de lecture, et
 * le cas échéant la recherche plein texte.
 *
 * ⚠️ Les deux doivent tenir dans UNE SEULE clé `translations`. Écrites en deux
 * clés d'un même objet littéral, la seconde écraserait la première et la
 * recherche se ferait toutes langues confondues.
 *
 * Partagé par la grille paginée et par le fil chronologique, pour que les deux
 * blocs de la page répondent exactement au même filtre.
 */
function filtreTraductions(lang: Lang, recherche?: string | null): Record<string, unknown> {
  const q = recherche?.trim();
  const filtre: Record<string, unknown> = { locale: lang };
  if (q) {
    filtre.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { contentHtml: { contains: q, mode: "insensitive" } },
    ];
  }
  return filtre;
}

/**
 * Liste paginée de la page « Actualités ».
 *
 * Les articles mis en avant remontent en tête, quel que soit le filtre : c'est
 * le sens de la mise en avant, et l'ordre reste stable d'une page à l'autre
 * puisque le tri secondaire est la date.
 */
export async function listerActualites(options: ListeOptions): Promise<ListeActus> {
  const { lang, categorie, tag, recherche, comp } = options;
  const parPage = options.parPage ?? PAR_PAGE;
  const page = Math.max(1, options.page ?? 1);

  const where = {
    ...enLigne(),
    translations: { some: filtreTraductions(lang, recherche) },
    ...(categorie ? { category: { slug: categorie } } : {}),
    ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
    ...(comp ? { comps: { has: comp } } : {}),
  };

  const [total, rows] = await lecture(
    () => Promise.all([
      db().article.count({ where }),
      db().article.findMany({
        where,
        select: articleSelect,
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * parPage,
        take: parPage,
      }),
    ]).then(([nombre, lignes]) => [nombre, lignes as LigneArticle[]] as [number, LigneArticle[]]),
    [0, []] as [number, LigneArticle[]],
    "liste des actualités",
  );

  return {
    items: (rows as LigneArticle[]).map((row) => toVue(row, lang)).filter((v): v is ActuVue => v !== null),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / parPage)),
    parPage,
  };
}

/* -------------------------------------------------------------------------- */
/* Fil chronologique                                                           */
/* -------------------------------------------------------------------------- */

/** Une entrée du fil : une date, un titre, un lien. Rien d'autre n'est affiché. */
export type JalonActu = {
  id: string;
  slug: string;
  titre: string;
  dateLabel: string;
  dateISO: string;
  /** Année au fuseau de Kinshasa, pour les intertitres du fil. */
  annee: number;
  categorie: { nom: string; color: string | null } | null;
};

/**
 * Sélection réduite au strict nécessaire. Réutiliser `articleSelect` ici
 * chargerait le corps HTML, les vignettes et les étiquettes de chaque article
 * pour n'en afficher que le titre et la date.
 */
const filSelect = {
  id: true,
  publishedAt: true,
  category: { select: { nomFr: true, nomEn: true, color: true } },
  translations: { select: { locale: true, title: true, slug: true } },
} as const;

type LigneFil = {
  id: string;
  publishedAt: Date | null;
  category: { nomFr: string; nomEn: string; color: string | null } | null;
  translations: { locale: string; title: string; slug: string }[];
};

/** Plafond du fil. Au-delà, la page s'allonge sans rien apprendre de plus. */
export const FIL_MAX = 24;

/**
 * Fil chronologique de publication.
 *
 * Deux écarts assumés avec `listerActualites`, qui alimente la grille juste
 * au-dessus sur la même page :
 *
 *  1. **La mise en avant ne joue pas.** Le tri est la date de publication, et
 *     rien d'autre. Un fil dont l'ordre n'est pas celui du temps ne serait pas
 *     un fil chronologique — c'est précisément ce que la grille fait déjà.
 *  2. **Aucune pagination.** Le fil couvre l'ensemble des articles retenus par
 *     les filtres actifs, plafonné à `FIL_MAX`. C'est ce qui en fait un
 *     complément et non un doublon : la grille détaille neuf articles, le fil
 *     en récapitule beaucoup plus.
 *
 * Les filtres de la page (catégorie, étiquette, recherche) s'y appliquent. Un
 * fil qui les ignorerait afficherait, sous une grille filtrée, des articles
 * sans rapport avec ce que le visiteur a demandé.
 */
export async function filChronologique(options: {
  lang: Lang;
  categorie?: string | null;
  tag?: string | null;
  recherche?: string | null;
  limite?: number;
}): Promise<JalonActu[]> {
  const { lang, categorie, tag, recherche } = options;

  const where = {
    ...enLigne(),
    translations: { some: filtreTraductions(lang, recherche) },
    ...(categorie ? { category: { slug: categorie } } : {}),
    ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
  };

  const rows = await lecture(
    () => db().article.findMany({
      where,
      select: filSelect,
      orderBy: [{ publishedAt: "desc" }],
      take: options.limite ?? FIL_MAX,
    }),
    [],
    "fil chronologique",
  );

  return (rows as LigneFil[])
    .map((row): JalonActu | null => {
      // Ces deux gardes ne peuvent pas se déclencher : `enLigne()` exige
      // `publishedAt <= maintenant`, et la clause `translations.some` a exigé la
      // langue. Ils satisfont le typage sans inventer de valeur de repli.
      if (!row.publishedAt) return null;
      const tr = row.translations.find((t) => t.locale === lang);
      if (!tr) return null;

      return {
        id: row.id,
        slug: tr.slug,
        titre: tr.title,
        dateLabel: formatArticleDate(row.publishedAt, lang),
        dateISO: row.publishedAt.toISOString(),
        annee: anneeArticle(row.publishedAt),
        categorie: row.category
          ? { nom: lang === "fr" ? row.category.nomFr : row.category.nomEn, color: row.category.color }
          : null,
      };
    })
    .filter((j): j is JalonActu => j !== null);
}

/** Derniers articles — accueil, bloc d'une page composante, articles liés. */
export async function derniersArticles(lang: Lang, limite = 4, comp?: string): Promise<ActuVue[]> {
  const rows = await lecture(
    () => db().article.findMany({
      where: {
        ...enLigne(),
        translations: { some: { locale: lang } },
        ...(comp ? { comps: { has: comp } } : {}),
      },
      select: articleSelect,
      orderBy: [{ publishedAt: "desc" }],
      take: limite,
    }),
    [],
    comp ? `derniers articles de ${comp}` : "derniers articles",
  );

  return (rows as LigneArticle[]).map((row) => toVue(row, lang)).filter((v): v is ActuVue => v !== null);
}

/** Catégories réellement peuplées dans la langue active, pour les filtres. */
export async function listerCategories(
  lang: Lang,
): Promise<(ActuCategorie & { total: number })[]> {
  const rows = await lecture(
    () => db().articleCategory.findMany({
      select: {
        slug: true, nomFr: true, nomEn: true, color: true,
        _count: { select: { articles: { where: { ...enLigne(), translations: { some: { locale: lang } } } } } },
      },
      orderBy: [{ position: "asc" }, { nomFr: "asc" }],
    }),
    [],
    "catégories d'actualités",
  );

  return rows
    .filter((row) => row._count.articles > 0)
    .map((row) => ({
      slug: row.slug,
      nom: lang === "en" ? row.nomEn : row.nomFr,
      color: row.color,
      total: row._count.articles,
    }));
}

/* -------------------------------------------------------------------------- */
/* Fiche                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Article par son slug.
 *
 * Deux recherches successives, et non une seule sur le slug : la première exige
 * la langue demandée, la seconde accepte n'importe quelle langue. Un lecteur
 * anglophone qui suit un lien vers un article seulement traduit en français
 * obtient donc la fiche — accompagnée de la mention qui l'explique — plutôt
 * qu'une 404.
 */
export async function getArticle(lang: Lang, slug: string): Promise<ActuVue | null> {
  const dansLaLangue = await lecture(
    () => db().article.findFirst({
      where: { ...enLigne(), translations: { some: { locale: lang, slug } } },
      select: articleSelect,
    }),
    null,
    `article « ${slug} »`,
  );
  if (dansLaLangue) return toVue(dansLaLangue as LigneArticle, lang);

  const ailleurs = await lecture(
    () => db().article.findFirst({
      where: { ...enLigne(), translations: { some: { slug } } },
      select: articleSelect,
    }),
    null,
    `article « ${slug} » (toutes langues)`,
  );
  return ailleurs ? toVue(ailleurs as LigneArticle, lang) : null;
}

/**
 * Article par identifiant, SANS filtre de publication.
 * Réservé à la prévisualisation : l'appelant doit avoir vérifié un jeton signé
 * (cf. lib/actus/apercu.ts) ou une permission de console.
 */
export async function apercuArticle(id: string, lang: Lang): Promise<ActuVue | null> {
  const row = await lecture(
    () => db().article.findUnique({ where: { id }, select: articleSelect }),
    null,
    "aperçu d'article",
  );
  return row ? toVue(row as LigneArticle, lang) : null;
}

/**
 * Articles liés : d'abord la même catégorie, puis les plus récents pour
 * compléter. Le bloc reste ainsi toujours rempli, ce qui évite une fin de page
 * qui se rétrécit quand une catégorie ne compte qu'un article.
 */
export async function articlesLies(article: ActuVue, lang: Lang, limite = 3): Promise<ActuVue[]> {
  const base = { ...enLigne(), translations: { some: { locale: lang } }, id: { not: article.id } };

  const memeCategorie = article.categorie
    ? await lecture(
        () => db().article.findMany({
          where: { ...base, category: { slug: article.categorie!.slug } },
          select: articleSelect,
          orderBy: [{ publishedAt: "desc" }],
          take: limite,
        }),
        [],
        "articles liés (même catégorie)",
      )
    : [];

  const manque = limite - memeCategorie.length;
  const complement = manque > 0
    ? await lecture(
        () => db().article.findMany({
          where: { ...base, id: { notIn: [article.id, ...memeCategorie.map((r) => r.id)] } },
          select: articleSelect,
          orderBy: [{ publishedAt: "desc" }],
          take: manque,
        }),
        [],
        "articles liés (complément)",
      )
    : [];

  return [...memeCategorie, ...complement]
    .map((row) => toVue(row as LigneArticle, lang))
    .filter((v): v is ActuVue => v !== null);
}

/** Article précédent / suivant dans l'ordre chronologique de publication. */
export async function voisins(
  article: ActuVue,
  lang: Lang,
): Promise<{ precedent: ActuVue | null; suivant: ActuVue | null }> {
  const base = { ...enLigne(), translations: { some: { locale: lang } }, id: { not: article.id } };

  const [plusAncien, plusRecent] = await lecture(
    () => Promise.all([
      db().article.findFirst({
        where: { ...base, publishedAt: { lt: article.date } },
        select: articleSelect,
        orderBy: [{ publishedAt: "desc" }],
      }),
      db().article.findFirst({
        where: { ...base, publishedAt: { gt: article.date } },
        select: articleSelect,
        orderBy: [{ publishedAt: "asc" }],
      }),
    ]),
    [null, null],
    "article précédent / suivant",
  );

  return {
    precedent: plusAncien ? toVue(plusAncien as LigneArticle, lang) : null,
    suivant: plusRecent ? toVue(plusRecent as LigneArticle, lang) : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Agrégats                                                                    */
/* -------------------------------------------------------------------------- */

/** Nombre d'articles en ligne — indicateur du tableau de bord. */
export const compterEnLigne = (): Promise<number> =>
  lecture(() => db().article.count({ where: enLigne() }), 0, "compteur d'articles en ligne");

/**
 * Toutes les URL d'articles servies, pour `app/sitemap.ts`.
 * Ne lève pas : un sitemap amputé vaut mieux qu'une 500 sur `/sitemap.xml`.
 */
export async function urlsArticles(): Promise<{ locale: Lang; slug: string; updatedAt: Date }[]> {
  try {
    const rows = await lecture(
      () => db().articleTranslation.findMany({
        where: { article: enLigne() },
        select: { locale: true, slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      [],
      "sitemap",
    );
    return rows
      .filter((row): row is typeof row & { locale: Lang } => estLang(row.locale))
      .map((row) => ({ locale: row.locale, slug: row.slug, updatedAt: row.updatedAt }));
  } catch (error) {
    // Seul endroit du module qui avale une panne à l'exécution : un sitemap
    // amputé vaut mieux qu'une 500 sur /sitemap.xml, que les moteurs relisent
    // sans cesse. Les pages, elles, laissent l'erreur remonter.
    console.error(`[actus] sitemap : lecture des articles impossible. ${describeError(error)}`);
    return [];
  }
}
