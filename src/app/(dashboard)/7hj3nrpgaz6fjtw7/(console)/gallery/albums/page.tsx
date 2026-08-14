import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { ADMIN_GALERIE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { requirePermission } from "@/lib/auth/guard";
import { formatDate } from "@/lib/format";
import { ensureRubriquesGalerie } from "@/lib/galerie/bootstrap";
import { GAL_STATUT_LABEL, type GalerieStatut } from "@/lib/galerie/statut";
import { AlbumActions } from "@/components/dashboard/galerie/AlbumActions";

export const metadata: Metadata = { title: ADMIN_GALERIE.albumsTitle };

type Recherche = { supprime?: string };

/**
 * Champs relus pour la liste des albums.
 *
 * Extrait en constante et contraint par `satisfies` : un `select` écrit en ligne
 * dans `findMany({ … })` échappe au typecheck (cf. le commentaire détaillé dans
 * ../page.tsx). `as const` reste nécessaire devant, sans quoi les `true` se
 * généralisent en `boolean` et Prisma ne sait plus quels champs sont retenus.
 */
const ALBUMS_SELECT = {
  id: true, slug: true, status: true, titreFr: true, lieu: true,
  dateAt: true, publishedAt: true, featured: true,
  category: { select: { nomFr: true, color: true } },
  coverItem: { select: { imageUrl: true, altFr: true } },
  /* Repli de couverture : la première entrée dans l'ordre d'affichage,
     exactement comme le site la choisit (cf. lib/galerie/query.ts). */
  items: {
    select: { imageUrl: true, altFr: true },
    orderBy: [{ featured: "desc" }, { position: "asc" }],
    take: 1,
  },
  _count: { select: { items: true } },
} as const satisfies Prisma.GalerieAlbumSelect;

export default async function AlbumsPage(props: { searchParams: Promise<Recherche> }) {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle (cf. lib/auth/guard.ts).
  await requirePermission("videos");
  await ensureRubriquesGalerie();

  const params = await props.searchParams;
  const t = ADMIN_GALERIE;

  // Reprise sur panne de liaison (cf. lib/lecture.ts).
  const albums = await lectureConsole(
    () => db().galerieAlbum.findMany({
      select: ALBUMS_SELECT,
      orderBy: [
        { featured: "desc" },
        { position: "asc" },
        { dateAt: { sort: "desc", nulls: "last" } },
      ],
    }),
    "albums de la galerie (console)",
  );

  /** Le paramètre porte le NOMBRE de contenus libérés par la suppression. */
  const liberes = params.supprime ? Number.parseInt(params.supprime, 10) || 0 : null;

  return (
    <>
      <Link href={adminPath("/gallery")} className="adm-back">← {t.retourListe}</Link>

      <div className="adm-entete" style={{ marginTop: 12 }}>
        <div>
          <h1 className="adm__title">{t.albumsTitle}</h1>
          <p className="adm__lead">{t.albumsLead}</p>
        </div>
        <div className="adm-entete__actions">
          <Link href={adminPath("/gallery/albums/new")} className="btn btn--primary">
            {t.albumNouveau}<span className="arrow">→</span>
          </Link>
        </div>
      </div>

      {liberes !== null && (
        <div className="adm-ok" role="status" style={{ marginTop: 18 }}>
          Album supprimé.
          {liberes > 0
            ? ` ${liberes} contenu(s) sont restés dans la galerie, sans album.`
            : ""}
        </div>
      )}

      {albums.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 18 }}>
          <div className="adm-list__row">{t.albumsVide}</div>
        </div>
      ) : (
        <div className="adm-gal__liste" style={{ marginTop: 18 }}>
          {albums.map((album) => {
            const couverture = album.coverItem ?? album.items[0] ?? null;
            const date = album.dateAt ?? album.publishedAt;

            return (
              <article key={album.id} className="adm-gal__carte">
                <Link
                  href={adminPath(`/gallery/albums/${album.id}`)}
                  className="adm-gal__vignette"
                  aria-label={`${t.albumModifier} : ${album.titreFr}`}
                >
                  {couverture?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={couverture.imageUrl} alt={couverture.altFr ?? ""} loading="lazy" decoding="async" />
                  ) : (
                    <span className="adm-gal__vignette-vide mono">{t.albumSansContenu}</span>
                  )}
                  <span className="adm-gal__compte mono">{t.albumCompte(album._count.items)}</span>
                </Link>

                <div className="adm-gal__corps">
                  <div className="adm-gal__tete">
                    <span className={`adm-badge adm-statut adm-statut--${album.status === "PUBLISHED" ? "published" : "draft"}`}>
                      {GAL_STATUT_LABEL[album.status as GalerieStatut]}
                    </span>
                    {album.featured && <span className="adm-badge adm-badge--self">{t.une}</span>}
                  </div>

                  <h2 className="adm-gal__titre">
                    <Link href={adminPath(`/gallery/albums/${album.id}`)} className="adm-link">
                      {album.titreFr || "(sans titre)"}
                    </Link>
                  </h2>

                  <div className="adm-gal__meta mono">
                    {date ? formatDate(date) : t.sansDate}
                    {album.lieu ? ` · ${album.lieu}` : ""}
                  </div>

                  <div className="adm-gal__meta">
                    {album.category ? (
                      <span className="adm-pastille">
                        <span
                          className="adm-pastille__point"
                          style={{ background: album.category.color ?? "var(--ac)" }}
                        />
                        {album.category.nomFr}
                      </span>
                    ) : (
                      <span className="adm-hint">{t.sansRubrique}</span>
                    )}
                  </div>

                  <div className="adm-gal__meta mono">/{album.slug}</div>

                  <AlbumActions id={album.id} visible={album.status === "PUBLISHED"} compact />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
