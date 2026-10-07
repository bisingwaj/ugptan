import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import { metaRessources, RessourcesListePage, SANS_FILTRE } from "./_liste";

/**
 * Cinq minutes de cache.
 *
 * Plus long que la page « Actualités » (deux minutes) : un rapport ne se publie
 * pas à la minute, et rien ici ne se périme tout seul — aucun classement ne
 * dépend de l'instant présent, contrairement aux événements. Les écritures de la
 * console invalident en plus explicitement cette route
 * (cf. lib/docs/cache.ts), donc une publication paraît au premier rechargement.
 *
 * ⚠️ Ce délai ne vaut que tant que la page ne lit PAS `searchParams`, qui la
 * rendrait dynamique à chaque visite. Les filtres sont servis par la variante
 * `%5Ffiltre/`, vers laquelle le proxy réécrit (cf. lib/url/listes.ts) ; la
 * fiche d'un document (`?doc=`) se lit côté client.
 */
export const revalidate = 300;

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return metaRessources(asLang(params.lang));
}

export default async function RessourcesPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  return <RessourcesListePage lang={asLang(params.lang)} filtres={SANS_FILTRE} />;
}
