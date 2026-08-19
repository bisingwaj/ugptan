"use client";

/**
 * Formulaire d'UNE langue d'une fiche.
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
  enregistrerMembreLangueAction,
  supprimerMembreLangueAction,
  type EquipeFormState,
} from "@/actions/admin-equipe";
import { ADMIN_EQUIPE } from "@/content/admin";
import type { TraductionMembreSaisie } from "@/lib/equipe/saisie";
import type { Lang } from "@/lib/pick";
import { MembreProfilChamps } from "@/components/dashboard/equipe/MembreProfilChamps";
import { BandeauTraduction } from "@/components/dashboard/ia/BandeauTraduction";
import type { EtatVue } from "@/lib/ia/statut";

const etatInitial: EquipeFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function MembreProfil({
  membreId,
  lang,
  valeurs,
  visible,
  etatIA,
  sourceIA,
}: {
  membreId: string;
  lang: Lang;
  valeurs: TraductionMembreSaisie;
  visible: boolean;
  etatIA: EtatVue | undefined;
  sourceIA: Lang | undefined;
}) {
  const t = ADMIN_EQUIPE;
  const [etat, action, enCours] = useActionState(enregistrerMembreLangueAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(
    supprimerMembreLangueAction,
    etatInitial,
  );

  const idSuppression = `suppr-membre-trad-${lang}`;
  const erreur = etat.error ?? etatSuppression.error;
  const succes = etat.ok ?? etatSuppression.ok;

  return (
    <div className="adm-edit__langue" hidden={!visible}>
      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      {/* Avant les champs : on doit savoir d'où vient le texte avant de le lire. */}
      <BandeauTraduction entite="teamMember" entiteId={membreId} locale={lang} etat={etatIA} sourcePossible={sourceIA} actif={visible} />

      {!valeurs.existe && <p className="adm-edit__neuve">{t.tradNouvelle(LANG_LABEL[lang])}</p>}

      <form action={action} className="adm-edit__form">
        <input type="hidden" name="id" value={membreId} />
        <input type="hidden" name="locale" value={lang} />

        <MembreProfilChamps valeurs={valeurs} />

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
          <input type="hidden" name="id" value={membreId} />
          <input type="hidden" name="locale" value={lang} />
        </form>
      )}
    </div>
  );
}
