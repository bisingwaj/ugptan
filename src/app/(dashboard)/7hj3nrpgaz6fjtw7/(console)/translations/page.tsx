import type { Metadata } from "next";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/format";
import type { Lang } from "@/lib/pick";
import { iaConfiguree, modeleIA } from "@/lib/ia/client";
import { entite as trouverEntite, ORDRE_ENTITES } from "@/lib/ia/registre";
import { STATUT_TITRE, tonDe, type Statut } from "@/lib/ia/statut";
import { aRelire } from "@/lib/ia/suivi";
import { TraductionActions } from "@/components/dashboard/ia/TraductionActions";

export const metadata: Metadata = { title: "Traductions" };

/* Le plafond de durée des fonctions est posé sur la coquille de la console
   (cf. ../layout.tsx) : une relance se déclenche aussi depuis les éditeurs. */

const LANGUE: Record<Lang, string> = { fr: "Français", en: "Anglais" };

/**
 * L'ordre de lecture : ce qui bloque d'abord, ce qui attend ensuite.
 *
 * Un échec passe avant une attente parce qu'il ne se résoudra pas tout seul,
 * et une version à relire avant une tâche en cours parce qu'elle est DÉJÀ EN
 * LIGNE : c'est le texte que lisent les visiteurs pendant qu'on le regarde.
 */
const RANG: Record<Statut, number> = { ECHEC: 0, GENEREE: 1, EN_ATTENTE: 2, EN_COURS: 3, RELUE: 4 };

export default async function TraductionsPage() {
  // Indispensable en plus du garde du layout : pages et layouts rendent en
  // parallèle (cf. lib/auth/guard.ts).
  const acteur = await requirePermission("traductions");

  const lignes = await aRelire();

  /* Le droit se juge sur le MODULE du contenu, pas sur l'accès à cet écran :
     une personne qui ne peut pas éditer les composantes n'a pas à voir leurs
     traductions en attente, ni les boutons qui les relancent. */
  const visibles = lignes
    .map((ligne) => ({ ligne, entite: trouverEntite(ligne.entite) }))
    .filter((row) => row.entite !== null && can(acteur, row.entite.permission))
    .sort((a, b) => {
      const parStatut = RANG[a.ligne.statut as Statut] - RANG[b.ligne.statut as Statut];
      if (parStatut !== 0) return parStatut;
      const parType =
        ORDRE_ENTITES.indexOf(a.ligne.entite) - ORDRE_ENTITES.indexOf(b.ligne.entite);
      if (parType !== 0) return parType;
      return b.ligne.demandeeLe.getTime() - a.ligne.demandeeLe.getTime();
    });

  const compte = (statut: Statut) =>
    visibles.filter((row) => row.ligne.statut === statut).length;

  return (
    <>
      <div className="adm-entete">
        <div style={{ minWidth: 0 }}>
          <h1 className="adm__title">Traductions</h1>
          <p className="adm__lead">
            Ce que l&apos;assistance a composé et que personne n&apos;a encore relu, tous modules
            confondus. Une version générée est <strong>déjà servie au public</strong> : la relecture
            n&apos;est pas une condition de publication, c&apos;est une dette.
          </p>
        </div>
      </div>

      {!iaConfiguree() ? (
        <div className="adm-card" style={{ marginTop: 20 }}>
          <p className="adm-hint">
            L&apos;assistance à la traduction n&apos;est pas configurée sur ce serveur : aucune clé
            OpenRouter n&apos;est renseignée. Les contenus se saisissent langue par langue, comme
            auparavant.
          </p>
        </div>
      ) : (
        <p className="adm-hint mono" style={{ marginTop: 14 }}>
          Modèle en service : {modeleIA()}
        </p>
      )}

      <div className="adm-grid" style={{ marginTop: 18 }}>
        <div className="adm-card">
          <div className="adm-kpi__num">{compte("GENEREE")}</div>
          <div className="adm-kpi__label">à relire</div>
        </div>
        <div className="adm-card">
          <div className="adm-kpi__num">{compte("EN_ATTENTE") + compte("EN_COURS")}</div>
          <div className="adm-kpi__label">en cours ou en attente</div>
        </div>
        <div className="adm-card">
          <div className="adm-kpi__num">{compte("ECHEC")}</div>
          <div className="adm-kpi__label">en échec</div>
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="adm-card" style={{ marginTop: 22 }}>
          <p className="adm-hint">
            Rien à relire. Toutes les versions produites par l&apos;assistance ont été validées.
          </p>
        </div>
      ) : (
        <div className="adm-table-wrap" style={{ marginTop: 22 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Contenu</th>
                <th scope="col">Langue</th>
                <th scope="col">État</th>
                <th scope="col">Demandée</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibles.map(({ ligne, entite }) => {
                // Le filtre ci-dessus a déjà écarté les entités inconnues ;
                // TypeScript ne le sait pas depuis un `filter`.
                if (!entite) return null;

                const statut = ligne.statut as Statut;
                const interrompue =
                  statut === "EN_COURS" && Date.now() - ligne.demandeeLe.getTime() > 5 * 60_000;
                const destination = entite.lienFiche?.(ligne.entiteId) ?? entite.ecran;

                return (
                  <tr key={ligne.id}>
                    <td>
                      <Link href={destination} className="adm-link">
                        {ligne.intitule || "(sans titre)"}
                      </Link>
                      <div className="adm-table__sub">{entite.libelle}</div>
                    </td>

                    <td className="mono">
                      {LANGUE[ligne.locale as Lang]}
                      <div className="adm-table__sub">
                        composée depuis le {LANGUE[ligne.sourceLocale as Lang].toLowerCase()}
                      </div>
                    </td>

                    <td>
                      <span className={`adm-ia-pastille adm-ia-pastille--${tonDe(statut, interrompue)}`}>
                        {interrompue ? "Interrompue" : STATUT_TITRE[statut]}
                      </span>
                      {ligne.erreur && <div className="adm-table__sub">{ligne.erreur}</div>}
                      {statut === "GENEREE" && ligne.modele && (
                        <div className="adm-table__sub mono">{ligne.modele}</div>
                      )}
                    </td>

                    <td className="mono adm-table__meta">{formatDateTime(ligne.demandeeLe)}</td>

                    <td>
                      <TraductionActions
                        entite={ligne.entite}
                        entiteId={ligne.entiteId}
                        locale={ligne.locale as Lang}
                        statut={statut}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
