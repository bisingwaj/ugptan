import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_EQUIPE } from "@/content/admin";
import { adminPath } from "@/lib/admin";
import { db } from "@/lib/db";
import { lectureConsole } from "@/lib/lecture";
import { requirePermission } from "@/lib/auth/guard";
import { LOCALES } from "@/lib/params";
import { ensureEquipe } from "@/lib/equipe/bootstrap";
import {
  TEAM_COMPOSANTES, TEAM_STATUSES, TEAM_STATUT_LABEL,
  isTeamComposante, isTeamStatut, membreTraduit,
  type TeamStatut,
} from "@/lib/equipe/statut";
import { MembreActions, MembreOrdre } from "@/components/dashboard/equipe/MembreActions";

export const metadata: Metadata = { title: ADMIN_EQUIPE.title };

type Recherche = { statut?: string; pole?: string; composante?: string; supprime?: string };

export default async function EquipeAdminPage(props: { searchParams: Promise<Recherche> }) {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle, donc le redirect du layout n'empêche pas cette page d'être
  // rendue et sérialisée.
  await requirePermission("equipe");
  // Reprise du contenu d'origine du site, fiche par fiche et une seule fois.
  await ensureEquipe();

  const params = await props.searchParams;
  const t = ADMIN_EQUIPE;

  const statut = params.statut && isTeamStatut(params.statut) ? params.statut : null;
  const composante = params.composante && isTeamComposante(params.composante) ? params.composante : null;
  const pole = params.pole?.trim() || null;

  const where = {
    ...(statut ? { status: statut as TeamStatut } : {}),
    ...(composante ? { composante } : {}),
    ...(pole ? { poleId: pole } : {}),
  };

  // Reprise sur panne de liaison (cf. lib/lecture.ts) : le transport vers Neon
  // échoue par salves, et la liste du module ne doit pas en dépendre.
  const [membres, poles] = await lectureConsole(
    () => Promise.all([
      db().teamMember.findMany({
        where,
        select: {
          id: true, nom: true, status: true, position: true, featured: true, composante: true,
          pole: { select: { translations: { where: { locale: "fr" }, select: { nom: true } } } },
          translations: { select: { locale: true, nom: true, role: true } },
        },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      }),
      db().teamPole.findMany({
        select: {
          id: true,
          translations: { where: { locale: "fr" }, select: { nom: true } },
        },
        orderBy: [{ position: "asc" }],
      }),
    ]),
    "liste des fiches de l'équipe (console)",
  );

  const filtre = Boolean(statut || pole || composante);

  return (
    <>
      <div className="adm-entete">
        <div>
          <h1 className="adm__title">{t.title}</h1>
          <p className="adm__lead">{t.lead}</p>
        </div>
        <div className="adm-entete__actions">
          <Link href={adminPath("/equipe/poles")} className="btn btn--outline">
            {t.polesLien}
          </Link>
          <Link href={adminPath("/equipe/nouveau")} className="btn btn--primary">
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
          {TEAM_STATUSES.map((valeur) => (
            <option key={valeur} value={valeur}>{TEAM_STATUT_LABEL[valeur]}</option>
          ))}
        </select>
        <select name="pole" defaultValue={pole ?? ""} aria-label={t.colPole} className="field">
          <option value="">{t.tousPoles}</option>
          {poles.map((p) => (
            <option key={p.id} value={p.id}>{p.translations[0]?.nom || t.sansPole}</option>
          ))}
        </select>
        <select name="composante" defaultValue={composante ?? ""} aria-label={t.champComposante} className="field">
          <option value="">{t.toutesComposantes}</option>
          {TEAM_COMPOSANTES.map((code) => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>
        <button type="submit" className="btn btn--outline btn--sm">{t.filtrer}</button>
        {filtre && (
          <Link href={adminPath("/equipe")} className="adm-link" style={{ fontSize: 13 }}>
            {t.reinitialiser}
          </Link>
        )}
      </form>

      {membres.length === 0 ? (
        <div className="adm-list" style={{ marginTop: 18 }}>
          <div className="adm-list__row">{filtre ? t.listeVideFiltre : t.listeVide}</div>
        </div>
      ) : (
        <>
          <p className="adm-hint" style={{ marginTop: 20 }}>{t.ordreAide}</p>

          <div className="adm-table-wrap" style={{ marginTop: 12 }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th scope="col">{t.colMembre}</th>
                  <th scope="col">{t.colFonction}</th>
                  <th scope="col">{t.colStatut}</th>
                  <th scope="col">{t.colPole}</th>
                  <th scope="col">{t.colOu}</th>
                  <th scope="col">{t.colLangues}</th>
                  <th scope="col">{t.colOrdre}</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {membres.map((membre, rang) => {
                  const trFr = membre.translations.find((tr) => tr.locale === "fr");
                  const nom = membre.nom || trFr?.nom || null;
                  const fonction = trFr?.role || membre.translations[0]?.role || t.sansFonction;
                  const publie = membre.status === "PUBLISHED";

                  // Les emplacements ne sont pas stockés : ils se déduisent de
                  // l'état de la fiche (cf. lib/equipe/statut.ts).
                  const ou = publie
                    ? [
                        t.ouGrille,
                        ...(membre.featured ? [t.ouCoordination] : []),
                        ...(membre.composante ? [membre.composante] : []),
                      ]
                    : [];

                  return (
                    <tr key={membre.id}>
                      <td>
                        <Link href={adminPath(`/equipe/${membre.id}`)} className="adm-link">
                          {nom || t.posteVacant}
                        </Link>
                        {!nom && <span className="adm-table__sub">{fonction}</span>}
                      </td>
                      <td className="adm-table__meta">{fonction}</td>
                      <td>
                        <span className={`adm-badge adm-statut adm-statut--${publie ? "published" : "draft"}`}>
                          {TEAM_STATUT_LABEL[membre.status as TeamStatut]}
                        </span>
                      </td>
                      <td className="adm-table__meta">
                        {membre.pole?.translations[0]?.nom || t.sansPole}
                      </td>
                      <td className="adm-table__meta">{ou.length > 0 ? ou.join(" · ") : "—"}</td>
                      <td>
                        <span className="adm-langues">
                          {LOCALES.map((locale) => {
                            const complete = membreTraduit(membre.translations, locale);
                            const etat = complete ? t.tradPresente : t.tradManquante;
                            return (
                              <span
                                key={locale}
                                className={`adm-langue${complete ? " is-on" : ""}`}
                                title={`${locale.toUpperCase()} · ${etat}`}
                              >
                                {locale.toUpperCase()}
                              </span>
                            );
                          })}
                        </span>
                      </td>
                      <td>
                        {/* Sous filtre, la liste affichée n'est pas la grille :
                            « monter » y déplacerait la fiche d'un rang dans
                            l'ordre RÉEL, pas d'une ligne à l'écran. Le rang
                            brut est alors plus honnête que deux flèches qui
                            paraissent ne rien faire. */}
                        {filtre ? (
                          <span className="mono adm-table__meta">{membre.position}</span>
                        ) : (
                          <MembreOrdre
                            id={membre.id}
                            premier={rang === 0}
                            dernier={rang === membres.length - 1}
                          />
                        )}
                      </td>
                      <td>
                        <MembreActions id={membre.id} enLigne={publie} compact />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
