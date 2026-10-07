import type { Metadata } from "next";
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { SITE_URL } from "@/lib/site";
import { NAV, route } from "@/lib/routes";
import {
  compterParType, listerAlbums, listerGalerie, listerRubriquesGalerie,
} from "@/lib/galerie/query";
import {
  GAL_TYPES, GAL_TYPE_PLURIEL, isGalTri, isGalType,
  type GalerieTri, type GalerieTypeMedia,
} from "@/lib/galerie/statut";
import { parametre, type ParametresBruts } from "@/lib/url/listes";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { AlbumsBandeau } from "@/components/galerie/AlbumsBandeau";
import { GalerieGrilleUrl } from "@/components/url/GalerieGrilleUrl";
import { metaPage } from "@/lib/seo";

/**
 * Rendu de la page « Galerie », partagé par ses deux routes : la galerie nue
 * prérendue (`page.tsx`) et la variante filtrée rendue à la demande
 * (`%5Ffiltre/page.tsx`), vers laquelle le proxy réécrit les requêtes portant
 * `?rubrique=`, `?type=`, `?q=` ou `?tri=` (cf. lib/url/listes.ts, qui dit
 * aussi pourquoi le filtrage reste serveur).
 *
 * `?media=` n'en fait pas partie : il ouvre la visionneuse sans changer la
 * mosaïque, et se lit côté client (components/url/GalerieGrilleUrl.tsx). Un
 * lien vers une photo est donc servi par la page statique.
 */

export type FiltresGalerie = {
  rubrique: string | null;
  type: GalerieTypeMedia | null;
  q: string | null;
  /** `null` : aucun tri demandé — l'ordre éditorial (`RANG`) s'applique. */
  tri: GalerieTri | null;
};

export const SANS_FILTRE: FiltresGalerie = { rubrique: null, type: null, q: null, tri: null };

/** Lecture des paramètres de la variante filtrée — tolère un paramètre répété. */
export function lireFiltresGalerie(brut: ParametresBruts): FiltresGalerie {
  const type = parametre(brut, "type");
  const tri = parametre(brut, "tri");
  return {
    rubrique: parametre(brut, "rubrique"),
    type: type && isGalType(type) ? type : null,
    q: parametre(brut, "q"),
    tri: tri && isGalTri(tri) ? tri : null,
  };
}

/**
 * Les mêmes métadonnées pour les deux routes : une galerie filtrée se rattache
 * à la galerie complète, dont elle reprend le canonical.
 */
export function metaGalerie(lang: Lang): Metadata {
  const t = dict(lang);
  return metaPage({ lang, path: NAV.galerie, title: t.galerie.titre, description: t.galerie.lead });
}

/** Reconstruit l'URL de la galerie en conservant les filtres actifs. */
function lien(lang: string, filtres: FiltresGalerie, changement: Partial<FiltresGalerie>): string {
  const query = new URLSearchParams();
  const fusion = { ...filtres, ...changement };
  for (const [cle, valeur] of Object.entries(fusion)) {
    if (!valeur) continue;
    query.set(cle, String(valeur));
  }
  const suffixe = query.toString();
  const base = `/${lang}${NAV.galerie}`;
  return suffixe ? `${base}?${suffixe}` : base;
}

export async function GalerieListe({ lang, filtres }: { lang: Lang; filtres: FiltresGalerie }) {
  const t = dict(lang);
  const g = t.galerie;
  const { rubrique, type, q } = filtres;
  const tri: GalerieTri = filtres.tri ?? "RANG";

  const [items, rubriques, parType, albums] = await Promise.all([
    listerGalerie({ lang, rubrique, type, recherche: q, tri }),
    listerRubriquesGalerie(lang),
    compterParType({ rubrique, recherche: q }),
    /* Le bandeau ne s'affiche que sur la galerie NON filtrée : une fois qu'un
       visiteur a restreint la mosaïque à « Vidéos » ou à une rubrique, lui
       présenter des reportages qui ne suivent pas son filtre le contredirait.
       La rubrique fait exception — elle s'applique aussi aux albums. */
    listerAlbums(lang, { rubrique, limite: 8 }),
  ]);

  const filtre = Boolean(rubrique || type || q);
  const bandeauAlbums = !type && !q ? albums : [];
  const totalTypes = parType.PHOTO + parType.VIDEO;

  /**
   * Données structurées.
   *
   * `ImageGallery` décrit la page ; chaque entrée est déclarée selon sa nature —
   * `ImageObject` ou `VideoObject`. La distinction n'est pas cosmétique : c'est
   * elle qui rend une vidéo éligible aux résultats vidéo des moteurs, à condition
   * de porter sa vignette et sa durée, ce que le modèle enregistre justement.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: g.titre,
    description: g.lead,
    url: `${SITE_URL}/${lang}${NAV.galerie}`,
    inLanguage: lang,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item:
          item.type === "VIDEO"
            ? {
                "@type": "VideoObject",
                name: item.titre,
                ...(item.description ? { description: item.description } : {}),
                ...(item.visuel.src ? { thumbnailUrl: item.visuel.src } : {}),
                ...(item.dateISO ? { uploadDate: item.dateISO } : {}),
                ...(item.video?.dureeISO ? { duration: item.video.dureeISO } : {}),
                ...(item.video?.source === "FICHIER" ? { contentUrl: item.video.src } : {}),
              }
            : {
                "@type": "ImageObject",
                name: item.titre,
                ...(item.description ? { description: item.description } : {}),
                ...(item.visuel.alt ? { caption: item.visuel.alt } : {}),
                ...(item.dateISO ? { datePublished: item.dateISO } : {}),
                ...(item.lieu ? { contentLocation: { "@type": "Place", name: item.lieu } } : {}),
                ...(item.visuel.width ? { width: item.visuel.width } : {}),
                ...(item.visuel.height ? { height: item.visuel.height } : {}),
                contentUrl: item.visuel.src,
              },
      })),
    },
  };

  return (
    <div>
      <PageHero crumb={`UGPTN / ${g.titre}`} title={g.hero} lead={g.lead} />

      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          <AlbumsBandeau albums={bandeauAlbums} lang={lang} />

          {/* Le titre de la mosaïque n'apparaît qu'en présence d'albums : sans
              eux, la galerie EST la mosaïque et n'a pas à s'annoncer. */}
          {bandeauAlbums.length > 0 && (
            <Reveal className="gal-toutes">
              <h2 className="h2--sm">{g.toutesImages}</h2>
              <p className="gal-albums__lead">{g.toutesImagesLead}</p>
            </Reveal>
          )}

          {/* Recherche et tri : un formulaire GET, donc partageable par URL,
              rejouable par le bouton « précédent » et fonctionnel sans
              JavaScript. Les filtres actifs voyagent en champs cachés. */}
          <div className="actu-barre">
            <form method="get" role="search" className="actu-recherche">
              {rubrique && <input type="hidden" name="rubrique" value={rubrique} />}
              {type && <input type="hidden" name="type" value={type} />}
              {tri !== "RANG" && <input type="hidden" name="tri" value={tri} />}
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder={g.search}
                aria-label={g.search}
                className="actu-recherche__champ"
              />
              <button type="submit" className="btn btn--outline btn--sm">{g.searchAction}</button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--c-60)" }}>{g.sortBy}</span>
              {([["RANG", g.sortRank], ["DATE", g.sortDate], ["TITRE", g.sortTitle]] as const).map(
                ([valeur, label]) => (
                  <Link
                    key={valeur}
                    href={lien(lang, filtres, { tri: valeur })}
                    className={tri === valeur ? "chip chip--on" : "chip"}
                    scroll={false}
                  >
                    {label}
                  </Link>
                ),
              )}
            </div>
          </div>

          {/* Nature : les deux onglets ne s'affichent que si la galerie contient
              effectivement les deux. Proposer « Vidéos » sur une galerie qui n'en
              a aucune offre un filtre qui ne peut que décevoir. */}
          {parType.PHOTO > 0 && parType.VIDEO > 0 && (
            <nav className="doc-filtres" aria-label={g.filterType}>
              <span className="doc-filtres__label mono">{g.filterType}</span>
              <Link
                href={lien(lang, filtres, { type: null })}
                className={type ? "chip" : "chip chip--on"}
                scroll={false}
              >
                {g.all} <span style={{ opacity: 0.6 }}>{totalTypes}</span>
              </Link>
              {GAL_TYPES.map((valeur) => (
                <Link
                  key={valeur}
                  href={lien(lang, filtres, { type: valeur })}
                  className={type === valeur ? "chip chip--on" : "chip"}
                  scroll={false}
                >
                  {GAL_TYPE_PLURIEL[valeur][lang]} <span style={{ opacity: 0.6 }}>{parType[valeur]}</span>
                </Link>
              ))}
            </nav>
          )}

          {rubriques.length > 0 && (
            <nav className="doc-filtres" aria-label={g.filterCategory}>
              <span className="doc-filtres__label mono">{g.filterCategory}</span>
              <Link
                href={lien(lang, filtres, { rubrique: null })}
                className={rubrique ? "chip" : "chip chip--on"}
                scroll={false}
              >
                {g.all}
              </Link>
              {rubriques.map((item) => (
                <Link
                  key={item.slug}
                  href={lien(lang, filtres, { rubrique: item.slug })}
                  className={rubrique === item.slug ? "chip chip--on" : "chip"}
                  scroll={false}
                >
                  {item.nom} <span style={{ opacity: 0.6 }}>{item.total}</span>
                </Link>
              ))}
            </nav>
          )}

          <div className="doc-compte">
            <span className="mono">{g.count(items.length)}</span>
            {filtre && (
              <Link href={route(lang, NAV.galerie)} className="actu-avis__lien" scroll={false}>
                {g.reset}
              </Link>
            )}
          </div>

          {items.length === 0 ? (
            <Reveal variant="fade"><p className="actu-vide">{filtre ? g.noResult : g.empty}</p></Reveal>
          ) : (
            <GalerieGrilleUrl items={items} lang={lang} />
          )}

          <p className="doc-mention">{g.disclaimer}</p>
        </div>
      </section>

      {items.length > 0 && (
        <script
          type="application/ld+json"
          // Sérialisation d'un objet que nous construisons : aucune chaîne
          // arbitraire n'y entre sans passer par JSON.stringify, qui échappe les
          // séquences dangereuses des valeurs.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
    </div>
  );
}
