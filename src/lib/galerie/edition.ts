/**
 * Chargement des données de la fiche d'une entrée de galerie.
 *
 * Partagé par l'écran de dépôt et par celui de modification : les deux affichent
 * les mêmes champs, l'un sur une fiche vierge, l'autre sur une fiche relue en
 * base. Même rôle que `lib/docs/edition.ts` côté documents.
 */
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { formatDateTime, toDateInput } from "@/lib/format";
import { referentielComposantes } from "@/lib/projet/query";
import type { AlbumSaisie, GalerieSaisie, ReferentielsGalerieSaisie } from "@/lib/galerie/saisie";
import type { GalerieStatut, GalerieTypeMedia } from "@/lib/galerie/statut";

/** Listes déroulantes, communes aux écrans de la fiche. */
export async function chargerReferentielsGalerie(): Promise<ReferentielsGalerieSaisie> {
  // Reprise sur panne de liaison : le transport vers Neon échoue par salves, et
  // une salve d'une demi-seconde ne doit pas faire tomber l'écran d'édition
  // (cf. lib/lecture.ts).
  const [categories, albums] = await lectureConsole(
    () => Promise.all([
      db().galerieCategory.findMany({
        select: { id: true, nomFr: true },
        orderBy: [{ position: "asc" }, { nomFr: "asc" }],
      }),
      /* Tous les albums, publiés ou non : on range une photographie dans un
         reportage en cours de préparation, c'est même le cas courant. */
      db().galerieAlbum.findMany({
        select: { id: true, titreFr: true, dateAt: true },
        orderBy: [{ dateAt: { sort: "desc", nulls: "last" } }, { titreFr: "asc" }],
      }),
    ]),
    "référentiels de la galerie",
  );

  return {
    categories: categories.map((item) => ({ id: item.id, nom: item.nomFr })),
    composantes: await referentielComposantes(),
    // L'année accompagne le titre : deux éditions d'un même atelier portent le
    // même nom, et seule la date les distingue dans une liste déroulante.
    albums: albums.map((album) => ({
      id: album.id,
      nom: album.dateAt
        ? `${album.titreFr} (${album.dateAt.toISOString().slice(0, 4)})`
        : album.titreFr,
    })),
  };
}

/**
 * Fiche vierge — écran « Ajouter un média ».
 *
 * `publishedAt` reste vide : la date de mise en ligne est posée par la première
 * publication (cf. actions/admin-galerie.ts). La proposer d'avance ferait dater
 * d'aujourd'hui des entrées mises en ligne trois semaines plus tard.
 *
 * Le `type` est paramétré parce que les deux écrans de dépôt ne demandent pas
 * tout à fait la même chose : une vidéo accepte une vignette d'attente en plus
 * de son fichier. Le choix se fait AVANT le formulaire, pas dedans.
 */
export const galerieVierge = (
  type: GalerieTypeMedia = "PHOTO",
  albumId = "",
): GalerieSaisie => ({
  id: null,
  type,
  albumId,
  status: "DRAFT",
  titreFr: "",
  titreEn: "",
  descriptionFr: "",
  descriptionEn: "",
  altFr: "",
  altEn: "",
  lieu: "",
  priseAt: "",
  publishedAt: "",
  featured: false,
  position: 0,
  categoryId: "",
  comps: [],
  visuel: null,
  video: { url: "", publicId: null, duree: null },
  majLe: null,
});

/** Champs relus pour la fiche de la console. */
const itemSelect = {
  id: true,
  type: true,
  status: true,
  titreFr: true,
  titreEn: true,
  descriptionFr: true,
  descriptionEn: true,
  altFr: true,
  altEn: true,
  lieu: true,
  priseAt: true,
  publishedAt: true,
  featured: true,
  position: true,
  categoryId: true,
  albumId: true,
  comps: true,
  imageUrl: true,
  imagePublicId: true,
  imageMime: true,
  imageWidth: true,
  imageHeight: true,
  imageSize: true,
  videoUrl: true,
  videoPublicId: true,
  videoDuree: true,
  updatedAt: true,
} as const satisfies Prisma.GalerieItemSelect;

/**
 * Fiche relue en base, projetée dans la forme attendue par les formulaires.
 *
 * Le type de retour resserre `id` sur `string` : `GalerieSaisie.id` est nullable
 * pour couvrir la fiche vierge, mais une fiche relue en a forcément un.
 */
export async function chargerGalerieItem(
  id: string,
): Promise<(GalerieSaisie & { id: string }) | null> {
  const item = await lectureConsole(
    () => db().galerieItem.findUnique({ where: { id }, select: itemSelect }),
    `fiche de galerie « ${id} »`,
  );

  if (!item) return null;

  return {
    id: item.id,
    type: item.type as GalerieTypeMedia,
    status: item.status as GalerieStatut,
    titreFr: item.titreFr,
    titreEn: item.titreEn ?? "",
    descriptionFr: item.descriptionFr ?? "",
    descriptionEn: item.descriptionEn ?? "",
    altFr: item.altFr ?? "",
    altEn: item.altEn ?? "",
    lieu: item.lieu ?? "",
    priseAt: toDateInput(item.priseAt),
    publishedAt: toDateInput(item.publishedAt),
    featured: item.featured,
    position: item.position,
    categoryId: item.categoryId ?? "",
    albumId: item.albumId ?? "",
    comps: item.comps,
    visuel: item.imageUrl
      ? {
          url: item.imageUrl,
          publicId: item.imagePublicId,
          mime: item.imageMime ?? "image/*",
          width: item.imageWidth,
          height: item.imageHeight,
          taille: item.imageSize,
        }
      : null,
    video: {
      url: item.videoUrl ?? "",
      publicId: item.videoPublicId,
      duree: item.videoDuree,
    },
    majLe: formatDateTime(item.updatedAt),
  };
}

/* -------------------------------------------------------------------------- */
/* Albums                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Fiche vierge — écran « Créer un album ».
 *
 * `publishedAt` reste vide : la date de mise en ligne est posée par la première
 * publication. `dateAt`, elle, est celle de l'ÉVÉNEMENT et se saisit.
 */
export const albumVierge = (): AlbumSaisie => ({
  id: null,
  slug: "",
  status: "DRAFT",
  titreFr: "",
  titreEn: "",
  descriptionFr: "",
  descriptionEn: "",
  lieu: "",
  dateAt: "",
  dateFin: "",
  publishedAt: "",
  featured: false,
  position: 0,
  categoryId: "",
  comps: [],
  coverItemId: "",
  total: 0,
  majLe: null,
});

const albumSelect = {
  id: true,
  slug: true,
  status: true,
  titreFr: true,
  titreEn: true,
  descriptionFr: true,
  descriptionEn: true,
  lieu: true,
  dateAt: true,
  dateFin: true,
  publishedAt: true,
  featured: true,
  position: true,
  categoryId: true,
  comps: true,
  coverItemId: true,
  updatedAt: true,
  _count: { select: { items: true } },
} as const satisfies Prisma.GalerieAlbumSelect;

/** Fiche d'album relue en base, projetée dans la forme attendue par le formulaire. */
export async function chargerAlbum(id: string): Promise<(AlbumSaisie & { id: string }) | null> {
  const album = await lectureConsole(
    () => db().galerieAlbum.findUnique({ where: { id }, select: albumSelect }),
    `fiche d'album « ${id} »`,
  );

  if (!album) return null;

  return {
    id: album.id,
    slug: album.slug,
    status: album.status as GalerieStatut,
    titreFr: album.titreFr,
    titreEn: album.titreEn ?? "",
    descriptionFr: album.descriptionFr ?? "",
    descriptionEn: album.descriptionEn ?? "",
    lieu: album.lieu ?? "",
    dateAt: toDateInput(album.dateAt),
    dateFin: toDateInput(album.dateFin),
    publishedAt: toDateInput(album.publishedAt),
    featured: album.featured,
    position: album.position,
    categoryId: album.categoryId ?? "",
    comps: album.comps,
    coverItemId: album.coverItemId ?? "",
    total: album._count.items,
    majLe: formatDateTime(album.updatedAt),
  };
}

/** Une vignette du contenu d'un album, telle que la console la dessine. */
export type ContenuAlbum = {
  id: string;
  type: GalerieTypeMedia;
  status: GalerieStatut;
  titreFr: string;
  altFr: string;
  imageUrl: string | null;
  position: number;
  featured: boolean;
  /** Cette entrée est-elle la couverture choisie de l'album ? */
  couverture: boolean;
  /** Une vidéo sans source ne peut pas être rendue visible : on le signale. */
  sansSource: boolean;
};

/**
 * Contenus d'un album, dans l'ordre d'affichage du site.
 *
 * Les entrées MASQUÉES en font partie, contrairement à la lecture publique :
 * c'est précisément l'écran où l'on décide de ce qui paraîtra, et cacher à la
 * rédaction ce qu'elle n'a pas encore publié rendrait l'album impossible à
 * préparer.
 */
export async function chargerContenuAlbum(
  albumId: string,
  coverItemId: string | null,
): Promise<ContenuAlbum[]> {
  const items = await lectureConsole(
    () => db().galerieItem.findMany({
      where: { albumId },
      select: {
        id: true, type: true, status: true, titreFr: true, altFr: true,
        imageUrl: true, position: true, featured: true, videoUrl: true,
      },
      orderBy: [{ featured: "desc" }, { position: "asc" }, { priseAt: { sort: "desc", nulls: "last" } }],
    }),
    `contenu de l'album « ${albumId} »`,
  );

  return items.map((item) => ({
    id: item.id,
    type: item.type as GalerieTypeMedia,
    status: item.status as GalerieStatut,
    titreFr: item.titreFr,
    altFr: item.altFr ?? "",
    imageUrl: item.imageUrl,
    position: item.position,
    featured: item.featured,
    couverture: item.id === coverItemId,
    sansSource: item.type === "VIDEO" && !item.videoUrl,
  }));
}
