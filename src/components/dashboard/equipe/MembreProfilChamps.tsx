"use client";

/**
 * Champs d'UNE langue d'une fiche.
 *
 * Partagés par l'écran de création et par celui de modification, comme dans les
 * autres modules : les deux demandent exactement les mêmes textes, et deux
 * copies divergeraient au premier champ ajouté.
 *
 * Seule la FONCTION est obligatoire. Les trois autres champs servent des
 * emplacements précis, et l'aide le dit plutôt que de les présenter comme un
 * formulaire à remplir : les responsabilités n'apparaissent que sur les cartes
 * de coordination, la biographie et la citation que sur une fiche de composante.
 */
import { useId } from "react";
import { ADMIN_EQUIPE } from "@/content/admin";
import { TEAM_CHAMPS } from "@/lib/equipe/statut";
import type { TraductionMembreSaisie } from "@/lib/equipe/saisie";

export function MembreProfilChamps({ valeurs }: { valeurs: TraductionMembreSaisie }) {
  const t = ADMIN_EQUIPE;
  const idBase = useId();

  return (
    <div className="adm-panel adm-edit__bloc">
      <div className="label-mono">{t.blocProfil}</div>

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-role`}>{TEAM_CHAMPS.role.label} *</label>
        <input
          id={`${idBase}-role`}
          name="role"
          type="text"
          className="field"
          defaultValue={valeurs.role}
          maxLength={160}
          required
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{TEAM_CHAMPS.role.hint}</p>
      </div>

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-trNom`}>{TEAM_CHAMPS.nom.label}</label>
        <input
          id={`${idBase}-trNom`}
          name="trNom"
          type="text"
          className="field"
          defaultValue={valeurs.nom}
          maxLength={160}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{TEAM_CHAMPS.nom.hint}</p>
      </div>

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-mandat`}>{TEAM_CHAMPS.mandat.label}</label>
        <textarea
          id={`${idBase}-mandat`}
          name="mandat"
          className="field"
          defaultValue={valeurs.mandat}
          rows={2}
          maxLength={400}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{TEAM_CHAMPS.mandat.hint}</p>
      </div>

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-bio`}>{TEAM_CHAMPS.bio.label}</label>
        <textarea
          id={`${idBase}-bio`}
          name="bio"
          className="field"
          defaultValue={valeurs.bio}
          rows={5}
          maxLength={2000}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{TEAM_CHAMPS.bio.hint}</p>
      </div>

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-verbatim`}>{TEAM_CHAMPS.verbatim.label}</label>
        <textarea
          id={`${idBase}-verbatim`}
          name="verbatim"
          className="field"
          defaultValue={valeurs.verbatim}
          rows={3}
          maxLength={600}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>{TEAM_CHAMPS.verbatim.hint}</p>
      </div>
    </div>
  );
}
