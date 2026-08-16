import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN_EVTS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { requirePermission } from "@/lib/auth/guard";
import { formatDateTime } from "@/lib/format";
import { intervalleDates } from "@/lib/events/dates";
import {
  INSCRIPTION_STATUSES, INSCRIPTION_LABEL, occupeUnePlace, type InscriptionStatut,
} from "@/lib/events/inscription";
import { InscriptionLigne } from "@/components/dashboard/events/InscriptionLigne";

export const metadata: Metadata = { title: ADMIN_EVTS.inscrTitle };

/**
 * Demandes de participation d'un événement.
 *
 * Écran séparé de la fiche, et non un onglet de plus : la fiche sert à rédiger
 * et à publier, celui-ci à traiter des personnes. Les deux se consultent à des
 * moments différents, souvent par des gens différents, et les réunir aurait
 * chargé l'écran d'édition d'une liste qui peut compter des centaines de lignes.
 *
 * ⚠️ Aucune de ces données ne sort vers le site public (cf. le modèle
 * `EvenementInscription`) : cette page est le seul endroit où elles s'affichent.
 */
export default async function InscriptionsPage(props: { params: Promise<{ id: string }> }) {
  // Indispensable en plus du garde du layout (cf. lib/auth/guard.ts).
  await requirePermission("evenements");

  const { id } = await props.params;
  const t = ADMIN_EVTS;

  // Reprise sur panne de liaison (cf. lib/lecture.ts) : une salve vers Neon ne
  // doit pas transformer la liste des participants en page d'erreur.
  const evenement = await lectureConsole(
    () => db().evenement.findUnique({
      where: { id },
      select: {
        id: true, startAt: true, endAt: true, registrationUrl: true,
        translations: { select: { locale: true, title: true, places: true } },
        inscriptions: {
          orderBy: [{ createdAt: "desc" }],
          select: {
            id: true, nom: true, email: true, organisation: true, telephone: true,
            message: true, locale: true, statut: true, note: true, createdAt: true,
          },
        },
      },
    }),
    "demandes de participation",
  );

  if (!evenement) notFound();

  const trFr = evenement.translations.find((tr) => tr.locale === "fr");
  const titre = trFr?.title ?? evenement.translations[0]?.title ?? "(sans titre)";
  const jauge = trFr?.places ?? evenement.translations[0]?.places ?? null;

  // Décompte par état. Seules les confirmations occupent une place
  // (cf. `occupeUnePlace`) : c'est le chiffre qui se compare à la jauge.
  const parStatut = new Map<InscriptionStatut, number>();
  for (const inscription of evenement.inscriptions) {
    const statut = inscription.statut as InscriptionStatut;
    parStatut.set(statut, (parStatut.get(statut) ?? 0) + 1);
  }
  const places = evenement.inscriptions.filter((i) => occupeUnePlace(i.statut as InscriptionStatut)).length;

  return (
    <>
      <Link href={adminPath(`/events/${evenement.id}`)} className="adm-back">← {t.retourFiche}</Link>

      <div className="adm-entete" style={{ marginTop: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="adm__title">{t.inscrTitle}</h1>
          <p className="adm__lead">
            {titre} · <span className="mono">{intervalleDates(evenement.startAt, evenement.endAt, "fr")}</span>
          </p>
        </div>
      </div>

      {/* Billetterie externe : la liste ci-dessous ne peut pas être complète, et
          le dire vaut mieux que de laisser compter des demandes partielles. */}
      {evenement.registrationUrl && (
        <div className="adm-ok" role="note" style={{ marginTop: 16 }}>
          {t.inscrExterne}{" "}
          <a href={evenement.registrationUrl} target="_blank" rel="noopener noreferrer" className="adm-link">
            {evenement.registrationUrl}
          </a>
        </div>
      )}

      <div className="adm-grid" style={{ marginTop: 20 }}>
        <div className="adm-card">
          <div className="adm-kpi__num" style={{ color: "var(--c-black)" }}>{places}</div>
          <div className="adm-kpi__label">
            {t.inscrConfirmees}{jauge ? ` · ${t.inscrJauge} ${jauge}` : ""}
          </div>
        </div>
        {INSCRIPTION_STATUSES.filter((statut) => statut !== "CONFIRMEE").map((statut) => (
          <div key={statut} className="adm-card">
            <div className="adm-kpi__num" style={{ color: "var(--c-black)" }}>{parStatut.get(statut) ?? 0}</div>
            <div className="adm-kpi__label">{INSCRIPTION_LABEL[statut]}</div>
          </div>
        ))}
      </div>

      {evenement.inscriptions.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 20 }}>
          <div className="adm-list__row">{t.inscrVide}</div>
        </div>
      ) : (
        <div className="adm-taxo" style={{ marginTop: 20 }}>
          {evenement.inscriptions.map((inscription) => (
            <InscriptionLigne
              key={inscription.id}
              item={{
                id: inscription.id,
                nom: inscription.nom,
                email: inscription.email,
                organisation: inscription.organisation,
                telephone: inscription.telephone,
                message: inscription.message,
                locale: inscription.locale,
                statut: inscription.statut as InscriptionStatut,
                note: inscription.note,
                recueLe: formatDateTime(inscription.createdAt),
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
