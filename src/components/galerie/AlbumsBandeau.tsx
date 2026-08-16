/**
 * Bandeau des albums, en tête de la galerie.
 *
 * Composant SERVEUR, contrairement à la mosaïque : une carte d'album est un
 * LIEN vers une page, pas l'ouverture d'une visionneuse. Rien ici n'a besoin
 * d'état, donc rien n'a besoin de descendre dans le paquet du navigateur.
 *
 * Les albums viennent AVANT la mosaïque, et la mosaïque reste complète en
 * dessous — elle contient aussi les images des albums. Ce doublon est voulu :
 * un visiteur qui cherche une photographie précise la trouve dans la mosaïque
 * sans avoir à deviner de quel reportage elle vient, et celui qui veut le récit
 * d'un événement entre par l'album. Masquer les images rattachées ferait de la
 * galerie une liste de dossiers, ce qu'une galerie n'est pas.
 */
import Link from "next/link";
import { dict } from "@/content/i18n";
import { NAV } from "@/lib/routes";
import type { Lang } from "@/lib/pick";
import type { AlbumVue } from "@/lib/galerie/query";
import { Photo } from "@/components/ui/Photo";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function AlbumsBandeau({ albums, lang }: { albums: AlbumVue[]; lang: Lang }) {
  const t = dict(lang).galerie;
  if (albums.length === 0) return null;

  return (
    <section className="gal-albums" aria-labelledby="gal-albums-titre">
      <div className="gal-albums__tete">
        <div>
          <h2 id="gal-albums-titre" className="h2--sm">{t.albums}</h2>
          <p className="gal-albums__lead">{t.albumsLead}</p>
        </div>
      </div>

      {/* `RevealGroup` REMPLACE la grille et `RevealItem` la cellule : aucun
          conteneur intermédiaire, conformément au contrat du composant. */}
      <RevealGroup as="ul" className="gal-albums__grille" gap={0.05}>
        {albums.map((album) => (
          <RevealItem as="li" key={album.id} className="gal-album">
            <Link href={`/${lang}${NAV.galerie}/${album.slug}`} className="gal-album__lien">
              <span className="gal-album__visuel">
                {album.couverture.src ? (
                  <Photo
                    src={album.couverture.src}
                    alt={album.couverture.alt}
                    unoptimized={album.couverture.unoptimized}
                    sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <span className="gal-cell__plaque" aria-hidden="true" />
                )}
                <span className="gal-cell__voile" aria-hidden="true" />
                <span className="gal-album__compte mono">{t.albumCount(album.total)}</span>
              </span>

              <span className="gal-album__corps">
                <span className="gal-album__kicker mono">
                  {album.rubrique ? album.rubrique.nom : t.albumIntro}
                  {album.lieu ? ` · ${album.lieu}` : ""}
                </span>
                <span className="gal-album__titre">{album.titre}</span>
                {album.dateLabel && <span className="gal-album__date mono">{album.dateLabel}</span>}
              </span>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
