import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_EVTS } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { LOCALES } from "@/lib/params";
import { intervalleDates, plageHoraire } from "@/lib/events/dates";
import { ensureEvenements } from "@/lib/events/bootstrap";
import {
  clausePhase, EVENEMENT_STATUSES, EVT_PHASE_LABEL, EVT_STATUT_LABEL,
  isEvenementPhase, phaseEvenement,
  type EvenementPhase, type EvenementStatut,
} from "@/lib/events/statut";
import { EvenementActions } from "@/components/dashboard/events/EvenementActions";

export const metadata: Metadata = { title: ADMIN_EVTS.title };

const PAR_PAGE = 20;

type Recherche = {
  statut?: string; phase?: string; categorie?: string; q?: string; page?: string; supprime?: string;
};

/** Reconstruit l'URL de la liste en conservant les filtres actifs. */
function lien(params: Recherche, changement: Partial<Recherche>): string {
  const query = new URLSearchParams();
  const fusion = { ...params, ...changement };
  for (const [cle, valeur] of Object.entries(fusion)) {
    if (cle === "supprime" || !valeur) continue;
    query.set(cle, String(valeur));
  }
  const suffixe = query.toString();
  return suffixe ? `${adminPath("/evenements")}?${suffixe}` : adminPath("/evenements");
}

/** Classe de pastille pour une phase — le CSS des états d'article est réutilisé. */
const CLASSE_PHASE: Record<EvenementPhase, string> = {
  A_VENIR: "adm-statut--scheduled",
  EN_COURS: "adm-statut--published",
  TERMINE: "adm-statut--archived",
};

export default async function EvenementsAdminPage(props: { searchParams: Promise<Recherche> }) {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle, donc le redirect du layout n'empêche pas cette page d'être
  // rendue et sérialisée.
  await requirePermission("evenements");
  // Reprise unique du contenu statique historique, sur une table encore vide.
  await ensureEvenements();

  const params = await props.searchParams;
  const t = ADMIN_EVTS;
  const now = new Date();

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const statut = params.statut && (EVENEMENT_STATUSES as readonly string[]).includes(params.statut)
    ? (params.statut as EvenementStatut)
    : null;
  const phase = params.phase && isEvenementPhase(params.phase) ? params.phase : null;
  const categorie = params.categorie?.trim() || null;
  const q = params.q?.trim() || null;

  // Le filtre de phase descend EN BASE (cf. `clausePhase`) : trier après
  // lecture ferait mentir la pagination, qui compte sur la même clause.
  const where = {
    ...(statut ? { status: statut } : {}),
    ...(categorie ? { categoryId: categorie } : {}),
    ...(q ? { translations: { some: { title: { contains: q, mode: "insensitive" as const } } } } : {}),
    ...(phase ? clausePhase(phase, now) : {}),
  };

  const [total, evenements, categories] = await Promise.all([
    db().evenement.count({ where }),
    db().evenement.findMany({
      where,
      select: {
        id: true,
        status: true,
        startAt: true,
        endAt: true,
        allDay: true,
        featured: true,
        category: { select: { nomFr: true, color: true } },
        // `contentHtml` n'est pas chargé : la liste n'affiche que la présence
        // d'une traduction, et la description pèse plusieurs kilo-octets.
        translations: { select: { locale: true, title: true, lieu: true } },
        // Un simple décompte : la liste n'affiche jamais l'identité des
        // personnes inscrites, qui appartient à l'écran dédié.
        _count: { select: { inscriptions: true } },
      },
      orderBy: [{ startAt: "desc" }],
      skip: (page - 1) * PAR_PAGE,
      take: PAR_PAGE,
    }),
    db().evenementCategory.findMany({
      select: { id: true, nomFr: true },
      orderBy: [{ position: "asc" }, { nomFr: "asc" }],
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAR_PAGE));
  const filtre = Boolean(statut || phase || categorie || q);

  return (
    <>
      <div className="adm-entete">
        <div>
          <h1 className="adm__title">{t.title}</h1>
          <p className="adm__lead">{t.lead}</p>
        </div>
        <div className="adm-entete__actions">
          <Link href={adminPath("/evenements/nouveau")} className="btn btn--primary">
            {t.nouveau}<span className="arrow">→</span>
          </Link>
          <Link href={adminPath("/evenements/categories")} className="btn btn--outline btn--sm">
            {t.categoriesTitle}
          </Link>
        </div>
      </div>

      {params.supprime && <div className="adm-ok" role="status" style={{ marginTop: 18 }}>{t.supprimeOk}</div>}

      {/* Filtres : un formulaire GET, donc partageable par URL et rejouable
          par le bouton « précédent » du navigateur. */}
      <form method="get" className="adm-filtres" role="search">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder={t.rechercher}
          aria-label={t.rechercher}
          className="field"
        />
        <select name="statut" defaultValue={statut ?? ""} aria-label={t.colStatut} className="field">
          <option value="">{t.tousStatuts}</option>
          {EVENEMENT_STATUSES.map((valeur) => (
            <option key={valeur} value={valeur}>{EVT_STATUT_LABEL[valeur]}</option>
          ))}
        </select>
        <select name="phase" defaultValue={phase ?? ""} aria-label={t.colPhase} className="field">
          <option value="">{t.toutesPhases}</option>
          <option value="A_VENIR">{EVT_PHASE_LABEL.A_VENIR}</option>
          <option value="EN_COURS">{EVT_PHASE_LABEL.EN_COURS}</option>
          <option value="TERMINE">{EVT_PHASE_LABEL.TERMINE}</option>
        </select>
        <select name="categorie" defaultValue={categorie ?? ""} aria-label={t.colCategorie} className="field">
          <option value="">{t.toutesCategories}</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>{item.nomFr}</option>
          ))}
        </select>
        <button type="submit" className="btn btn--outline btn--sm">{t.filtrer}</button>
        {filtre && (
          <Link href={adminPath("/evenements")} className="adm-link" style={{ fontSize: 13 }}>
            {t.reinitialiser}
          </Link>
        )}
      </form>

      {evenements.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 18 }}>
          <div className="adm-list__row">{filtre ? t.listeVideFiltre : t.listeVide}</div>
        </div>
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 18 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">{t.colEvenement}</th>
                <th scope="col">{t.colStatut}</th>
                <th scope="col">{t.colPhase}</th>
                <th scope="col">{t.colLangues}</th>
                <th scope="col">{t.colCategorie}</th>
                <th scope="col">{t.colDate}</th>
                <th scope="col">{t.inscrColonne}</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {evenements.map((evt) => {
                const trFr = evt.translations.find((tr) => tr.locale === "fr");
                const titre = trFr?.title ?? evt.translations[0]?.title ?? "(sans titre)";
                const lieu = trFr?.lieu ?? evt.translations[0]?.lieu ?? null;
                const enLigne = evt.status === "PUBLISHED";
                const laPhase = phaseEvenement(evt.startAt, evt.endAt, now);
                const heures = plageHoraire(evt.startAt, evt.endAt, evt.allDay, "fr");

                return (
                  <tr key={evt.id}>
                    <td>
                      <Link href={adminPath(`/evenements/${evt.id}`)} className="adm-link">{titre}</Link>
                      {evt.featured && <span className="adm-badge adm-badge--self">{t.une}</span>}
                      <span className="adm-table__sub">{lieu || t.sansLieu}</span>
                    </td>
                    <td>
                      <span className={`adm-badge adm-statut adm-statut--${evt.status.toLowerCase()}`}>
                        {EVT_STATUT_LABEL[evt.status as EvenementStatut]}
                      </span>
                    </td>
                    <td>
                      <span className={`adm-badge adm-statut ${CLASSE_PHASE[laPhase]}`}>
                        {EVT_PHASE_LABEL[laPhase]}
                      </span>
                    </td>
                    <td>
                      <span className="adm-langues">
                        {LOCALES.map((locale) => {
                          const tr = evt.translations.find((item) => item.locale === locale);
                          const complete = Boolean(tr && tr.title.trim() && (tr.lieu ?? "").trim());
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
                    <td>
                      {evt.category ? (
                        <span className="adm-pastille">
                          <span
                            className="adm-pastille__point"
                            style={{ background: evt.category.color ?? "var(--ac)" }}
                          />
                          {evt.category.nomFr}
                        </span>
                      ) : (
                        <span className="adm-hint">{t.sansCategorie}</span>
                      )}
                    </td>
                    <td className="mono adm-table__meta">
                      {intervalleDates(evt.startAt, evt.endAt, "fr", true)}
                      {heures && <span className="adm-table__sub">{heures}</span>}
                    </td>
                    <td className="adm-table__meta">
                      <Link href={adminPath(`/evenements/${evt.id}/inscriptions`)} className="adm-link">
                        {evt._count.inscriptions}
                      </Link>
                    </td>
                    <td>
                      <EvenementActions id={evt.id} enLigne={enLigne} compact />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav className="adm-pagination" aria-label="Pages">
          {page > 1 && (
            <Link href={lien(params, { page: String(page - 1) })} className="btn btn--ghost btn--sm">← Précédent</Link>
          )}
          <span className="mono adm-hint">Page {page} / {pages} · {total} événement{total > 1 ? "s" : ""}</span>
          {page < pages && (
            <Link href={lien(params, { page: String(page + 1) })} className="btn btn--ghost btn--sm">Suivant →</Link>
          )}
        </nav>
      )}
    </>
  );
}
