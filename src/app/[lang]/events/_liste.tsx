import type { Metadata } from "next";
import Link from "next/link";
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { NAV, route } from "@/lib/routes";
import { listerCategoriesEvt, listerEvenements } from "@/lib/events/query";
import { parametre, type ParametresBruts } from "@/lib/url/listes";
import { EventsGrid } from "@/components/events/EventsGrid";
import { EvtFiltres } from "@/components/events/EvtFiltres";
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
  const rien = liste.tous.length === 0;

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
            /* ===== Une seule grille, par date =====
                Du plus lointain à venir au plus ancien passé : les deux
                sections séparées laissaient croire, quand une seule
                rencontre était programmée, que la liste s'arrêtait là. Chaque
                carte porte son état (à venir, en cours, passé). Sans rencontre
                programmée, on le dit en tête plutôt que de le laisser déduire. */
            <section className="evt-section" aria-labelledby="evt-tous-titre">
              <h2 id="evt-tous-titre" className="sr-only">{t.evt.sectionTous}</h2>
              {liste.aVenir.length === 0 && !filtre && (
                <Reveal variant="fade"><p className="evt-vide">{t.evt.aucunAVenir}</p></Reveal>
              )}
              <EventsGrid lang={lang} events={liste.tous} withImage />
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
