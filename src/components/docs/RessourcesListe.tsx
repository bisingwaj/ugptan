"use client";

/**
 * Liste publique des rapports et analyses, et panneau de détail d'un document.
 *
 * Ce qui est CLIENT et ce qui ne l'est pas :
 *   · le filtrage, la recherche et le tri restent SERVEUR (formulaire GET et
 *     liens de la page). L'URL porte donc l'état de la liste : elle se partage,
 *     se met en favori, se rejoue au bouton « précédent », et les moteurs
 *     indexent chaque combinaison utile. Filtrer ici aurait obligé à charger
 *     tous les documents pour n'en montrer que huit ;
 *   · seul le PANNEAU DE DÉTAIL est client, parce qu'il s'ouvre et se ferme sans
 *     rechargement et qu'il porte l'aperçu du fichier.
 *
 * Le panneau reste ADRESSABLE malgré tout : `?doc=<id>` l'ouvre au chargement, et
 * l'ouverture met l'adresse à jour. C'est ce lien que la console donne à suivre
 * depuis la fiche d'un document publié.
 *
 * ─── Deux gestes, selon ce qu'est la pièce ──────────────────────────────────
 *
 * Une publication RÉDIGÉE se lit sur le site : sa carte mène à sa page, et le
 * panneau n'est plus qu'un résumé qui invite à l'ouvrir. Un fichier TÉLÉVERSÉ
 * n'a pas de page — le panneau EST sa fiche, avec l'aperçu du document et son
 * téléchargement. Proposer « Lire » sur un PDF, ou « Télécharger » sur un texte
 * qui n'a pas de fichier, promettrait ce qui n'existe pas.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { DocVue } from "@/lib/docs/query";
import { dict } from "@/content/i18n";
import type { Lang } from "@/lib/pick";
import { RevealGroup, RevealItem } from "@/components/motion/RevealGroup";

export function RessourcesListe({
  documents,
  lang,
  ouvertParDefaut,
}: {
  documents: DocVue[];
  lang: Lang;
  /** Identifiant porté par `?doc=` à l'arrivée sur la page. */
  ouvertParDefaut?: string | null;
}) {
  const t = dict(lang).ressources;

  const [ouvert, setOuvert] = useState<DocVue | null>(
    () => documents.find((document) => document.id === ouvertParDefaut) ?? null,
  );

  /**
   * Adresse tenue à jour SANS navigation : `replaceState` plutôt que le routeur.
   * Un `router.replace` referait un aller-retour serveur pour la seule ouverture
   * d'un panneau déjà rendu, et ferait clignoter la liste.
   */
  const majAdresse = useCallback((id: string | null) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("doc", id);
    else url.searchParams.delete("doc");
    window.history.replaceState(null, "", url);
  }, []);

  const ouvrir = (document: DocVue) => {
    setOuvert(document);
    majAdresse(document.id);
  };

  const fermer = useCallback(() => {
    setOuvert(null);
    majAdresse(null);
  }, [majAdresse]);

  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (event: KeyboardEvent) => {
      if (event.key === "Escape") fermer();
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [ouvert, fermer]);

  return (
    <>
      {/* `RevealGroup` REMPLACE la grille et `RevealItem` la cellule : aucun
          conteneur intermédiaire, conformément au contrat du composant. Une
          liste de documents est une LISTE — d'où `ul` / `li` plutôt que des
          `div`, pour que la navigation au lecteur d'écran en annonce le nombre. */}
      <RevealGroup as="ul" className="doc-grille" gap={0.045}>
        {documents.map((document) => (
          <RevealItem as="li" key={document.id} className="doc-card">
            <div className="doc-card__top">
              {/* Pastille de format, ou pastille de lecture : dans les deux cas
                  elle annonce ce qui attend le visiteur au bout du clic. */}
              <span className="doc-card__ext mono" aria-hidden="true">
                {document.fichier ? document.fichier.format : "TXT"}
              </span>
              <span className="doc-card__kicker mono">
                {document.typeLabel}
                {document.categorie ? ` · ${document.categorie.nom}` : ""}
              </span>
              {document.redige && <span className="doc-card__ligne mono">{t.onlineBadge}</span>}
              {document.featured && <span className="doc-card__une mono">{t.featured}</span>}
            </div>

            <h3 className="doc-card__titre">
              {document.reference && <span className="doc-card__ref mono">{document.reference}</span>}
              {document.titre}
            </h3>

            {document.description && <p className="doc-card__desc">{document.description}</p>}

            <div className="doc-card__meta mono">
              {document.dateLabel ? `${document.dateLabel} · ` : ""}
              {document.technique ||
                (document.lecture ? `${document.lecture} ${t.minutes}` : "")}
            </div>

            {(document.signature || document.auteur) && (
              <div className="doc-card__auteur">
                {document.signature?.nom ?? document.auteur}
              </div>
            )}

            <div className="doc-card__pied">
              <button type="button" className="btn btn--outline btn--sm" onClick={() => ouvrir(document)}>
                {t.details}
              </button>

              {document.redige ? (
                <Link href={document.chemin} className="btn btn--primary btn--sm">
                  {t.readShort} <span className="arrow">→</span>
                </Link>
              ) : (
                document.fichier && (
                  // `download` seul ne suffit pas sur une origine tierce : c'est
                  // l'URL qui porte la demande d'enregistrement
                  // (cf. lib/docs/fichier.ts).
                  <a href={document.fichier.urlDl} className="btn btn--primary btn--sm" download>
                    <span className="arrow">↓</span> {t.download}
                  </a>
                )
              )}
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      {ouvert && (
        <div className="scrim scrim--center" onClick={fermer}>
          <div
            className="modal doc-modal"
            role="dialog"
            aria-modal="true"
            aria-label={ouvert.titre}
            data-lenis-prevent
            onClick={(event) => event.stopPropagation()}
          >
            <div className="doc-modal__head">
              <div style={{ minWidth: 0 }}>
                <div className="doc-modal__kicker mono">
                  {ouvert.typeLabel}
                  {ouvert.categorie ? ` · ${ouvert.categorie.nom}` : ""}
                </div>
                <h2 className="doc-modal__titre">{ouvert.titre}</h2>
              </div>
              <button type="button" className="doc-modal__fermer" onClick={fermer} aria-label={t.close}>
                ✕
              </button>
            </div>

            <div className="doc-modal__corps">
              {ouvert.description && <p className="doc-modal__desc">{ouvert.description}</p>}

              <dl className="doc-modal__defs">
                {ouvert.reference && (
                  <div className="doc-modal__row">
                    <dt>{t.labelReference}</dt>
                    <dd className="mono">{ouvert.reference}</dd>
                  </div>
                )}
                {ouvert.dateLabel && (
                  <div className="doc-modal__row">
                    <dt>{ouvert.dateSource === "document" ? t.labelDocDate : t.labelPublished}</dt>
                    <dd>{ouvert.dateLabel}</dd>
                  </div>
                )}
                {ouvert.signature && (
                  <div className="doc-modal__row">
                    <dt>{t.labelSignature}</dt>
                    <dd>
                      {ouvert.signature.nom}
                      {ouvert.signature.role && ` — ${ouvert.signature.role}`}
                    </dd>
                  </div>
                )}
                {ouvert.auteur && (
                  <div className="doc-modal__row">
                    <dt>{t.labelAuthor}</dt>
                    <dd>{ouvert.auteur}</dd>
                  </div>
                )}
                {ouvert.fichier ? (
                  <div className="doc-modal__row">
                    <dt>{t.labelFile}</dt>
                    <dd className="mono">{ouvert.technique}</dd>
                  </div>
                ) : (
                  ouvert.lecture !== null && (
                    <div className="doc-modal__row">
                      <dt>{t.read}</dt>
                      <dd className="mono">{ouvert.lecture} {t.minutes}</dd>
                    </div>
                  )
                )}
              </dl>

              {/* L'aperçu n'a de sens que pour un fichier : une publication
                  rédigée se lit sur sa page, et en incruster le début ici
                  ferait un second gabarit de lecture à maintenir. */}
              {ouvert.fichier && (
                <div className="doc-modal__apercu">
                  <div className="label-mono">{t.preview}</div>
                  {ouvert.fichier.apercu ? (
                    <>
                      <object
                        data={ouvert.fichier.url}
                        type={ouvert.fichier.mime}
                        className="doc-modal__cadre"
                        aria-label={`${t.preview} : ${ouvert.titre}`}
                      >
                        {/* Repli quand le moteur de rendu refuse l'objet — le cas
                            d'un PDF sur la plupart des navigateurs mobiles. */}
                        <p className="doc-modal__note">{t.previewUnavailable}</p>
                      </object>
                      <p className="doc-modal__note">{t.previewNote}</p>
                    </>
                  ) : (
                    <div className="doc-modal__vide">
                      <span className="doc-card__ext mono" aria-hidden="true">{ouvert.fichier.format}</span>
                      <p className="doc-modal__note">{t.previewUnavailable}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="doc-modal__pied">
              {ouvert.fichier && (
                <>
                  <a
                    href={ouvert.fichier.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--outline btn--sm"
                  >
                    {t.open} ↗
                  </a>
                  {/* Un seul bouton principal par pied de panneau : sur une
                      publication rédigée, c'est la LECTURE, et le fichier
                      redescend au rang d'annexe. */}
                  <a
                    href={ouvert.fichier.urlDl}
                    className={`btn btn--sm ${ouvert.redige ? "btn--outline" : "btn--primary"}`}
                    download
                  >
                    <span className="arrow">↓</span> {t.download}
                  </a>
                </>
              )}

              {ouvert.redige && (
                <Link href={ouvert.chemin} className="btn btn--primary btn--sm">
                  {t.read} <span className="arrow">→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
