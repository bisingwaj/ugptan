import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_DOCS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { requirePermission } from "@/lib/auth/guard";
import { formatDate } from "@/lib/format";
import { ensureCategoriesDoc } from "@/lib/docs/bootstrap";
import { formatLisible, poidsLisible } from "@/lib/docs/fichier";
import {
  DOC_STATUTS, DOC_STATUT_LABEL, DOC_TRIS, DOC_TRI_LABEL, DOC_TYPES, DOC_TYPE_LABEL,
  isDocStatut, isDocTri, isDocType,
  type DocStatut, type DocTri, type DocType,
} from "@/lib/docs/statut";
import { DocumentActions } from "@/components/dashboard/docs/DocumentActions";

export const metadata: Metadata = { title: ADMIN_DOCS.title };

const PAR_PAGE = 20;

type Recherche = {
  statut?: string; categorie?: string; type?: string; q?: string;
  tri?: string; page?: string; supprime?: string;
};

/** Reconstruit l'URL de la liste en conservant les filtres actifs. */
function lien(params: Recherche, changement: Partial<Recherche>): string {
  const query = new URLSearchParams();
  const fusion = { ...params, ...changement };
  for (const [cle, valeur] of Object.entries(fusion)) {
    if (cle === "supprime" || !valeur) continue;
    query.set(cle, String(valeur));
  }
  const suffixe = query.toString();
  return suffixe ? `${adminPath("/documents")}?${suffixe}` : adminPath("/documents");
}

/**
 * Clause de tri de la CONSOLE.
 *
 * Volontairement distincte de celle de `lib/docs/query.ts` : cet écran trie
 * aussi sur le statut, qui n'a aucun sens côté public — toutes les lignes
 * servies y sont publiées. Les deux partagent en revanche le même vocabulaire
 * (`DocTri`), pour que « trier par date » veuille dire la même chose des deux
 * côtés.
 *
 * ⚠️ `nulls: "last"` : en SQL, un NULL trie en TÊTE d'un classement décroissant.
 * Sans cette précision, les documents non datés ouvriraient la liste.
 */
function ordreConsole(tri: DocTri) {
  const parDate = [
    { documentDate: { sort: "desc" as const, nulls: "last" as const } },
    { publishedAt: { sort: "desc" as const, nulls: "last" as const } },
  ];

  switch (tri) {
    case "DATE": return parDate;
    case "TITRE": return [{ titreFr: "asc" as const }];
    case "CATEGORIE": return [{ category: { position: "asc" as const } }, { titreFr: "asc" as const }];
    case "STATUT": return [{ status: "asc" as const }, ...parDate];
    default: return [{ featured: "desc" as const }, { position: "asc" as const }, ...parDate];
  }
}

export default async function DocumentsAdminPage(props: { searchParams: Promise<Recherche> }) {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle, donc le redirect du layout n'empêche pas cette page d'être
  // rendue et sérialisée (cf. lib/auth/guard.ts).
  await requirePermission("documents");
  // Nomenclature de départ, sur une table encore vide. Aucun document n'est
  // créé : il n'en existe aucun qui ait un fichier (cf. lib/docs/bootstrap.ts).
  await ensureCategoriesDoc();

  const params = await props.searchParams;
  const t = ADMIN_DOCS;

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const statut: DocStatut | null = params.statut && isDocStatut(params.statut) ? params.statut : null;
  const type: DocType | null = params.type && isDocType(params.type) ? params.type : null;
  const tri: DocTri = params.tri && isDocTri(params.tri) ? params.tri : "RANG";
  const categorie = params.categorie?.trim() || null;
  const q = params.q?.trim() || null;

  const where = {
    ...(statut ? { status: statut } : {}),
    ...(type ? { type } : {}),
    ...(categorie ? { categoryId: categorie } : {}),
    ...(q
      ? {
          OR: [
            { titreFr: { contains: q, mode: "insensitive" as const } },
            { titreEn: { contains: q, mode: "insensitive" as const } },
            { reference: { contains: q, mode: "insensitive" as const } },
            { auteur: { contains: q, mode: "insensitive" as const } },
            { fileName: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  // Reprise sur panne de liaison (cf. lib/lecture.ts) : le transport vers Neon
  // échoue par salves, et la liste du module ne doit pas en dépendre.
  const [total, documents, categories] = await lectureConsole(
    () => Promise.all([
      db().document.count({ where }),
      db().document.findMany({
        where,
        select: {
          id: true, status: true, type: true, titreFr: true, reference: true, auteur: true,
          publishedAt: true, documentDate: true, featured: true, position: true,
          fileName: true, fileFormat: true, fileSize: true,
          category: { select: { nomFr: true, color: true } },
        },
        orderBy: ordreConsole(tri),
        skip: (page - 1) * PAR_PAGE,
        take: PAR_PAGE,
      }),
      db().documentCategory.findMany({
        select: { id: true, nomFr: true },
        orderBy: [{ position: "asc" }, { nomFr: "asc" }],
      }),
    ]),
    "liste des documents (console)",
  );

  const pages = Math.max(1, Math.ceil(total / PAR_PAGE));
  const filtre = Boolean(statut || type || categorie || q);

  return (
    <>
      <div className="adm-entete">
        <div>
          <h1 className="adm__title">{t.title}</h1>
          <p className="adm__lead">{t.lead}</p>
        </div>
        <div className="adm-entete__actions">
          <Link href={adminPath("/documents/nouveau")} className="btn btn--primary">
            {t.nouveau}<span className="arrow">→</span>
          </Link>
          <Link href={adminPath("/documents/categories")} className="btn btn--outline btn--sm">
            {t.categoriesTitle}
          </Link>
        </div>
      </div>

      {params.supprime && <div className="adm-ok" role="status" style={{ marginTop: 18 }}>{t.supprimeOk}</div>}

      {/* Filtres : un formulaire GET, donc partageable par URL et rejouable par
          le bouton « précédent » du navigateur. */}
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
          {DOC_STATUTS.map((valeur) => (
            <option key={valeur} value={valeur}>{DOC_STATUT_LABEL[valeur]}</option>
          ))}
        </select>
        <select name="type" defaultValue={type ?? ""} aria-label={t.colType} className="field">
          <option value="">{t.tousTypes}</option>
          {DOC_TYPES.map((valeur) => (
            <option key={valeur} value={valeur}>{DOC_TYPE_LABEL[valeur].fr}</option>
          ))}
        </select>
        <select name="categorie" defaultValue={categorie ?? ""} aria-label={t.colCategorie} className="field">
          <option value="">{t.toutesCategories}</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>{item.nomFr}</option>
          ))}
        </select>
        <select name="tri" defaultValue={tri} aria-label={t.trierPar} className="field">
          {DOC_TRIS.map((valeur) => (
            <option key={valeur} value={valeur}>{t.trierPar} : {DOC_TRI_LABEL[valeur]}</option>
          ))}
        </select>
        <button type="submit" className="btn btn--outline btn--sm">{t.filtrer}</button>
        {filtre && (
          <Link href={adminPath("/documents")} className="adm-link" style={{ fontSize: 13 }}>
            {t.reinitialiser}
          </Link>
        )}
      </form>

      {documents.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 18 }}>
          <div className="adm-list__row">{filtre ? t.listeVideFiltre : t.listeVide}</div>
        </div>
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 18 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">{t.colDocument}</th>
                <th scope="col">{t.colStatut}</th>
                <th scope="col">{t.colType}</th>
                <th scope="col">{t.colCategorie}</th>
                <th scope="col">{t.colDate}</th>
                <th scope="col">{t.colFichier}</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => {
                const date = document.documentDate ?? document.publishedAt;
                const dateSource = document.documentDate ? t.dateDocument : t.datePublication;

                return (
                  <tr key={document.id}>
                    <td>
                      <Link href={adminPath(`/documents/${document.id}`)} className="adm-link">
                        {document.titreFr}
                      </Link>
                      {document.featured && <span className="adm-badge adm-badge--self">{t.une}</span>}
                      <span className="adm-table__sub">
                        {document.reference ? `${document.reference} · ` : ""}
                        {document.auteur || "Auteur non précisé"}
                      </span>
                    </td>
                    <td>
                      <span className={`adm-badge adm-statut adm-statut--${document.status.toLowerCase()}`}>
                        {DOC_STATUT_LABEL[document.status as DocStatut]}
                      </span>
                    </td>
                    <td className="adm-table__meta">{DOC_TYPE_LABEL[document.type as DocType].fr}</td>
                    <td>
                      {document.category ? (
                        <span className="adm-pastille">
                          <span
                            className="adm-pastille__point"
                            style={{ background: document.category.color ?? "var(--ac)" }}
                          />
                          {document.category.nomFr}
                        </span>
                      ) : (
                        <span className="adm-hint">{t.sansCategorie}</span>
                      )}
                    </td>
                    <td className="mono adm-table__meta">
                      {date ? formatDate(date) : t.sansDate}
                      {date && <span className="adm-table__sub">{dateSource}</span>}
                    </td>
                    <td className="mono adm-table__meta">
                      {formatLisible(document.fileName, document.fileFormat)}
                      {document.fileSize > 0 && (
                        <span className="adm-table__sub">{poidsLisible(document.fileSize)}</span>
                      )}
                    </td>
                    <td>
                      <DocumentActions
                        id={document.id}
                        enLigne={document.status === "PUBLISHED"}
                        archive={document.status === "ARCHIVED"}
                        compact
                      />
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
            <Link href={lien(params, { page: String(page - 1) })} className="btn btn--ghost btn--sm">
              ← Précédent
            </Link>
          )}
          <span className="mono adm-hint">
            Page {page} / {pages} · {total} document{total > 1 ? "s" : ""}
          </span>
          {page < pages && (
            <Link href={lien(params, { page: String(page + 1) })} className="btn btn--ghost btn--sm">
              Suivant →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
