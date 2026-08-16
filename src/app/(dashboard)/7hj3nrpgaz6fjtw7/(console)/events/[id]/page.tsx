import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN_EVTS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/guard";
import { fromDateTimeLocal } from "@/lib/format";
import { LOCALES } from "@/lib/params";
import { intervalleDates, plageHoraire } from "@/lib/events/dates";
import { chargerEvenement, chargerReferentielsEvt } from "@/lib/events/edition";
import { EVT_PHASE_LABEL, EVT_STATUT_LABEL, phaseEvenement } from "@/lib/events/statut";
import { EvenementActions } from "@/components/dashboard/events/EvenementActions";
import { EvenementEditeur } from "@/components/dashboard/events/EvenementEditeur";

export const metadata: Metadata = { title: ADMIN_EVTS.modifier };

type Recherche = { cree?: string; copie?: string };

export default async function ModifierEvenementPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Recherche>;
}) {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("evenements");

  const { id } = await props.params;
  const params = await props.searchParams;
  const t = ADMIN_EVTS;

  const [evenement, referentiels] = await Promise.all([
    chargerEvenement(id),
    chargerReferentielsEvt(),
  ]);
  if (!evenement) notFound();

  const debut = fromDateTimeLocal(evenement.startAt);
  const fin = fromDateTimeLocal(evenement.endAt);
  const enLigne = evenement.status === "PUBLISHED";

  // La phase n'a de sens qu'avec une date de début : elle en existe toujours
  // une en base, ce test satisfait le typage sans inventer de valeur de repli.
  const phase = debut ? phaseEvenement(debut, fin) : null;
  const quand = debut ? intervalleDates(debut, fin, "fr") : null;
  const heures = debut ? plageHoraire(debut, fin, evenement.allDay, "fr") : null;

  const titre = evenement.traductions.fr.title || evenement.traductions.en.title || "(sans titre)";

  /**
   * Lien vers la fiche publique. Il n'existe que si l'événement est en ligne ET
   * traduit en français : un lien mort sur un brouillon donnerait à croire que
   * la fiche est déjà servie.
   */
  const publicUrl = enLigne && evenement.traductions.fr.existe
    ? `/fr/evenements/${evenement.traductions.fr.slug}`
    : null;

  return (
    <>
      <Link href={adminPath("/events")} className="adm-back">← {t.retourListe}</Link>

      <div className="adm-entete" style={{ marginTop: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="adm__title">{titre}</h1>
          <div className="adm-entete__meta">
            <span className={`adm-badge adm-statut adm-statut--${evenement.status.toLowerCase()}`}>
              {EVT_STATUT_LABEL[evenement.status]}
            </span>

            {phase && (
              <span className="adm-badge adm-statut adm-statut--scheduled">
                {EVT_PHASE_LABEL[phase]}
              </span>
            )}

            {/* État de chaque langue, visible sans ouvrir les onglets : c'est
                ce qui reste à traduire, dit d'un coup d'œil. */}
            <span className="adm-langues">
              {LOCALES.map((locale) => {
                const tr = evenement.traductions[locale];
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

            {quand && (
              <span className="mono adm-hint">
                {quand}{heures ? ` · ${heures}` : ""}
              </span>
            )}

            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-link"
                style={{ fontSize: 13 }}
              >
                Voir sur le site ↗
              </a>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <EvenementActions id={evenement.id} enLigne={enLigne} />
          <Link href={adminPath(`/events/${evenement.id}/registrations`)} className="btn btn--outline btn--sm">
            {t.inscrLien}
          </Link>
        </div>
      </div>

      {params.cree && <div className="adm-ok" role="status" style={{ marginTop: 16 }}>{t.creeOk}</div>}
      {params.copie && <div className="adm-ok" role="status" style={{ marginTop: 16 }}>{t.copieOk}</div>}

      <div style={{ marginTop: 26 }}>
        <EvenementEditeur
          evenement={evenement}
          referentiels={referentiels.referentiels}
          assets={referentiels.assets}
          apercuUrl={publicUrl}
        />
      </div>
    </>
  );
}
