import type { Metadata } from "next";
import { asLang } from "@/lib/params";
import type { ParametresBruts } from "@/lib/url/listes";
import { EvenementsListe, lireFiltresEvt, metaEvenements } from "../_liste";

/**
 * « Événements » filtrés ou recherchés — rendu à la demande.
 *
 * Jamais demandée sous cette adresse : le proxy y RÉÉCRIT
 * `/events?categorie=…` et `?q=`, l'adresse du visiteur restant inchangée, et
 * refuse l'accès direct à `/events/_filtre` (cf. lib/url/listes.ts). Lire
 * `searchParams` ici est ce qui permet à la liste nue (`../page.tsx`) de
 * rester prérendue. Les lectures passent par le cache Redis, dont les clés
 * portent les filtres (cf. lib/events/query.ts).
 */
type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<ParametresBruts>;
};

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  return metaEvenements(asLang(params.lang));
}

export default async function EvenementsFiltresPage(props: Props) {
  const [params, recherche] = await Promise.all([props.params, props.searchParams]);
  return <EvenementsListe lang={asLang(params.lang)} filtres={lireFiltresEvt(recherche)} />;
}
