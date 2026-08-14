"use client";

/**
 * Écran « Nouveau membre ».
 *
 * Un seul formulaire, une seule langue : une fiche naît dans la langue où elle
 * est rédigée. L'autre version s'ajoute ensuite depuis la fiche, par son propre
 * formulaire.
 */
import { useActionState, useId, useState } from "react";
import { creerMembreAction, type EquipeFormState } from "@/actions/admin-equipe";
import { ADMIN_EQUIPE } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { MembreSaisie, ReferentielsEquipe } from "@/lib/equipe/saisie";
import type { MediaRef } from "@/lib/medias";
import { MembreProfilChamps } from "@/components/dashboard/equipe/MembreProfilChamps";
import { MembreReglagesChamps } from "@/components/dashboard/equipe/MembreReglagesChamps";

const etatInitial: EquipeFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function MembreCreation({
  membre,
  referentiels,
  assets,
}: {
  membre: MembreSaisie;
  referentiels: ReferentielsEquipe;
  assets: MediaRef[];
}) {
  const t = ADMIN_EQUIPE;
  const [etat, action, enCours] = useActionState(creerMembreAction, etatInitial);
  const [langue, setLangue] = useState<Lang>("fr");
  const idBase = useId();

  return (
    <form action={action} className="adm-edit">
      <div className="adm-edit__alertes">
        {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
      </div>

      <div className="adm-edit__main">
        <div className="adm-panel adm-edit__langue-choix">
          <div className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-locale`}>{t.langueRedaction}</label>
            <select
              id={`${idBase}-locale`}
              name="locale"
              className="field"
              value={langue}
              onChange={(event) => setLangue(event.target.value as Lang)}
              style={{ maxWidth: 260 }}
            >
              {LOCALES.map((lang) => (
                <option key={lang} value={lang}>{LANG_LABEL[lang]}</option>
              ))}
            </select>
            <p className="adm-hint" style={{ marginTop: 8 }}>{t.langueRedactionAide}</p>
          </div>
        </div>

        <div className="adm-edit__langue">
          {/* `key` : changer de langue de rédaction réinitialise les champs —
              la fonction déjà saisie appartenait à l'autre langue. */}
          <MembreProfilChamps key={langue} valeurs={membre.traductions[langue]} />
        </div>
      </div>

      <aside className="adm-edit__aside">
        <MembreReglagesChamps membre={membre} referentiels={referentiels} assets={assets} />

        <div className="adm-edit__barre">
          <button type="submit" className="btn btn--primary" disabled={enCours}>
            {enCours ? t.creation : t.creer}
            {!enCours && <span className="arrow">→</span>}
          </button>
        </div>
      </aside>
    </form>
  );
}
