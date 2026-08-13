"use client";

/**
 * Prévisualisation d'un document avant sa mise en ligne.
 *
 * Deux choses à vérifier avant de publier, et la modale les met côte à côte :
 *
 *   · la FICHE telle que le visiteur la lira — titre, nature, thématique,
 *     dates, organisme, description, ligne technique ;
 *   · le FICHIER lui-même, rendu par le navigateur quand il sait le faire.
 *     C'est le contrôle qui attrape le mauvais PDF glissé dans le bon
 *     formulaire, et aucune métadonnée ne le remplace.
 *
 * ⚠️ L'aperçu montre l'état ENREGISTRÉ, pas la saisie en cours. Refléter les
 * champs non encore soumis donnerait à voir une page qui n'existe pas côté
 * serveur — et laisserait publier sur la foi d'un aperçu qui ne correspond à
 * rien. L'écran le dit plutôt que de le taire.
 */
import { useEffect, useState } from "react";
import { ADMIN_DOCS } from "@/content/admin";
import type { DocumentSaisie } from "@/lib/docs/saisie";
import { apercuPossible, formatLisible, ligneTechnique } from "@/lib/docs/fichier";
import { DOC_TYPE_LABEL } from "@/lib/docs/statut";

/** Date d'un `<input type="date">` (« 2026-03-18 ») en toutes lettres. */
const dateFr = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function enClair(valeur: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valeur)) return null;
  // Midi plutôt que minuit : la valeur est interprétée dans le fuseau du
  // navigateur, et minuit UTC reculerait d'un jour à l'ouest de Greenwich.
  const date = new Date(`${valeur}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : dateFr.format(date);
}

export function DocumentApercu({
  document,
  categorieNom,
}: {
  document: DocumentSaisie & { id: string };
  categorieNom: string | null;
}) {
  const t = ADMIN_DOCS;
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOuvert(false);
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [ouvert]);

  const fichier = document.fichier;
  const date = enClair(document.documentDate) ?? enClair(document.publishedAt);
  const dateSource = enClair(document.documentDate) ? t.dateDocument : t.datePublication;

  return (
    <>
      <button type="button" className="btn btn--outline btn--sm" onClick={() => setOuvert(true)}>
        {t.apercuOuvrir}
      </button>

      {ouvert && (
        <div
          className="adm-modal"
          role="dialog"
          aria-modal="true"
          aria-label={t.apercuTitre}
          onClick={() => setOuvert(false)}
        >
          <div className="adm-modal__panel" onClick={(event) => event.stopPropagation()}>
            <div className="adm-modal__head">
              <div>
                <div className="adm-modal__titre">{t.apercuTitre}</div>
                <p className="adm-hint" style={{ marginTop: 4 }}>{t.apercuLead}</p>
              </div>
              <button
                type="button"
                className="adm-modal__fermer"
                onClick={() => setOuvert(false)}
                aria-label={t.apercuFermer}
              >
                ✕
              </button>
            </div>

            <div className="adm-modal__corps">
              <div className="adm-doc__apercu">
                {/* La fiche, dans l'ordre où le visiteur la parcourt. */}
                <div className="adm-doc__apercu-fiche">
                  <div className="adm-doc__apercu-kicker mono">
                    {DOC_TYPE_LABEL[document.type].fr}
                    {categorieNom ? ` · ${categorieNom}` : ""}
                    {document.reference ? ` · ${document.reference}` : ""}
                  </div>

                  <h3 className="adm-doc__apercu-titre">{document.titreFr || "(sans titre)"}</h3>

                  {document.descriptionFr && (
                    <p className="adm-doc__apercu-desc">{document.descriptionFr}</p>
                  )}

                  <dl className="adm-defs">
                    {date && (
                      <div className="adm-defs__row">
                        <dt>{dateSource}</dt>
                        <dd className="adm-defs__val">{date}</dd>
                      </div>
                    )}
                    {document.auteur && (
                      <div className="adm-defs__row">
                        <dt>Auteur</dt>
                        <dd className="adm-defs__val">{document.auteur}</dd>
                      </div>
                    )}
                    {fichier && (
                      <div className="adm-defs__row">
                        <dt>Fichier</dt>
                        <dd className="adm-defs__val mono">
                          {ligneTechnique({
                            fileName: fichier.nom,
                            fileFormat: fichier.format,
                            fileSize: fichier.taille,
                            langue: document.langue,
                          })}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {document.titreEn.trim() === "" && (
                    <p className="adm-hint">
                      Aucun titre anglais : les lecteurs anglophones verront le titre français.
                    </p>
                  )}
                </div>

                {/* Le fichier, quand le navigateur sait le rendre. */}
                <div className="adm-doc__apercu-fichier">
                  <div className="label-mono">{t.apercuFichier}</div>
                  {!fichier ? (
                    <p className="adm-hint">{t.fichierAucun}</p>
                  ) : apercuPossible(fichier.mime, fichier.url) ? (
                    <object
                      data={fichier.url}
                      type={fichier.mime}
                      className="adm-doc__apercu-cadre"
                      aria-label={`${t.apercuFichier} : ${fichier.nom}`}
                    >
                      {/* Repli quand le moteur de rendu refuse l'objet — un PDF
                          sur un navigateur mobile, par exemple. */}
                      <p className="adm-hint">
                        {t.apercuIndisponible}{" "}
                        <a href={fichier.url} target="_blank" rel="noopener noreferrer" className="adm-link">
                          {t.fichierOuvrir} ↗
                        </a>
                      </p>
                    </object>
                  ) : (
                    <div className="adm-doc__apercu-vide">
                      <span className="adm-doc__ext mono">{formatLisible(fichier.nom, fichier.format)}</span>
                      <p className="adm-hint" style={{ textAlign: "center" }}>{t.apercuIndisponible}</p>
                      <a
                        href={fichier.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--outline btn--sm"
                      >
                        {t.fichierOuvrir} ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="adm-modal__barre">
              <button type="button" className="btn btn--outline btn--sm" onClick={() => setOuvert(false)}>
                {t.apercuFermer}
              </button>
              <span className="adm-hint">
                Aperçu de la version enregistrée. Enregistrez la fiche pour y voir vos dernières modifications.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
