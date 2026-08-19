"use client";

/**
 * Les deux gestes possibles sur une ligne de l'écran de suivi.
 *
 * Séparés du tableau, qui reste un composant serveur : seuls les boutons ont
 * besoin d'un état de soumission, et faire basculer toute la liste côté client
 * pour deux formulaires par ligne coûterait un rendu complet à l'hydratation.
 *
 * Pas de reprise automatique ici, contrairement au bandeau de l'éditeur : cet
 * écran affiche jusqu'à deux cents lignes, et les reprendre toutes à
 * l'ouverture lancerait autant d'appels payants d'un coup. Sur cet écran, la
 * relance est un geste, pas un réflexe.
 */
import { useActionState } from "react";
import {
  relancerTraductionAction,
  validerTraductionAction,
  type TraductionFormState,
} from "@/actions/admin-traduction";
import type { Statut } from "@/lib/ia/statut";
import type { Lang } from "@/lib/pick";

const etatInitial: TraductionFormState = { error: null, ok: null };

export function TraductionActions({
  entite,
  entiteId,
  locale,
  statut,
}: {
  entite: string;
  entiteId: string;
  locale: Lang;
  statut: Statut;
}) {
  const [relance, relancer, relanceEnCours] = useActionState(relancerTraductionAction, etatInitial);
  const [validation, valider, validationEnCours] = useActionState(
    validerTraductionAction,
    etatInitial,
  );

  const enCours = relanceEnCours || validationEnCours;
  const erreur = relance.error ?? validation.error;

  const champs = (
    <>
      <input type="hidden" name="entite" value={entite} />
      <input type="hidden" name="entiteId" value={entiteId} />
      <input type="hidden" name="locale" value={locale} />
    </>
  );

  return (
    <div className="adm-ia__gestes">
      {statut === "GENEREE" && (
        <form action={valider}>
          {champs}
          <button type="submit" className="btn btn--outline btn--sm" disabled={enCours}>
            {validationEnCours ? "Validation…" : "Valider"}
          </button>
        </form>
      )}

      <form action={relancer}>
        {champs}
        <button type="submit" className="btn btn--outline btn--sm" disabled={enCours}>
          {relanceEnCours ? "En cours…" : "Relancer"}
        </button>
      </form>

      {erreur && (
        <span className="adm-hint" role="alert" style={{ color: "var(--red)" }}>
          {erreur}
        </span>
      )}
    </div>
  );
}
