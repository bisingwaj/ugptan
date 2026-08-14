/* Page de lecture d'un rapport rédigé dans la console.

   Elle REPREND le gabarit de contenu du site — bandeau, colonne de lecture
   étroite, prose issue de la console — comme le fait déjà la fiche d'un
   événement. Ces classes (`.actu-hero`, `.actu-corps`, `.actu-prose`) ne sont
   pas propres aux actualités : elles forment la page de lecture du site, et en
   écrire une seconde pour dire les mêmes choses l'aurait fait diverger au
   premier ajustement.

   Ce qu'une publication documentaire ajoute, et qu'un article n'a pas :
     · un bandeau qui tient SANS image — un rapport n'en a pas toujours, et lui
       en inventer une n'apprendrait rien au lecteur ;
     · un encadré de références (sigle, organisme, thématique, composantes) ;
     · la pièce jointe, quand la publication en porte une.

   Composant serveur ; seul le partage est un îlot client. */
import Link from "next/link";
import type { DocVue } from "@/lib/docs/query";
import { dict } from "@/content/i18n";
import { NAV, route } from "@/lib/routes";
import type { Lang } from "@/lib/pick";
import { compRoute } from "@/lib/routes";
import { Photo } from "@/components/ui/Photo";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";
import { PartageArticle } from "@/components/actus/PartageArticle";
import { ProseRiche } from "@/components/prose/ProseRiche";

export function DocumentVue({
  document,
  lang,
  lies,
}: {
  document: DocVue;
  lang: Lang;
  lies: DocVue[];
}) {
  const t = dict(lang).ressources;
  const accent = document.categorie?.color ?? "var(--ac)";
  const avecImage = Boolean(document.visuel.src);

  const entete = (
    <div className="actu-hero__inner">
      <nav className="mono actu-hero__crumb" aria-label={t.breadcrumbLabel}>
        <Link href={route(lang, NAV.ressources)} className="actu-hero__crumb-lien">{t.titre}</Link>
        {document.categorie && <> / {document.categorie.nom}</>}
      </nav>

      <div className="actu-hero__meta">
        <span className="mono actu-hero__cat" style={{ background: accent }}>{document.typeLabel}</span>
        {document.dateLabel && (
          <time className="mono actu-hero__date" dateTime={document.dateISO ?? undefined}>
            {document.dateLabel}
          </time>
        )}
        {document.lecture !== null && (
          <span className="mono actu-hero__date">· {document.lecture} {t.minutes}</span>
        )}
      </div>

      <h1 className="actu-hero__titre">{document.titre}</h1>

      {/* La signature de l'AUTEUR, jamais le compte qui a saisi la fiche
          (cf. le modèle `Document` au schéma). */}
      {document.signature && (
        <p className="actu-hero__auteur">
          {t.by} <strong>{document.signature.nom}</strong>
          {document.signature.role && <span className="actu-hero__role"> — {document.signature.role}</span>}
        </p>
      )}
    </div>
  );

  return (
    <article>
      {/* ===== Bandeau =====
          Avec image, le duotone du site ; sans image, un bandeau sombre plein.
          Le second n'est pas un repli dégradé : c'est la forme normale d'une
          pièce documentaire, qui n'a pas de photographie à montrer. */}
      {avecImage ? (
        <header className="duo actu-hero">
          <Photo
            src={document.visuel.src}
            alt={document.visuel.alt}
            priority
            unoptimized={document.visuel.unoptimized}
            sizes="100vw"
          />
          {entete}
        </header>
      ) : (
        <header className="actu-hero doc-hero--sobre">{entete}</header>
      )}

      {/* ===== Corps ===== */}
      <div className="actu-corps">
        <div className="actu-corps__inner">
          {/* Traduction absente : on le dit, plutôt que de laisser croire à un
              texte rédigé dans la langue de navigation. */}
          {!document.traduit && (
            <p className="actu-avis" role="note">{t.notTranslated(lang === "en" ? "fr" : "en")}</p>
          )}

          {document.description && <p className="actu-chapeau">{document.description}</p>}

          <ProseRiche html={document.contenu} lang={lang} />

          {/* ===== Références =====
              Une liste de définitions, et non un tableau : ce sont des paires
              intitulé/valeur, ce que `<dl>` décrit exactement pour un lecteur
              d'écran. */}
          <section className="evt-pratique" aria-label={t.labelReference}>
            <div className="mono evt-pratique__titre">{t.labelReference}</div>
            <dl className="evt-pratique__liste">
              {document.reference && (
                <div>
                  <dt>{t.labelReference}</dt>
                  <dd className="mono">{document.reference}</dd>
                </div>
              )}
              {document.auteur && (
                <div>
                  <dt>{t.labelAuthor}</dt>
                  <dd>{document.auteur}</dd>
                </div>
              )}
              {document.categorie && (
                <div>
                  <dt>{t.labelCategory}</dt>
                  <dd>{document.categorie.nom}</dd>
                </div>
              )}
              {document.dateLabel && (
                <div>
                  <dt>{document.dateSource === "document" ? t.labelDocDate : t.labelPublished}</dt>
                  <dd>{document.dateLabel}</dd>
                </div>
              )}
              {document.comps.length > 0 && (
                <div>
                  <dt>{dict(lang).comp.titre}</dt>
                  <dd>
                    {document.comps.map((code, index) => (
                      <span key={code}>
                        {index > 0 && " · "}
                        <Link href={compRoute(lang, code)} className="evt-pratique__lien mono">{code}</Link>
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* ===== Pièce jointe =====
              La version fichier de la publication, quand elle existe. Elle vient
              APRÈS le texte : c'est un complément, pas la porte d'entrée. */}
          {document.fichier && (
            <section className="doc-piece" aria-label={t.attachment}>
              <div className="doc-piece__tete">
                <span className="doc-card__ext mono" aria-hidden="true">{document.fichier.format}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="doc-piece__titre">{t.attachment}</div>
                  <p className="doc-piece__note">{t.attachmentLead}</p>
                  <p className="mono doc-piece__meta">{document.technique}</p>
                </div>
              </div>
              <div className="doc-piece__actions">
                <a
                  href={document.fichier.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--outline btn--sm"
                >
                  {t.open} ↗
                </a>
                {/* `download` seul ne suffit pas sur une origine tierce : c'est
                    l'URL qui porte la demande (cf. lib/docs/fichier.ts). */}
                <a href={document.fichier.urlDl} className="btn btn--primary btn--sm" download>
                  <span className="arrow">↓</span> {t.download}
                </a>
              </div>
            </section>
          )}

          <PartageArticle lang={lang} titre={document.titre} />

          <p className="actu-retour">
            <Link href={route(lang, NAV.ressources)} className="mono actu-retour__lien">
              ← {t.backToList}
            </Link>
          </p>
        </div>
      </div>

      {/* ===== À lire également ===== */}
      {lies.length > 0 && (
        <section className="section section--grey">
          <div className="section__inner">
            <Reveal><Kicker>{t.alsoRead}</Kicker></Reveal>
            <RevealGroup
              className="celled-flow"
              style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", marginTop: 18 }}
              gap={0.045}
            >
              {lies.map((lie) => (
                <RevealItem key={lie.id}>
                  <Link href={lie.chemin} className="doc-lie">
                    <span className="mono doc-lie__kicker">
                      {lie.typeLabel}
                      {lie.categorie ? ` · ${lie.categorie.nom}` : ""}
                    </span>
                    <span className="doc-lie__titre">{lie.titre}</span>
                    {lie.dateLabel && <span className="mono doc-lie__date">{lie.dateLabel}</span>}
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}
    </article>
  );
}
