/**
 * Chargement des données d'une fiche d'équipe pour la console.
 *
 * Partagé par l'écran de création et par celui de modification, comme
 * `lib/impact/edition.ts` : les deux affichent les mêmes réglages, l'un sur une
 * fiche vierge, l'autre sur une fiche relue en base. Regrouper les requêtes ici
 * évite que les deux écrans divergent au premier champ ajouté.
 */
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { formatDateTime } from "@/lib/format";
import { mediaSrc, type MediaRef } from "@/lib/medias";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type {
  MembreSaisie, PoleSaisie, ReferentielsEquipe,
  TraductionMembreSaisie, TraductionPoleSaisie,
} from "@/lib/equipe/saisie";
import { membreTraduit, type TeamStatut } from "@/lib/equipe/statut";

/** ⚠️ `data` exclu : cf. le commentaire de lib/actus/query.ts. */
const mediaSelect = {
  id: true, filename: true, mimeType: true, size: true,
  width: true, height: true, url: true, publicId: true, altFr: true, altEn: true, legende: true,
} as const;

/* -------------------------------------------------------------------------- */
/* Fiches vierges                                                              */
/* -------------------------------------------------------------------------- */

const traductionMembreVide = (): TraductionMembreSaisie => ({
  nom: "", role: "", mandat: "", bio: "", verbatim: "",
  existe: false, complete: false, majLe: null,
});

const parLangue = <T,>(fabrique: () => T): Record<Lang, T> =>
  Object.fromEntries(LOCALES.map((lang) => [lang, fabrique()])) as Record<Lang, T>;

/** Fiche vierge — écran « Nouveau membre ». */
export const membreVierge = (): MembreSaisie => ({
  id: null,
  key: "",
  nom: "",
  status: "DRAFT",
  position: 0,
  featured: false,
  color: "",
  email: "",
  composante: "",
  poleId: "",
  photoMediaId: "",
  photoPath: "",
  photoSrc: "",
  traductions: parLangue(traductionMembreVide),
});

/* -------------------------------------------------------------------------- */
/* Référentiels                                                                */
/* -------------------------------------------------------------------------- */

export type ReferentielsEquipeComplets = {
  referentiels: ReferentielsEquipe;
  assets: MediaRef[];
};

/**
 * Pôles disponibles et bibliothèque de médias.
 *
 * La bibliothèque est bornée aux 300 derniers dépôts, comme ailleurs dans la
 * console : c'est un sélecteur de portrait, pas un explorateur de fichiers.
 */
export async function chargerReferentielsEquipe(): Promise<ReferentielsEquipeComplets> {
  const [poles, assets] = await lectureConsole(
    () => Promise.all([
      db().teamPole.findMany({
        select: {
          id: true,
          translations: { where: { locale: "fr" }, select: { nom: true } },
        },
        orderBy: [{ position: "asc" }],
      }),
      db().mediaAsset.findMany({ select: mediaSelect, orderBy: { createdAt: "desc" }, take: 300 }),
    ]),
    "référentiels de « L'équipe de l'Unité »",
  );

  return {
    referentiels: {
      poles: poles.map((pole) => ({
        id: pole.id,
        nom: pole.translations[0]?.nom || "(pôle sans nom)",
      })),
    },
    assets,
  };
}

/* -------------------------------------------------------------------------- */
/* Fiche relue                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Fiche relue en base, projetée dans la forme attendue par les formulaires.
 *
 * Le type de retour resserre `id` sur `string` : `MembreSaisie.id` est nullable
 * pour couvrir la fiche vierge, mais une fiche relue en a forcément un.
 */
export async function chargerMembre(id: string): Promise<(MembreSaisie & { id: string }) | null> {
  const membre = await lectureConsole(
    () => db().teamMember.findUnique({
      where: { id },
      select: {
        id: true, key: true, nom: true, status: true, position: true, featured: true,
        color: true, email: true, composante: true, poleId: true,
        photoMediaId: true, photoPath: true,
        photoMedia: { select: mediaSelect },
        translations: {
          select: {
            locale: true, nom: true, role: true, mandat: true,
            bio: true, verbatim: true, updatedAt: true,
          },
        },
      },
    }),
    `fiche « ${id} » de l'équipe`,
  );

  if (!membre) return null;

  // Toutes les langues du site sont présentes, y compris celles qui n'ont
  // encore aucune ligne : c'est ce qui permet à l'onglet d'annoncer « à
  // traduire » plutôt que de disparaître.
  const traductions = parLangue(traductionMembreVide);
  for (const tr of membre.translations) {
    if (!LOCALES.includes(tr.locale as Lang)) continue;
    traductions[tr.locale as Lang] = {
      nom: tr.nom ?? "",
      role: tr.role ?? "",
      mandat: tr.mandat ?? "",
      bio: tr.bio ?? "",
      verbatim: tr.verbatim ?? "",
      existe: true,
      complete: membreTraduit([{ locale: tr.locale, role: tr.role }], tr.locale),
      majLe: formatDateTime(tr.updatedAt),
    };
  }

  return {
    id: membre.id,
    key: membre.key,
    nom: membre.nom ?? "",
    status: membre.status as TeamStatut,
    position: membre.position,
    featured: membre.featured,
    color: membre.color ?? "",
    email: membre.email ?? "",
    composante: membre.composante ?? "",
    poleId: membre.poleId ?? "",
    photoMediaId: membre.photoMediaId ?? "",
    photoPath: membre.photoPath ?? "",
    photoSrc: membre.photoMedia ? mediaSrc(membre.photoMedia) : membre.photoPath ?? "",
    traductions,
  };
}

/* -------------------------------------------------------------------------- */
/* Pôles                                                                       */
/* -------------------------------------------------------------------------- */

const traductionPoleVide = (): TraductionPoleSaisie => ({
  nom: "", mission: "", existe: false, majLe: null,
});

/** Tous les pôles, pour l'écran qui les administre. */
export async function chargerPoles(): Promise<PoleSaisie[]> {
  const poles = await lectureConsole(
    () => db().teamPole.findMany({
      select: {
        id: true, key: true, position: true, color: true,
        translations: { select: { locale: true, nom: true, mission: true, updatedAt: true } },
        _count: { select: { membres: true } },
      },
      orderBy: [{ position: "asc" }],
    }),
    "pôles de l'équipe",
  );

  return poles.map((pole) => {
    const traductions = parLangue(traductionPoleVide);
    for (const tr of pole.translations) {
      if (!LOCALES.includes(tr.locale as Lang)) continue;
      traductions[tr.locale as Lang] = {
        nom: tr.nom ?? "",
        mission: tr.mission ?? "",
        existe: true,
        majLe: formatDateTime(tr.updatedAt),
      };
    }

    return {
      id: pole.id,
      key: pole.key,
      position: pole.position,
      color: pole.color ?? "",
      membres: pole._count.membres,
      traductions,
    };
  });
}
