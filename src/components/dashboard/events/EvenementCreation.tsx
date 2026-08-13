"use client";

/**
 * Écran « Nouvel événement ».
 *
 * Un seul formulaire, une seule langue : un événement s'annonce dans la langue
 * où il est rédigé. Les autres versions s'ajoutent ensuite depuis la fiche,
 * chacune par son propre formulaire.
 *
 * Demander les deux langues dès la création reviendrait à exiger la traduction
 * avant même que l'annonce soit arrêtée — l'inverse de la façon dont une
 * rédaction travaille.
 */
import { useActionState, useId, useState } from "react";
import { creerEvenementAction, type EvtFormState } from "@/actions/admin-evenements";
import { ADMIN_EVTS } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { EvenementSaisie, ReferentielsEvtSaisie } from "@/lib/events/saisie";
import type { MediaRef } from "@/lib/medias";
import { EvtReglagesChamps } from "@/components/dashboard/events/EvtReglagesChamps";
import { EvtTraductionChamps } from "@/components/dashboard/events/EvtTraductionChamps";

const etatInitial: EvtFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function EvenementCreation({
  evenement,
  referentiels,
  assets,
}: {
  evenement: EvenementSaisie;
  referentiels: ReferentielsEvtSaisie;
  assets: MediaRef[];
}) {
  const t = ADMIN_EVTS;
  const [etat, action, enCours] = useActionState(creerEvenementAction, etatInitial);
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
              le titre, le lieu et le slug déjà saisis appartenaient à l'autre
              langue. */}
          <EvtTraductionChamps
            key={langue}
            lang={langue}
            valeurs={evenement.traductions[langue]}
            assets={assets}
          />
        </div>
      </div>

      <aside className="adm-edit__aside">
        <EvtReglagesChamps evenement={evenement} referentiels={referentiels} assets={assets} />

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
