/**
 * Dépôt des fichiers chez Cloudinary.
 *
 * Seul point de contact du dépôt avec le service : rien d'autre n'importe le
 * SDK. Les appelants (server actions, script de reprise) manipulent des octets
 * et reçoivent une URL — la mécanique de signature, de dossier et de type de
 * ressource reste ici.
 *
 * ⚠️ Module SERVEUR. Le SDK ouvre ses propres connexions HTTPS et lit
 * `process.env` ; il n'a rien à faire dans un composant client. Les constantes
 * partagées avec le navigateur (types acceptés, plafonds) vivent dans
 * `src/lib/medias.ts`, qui n'importe rien d'ici.
 *
 * Configuration PARESSEUSE, pour la même raison que `src/lib/db.ts` :
 * `next build` importe ce fichier pendant la collecte des routes, sur un
 * environnement qui ne dispose pas forcément des identifiants.
 */
import { randomBytes } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

/** Dossier racine des dépôts. Séparer les environnements est un réglage, pas un détail. */
const dossierRacine = (): string => process.env.CLOUDINARY_FOLDER?.trim() || "ugptn";

/**
 * Identifiants, sous l'une ou l'autre forme.
 *
 * `CLOUDINARY_URL` suffit — c'est ce que la console de Cloudinary donne à
 * copier. Les trois variables décomposées existent pour les hébergeurs qui
 * refusent une URL portant un secret ; renseignées, elles l'emportent.
 */
function identifiants(): { cloud_name: string; api_key: string; api_secret: string } | null {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const api_key = process.env.CLOUDINARY_API_KEY?.trim();
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (cloud_name && api_key && api_secret) return { cloud_name, api_key, api_secret };

  const url = process.env.CLOUDINARY_URL?.trim();
  if (!url) return null;

  // cloudinary://<api_key>:<api_secret>@<cloud_name>
  const parsed = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/i.exec(url);
  if (!parsed) return null;

  return { api_key: parsed[1], api_secret: parsed[2], cloud_name: parsed[3].replace(/\/.*$/, "") };
}

let configure = false;

/**
 * Prépare le SDK, une seule fois par processus.
 * Renvoie `false` quand rien n'est configuré : l'appelant transforme ce cas en
 * message d'erreur lisible plutôt qu'en exception opaque du SDK.
 */
function preparer(): boolean {
  if (configure) return true;

  const cles = identifiants();
  if (!cles) return false;

  cloudinary.config({ ...cles, secure: true });
  configure = true;
  return true;
}

/** Le stockage distant est-il utilisable ? Lu par la console pour l'annoncer. */
export const cloudinaryActif = (): boolean => identifiants() !== null;

/** Nom du compte, pour les messages de diagnostic. */
export const cloudinaryCloudName = (): string | null => identifiants()?.cloud_name ?? null;

/**
 * Type de ressource Cloudinary déduit du type MIME.
 *
 * Les documents partent en `raw` — donc rendus tels quels, sans passer par le
 * pipeline d'images. C'est délibéré : un PDF déposé en `image` est rasterisé
 * par Cloudinary, et sa diffusion dépend d'un réglage de compte désactivé par
 * défaut. En `raw`, le fichier ressort octet pour octet.
 */
export const typeRessource = (mimeType: string): "image" | "raw" =>
  mimeType.startsWith("image/") ? "image" : "raw";

/**
 * Nom de dépôt : celui du fichier d'origine, débarrassé de son extension et de
 * tout ce qui n'est pas alphanumérique, SUIVI d'un suffixe aléatoire.
 *
 * Cloudinary refuse `/`, `?` et `#` dans un identifiant public, et un accent
 * dans une URL de CDN complique les relectures autant que les copier-coller.
 *
 * Le suffixe n'est pas cosmétique. Les options `unique_filename` du service ne
 * s'appliquent PAS quand on impose un `public_id` : deux fichiers nommés
 * « photo.jpg » viseraient alors le même identifiant, et le second dépôt
 * renverrait l'adresse du PREMIER fichier — l'article publié changerait
 * silencieusement d'illustration. Quatre octets tirés au sort écartent le cas.
 */
export function nomDeDepot(filename: string, resourceType: "image" | "raw" = "image"): string {
  const sansExtension = filename.replace(/\.[^.]+$/, "");
  // NFD sépare la lettre de son accent, le filtre ASCII ne laisse que la lettre :
  // « Réunion » devient « reunion » plutôt que « r-union ».
  const ascii = sansExtension.normalize("NFD").replace(/[^\x20-\x7e]/g, "");
  const propre = ascii.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const base = `${propre.slice(0, 100) || "fichier"}-${randomBytes(4).toString("hex")}`;

  if (resourceType !== "raw") return base;

  const extension = /\.([a-z0-9]{1,8})$/i.exec(filename)?.[1]?.toLowerCase();
  if (!extension) return base;
  return formatBloque(extension) ? base : `${base}.${extension}`;
}

/**
 * Formats dont la DIFFUSION dépend d'un réglage du compte Cloudinary
 * (« Allow delivery of PDF and ZIP files », Settings → Security), désactivé par
 * défaut.
 *
 * ─── Ce qui a été mesuré, sur le compte du projet ────────────────────────────
 *
 *   · `raw` sans extension        → 200, `application/octet-stream`,
 *                                   `Content-Disposition: attachment` ;
 *   · `raw` en « .docx »          → 200, type MIME exact ;
 *   · `raw` en « .pdf »           → 401, y compris avec `fl_attachment`.
 *
 * D'où la règle : l'extension est conservée pour TOUS les formats — c'est elle
 * qui donne le bon type MIME, donc l'aperçu dans le navigateur et un nom de
 * fichier correct au téléchargement — SAUF pour ceux que le réglage bloque, qui
 * repartiraient en 401, c'est-à-dire en lien mort sur la page publique. Un
 * fichier servi en `octet-stream` ne s'affiche pas à l'écran, mais il se
 * télécharge : c'est le moindre mal, et la page publique le dit
 * (cf. lib/docs/fichier.ts, qui déduit de l'URL ce qui est prévisualisable).
 *
 * `CLOUDINARY_PDF_DELIVERY=1` lève la restriction côté application, une fois le
 * réglage activé côté compte. Les fichiers déposés ensuite portent leur
 * extension et deviennent prévisualisables ; ceux d'avant restent servis comme
 * ils l'étaient, sans rien casser.
 */
const FORMATS_RESTREINTS = ["pdf", "zip"] as const;

const formatBloque = (extension: string): boolean =>
  (FORMATS_RESTREINTS as readonly string[]).includes(extension) &&
  process.env.CLOUDINARY_PDF_DELIVERY?.trim() !== "1";

/** Ce que le dépôt renvoie, tel que l'enregistre `MediaAsset`. */
export type DepotResultat = {
  /** Identifiant Cloudinary — la seule prise pour supprimer plus tard. */
  publicId: string;
  /** URL de diffusion HTTPS, enregistrée telle quelle. */
  url: string;
  width: number | null;
  height: number | null;
  /** Poids réellement stocké, tel que Cloudinary le rapporte. */
  size: number;
  format: string | null;
  resourceType: "image" | "raw";
};

/** Champs du SDK effectivement lus. Le reste de la réponse ne nous sert pas. */
type ReponseUpload = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  resource_type?: string;
};

/**
 * Dépose des octets et renvoie leur adresse publique.
 *
 * `upload_stream` plutôt que l'envoi d'une chaîne `data:` : encoder 5 Mo en
 * base64 en produit 6,7 en mémoire, pour rien.
 *
 * `overwrite: false` double la protection déjà donnée par le suffixe aléatoire
 * de `nomDeDepot` : rien ne peut remplacer un fichier déjà déposé.
 */
export function deposerFichier(
  octets: Uint8Array,
  options: { filename: string; mimeType: string; sousDossier?: string },
): Promise<DepotResultat> {
  if (!preparer()) {
    return Promise.reject(
      new Error("Stockage Cloudinary non configuré (CLOUDINARY_URL absente de l'environnement)."),
    );
  }

  const resourceType = typeRessource(options.mimeType);
  const dossier = [dossierRacine(), options.sousDossier].filter(Boolean).join("/");

  return new Promise<DepotResultat>((resolve, reject) => {
    const flux = cloudinary.uploader.upload_stream(
      {
        folder: dossier,
        public_id: nomDeDepot(options.filename, resourceType),
        resource_type: resourceType,
        overwrite: false,
      },
      (erreur, reponse) => {
        if (erreur) {
          reject(new Error(erreur.message || "Dépôt Cloudinary refusé."));
          return;
        }
        if (!reponse) {
          reject(new Error("Dépôt Cloudinary sans réponse."));
          return;
        }

        const r = reponse as unknown as ReponseUpload;
        resolve({
          publicId: r.public_id,
          url: r.secure_url,
          width: r.width ?? null,
          height: r.height ?? null,
          size: r.bytes ?? octets.byteLength,
          format: r.format ?? null,
          resourceType: r.resource_type === "raw" ? "raw" : resourceType,
        });
      },
    );

    flux.on("error", (erreur: Error) => reject(erreur));
    flux.end(Buffer.from(octets));
  });
}

/**
 * Retire un fichier du compte.
 *
 * Ne lève pas : la suppression du média en base est l'opération qui compte, et
 * un échec réseau chez Cloudinary ne doit pas la bloquer. Le résidu éventuel
 * est signalé dans le journal du serveur, pas à l'utilisateur — qui ne peut
 * rien en faire.
 */
export async function supprimerFichier(publicId: string, mimeType: string): Promise<boolean> {
  if (!publicId || !preparer()) return false;

  try {
    const reponse = await cloudinary.uploader.destroy(publicId, {
      resource_type: typeRessource(mimeType),
      invalidate: true,
    });
    const resultat = (reponse as { result?: string }).result;
    if (resultat !== "ok" && resultat !== "not found") {
      console.warn("[cloudinary] suppression inaboutie", publicId, resultat);
      return false;
    }
    return true;
  } catch (erreur) {
    console.error("[cloudinary] suppression impossible", publicId, erreur);
    return false;
  }
}

/** Hôte de diffusion du compte, tel qu'il apparaît dans les URL rendues. */
export const HOTE_CLOUDINARY = "res.cloudinary.com";

/** L'URL vient-elle de notre stockage ? Sert au script de reprise et aux tests. */
export const estUrlCloudinary = (url: string | null | undefined): boolean =>
  typeof url === "string" && url.toLowerCase().startsWith(`https://${HOTE_CLOUDINARY}/`);
