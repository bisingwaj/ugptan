import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { NAV, route } from "@/lib/routes";
import {
  estTypeResultat,
  rechercher,
  MIN_CARACTERES,
  type TypeResultat,
} from "@/lib/recherche/query";
import { LigneResultat } from "@/components/recherche/LigneResultat";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { metaPage } from "@/lib/seo";
import { parametre } from "@/lib/url/listes";
import { normaliserRecherche } from "@/lib/cache/redis";

/**
 * Aucun cache de route.
 *
 * Les pages de section se mettent en cache parce qu'elles servent la MÊME liste
 * à tout le monde. Ici, chaque requête est une page différente : mettre en cache
 * `/search?q=fibre` ne servirait qu'au prochain visiteur tapant exactement le
 * même mot, et la mémoire dépensée à retenir toutes les requêtes du monde ne
 * rendrait rien. Les six lectures sous-jacentes, elles, gardent le cache de leur
 * propre module.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const [params, sp] = await Promise.all([props.params, props.searchParams]);
  const lang = asLang(params.lang);
  const r = dict(lang).recherche;
  /* Le titre ne reprend la requête que si elle a bien été cherchée : sous le
     seuil, la page affiche l'invitation à saisir, et l'annoncer « Recherche :
     n » promettrait des résultats qu'elle ne montre pas. */
  const saisie = normaliserRecherche(parametre(sp, "q"));
  const q = saisie.length >= MIN_CARACTERES ? saisie : "";

  return {
    ...metaPage({ lang, path: NAV.recherche, title: r.titre, description: r.lead }),
    title: q ? `${r.titre} : ${q}` : r.titre,
    /* La page NUE est une page du site, indexable comme les autres. Une page de
       RÉSULTATS ne l'est pas : elle n'existe que pour la requête qui l'a
       produite, et laisser un moteur en indexer autant qu'il en existe remplit
       l'index d'adresses qui ne mènent qu'à des listes de liens. `follow` est
       maintenu dans les deux cas : les fiches trouvées, elles, doivent être
       suivies. Le canonical, lui, désigne toujours la page nue. */
    robots: saisie
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

/** Les six portes proposées quand la page s'ouvre sans requête. */
const PORTES: {
  slug: string;
  cle:
    | "transparence"
    | "actualites"
    | "composantes"
    | "marches"
    | "evenements"
    | "galerie";
}[] = [
  { slug: NAV.transparence, cle: "transparence" },
  { slug: NAV.actualites, cle: "actualites" },
  { slug: NAV.composantes, cle: "composantes" },
  { slug: NAV.marches, cle: "marches" },
  { slug: NAV.evenements, cle: "evenements" },
  { slug: NAV.galerie, cle: "galerie" },
];

export default async function RecherchePage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, sp] = await Promise.all([props.params, props.searchParams]);
  const lang = asLang(params.lang);
  const t = dict(lang);
  const r = t.recherche;

  /* Première valeur d'un paramètre répété (`?q=a&q=b` arrive en tableau), et
     même normalisation que la requête (100 caractères au plus) : le titre et
     le champ montrent exactement ce qui a été cherché. */
  const q = normaliserRecherche(parametre(sp, "q"));
  const typeBrut = parametre(sp, "type");
  const type: TypeResultat | null =
    typeBrut && estTypeResultat(typeBrut) ? typeBrut : null;

  /* Une requête trop courte n'est pas une requête vide : le champ garde ce qui a
     été tapé, et l'écran redit ce qu'il attend plutôt que d'annoncer zéro
     résultat pour une recherche qui n'a pas eu lieu. */
  const interroge = q.length >= MIN_CARACTERES;
  const resultats = interroge ? await rechercher({ lang, q, type }) : null;

  /* Le filtre de nature ne se propose que sur une recherche SANS filtre : c'est
     là qu'on connaît la répartition réelle. Une fois filtré, on ne garde que le
     retour vers « Tout », faute de quoi les pastilles annonceraient des
     décomptes calculés sur un seul fonds. */
  const naturesTrouvees = !type && resultats ? resultats.groupes : [];

  const lienFiltre = (valeur: TypeResultat | null) => {
    const query = new URLSearchParams({ q });
    if (valeur) query.set("type", valeur);
    return `${route(lang, NAV.recherche)}?${query.toString()}`;
  };

  return (
    <div>
      {/* Pas de `PageHero` ici, à la différence de toutes les autres pages du
          site, et ce n'est pas un oubli.

          Un héros PRÉSENTE un contenu : il pose un grand titre, une accroche, et
          prépare ce qui suit. Une page de recherche ne présente rien — elle pose
          une question. Le bandeau n'y tenait donc qu'un titre sur une bande vide
          aux deux tiers, et repoussait sous un filet la seule chose que le
          visiteur vient utiliser.

          Le titre reste, ramené à sa fonction : dire, juste au-dessus du champ,
          ce que le champ interroge. */}
      <section className="rec-page">
        <div className="section__inner">
          <h1 className="rec-titre">{r.hero}</h1>
          {/* Formulaire GET : la requête vit dans l'URL, donc partageable,
              rejouable par le bouton « précédent » et opérante sans JavaScript.
              Le filtre de nature voyage en champ caché pour survivre à une
              nouvelle recherche. */}
          <form
            method="get"
            role="search"
            aria-label={r.ariaFormulaire}
            className="rec-form"
          >
            {type && <input type="hidden" name="type" value={type} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={r.champ}
              aria-label={r.ariaFormulaire}
              className="rec-form__champ"
              /* Au clavier comme au lecteur d'écran, une page de recherche
                 ouverte sans requête n'a qu'une action possible : la donner. Le
                 focus n'est PAS repris quand des résultats sont affichés, où il
                 sauterait par-dessus ce que le visiteur vient chercher. */
              autoFocus={!interroge}
            />
            <button type="submit" className="btn btn--primary">
              {r.action}
            </button>
          </form>

          {!interroge ? (
            <>
              <p className="rec-invite">{r.lead}</p>
              <nav className="rec-portes" aria-label={r.parcourir}>
                <span className="mono rec-portes__label">{r.parcourir}</span>
                {PORTES.map((porte) => (
                  <Link
                    key={porte.cle}
                    href={route(lang, porte.slug)}
                    className="chip"
                  >
                    {t.nav[porte.cle]}
                  </Link>
                ))}
              </nav>
            </>
          ) : (
            <>
              <div className="rec-compte">
                <span className="mono">
                  {r.compte(resultats!.total)} {r.pour(q)}
                </span>
                <Link
                  href={route(lang, NAV.recherche)}
                  className="actu-avis__lien"
                  scroll={false}
                >
                  {r.reinitialiser}
                </Link>
              </div>

              {(naturesTrouvees.length > 1 || type) && (
                <nav className="doc-filtres" aria-label={r.filtre}>
                  <span className="doc-filtres__label mono">{r.filtre}</span>
                  <Link
                    href={lienFiltre(null)}
                    className={type ? "chip" : "chip chip--on"}
                    scroll={false}
                  >
                    {r.tout}
                  </Link>
                  {type ? (
                    <span className="chip chip--on">{r.groupes[type]}</span>
                  ) : (
                    naturesTrouvees.map((groupe) => (
                      <Link
                        key={groupe.type}
                        href={lienFiltre(groupe.type)}
                        className="chip"
                        scroll={false}
                      >
                        {r.groupes[groupe.type]}{" "}
                        <span style={{ opacity: 0.6 }}>{groupe.total}</span>
                      </Link>
                    ))
                  )}
                </nav>
              )}

              {resultats!.reessayerDans ? (
                /* Limite de débit atteinte (cf. lib/recherche/query.ts) : la
                   recherche n'a pas eu lieu, ce n'est pas « aucun résultat ». */
                <p className="actu-vide" role="status">{r.tropRapide}</p>
              ) : resultats!.groupes.length === 0 ? (
                <p className="actu-vide">
                  {r.aucun} {r.aucunConseil}
                </p>
              ) : (
                resultats!.groupes.map((groupe) => (
                  <section
                    key={groupe.type}
                    className="rec-groupe"
                    aria-label={r.groupes[groupe.type]}
                  >
                    <div className="rec-groupe__tete">
                      <h2 className="rec-groupe__titre">
                        {r.groupes[groupe.type]}
                      </h2>
                      <span className="mono rec-groupe__compte">
                        {groupe.total}
                      </span>
                    </div>

                    {/* Cascade des lignes : `RevealGroup` EST la <ul> et
                        `RevealItem` le <li> (pas de wrapper). La translation
                        porte sur le <li>, le décalage au survol sur le lien
                        qu'il contient : les deux ne se gênent pas. */}
                    <RevealGroup as="ul" className="rec-liste" gap={0.04}>
                      {groupe.items.map((item) => (
                        <RevealItem as="li" key={item.cle}>
                          <LigneResultat
                            resultat={item}
                            etiquette={r.etiquettes[item.type]}
                          />
                        </RevealItem>
                      ))}
                    </RevealGroup>

                    {groupe.lienPlus && (
                      <Link href={groupe.lienPlus} className="rec-groupe__tout">
                        {r.voirTout(groupe.total)}
                        <span className="arrow">→</span>
                      </Link>
                    )}
                  </section>
                ))
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
