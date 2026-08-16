import type { Metadata } from "next";
import Link from "next/link";
import { asLang } from "@/lib/params";
import { dict } from "@/content/i18n";
import { SITE_URL } from "@/lib/site";
import { NAV, route } from "@/lib/routes";
import { listerCategoriesEvt, listerEvenements } from "@/lib/events/query";
import { EventsGrid } from "@/components/events/EventsGrid";
import { EvtFiltres } from "@/components/events/EvtFiltres";
import { Kicker } from "@/components/ui/Kicker";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Deux minutes de cache, comme la page « Actualités ».
 *
 * Le délai compte doublement ici : la page lit la base, mais elle CLASSE aussi
 * par rapport à l'instant présent. Un cache permanent laisserait un événement
 * terminé dans la section « à venir » jusqu'à la prochaine publication. Les
 * écritures de la console invalident en plus explicitement cette route
 * (cf. lib/events/cache.ts).
 */
export const revalidate = 120;

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const lang = asLang(params.lang);
  const t = dict(lang);

  return {
    title: t.nav.evenements,
    description: t.home.evtLead,
    alternates: {
      canonical: `/${lang}${NAV.evenements}`,
      languages: { fr: `/fr${NAV.evenements}`, en: `/en${NAV.evenements}` },
    },
    openGraph: {
      title: `${t.nav.evenements} · UGPTN`,
      description: t.home.evtLead,
      url: `${SITE_URL}/${lang}${NAV.evenements}`,
      type: "website",
    },
  };
}

type Recherche = { categorie?: string; q?: string };

export default async function EvenementsPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Recherche>;
}) {
  const [params, recherche] = await Promise.all([props.params, props.searchParams]);
  const lang = asLang(params.lang);
  const t = dict(lang);

  const categorie = recherche.categorie?.trim() || null;
  const q = recherche.q?.trim() || null;

  const [liste, categories] = await Promise.all([
    listerEvenements({ lang, categorie, recherche: q }),
    listerCategoriesEvt(lang),
  ]);

  const filtre = Boolean(categorie || q);
  const rien = liste.aVenir.length === 0 && liste.passes.length === 0;

  return (
    <div>
      <PageHero crumb={`UGPTN / ${t.home.evtLabel}`} title={t.home.evtTitle} lead={t.home.evtLead} />

      <section style={{ padding: "clamp(40px,5vw,60px) var(--pad-x) clamp(64px,8vw,110px)" }}>
        <div className="section__inner">
          <div className="actu-barre">
            <EvtFiltres lang={lang} categories={categories} active={categorie} recherche={q} />

            {/* Formulaire GET : la recherche vit dans l'URL, donc partageable
                et fonctionnelle sans JavaScript. */}
            <form method="get" role="search" className="actu-recherche">
              {categorie && <input type="hidden" name="categorie" value={categorie} />}
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder={t.evt.rechercher}
                aria-label={t.evt.rechercher}
                className="actu-recherche__champ"
              />
              <button type="submit" className="btn btn--outline btn--sm">{t.evt.rechercherAction}</button>
            </form>
          </div>

          {rien ? (
            <p className="evt-vide">
              {filtre ? t.evt.aucunResultat : t.evt.aucun}
              {filtre && (
                <>
                  {" "}
                  <Link href={route(lang, NAV.evenements)} className="actu-avis__lien">{t.evt.retirerFiltre}</Link>
                </>
              )}
            </p>
          ) : (
            <>
              {/* ===== À venir =====
                  Toujours en tête, y compris vide : c'est ce que le visiteur
                  vient chercher, et le dire explicitement vaut mieux que de le
                  laisser déduire d'une page qui commence par des dates
                  passées. La section disparaît en revanche quand un filtre est
                  actif et ne rapporte rien : l'absence est alors celle du
                  filtre, pas celle du calendrier. */}
              {(liste.aVenir.length > 0 || !filtre) && (
                <section className="evt-section" aria-label={t.evt.sectionAVenir}>
                  <Reveal><Kicker>{t.evt.sectionAVenir}</Kicker></Reveal>
                  <Reveal><p className="evt-section__intro">{t.evt.sectionAVenirLead}</p></Reveal>

                  {liste.aVenir.length > 0 ? (
                    <EventsGrid lang={lang} events={liste.aVenir} withImage />
                  ) : (
                    <p className="evt-vide">{t.evt.aucunAVenir}</p>
                  )}
                </section>
              )}

              {/* ===== Passés ===== */}
              {liste.passes.length > 0 && (
                <section className="evt-section" aria-label={t.evt.sectionPasses}>
                  <Reveal><Kicker>{t.evt.sectionPasses}</Kicker></Reveal>
                  <Reveal><p className="evt-section__intro">{t.evt.sectionPassesLead}</p></Reveal>
                  <EventsGrid lang={lang} events={liste.passes} withImage />
                </section>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
