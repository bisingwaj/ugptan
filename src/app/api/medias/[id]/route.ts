/**
 * Service des fichiers HISTORIQUES de la bibliothèque de médias.
 *
 * Les fichiers téléversés vivent désormais chez Cloudinary et sont servis
 * directement par son CDN : `mediaSrc()` renvoie leur URL, et cette route n'est
 * plus sur leur chemin. Elle reste indispensable pour deux raisons :
 *   - les fichiers déposés AVANT la bascule, dont les octets sont encore en
 *     base (`MediaAsset.data`), le temps que la reprise soit passée partout ;
 *   - les articles publiés qui portent `/api/medias/<id>` en dur dans leur
 *     corps HTML : une fois le média repris, la redirection ci-dessous les
 *     conduit au fichier sans qu'aucun contenu n'ait été réécrit.
 *
 * Seul endroit du dépôt qui sélectionne `MediaAsset.data` : partout ailleurs,
 * charger cette colonne ferait transiter plusieurs mégaoctets pour afficher une
 * vignette (cf. le commentaire de `lib/actus/query.ts`).
 *
 * La route est PUBLIQUE, et c'est voulu : une image de couverture doit être
 * lisible par un visiteur anonyme, un moteur de recherche et un aperçu de
 * réseau social. L'identifiant est un cuid, non énumérable.
 *
 * ⚠️ `src/proxy.ts` ignore `/api` (cf. son matcher) : cette route échappe donc
 * au préfixe de locale, ce qui est exactement l'intention — une image n'a pas
 * de langue.
 */
import { db } from "@/lib/db";
import { estCibleDeRedirectionSure } from "@/lib/medias";

/** Un fichier téléversé ne change jamais : son identifiant change avec lui. */
const CACHE = "public, max-age=31536000, immutable";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  // Les identifiants sont des cuid : refuser tout de suite ce qui n'y ressemble
  // pas évite une requête par URL sondée au hasard.
  if (!/^[a-z0-9]{20,40}$/i.test(id)) {
    return new Response("Média introuvable.", { status: 404 });
  }

  let media: { data: Uint8Array | null; mimeType: string; url: string | null } | null = null;
  try {
    media = await db().mediaAsset.findUnique({
      where: { id },
      select: { data: true, mimeType: true, url: true },
    });
  } catch (error) {
    console.error("[medias] lecture impossible", error);
    return new Response("Service indisponible.", { status: 503 });
  }

  if (!media) return new Response("Média introuvable.", { status: 404 });

  /* Fichier hébergé ailleurs — Cloudinary ou CDN tiers : on renvoie vers sa
     source plutôt que de la relayer, ce qui ferait de l'application un proxy
     d'images ouvert. La redirection est permanente : le fichier ne reviendra
     pas en base.

     ⚠️ L'hôte est VÉRIFIÉ avant de rediriger. Sans ce contrôle, cette route
     était une redirection ouverte : l'adresse redirigée vient de la base, où
     tout compte de la console — rôle « éditeur » compris — peut enregistrer un
     média externe pointant où il veut. On obtenait alors un lien portant le
     domaine officiel de l'UGPTN qui conduisait ailleurs, ce qui se prête au
     hameçonnage d'entreprises candidates comme de plaignants.

     Un hôte inconnu rend 404 et non une erreur explicite : cette route ne
     renseigne sur rien: ni sur l'existence du média, ni sur la raison du refus.
     L'exploitant, lui, trouve la cause au journal. */
  if (!media.data) {
    if (!media.url) return new Response("Média introuvable.", { status: 404 });
    if (!estCibleDeRedirectionSure(media.url)) {
      console.error(
        `[medias] redirection refusée vers un hôte non déclaré (média ${id}). ` +
          "Ajouter l'hôte à HOTES_OPTIMISABLES (lib/medias.ts) ET à images.remotePatterns (next.config.mjs), ou re-téléverser le fichier.",
      );
      return new Response("Média introuvable.", { status: 404 });
    }
    return Response.redirect(media.url, 308);
  }

  const octets = new Uint8Array(media.data);

  return new Response(octets, {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(octets.byteLength),
      "Cache-Control": CACHE,
      // Le contenu vient d'un téléversement : on interdit au navigateur de
      // deviner un autre type que celui annoncé.
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
