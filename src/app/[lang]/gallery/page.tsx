import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
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
import { PageHero } from "@/components/ui/PageHero";
import { AlbumsBandeau } from "@/components/galerie/AlbumsBandeau";
import { GalerieGrille } from "@/components/galerie/GalerieGrille";

/**
 * Cinq minutes de cache.
 *
 * Même palier que « Rapports & analyses », et pour la même raison : rien ici ne
 * se périme tout seul — aucun classement ne dépend de l'instant présent,
 * contrairement aux événements. Les écritures de la console invalident en plus
 * explicitement cette route (cf. lib/galerie/cache.ts), donc une publication
 * paraît au premier rechargement.
 */
export const revalidate = 300;

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang).galerie;

  return {
    title: t.titre,
    description: t.lead,
    alternates: {
      canonical: `/${lang}${NAV.galerie}`,
      languages: { fr: `/fr${NAV.galerie}`, en: `/en${NAV.galerie}` },
    },
    openGraph: {
      title: `${t.titre} · UGPTN`,
      description: t.lead,
      url: `${SITE_URL}/${lang}${NAV.galerie}`,
      type: "website",
    },
  };
}

type Recherche = { rubrique?: string; type?: string; q?: string; tri?: string; media?: string };

/** Reconstruit l'URL de la galerie en conservant les filtres actifs. */
function lien(lang: string, params: Recherche, changement: Partial<Recherche>): string {
  const query = new URLSearchParams();
  const fusion = { ...params, ...changement, media: undefined };
  for (const [cle, valeur] of Object.entries(fusion)) {
    if (!valeur) continue;
    query.set(cle, String(valeur));
  }
  const suffixe = query.toString();
  const base = `/${lang}${NAV.galerie}`;
  return suffixe ? `${base}?${suffixe}` : base;
}

export default async function GaleriePage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Recherche>;
}) {
  const [params, recherche] = await Promise.all([props.params, props.searchParams]);
  const lang = asLang(params.lang);
  const t = dict(lang);
  const g = t.galerie;

  const rubrique = recherche.rubrique?.trim() || null;
  const type: GalerieTypeMedia | null =
    recherche.type && isGalType(recherche.type) ? recherche.type : null;
  const q = recherche.q?.trim() || null;
  const tri: GalerieTri = recherche.tri && isGalTri(recherche.tri) ? recherche.tri : "RANG";

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
            <div className="gal-toutes">
              <h2 className="h2--sm">{g.toutesImages}</h2>
              <p className="gal-albums__lead">{g.toutesImagesLead}</p>
            </div>
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
              <span className="mono" style={{ fontSize: 11, color: "var(--c-50)" }}>{g.sortBy}</span>
              {([["RANG", g.sortRank], ["DATE", g.sortDate], ["TITRE", g.sortTitle]] as const).map(
                ([valeur, label]) => (
                  <Link
                    key={valeur}
                    href={lien(lang, recherche, { tri: valeur })}
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
                href={lien(lang, recherche, { type: undefined })}
                className={type ? "chip" : "chip chip--on"}
                scroll={false}
              >
                {g.all} <span style={{ opacity: 0.6 }}>{totalTypes}</span>
              </Link>
              {GAL_TYPES.map((valeur) => (
                <Link
                  key={valeur}
                  href={lien(lang, recherche, { type: valeur })}
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
                href={lien(lang, recherche, { rubrique: undefined })}
                className={rubrique ? "chip" : "chip chip--on"}
                scroll={false}
              >
                {g.all}
              </Link>
              {rubriques.map((item) => (
                <Link
                  key={item.slug}
                  href={lien(lang, recherche, { rubrique: item.slug })}
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
            <p className="actu-vide">{filtre ? g.noResult : g.empty}</p>
          ) : (
            <GalerieGrille items={items} lang={lang} ouvertParDefaut={recherche.media ?? null} />
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
