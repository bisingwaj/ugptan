/* ============================================================================
   Les trois écrans du moteur de sections — liste, création, fiche.

   « Histoires & impact », « L'UGPTN » et « Le projet » sont le MÊME écran, sur
   les mêmes tables et les mêmes formulaires ; ce qui les sépare est
   l'ensemble des emplacements qu'ils administrent (cf. `EMPLACEMENT_MODULE`).
   Les pages de routes ne font donc que garder leur permission et appeler ces
   composants avec leur module.

   ⚠️ Un module ne voit QUE ses emplacements — dans sa liste, dans ses filtres,
   et jusque dans le sélecteur d'emplacement de ses formulaires. Sans quoi la
   rédaction de la page du Projet verrait passer les sections de l'accueil, et
   pourrait en déplacer une hors de sa portée.
   ========================================================================== */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN_IMPACT, ADMIN_SECTIONS_MODULE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { LOCALES } from "@/lib/params";
import { chargerReferentielsImpact, chargerSectionImpact, sectionVierge } from "@/lib/impact/edition";
import {
  IMPACT_EMPLACEMENT_LABEL, IMPACT_EMPLACEMENT_PATH, IMPACT_LAYOUTS, IMPACT_LAYOUT_LABEL,
  EMPLACEMENT_MODULE, IMPACT_PAGE_LABEL, IMPACT_STATUSES, IMPACT_STATUT_LABEL, MODULE_SLUG,
  emplacementsDuModule, isImpactEmplacement, isImpactLayout, isImpactStatut, sectionTraduite,
  type ImpactEmplacement, type ImpactLayout, type ImpactModule, type ImpactStatut,
} from "@/lib/impact/statut";
import { ImpactSectionActions } from "@/components/dashboard/impact/ImpactSectionActions";
import { ImpactSectionCreation } from "@/components/dashboard/impact/ImpactSectionCreation";
import { ImpactSectionEditeur } from "@/components/dashboard/impact/ImpactSectionEditeur";

export type RechercheListe = {
  statut?: string;
  emplacement?: string;
  gabarit?: string;
  supprime?: string;
};

/* -------------------------------------------------------------------------- */
/* Liste                                                                       */
/* -------------------------------------------------------------------------- */

export async function EcranListeSections({
  module,
  params,
}: {
  module: ImpactModule;
  params: RechercheListe;
}) {
  const t = ADMIN_IMPACT;
  const entete = ADMIN_SECTIONS_MODULE[module];
  const base = adminPath(MODULE_SLUG[module]);
  const emplacements = emplacementsDuModule(module);

  const statut = params.statut && isImpactStatut(params.statut) ? params.statut : null;
  /* Un emplacement d'un AUTRE module vaut filtre absent : la borne du module
     n'est pas contournable par la barre d'adresse. */
  const emplacement =
    params.emplacement && isImpactEmplacement(params.emplacement) && emplacements.includes(params.emplacement)
      ? params.emplacement
      : null;
  const gabarit = params.gabarit && isImpactLayout(params.gabarit) ? params.gabarit : null;

  const where = {
    emplacement: emplacement ? (emplacement as ImpactEmplacement) : { in: emplacements },
    ...(statut ? { status: statut as ImpactStatut } : {}),
    ...(gabarit ? { layout: gabarit as ImpactLayout } : {}),
  };

  // Reprise sur panne de liaison (cf. lib/lecture.ts) : le transport vers Neon
  // échoue par salves, et la liste du module ne doit pas en dépendre.
  const sections = await lectureConsole(
    () => db().impactSection.findMany({
      where,
      select: {
        id: true, status: true, emplacement: true, layout: true, position: true, enchaine: true,
        sourceId: true,
        source: { select: { translations: { where: { locale: "fr" }, select: { kicker: true, titre: true } } } },
        translations: { select: { locale: true, kicker: true, titre: true } },
        _count: { select: { items: true } },
      },
      orderBy: [{ emplacement: "asc" }, { position: "asc" }, { createdAt: "asc" }],
    }),
    `liste des sections « ${entete.title} » (console)`,
  );

  const filtre = Boolean(statut || emplacement || gabarit);

  /* Groupées par emplacement, dans l'ordre de la PAGE et non de l'alphabet : la
     liste dit d'abord OÙ ça s'affiche, parce que c'est la question que se pose
     la rédaction en ouvrant l'écran. */
  const groupes = emplacements
    .map((cle) => ({ cle, sections: sections.filter((section) => section.emplacement === cle) }))
    .filter((groupe) => groupe.sections.length > 0);

  return (
    <>
      <div className="adm-entete">
        <div>
          <h1 className="adm__title">{entete.title}</h1>
          <p className="adm__lead">{entete.lead}</p>
        </div>
        <div className="adm-entete__actions">
          <Link href={`${base}/new`} className="btn btn--primary">
            {t.nouveau}<span className="arrow">→</span>
          </Link>
        </div>
      </div>

      {params.supprime && <div className="adm-ok" role="status" style={{ marginTop: 18 }}>{t.supprimeOk}</div>}

      {/* Filtres : un formulaire GET, donc partageable par URL et rejouable
          par le bouton « précédent » du navigateur. */}
      <form method="get" className="adm-filtres">
        <select name="statut" defaultValue={statut ?? ""} aria-label={t.colStatut} className="field">
          <option value="">{t.tousStatuts}</option>
          {IMPACT_STATUSES.map((valeur) => (
            <option key={valeur} value={valeur}>{IMPACT_STATUT_LABEL[valeur]}</option>
          ))}
        </select>
        <select name="emplacement" defaultValue={emplacement ?? ""} aria-label={t.colEmplacement} className="field">
          <option value="">{t.tousEmplacements}</option>
          {emplacements.map((valeur) => (
            <option key={valeur} value={valeur}>{IMPACT_EMPLACEMENT_LABEL[valeur]}</option>
          ))}
        </select>
        <select name="gabarit" defaultValue={gabarit ?? ""} aria-label={t.colGabarit} className="field">
          <option value="">{t.tousGabarits}</option>
          {IMPACT_LAYOUTS.map((valeur) => (
            <option key={valeur} value={valeur}>{IMPACT_LAYOUT_LABEL[valeur]}</option>
          ))}
        </select>
        <button type="submit" className="btn btn--outline btn--sm">{t.filtrer}</button>
        {filtre && (
          <Link href={base} className="adm-link" style={{ fontSize: 13 }}>
            {t.reinitialiser}
          </Link>
        )}
      </form>

      {sections.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 18 }}>
          <div className="adm-list__row">{filtre ? t.listeVideFiltre : t.listeVide}</div>
        </div>
      ) : (
        groupes.map((groupe) => (
          <section key={groupe.cle} style={{ marginTop: 26 }}>
            <h2 className="adm__section-title">
              {IMPACT_PAGE_LABEL[groupe.cle]}
              <span className="adm-hint" style={{ marginLeft: 10, fontWeight: 400 }}>
                {IMPACT_EMPLACEMENT_LABEL[groupe.cle].split(" · ")[1]}
              </span>
            </h2>

            <div className="adm-table-wrap" style={{ marginTop: 12 }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th scope="col">{t.colSection}</th>
                    <th scope="col">{t.colStatut}</th>
                    <th scope="col">{t.colGabarit}</th>
                    <th scope="col">{t.colLangues}</th>
                    <th scope="col">{t.colEntrees}</th>
                    <th scope="col">{t.colOrdre}</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {groupe.sections.map((section) => {
                    const trFr = section.translations.find((tr) => tr.locale === "fr");
                    const nom = trFr?.titre || trFr?.kicker || section.translations[0]?.titre
                      || section.translations[0]?.kicker || t.sansTitre;
                    const srcFr = section.source?.translations[0];
                    const sourceNom = srcFr?.titre || srcFr?.kicker || null;

                    return (
                      <tr key={section.id}>
                        <td>
                          <Link href={`${base}/${section.id}`} className="adm-link">{nom}</Link>
                          {section.sourceId && (
                            <span className="adm-table__sub">
                              {sourceNom ? t.repriseDe(sourceNom) : t.reprise}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`adm-badge adm-statut adm-statut--${section.status === "PUBLISHED" ? "published" : "draft"}`}>
                            {IMPACT_STATUT_LABEL[section.status as ImpactStatut]}
                          </span>
                        </td>
                        <td className="adm-table__meta">{IMPACT_LAYOUT_LABEL[section.layout as ImpactLayout]}</td>
                        <td>
                          <span className="adm-langues">
                            {LOCALES.map((locale) => {
                              const tr = section.translations.find((item) => item.locale === locale);
                              const complete = Boolean(tr && sectionTraduite(tr, section));
                              const etat = !tr ? t.tradManquante : complete ? t.tradPresente : t.tradIncomplete;
                              return (
                                <span
                                  key={locale}
                                  className={`adm-langue${complete ? " is-on" : tr ? " is-partiel" : ""}`}
                                  title={`${locale.toUpperCase()} · ${etat}`}
                                >
                                  {locale.toUpperCase()}
                                </span>
                              );
                            })}
                          </span>
                        </td>
                        <td className="mono adm-table__meta">
                          {section.sourceId ? "—" : section._count.items}
                        </td>
                        <td className="mono adm-table__meta">{section.position}</td>
                        <td>
                          <ImpactSectionActions
                            id={section.id}
                            enLigne={section.status === "PUBLISHED"}
                            compact
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Création                                                                    */
/* -------------------------------------------------------------------------- */

export async function EcranNouvelleSection({ module }: { module: ImpactModule }) {
  const base = adminPath(MODULE_SLUG[module]);
  const emplacements = emplacementsDuModule(module);
  const { referentiels } = await chargerReferentielsImpact();

  /* La fiche vierge s'ouvre sur le PREMIER emplacement du module, et non sur
     celui du contenu d'origine : une section créée depuis « Le projet » n'a
     aucune raison de proposer d'abord un emplacement de l'accueil. */
  const vierge = { ...sectionVierge(), emplacement: emplacements[0] };

  return (
    <>
      <Link href={base} className="adm-back">← {ADMIN_IMPACT.retourListe}</Link>
      <h1 className="adm__title" style={{ marginTop: 12 }}>{ADMIN_IMPACT.nouveau}</h1>
      <p className="adm__lead">
        Choisissez où la section s'affiche et quel gabarit dessine ses entrées, puis rédigez son en-tête
        dans une langue. Une fois créée, sa fiche ouvre un formulaire par langue et la liste de ses entrées.
      </p>

      <div style={{ marginTop: 26 }}>
        <ImpactSectionCreation
          section={vierge}
          referentiels={referentiels}
          emplacements={emplacements}
        />
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Fiche                                                                       */
/* -------------------------------------------------------------------------- */

export async function EcranFicheSection({
  module,
  id,
  params,
}: {
  module: ImpactModule;
  id: string;
  params: { cree?: string; copie?: string };
}) {
  const t = ADMIN_IMPACT;
  const base = adminPath(MODULE_SLUG[module]);
  const emplacements = emplacementsDuModule(module);

  const [section, { referentiels, assets }] = await Promise.all([
    chargerSectionImpact(id),
    chargerReferentielsImpact(id),
  ]);
  if (!section) notFound();

  /* Une section d'un autre module est introuvable ICI, et pas seulement
     interdite : l'écran du Projet n'a pas à confirmer l'existence d'une section
     de l'accueil, ni à en afficher le titre dans un message d'erreur. */
  if (!emplacements.includes(section.emplacement)) notFound();

  /* Nom et fiche de la section source, pour renvoyer là où les entrées se
     modifient réellement — y compris quand la source relève d'un autre module,
     d'où la lecture de son emplacement. */
  const source = section.sourceId
    ? await lectureConsole(
        () => db().impactSection.findUnique({
          where: { id: section.sourceId },
          select: {
            id: true, emplacement: true,
            translations: { where: { locale: "fr" }, select: { kicker: true, titre: true } },
          },
        }),
        "section source du moteur de sections",
      )
    : null;

  const sourceHref = source
    ? `${adminPath(MODULE_SLUG[EMPLACEMENT_MODULE[source.emplacement as ImpactEmplacement]])}/${source.id}`
    : null;

  const enLigne = section.status === "PUBLISHED";
  const titre = section.traductions.fr.titre || section.traductions.fr.kicker
    || section.traductions.en.titre || section.traductions.en.kicker || t.sansTitre;

  /**
   * Lien vers la page publique. Il n'existe que si la section est en ligne ET
   * traduite en français : un lien vers une page où le bloc n'apparaît pas
   * donnerait à croire qu'il est déjà servi.
   */
  const publicUrl = enLigne && section.traductions.fr.complete
    ? `/fr${IMPACT_EMPLACEMENT_PATH[section.emplacement]}`
    : null;

  return (
    <>
      <Link href={base} className="adm-back">← {t.retourListe}</Link>

      <div className="adm-entete" style={{ marginTop: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="adm__title">{titre}</h1>
          <div className="adm-entete__meta">
            <span className={`adm-badge adm-statut adm-statut--${enLigne ? "published" : "draft"}`}>
              {IMPACT_STATUT_LABEL[section.status]}
            </span>

            <span className="mono adm-hint">{IMPACT_EMPLACEMENT_LABEL[section.emplacement]}</span>
            <span className="mono adm-hint">{IMPACT_LAYOUT_LABEL[section.layout]}</span>

            {/* État de chaque langue, visible sans ouvrir les onglets : c'est
                ce qui reste à traduire, dit d'un coup d'œil. */}
            <span className="adm-langues">
              {LOCALES.map((locale) => {
                const tr = section.traductions[locale];
                const etat = !tr.existe ? t.tradManquante : tr.complete ? t.tradPresente : t.tradIncomplete;
                return (
                  <span
                    key={locale}
                    className={`adm-langue${tr.complete ? " is-on" : tr.existe ? " is-partiel" : ""}`}
                    title={`${locale.toUpperCase()} · ${etat}`}
                  >
                    {locale.toUpperCase()}
                  </span>
                );
              })}
            </span>

            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-link"
                style={{ fontSize: 13 }}
              >
                {t.voirSite} ↗
              </a>
            )}
          </div>
        </div>
        <ImpactSectionActions id={section.id} enLigne={enLigne} />
      </div>

      {params.cree && <div className="adm-ok" role="status" style={{ marginTop: 16 }}>{t.creeOk}</div>}
      {params.copie && <div className="adm-ok" role="status" style={{ marginTop: 16 }}>{t.copieOk}</div>}

      <div style={{ marginTop: 26 }}>
        <ImpactSectionEditeur
          section={section}
          referentiels={referentiels}
          assets={assets}
          emplacements={emplacements}
          sourceNom={source?.translations[0]?.titre || source?.translations[0]?.kicker || null}
          sourceHref={sourceHref}
          apercuUrl={publicUrl}
        />
      </div>
    </>
  );
}
