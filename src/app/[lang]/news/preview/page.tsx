import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asLang } from "@/lib/params";
import { APERCU_PARAM, verifierApercu } from "@/lib/actus/apercu";
import { apercuArticle, articlesLies, voisins } from "@/lib/actus/query";
import { ArticleVue } from "@/components/actus/ArticleVue";

/**
 * Prévisualisation d'un article non publié.
 *
 * Route distincte de `[slug]`, et non un paramètre de requête ajouté à la page
 * publique : lire `searchParams` sur cette dernière la rendrait dynamique pour
 * TOUS les visiteurs, et lui ferait perdre sa mise en cache. Ici, le rendu
 * dynamique est la règle — un brouillon change à chaque enregistrement.
 *
 * L'autorisation tient au jeton signé porté par l'URL : le cookie de session
 * est cantonné au chemin de la console et n'arrive jamais jusqu'ici
 * (cf. lib/actus/apercu.ts).
 *
 * Le segment `apercu` est réservé côté slugs (cf. lib/actus/slug.ts) : un
 * article ainsi nommé serait masqué par cette route.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aperçu",
  // Un brouillon n'a rien à faire dans un index, même si l'URL fuite.
  robots: { index: false, follow: false, nocache: true },
};

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ApercuPage(props: Props) {
  const [params, recherche] = await Promise.all([props.params, props.searchParams]);
  const lang = asLang(params.lang);

  const brut = recherche[APERCU_PARAM];
  const jeton = Array.isArray(brut) ? brut[0] : brut;

  const articleId = await verifierApercu(jeton);
  // Jeton absent, forgé ou périmé : rien ne distingue ce cas d'une URL
  // inexistante, et c'est voulu — on ne renseigne pas sur ce qui existe.
  if (!articleId) notFound();

  const actu = await apercuArticle(articleId, lang);
  if (!actu) notFound();

  const [lies, adjacents] = await Promise.all([
    articlesLies(actu, lang, 3),
    voisins(actu, lang),
  ]);

  return (
    <ArticleVue
      actu={actu}
      lang={lang}
      lies={lies}
      precedent={adjacents.precedent}
      suivant={adjacents.suivant}
      apercu
    />
  );
}
