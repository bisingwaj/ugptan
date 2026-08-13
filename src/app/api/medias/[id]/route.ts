/**
 * Service des fichiers de la bibliothèque de médias.
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

  // Média externe : on renvoie vers sa source plutôt que de la relayer — ce
  // serait faire de l'application un proxy d'images ouvert.
  if (!media.data) {
    return media.url
      ? Response.redirect(media.url, 308)
      : new Response("Média introuvable.", { status: 404 });
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
