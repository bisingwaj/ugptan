"use client";

/**
 * Une page désactivable, sur sa propre carte : un état et un bouton qui le
 * bascule — même geste que « Publier / Dépublier » ailleurs dans la console
 * (cf. OrganeCarte), sans confirmation : couper UNE page, en laissant le
 * reste du site en ligne, n'a pas la portée de la fermeture générale.
 *
 * Mêmes classes `.adm-item*` que `OrganeCarte` et le reste de la console : une
 * ligne à soi, sans bouton dépliant puisqu'il n'y a rien de plus à y régler.
 */
import { useActionState } from "react";
import { basculerPageAction, type ReglagesFormState } from "@/actions/admin-reglages";
import { ADMIN_REGLAGES } from "@/content/admin";
import { formatDateTime } from "@/lib/format";
import type { PageSaisie } from "@/lib/reglages/edition";

const etatInitial: ReglagesFormState = { error: null, ok: null };

export function LignePage({ page }: { page: PageSaisie }) {
  const t = ADMIN_REGLAGES;
  const [etat, basculer, enCours] = useActionState(basculerPageAction, etatInitial);

  return (
    <div className="adm-item">
      <div className="adm-item__tete">
        <div style={{ minWidth: 0, flex: "1 1 220px" }}>
          <span className="adm-item__resume" style={{ whiteSpace: "normal" }}>{page.label}</span>
          {!page.active && page.majLe && (
            <p className="adm-hint" style={{ marginTop: 2 }}>
              {t.pageDepuis} {formatDateTime(page.majLe)}
              {page.majPar ? ` ${t.parQui} ${page.majPar}` : ""}
            </p>
          )}
        </div>

        <div className="adm-item__etats">
          <span className={`adm-badge ${page.active ? "adm-badge--on" : "adm-badge--warn"}`}>
            {page.active ? t.pageActive : t.pageDesactivee}
          </span>
          <form action={basculer}>
            <input type="hidden" name="cle" value={page.cle} />
            <input type="hidden" name="desactiver" value={page.active ? "1" : "0"} />
            <button type="submit" className={`btn btn--sm ${page.active ? "btn--outline" : "btn--primary"}`} disabled={enCours}>
              {page.active
                ? (enCours ? t.pageDesactiverEnCours : t.pageDesactiver)
                : (enCours ? t.pageReactiverEnCours : t.pageReactiver)}
            </button>
          </form>
        </div>
      </div>

      {etat.error && (
        <div className="auth-error" role="alert" style={{ margin: "0 16px 12px" }}>{etat.error}</div>
      )}
    </div>
  );
}
