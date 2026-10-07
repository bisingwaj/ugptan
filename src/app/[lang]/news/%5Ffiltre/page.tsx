import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import type { ParametresBruts } from "@/lib/url/listes";
import { ActualitesListe, lireFiltresActus, metaActualites } from "../_liste";

/**
 * « Actualités » filtrées, recherchées ou paginées — rendu à la demande.
 *
 * Jamais demandée sous cette adresse : le proxy y RÉÉCRIT `/news?categorie=…`,
 * `?tag=`, `?q=` et `?page=`, l'adresse du visiteur restant inchangée, et
 * refuse l'accès direct à `/news/_filtre` (cf. lib/url/listes.ts). Lire
 * `searchParams` ici — page ET métadonnées — est ce qui permet à la liste nue
 * (`../page.tsx`) de rester prérendue.
 *
 * Le coût reste mesuré : les trois lectures passent par le cache Redis, dont
 * les clés portent les filtres et la page (cf. lib/actus/query.ts).
 */
type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<ParametresBruts>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const [params, recherche] = await Promise.all([props.params, props.searchParams]);
  return metaActualites(asLang(params.lang), lireFiltresActus(recherche));
}

export default async function ActualitesFiltreesPage(props: Props) {
  const [params, recherche] = await Promise.all([props.params, props.searchParams]);
  return <ActualitesListe lang={asLang(params.lang)} filtres={lireFiltresActus(recherche)} />;
}
