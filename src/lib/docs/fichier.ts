/**
 * Le FICHIER d'un document : ce qu'on accepte, comment on l'annonce, comment on
 * l'ouvre et comment on le télécharge.
 *
 * ⚠️ Module lu par le NAVIGATEUR (formulaire de dépôt de la console, liste
 * publique). Il n'importe donc rien de `src/lib/cloudinary.ts`, qui embarque le
 * SDK et lit `process.env` : seules les constantes partagées de
 * `src/lib/medias.ts` sont réutilisées, ce module n'ayant lui-même aucune
 * dépendance serveur.
 *
 * Les formats acceptés ne sont PAS redéfinis ici. La bibliothèque de médias et
 * les documents déposent chez le même hébergeur, avec les mêmes plafonds et la
 * même liste fermée : deux listes auraient divergé au premier format ajouté.
 */
import {
  MIMES_ACCEPTES,
  estImage,
  extensionLisible,
  poidsLisible,
  tailleMaxPour,
} from "@/lib/medias";

export { estImage, extensionLisible, poidsLisible, tailleMaxPour };

/**
 * Ce que le dépôt de documents accepte : PDF, Word, Excel, PowerPoint, CSV et
 * images. La liste reste FERMÉE — l'ouvrir ferait de la section « Rapports &
 * analyses » un hébergeur de fichiers arbitraires, exécutables compris.
 */
export const MIMES_DOC = MIMES_ACCEPTES;

/** Attribut `accept` du champ de dépôt. */
export const ACCEPT_DOC = MIMES_DOC.join(",");

/** Ce type de fichier est-il accepté ? */
export const estMimeDoc = (mimeType: string): boolean =>
  (MIMES_DOC as readonly string[]).includes(mimeType);

/**
 * Hôte de diffusion des fichiers déposés.
 *
 * ⚠️ Doublon assumé avec `HOTE_CLOUDINARY` (src/lib/cloudinary.ts) : ce module
 * descend dans le paquet du navigateur, et importer le SDK pour une chaîne de
 * dix-sept caractères y ferait entrer tout le client HTTP du service.
 */
const HOTE_STOCKAGE = "res.cloudinary.com";

const estUrlStockage = (url: string): boolean =>
  url.toLowerCase().startsWith(`https://${HOTE_STOCKAGE}/`);

/**
 * Extension portée par l'URL DE DIFFUSION, et non par le nom d'origine.
 *
 * La distinction est tout sauf cosmétique : c'est l'URL qui décide de ce que
 * l'hébergeur annonce. Un fichier déposé sous « rapport.pdf » mais diffusé sans
 * extension ressort en `application/octet-stream`, quel que soit son nom en
 * base (cf. le commentaire de `FORMATS_RESTREINTS` dans lib/cloudinary.ts).
 */
function extensionUrl(url: string): string | null {
  const chemin = url.split(/[?#]/)[0];
  return /\.([a-z0-9]{1,8})$/i.exec(chemin)?.[1]?.toLowerCase() ?? null;
}

/**
 * Pastille de format : « PDF », « DOCX », « XLSX ».
 *
 * Le format rapporté par l'hébergeur prime sur l'extension du nom d'origine —
 * c'est lui qui décrit le fichier RÉELLEMENT stocké. L'extension ne sert que de
 * repli, pour les lignes déposées avant que le format soit relevé.
 */
export const formatLisible = (fileName: string, fileFormat: string | null): string =>
  fileFormat ? fileFormat.toUpperCase() : extensionLisible(fileName);

/**
 * Le fichier peut-il être montré à l'écran, sans être téléchargé ?
 *
 * Les images et les PDF, oui — le navigateur sait les rendre nativement. Les
 * formats bureautiques, non : les afficher supposerait un service de conversion
 * tiers, à qui il faudrait confier des documents parfois pré-publication.
 *
 * ⚠️ Le type MIME ne suffit PAS à répondre, et c'est la raison de ce second
 * paramètre. Un PDF diffusé sans extension ressort en `application/octet-stream`
 * (mesuré), et aucun navigateur ne l'affiche : le cadre d'aperçu resterait vide,
 * ce qui est pire qu'un message disant franchement de télécharger le fichier.
 * C'est donc l'URL RÉELLE qui tranche — et l'aperçu se met à fonctionner de
 * lui-même pour les documents déposés après activation de la diffusion des PDF
 * (cf. `FORMATS_RESTREINTS` dans lib/cloudinary.ts).
 */
export function apercuPossible(mimeType: string, url: string): boolean {
  if (estImage(mimeType)) return true;
  if (mimeType !== "application/pdf") return false;
  return extensionUrl(url) === "pdf";
}

/**
 * Nom de fichier proposé au téléchargement, réduit à ce qu'une URL de CDN
 * accepte sans encodage. Vide après nettoyage — un titre entièrement non
 * latin — l'appelant retombe sur le nom de dépôt.
 */
function nomTelechargement(fileName: string): string {
  const sansExtension = fileName.replace(/\.[^.]+$/, "");
  return sansExtension
    .normalize("NFD")
    .replace(/[^\x20-\x7e]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * URL qui déclenche un TÉLÉCHARGEMENT plutôt qu'un affichage.
 *
 * L'attribut HTML `download` ne fait rien sur une origine tierce : le navigateur
 * l'ignore et ouvre le fichier. C'est donc l'hébergeur qui doit renvoyer
 * l'en-tête `Content-Disposition`, ce que demande la transformation
 * `fl_attachment`, insérée juste après `/upload/`. Le nom qui la suit devient
 * celui du fichier enregistré, extension comprise : « rapport-annuel.docx »
 * plutôt que l'identifiant de dépôt et son suffixe aléatoire (mesuré).
 *
 * Deux cas sont renvoyés INTACTS, et pour des raisons différentes :
 *
 *   · une URL qui ne vient pas de notre stockage — y ajouter un segment de
 *     chemin produirait un lien mort chez l'hôte tiers ;
 *   · une URL SANS extension — l'hébergeur y force déjà le téléchargement, et
 *     `fl_attachment:<nom>` ne ferait que remplacer un nom sans extension par un
 *     autre nom sans extension (mesuré : `filename="rapport"`), c'est-à-dire un
 *     fichier que le système d'exploitation ne saurait plus ouvrir.
 */
export function urlTelechargement(url: string, fileName: string): string {
  if (!estUrlStockage(url) || !url.includes("/upload/")) return url;
  if (!extensionUrl(url)) return url;

  const nom = nomTelechargement(fileName);
  const drapeau = nom ? `fl_attachment:${nom}` : "fl_attachment";
  return url.replace("/upload/", `/upload/${drapeau}/`);
}

/** Ligne technique d'un document : « PDF · FR · 4,2 Mo ». */
export function ligneTechnique(fichier: {
  fileName: string;
  fileFormat: string | null;
  fileSize: number;
  langue: string;
}): string {
  const parties = [formatLisible(fichier.fileName, fichier.fileFormat), fichier.langue];
  if (fichier.fileSize > 0) parties.push(poidsLisible(fichier.fileSize));
  return parties.join(" · ");
}
