"use server";

/**
 * Écritures du module « Rapports & analyses ».
 *
 * ⚠️ INVARIANT : chaque action commence par `assertPermission("documents")`.
 * Le proxy laisse passer les POST (rediriger un POST de server action casserait
 * le protocole Flight), la barrière d'autorisation est donc ici, et nulle part
 * ailleurs.
 *
 * ─── Le fichier et la fiche s'enregistrent SÉPARÉMENT ────────────────────────
 *
 *   · `deposerDocumentAction`      → création. Le fichier ET la fiche pour un
 *                                    document téléversé ; la fiche seule pour
 *                                    une publication rédigée, dont le corps
 *                                    s'écrit ensuite dans l'éditeur ;
 *   · `enregistrerDocumentAction`  → la fiche : titre, description, corps,
 *                                    type, catégorie, dates, signature, ordre ;
 *   · `remplacerFichierDocAction`  → le fichier seul, métadonnées conservées ;
 *   · `retirerFichierDocAction`    → détache la pièce jointe d'une publication
 *                                    rédigée.
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
import { isEmptyHtml, sanitizeHtml } from "@/lib/html/sanitize";
import { slugify, uniqueSlug } from "@/lib/actus/slug";
import { codesComposantes } from "@/lib/projet/query";
import { revaliderDocuments } from "@/lib/docs/cache";
import { estMimeDoc, poidsLisible, tailleMaxPour } from "@/lib/docs/fichier";
import { contenuCorrespond } from "@/lib/medias";
import { isDocLangue, isDocStatut, isDocSupport, isDocType } from "@/lib/docs/statut";

/** État partagé par tous les formulaires du module. */
export type DocFormState = { error: string | null; ok: string | null };

const DOCS_PATH = adminPath("/documents");
const CATEGORIES_PATH = adminPath("/documents/categories");


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
async function lireComposantes(formData: FormData): Promise<string[]> {
  const admis = await codesComposantes();
  return formData.getAll("comps").map(String).filter((code) => admis.has(code));
}

/**
 * Corps rédigé, assaini AVANT écriture.
 *
 * ⚠️ Barrière de référence : le HTML qui entre en base est celui-ci, jamais
 * celui du navigateur. L'éditeur assainit déjà à la saisie, mais ce nettoyage
 * est un confort de rédaction — il est produit par le navigateur de l'auteur, ce
 * qui n'en fait pas une donnée de confiance. Même règle que les articles.
 */
const lireCorps = (formData: FormData, champ: string): string => {
  const html = sanitizeHtml(String(formData.get(champ) ?? ""));
  // Un corps réduit à des balises vides vaut une chaîne vide : c'est ce que
  // teste `consultable` côté lecture publique, et « <p><br></p> » n'est pas un
  // texte.
  return isEmptyHtml(html) ? "" : html;
};

/**
 * Champs de la fiche, hors fichier et hors statut.
 *
 * Le titre anglais et la description anglaise peuvent rester vides : la lecture
 * publique retombe alors sur le français (cf. lib/docs/query.ts). Les forcer
 * ici imposerait une traduction avant toute mise en ligne, ce qui retarderait
 * la publication d'une pièce d'intérêt public pour un motif de forme.
 */
async function lireFiche(formData: FormData) {
  const typeBrut = texte(formData, "type");
  const langueBrute = texte(formData, "langue");

  return {
    type: isDocType(typeBrut) ? typeBrut : ("RAPPORT" as const),
    titreFr: texte(formData, "titreFr"),
    titreEn: optionnel(texte(formData, "titreEn")),
    descriptionFr: optionnel(texte(formData, "descriptionFr")),
    descriptionEn: optionnel(texte(formData, "descriptionEn")),
    reference: optionnel(texte(formData, "reference").toUpperCase()),
    /* Pas de normalisation de casse, contrairement au sigle : « v1.0 » et
       « T2 2026 » n'ont pas la même graphie, et « évolutif » est un mot. */
    version: optionnel(texte(formData, "version")),
    auteur: optionnel(texte(formData, "auteur")),
    langue: isDocLangue(langueBrute) ? langueBrute : ("FR" as const),
    // La signature de l'auteur, distincte du compte qui saisit : c'est elle qui
    // paraît sur le site (cf. le modèle `Document` au schéma).
    authorId: optionnel(texte(formData, "authorId")),
    authorName: optionnel(texte(formData, "authorName")),
    authorRole: optionnel(texte(formData, "authorRole")),
    coverMediaId: optionnel(texte(formData, "coverMediaId")),
    documentDate: fromDateInput(texte(formData, "documentDate")),
    featured: coche(formData, "featured"),
    position: lireEntier(texte(formData, "position")),
    categoryId: optionnel(texte(formData, "categoryId")),
    comps: await lireComposantes(formData),
  };
}

/* -------------------------------------------------------------------------- */
/* Adresse publique                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Segment d'URL de la page de lecture, unique en base.
 *
 * Déduit du titre français quand le champ est laissé vide — c'est le cas
 * ordinaire. L'unicité est vérifiée ICI plutôt que rattrapée sur l'erreur de
 * contrainte : la collision est banale (deux « Note de cadrage »), et la
 * résoudre par un suffixe vaut mieux que de renvoyer le rédacteur à un message
 * qu'il ne peut pas comprendre.
 *
 * ⚠️ Le slug n'est PAS recalculé quand il existe déjà et que le formulaire le
 * renvoie inchangé : une adresse publiée, citée dans un courrier ou indexée, ne
 * doit pas se déplacer parce qu'on a corrigé une faute dans le titre.
 */
async function resoudreSlug(saisie: string, titre: string, id: string | null): Promise<string> {
  const base = slugify(saisie || titre);
  if (!base) return "";

  const pris = await db().document.findMany({
    where: { slug: { startsWith: base }, ...(id ? { NOT: { id } } : {}) },
    select: { slug: true },
  });

  return uniqueSlug(base, pris.map((ligne) => ligne.slug).filter((slug): slug is string => slug !== null));
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
  /* Même contrôle que la bibliothèque de médias : le type annoncé par le client
     ne prouve rien, les premiers octets si (cf. contenuCorrespond). */
  if (!contenuCorrespond(octets, fichier.type)) {
    return { error: "Le contenu du fichier ne correspond pas à son format annoncé. Dépôt refusé." };
  }


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
 * Crée un document : la fiche en base, et le fichier chez l'hébergeur quand il
 * y en a un.
 *
 * Deux chemins, selon le SUPPORT choisi à l'écran de création :
 *
 *   · `FICHIER` — le fichier est obligatoire, et il part chez l'hébergeur AVANT
 *     l'écriture en base (cf. l'en-tête du module) ;
 *   · `REDIGE`  — rien n'est téléversé. La fiche naît avec ses métadonnées, et
 *     le corps s'écrit dans l'éditeur de l'écran suivant. Demander le texte dès
 *     la création obligerait à tout rédiger d'une traite, sans pouvoir
 *     enregistrer entre-temps.
 *
 * Le document naît en BROUILLON dans les deux cas : la relecture avant mise en
 * ligne fait partie de ce qu'on attend du module, et publier d'un même geste
 * que créer la rendrait impossible.
 */
export async function deposerDocumentAction(
  _prev: DocFormState,
  formData: FormData,
): Promise<DocFormState> {
  const acteur: AdminUser = await assertPermission("documents");

  const supportBrut = texte(formData, "support");
  const support = isDocSupport(supportBrut) ? supportBrut : ("FICHIER" as const);

  const fiche = await lireFiche(formData);
  if (!fiche.titreFr) return { error: "Le titre français est obligatoire.", ok: null };

  const slug = await resoudreSlug(texte(formData, "slug"), fiche.titreFr, null);

  // Publication rédigée : aucun téléversement. La fiche suffit à exister, le
  // corps vient ensuite.
  if (support === "REDIGE") {
    const document = await db().document.create({
      data: { ...fiche, support, slug, status: "DRAFT", createdById: acteur.id },
      select: { id: true },
    });

    revalidatePath(DOCS_PATH);
    // redirect() lève NEXT_REDIRECT : appelé en dernier, hors de tout try/catch.
    redirect(`${DOCS_PATH}/${document.id}?depose=1`);
  }

  const depot = await deposer(formData);
  if ("error" in depot) return { error: depot.error, ok: null };

  let document;
  try {
    document = await db().document.create({
      data: { ...fiche, ...depot.fichier, support, slug, status: "DRAFT", createdById: acteur.id },
      select: { id: true },
    });
  } catch (erreur) {
    // Le fichier est déjà chez l'hébergeur : le retirer évite d'y laisser un
    // orphelin que plus rien en base ne désigne.
    await supprimerFichier(depot.fichier.filePublicId, depot.fichier.fileMime);
    throw erreur;
  }

  revalidatePath(DOCS_PATH);
  redirect(`${DOCS_PATH}/${document.id}?depose=1`);
}

/* -------------------------------------------------------------------------- */
/* Fiche                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Ce qu'il faut pour qu'un document parte en ligne.
 *
 * La règle dépend du support, et il n'y en a qu'une par support : un fichier
 * pour une pièce téléversée, un corps pour une publication rédigée. Sans elle,
 * le visiteur trouverait une fiche complète et rien derrière — un lien mort
 * dans un cas, une page blanche dans l'autre.
 *
 * Renvoie le motif du refus, ou `null` si la publication est possible.
 */
function motifNonPubliable(document: {
  support: string;
  fileUrl: string | null;
  contenuFr: string;
  contenuEn: string;
}): string | null {
  if (document.support === "REDIGE") {
    return document.contenuFr.trim() || document.contenuEn.trim()
      ? null
      : "Rien à lire : rédigez le corps de la publication avant de la mettre en ligne.";
  }
  return document.fileUrl
    ? null
    : "Aucun fichier attaché : téléversez-le avant de publier.";
}

/**
 * Enregistre les métadonnées et le corps, fichier inchangé.
 *
 * `publishedAt` est traité à part : le champ est proposé au rédacteur, mais s'il
 * le laisse vide sur un document déjà en ligne, la date déjà posée est
 * CONSERVÉE. L'effacer reviendrait à sortir la pièce de tout classement
 * chronologique sans que personne l'ait demandé.
 *
 * Les DEUX langues du corps partent dans le même envoi, contrairement aux
 * articles où chaque langue a son formulaire. C'est le parti déjà retenu par ce
 * module pour les titres et les descriptions (cf. lib/docs/saisie.ts) : une
 * pièce documentaire est traduite par la même personne, en une fois, et non
 * suivie en parallèle par un rédacteur et un traducteur.
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

  const supportBrut = texte(formData, "support");
  const support = isDocSupport(supportBrut) ? supportBrut : ("FICHIER" as const);

  const fiche = await lireFiche(formData);
  if (!fiche.titreFr) return { error: "Le titre français est obligatoire.", ok: null };

  const contenuFr = lireCorps(formData, "contenuFr");
  const contenuEn = lireCorps(formData, "contenuEn");

  const existant = await db().document.findUnique({
    where: { id },
    select: { publishedAt: true, fileUrl: true, slug: true },
  });
  if (!existant) return { error: "Document introuvable.", ok: null };

  // Le passage en ligne depuis ce formulaire obéit à la même règle que le
  // bouton « Publier » de l'en-tête : les deux écrivent le même champ, ils ne
  // peuvent pas avoir deux exigences différentes.
  if (statut === "PUBLISHED") {
    const refus = motifNonPubliable({ support, fileUrl: existant.fileUrl, contenuFr, contenuEn });
    if (refus) return { error: refus, ok: null };
  }

  const saisie = fromDateInput(texte(formData, "publishedAt"));
  // Publier sans date de mise en ligne : elle est posée à l'instant. Un document
  // en ligne sans date n'est classable par aucun tri, et le lecteur ne peut pas
  // situer la pièce.
  const publishedAt = saisie ?? existant.publishedAt ?? (statut === "PUBLISHED" ? new Date() : null);

  const slugSaisi = texte(formData, "slug");
  const slug =
    slugSaisi && slugify(slugSaisi) !== existant.slug
      ? await resoudreSlug(slugSaisi, fiche.titreFr, id)
      : existant.slug || (await resoudreSlug("", fiche.titreFr, id));

  await db().document.update({
    where: { id },
    data: { ...fiche, support, slug, contenuFr, contenuEn, status: statut, publishedAt },
  });

  revalidatePath(`${DOCS_PATH}/${id}`);
  revalidatePath(DOCS_PATH);
  revaliderDocuments();
  return { error: null, ok: "Document enregistré." };
}

/* -------------------------------------------------------------------------- */
/* Fichier                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Attache un fichier, ou remplace celui qui est déjà là.
 *
 * Une seule action pour les deux gestes : ce qui se passe en base est le même
 * mouvement — la fiche désigne un nouveau fichier —, et la seule différence est
 * qu'il y a, ou non, un ancien à retirer ensuite. Le remplacement est le geste
 * de la version corrigée : même rapport, même fiche, même place dans la liste,
 * nouveau PDF.
 *
 * L'ancien fichier est retiré du compte APRÈS la bascule de la ligne — jamais
 * avant, sans quoi la fiche publique désignerait pendant quelques instants un
 * fichier déjà effacé.
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

  if (ancien.filePublicId) await supprimerFichier(ancien.filePublicId, ancien.fileMime ?? "");

  revalidatePath(`${DOCS_PATH}/${id}`);
  revalidatePath(DOCS_PATH);
  revaliderDocuments();
  return {
    error: null,
    ok: ancien.fileName
      ? `Fichier remplacé : « ${depot.fichier.fileName} » succède à « ${ancien.fileName} ».`
      : `Fichier « ${depot.fichier.fileName} » attaché.`,
  };
}

/**
 * Détache la pièce jointe d'une publication rédigée.
 *
 * Réservé au support `REDIGE` : sur un document téléversé, retirer le fichier
 * ne laisserait rien à consulter — c'est une suppression, et elle a son propre
 * bouton. Ici, le texte reste, seule la pièce jointe s'en va.
 *
 * Base d'abord, hébergeur ensuite : un échec réseau laisse un fichier orphelin,
 * gênant mais sans effet visible, là où l'ordre inverse effacerait un fichier
 * encore désigné par une fiche en ligne.
 */
export async function retirerFichierDocAction(
  _prev: DocFormState,
  formData: FormData,
): Promise<DocFormState> {
  await assertPermission("documents");

  const id = texte(formData, "id");
  if (!id) return { error: "Document introuvable.", ok: null };

  const document = await db().document.findUnique({
    where: { id },
    select: { support: true, filePublicId: true, fileMime: true, fileName: true },
  });
  if (!document) return { error: "Document introuvable.", ok: null };
  if (!document.fileName) return { error: "Aucun fichier à retirer.", ok: null };

  if (document.support !== "REDIGE") {
    return {
      error: "Ce document n'existe que par son fichier. Remplacez-le, ou supprimez le document.",
      ok: null,
    };
  }

  await db().document.update({
    where: { id },
    data: {
      fileUrl: null, filePublicId: null, fileName: null, fileMime: null,
      fileSize: 0, fileFormat: null,
    },
  });

  if (document.filePublicId) await supprimerFichier(document.filePublicId, document.fileMime ?? "");

  revalidatePath(`${DOCS_PATH}/${id}`);
  revalidatePath(DOCS_PATH);
  revaliderDocuments();
  return { error: null, ok: `Pièce jointe « ${document.fileName} » retirée.` };
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
    select: {
      status: true, titreFr: true, publishedAt: true, support: true,
      fileUrl: true, contenuFr: true, contenuEn: true,
    },
  });
  if (!document) return { error: "Document introuvable.", ok: null };

  const enLigne = document.status === "PUBLISHED";

  // Une pièce sans fichier ni texte ne doit pas partir en ligne : le visiteur y
  // trouverait une fiche complète et rien derrière.
  if (!enLigne) {
    const refus = motifNonPubliable(document);
    if (refus) return { error: refus, ok: null };
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
  if (document.filePublicId) await supprimerFichier(document.filePublicId, document.fileMime ?? "");

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
