"use client";

/**
 * Formulaire de l'en-tête d'une section dans UNE langue.
 *
 * Chaque langue a le sien, avec son bouton, son message de résultat et son
 * propre envoi : enregistrer l'anglais n'écrit jamais une ligne de français.
 * C'est la garantie qu'un traducteur ne peut pas écraser, sans le savoir, une
 * correction faite entre-temps dans la langue d'origine.
 *
 * Le formulaire de SUPPRESSION est un frère, jamais un descendant : imbriquer
 * deux `<form>` n'est pas permis en HTML, le navigateur en écarterait un.
 */
import { useActionState } from "react";
import {
  enregistrerSectionLangueAction,
  supprimerSectionLangueAction,
  type ImpactFormState,
} from "@/actions/admin-impact";
import { ADMIN_IMPACT } from "@/content/admin";
import type { TraductionSectionSaisie } from "@/lib/impact/saisie";
import type { Lang } from "@/lib/pick";
import { ImpactEnteteChamps } from "@/components/dashboard/impact/ImpactEnteteChamps";

const etatInitial: ImpactFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function ImpactSectionEntete({
  sectionId,
  lang,
  valeurs,
  visible,
}: {
  sectionId: string;
  lang: Lang;
  valeurs: TraductionSectionSaisie;
  visible: boolean;
}) {
  const t = ADMIN_IMPACT;
  const [etat, action, enCours] = useActionState(enregistrerSectionLangueAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(
    supprimerSectionLangueAction,
    etatInitial,
  );

  const idSuppression = `suppr-section-trad-${lang}`;
  const erreur = etat.error ?? etatSuppression.error;
  const succes = etat.ok ?? etatSuppression.ok;

  return (
    <div className="adm-edit__langue" hidden={!visible}>
      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      {!valeurs.existe && <p className="adm-edit__neuve">{t.tradNouvelle(LANG_LABEL[lang])}</p>}

      <form action={action} className="adm-edit__form">
        <input type="hidden" name="sectionId" value={sectionId} />
        <input type="hidden" name="locale" value={lang} />

        <ImpactEnteteChamps lang={lang} valeurs={valeurs} />

        <div className="adm-edit__actions">
          <button type="submit" className="btn btn--primary" disabled={enCours}>
            {enCours ? t.enregistrement : t.enregistrerLangue(LANG_LABEL[lang])}
            {!enCours && <span className="arrow">→</span>}
          </button>

          {valeurs.existe && (
            <button
              type="submit"
              form={idSuppression}
              className="btn btn--danger btn--sm"
              disabled={suppressionEnCours}
            >
              {t.supprimerTraduction}
            </button>
          )}

          {valeurs.majLe && <span className="adm-hint">{t.majLe} {valeurs.majLe}</span>}
        </div>
      </form>

      {valeurs.existe && (
        <form
          id={idSuppression}
          action={suppression}
          hidden
          onSubmit={(event) => {
            if (!window.confirm(t.supprimerTraductionConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="sectionId" value={sectionId} />
          <input type="hidden" name="locale" value={lang} />
        </form>
      )}
    </div>
  );
}
