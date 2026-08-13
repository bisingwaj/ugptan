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
import { composantes } from "@/content/data";
import type { DocumentSaisie, ReferentielsDocSaisie } from "@/lib/docs/saisie";
import type { DocLangue, DocStatut, DocType } from "@/lib/docs/statut";

/** Listes déroulantes, communes aux deux écrans de la fiche. */
export async function chargerReferentielsDoc(): Promise<ReferentielsDocSaisie> {
  // Reprise sur panne de liaison : le transport vers Neon échoue par salves, et
  // une salve d'une demi-seconde ne doit pas faire tomber l'écran d'édition
  // (cf. lib/lecture.ts).
  const categories = await lectureConsole(
    () => db().documentCategory.findMany({
      select: { id: true, nomFr: true },
      orderBy: [{ position: "asc" }, { nomFr: "asc" }],
    }),
    "référentiels documentaires",
  );

  return {
    categories: categories.map((item) => ({ id: item.id, nom: item.nomFr })),
    composantes: composantes.map((composante) => ({ code: composante.code, titre: composante.titre.fr })),
  };
}

/**
 * Fiche vierge — écran « Déposer un document ».
 *
 * `publishedAt` reste vide : la date de mise en ligne est posée par la première
 * publication (cf. actions/admin-documents.ts). La proposer d'avance ferait
 * dater d'aujourd'hui des brouillons publiés trois semaines plus tard.
 */
export const documentVierge = (): DocumentSaisie => ({
  id: null,
  status: "DRAFT",
  type: "RAPPORT",
  titreFr: "",
  titreEn: "",
  descriptionFr: "",
  descriptionEn: "",
  reference: "",
  auteur: "",
  langue: "FR",
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
  titreFr: true,
  titreEn: true,
  descriptionFr: true,
  descriptionEn: true,
  reference: true,
  auteur: true,
  langue: true,
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
    titreFr: document.titreFr,
    titreEn: document.titreEn ?? "",
    descriptionFr: document.descriptionFr ?? "",
    descriptionEn: document.descriptionEn ?? "",
    reference: document.reference ?? "",
    auteur: document.auteur ?? "",
    langue: document.langue as DocLangue,
    publishedAt: toDateInput(document.publishedAt),
    documentDate: toDateInput(document.documentDate),
    featured: document.featured,
    position: document.position,
    categoryId: document.categoryId ?? "",
    comps: document.comps,
    fichier: {
      url: document.fileUrl,
      publicId: document.filePublicId,
      nom: document.fileName,
      mime: document.fileMime,
      taille: document.fileSize,
      format: document.fileFormat,
    },
    majLe: formatDateTime(document.updatedAt),
  };
}
