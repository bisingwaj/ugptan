/**
 * Chargement des données de la fiche « Histoires & impact » pour la console.
 *
 * Partagé par l'écran de création et par celui de modification, comme
 * `lib/events/edition.ts` : les deux affichent les mêmes réglages, l'un sur une
 * fiche vierge, l'autre sur une fiche relue en base. Regrouper les requêtes ici
 * évite que les deux écrans divergent au premier champ ajouté.
 */
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { formatDateTime } from "@/lib/format";
import { mediaSrc, type MediaRef } from "@/lib/medias";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { media as registre } from "@/content/media";
import type { ImgKey } from "@/content/types";
import type {
  ItemSaisie, ReferentielsImpact, SectionSaisie,
  TraductionItemSaisie, TraductionSectionSaisie,
} from "@/lib/impact/saisie";
import {
  IMPACT_LAYOUT_LABEL, itemTraduit, sectionTraduite,
  type ImpactEmplacement, type ImpactLayout, type ImpactStatut, type ImpactTheme,
} from "@/lib/impact/statut";

/** ⚠️ `data` exclu : cf. le commentaire de lib/actus/query.ts. */
const mediaSelect = {
  id: true, filename: true, mimeType: true, size: true,
  width: true, height: true, url: true, publicId: true, altFr: true, altEn: true, legende: true,
} as const;

/* -------------------------------------------------------------------------- */
/* Fiches vierges                                                              */
/* -------------------------------------------------------------------------- */

const traductionSectionVide = (): TraductionSectionSaisie => ({
  kicker: "", titre: "", lead: "", ctaLabel: "", note: "",
  existe: false, complete: false, majLe: null,
});

const traductionItemVide = (): TraductionItemSaisie => ({
  surtitre: "", titre: "", texte: "", texteSecondaire: "", lienLabel: "", mediaAlt: "",
  existe: false, complete: false, majLe: null,
});

const parLangue = <T,>(fabrique: () => T): Record<Lang, T> =>
  Object.fromEntries(LOCALES.map((lang) => [lang, fabrique()])) as Record<Lang, T>;

/** Fiche vierge — écran « Nouvelle section ». */
export const sectionVierge = (): SectionSaisie => ({
  id: null,
  key: "",
  emplacement: "ACCUEIL_IMPACT",
  layout: "STATS",
  theme: "CLAIR",
  status: "DRAFT",
  position: 0,
  numero: "",
  compact: false,
  grandTitre: false,
  ctaUrl: "",
  enchaine: false,
  sourceId: "",
  limite: 0,
  traductions: parLangue(traductionSectionVide),
  items: [],
});

/* -------------------------------------------------------------------------- */
/* Référentiels                                                                */
/* -------------------------------------------------------------------------- */

export type ReferentielsImpactComplets = {
  referentiels: ReferentielsImpact;
  assets: MediaRef[];
};

/**
 * Sources possibles et bibliothèque de médias.
 *
 * `exclureId` retire la section courante de la liste des sources : une section
 * qui se reprendrait elle-même n'afficherait jamais rien, la lecture allant
 * chercher les entrées de la source et la source n'en ayant pas.
 */
export async function chargerReferentielsImpact(exclureId?: string): Promise<ReferentielsImpactComplets> {
  const [sections, assets] = await lectureConsole(
    () => Promise.all([
      db().impactSection.findMany({
        // Une source ne peut pas elle-même reprendre une autre section : la
        // chaîne s'arrêterait au premier maillon vide. Le filtre le dit ici
        // plutôt que de laisser construire un renvoi qui n'affiche rien.
        where: { sourceId: null, ...(exclureId ? { id: { not: exclureId } } : {}) },
        select: {
          id: true, layout: true,
          translations: { where: { locale: "fr" }, select: { kicker: true, titre: true } },
          _count: { select: { items: true } },
        },
        orderBy: [{ emplacement: "asc" }, { position: "asc" }],
      }),
      db().mediaAsset.findMany({ select: mediaSelect, orderBy: { createdAt: "desc" }, take: 300 }),
    ]),
    "référentiels de « Histoires & impact »",
  );

  return {
    referentiels: {
      sources: sections
        .filter((section) => section._count.items > 0)
        .map((section) => ({
          id: section.id,
          nom: section.translations[0]?.titre || section.translations[0]?.kicker || "(sans titre)",
          layout: IMPACT_LAYOUT_LABEL[section.layout as ImpactLayout],
          items: section._count.items,
        })),
    },
    assets,
  };
}

/* -------------------------------------------------------------------------- */
/* Fiche relue                                                                 */
/* -------------------------------------------------------------------------- */

/** Date d'un jalon au format `<input type="date">`, heure de Kinshasa. */
const toDateInput = (date: Date | null): string =>
  date
    ? new Intl.DateTimeFormat("sv-SE", {
        year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Africa/Kinshasa",
      }).format(date)
    : "";

/**
 * Fiche relue en base, projetée dans la forme attendue par les formulaires.
 *
 * Le type de retour resserre `id` sur `string` : `SectionSaisie.id` est nullable
 * pour couvrir la fiche vierge, mais une fiche relue en a forcément un.
 */
export async function chargerSectionImpact(
  id: string,
): Promise<(SectionSaisie & { id: string }) | null> {
  const section = await lectureConsole(
    () => db().impactSection.findUnique({
      where: { id },
      select: {
        id: true, key: true, emplacement: true, layout: true, theme: true, status: true,
        position: true, numero: true, compact: true, grandTitre: true, enchaine: true, ctaUrl: true,
        sourceId: true, limite: true,
        translations: {
          select: { locale: true, kicker: true, titre: true, lead: true, ctaLabel: true, note: true, updatedAt: true },
        },
        items: {
          orderBy: { position: "asc" },
          select: {
            id: true, position: true, status: true, featured: true, valeur: true, color: true,
            videoYt: true, lienUrl: true, dateAt: true, tags: true, coverKey: true, coverMediaId: true,
            coverMedia: { select: mediaSelect },
            translations: {
              select: {
                locale: true, surtitre: true, titre: true, texte: true,
                texteSecondaire: true, lienLabel: true, mediaAlt: true, updatedAt: true,
              },
            },
          },
        },
      },
    }),
    `section « ${id} » de « Histoires & impact »`,
  );

  if (!section) return null;

  const layout = section.layout as ImpactLayout;

  // Toutes les langues du site sont présentes, y compris celles qui n'ont
  // encore aucune ligne : c'est ce qui permet à l'onglet d'annoncer « à
  // traduire » plutôt que de disparaître.
  const traductions = parLangue(traductionSectionVide);
  for (const tr of section.translations) {
    if (!LOCALES.includes(tr.locale as Lang)) continue;
    traductions[tr.locale as Lang] = {
      kicker: tr.kicker ?? "",
      titre: tr.titre ?? "",
      lead: tr.lead ?? "",
      ctaLabel: tr.ctaLabel ?? "",
      note: tr.note ?? "",
      existe: true,
      complete: sectionTraduite(tr, section),
      majLe: formatDateTime(tr.updatedAt),
    };
  }

  const items: ItemSaisie[] = section.items.map((item) => {
    const tradsItem = parLangue(traductionItemVide);
    for (const tr of item.translations) {
      if (!LOCALES.includes(tr.locale as Lang)) continue;
      tradsItem[tr.locale as Lang] = {
        surtitre: tr.surtitre ?? "",
        titre: tr.titre ?? "",
        texte: tr.texte ?? "",
        texteSecondaire: tr.texteSecondaire ?? "",
        lienLabel: tr.lienLabel ?? "",
        mediaAlt: tr.mediaAlt ?? "",
        existe: true,
        complete: itemTraduit(layout, tr),
        majLe: formatDateTime(tr.updatedAt),
      };
    }

    const cle = item.coverKey as ImgKey | null;
    const coverSrc = item.coverMedia
      ? mediaSrc(item.coverMedia)
      : cle && cle in registre.img
        ? registre.img[cle]
        : "";

    return {
      id: item.id,
      position: item.position,
      status: item.status as ImpactStatut,
      featured: item.featured,
      valeur: item.valeur ?? "",
      color: item.color ?? "",
      videoYt: item.videoYt ?? "",
      lienUrl: item.lienUrl ?? "",
      dateAt: toDateInput(item.dateAt),
      // Une pastille par ligne, comme dans le formulaire (cf. `lireTags`).
      tags: item.tags.join("\n"),
      coverMediaId: item.coverMediaId ?? "",
      coverKey: item.coverKey ?? "",
      coverSrc,
      traductions: tradsItem,
    };
  });

  return {
    id: section.id,
    key: section.key,
    emplacement: section.emplacement as ImpactEmplacement,
    layout,
    theme: section.theme as ImpactTheme,
    status: section.status as ImpactStatut,
    position: section.position,
    numero: section.numero ?? "",
    compact: section.compact,
    grandTitre: section.grandTitre,
    ctaUrl: section.ctaUrl ?? "",
    enchaine: section.enchaine,
    sourceId: section.sourceId ?? "",
    limite: section.limite ?? 0,
    traductions,
    items,
  };
}
