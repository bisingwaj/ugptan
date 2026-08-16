import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { SITE_URL } from "@/lib/site";
import { NAV, route } from "@/lib/routes";
import { filChronologique, listerActualites, listerCategories, PAR_PAGE } from "@/lib/actus/query";
import { Kicker } from "@/components/ui/Kicker";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { ActuCard, cheminArticle } from "@/components/actus/ActuCard";
import { ActuFiltres } from "@/components/actus/ActuFiltres";

/**
 * Deux minutes de cache.
 *
 * La page lit la base : sans ce délai, chaque visite paierait une requête, et
 * avec un cache permanent une publication n'apparaîtrait jamais. Les écritures
 * de la console invalident en plus explicitement cette route
 * (cf. lib/actus/cache.ts), de sorte qu'un article publié est visible au
 * rechargement suivant sans attendre l'expiration.
 */
export const revalidate = 120;

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);

  return {
    title: t.nav.actualites,
    description: t.actus.heroLead,
    alternates: {
      canonical: `/${lang}${NAV.actualites}`,
      languages: { fr: `/fr${NAV.actualites}`, en: `/en${NAV.actualites}` },
    },
    openGraph: {
      title: `${t.nav.actualites} · UGPTN`,
      description: t.actus.heroLead,
      url: `${SITE_URL}/${lang}${NAV.actualites}`,
      type: "website",
    },
  };
}

type Recherche = { categorie?: string; tag?: string; q?: string; page?: string };

export default async function ActualitesPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Recherche>;
}) {
  const [params, recherche] = await Promise.all([props.params, props.searchParams]);
  const lang = asLang(params.lang);
  const t = dict(lang);

  const categorie = recherche.categorie?.trim() || null;
  const tag = recherche.tag?.trim() || null;
  const q = recherche.q?.trim() || null;
  const page = Math.max(1, Number.parseInt(recherche.page ?? "1", 10) || 1);

  const [liste, categories, fil] = await Promise.all([
    listerActualites({ lang, categorie, tag, recherche: q, page, parPage: PAR_PAGE }),
    listerCategories(lang),
    // Le fil ne dépend pas de `page` : il récapitule tous les articles retenus
    // par les filtres, pagination mise à part (cf. lib/actus/query.ts).
    filChronologique({ lang, categorie, tag, recherche: q }),
  ]);

  /** Conserve les filtres d'une page de résultats à l'autre. */
  const lienPage = (cible: number) => {
    const query = new URLSearchParams();
    if (categorie) query.set("categorie", categorie);
    if (tag) query.set("tag", tag);
    if (q) query.set("q", q);
    if (cible > 1) query.set("page", String(cible));
    const suffixe = query.toString();
    return `${route(lang, NAV.actualites)}${suffixe ? `?${suffixe}` : ""}`;
  };

  const filtre = Boolean(categorie || tag || q);

  return (
    <div>
      <PageHero crumb={`UGPTN / ${t.sec.actus}`} title={t.actus.heroTitle} lead={t.actus.heroLead} />

      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(56px,7vw,90px)" }}>
        <div className="section__inner">
          <div className="actu-barre">
            <ActuFiltres lang={lang} categories={categories} active={categorie} recherche={q} />

            {/* Formulaire GET : la recherche vit dans l'URL, donc partageable
                et fonctionnelle sans JavaScript. */}
            <form method="get" role="search" className="actu-recherche">
              {categorie && <input type="hidden" name="categorie" value={categorie} />}
              {tag && <input type="hidden" name="tag" value={tag} />}
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder={t.actus.rechercher}
                aria-label={t.actus.rechercher}
                className="actu-recherche__champ"
              />
              <button type="submit" className="btn btn--outline btn--sm">{t.actus.rechercherAction}</button>
            </form>
          </div>

          {tag && (
            <p className="actu-filtre-actif">
              {t.actus.filtreEtiquette} <strong>{tag}</strong>{" "}
              <Link href={route(lang, NAV.actualites)} className="actu-avis__lien">{t.actus.retirerFiltre}</Link>
            </p>
          )}

          {liste.items.length === 0 ? (
            <p className="actu-vide">
              {filtre ? t.actus.aucunResultat : t.actus.aucunArticle}
              {filtre && (
                <>
                  {" "}
                  <Link href={route(lang, NAV.actualites)} className="actu-avis__lien">{t.actus.retirerFiltre}</Link>
                </>
              )}
            </p>
          ) : (
            <RevealGroup
              className="celled-flow"
              style={{ gridTemplateColumns: "repeat(auto-fill,minmax(358px,1fr))" }}
              gap={0.045}
            >
              {liste.items.map((actu, index) => (
                <RevealItem key={actu.id}>
                  {/* Les trois premières vignettes sont au-dessus de la ligne de
                      flottaison : elles se chargent sans attendre. */}
                  <ActuCard actu={actu} lang={lang} priority={index < 3} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}

          {liste.pages > 1 && (
            <nav className="actu-pagination" aria-label={t.actus.paginationLabel}>
              {liste.page > 1 && (
                <Link href={lienPage(liste.page - 1)} rel="prev" className="btn btn--ghost btn--sm">
                  ← {t.actus.precedent}
                </Link>
              )}
              <span className="mono actu-pagination__etat">
                {t.actus.page} {liste.page} / {liste.pages}
              </span>
              {liste.page < liste.pages && (
                <Link href={lienPage(liste.page + 1)} rel="next" className="btn btn--ghost btn--sm">
                  {t.actus.suivant} →
                </Link>
              )}
            </nav>
          )}

          {/* Fil chronologique : les articles réellement publiés, dans l'ordre
              des dates. Il partage les filtres de la grille ci-dessus mais pas
              sa pagination, ce qui en fait un récapitulatif et non un doublon.
              Masqué quand il n'y a rien à montrer — l'état vide est déjà dit
              plus haut, le répéter sous un intertitre n'apprendrait rien. */}
          {fil.length > 0 && (
            <section className="actu-fil-bloc" aria-label={t.actus.timeline}>
              <Reveal>
                <Kicker>{t.actus.timeline}</Kicker>
              </Reveal>
              <Reveal>
                <p className="actu-fil__intro">{t.actus.timelineLead}</p>
              </Reveal>

              <RevealGroup as="ul" className="actu-fil" gap={0.045}>
                {fil.map((jalon, index) => (
                  <RevealItem as="li" key={jalon.id} className="actu-fil__item">
                    {/* Intertitre d'année, posé au premier article de chaque
                        millésime : sur deux ou trois ans de publications, la
                        seule date longue ne donne plus le rythme. */}
                    {(index === 0 || jalon.annee !== fil[index - 1].annee) && (
                      <div className="mono actu-fil__annee">{jalon.annee}</div>
                    )}

                    <Link href={cheminArticle(lang, jalon.slug)} className="actu-fil__lien">
                      <span className="actu-fil__puce" aria-hidden="true" />
                      <time dateTime={jalon.dateISO} className="mono actu-fil__date">{jalon.dateLabel}</time>
                      <span className="actu-fil__titre">{jalon.titre}</span>
                      {jalon.categorie && (
                        <span
                          className="mono actu-fil__cat"
                          style={{ color: jalon.categorie.color ?? "var(--ac)" }}
                        >
                          {jalon.categorie.nom}
                        </span>
                      )}
                    </Link>
                  </RevealItem>
                ))}
              </RevealGroup>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
