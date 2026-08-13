import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN } from "@/content/admin";
import { ADMIN_NEWSLETTER } from "@/lib/admin";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { formatDate } from "@/lib/format";
import { LOCALES } from "@/lib/params";
import {
  NEWSLETTER_STATUTS,
  STATUT_BADGE,
  STATUT_LABEL,
  sourceLabel,
  type NewsletterStatut,
} from "@/lib/newsletter/model";
import { CHAMPS_LISTE, filtreActif, lireFiltres, whereAbonnes } from "@/lib/newsletter/query";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { NewsletterActions } from "@/components/dashboard/NewsletterActions";
import { PendingLink } from "@/components/ui/PendingLink";

export const metadata: Metadata = { title: ADMIN.newsletter.title };

const PAR_PAGE = 25;

/** Fenêtre du compteur « inscrits récents », en jours. */
const FENETRE_JOURS = 30;

type Recherche = {
  q?: string;
  statut?: string;
  langue?: string;
  source?: string;
  page?: string;
};

/** Reconstruit l'URL de la liste en conservant les filtres actifs. */
function lien(params: Recherche, changement: Partial<Recherche>): string {
  const query = new URLSearchParams();
  for (const [cle, valeur] of Object.entries({ ...params, ...changement })) {
    if (valeur) query.set(cle, String(valeur));
  }
  const suffixe = query.toString();
  return suffixe ? `${ADMIN_NEWSLETTER}?${suffixe}` : ADMIN_NEWSLETTER;
}

export default async function NewsletterAdminPage(props: { searchParams: Promise<Recherche> }) {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle (cf. lib/auth/guard.ts).
  await requirePermission("newsletter");

  const params = await props.searchParams;
  const t = ADMIN.newsletter;

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const filtres = lireFiltres(params);
  const where = whereAbonnes(filtres);

  const depuis = new Date(Date.now() - FENETRE_JOURS * 24 * 60 * 60 * 1000);

  const [total, abonnes, actifs, desabonnes, recents, sources] = await Promise.all([
    db().newsletterSubscriber.count({ where }),
    db().newsletterSubscriber.findMany({
      where,
      select: CHAMPS_LISTE,
      // Les dernières inscriptions d'abord : c'est ce qu'on vient vérifier.
      orderBy: { subscribedAt: "desc" },
      skip: (page - 1) * PAR_PAGE,
      take: PAR_PAGE,
    }),
    // Les indicateurs portent sur la LISTE ENTIÈRE, jamais sur le filtre : ils
    // répondent à « combien d'abonnés avons-nous », question qui ne dépend pas
    // de la recherche en cours.
    db().newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
    db().newsletterSubscriber.count({ where: { status: "UNSUBSCRIBED" } }),
    db().newsletterSubscriber.count({ where: { status: "ACTIVE", subscribedAt: { gte: depuis } } }),
    db().newsletterSubscriber.groupBy({ by: ["source"], _count: { source: true } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAR_PAGE));
  const filtre = filtreActif(filtres);

  const kpis = [
    { key: "total", label: t.kpiTotal, value: actifs + desabonnes },
    { key: "actifs", label: t.kpiActive, value: actifs },
    { key: "desabonnes", label: t.kpiUnsub, value: desabonnes },
    { key: "recents", label: t.kpiMonth, value: recents },
  ];

  /* Les exports portent la sélection courante, sans la pagination : on exporte
     un filtre, pas un écran. */
  const exportUrl = (format: "csv" | "xlsx") => {
    const query = new URLSearchParams({ format });
    if (filtres.q) query.set("q", filtres.q);
    if (filtres.statut) query.set("statut", filtres.statut);
    if (filtres.langue) query.set("langue", filtres.langue);
    if (filtres.source) query.set("source", filtres.source);
    return `/api/newsletter/export?${query.toString()}`;
  };

  return (
    <>
      <div className="adm-entete">
        <div>
          <h1 className="adm__title">{t.title}</h1>
          <p className="adm__lead">{t.lead}</p>
        </div>
        <div className="adm-entete__actions">
          {/* Le téléchargement passe par `fetch` et non par un `<a download>` :
              un lien ne donne aucun signe de vie pendant que le serveur
              compose le fichier, et l'on reclique en croyant avoir manqué le
              bouton. Le nom du fichier reste celui que pose la route d'export
              dans Content-Disposition. */}
          <ExportButton href={exportUrl("csv")} label={t.exportCsv} />
          <ExportButton href={exportUrl("xlsx")} label={t.exportXlsx} />
        </div>
      </div>

      <div className="adm-grid" style={{ marginTop: 26 }}>
        {kpis.map((kpi) => (
          <div key={kpi.key} className="adm-card">
            <div className="adm-kpi__num" style={{ color: kpi.value > 0 ? "var(--c-black)" : undefined }}>
              {kpi.value}
            </div>
            <div className="adm-kpi__label">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="adm__section-title">{t.listTitle}</div>

      {/* Filtres : un formulaire GET, donc partageable par URL et rejouable par
          le bouton « précédent » du navigateur. */}
      <form method="get" className="adm-filtres" role="search" style={{ marginTop: 0 }}>
        <input
          type="search"
          name="q"
          defaultValue={filtres.q ?? ""}
          placeholder={t.rechercher}
          aria-label={t.rechercher}
          className="field"
        />
        <select name="statut" defaultValue={filtres.statut ?? ""} aria-label={t.colStatut} className="field">
          <option value="">{t.tousStatuts}</option>
          {NEWSLETTER_STATUTS.map((valeur) => (
            <option key={valeur} value={valeur}>{STATUT_LABEL[valeur]}</option>
          ))}
        </select>
        <select name="langue" defaultValue={filtres.langue ?? ""} aria-label={t.colLangue} className="field">
          <option value="">{t.toutesLangues}</option>
          {LOCALES.map((locale) => (
            <option key={locale} value={locale}>{locale.toUpperCase()}</option>
          ))}
        </select>
        <select name="source" defaultValue={filtres.source ?? ""} aria-label={t.colSource} className="field">
          <option value="">{t.toutesSources}</option>
          {sources.map((entree) => (
            <option key={entree.source} value={entree.source}>
              {sourceLabel(entree.source)} ({entree._count.source})
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn--outline btn--sm">{t.filtrer}</button>
        {filtre && (
          <Link href={ADMIN_NEWSLETTER} className="adm-link" style={{ fontSize: 13 }}>
            {t.reinitialiser}
          </Link>
        )}
      </form>

      <p className="adm-hint" style={{ marginTop: 12, maxWidth: 780 }}>{t.exportAide}</p>

      {abonnes.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 18 }}>
          <div className="adm-list__row">{filtre ? t.emptyFiltered : t.empty}</div>
        </div>
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 18 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">{t.colEmail}</th>
                <th scope="col">{t.colStatut}</th>
                <th scope="col">{t.colDate}</th>
                <th scope="col">{t.colLangue}</th>
                <th scope="col">{t.colSource}</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {abonnes.map((abonne) => {
                const statut = abonne.status as NewsletterStatut;
                const actif = statut === "ACTIVE";

                return (
                  <tr key={abonne.id}>
                    <td>
                      {/* `mailto:` plutôt qu'un lien vers une fiche : le module
                          n'a pas de vue de détail, une adresse n'ayant rien de
                          plus à montrer que sa ligne. */}
                      <a href={`mailto:${abonne.email}`} className="adm-link mono">{abonne.email}</a>
                    </td>
                    <td>
                      <span className={`adm-badge ${STATUT_BADGE[statut]}`}>{STATUT_LABEL[statut]}</span>
                    </td>
                    <td className="adm-table__meta">
                      {formatDate(abonne.subscribedAt)}
                      {!actif && abonne.unsubscribedAt && (
                        <span className="adm-table__sub">
                          {t.desabonneLe} {formatDate(abonne.unsubscribedAt)}
                        </span>
                      )}
                    </td>
                    <td className="mono adm-table__meta">{abonne.lang.toUpperCase()}</td>
                    <td className="adm-table__meta">{sourceLabel(abonne.source)}</td>
                    <td>
                      <NewsletterActions id={abonne.id} actif={actif} />
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
            <PendingLink href={lien(params, { page: String(page - 1) })} className="btn btn--ghost btn--sm" pendingLabel="Précédent…">
              ← Précédent
            </PendingLink>
          )}
          <span className="mono adm-hint">
            Page {page} / {pages} · {total} adresse{total > 1 ? "s" : ""}
          </span>
          {page < pages && (
            <PendingLink href={lien(params, { page: String(page + 1) })} className="btn btn--ghost btn--sm" pendingLabel="Suivant…">
              Suivant →
            </PendingLink>
          )}
        </nav>
      )}

      <div className="adm-panel" style={{ marginTop: 34 }}>
        <div className="adm__section-title" style={{ marginTop: 0 }}>{t.envoiTitle}</div>
        <p className="adm-hint" style={{ maxWidth: 780 }}>{t.envoiLead}</p>
      </div>
    </>
  );
}
