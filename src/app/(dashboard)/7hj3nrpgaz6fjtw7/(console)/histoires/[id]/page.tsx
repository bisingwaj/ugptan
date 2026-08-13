import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN_IMPACT } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { lectureConsole } from "@/lib/lecture";
import { LOCALES } from "@/lib/params";
import { chargerReferentielsImpact, chargerSectionImpact } from "@/lib/impact/edition";
import {
  IMPACT_EMPLACEMENT_LABEL, IMPACT_EMPLACEMENT_PATH, IMPACT_LAYOUT_LABEL, IMPACT_STATUT_LABEL,
} from "@/lib/impact/statut";
import { ImpactSectionActions } from "@/components/dashboard/impact/ImpactSectionActions";
import { ImpactSectionEditeur } from "@/components/dashboard/impact/ImpactSectionEditeur";

export const metadata: Metadata = { title: ADMIN_IMPACT.title };

type Recherche = { cree?: string; copie?: string };

export default async function ModifierSectionImpactPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Recherche>;
}) {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("histoires");

  const { id } = await props.params;
  const params = await props.searchParams;
  const t = ADMIN_IMPACT;

  const [section, { referentiels, assets }] = await Promise.all([
    chargerSectionImpact(id),
    chargerReferentielsImpact(id),
  ]);
  if (!section) notFound();

  // Nom de la section source, pour que la fiche puisse renvoyer là où les
  // entrées se modifient réellement.
  const source = section.sourceId
    ? await lectureConsole(
        () => db().impactSection.findUnique({
          where: { id: section.sourceId },
          select: { id: true, translations: { where: { locale: "fr" }, select: { kicker: true, titre: true } } },
        }),
        "section source de « Histoires & impact »",
      )
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
      <Link href={adminPath("/histoires")} className="adm-back">← {t.retourListe}</Link>

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
          sourceNom={source?.translations[0]?.titre || source?.translations[0]?.kicker || null}
          sourceId={source?.id ?? null}
          apercuUrl={publicUrl}
        />
      </div>
    </>
  );
}
