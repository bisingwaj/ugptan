"use client";

/**
 * Écran « Nouvelle section ».
 *
 * Un seul formulaire, une seule langue : une section naît dans la langue où
 * elle est rédigée. Les autres versions s'ajoutent ensuite depuis la fiche,
 * chacune par son propre formulaire.
 *
 * Les entrées ne se saisissent pas ici. Une section sans identité n'a pas
 * encore d'emplacement ni de gabarit arrêtés, et demander six témoignages avant
 * de savoir où ils s'afficheront ferait ressaisir le tout au premier
 * changement d'avis.
 */
import { useActionState, useId, useState } from "react";
import { creerSectionAction, type ImpactFormState } from "@/actions/admin-impact";
import { ADMIN_IMPACT } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { ReferentielsImpact, SectionSaisie } from "@/lib/impact/saisie";
import { ImpactEnteteChamps } from "@/components/dashboard/impact/ImpactEnteteChamps";
import { ImpactReglagesChamps } from "@/components/dashboard/impact/ImpactReglagesChamps";

const etatInitial: ImpactFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function ImpactSectionCreation({
  section,
  referentiels,
}: {
  section: SectionSaisie;
  referentiels: ReferentielsImpact;
}) {
  const t = ADMIN_IMPACT;
  const [etat, action, enCours] = useActionState(creerSectionAction, etatInitial);
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
              le libellé et le titre déjà saisis appartenaient à l'autre langue. */}
          <ImpactEnteteChamps key={langue} lang={langue} valeurs={section.traductions[langue]} />
        </div>
      </div>

      <aside className="adm-edit__aside">
        <ImpactReglagesChamps section={section} referentiels={referentiels} creation />

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
