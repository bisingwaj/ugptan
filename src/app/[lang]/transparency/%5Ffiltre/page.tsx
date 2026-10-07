import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import type { ParametresBruts } from "@/lib/url/listes";
import { lireFiltresDocs, metaRessources, RessourcesListePage } from "../_liste";

/**
 * « Rapports & analyses » filtrés, recherchés ou triés — rendu à la demande.
 *
 * Jamais demandée sous cette adresse : le proxy y RÉÉCRIT
 * `/transparency?categorie=…`, `?type=`, `?q=` et `?tri=`, l'adresse du
 * visiteur restant inchangée, et refuse l'accès direct à
 * `/transparency/_filtre` (cf. lib/url/listes.ts). Lire `searchParams` ici est
 * ce qui permet à la liste nue (`../page.tsx`) de rester prérendue. Les
 * lectures passent par le cache Redis, dont les clés portent les filtres
 * (cf. lib/docs/query.ts).
 */
type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<ParametresBruts>;
};

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return metaRessources(asLang(params.lang));
}

export default async function RessourcesFiltreesPage(props: Props) {
  const [params, recherche] = await Promise.all([props.params, props.searchParams]);
  return <RessourcesListePage lang={asLang(params.lang)} filtres={lireFiltresDocs(recherche)} />;
}
