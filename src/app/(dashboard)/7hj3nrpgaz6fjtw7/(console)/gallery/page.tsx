import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_GALERIE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { requirePermission } from "@/lib/auth/guard";
import { formatDate } from "@/lib/format";
import { ensureRubriquesGalerie } from "@/lib/galerie/bootstrap";
import {
  GAL_STATUTS, GAL_STATUT_LABEL, GAL_TRIS, GAL_TRI_LABEL, GAL_TYPES, GAL_TYPE_LABEL,
  dureeLisible, isGalStatut, isGalTri, isGalType, sourceVideo,
  type GalerieStatut, type GalerieTri, type GalerieTypeMedia,
} from "@/lib/galerie/statut";
import { GalerieActions } from "@/components/dashboard/galerie/GalerieActions";

export const metadata: Metadata = { title: ADMIN_GALERIE.title };

const PAR_PAGE = 24;

type Recherche = {
  statut?: string; rubrique?: string; type?: string; q?: string;
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
  return suffixe ? `${adminPath("/gallery")}?${suffixe}` : adminPath("/gallery");
}

/**
 * Clause de tri de la CONSOLE.
 *
 * Volontairement distincte de celle de `lib/galerie/query.ts` : cet écran voit
 * aussi les entrées masquées, et son tri par défaut doit rester celui de
 * l'accrochage pour que la rédaction retrouve la galerie telle qu'elle
 * l'ordonne. Les deux partagent le même vocabulaire (`GalerieTri`), pour que
 * « trier par date » veuille dire la même chose des deux côtés.
 *
 * ⚠️ `nulls: "last"` : en SQL, un NULL trie en TÊTE d'un classement décroissant.
 * Sans cette précision, les entrées non datées ouvriraient la liste.
 */
function ordreConsole(tri: GalerieTri) {
  const parDate = [
    { priseAt: { sort: "desc" as const, nulls: "last" as const } },
    { publishedAt: { sort: "desc" as const, nulls: "last" as const } },
  ];

  switch (tri) {
    case "DATE": return parDate;
    case "TITRE": return [{ titreFr: "asc" as const }];
    case "RUBRIQUE": return [{ category: { position: "asc" as const } }, { position: "asc" as const }];
    default: return [{ featured: "desc" as const }, { position: "asc" as const }, ...parDate];
  }
}

export default async function GalerieAdminPage(props: { searchParams: Promise<Recherche> }) {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle, donc le redirect du layout n'empêche pas cette page d'être
  // rendue et sérialisée (cf. lib/auth/guard.ts).
  await requirePermission("videos");
  // Nomenclature de départ, sur une table encore vide. Aucun contenu n'est
  // créé : il n'en existe aucun qui ait un fichier (cf. lib/galerie/bootstrap.ts).
  await ensureRubriquesGalerie();

  const params = await props.searchParams;
  const t = ADMIN_GALERIE;

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const statut: GalerieStatut | null = params.statut && isGalStatut(params.statut) ? params.statut : null;
  const type: GalerieTypeMedia | null = params.type && isGalType(params.type) ? params.type : null;
  const tri: GalerieTri = params.tri && isGalTri(params.tri) ? params.tri : "RANG";
  const rubrique = params.rubrique?.trim() || null;
  const q = params.q?.trim() || null;

  const where = {
    ...(statut ? { status: statut } : {}),
    ...(type ? { type } : {}),
    ...(rubrique ? { categoryId: rubrique } : {}),
    ...(q
      ? {
          OR: [
            { titreFr: { contains: q, mode: "insensitive" as const } },
            { titreEn: { contains: q, mode: "insensitive" as const } },
            { descriptionFr: { contains: q, mode: "insensitive" as const } },
            { lieu: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  // Reprise sur panne de liaison (cf. lib/lecture.ts) : le transport vers Neon
  // échoue par salves, et la liste du module ne doit pas en dépendre.
  const [total, items, rubriques] = await lectureConsole(
    () => Promise.all([
      db().galerieItem.count({ where }),
      db().galerieItem.findMany({
        where,
        select: {
          id: true, type: true, status: true, titreFr: true, lieu: true,
          priseAt: true, publishedAt: true, featured: true, position: true,
          imageUrl: true, altFr: true, videoYt: true, videoUrl: true, videoDuree: true,
          category: { select: { nomFr: true, color: true } },
          album: { select: { id: true, titreFr: true } },
        },
        orderBy: ordreConsole(tri),
        skip: (page - 1) * PAR_PAGE,
        take: PAR_PAGE,
      }),
      db().galerieCategory.findMany({
        select: { id: true, nomFr: true },
        orderBy: [{ position: "asc" }, { nomFr: "asc" }],
      }),
    ]),
    "liste de la galerie (console)",
  );

  const pages = Math.max(1, Math.ceil(total / PAR_PAGE));
  const filtre = Boolean(statut || type || rubrique || q);

  return (
    <>
      <div className="adm-entete">
        <div>
          <h1 className="adm__title">{t.title}</h1>
          <p className="adm__lead">{t.lead}</p>
        </div>
        <div className="adm-entete__actions">
          {/* Les albums en tête : verser un reportage entier est le geste le
              plus fréquent, ajouter une photographie isolée l'exception. */}
          <Link href={adminPath("/gallery/albums")} className="btn btn--primary">
            {t.albumsTitle}<span className="arrow">→</span>
          </Link>
          <Link href={adminPath("/gallery/new?type=PHOTO")} className="btn btn--outline btn--sm">
            {t.nouvellePhoto}
          </Link>
          <Link href={adminPath("/gallery/new?type=VIDEO")} className="btn btn--outline btn--sm">
            {t.nouvelleVideo}
          </Link>
          <Link href={adminPath("/gallery/categories")} className="btn btn--ghost btn--sm">
            {t.rubriquesTitle}
          </Link>
        </div>
      </div>

      <p className="adm-hint" style={{ marginTop: 14, maxWidth: "86ch" }}>{t.distinction}</p>

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
          {GAL_STATUTS.map((valeur) => (
            <option key={valeur} value={valeur}>{GAL_STATUT_LABEL[valeur]}</option>
          ))}
        </select>
        <select name="type" defaultValue={type ?? ""} aria-label={t.colType} className="field">
          <option value="">{t.tousTypes}</option>
          {GAL_TYPES.map((valeur) => (
            <option key={valeur} value={valeur}>{GAL_TYPE_LABEL[valeur].fr}</option>
          ))}
        </select>
        <select name="rubrique" defaultValue={rubrique ?? ""} aria-label={t.colRubrique} className="field">
          <option value="">{t.toutesRubriques}</option>
          {rubriques.map((item) => (
            <option key={item.id} value={item.id}>{item.nomFr}</option>
          ))}
        </select>
        <select name="tri" defaultValue={tri} aria-label={t.trierPar} className="field">
          {GAL_TRIS.map((valeur) => (
            <option key={valeur} value={valeur}>{t.trierPar} : {GAL_TRI_LABEL[valeur]}</option>
          ))}
        </select>
        <button type="submit" className="btn btn--outline btn--sm">{t.filtrer}</button>
        {filtre && (
          <Link href={adminPath("/gallery")} className="adm-link" style={{ fontSize: 13 }}>
            {t.reinitialiser}
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 18 }}>
          <div className="adm-list__row">{filtre ? t.listeVideFiltre : t.listeVide}</div>
        </div>
      ) : (
        /* Une GRILLE de vignettes et non un tableau, contrairement aux
           documents : ici, ce qu'on vient vérifier est l'image elle-même. Une
           ligne de texte obligerait à ouvrir chaque fiche pour savoir laquelle
           est laquelle. */
        <div className="adm-gal__liste" style={{ marginTop: 18 }}>
          {items.map((item) => {
            const date = item.priseAt ?? item.publishedAt;
            const video = item.type === "VIDEO";
            const source = sourceVideo(item);
            const duree = dureeLisible(item.videoDuree);

            return (
              <article key={item.id} className="adm-gal__carte">
                <Link
                  href={adminPath(`/gallery/${item.id}`)}
                  className="adm-gal__vignette"
                  aria-label={`${t.modifier} : ${item.titreFr}`}
                >
                  {item.imageUrl ? (
                    // Balise nue plutôt que `next/image` : écran d'administration
                    // servi à la demande, où l'optimiseur n'ajouterait qu'une
                    // transformation entre la rédaction et ce qu'elle veut voir.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.altFr ?? ""} loading="lazy" decoding="async" />
                  ) : (
                    <span className="adm-gal__vignette-vide mono">{t.vignetteAbsente}</span>
                  )}

                  {video && (
                    <span className="adm-gal__play" aria-hidden="true">
                      ▶{duree ? <em className="mono">{duree}</em> : null}
                    </span>
                  )}
                </Link>

                <div className="adm-gal__corps">
                  <div className="adm-gal__tete">
                    <span className={`adm-badge adm-statut adm-statut--${item.status === "PUBLISHED" ? "published" : "draft"}`}>
                      {GAL_STATUT_LABEL[item.status as GalerieStatut]}
                    </span>
                    <span className="adm-badge adm-badge--info">{GAL_TYPE_LABEL[item.type as GalerieTypeMedia].fr}</span>
                    {item.featured && <span className="adm-badge adm-badge--self">{t.une}</span>}
                  </div>

                  <h2 className="adm-gal__titre">
                    <Link href={adminPath(`/gallery/${item.id}`)} className="adm-link">
                      {item.titreFr || "(sans titre)"}
                    </Link>
                  </h2>

                  <div className="adm-gal__meta mono">
                    {date ? formatDate(date) : t.sansDate}
                    {item.lieu ? ` · ${item.lieu}` : ""}
                  </div>

                  <div className="adm-gal__meta">
                    {item.category ? (
                      <span className="adm-pastille">
                        <span
                          className="adm-pastille__point"
                          style={{ background: item.category.color ?? "var(--ac)" }}
                        />
                        {item.category.nomFr}
                      </span>
                    ) : (
                      <span className="adm-hint">{t.sansRubrique}</span>
                    )}
                  </div>

                  <div className="adm-gal__meta">
                    {item.album ? (
                      <Link
                        href={adminPath(`/gallery/albums/${item.album.id}`)}
                        className="adm-link"
                        style={{ fontSize: 12 }}
                      >
                        {item.album.titreFr}
                      </Link>
                    ) : (
                      <span className="adm-hint">{t.sansAlbum}</span>
                    )}
                  </div>

                  {video && source === "AUCUNE" && (
                    <p className="adm-gal__alerte">{t.videoSourceAucune}</p>
                  )}

                  <GalerieActions id={item.id} visible={item.status === "PUBLISHED"} compact />
                </div>
              </article>
            );
          })}
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
            Page {page} / {pages} · {total} contenu{total > 1 ? "s" : ""}
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
