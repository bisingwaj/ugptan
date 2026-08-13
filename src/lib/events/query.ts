/**
 * Couche de lecture des événements — l'unique porte d'entrée du site public
 * vers la table `Evenement`.
 *
 * Mêmes deux invariants que les actualités, pour les mêmes raisons :
 *
 *  1. **Rien ne sort qui ne soit publié.** Le filtre `publie` s'applique à
 *     toutes les fonctions de ce module.
 *  2. **Rien ne sort dans la mauvaise langue sans le dire.** Un événement dont
 *     la traduction manque n'apparaît pas dans les listes de cette langue, et
 *     sa fiche indique explicitement la langue réellement servie (`traduit`,
 *     `langue`). Le CMS peut donc annoncer une rencontre en français le matin
 *     et la traduire l'après-midi, sans jamais afficher un titre français sur
 *     la version anglaise du site.
 *
 * Un troisième invariant lui est propre : **la phase n'est jamais lue en base**.
 * « À venir », « en cours » et « terminé » se calculent sur `startAt` / `endAt`
 * à l'instant de la requête (cf. lib/events/statut.ts).
 */
import { db } from "@/lib/db";
import { htmlToText, truncate } from "@/lib/html/sanitize";
import { lecteur } from "@/lib/lecture";
import { couverture, type MediaRef, type Visuel } from "@/lib/medias";
import type { Lang } from "@/lib/pick";
import { describeError } from "@/lib/errors";
import { anneeEvenement, intervalleDates, isoEvenement, plageHoraire } from "@/lib/events/dates";
import {
  estAVenir, finEffective, phaseEvenement,
  type EvenementMode, type EvenementPhase,
} from "@/lib/events/statut";

/** Longueur d'un résumé déduit de la description, faute de résumé saisi. */
const EXTRAIT_AUTO = 190;

const lecture = lecteur("events");

/* -------------------------------------------------------------------------- */
/* Sélections Prisma                                                           */
/* -------------------------------------------------------------------------- */

/** ⚠️ `data` est volontairement absent : cf. le commentaire de lib/actus/query.ts. */
const mediaSelect = {
  id: true, filename: true, mimeType: true, size: true,
  width: true, height: true, url: true, altFr: true, altEn: true, legende: true,
} as const;

const evenementSelect = {
  id: true,
  status: true,
  startAt: true,
  endAt: true,
  allDay: true,
  mode: true,
  featured: true,
  color: true,
  coverKey: true,
  updatedAt: true,
  registrationUrl: true,
  externalUrl: true,
  onlineUrl: true,
  organiserName: true,
  organiserEmail: true,
  organiserPhone: true,
  organiserUrl: true,
  comps: true,
  category: { select: { id: true, slug: true, nomFr: true, nomEn: true, color: true } },
  coverMedia: { select: mediaSelect },
  translations: {
    select: {
      locale: true, title: true, slug: true, excerpt: true, contentHtml: true,
      lieu: true, adresse: true, places: true, infos: true,
      seoTitle: true, seoDescription: true, coverAlt: true,
    },
  },
} as const;

/** Condition « servi au public ». La date n'y entre pas : un événement passé
 *  reste en ligne, c'est la trace de l'activité de l'Unité. */
const publie = { status: "PUBLISHED" as const };

/* -------------------------------------------------------------------------- */
/* Vue                                                                         */
/* -------------------------------------------------------------------------- */

export type EvtCategorie = { slug: string; nom: string; color: string | null };

/** Un organisateur, tel qu'il s'affiche. `null` si rien n'a été renseigné. */
export type EvtOrganisateur = {
  nom: string;
  email: string | null;
  telephone: string | null;
  url: string | null;
};

/** Un événement résolu dans une langue, prêt à l'affichage. */
export type EvtVue = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;

  /* --- Temps ------------------------------------------------------------- */
  start: Date;
  end: Date | null;
  allDay: boolean;
  /** Intervalle complet : « 12 – 14 septembre 2026 ». */
  dateLabel: string;
  /** Forme courte de la ligne mono des cartes : « 12 sept. 2026 ». */
  dateCourte: string;
  /** « 09:00 – 17:00 », ou `null` si l'heure n'apprend rien. */
  heureLabel: string | null;
  startISO: string;
  endISO: string | null;
  updatedISO: string;
  annee: number;
  phase: EvenementPhase;
  /** Raccourci de lecture : l'événement n'est pas encore terminé. */
  aVenir: boolean;

  /* --- Lieu -------------------------------------------------------------- */
  mode: EvenementMode;
  lieu: string | null;
  adresse: string | null;
  places: string | null;
  infos: string | null;

  /* --- Rattachements ----------------------------------------------------- */
  categorie: EvtCategorie | null;
  /** Couleur d'accent effective : événement, puis catégorie, puis accent du site. */
  accent: string;
  comps: string[];
  featured: boolean;
  visuel: Visuel;
  organisateur: EvtOrganisateur | null;
  registrationUrl: string | null;
  externalUrl: string | null;
  onlineUrl: string | null;

  /* --- Langues ----------------------------------------------------------- */
  /** Langue réellement servie — diffère de la langue demandée en cas de repli. */
  langue: Lang;
  /** La traduction demandée existait-elle ? */
  traduit: boolean;
  /** Langues dans lesquelles l'événement existe, pour les liens alternatifs. */
  langues: Lang[];
  /** Slug par langue — alimente `alternates.languages`. */
  slugs: Partial<Record<Lang, string>>;
};

type LigneEvenement = {
  id: string;
  status: string;
  startAt: Date;
  endAt: Date | null;
  allDay: boolean;
  mode: string;
  featured: boolean;
  color: string | null;
  coverKey: string | null;
  updatedAt: Date;
  registrationUrl: string | null;
  externalUrl: string | null;
  onlineUrl: string | null;
  organiserName: string | null;
  organiserEmail: string | null;
  organiserPhone: string | null;
  organiserUrl: string | null;
  comps: string[];
  category: { id: string; slug: string; nomFr: string; nomEn: string; color: string | null } | null;
  coverMedia: MediaRef | null;
  translations: {
    locale: string; title: string; slug: string; excerpt: string | null; contentHtml: string;
    lieu: string | null; adresse: string | null; places: string | null; infos: string | null;
    seoTitle: string | null; seoDescription: string | null; coverAlt: string | null;
  }[];
};

const estLang = (value: string): value is Lang => value === "fr" || value === "en";

const vide = (value: string | null | undefined): string | null => value?.trim() || null;

/**
 * Projette une ligne dans la langue demandée.
 *
 * Le repli n'est pas silencieux : quand la traduction manque, `traduit` passe à
 * `false` et `langue` porte la langue réellement servie. C'est ce couple que la
 * page de détail affiche au lecteur (« disponible uniquement en français »).
 */
function toVue(row: LigneEvenement, lang: Lang, now: Date = new Date()): EvtVue | null {
  const demandee = row.translations.find((t) => t.locale === lang);
  // Repli : le français d'abord — c'est la langue de rédaction de l'Unité.
  const tr = demandee ?? row.translations.find((t) => t.locale === "fr") ?? row.translations[0];
  if (!tr) return null;

  const langue: Lang = estLang(tr.locale) ? tr.locale : "fr";
  const phase = phaseEvenement(row.startAt, row.endAt, now);

  const langues = row.translations.map((t) => t.locale).filter(estLang);
  const slugs: Partial<Record<Lang, string>> = {};
  for (const t of row.translations) if (estLang(t.locale)) slugs[t.locale] = t.slug;

  const nomOrganisateur = vide(row.organiserName);

  return {
    id: row.id,
    slug: tr.slug,
    title: tr.title,
    excerpt: vide(tr.excerpt) ?? truncate(htmlToText(tr.contentHtml), EXTRAIT_AUTO),
    contentHtml: tr.contentHtml,
    seoTitle: tr.seoTitle,
    seoDescription: tr.seoDescription,

    start: row.startAt,
    end: row.endAt,
    allDay: row.allDay,
    dateLabel: intervalleDates(row.startAt, row.endAt, langue),
    dateCourte: intervalleDates(row.startAt, row.endAt, langue, true),
    heureLabel: plageHoraire(row.startAt, row.endAt, row.allDay, langue),
    startISO: isoEvenement(row.startAt, row.allDay),
    endISO: row.endAt ? isoEvenement(row.endAt, row.allDay) : null,
    updatedISO: row.updatedAt.toISOString(),
    annee: anneeEvenement(row.startAt),
    phase,
    aVenir: estAVenir(phase),

    mode: row.mode as EvenementMode,
    lieu: vide(tr.lieu),
    adresse: vide(tr.adresse),
    places: vide(tr.places),
    infos: vide(tr.infos),

    categorie: row.category
      ? { slug: row.category.slug, nom: langue === "en" ? row.category.nomEn : row.category.nomFr, color: row.category.color }
      : null,
    accent: vide(row.color) ?? row.category?.color ?? "var(--ac)",
    comps: row.comps,
    featured: row.featured,
    visuel: couverture({ coverMedia: row.coverMedia, coverKey: row.coverKey, coverAlt: tr.coverAlt }, langue, tr.title),
    organisateur: nomOrganisateur
      ? {
          nom: nomOrganisateur,
          email: vide(row.organiserEmail),
          telephone: vide(row.organiserPhone),
          url: vide(row.organiserUrl),
        }
      : null,
    registrationUrl: vide(row.registrationUrl),
    externalUrl: vide(row.externalUrl),
    onlineUrl: vide(row.onlineUrl),

    langue,
    traduit: demandee !== undefined,
    langues,
    slugs,
  };
}

/* -------------------------------------------------------------------------- */
/* Listes                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Contrainte portée par la relation `translations` : la langue de lecture, et
 * le cas échéant la recherche plein texte.
 *
 * ⚠️ Les deux doivent tenir dans UNE SEULE clé `translations`. Écrites en deux
 * clés d'un même objet littéral, la seconde écraserait la première et la
 * recherche se ferait toutes langues confondues.
 */
function filtreTraductions(lang: Lang, recherche?: string | null): Record<string, unknown> {
  const q = recherche?.trim();
  const filtre: Record<string, unknown> = { locale: lang };
  if (q) {
    filtre.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { lieu: { contains: q, mode: "insensitive" } },
      { contentHtml: { contains: q, mode: "insensitive" } },
    ];
  }
  return filtre;
}

export type ListeEvtOptions = {
  lang: Lang;
  categorie?: string | null;
  recherche?: string | null;
  /** Code de composante (« C2 »). */
  comp?: string | null;
  /** Limite par section. Aucune pagination : cf. `listerEvenements`. */
  limite?: number;
};

/**
 * Les deux sections de la page publique, en une seule requête.
 *
 * ─── Pourquoi deux listes et non une grille paginée ──────────────────────────
 * Un événement ne se lit pas comme un article. Le visiteur vient d'abord savoir
 * ce à quoi il peut ENCORE participer ; l'historique n'est consulté qu'ensuite,
 * et rarement au-delà des dernières éditions. Une pagination unique mêlerait
 * les deux et enterrerait la prochaine rencontre sous les précédentes.
 *
 * ─── Deux tris opposés, et c'est voulu ───────────────────────────────────────
 * Les événements à venir sont classés du PLUS PROCHE au plus lointain : c'est
 * l'ordre dans lequel on décide d'y aller. Les événements terminés sont classés
 * du PLUS RÉCENT au plus ancien : c'est l'ordre dans lequel on s'en souvient.
 * La mise en avant ne joue que sur la première liste — mettre en avant une
 * rencontre déjà passée n'aurait aucun sens.
 */
export async function listerEvenements(options: ListeEvtOptions): Promise<{
  aVenir: EvtVue[];
  passes: EvtVue[];
  total: number;
}> {
  const { lang, categorie, recherche, comp } = options;
  const now = new Date();

  const where = {
    ...publie,
    translations: { some: filtreTraductions(lang, recherche) },
    ...(categorie ? { category: { slug: categorie } } : {}),
    ...(comp ? { comps: { has: comp } } : {}),
  };

  // Une seule lecture, partagée par les deux sections : filtrer en base sur
  // « pas encore terminé » supposerait de traduire `finEffective` en SQL, donc
  // d'y dupliquer la règle de fin de journée. Le volume d'un calendrier
  // institutionnel se compte en dizaines de lignes par an — le tri se fait
  // donc ici, sur une source unique et sans risque de divergence.
  const rows = await lecture(
    () => db().evenement.findMany({
      where,
      select: evenementSelect,
      orderBy: [{ startAt: "desc" }],
      take: 400,
    }),
    [],
    "liste des événements",
  );

  const vues = (rows as LigneEvenement[])
    .map((row) => toVue(row, lang, now))
    .filter((v): v is EvtVue => v !== null);

  const limite = options.limite;

  const aVenir = vues
    .filter((v) => v.aVenir)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.start.getTime() - b.start.getTime();
    });

  const passes = vues.filter((v) => !v.aVenir); // déjà du plus récent au plus ancien

  return {
    aVenir: limite ? aVenir.slice(0, limite) : aVenir,
    passes: limite ? passes.slice(0, limite) : passes,
    total: vues.length,
  };
}

/**
 * Prochains événements — accueil, bloc d'une page composante, fin de fiche.
 *
 * Le tri se fait EN BASE ici, et non en mémoire comme ci-dessus : la borne est
 * `startAt >= aujourd'hui à 0 h`, ce qui laisse remonter les rencontres du jour
 * déjà commencées sans avoir à traduire `finEffective` en SQL. Le filtre exact
 * est ensuite appliqué sur les seules lignes retenues.
 */
export async function prochainsEvenements(lang: Lang, limite = 3, comp?: string): Promise<EvtVue[]> {
  const now = new Date();
  // Marge d'un jour en arrière : un événement de plusieurs jours commencé hier
  // est encore « en cours », et doit rester proposé.
  const depuis = new Date(now.getTime() - 36 * 3600 * 1000);

  const rows = await lecture(
    () => db().evenement.findMany({
      where: {
        ...publie,
        translations: { some: { locale: lang } },
        startAt: { gte: depuis },
        ...(comp ? { comps: { has: comp } } : {}),
      },
      select: evenementSelect,
      orderBy: [{ featured: "desc" }, { startAt: "asc" }],
      take: limite + 4,
    }),
    [],
    comp ? `prochains événements de ${comp}` : "prochains événements",
  );

  return (rows as LigneEvenement[])
    .map((row) => toVue(row, lang, now))
    .filter((v): v is EvtVue => v !== null && v.aVenir)
    .slice(0, limite);
}

/** Catégories réellement peuplées dans la langue active, pour les filtres. */
export async function listerCategoriesEvt(
  lang: Lang,
): Promise<(EvtCategorie & { total: number })[]> {
  const rows = await lecture(
    () => db().evenementCategory.findMany({
      select: {
        slug: true, nomFr: true, nomEn: true, color: true,
        _count: { select: { evenements: { where: { ...publie, translations: { some: { locale: lang } } } } } },
      },
      orderBy: [{ position: "asc" }, { nomFr: "asc" }],
    }),
    [],
    "catégories d'événements",
  );

  return rows
    .filter((row) => row._count.evenements > 0)
    .map((row) => ({
      slug: row.slug,
      nom: lang === "en" ? row.nomEn : row.nomFr,
      color: row.color,
      total: row._count.evenements,
    }));
}

/* -------------------------------------------------------------------------- */
/* Fiche                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Événement par son slug.
 *
 * Deux recherches successives, comme pour un article : la première exige la
 * langue demandée, la seconde accepte n'importe quelle langue. Un lecteur
 * anglophone qui suit un lien vers un événement seulement traduit en français
 * obtient donc la fiche — accompagnée de la mention qui l'explique — plutôt
 * qu'une 404.
 */
export async function getEvenement(lang: Lang, slug: string): Promise<EvtVue | null> {
  const dansLaLangue = await lecture(
    () => db().evenement.findFirst({
      where: { ...publie, translations: { some: { locale: lang, slug } } },
      select: evenementSelect,
    }),
    null,
    `événement « ${slug} »`,
  );
  if (dansLaLangue) return toVue(dansLaLangue as LigneEvenement, lang);

  const ailleurs = await lecture(
    () => db().evenement.findFirst({
      where: { ...publie, translations: { some: { slug } } },
      select: evenementSelect,
    }),
    null,
    `événement « ${slug} » (toutes langues)`,
  );
  return ailleurs ? toVue(ailleurs as LigneEvenement, lang) : null;
}

/**
 * Événement par identifiant, SANS filtre de publication.
 * Réservé à la prévisualisation depuis la console : l'appelant doit avoir
 * vérifié un jeton signé (cf. lib/actus/apercu.ts) ou une permission.
 */
export async function apercuEvenement(id: string, lang: Lang): Promise<EvtVue | null> {
  const row = await lecture(
    () => db().evenement.findUnique({ where: { id }, select: evenementSelect }),
    null,
    "aperçu d'événement",
  );
  return row ? toVue(row as LigneEvenement, lang) : null;
}

/**
 * Événements proches : d'abord la même catégorie, puis les plus proches dans le
 * temps pour compléter. Le bloc reste ainsi toujours rempli, ce qui évite une
 * fin de page qui se rétrécit quand une catégorie ne compte qu'un événement.
 */
export async function evenementsLies(evt: EvtVue, lang: Lang, limite = 3): Promise<EvtVue[]> {
  const base = { ...publie, translations: { some: { locale: lang } }, id: { not: evt.id } };

  const memeCategorie = evt.categorie
    ? await lecture(
        () => db().evenement.findMany({
          where: { ...base, category: { slug: evt.categorie!.slug } },
          select: evenementSelect,
          orderBy: [{ startAt: "desc" }],
          take: limite,
        }),
        [],
        "événements liés (même catégorie)",
      )
    : [];

  const manque = limite - memeCategorie.length;
  const complement = manque > 0
    ? await lecture(
        () => db().evenement.findMany({
          where: { ...base, id: { notIn: [evt.id, ...memeCategorie.map((r) => r.id)] } },
          select: evenementSelect,
          orderBy: [{ startAt: "desc" }],
          take: manque,
        }),
        [],
        "événements liés (complément)",
      )
    : [];

  return [...memeCategorie, ...complement]
    .map((row) => toVue(row as LigneEvenement, lang))
    .filter((v): v is EvtVue => v !== null);
}

/**
 * Événement précédent / suivant, dans l'ordre du CALENDRIER et non de la
 * publication : c'est l'ordre dans lequel un visiteur parcourt un agenda.
 */
export async function voisinsEvenement(
  evt: EvtVue,
  lang: Lang,
): Promise<{ precedent: EvtVue | null; suivant: EvtVue | null }> {
  const base = { ...publie, translations: { some: { locale: lang } }, id: { not: evt.id } };

  const [plusTot, plusTard] = await lecture(
    () => Promise.all([
      db().evenement.findFirst({
        where: { ...base, startAt: { lt: evt.start } },
        select: evenementSelect,
        orderBy: [{ startAt: "desc" }],
      }),
      db().evenement.findFirst({
        where: { ...base, startAt: { gt: evt.start } },
        select: evenementSelect,
        orderBy: [{ startAt: "asc" }],
      }),
    ]),
    [null, null],
    "événement précédent / suivant",
  );

  return {
    precedent: plusTot ? toVue(plusTot as LigneEvenement, lang) : null,
    suivant: plusTard ? toVue(plusTard as LigneEvenement, lang) : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Agrégats                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Nombre d'événements à venir — indicateur du tableau de bord.
 *
 * La borne est `finEffective >= maintenant`, qui n'existe pas en SQL : on
 * compte donc sur les seules lignes dont le début est postérieur à hier, puis
 * on applique la règle exacte. Le volume interdit que ce soit coûteux.
 */
export async function compterAVenir(): Promise<number> {
  const now = new Date();
  const depuis = new Date(now.getTime() - 36 * 3600 * 1000);

  const rows = await lecture(
    () => db().evenement.findMany({
      where: { ...publie, startAt: { gte: depuis } },
      select: { startAt: true, endAt: true },
    }),
    [],
    "compteur d'événements à venir",
  );

  return rows.filter((row) => finEffective(row.startAt, row.endAt).getTime() >= now.getTime()).length;
}

/**
 * Toutes les URL d'événements servies, pour `app/sitemap.ts`.
 * Ne lève pas : un sitemap amputé vaut mieux qu'une 500 sur `/sitemap.xml`.
 */
export async function urlsEvenements(): Promise<{ locale: Lang; slug: string; updatedAt: Date }[]> {
  try {
    const rows = await lecture(
      () => db().evenementTranslation.findMany({
        where: { evenement: publie },
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
    console.error(`[events] sitemap : lecture des événements impossible. ${describeError(error)}`);
    return [];
  }
}
