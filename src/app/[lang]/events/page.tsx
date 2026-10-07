import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { EvenementsListe, metaEvenements, SANS_FILTRE } from "./_liste";

/**
 * Deux minutes de cache, comme la page « Actualités ».
 *
 * Le délai compte doublement ici : la page lit la base, mais elle CLASSE aussi
 * par rapport à l'instant présent. Un cache permanent laisserait un événement
 * terminé dans la section « à venir » jusqu'à la prochaine publication. Les
 * écritures de la console invalident en plus explicitement cette route
 * (cf. lib/events/cache.ts).
 *
 * ⚠️ Ce délai ne vaut que tant que la page ne lit PAS `searchParams`, qui la
 * rendrait dynamique à chaque visite. Les filtres sont servis par la variante
 * `%5Ffiltre/`, vers laquelle le proxy réécrit (cf. lib/url/listes.ts).
 */
export const revalidate = 120;

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return metaEvenements(asLang(params.lang));
}

export default async function EvenementsPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  return <EvenementsListe lang={asLang(params.lang)} filtres={SANS_FILTRE} />;
}
