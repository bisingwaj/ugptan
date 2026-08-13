/**
 * Chargement des données de la fiche d'événement.
 *
 * Partagé par l'écran de création et par celui de modification : les deux
 * affichent les mêmes champs, l'un sur une fiche vierge, l'autre sur une fiche
 * relue en base. Regrouper les requêtes ici évite que les deux écrans divergent
 * au premier champ ajouté. Même rôle que `lib/actus/edition.ts` côté articles.
 */
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { formatDateTime, toDateTimeLocal } from "@/lib/format";
import { mediaSrc, type MediaRef } from "@/lib/medias";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { media as registre } from "@/content/media";
import { composantes } from "@/content/data";
import type { ImgKey } from "@/content/types";
import type {
  EvenementSaisie, ReferentielsEvtSaisie, TraductionEvtSaisie,
} from "@/lib/events/saisie";
import type { EvenementMode, EvenementStatut } from "@/lib/events/statut";

/** ⚠️ `data` exclu : cf. le commentaire de lib/actus/query.ts. */
const mediaSelect = {
  id: true, filename: true, mimeType: true, size: true,
  width: true, height: true, url: true, altFr: true, altEn: true, legende: true,
} as const;

export type ReferentielsEvt = { referentiels: ReferentielsEvtSaisie; assets: MediaRef[] };

/** Listes déroulantes et bibliothèque, communes aux deux écrans de la fiche. */
export async function chargerReferentielsEvt(): Promise<ReferentielsEvt> {
  // Reprise sur panne de liaison : le transport vers Neon échoue par salves, et
  // une salve d'une demi-seconde ne doit pas faire tomber l'écran d'édition
  // (cf. lib/lecture.ts). Sans repli — une fiche vide s'écraserait elle-même au
  // premier enregistrement.
  const [categories, assets] = await lectureConsole(
    () => Promise.all([
      db().evenementCategory.findMany({
        select: { id: true, nomFr: true },
        orderBy: [{ position: "asc" }, { nomFr: "asc" }],
      }),
      db().mediaAsset.findMany({ select: mediaSelect, orderBy: { createdAt: "desc" }, take: 300 }),
    ]),
    "référentiels d'événements",
  );

  return {
    referentiels: {
      categories: categories.map((item) => ({ id: item.id, nom: item.nomFr })),
      composantes: composantes.map((composante) => ({ code: composante.code, titre: composante.titre.fr })),
    },
    assets,
  };
}

/** Une langue est-elle servie au public ? Un titre et un lieu suffisent
 *  (cf. le commentaire de `TraductionEvtSaisie.complete`). */
export const traductionEvtComplete = (t: { title: string; lieu: string | null }): boolean =>
  t.title.trim().length > 0 && (t.lieu ?? "").trim().length > 0;

const traductionVide = (): TraductionEvtSaisie => ({
  title: "", slug: "", excerpt: "", content: "",
  lieu: "", adresse: "", places: "", infos: "",
  seoTitle: "", seoDescription: "", coverAlt: "",
  existe: false, complete: false, majLe: null,
});

const traductionsVides = (): Record<Lang, TraductionEvtSaisie> =>
  Object.fromEntries(LOCALES.map((lang) => [lang, traductionVide()])) as Record<Lang, TraductionEvtSaisie>;

/**
 * Fiche vierge — écran « Nouvel événement ».
 *
 * `startAt` reste vide : proposer une date par défaut ferait publier des
 * rencontres datées d'aujourd'hui par simple inattention.
 */
export const evenementVierge = (): EvenementSaisie => ({
  id: null,
  status: "DRAFT",
  startAt: "",
  endAt: "",
  allDay: false,
  mode: "PRESENTIEL",
  featured: false,
  color: "",
  categoryId: "",
  coverMediaId: "",
  coverKey: "",
  coverSrc: "",
  registrationUrl: "",
  externalUrl: "",
  onlineUrl: "",
  organiserName: "",
  organiserEmail: "",
  organiserPhone: "",
  organiserUrl: "",
  comps: [],
  traductions: traductionsVides(),
});

/**
 * Fiche relue en base, projetée dans la forme attendue par les formulaires.
 *
 * Le type de retour resserre `id` sur `string` : `EvenementSaisie.id` est
 * nullable pour couvrir la fiche vierge, mais une fiche relue en a forcément
 * un — sans quoi l'écran d'édition devrait tester partout un cas impossible.
 */
export async function chargerEvenement(id: string): Promise<(EvenementSaisie & { id: string }) | null> {
  // Même reprise que ci-dessus : une salve de liaison ne doit pas transformer
  // l'ouverture d'une fiche en page d'erreur (cf. lib/lecture.ts).
  const evenement = await lectureConsole(
    () => db().evenement.findUnique({
      where: { id },
      select: {
        id: true, status: true, startAt: true, endAt: true, allDay: true, mode: true,
        featured: true, color: true, categoryId: true, coverKey: true, coverMediaId: true,
        registrationUrl: true, externalUrl: true, onlineUrl: true,
        organiserName: true, organiserEmail: true, organiserPhone: true, organiserUrl: true,
        comps: true,
        coverMedia: { select: mediaSelect },
        translations: {
          select: {
            locale: true, title: true, slug: true, excerpt: true, contentHtml: true,
            lieu: true, adresse: true, places: true, infos: true,
            seoTitle: true, seoDescription: true, coverAlt: true, updatedAt: true,
          },
        },
      },
    }),
    `fiche d'événement « ${id} »`,
  );

  if (!evenement) return null;

  // Toutes les langues du site sont présentes, y compris celles qui n'ont
  // encore aucune ligne : c'est ce qui permet à l'onglet d'annoncer « à
  // traduire » plutôt que de disparaître.
  const traductions = traductionsVides();
  for (const tr of evenement.translations) {
    if (!LOCALES.includes(tr.locale as Lang)) continue;
    traductions[tr.locale as Lang] = {
      title: tr.title,
      slug: tr.slug,
      excerpt: tr.excerpt ?? "",
      content: tr.contentHtml,
      lieu: tr.lieu ?? "",
      adresse: tr.adresse ?? "",
      places: tr.places ?? "",
      infos: tr.infos ?? "",
      seoTitle: tr.seoTitle ?? "",
      seoDescription: tr.seoDescription ?? "",
      coverAlt: tr.coverAlt ?? "",
      existe: true,
      complete: traductionEvtComplete(tr),
      majLe: formatDateTime(tr.updatedAt),
    };
  }

  const cle = evenement.coverKey as ImgKey | null;
  const coverSrc = evenement.coverMedia
    ? mediaSrc(evenement.coverMedia)
    : cle && cle in registre.img
      ? registre.img[cle]
      : "";

  return {
    id: evenement.id,
    status: evenement.status as EvenementStatut,
    startAt: toDateTimeLocal(evenement.startAt),
    endAt: toDateTimeLocal(evenement.endAt),
    allDay: evenement.allDay,
    mode: evenement.mode as EvenementMode,
    featured: evenement.featured,
    color: evenement.color ?? "",
    categoryId: evenement.categoryId ?? "",
    coverMediaId: evenement.coverMediaId ?? "",
    coverKey: evenement.coverKey ?? "",
    coverSrc,
    registrationUrl: evenement.registrationUrl ?? "",
    externalUrl: evenement.externalUrl ?? "",
    onlineUrl: evenement.onlineUrl ?? "",
    organiserName: evenement.organiserName ?? "",
    organiserEmail: evenement.organiserEmail ?? "",
    organiserPhone: evenement.organiserPhone ?? "",
    organiserUrl: evenement.organiserUrl ?? "",
    comps: evenement.comps,
    traductions,
  };
}
