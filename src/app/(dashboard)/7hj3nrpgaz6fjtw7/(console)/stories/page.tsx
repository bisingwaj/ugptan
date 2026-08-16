import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_IMPACT } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { requirePermission } from "@/lib/auth/guard";
import { LOCALES } from "@/lib/params";
import { ensureImpact } from "@/lib/impact/bootstrap";
import {
  IMPACT_EMPLACEMENTS, IMPACT_EMPLACEMENT_LABEL, IMPACT_LAYOUTS, IMPACT_LAYOUT_LABEL,
  IMPACT_PAGE_LABEL, IMPACT_STATUSES, IMPACT_STATUT_LABEL, isImpactEmplacement,
  isImpactLayout, isImpactStatut, sectionTraduite,
  type ImpactEmplacement, type ImpactLayout, type ImpactStatut,
} from "@/lib/impact/statut";
import { ImpactSectionActions } from "@/components/dashboard/impact/ImpactSectionActions";

export const metadata: Metadata = { title: ADMIN_IMPACT.title };

type Recherche = { statut?: string; emplacement?: string; gabarit?: string; supprime?: string };

export default async function HistoiresAdminPage(props: { searchParams: Promise<Recherche> }) {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle, donc le redirect du layout n'empêche pas cette page d'être
  // rendue et sérialisée.
  await requirePermission("histoires");
  // Reprise du contenu d'origine du site, section par section et une seule fois.
  await ensureImpact();

  const params = await props.searchParams;
  const t = ADMIN_IMPACT;

  const statut = params.statut && isImpactStatut(params.statut) ? params.statut : null;
  const emplacement = params.emplacement && isImpactEmplacement(params.emplacement) ? params.emplacement : null;
  const gabarit = params.gabarit && isImpactLayout(params.gabarit) ? params.gabarit : null;

  const where = {
    ...(statut ? { status: statut as ImpactStatut } : {}),
    ...(emplacement ? { emplacement: emplacement as ImpactEmplacement } : {}),
    ...(gabarit ? { layout: gabarit as ImpactLayout } : {}),
  };

  // Reprise sur panne de liaison (cf. lib/lecture.ts) : le transport vers Neon
  // échoue par salves, et la liste du module ne doit pas en dépendre.
  const sections = await lectureConsole(
    () => db().impactSection.findMany({
      where,
      select: {
        id: true, status: true, emplacement: true, layout: true, position: true,
        sourceId: true,
        source: { select: { translations: { where: { locale: "fr" }, select: { kicker: true, titre: true } } } },
        translations: { select: { locale: true, kicker: true, titre: true } },
        _count: { select: { items: true } },
      },
      orderBy: [{ emplacement: "asc" }, { position: "asc" }, { createdAt: "asc" }],
    }),
    "liste des sections « Histoires & impact » (console)",
  );

  const filtre = Boolean(statut || emplacement || gabarit);

  // Groupées par emplacement : la liste dit d'abord OÙ ça s'affiche, parce que
  // c'est la question que se pose la rédaction en ouvrant l'écran.
  const groupes = IMPACT_EMPLACEMENTS
    .map((cle) => ({ cle, sections: sections.filter((section) => section.emplacement === cle) }))
    .filter((groupe) => groupe.sections.length > 0);

  return (
    <>
      <div className="adm-entete">
        <div>
          <h1 className="adm__title">{t.title}</h1>
          <p className="adm__lead">{t.lead}</p>
        </div>
        <div className="adm-entete__actions">
          <Link href={adminPath("/stories/new")} className="btn btn--primary">
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
          {IMPACT_EMPLACEMENTS.map((valeur) => (
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
          <Link href={adminPath("/stories")} className="adm-link" style={{ fontSize: 13 }}>
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
                          <Link href={adminPath(`/stories/${section.id}`)} className="adm-link">{nom}</Link>
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
                              const complete = Boolean(tr && sectionTraduite(tr));
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
