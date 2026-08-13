/**
 * Couche de lecture de « Histoires & impact » — l'unique porte d'entrée du site
 * public vers les tables `ImpactSection` / `ImpactItem`.
 *
 * Trois invariants, dans cet ordre de priorité.
 *
 * ─── 1. Rien ne sort qui ne soit publié ──────────────────────────────────────
 * Le filtre s'applique à la section ET à chacune de ses entrées : masquer une
 * carte d'une grille est un geste courant de la rédaction (un témoignage à
 * revoir, un chiffre à confirmer), il ne doit pas obliger à retirer la section.
 *
 * ─── 2. Rien ne sort dans la mauvaise langue ─────────────────────────────────
 * Une entrée dont la traduction manque disparaît de la version concernée, comme
 * pour les actualités et les événements. Une section sans aucune entrée servie,
 * ou dont l'en-tête n'est pas traduit, ne s'affiche pas du tout : mieux vaut un
 * bloc absent qu'un bloc à trous, ou un titre français sur la version anglaise.
 *
 * ─── 3. Le dessin des pages ne dépend pas de l'état de la base ───────────────
 * Tant qu'AUCUNE section publiée n'existe pour un emplacement, le contenu
 * d'origine du site prend le relais (cf. src/content/impact.ts). C'est ce qui
 * permet de livrer le module sans vider trois pages publiques en attendant que
 * quelqu'un ouvre la console. Dès qu'une section publiée existe pour un
 * emplacement, la base fait foi seule : le repli ne vient jamais compléter un
 * contenu administré, il le remplace ou s'efface.
 */
import { db } from "@/lib/db";
import { lecteur } from "@/lib/lecture";
import { couverture, type MediaRef, type Visuel } from "@/lib/medias";
import { formatArticleDate } from "@/lib/format";
import type { Lang } from "@/lib/pick";
import {
  impactSeed, seedItems, seedPourEmplacement,
  type ImpactSeedItem, type ImpactSeedSection,
} from "@/content/impact";
import {
  itemTraduit, sectionTraduite,
  type ImpactEmplacement, type ImpactLayout, type ImpactTheme,
} from "@/lib/impact/statut";

const lecture = lecteur("impact");

/* -------------------------------------------------------------------------- */
/* Sélections Prisma                                                           */
/* -------------------------------------------------------------------------- */

/** ⚠️ `data` est volontairement absent : cf. le commentaire de lib/actus/query.ts. */
const mediaSelect = {
  id: true, filename: true, mimeType: true, size: true,
  width: true, height: true, url: true, altFr: true, altEn: true, legende: true,
} as const;

const itemSelect = {
  id: true,
  position: true,
  status: true,
  featured: true,
  valeur: true,
  color: true,
  videoYt: true,
  lienUrl: true,
  dateAt: true,
  coverKey: true,
  coverMedia: { select: mediaSelect },
  translations: {
    select: {
      locale: true, surtitre: true, titre: true, texte: true,
      texteSecondaire: true, lienLabel: true, mediaAlt: true,
    },
  },
} as const;

const sectionSelect = {
  id: true,
  key: true,
  emplacement: true,
  layout: true,
  theme: true,
  position: true,
  numero: true,
  compact: true,
  grandTitre: true,
  ctaUrl: true,
  limite: true,
  translations: { select: { locale: true, kicker: true, titre: true, lead: true, ctaLabel: true } },
  items: { where: { status: "PUBLISHED" as const }, orderBy: { position: "asc" as const }, select: itemSelect },
  /** Entrées reprises d'une autre section (cf. le commentaire du modèle). */
  source: {
    select: {
      items: { where: { status: "PUBLISHED" as const }, orderBy: { position: "asc" as const }, select: itemSelect },
    },
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Vue                                                                         */
/* -------------------------------------------------------------------------- */

/** Une entrée résolue dans une langue, prête à l'affichage. */
export type ImpactItemVue = {
  id: string;
  featured: boolean;
  /** Couleur d'accent effective, ou `null` pour l'accent du site. */
  color: string | null;
  valeur: string | null;
  videoYt: string | null;
  lienUrl: string | null;
  lienLabel: string | null;
  /** Date du jalon, déjà mise en forme dans la langue de lecture. */
  dateLabel: string | null;
  visuel: Visuel | null;
  surtitre: string | null;
  titre: string | null;
  texte: string | null;
  texteSecondaire: string | null;
};

/** Une section résolue dans une langue, prête à l'affichage. */
export type ImpactSectionVue = {
  id: string;
  key: string;
  layout: ImpactLayout;
  theme: ImpactTheme;
  numero: string | null;
  compact: boolean;
  grandTitre: boolean;
  kicker: string | null;
  titre: string | null;
  lead: string | null;
  /** Lien du bouton d'en-tête, déjà préfixé de la langue s'il est interne. */
  ctaHref: string | null;
  ctaLabel: string | null;
  items: ImpactItemVue[];
};

/* -------------------------------------------------------------------------- */
/* Résolution                                                                  */
/* -------------------------------------------------------------------------- */

const vide = (valeur: string | null | undefined): string | null => {
  const texte = (valeur ?? "").trim();
  return texte.length > 0 ? texte : null;
};

/**
 * Destination du bouton d'en-tête.
 *
 * Un chemin interne est stocké SANS langue (« /projet ») et préfixé ici : la
 * même section sert les deux versions du site, et y figer « /fr/projet »
 * enverrait un lecteur anglophone sur la version française. Une adresse
 * complète part telle quelle.
 */
function href(ctaUrl: string | null, lang: Lang): string | null {
  const url = vide(ctaUrl);
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith("mailto:") || url.startsWith("tel:")) return url;
  return url.startsWith("/") ? `/${lang}${url === "/" ? "" : url}` : url;
}

type ItemBrut = {
  id: string;
  featured: boolean;
  valeur: string | null;
  color: string | null;
  videoYt: string | null;
  lienUrl: string | null;
  dateAt: Date | null;
  coverKey: string | null;
  coverMedia: MediaRef | null;
  translations: {
    locale: string; surtitre: string | null; titre: string | null; texte: string | null;
    texteSecondaire: string | null; lienLabel: string | null; mediaAlt: string | null;
  }[];
};

/** `null` quand la langue n'est pas servie pour cette entrée. */
function resoudreItem(item: ItemBrut, layout: ImpactLayout, lang: Lang): ImpactItemVue | null {
  const tr = item.translations.find((t) => t.locale === lang);
  if (!tr || !itemTraduit(layout, tr)) return null;

  const titre = vide(tr.titre);
  const visuel = item.coverMedia || item.coverKey
    ? couverture(
        { coverMedia: item.coverMedia, coverKey: item.coverKey, coverAlt: tr.mediaAlt },
        lang,
        titre ?? "",
      )
    : null;

  return {
    id: item.id,
    featured: item.featured,
    color: vide(item.color),
    valeur: vide(item.valeur),
    videoYt: vide(item.videoYt),
    lienUrl: vide(item.lienUrl),
    lienLabel: vide(tr.lienLabel),
    // Un libellé saisi prime sur la date du calendrier : « T1 2026 » n'est pas
    // un jour, et le forcer à en devenir un donnerait une date fausse.
    dateLabel: vide(tr.surtitre) ?? (item.dateAt ? formatArticleDate(item.dateAt, lang) : null),
    visuel: visuel && visuel.src ? visuel : null,
    surtitre: vide(tr.surtitre),
    titre,
    texte: vide(tr.texte),
    texteSecondaire: vide(tr.texteSecondaire),
  };
}

type SectionBrute = {
  id: string; key: string; layout: string; theme: string; numero: string | null;
  compact: boolean; grandTitre: boolean; ctaUrl: string | null; limite: number | null;
  translations: { locale: string; kicker: string | null; titre: string | null; lead: string | null; ctaLabel: string | null }[];
  items: ItemBrut[];
  source: { items: ItemBrut[] } | null;
};

/** `null` quand la section n'a rien à servir dans cette langue. */
function resoudreSection(section: SectionBrute, lang: Lang): ImpactSectionVue | null {
  const tr = section.translations.find((t) => t.locale === lang);
  if (!tr || !sectionTraduite(tr)) return null;

  const layout = section.layout as ImpactLayout;
  // Une section qui reprend une autre n'a pas d'entrées propres : c'est la
  // source qui fait foi, et l'ordre est celui de la source.
  const source = section.source ? section.source.items : section.items;
  const resolus = source
    .map((item) => resoudreItem(item, layout, lang))
    .filter((item): item is ImpactItemVue => item !== null);

  const items = section.limite && section.limite > 0 ? resolus.slice(0, section.limite) : resolus;
  // Une grille vide laisserait un en-tête suivi de rien : la section entière
  // s'efface plutôt que d'annoncer un contenu absent.
  if (items.length === 0) return null;

  const ctaHref = href(section.ctaUrl, lang);
  const ctaLabel = vide(tr.ctaLabel);

  return {
    id: section.id,
    key: section.key,
    layout,
    theme: section.theme as ImpactTheme,
    numero: vide(section.numero),
    compact: section.compact,
    grandTitre: section.grandTitre,
    kicker: vide(tr.kicker),
    titre: vide(tr.titre),
    lead: vide(tr.lead),
    // Le bouton n'a de sens qu'avec ses deux moitiés : une adresse sans libellé
    // ne se clique pas, un libellé sans adresse ne mène nulle part.
    ctaHref: ctaHref && ctaLabel ? ctaHref : null,
    ctaLabel: ctaHref && ctaLabel ? ctaLabel : null,
    items,
  };
}

/* -------------------------------------------------------------------------- */
/* Repli sur le contenu d'origine                                              */
/* -------------------------------------------------------------------------- */

const seedTextes = (item: ImpactSeedItem, lang: Lang) => (lang === "en" ? item.en : item.fr);

function resoudreSeedItem(item: ImpactSeedItem, index: number, lang: Lang): ImpactItemVue {
  const textes = seedTextes(item, lang);
  const visuel = item.coverKey
    ? couverture({ coverKey: item.coverKey, coverAlt: textes.mediaAlt }, lang, textes.titre ?? "")
    : null;

  return {
    id: `seed-${index}`,
    featured: false,
    color: item.color ?? null,
    valeur: item.valeur ?? null,
    videoYt: item.videoYt ?? null,
    lienUrl: item.lienUrl ?? null,
    lienLabel: textes.lienLabel ?? null,
    dateLabel: textes.surtitre ?? (item.dateISO ? formatArticleDate(new Date(item.dateISO), lang) : null),
    visuel: visuel && visuel.src ? visuel : null,
    surtitre: textes.surtitre ?? null,
    titre: textes.titre ?? null,
    texte: textes.texte ?? null,
    texteSecondaire: textes.texteSecondaire ?? null,
  };
}

function resoudreSeedSection(section: ImpactSeedSection, lang: Lang): ImpactSectionVue | null {
  const entete = lang === "en" ? section.en : section.fr;
  const items = seedItems(section).map((item, index) => resoudreSeedItem(item, index, lang));
  if (items.length === 0) return null;

  const ctaHref = href(section.ctaUrl ?? null, lang);

  return {
    id: section.key,
    key: section.key,
    layout: section.layout,
    theme: section.theme,
    numero: section.numero ?? null,
    compact: section.compact ?? false,
    grandTitre: section.grandTitre ?? false,
    kicker: entete.kicker ?? null,
    titre: entete.titre ?? null,
    lead: entete.lead ?? null,
    ctaHref: ctaHref && entete.ctaLabel ? ctaHref : null,
    ctaLabel: ctaHref && entete.ctaLabel ? entete.ctaLabel : null,
    items,
  };
}

/* -------------------------------------------------------------------------- */
/* Lecture                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Sections publiées d'un emplacement, résolues dans une langue.
 *
 * Le repli sur le contenu d'origine se décide sur la présence d'une section
 * publiée EN BASE, avant résolution linguistique : sans cela, une section
 * publiée mais non traduite en anglais ferait ressurgir le contenu d'origine
 * sur la seule version anglaise, et les deux pages ne diraient plus la même
 * chose sans que personne l'ait décidé.
 */
export async function sectionsImpact(
  emplacement: ImpactEmplacement,
  lang: Lang,
): Promise<ImpactSectionVue[]> {
  const sections = await lecture(
    () => db().impactSection.findMany({
      where: { emplacement, status: "PUBLISHED" },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: sectionSelect,
    }),
    [],
    `sections « ${emplacement} »`,
  );

  if (sections.length === 0) {
    return seedPourEmplacement(emplacement)
      .map((section) => resoudreSeedSection(section, lang))
      .filter((section): section is ImpactSectionVue => section !== null);
  }

  return sections
    .map((section) => resoudreSection(section as SectionBrute, lang))
    .filter((section): section is ImpactSectionVue => section !== null);
}

/** Toutes les clés d'amorçage, pour la reprise en console. */
export const clesAmorcage = (): string[] => impactSeed.map((section) => section.key);
