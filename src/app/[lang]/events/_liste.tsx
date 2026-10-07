import type { Metadata } from "next";
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { NAV, route } from "@/lib/routes";
import { listerCategoriesEvt, listerEvenements } from "@/lib/events/query";
import { parametre, type ParametresBruts } from "@/lib/url/listes";
import { EventsGrid } from "@/components/events/EventsGrid";
import { EvtFiltres } from "@/components/events/EvtFiltres";
import { Kicker } from "@/components/ui/Kicker";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { metaPage } from "@/lib/seo";

/**
 * Rendu de la page « Événements », partagé par ses deux routes : la liste nue
 * prérendue (`page.tsx`) et la variante filtrée rendue à la demande
 * (`%5Ffiltre/page.tsx`), vers laquelle le proxy réécrit les requêtes portant
 * `?categorie=` ou `?q=`. Le filtrage reste serveur : la recherche porte sur le
 * corps des fiches, que la page n'expédie pas (cf. lib/url/listes.ts).
 */

export type FiltresEvt = { categorie: string | null; q: string | null };

export const SANS_FILTRE: FiltresEvt = { categorie: null, q: null };

/** Lecture des paramètres de la variante filtrée — tolère un paramètre répété. */
export function lireFiltresEvt(brut: ParametresBruts): FiltresEvt {
  return { categorie: parametre(brut, "categorie"), q: parametre(brut, "q") };
}

/**
 * Les mêmes métadonnées pour les deux routes : une liste filtrée se rattache à
 * la liste complète, dont elle reprend le canonical — c'était déjà le cas
 * quand une seule page servait les deux.
 */
export function metaEvenements(lang: Lang): Metadata {
  const t = dict(lang);
  return metaPage({ lang, path: NAV.evenements, title: t.nav.evenements, description: t.home.evtLead });
}

export async function EvenementsListe({ lang, filtres }: { lang: Lang; filtres: FiltresEvt }) {
  const t = dict(lang);
  const { categorie, q } = filtres;

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
                /* Intitulé de section en `h2` (lu, non vu) : les cartes portent
                   des `h3`, qui suivaient sinon directement le `h1` du héros.
                   Le kicker visible garde son dessin, masqué à la lecture pour
                   ne pas dire deux fois la même chose. */
                <section className="evt-section" aria-labelledby="evt-avenir-titre">
                  <h2 id="evt-avenir-titre" className="sr-only">{t.evt.sectionAVenir}</h2>
                  <Reveal><div aria-hidden="true"><Kicker>{t.evt.sectionAVenir}</Kicker></div></Reveal>
                  <Reveal delay={0.1}><p className="evt-section__intro">{t.evt.sectionAVenirLead}</p></Reveal>

                  {liste.aVenir.length > 0 ? (
                    <EventsGrid lang={lang} events={liste.aVenir} withImage />
                  ) : (
                    <Reveal variant="fade"><p className="evt-vide">{t.evt.aucunAVenir}</p></Reveal>
                  )}
                </section>
              )}

              {/* ===== Passés ===== */}
              {liste.passes.length > 0 && (
                <section className="evt-section" aria-labelledby="evt-passes-titre">
                  <h2 id="evt-passes-titre" className="sr-only">{t.evt.sectionPasses}</h2>
                  <Reveal><div aria-hidden="true"><Kicker>{t.evt.sectionPasses}</Kicker></div></Reveal>
                  <Reveal delay={0.1}><p className="evt-section__intro">{t.evt.sectionPassesLead}</p></Reveal>
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
