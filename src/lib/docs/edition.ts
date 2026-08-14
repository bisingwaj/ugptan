/**
 * Chargement des données de la fiche d'un document.
 *
 * Partagé par l'écran de dépôt et par celui de modification : les deux affichent
 * les mêmes champs, l'un sur une fiche vierge, l'autre sur une fiche relue en
 * base. Même rôle que `lib/events/edition.ts` côté événements.
 */
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { formatDateTime, toDateInput } from "@/lib/format";
import { mediaSrc, type MediaRef } from "@/lib/medias";
import { composantes } from "@/content/data";
import type { DocumentSaisie, ReferentielsDocSaisie } from "@/lib/docs/saisie";
import type { DocLangue, DocStatut, DocSupport, DocType } from "@/lib/docs/statut";

/** ⚠️ `data` exclu : cf. le commentaire de `lib/actus/query.ts`. */
const mediaSelect = {
  id: true, filename: true, mimeType: true, size: true,
  width: true, height: true, url: true, publicId: true, altFr: true, altEn: true, legende: true,
} as const;

/** Ce que les écrans de la fiche reçoivent : listes déroulantes et bibliothèque. */
export type ReferentielsDoc = { referentiels: ReferentielsDocSaisie; assets: MediaRef[] };

/**
 * Listes déroulantes et bibliothèque, communes aux deux écrans de la fiche.
 *
 * La bibliothèque de médias en fait désormais partie : un document rédigé porte
 * une couverture et des visuels dans son corps, exactement comme un article.
 */
export async function chargerReferentielsDoc(): Promise<ReferentielsDoc> {
  // Reprise sur panne de liaison : le transport vers Neon échoue par salves, et
  // une salve d'une demi-seconde ne doit pas faire tomber l'écran d'édition
  // (cf. lib/lecture.ts).
  const [categories, comptes, assets] = await lectureConsole(
    () => Promise.all([
      db().documentCategory.findMany({
        select: { id: true, nomFr: true },
        orderBy: [{ position: "asc" }, { nomFr: "asc" }],
      }),
      // Seuls les comptes en activité : signer un rapport du nom d'un compte
      // désactivé laisserait croire à une publication qu'il n'a pas faite.
      db().user.findMany({
        where: { banned: false },
        select: { id: true, name: true, email: true },
        orderBy: [{ name: "asc" }, { email: "asc" }],
      }),
      db().mediaAsset.findMany({ select: mediaSelect, orderBy: { createdAt: "desc" }, take: 300 }),
    ]),
    "référentiels documentaires",
  );

  return {
    referentiels: {
      categories: categories.map((item) => ({ id: item.id, nom: item.nomFr })),
      composantes: composantes.map((composante) => ({ code: composante.code, titre: composante.titre.fr })),
      // `name` est requis par Better Auth mais peut valoir l'adresse elle-même :
      // `||` et non `??`, pour qu'une chaîne vide retombe aussi sur l'adresse.
      auteurs: comptes.map((compte) => ({ id: compte.id, nom: compte.name || compte.email })),
    },
    assets,
  };
}

/**
 * Fiche vierge — écran « Nouvelle publication ».
 *
 * `publishedAt` reste vide : la date de mise en ligne est posée par la première
 * publication (cf. actions/admin-documents.ts). La proposer d'avance ferait
 * dater d'aujourd'hui des brouillons publiés trois semaines plus tard.
 */
export const documentVierge = (support: DocSupport = "FICHIER"): DocumentSaisie => ({
  id: null,
  status: "DRAFT",
  type: "RAPPORT",
  support,
  slug: "",
  titreFr: "",
  titreEn: "",
  descriptionFr: "",
  descriptionEn: "",
  contenuFr: "",
  contenuEn: "",
  reference: "",
  auteur: "",
  langue: "FR",
  authorId: "",
  authorName: "",
  authorRole: "",
  coverMediaId: "",
  publishedAt: "",
  documentDate: "",
  featured: false,
  position: 0,
  categoryId: "",
  comps: [],
  fichier: null,
  majLe: null,
});

/** Champs relus pour la fiche de la console. */
const documentSelect = {
  id: true,
  status: true,
  type: true,
  support: true,
  slug: true,
  titreFr: true,
  titreEn: true,
  descriptionFr: true,
  descriptionEn: true,
  contenuFr: true,
  contenuEn: true,
  reference: true,
  auteur: true,
  langue: true,
  authorId: true,
  authorName: true,
  authorRole: true,
  coverMediaId: true,
  publishedAt: true,
  documentDate: true,
  featured: true,
  position: true,
  categoryId: true,
  comps: true,
  fileUrl: true,
  filePublicId: true,
  fileName: true,
  fileMime: true,
  fileSize: true,
  fileFormat: true,
  updatedAt: true,
} as const;

/**
 * Fiche relue en base, projetée dans la forme attendue par les formulaires.
 *
 * Le type de retour resserre `id` sur `string` : `DocumentSaisie.id` est
 * nullable pour couvrir la fiche vierge, mais une fiche relue en a forcément un.
 */
export async function chargerDocument(id: string): Promise<(DocumentSaisie & { id: string }) | null> {
  const document = await lectureConsole(
    () => db().document.findUnique({ where: { id }, select: documentSelect }),
    `fiche de document « ${id} »`,
  );

  if (!document) return null;

  return {
    id: document.id,
    status: document.status as DocStatut,
    type: document.type as DocType,
    support: document.support as DocSupport,
    slug: document.slug ?? "",
    titreFr: document.titreFr,
    titreEn: document.titreEn ?? "",
    descriptionFr: document.descriptionFr ?? "",
    descriptionEn: document.descriptionEn ?? "",
    contenuFr: document.contenuFr,
    contenuEn: document.contenuEn,
    reference: document.reference ?? "",
    auteur: document.auteur ?? "",
    langue: document.langue as DocLangue,
    authorId: document.authorId ?? "",
    authorName: document.authorName ?? "",
    authorRole: document.authorRole ?? "",
    coverMediaId: document.coverMediaId ?? "",
    publishedAt: toDateInput(document.publishedAt),
    documentDate: toDateInput(document.documentDate),
    featured: document.featured,
    position: document.position,
    categoryId: document.categoryId ?? "",
    comps: document.comps,
    // Le fichier est facultatif depuis l'ouverture du module à la rédaction :
    // `null` dit qu'il n'y en a pas, et les écrans proposent alors de
    // l'attacher plutôt que de le remplacer.
    fichier: document.fileUrl
      ? {
          url: document.fileUrl,
          publicId: document.filePublicId,
          nom: document.fileName ?? "document",
          mime: document.fileMime ?? "application/octet-stream",
          taille: document.fileSize,
          format: document.fileFormat,
        }
      : null,
    majLe: formatDateTime(document.updatedAt),
  };
}

/** Adresse d'un visuel de la bibliothèque, pour l'aperçu de couverture. */
export const apercuMedia = (assets: MediaRef[], id: string): string | null => {
  const asset = assets.find((item) => item.id === id);
  return asset ? mediaSrc(asset) : null;
};
