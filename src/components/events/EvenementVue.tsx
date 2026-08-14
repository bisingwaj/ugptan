/* Page d'un événement.

   Elle REPREND la mise en page de l'article — bandeau duotone, pastille de
   catégorie, ligne mono date · lieu, titre en blanc sur l'image, colonne de
   lecture étroite, prose issue de la console — parce que c'est le gabarit de
   page de contenu du site, et qu'un second gabarit pour dire les mêmes choses
   se serait mis à diverger au premier ajustement.

   Ce qu'un événement ajoute, et qu'un article n'a pas : un encadré pratique
   (quand, où, jauge, organisateur), des appels à l'action qui suivent ce que la
   fiche permet (s'inscrire, rejoindre en ligne, en savoir plus), et un avis
   d'état quand la rencontre est en cours ou déjà passée.

   Composant serveur ; seul le partage est un îlot client. */
import Link from "next/link";
import type { EvtVue } from "@/lib/events/query";
import { dict } from "@/content/i18n";
import { evenementRoute, NAV, route } from "@/lib/routes";
import type { Lang } from "@/lib/pick";
import { Photo } from "@/components/ui/Photo";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { PartageArticle } from "@/components/actus/PartageArticle";
import { EventsGrid } from "@/components/events/EventsGrid";
import { BoutonInscription } from "@/components/events/BoutonInscription";
import { ProseRiche } from "@/components/prose/ProseRiche";

type Props = {
  evt: EvtVue;
  lang: Lang;
  lies: EvtVue[];
  precedent: EvtVue | null;
  suivant: EvtVue | null;
};

export function EvenementVue({ evt, lang, lies, precedent, suivant }: Props) {
  const t = dict(lang).evt;
  const accent = evt.accent;

  const modeLabel =
    evt.mode === "EN_LIGNE" ? t.modeEnLigne : evt.mode === "HYBRIDE" ? t.modeHybride : t.modePresentiel;

  return (
    <article>
      {/* ===== Bandeau ===== */}
      <header className="duo actu-hero" style={{ ["--duo" as string]: accent }}>
        <Photo
          src={evt.visuel.src}
          alt={evt.visuel.alt}
          priority
          unoptimized={evt.visuel.unoptimized}
          sizes="100vw"
        />

        <div className="actu-hero__inner">
          <nav className="mono actu-hero__crumb" aria-label={t.filArianeLabel}>
            <Link href={route(lang, NAV.evenements)} className="actu-hero__crumb-lien">{t.allEvents}</Link>
            {evt.categorie && <> / {evt.categorie.nom}</>}
          </nav>

          <div className="actu-hero__meta">
            {evt.categorie && (
              <span className="mono actu-hero__cat" style={{ background: accent }}>{evt.categorie.nom}</span>
            )}
            {evt.phase === "EN_COURS" && (
              <span className="mono evt-etat evt-etat--encours">{t.ongoing}</span>
            )}
            {evt.phase === "TERMINE" && <span className="mono evt-etat evt-etat--passe">{t.past}</span>}
            <time className="mono actu-hero__date" dateTime={evt.startISO}>{evt.dateLabel}</time>
            {evt.heureLabel && <span className="mono actu-hero__date">· {evt.heureLabel}</span>}
            {evt.lieu && <span className="mono actu-hero__date">· {evt.lieu}</span>}
          </div>

          <h1 className="actu-hero__titre">{evt.title}</h1>

          {evt.organisateur && (
            <p className="actu-hero__auteur">
              {t.organisateur} <strong>{evt.organisateur.nom}</strong>
            </p>
          )}
        </div>
      </header>

      {/* ===== Corps ===== */}
      <div className="actu-corps">
        <div className="actu-corps__inner">
          {/* Traduction absente : on le dit, plutôt que de laisser croire à un
              texte rédigé dans la langue de navigation. Le lien renvoie vers la
              version servie, dans son propre contexte de langue. */}
          {!evt.traduit && (
            <p className="actu-avis" role="note">
              {t.traductionAbsente(evt.langue)}
              {evt.slugs[evt.langue] && (
                <>
                  {" "}
                  <Link href={evenementRoute(evt.langue, evt.slugs[evt.langue]!)} className="actu-avis__lien">
                    {t.lireDansLaLangue(evt.langue)} →
                  </Link>
                </>
              )}
            </p>
          )}

          {/* Avis d'état. Il tient lieu de contexte : sans lui, une fiche
              détaillant une inscription close se lirait comme une invitation. */}
          {evt.phase === "TERMINE" && <p className="evt-avis" role="note">{t.termine}</p>}
          {evt.phase === "EN_COURS" && (
            <p className="evt-avis evt-avis--encours" role="note">{t.enCoursAvis}</p>
          )}

          {evt.excerpt && <p className="actu-chapeau">{evt.excerpt}</p>}

          {/* ===== Encadré pratique =====
              Le titre est HORS de la liste : `<dl>` n'admet que `<dt>`, `<dd>`
              et des `<div>` qui les regroupent. Un intertitre glissé dedans
              serait du balisage invalide, que les lecteurs d'écran annoncent de
              façon imprévisible. */}
          <section className="evt-pratique" aria-label={t.blocPratique}>
            <div className="mono evt-pratique__titre">{t.blocPratique}</div>
            <dl className="evt-pratique__liste">
              <div>
                <dt>{t.quand}</dt>
                <dd>
                  <strong>{evt.dateLabel}</strong>
                  <br />
                  {evt.allDay ? t.journee : evt.heureLabel}
                </dd>
              </div>

              <div>
                <dt>{t.ou}</dt>
                <dd>
                  {evt.lieu && <><strong>{evt.lieu}</strong><br /></>}
                  {modeLabel}
                  {evt.adresse && <><br />{evt.adresse}</>}
                </dd>
              </div>

              {evt.places && (
                <div>
                  <dt>{t.jauge}</dt>
                  <dd>{evt.places}</dd>
                </div>
              )}

              {evt.organisateur && (
                <div>
                  <dt>{t.organisateur}</dt>
                  <dd>
                    <strong>{evt.organisateur.nom}</strong>
                    {evt.organisateur.email && (
                      <>
                        <br />
                        <a href={`mailto:${evt.organisateur.email}`} className="evt-pratique__lien">
                          {evt.organisateur.email}
                        </a>
                      </>
                    )}
                    {evt.organisateur.telephone && <><br />{evt.organisateur.telephone}</>}
                    {evt.organisateur.url && (
                      <>
                        <br />
                        <a
                          href={evt.organisateur.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="evt-pratique__lien"
                        >
                          {t.enSavoirPlus} ↗
                        </a>
                      </>
                    )}
                  </dd>
                </div>
              )}

              {evt.infos && (
                <div>
                  <dt>{t.complement}</dt>
                  <dd>{evt.infos}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* ===== Appels à l'action =====
              Rien n'est proposé sur une rencontre terminée : un bouton
              « s'inscrire » sur une date passée serait une impasse.

              L'inscription prend UNE forme ou l'AUTRE, jamais les deux : quand
              un service externe tient la billetterie, c'est lui qui fait
              autorité sur les places, et ouvrir en plus le formulaire intégré
              produirait deux listes dont aucune ne serait complète. La server
              action applique la même règle de son côté (cf.
              actions/evenements-inscription.ts) : le choix ne dépend pas de ce
              que la page a bien voulu afficher. */}
          {evt.aVenir && (
            <div className="evt-actions">
              {evt.registrationUrl ? (
                <a href={evt.registrationUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                  {t.register}<span className="arrow">↗</span>
                </a>
              ) : (
                <BoutonInscription evt={evt} lang={lang} />
              )}
              {evt.onlineUrl && (
                <a href={evt.onlineUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
                  {t.rejoindre} ↗
                </a>
              )}
              {evt.externalUrl && (
                <a href={evt.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                  {t.enSavoirPlus} ↗
                </a>
              )}
            </div>
          )}

          {/* Assainissement et dessin des graphiques : cf. components/prose/ProseRiche.tsx. */}
          {evt.contentHtml && (
            <ProseRiche html={evt.contentHtml} lang={lang} style={{ marginTop: 34 }} />
          )}

          <PartageArticle lang={lang} titre={evt.title} />

          {/* ===== Navigation entre événements ===== */}
          {(precedent || suivant) && (
            <nav className="actu-nav" aria-label={t.navigationLabel}>
              {precedent ? (
                <Link href={evenementRoute(lang, precedent.slug)} className="actu-nav__lien">
                  <span className="mono actu-nav__sens">← {t.precedent}</span>
                  <span className="actu-nav__titre">{precedent.title}</span>
                </Link>
              ) : <span />}

              {suivant ? (
                <Link href={evenementRoute(lang, suivant.slug)} className="actu-nav__lien actu-nav__lien--droite">
                  <span className="mono actu-nav__sens">{t.suivant} →</span>
                  <span className="actu-nav__titre">{suivant.title}</span>
                </Link>
              ) : <span />}
            </nav>
          )}

          <p className="actu-retour">
            <Link href={route(lang, NAV.evenements)} className="mono actu-retour__lien">← {t.allEvents}</Link>
          </p>
        </div>
      </div>

      {/* ===== Autres rencontres ===== */}
      {lies.length > 0 && (
        <section className="section section--grey">
          <div className="section__inner">
            <Reveal><Kicker>{t.aVoir}</Kicker></Reveal>
            <div style={{ marginTop: 18 }}>
              <EventsGrid lang={lang} events={lies} withImage />
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
