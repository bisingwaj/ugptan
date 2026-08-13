"use server";

/**
 * Écritures du module « Documents & transparence ».
 *
 * ⚠️ INVARIANT : chaque action commence par `assertPermission("documents")`.
 * Le proxy laisse passer les POST (rediriger un POST de server action casserait
 * le protocole Flight), la barrière d'autorisation est donc ici, et nulle part
 * ailleurs.
 *
 * ─── Le fichier et la fiche s'enregistrent SÉPARÉMENT ────────────────────────
 *
 *   · `deposerDocumentAction`      → création : le fichier ET la fiche, en une
 *                                    fois, parce qu'un document sans fichier
 *                                    n'a pas d'existence ;
 *   · `enregistrerDocumentAction`  → la fiche seule : titre, description, type,
 *                                    catégorie, dates, auteur, ordre ;
 *   · `remplacerFichierDocAction`  → le fichier seul, métadonnées conservées.
 *
 * Les confondre ferait repartir un téléversement de plusieurs mégaoctets à
 * chaque correction de virgule, et — plus grave — un formulaire unique
 * renverrait un champ « fichier » vide sur une simple modification de titre, ce
 * qui obligerait le serveur à deviner s'il faut effacer le fichier ou le garder.
 *
 * ─── Ordre des opérations, et pourquoi il n'est pas symétrique ───────────────
 *
 * À la CRÉATION, le dépôt distant précède l'écriture en base : un échec chez
 * l'hébergeur laisse la table intacte, là qu'une ligne écrite d'abord aurait
 * survécu en pointant vers un fichier inexistant.
 *
 * À la SUPPRESSION, l'inverse : la base d'abord, le retrait du fichier ensuite.
 * Un échec réseau laisse alors un fichier orphelin que plus rien ne désigne —
 * gênant, sans effet visible ; le contraire effacerait un fichier encore
 * référencé par une fiche en ligne.
 *
 * Au REMPLACEMENT, les deux règles se combinent : dépôt du nouveau, bascule de
 * la ligne, retrait de l'ancien. À aucun instant la fiche ne désigne un fichier
 * absent.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { adminPath } from "@/lib/admin";
import { assertPermission, type AdminUser } from "@/lib/auth/guard";
import { cloudinaryActif, deposerFichier, supprimerFichier } from "@/lib/cloudinary";
import { fromDateInput } from "@/lib/format";
import { slugify } from "@/lib/actus/slug";
import { composantes } from "@/content/data";
import { revaliderDocuments } from "@/lib/docs/cache";
import { estMimeDoc, poidsLisible, tailleMaxPour } from "@/lib/docs/fichier";
import { isDocLangue, isDocStatut, isDocType } from "@/lib/docs/statut";

/** État partagé par tous les formulaires du module. */
export type DocFormState = { error: string | null; ok: string | null };

const DOCS_PATH = adminPath("/documents");
const CATEGORIES_PATH = adminPath("/documents/categories");

const CODES_COMPOSANTE = new Set(composantes.map((c) => c.code));

/** Code Prisma d'une violation de contrainte d'unicité. */
const UNIQUE_VIOLATION = "P2002";

const estDoublon = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: string }).code === UNIQUE_VIOLATION;

/* -------------------------------------------------------------------------- */
/* Lecture du formulaire                                                       */
/* -------------------------------------------------------------------------- */

const texte = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();
const optionnel = (value: string): string | null => (value.length ? value : null);
const coche = (formData: FormData, key: string): boolean =>
  formData.get(key) === "on" || formData.get(key) === "1";

/** Entier d'ordre d'affichage. Une saisie illisible vaut 0 plutôt qu'un refus. */
function lireEntier(value: string): number {
  const nombre = Number.parseInt(value, 10);
  return Number.isFinite(nombre) ? nombre : 0;
}

/** Couleur d'accent : hexadécimal à 6 chiffres, ou rien. */
function lireCouleur(value: string): string | null {
  const couleur = value.trim().toLowerCase();
  if (!couleur) return null;
  return /^#[0-9a-f]{6}$/.test(couleur) ? couleur : null;
}

/** Codes de composante cochés, réduits à ceux qui existent réellement. */
function lireComposantes(formData: FormData): string[] {
  return formData.getAll("comps").map(String).filter((code) => CODES_COMPOSANTE.has(code));
}

/**
 * Champs de la fiche, hors fichier et hors statut.
 *
 * Le titre anglais et la description anglaise peuvent rester vides : la lecture
 * publique retombe alors sur le français (cf. lib/docs/query.ts). Les forcer
 * ici imposerait une traduction avant toute mise en ligne, ce qui retarderait
 * la publication d'une pièce d'intérêt public pour un motif de forme.
 */
function lireFiche(formData: FormData) {
  const typeBrut = texte(formData, "type");
  const langueBrute = texte(formData, "langue");

  return {
    type: isDocType(typeBrut) ? typeBrut : ("RAPPORT" as const),
    titreFr: texte(formData, "titreFr"),
    titreEn: optionnel(texte(formData, "titreEn")),
    descriptionFr: optionnel(texte(formData, "descriptionFr")),
    descriptionEn: optionnel(texte(formData, "descriptionEn")),
    reference: optionnel(texte(formData, "reference").toUpperCase()),
    auteur: optionnel(texte(formData, "auteur")),
    langue: isDocLangue(langueBrute) ? langueBrute : ("FR" as const),
    documentDate: fromDateInput(texte(formData, "documentDate")),
    featured: coche(formData, "featured"),
    position: lireEntier(texte(formData, "position")),
    categoryId: optionnel(texte(formData, "categoryId")),
    comps: lireComposantes(formData),
  };
}

/* -------------------------------------------------------------------------- */
/* Dépôt du fichier                                                            */
/* -------------------------------------------------------------------------- */

/** Ce que le dépôt renvoie à l'appelant, prêt à écrire en base. */
type Fichier = {
  fileUrl: string;
  filePublicId: string;
  fileName: string;
  fileMime: string;
  fileSize: number;
  fileFormat: string | null;
};

/**
 * Contrôle et dépose le fichier soumis.
 *
 * Les refus sont rendus en clair — format, poids, stockage non configuré — plutôt
 * que remontés en exception : ce sont des situations ordinaires, que la personne
 * qui dépose peut corriger elle-même.
 */
async function deposer(formData: FormData): Promise<{ fichier: Fichier } | { error: string }> {
  const fichier = formData.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { error: "Aucun fichier reçu. Choisissez le document à téléverser." };
  }

  if (!estMimeDoc(fichier.type)) {
    return {
      error: "Format non accepté. Documents : PDF, Word, Excel, PowerPoint, CSV. Images : JPEG, PNG, WebP, AVIF, GIF.",
    };
  }

  const plafond = tailleMaxPour(fichier.type);
  if (fichier.size > plafond) {
    return {
      error: `Fichier trop lourd (${poidsLisible(fichier.size)}). Limite : ${poidsLisible(plafond)}.`,
    };
  }

  if (!cloudinaryActif()) {
    return {
      error: "Stockage des fichiers non configuré : le dépôt est impossible tant que CLOUDINARY_URL n'est pas renseignée dans l'environnement.",
    };
  }

  const nom = fichier.name.slice(0, 180) || "document";
  const octets = new Uint8Array(await fichier.arrayBuffer());

  try {
    const depot = await deposerFichier(octets, {
      filename: nom,
      mimeType: fichier.type,
      // Sous-dossier propre au module : les rapports publiés et les visuels
      // d'articles ne se rangent pas ensemble chez l'hébergeur, ce qui rend un
      // ménage manuel possible sans inspecter chaque fichier.
      sousDossier: "documents/rapports",
    });

    return {
      fichier: {
        fileUrl: depot.url,
        filePublicId: depot.publicId,
        fileName: nom,
        fileMime: fichier.type,
        fileSize: depot.size || fichier.size,
        fileFormat: depot.format ?? /\.([a-z0-9]{1,8})$/i.exec(nom)?.[1]?.toLowerCase() ?? null,
      },
    };
  } catch (erreur) {
    console.error("[docs] dépôt Cloudinary impossible", erreur);
    return { error: "Téléversement refusé par le service de stockage. Réessayez." };
  }
}

/* -------------------------------------------------------------------------- */
/* Création                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Dépose un document : le fichier chez l'hébergeur, la fiche en base.
 *
 * Le document naît en BROUILLON, quel que soit le formulaire : la
 * prévisualisation de la fiche avant publication fait partie de ce qu'on attend
 * du module, et publier d'un même geste que déposer la rendrait impossible. La
 * mise en ligne se fait depuis la fiche, une fois les métadonnées relues.
 */
export async function deposerDocumentAction(
  _prev: DocFormState,
  formData: FormData,
): Promise<DocFormState> {
  const acteur: AdminUser = await assertPermission("documents");

  const fiche = lireFiche(formData);
  if (!fiche.titreFr) return { error: "Le titre français est obligatoire.", ok: null };

  const depot = await deposer(formData);
  if ("error" in depot) return { error: depot.error, ok: null };

  let document;
  try {
    document = await db().document.create({
      data: { ...fiche, ...depot.fichier, status: "DRAFT", createdById: acteur.id },
      select: { id: true },
    });
  } catch (erreur) {
    // Le fichier est déjà chez l'hébergeur : le retirer évite d'y laisser un
    // orphelin que plus rien en base ne désigne.
    await supprimerFichier(depot.fichier.filePublicId, depot.fichier.fileMime);
    throw erreur;
  }

  revalidatePath(DOCS_PATH);
  // redirect() lève NEXT_REDIRECT : appelé en dernier, hors de tout try/catch.
  redirect(`${DOCS_PATH}/${document.id}?depose=1`);
}

/* -------------------------------------------------------------------------- */
/* Fiche                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Enregistre les métadonnées, fichier inchangé.
 *
 * `publishedAt` est traité à part : le champ est proposé au rédacteur, mais s'il
 * le laisse vide sur un document déjà en ligne, la date déjà posée est
 * CONSERVÉE. L'effacer reviendrait à sortir la pièce de tout classement
 * chronologique sans que personne l'ait demandé.
 */
export async function enregistrerDocumentAction(
  _prev: DocFormState,
  formData: FormData,
): Promise<DocFormState> {
  await assertPermission("documents");

  const id = texte(formData, "id");
  if (!id) return { error: "Document introuvable.", ok: null };

  const statutBrut = texte(formData, "status");
  if (!isDocStatut(statutBrut)) return { error: "Statut inconnu.", ok: null };
  const statut = statutBrut;

  const fiche = lireFiche(formData);
  if (!fiche.titreFr) return { error: "Le titre français est obligatoire.", ok: null };

  const existant = await db().document.findUnique({
    where: { id },
    select: { publishedAt: true },
  });
  if (!existant) return { error: "Document introuvable.", ok: null };

  const saisie = fromDateInput(texte(formData, "publishedAt"));
  // Publier sans date de mise en ligne : elle est posée à l'instant. Un document
  // en ligne sans date n'est classable par aucun tri, et le lecteur ne peut pas
  // situer la pièce.
  const publishedAt = saisie ?? existant.publishedAt ?? (statut === "PUBLISHED" ? new Date() : null);

  await db().document.update({ where: { id }, data: { ...fiche, status: statut, publishedAt } });

  revalidatePath(`${DOCS_PATH}/${id}`);
  revalidatePath(DOCS_PATH);
  revaliderDocuments();
  return { error: null, ok: "Document enregistré." };
}

/* -------------------------------------------------------------------------- */
/* Fichier                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Remplace le fichier en conservant toutes les métadonnées.
 *
 * C'est le geste de la version corrigée : même rapport, même fiche, même place
 * dans la liste, nouveau PDF. L'ancien fichier est retiré du compte APRÈS la
 * bascule de la ligne — jamais avant, sans quoi la fiche publique désignerait
 * pendant quelques instants un fichier déjà effacé.
 */
export async function remplacerFichierDocAction(
  _prev: DocFormState,
  formData: FormData,
): Promise<DocFormState> {
  await assertPermission("documents");

  const id = texte(formData, "id");
  if (!id) return { error: "Document introuvable.", ok: null };

  const ancien = await db().document.findUnique({
    where: { id },
    select: { filePublicId: true, fileMime: true, fileName: true },
  });
  if (!ancien) return { error: "Document introuvable.", ok: null };

  const depot = await deposer(formData);
  if ("error" in depot) return { error: depot.error, ok: null };

  try {
    await db().document.update({ where: { id }, data: depot.fichier });
  } catch (erreur) {
    await supprimerFichier(depot.fichier.filePublicId, depot.fichier.fileMime);
    throw erreur;
  }

  if (ancien.filePublicId) await supprimerFichier(ancien.filePublicId, ancien.fileMime);

  revalidatePath(`${DOCS_PATH}/${id}`);
  revalidatePath(DOCS_PATH);
  revaliderDocuments();
  return {
    error: null,
    ok: `Fichier remplacé : « ${depot.fichier.fileName} » succède à « ${ancien.fileName} ».`,
  };
}

/* -------------------------------------------------------------------------- */
/* Actions rapides                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Bascule publication / retrait depuis la liste comme depuis la fiche.
 *
 * Le retrait choisit `DRAFT` et non `ARCHIVED` : dépublier, c'est reprendre la
 * main sur une pièce, pas la clore. L'archivage reste un geste explicite.
 */
export async function basculerPublicationDocAction(
  _prev: DocFormState,
  formData: FormData,
): Promise<DocFormState> {
  await assertPermission("documents");

  const id = texte(formData, "id");
  if (!id) return { error: "Document introuvable.", ok: null };

  const document = await db().document.findUnique({
    where: { id },
    select: { status: true, titreFr: true, publishedAt: true, fileUrl: true },
  });
  if (!document) return { error: "Document introuvable.", ok: null };

  const enLigne = document.status === "PUBLISHED";

  // Un document dont le fichier a disparu ne doit pas partir en ligne : le
  // visiteur y trouverait une fiche complète et un lien mort.
  if (!enLigne && !document.fileUrl) {
    return { error: "Aucun fichier attaché : téléversez-le avant de publier.", ok: null };
  }

  await db().document.update({
    where: { id },
    data: {
      status: enLigne ? "DRAFT" : "PUBLISHED",
      ...(enLigne || document.publishedAt ? {} : { publishedAt: new Date() }),
    },
  });

  // ⚠️ La FICHE de la console est revalidée, pas seulement le site public : le
  // sélecteur « Statut » du formulaire vit sur la même page que ce bouton, et
  // sans cette ligne il continuerait de renvoyer l'ancienne valeur au premier
  // enregistrement.
  revalidatePath(`${DOCS_PATH}/${id}`);
  revalidatePath(DOCS_PATH);
  revaliderDocuments();
  return {
    error: null,
    ok: enLigne ? `« ${document.titreFr} » dépublié.` : `« ${document.titreFr} » publié.`,
  };
}

/**
 * Archive une pièce, ou la sort de l'archive.
 *
 * Distinct de la dépublication : l'archive dit « cette version a été remplacée
 * ou a cessé de valoir », le brouillon dit « ce n'est pas encore prêt ». Les
 * deux retirent du site, mais ne se relisent pas de la même façon six mois plus
 * tard. Sortir de l'archive renvoie en brouillon plutôt qu'en ligne : la
 * remise en ligne reste un geste distinct.
 */
export async function archiverDocumentAction(
  _prev: DocFormState,
  formData: FormData,
): Promise<DocFormState> {
  await assertPermission("documents");

  const id = texte(formData, "id");
  if (!id) return { error: "Document introuvable.", ok: null };

  const document = await db().document.findUnique({
    where: { id },
    select: { status: true, titreFr: true },
  });
  if (!document) return { error: "Document introuvable.", ok: null };

  const archive = document.status === "ARCHIVED";

  await db().document.update({ where: { id }, data: { status: archive ? "DRAFT" : "ARCHIVED" } });

  revalidatePath(`${DOCS_PATH}/${id}`);
  revalidatePath(DOCS_PATH);
  revaliderDocuments();
  return {
    error: null,
    ok: archive
      ? `« ${document.titreFr} » sorti de l'archive, en brouillon.`
      : `« ${document.titreFr} » archivé.`,
  };
}

/**
 * Suppression définitive, fichier compris.
 *
 * C'est le seul geste irréversible du module, et la raison pour laquelle
 * l'archivage existe à côté : une version remplacée s'archive, elle ne
 * s'efface pas. Ce qui est effacé l'est partout — ligne en base ET fichier chez
 * l'hébergeur, conformément à l'exigence de gestion propre du fichier associé.
 */
export async function supprimerDocumentAction(
  _prev: DocFormState,
  formData: FormData,
): Promise<DocFormState> {
  await assertPermission("documents");

  const id = texte(formData, "id");
  if (!id) return { error: "Document introuvable.", ok: null };

  const document = await db().document.findUnique({
    where: { id },
    select: { filePublicId: true, fileMime: true },
  });
  if (!document) return { error: "Document introuvable.", ok: null };

  await db().document.delete({ where: { id } });
  if (document.filePublicId) await supprimerFichier(document.filePublicId, document.fileMime);

  revaliderDocuments();
  redirect(`${DOCS_PATH}?supprime=1`);
}

/* -------------------------------------------------------------------------- */
/* Catégories                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Libellés des deux langues.
 * L'anglais retombe sur le français plutôt que de rester vide : une catégorie
 * sans libellé anglais afficherait un filtre muet sur la version anglaise.
 */
function lireLibelles(formData: FormData): { nomFr: string; nomEn: string } | null {
  const nomFr = texte(formData, "nomFr");
  if (!nomFr) return null;
  return { nomFr, nomEn: texte(formData, "nomEn") || nomFr };
}

export async function enregistrerCategorieDocAction(
  _prev: DocFormState,
  formData: FormData,
): Promise<DocFormState> {
  await assertPermission("documents");

  const id = texte(formData, "id");
  const libelles = lireLibelles(formData);
  if (!libelles) return { error: "Le libellé français est obligatoire.", ok: null };

  const slug = slugify(texte(formData, "slug") || libelles.nomFr);
  if (!slug) return { error: "Le libellé ne produit aucun identifiant d'URL exploitable.", ok: null };

  const donnees = {
    ...libelles,
    slug,
    color: lireCouleur(texte(formData, "color")),
    position: lireEntier(texte(formData, "position")),
  };

  try {
    if (id) await db().documentCategory.update({ where: { id }, data: donnees });
    else await db().documentCategory.create({ data: donnees });
  } catch (error) {
    if (estDoublon(error)) return { error: "Cet identifiant d'URL est déjà pris par une autre catégorie.", ok: null };
    throw error;
  }

  revalidatePath(CATEGORIES_PATH);
  revaliderDocuments();
  return { error: null, ok: id ? "Catégorie mise à jour." : `Catégorie « ${libelles.nomFr} » créée.` };
}

/**
 * Suppression d'une catégorie.
 *
 * Les documents ne sont PAS supprimés : leur rattachement passe à `null`
 * (`onDelete: SetNull` au schéma). On l'annonce plutôt que de le laisser
 * découvrir — une pièce qui perd sa thématique sans explication ressemble à une
 * perte de données.
 */
export async function supprimerCategorieDocAction(
  _prev: DocFormState,
  formData: FormData,
): Promise<DocFormState> {
  await assertPermission("documents");

  const id = texte(formData, "id");
  if (!id) return { error: "Catégorie introuvable.", ok: null };

  const categorie = await db().documentCategory.findUnique({
    where: { id },
    select: { nomFr: true, _count: { select: { documents: true } } },
  });
  if (!categorie) return { error: "Catégorie introuvable.", ok: null };

  await db().documentCategory.delete({ where: { id } });

  revalidatePath(CATEGORIES_PATH);
  revaliderDocuments();

  const orphelins = categorie._count.documents;
  return {
    error: null,
    ok: orphelins > 0
      ? `Catégorie « ${categorie.nomFr} » supprimée. ${orphelins} document(s) sont désormais sans catégorie.`
      : `Catégorie « ${categorie.nomFr} » supprimée.`,
  };
}
