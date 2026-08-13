import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_ACTUS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { formatDateTime } from "@/lib/format";
import { LOCALES } from "@/lib/params";
import { ensureActualites } from "@/lib/actus/bootstrap";
import { ARTICLE_STATUSES, STATUT_LABEL, statutEffectif, type ArticleStatut } from "@/lib/actus/statut";
import { ArticleActions } from "@/components/dashboard/actus/ArticleActions";

export const metadata: Metadata = { title: ADMIN_ACTUS.title };

const PAR_PAGE = 20;

type Recherche = { statut?: string; categorie?: string; q?: string; page?: string; supprime?: string };

/** Reconstruit l'URL de la liste en conservant les filtres actifs. */
function lien(params: Recherche, changement: Partial<Recherche>): string {
  const query = new URLSearchParams();
  const fusion = { ...params, ...changement };
  for (const [cle, valeur] of Object.entries(fusion)) {
    if (cle === "supprime" || !valeur) continue;
    query.set(cle, String(valeur));
  }
  const suffixe = query.toString();
  return suffixe ? `${adminPath("/actualites")}?${suffixe}` : adminPath("/actualites");
}

export default async function ActualitesAdminPage(props: { searchParams: Promise<Recherche> }) {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle, donc le redirect du layout n'empêche pas cette page d'être
  // rendue et sérialisée.
  await requirePermission("actualites");
  // Reprise unique du contenu statique historique, sur une table encore vide.
  await ensureActualites();

  const params = await props.searchParams;
  const t = ADMIN_ACTUS;

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const statut = params.statut && (ARTICLE_STATUSES as readonly string[]).includes(params.statut)
    ? (params.statut as ArticleStatut)
    : null;
  const categorie = params.categorie?.trim() || null;
  const q = params.q?.trim() || null;

  const where = {
    ...(statut ? { status: statut } : {}),
    ...(categorie ? { categoryId: categorie } : {}),
    ...(q ? { translations: { some: { title: { contains: q, mode: "insensitive" as const } } } } : {}),
  };

  const [total, articles, categories] = await Promise.all([
    db().article.count({ where }),
    db().article.findMany({
      where,
      select: {
        id: true,
        status: true,
        publishedAt: true,
        featured: true,
        updatedAt: true,
        category: { select: { nomFr: true, color: true } },
        // `contentHtml` n'est pas chargé : la liste n'affiche que la présence
        // d'une traduction, et le corps pèse plusieurs kilo-octets par langue.
        translations: { select: { locale: true, title: true } },
      },
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * PAR_PAGE,
      take: PAR_PAGE,
    }),
    db().articleCategory.findMany({
      select: { id: true, nomFr: true },
      orderBy: [{ position: "asc" }, { nomFr: "asc" }],
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAR_PAGE));
  const filtre = Boolean(statut || categorie || q);

  return (
    <>
      <div className="adm-entete">
        <div>
          <h1 className="adm__title">{t.title}</h1>
          <p className="adm__lead">{t.lead}</p>
        </div>
        <div className="adm-entete__actions">
          <Link href={adminPath("/actualites/nouveau")} className="btn btn--primary">
            {t.nouveau}<span className="arrow">→</span>
          </Link>
          <Link href={adminPath("/actualites/categories")} className="btn btn--outline btn--sm">
            {t.taxoTitle}
          </Link>
        </div>
      </div>

      {params.supprime && <div className="adm-ok" role="status" style={{ marginTop: 18 }}>{t.supprimeOk}</div>}

      {/* Filtres : un formulaire GET, donc partageable par URL et rejouable
          par le bouton « précédent » du navigateur. */}
      <form method="get" className="adm-filtres" role="search">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder={t.rechercher}
          aria-label={t.rechercher}
          className="field"
        />
        <select name="statut" defaultValue={statut ?? ""} aria-label={t.colStatut} className="field">
          <option value="">{t.tousStatuts}</option>
          {ARTICLE_STATUSES.map((valeur) => (
            <option key={valeur} value={valeur}>{STATUT_LABEL[valeur]}</option>
          ))}
        </select>
        <select name="categorie" defaultValue={categorie ?? ""} aria-label={t.colCategorie} className="field">
          <option value="">{t.toutesCategories}</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>{item.nomFr}</option>
          ))}
        </select>
        <button type="submit" className="btn btn--outline btn--sm">{t.filtrer}</button>
        {filtre && (
          <Link href={adminPath("/actualites")} className="adm-link" style={{ fontSize: 13 }}>
            {t.reinitialiser}
          </Link>
        )}
      </form>

      {articles.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 18 }}>
          <div className="adm-list__row">{filtre ? t.listeVideFiltre : t.listeVide}</div>
        </div>
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 18 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">{t.colArticle}</th>
                <th scope="col">{t.colStatut}</th>
                <th scope="col">{t.colLangues}</th>
                <th scope="col">{t.colCategorie}</th>
                <th scope="col">{t.colDate}</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => {
                const effectif = statutEffectif(article.status as ArticleStatut, article.publishedAt);
                const enLigne = effectif === "PUBLISHED";
                const titre = article.translations.find((tr) => tr.locale === "fr")?.title
                  ?? article.translations[0]?.title
                  ?? "(sans titre)";

                return (
                  <tr key={article.id}>
                    <td>
                      <Link href={adminPath(`/actualites/${article.id}`)} className="adm-link">{titre}</Link>
                      {article.featured && <span className="adm-badge adm-badge--self">{t.une}</span>}
                    </td>
                    <td>
                      <span className={`adm-badge adm-statut adm-statut--${effectif.toLowerCase()}`}>
                        {STATUT_LABEL[effectif]}
                      </span>
                    </td>
                    <td>
                      <span className="adm-langues">
                        {LOCALES.map((locale) => {
                          const presente = article.translations.some((tr) => tr.locale === locale);
                          return (
                            <span
                              key={locale}
                              className={`adm-langue${presente ? " is-on" : ""}`}
                              title={presente ? `${locale.toUpperCase()} · ${t.tradPresente}` : `${locale.toUpperCase()} · ${t.tradManquante}`}
                            >
                              {locale.toUpperCase()}
                            </span>
                          );
                        })}
                      </span>
                    </td>
                    <td>
                      {article.category ? (
                        <span className="adm-pastille">
                          <span
                            className="adm-pastille__point"
                            style={{ background: article.category.color ?? "var(--ac)" }}
                          />
                          {article.category.nomFr}
                        </span>
                      ) : (
                        <span className="adm-hint">{t.sansCategorie}</span>
                      )}
                    </td>
                    <td className="mono adm-table__meta">
                      {formatDateTime(article.publishedAt) ?? t.jamaisPublie}
                    </td>
                    <td>
                      <ArticleActions id={article.id} enLigne={enLigne} compact />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav className="adm-pagination" aria-label="Pages">
          {page > 1 && (
            <Link href={lien(params, { page: String(page - 1) })} className="btn btn--ghost btn--sm">← Précédent</Link>
          )}
          <span className="mono adm-hint">Page {page} / {pages} · {total} article{total > 1 ? "s" : ""}</span>
          {page < pages && (
            <Link href={lien(params, { page: String(page + 1) })} className="btn btn--ghost btn--sm">Suivant →</Link>
          )}
        </nav>
      )}
    </>
  );
}
