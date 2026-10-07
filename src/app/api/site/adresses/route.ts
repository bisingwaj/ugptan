/**
 * Segments d'adresse connus des pages de détail, à l'usage du PROXY et de lui
 * seul (cf. src/lib/url/existence.ts, qui les lit et les mémorise).
 *
 * ─── Pourquoi le proxy en a besoin ──────────────────────────────────────────
 *
 * Une fiche inexistante (`/fr/news/inexistant`) appelait bien `notFound()`,
 * mais répondait **200** : les écrans de chargement (`loading.tsx` de la
 * section, et celui du segment `[lang]` au-dessus) posent une frontière
 * Suspense, la coquille part donc avec ses en-têtes avant que la page n'ait
 * fini d'interroger la base, et le statut ne peut plus changer. Retirer le
 * `loading.tsx` du segment `[slug]` n'y suffit pas — la galerie n'en a pas et
 * répondait 200 elle aussi —, et retirer ceux des sections priverait toutes
 * les listes de leur squelette. La documentation de Next le dit en toutes
 * lettres : pour un vrai 404, l'existence doit être tranchée AVANT le rendu,
 * c'est-à-dire dans le proxy.
 *
 * ─── Un SUR-ENSEMBLE, délibérément ──────────────────────────────────────────
 *
 * La route rend TOUS les slugs (et, pour les documents, tous les identifiants),
 * quel que soit leur statut : brouillons, fiches dépubliées, documents sans
 * page de lecture compris. Le proxy ne refuse donc que ce qui n'existe nulle
 * part en base. Reproduire ici les règles de publication de chaque page
 * (`enLigne`, `albumServi`, `support: "REDIGE"`…) aurait été plus précis, mais
 * une divergence entre les deux copies aurait renvoyé 404 sur une page bien
 * réelle — l'erreur la plus grave possible. Une fiche qui existe mais n'est pas
 * servie reste traitée par la page elle-même (`notFound()`, avec `noindex`).
 *
 * ⚠️ Elle ne lit pas par `lecture()` (lib/lecture.ts), qui rend une valeur de
 * repli en cas de panne : une liste VIDE ferait répondre 404 à tout le site.
 * Une panne remonte ici en 500, et le proxy laisse alors tout passer.
 *
 * Close par la clef partagée de l'hébergement, comme `/api/site/etat` : elle
 * énumère aussi des brouillons, qui n'ont pas à être publics.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { describeError } from "@/lib/errors";

/** Jamais de cache : le proxy tient le sien, avec sa propre péremption. */
export const dynamic = "force-dynamic";

export async function GET(requete: Request): Promise<NextResponse> {
  const attendue = process.env.BETTER_AUTH_SECRET;
  if (!attendue || requete.headers.get("x-ugptn-etat") !== attendue) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const [articles, evenements, albums, documents] = await Promise.all([
      db().articleTranslation.findMany({ select: { slug: true } }),
      db().evenementTranslation.findMany({ select: { slug: true } }),
      db().galerieAlbum.findMany({ select: { slug: true } }),
      db().document.findMany({ select: { id: true, slug: true } }),
    ]);

    return NextResponse.json(
      {
        news: articles.map((a) => a.slug),
        events: evenements.map((e) => e.slug),
        gallery: albums.map((a) => a.slug),
        // Le document s'atteint par son slug OU par son identifiant (cf.
        // `getDocument`) : les deux sont des adresses valides.
        transparency: documents.flatMap((d) => (d.slug ? [d.slug, d.id] : [d.id])),
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    console.error(`[adresses] lecture impossible, le proxy laissera tout passer. ${describeError(error)}`);
    return new NextResponse(null, { status: 500, headers: { "cache-control": "no-store" } });
  }
}
