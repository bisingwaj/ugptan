import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { meta } from "@/content/data";
import { SITE_URL } from "@/lib/site";
import { NAV } from "@/lib/routes";
import { truncate } from "@/lib/html/sanitize";
import { evenementsLies, getEvenement, voisinsEvenement, type EvtVue } from "@/lib/events/query";
import { EvenementVue } from "@/components/events/EvenementVue";

/** Même politique de cache que le calendrier (cf. ../page.tsx). */
export const revalidate = 120;

/**
 * Les événements n'étant pas connus à la compilation, la page est produite à la
 * première demande puis mise en cache. `dynamicParams` est réaffirmé ici : le
 * layout de langue le fixe à `false` pour ses deux locales, ce qui n'a pas de
 * sens pour un segment dont les valeurs naissent en base.
 */
export const dynamicParams = true;

type Params = { params: Promise<{ lang: string; slug: string }> };

/** Description de repli : le résumé, sinon le début de la description. */
const description = (evt: EvtVue): string =>
  evt.seoDescription?.trim() || truncate(evt.excerpt, 300);

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const evt = await getEvenement(lang, params.slug);

  if (!evt) return { title: dict(lang).nav.evenements, robots: { index: false, follow: true } };

  const titre = evt.seoTitle?.trim() || evt.title;
  const url = `${SITE_URL}/${evt.langue}${NAV.evenements}/${evt.slug}`;
  const image = evt.visuel.src
    ? evt.visuel.src.startsWith("http") ? evt.visuel.src : `${SITE_URL}${evt.visuel.src}`
    : undefined;

  // `languages` ne liste que les langues RÉELLEMENT traduites : annoncer une
  // alternative qui renverrait le même texte tromperait les moteurs autant que
  // les lecteurs.
  const languages = Object.fromEntries(
    Object.entries(evt.slugs).map(([locale, slug]) => [locale, `/${locale}${NAV.evenements}/${slug}`]),
  );

  return {
    title: titre,
    description: description(evt),
    alternates: { canonical: `/${evt.langue}${NAV.evenements}/${evt.slug}`, languages },
    openGraph: {
      type: "website",
      title: titre,
      description: description(evt),
      url,
      siteName: "UGPTN",
      locale: evt.langue === "en" ? "en_US" : "fr_FR",
      images: image ? [{ url: image, alt: evt.visuel.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: titre,
      description: description(evt),
      images: image ? [image] : undefined,
    },
  };
}

/** Statut d'inscription au sens de schema.org, déduit de ce que la fiche permet. */
const modeSchema: Record<EvtVue["mode"], string> = {
  PRESENTIEL: "https://schema.org/OfflineEventAttendanceMode",
  EN_LIGNE: "https://schema.org/OnlineEventAttendanceMode",
  HYBRIDE: "https://schema.org/MixedEventAttendanceMode",
};

export default async function EvenementPage(props: Params) {
  const params = await props.params;
  const lang = asLang(params.lang);

  const evt = await getEvenement(lang, params.slug);
  if (!evt) notFound();

  // Blocs d'accompagnement : leur absence appauvrit la fin de page, elle ne doit
  // pas emporter la fiche elle-même. Une base momentanément injoignable coûte
  // donc les rencontres liées et la navigation, pas la lecture.
  const [lies, adjacents] = await Promise.all([
    evenementsLies(evt, lang, 3).catch(() => []),
    voisinsEvenement(evt, lang).catch(() => ({ precedent: null, suivant: null })),
  ]);

  const image = evt.visuel.src
    ? evt.visuel.src.startsWith("http") ? evt.visuel.src : `${SITE_URL}${evt.visuel.src}`
    : undefined;

  /**
   * Données structurées `Event`.
   *
   * `location` suit la modalité : un lieu physique pour une rencontre en salle,
   * une `VirtualLocation` pour une session en ligne. Déclarer une adresse
   * postale sur un webinaire ferait remonter la fiche dans des résultats
   * géolocalisés qui n'ont rien à voir avec elle.
   */
  const lieuSchema = evt.mode === "EN_LIGNE"
    ? { "@type": "VirtualLocation", url: evt.onlineUrl ?? `${SITE_URL}/${evt.langue}${NAV.evenements}/${evt.slug}` }
    : {
        "@type": "Place",
        name: evt.lieu ?? meta.uniteLong,
        address: evt.adresse ?? evt.lieu ?? undefined,
      };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: evt.title,
    description: description(evt),
    startDate: evt.startISO,
    endDate: evt.endISO ?? undefined,
    eventAttendanceMode: modeSchema[evt.mode],
    eventStatus: "https://schema.org/EventScheduled",
    inLanguage: evt.langue,
    location: lieuSchema,
    image: image ? [image] : undefined,
    organizer: {
      "@type": "Organization",
      name: evt.organisateur?.nom ?? meta.uniteLong,
      url: evt.organisateur?.url ?? SITE_URL,
    },
    // Une offre n'est déclarée que si l'inscription est réellement ouverte
    // quelque part : sans URL, `Offer` annoncerait une billetterie inexistante.
    offers: evt.registrationUrl
      ? { "@type": "Offer", url: evt.registrationUrl, availability: "https://schema.org/InStock" }
      : undefined,
    url: `${SITE_URL}/${evt.langue}${NAV.evenements}/${evt.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Sérialisation d'un objet que nous construisons : aucune chaîne
        // arbitraire n'y entre sans passer par JSON.stringify, qui échappe les
        // séquences dangereuses des valeurs.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <EvenementVue
        evt={evt}
        lang={lang}
        lies={lies}
        precedent={adjacents.precedent}
        suivant={adjacents.suivant}
      />
    </>
  );
}
