import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { ActualitesListe, metaActualites, SANS_FILTRE } from "./_liste";

/**
 * Deux minutes de cache.
 *
 * La page lit la base : sans ce délai, chaque visite paierait une requête, et
 * avec un cache permanent une publication n'apparaîtrait jamais. Les écritures
 * de la console invalident en plus explicitement cette route
 * (cf. lib/actus/cache.ts), de sorte qu'un article publié est visible au
 * rechargement suivant sans attendre l'expiration.
 *
 * ⚠️ Ce délai ne vaut que tant que la page ne lit PAS `searchParams` : la lire
 * la rendrait dynamique à chaque visite, `revalidate` compris. Les filtres, la
 * recherche et la pagination sont servis par la variante `%5Ffiltre/`, vers
 * laquelle le proxy réécrit les requêtes qui en portent (cf. lib/url/listes.ts).
 */
export const revalidate = 120;

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return metaActualites(asLang(params.lang), SANS_FILTRE);
}

export default async function ActualitesPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  return <ActualitesListe lang={asLang(params.lang)} filtres={SANS_FILTRE} />;
}
