/* Page d'article — corps de rendu partagé par l'URL publique et par l'aperçu
   d'un brouillon. Écrire les deux à partir du même composant est la seule façon
   d'être certain qu'une prévisualisation montre bien ce qui sera publié.

   Reprise fidèle du tiroir d'origine (bandeau duotone, pastille de catégorie,
   ligne mono date · lieu, titre en blanc sur l'image, colonne de lecture
   étroite), complétée de ce qu'une page d'article demande et qu'un tiroir ne
   permettait pas : auteur, durée de lecture, étiquettes, partage, navigation
   entre articles, articles liés et données structurées.

   Composant serveur ; seules la lecture vidéo et le partage sont des îlots
   clients. */
import Link from "next/link";
import type { ActuVue } from "@/lib/actus/query";
import { dict } from "@/content/i18n";
import { NAV, route } from "@/lib/routes";
import type { Lang } from "@/lib/pick";
import { Photo } from "@/components/ui/Photo";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { VideoButton } from "@/components/video/VideoButton";
import { ActuCard, cheminArticle } from "@/components/actus/ActuCard";
import { ProseRiche } from "@/components/prose/ProseRiche";
import { PartageArticle } from "@/components/actus/PartageArticle";
import { ArticleGalerie } from "@/components/actus/ArticleGalerie";

type Props = {
  actu: ActuVue;
  lang: Lang;
  lies: ActuVue[];
  precedent: ActuVue | null;
  suivant: ActuVue | null;
  /** Bandeau de prévisualisation : l'article n'est pas (encore) publié. */
  apercu?: boolean;
};

export function ArticleVue({ actu, lang, lies, precedent, suivant, apercu = false }: Props) {
  const t = dict(lang).actus;
  const accent = actu.categorie?.color ?? "var(--ac)";
  // `?? []` : une entrée de cache antérieure à la galerie n'a pas ce champ.
  const avecGalerie = (actu.galerie ?? []).length > 0;

  return (
    <article>
      {apercu && (
        <div className="actu-apercu" role="status">
          <strong>{t.apercuTitre}</strong> {t.apercuTexte}
        </div>
      )}

      {/* ===== Bandeau ===== */}
      <header className="duo actu-hero">
        <Photo
          src={actu.visuel.src}
          alt={actu.visuel.alt}
          priority
          unoptimized={actu.visuel.unoptimized}
          sizes="100vw"
        />

        <div className="actu-hero__inner">
          <nav className="mono actu-hero__crumb" aria-label={t.filArianeLabel}>
            <Link href={route(lang, NAV.actualites)} className="actu-hero__crumb-lien">{t.allNews}</Link>
            {actu.categorie && <> / {actu.categorie.nom}</>}
          </nav>

          <div className="actu-hero__meta">
            {actu.categorie && (
              <span className="mono actu-hero__cat" style={{ background: accent }}>{actu.categorie.nom}</span>
            )}
            <time className="mono actu-hero__date" dateTime={actu.dateISO}>{actu.dateLabel}</time>
            {actu.lieu && <span className="mono actu-hero__date">· {actu.lieu}</span>}
            <span className="mono actu-hero__date">· {actu.lecture} {t.minutes}</span>
          </div>

          <h1 className="actu-hero__titre">{actu.title}</h1>

          {actu.auteur && (
            <p className="actu-hero__auteur">
              {t.par} <strong>{actu.auteur.nom}</strong>
              {actu.auteur.role && <span className="actu-hero__role"> — {actu.auteur.role}</span>}
            </p>
          )}

          {/* Le PDF se télécharge dès l'en-tête : c'est souvent ce qu'on vient
              chercher sur un communiqué. Le bloc détaillé reste sous le texte. */}
          {actu.fichier && (
            <a href={actu.fichier.urlDl} className="btn btn--primary btn--sm actu-hero__pdf" download>
              <span className="arrow">↓</span> {t.pdfTelecharger}
              {actu.fichier.poids && <span className="mono actu-hero__pdf-poids">PDF · {actu.fichier.poids}</span>}
            </a>
          )}
        </div>
      </header>

      {/* ===== Corps =====
          Avec une galerie, deux colonnes sur grand écran : le texte à gauche,
          la galerie à droite, collée sous l'en-tête pendant la lecture. Sans
          galerie, la colonne de lecture centrée habituelle. Sur un écran
          étroit, la galerie se place après le texte et le PDF, avant les
          étiquettes (cf. `.actu-2col` dans globals.css). */}
      <div className="actu-corps">
        <div className={avecGalerie ? "actu-2col" : "actu-corps__inner"}>
          <div className="actu-2col__corps">
            {/* Traduction absente : on le dit, plutôt que de laisser croire à un
                texte rédigé dans la langue de navigation. Le lien renvoie vers la
                version servie, dans son propre contexte de langue. */}
            {!actu.traduit && (
              <p className="actu-avis" role="note">
                {t.traductionAbsente(actu.langue)}
                {actu.slugs[actu.langue] && (
                  <>
                    {" "}
                    <Link href={cheminArticle(actu.langue, actu.slugs[actu.langue]!)} className="actu-avis__lien">
                      {t.lireDansLaLangue(actu.langue)} →
                    </Link>
                  </>
                )}
              </p>
            )}

            {actu.excerpt && <p className="actu-chapeau">{actu.excerpt}</p>}

            {/* Assainissement et dessin des graphiques : cf. components/prose/ProseRiche.tsx. */}
            <ProseRiche html={actu.contentHtml} lang={lang} />

            {actu.videoYt && (
              <Reveal variant="fade">
                <VideoButton
                  id={actu.videoYt}
                  className="btn btn--ghost actu-video"
                  meta={{ titre: actu.title, source: "UGPTN · PTN-RDC" }}
                  dataSlot="Vidéo de l'article"
                  dataRatio="16:9"
                >
                  <span className="actu-video__play">▶</span>
                  {t.relatedVideo}
                </VideoButton>
              </Reveal>
            )}

            {/* Le PDF vient APRÈS le texte : c'est la version officielle à
                conserver, pas la porte d'entrée. Même bloc que la pièce jointe
                d'un document publié (cf. components/docs/DocumentVue.tsx). */}
            {actu.fichier && (
              <Reveal>
                <section className="doc-piece" aria-label={t.pdfTitre}>
                  <div className="doc-piece__tete">
                    <span className="doc-card__ext mono" aria-hidden="true">{actu.fichier.format}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="doc-piece__titre">{t.pdfTitre}</div>
                      <p className="doc-piece__note">{t.pdfLead}</p>
                      <p className="mono doc-piece__meta">
                        {[actu.fichier.format, actu.fichier.poids].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                  <div className="doc-piece__actions">
                    {actu.fichier.apercu && (
                      <a href={actu.fichier.url} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">
                        {t.pdfOuvrir} ↗
                      </a>
                    )}
                    {/* `download` seul ne suffit pas sur une origine tierce : c'est
                        l'URL qui porte la demande (cf. lib/docs/fichier.ts). */}
                    <a href={actu.fichier.urlDl} className="btn btn--primary btn--sm" download>
                      <span className="arrow">↓</span> {t.pdfTelecharger}
                    </a>
                  </div>
                </section>
              </Reveal>
            )}

          </div>

          {avecGalerie && (
            <aside className="actu-2col__aside" aria-label={t.galerieTitre}>
              <div className="actu-2col__colle">
                <ArticleGalerie images={actu.galerie} lang={lang} titre={t.galerieTitre} />
              </div>
            </aside>
          )}

          <div className="actu-2col__fin">
            {actu.tags.length > 0 && (
              <Reveal>
                <div className="actu-tags">
                  <span className="mono actu-tags__label">{t.etiquettes}</span>
                  {actu.tags.map((tag) => (
                    <Link
                      key={tag.slug}
                      href={`${route(lang, NAV.actualites)}?tag=${encodeURIComponent(tag.slug)}`}
                      className="actu-tag"
                    >
                      {tag.nom}
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal>
              <PartageArticle lang={lang} titre={actu.title} />
            </Reveal>

            {/* ===== Navigation entre articles ===== */}
            {(precedent || suivant) && (
              <Reveal>
                <nav className="actu-nav" aria-label={t.navigationLabel}>
                  {precedent ? (
                    <Link href={cheminArticle(lang, precedent.slug)} className="actu-nav__lien">
                      <span className="mono actu-nav__sens">← {t.precedent}</span>
                      <span className="actu-nav__titre">{precedent.title}</span>
                    </Link>
                  ) : <span />}

                  {suivant ? (
                    <Link href={cheminArticle(lang, suivant.slug)} className="actu-nav__lien actu-nav__lien--droite">
                      <span className="mono actu-nav__sens">{t.suivant} →</span>
                      <span className="actu-nav__titre">{suivant.title}</span>
                    </Link>
                  ) : <span />}
                </nav>
              </Reveal>
            )}

            <Reveal variant="fade">
              <p className="actu-retour">
                <Link href={route(lang, NAV.actualites)} className="mono actu-retour__lien">← {t.allNews}</Link>
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ===== Articles liés ===== */}
      {lies.length > 0 && (
        <section className="section section--grey">
          <div className="section__inner">
            <Reveal><Kicker>{t.aLire}</Kicker></Reveal>
            <RevealGroup
              className="celled-flow"
              style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", marginTop: 18 }}
              gap={0.04}
            >
              {lies.map((lie) => (
                <RevealItem key={lie.id} zoom>
                  <ActuCard actu={lie} lang={lang} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}
    </article>
  );
}
