import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN_GALERIE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { cloudinaryActif } from "@/lib/cloudinary";
import { NAV } from "@/lib/routes";
import {
  chargerAlbum, chargerContenuAlbum, chargerReferentielsGalerie,
} from "@/lib/galerie/edition";
import { GAL_STATUT_LABEL } from "@/lib/galerie/statut";
import { AlbumActions } from "@/components/dashboard/galerie/AlbumActions";
import { AlbumContenu } from "@/components/dashboard/galerie/AlbumContenu";
import { AlbumEditeur } from "@/components/dashboard/galerie/AlbumEditeur";
import { GalerieVersement } from "@/components/dashboard/galerie/GalerieVersement";

export const metadata: Metadata = { title: ADMIN_GALERIE.albumModifier };

type Recherche = { cree?: string };

export default async function ModifierAlbumPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Recherche>;
}) {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("videos");

  const { id } = await props.params;
  const params = await props.searchParams;
  const t = ADMIN_GALERIE;

  const [album, referentiels] = await Promise.all([
    chargerAlbum(id),
    chargerReferentielsGalerie(),
  ]);
  if (!album) notFound();

  const contenus = await chargerContenuAlbum(album.id, album.coverItemId || null);

  const visible = album.status === "PUBLISHED";
  const rubriqueNom =
    referentiels.categories.find((rubrique) => rubrique.id === album.categoryId)?.nom ?? null;

  /**
   * Lien vers la page publique de l'album.
   *
   * Il n'existe que si l'album est publié : un lien mort sur un album masqué
   * donnerait à croire qu'il est déjà servi. Contrairement à un contenu, dont la
   * fiche publique est un panneau de la galerie, un album A SA PAGE — d'où un
   * chemin et non un paramètre de requête.
   */
  const publicUrl = visible ? `/fr${NAV.galerie}/${album.slug}` : null;

  return (
    <>
      <Link href={adminPath("/gallery/albums")} className="adm-back">← {t.albumRetour}</Link>

      <div className="adm-entete" style={{ marginTop: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="adm__title">{album.titreFr || "(sans titre)"}</h1>
          <div className="adm-entete__meta">
            <span className={`adm-badge adm-statut adm-statut--${visible ? "published" : "draft"}`}>
              {GAL_STATUT_LABEL[album.status]}
            </span>

            <span className="adm-badge adm-badge--info">{t.albumCompte(album.total)}</span>

            {album.lieu && <span className="adm-hint">{album.lieu}</span>}
            {rubriqueNom && <span className="adm-hint">{rubriqueNom}</span>}
            <span className="mono adm-hint">/{album.slug}</span>
            {album.majLe && <span className="mono adm-hint">Modifié le {album.majLe}</span>}

            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-link"
                style={{ fontSize: 13 }}
              >
                Voir sur le site ↗
              </a>
            )}
          </div>
        </div>

        <AlbumActions id={album.id} visible={visible} />
      </div>

      {params.cree && <div className="adm-ok" role="status" style={{ marginTop: 16 }}>{t.albumCreeOk}</div>}

      {/* Le versement AVANT la fiche : après avoir créé un album, le geste
          suivant est d'y verser les photographies, pas de relire son titre. */}
      <div style={{ marginTop: 26 }}>
        <GalerieVersement albumId={album.id} stockageActif={cloudinaryActif()} />
      </div>

      <div style={{ marginTop: 18 }}>
        <AlbumContenu
          albumId={album.id}
          contenus={contenus}
          couvertureChoisie={Boolean(album.coverItemId)}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        <AlbumEditeur album={album} referentiels={referentiels} publicUrl={publicUrl} />
      </div>
    </>
  );
}
