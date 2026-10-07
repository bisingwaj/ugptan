import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import type { ParametresBruts } from "@/lib/url/listes";
import { GalerieListe, lireFiltresGalerie, metaGalerie } from "../_liste";

/**
 * « Galerie » filtrée, recherchée ou triée — rendu à la demande.
 *
 * Jamais demandée sous cette adresse : le proxy y RÉÉCRIT
 * `/gallery?rubrique=…`, `?type=`, `?q=` et `?tri=`, l'adresse du visiteur
 * restant inchangée, et refuse l'accès direct à `/gallery/_filtre`
 * (cf. lib/url/listes.ts). Lire `searchParams` ici est ce qui permet à la
 * galerie nue (`../page.tsx`) de rester prérendue. Les lectures passent par le
 * cache Redis, dont les clés portent les filtres (cf. lib/galerie/query.ts).
 */
type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<ParametresBruts>;
};

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return metaGalerie(asLang(params.lang));
}

export default async function GalerieFiltreePage(props: Props) {
  const [params, recherche] = await Promise.all([props.params, props.searchParams]);
  return <GalerieListe lang={asLang(params.lang)} filtres={lireFiltresGalerie(recherche)} />;
}
