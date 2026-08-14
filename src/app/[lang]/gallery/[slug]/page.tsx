import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { meta } from "@/content/data";
import { SITE_URL } from "@/lib/site";
import { NAV, route } from "@/lib/routes";
import { getAlbum, listerGalerie } from "@/lib/galerie/query";
import { PageHero } from "@/components/ui/PageHero";
import { GalerieGrille } from "@/components/galerie/GalerieGrille";

/** Même politique de cache que la galerie (cf. ../page.tsx). */
export const revalidate = 300;

/**
 * Les albums n'étant pas connus à la compilation, la page est produite à la
 * première demande puis mise en cache. `dynamicParams` est réaffirmé ici : le
 * layout de langue le fixe à `false` pour ses deux locales, ce qui n'a pas de
 * sens pour un segment dont les valeurs naissent en base.
 */
export const dynamicParams = true;

type Params = { params: Promise<{ lang: string; slug: string }>; searchParams: Promise<{ media?: string }> };

export async function generateMetadata(props: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const album = await getAlbum(lang, params.slug);

  // Album masqué, vide ou inconnu : on ne laisse pas les moteurs indexer une
  // page qui répondra 404 au visiteur suivant.
  if (!album) return { title: dict(lang).galerie.titre, robots: { index: false, follow: true } };

  const url = `${SITE_URL}/${lang}${NAV.galerie}/${album.slug}`;
  const description =
    album.description ||
    dict(lang).galerie.albumCount(album.total) + (album.lieu ? ` · ${album.lieu}` : "");

  return {
    title: album.titre,
    description,
    /* Le slug ne dépend pas de la langue — le module tient ses textes en
       colonnes bilingues, pas en table de traduction : les deux versions
       partagent donc la même adresse au préfixe de langue près. */
    alternates: {
      canonical: `/${lang}${NAV.galerie}/${album.slug}`,
      languages: {
        fr: `/fr${NAV.galerie}/${album.slug}`,
        en: `/en${NAV.galerie}/${album.slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: `${album.titre} · UGPTN`,
      description,
      url,
      siteName: "UGPTN",
      locale: lang === "en" ? "en_US" : "fr_FR",
      publishedTime: album.dateISO ?? undefined,
      images: album.couverture.src
        ? [{ url: album.couverture.src, alt: album.couverture.alt }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: album.titre,
      description,
      images: album.couverture.src ? [album.couverture.src] : undefined,
    },
  };
}

export default async function AlbumPage(props: Params) {
  const [params, recherche] = await Promise.all([props.params, props.searchParams]);
  const lang = asLang(params.lang);
  const g = dict(lang).galerie;

  const album = await getAlbum(lang, params.slug);
  if (!album) notFound();

  // Le contenu de l'album, dans l'ordre d'accrochage décidé en console.
  const items = await listerGalerie({ lang, album: album.slug });

  /**
   * Données structurées.
   *
   * `ImageGallery` décrit la page, et `about` la rattache à l'ÉVÉNEMENT couvert
   * quand sa date est connue : c'est ce qui permet à un moteur de comprendre
   * qu'il s'agit du reportage d'un atelier tenu à telle date et à tel endroit,
   * plutôt que d'une collection d'images sans lien entre elles.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: album.titre,
    ...(album.description ? { description: album.description } : {}),
    url: `${SITE_URL}/${lang}${NAV.galerie}/${album.slug}`,
    inLanguage: lang,
    ...(album.dateISO ? { datePublished: album.dateISO } : {}),
    ...(album.lieu ? { contentLocation: { "@type": "Place", name: album.lieu } } : {}),
    publisher: { "@type": "Organization", name: meta.uniteLong },
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
                ...(item.visuel.width ? { width: item.visuel.width } : {}),
                ...(item.visuel.height ? { height: item.visuel.height } : {}),
                contentUrl: item.visuel.src,
              },
      })),
    },
  };

  const chapeau = [album.lieu, album.dateLabel].filter(Boolean).join(" · ");

  return (
    <div>
      <PageHero
        crumb={`UGPTN / ${g.titre} / ${g.albumIntro}`}
        title={album.titre}
        lead={album.description || undefined}
      >
        <div className="gal-album__entete mono">
          {chapeau && <span>{chapeau}</span>}
          <span>{g.albumCount(album.total)}</span>
        </div>
      </PageHero>

      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          <div className="doc-compte">
            <Link href={route(lang, NAV.galerie)} className="actu-avis__lien">
              ← {g.albumRetour}
            </Link>
            <span className="mono">{g.count(items.length)}</span>
          </div>

          {/* `getAlbum` écarte déjà les albums sans contenu servi : cette liste
              ne peut pas être vide. Le repli existe pour la seule fenêtre où une
              photographie serait masquée entre les deux requêtes. */}
          {items.length === 0 ? (
            <p className="actu-vide">{g.empty}</p>
          ) : (
            <GalerieGrille items={items} lang={lang} ouvertParDefaut={recherche.media ?? null} />
          )}

          <p className="doc-mention">{g.disclaimer}</p>
        </div>
      </section>

      <script
        type="application/ld+json"
        // Sérialisation d'un objet que nous construisons : aucune chaîne
        // arbitraire n'y entre sans passer par JSON.stringify, qui échappe les
        // séquences dangereuses des valeurs.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
