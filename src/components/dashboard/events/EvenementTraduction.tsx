"use client";

/**
 * Formulaire d'UNE version linguistique d'un événement.
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
  enregistrerTraductionEvtAction,
  supprimerTraductionEvtAction,
  type EvtFormState,
} from "@/actions/admin-evenements";
import { ADMIN_EVTS } from "@/content/admin";
import type { TraductionEvtSaisie } from "@/lib/events/saisie";
import type { MediaRef } from "@/lib/medias";
import type { Lang } from "@/lib/pick";
import { EvtTraductionChamps } from "@/components/dashboard/events/EvtTraductionChamps";
import { BandeauTraduction } from "@/components/dashboard/ia/BandeauTraduction";
import type { EtatVue } from "@/lib/ia/statut";

const etatInitial: EvtFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function EvenementTraduction({
  evenementId,
  lang,
  valeurs,
  assets,
  visible,
  etatIA,
  sourceIA,
}: {
  evenementId: string;
  lang: Lang;
  valeurs: TraductionEvtSaisie;
  assets: MediaRef[];
  visible: boolean;
  etatIA: EtatVue | undefined;
  sourceIA: Lang | undefined;
}) {
  const t = ADMIN_EVTS;
  const [etat, action, enCours] = useActionState(enregistrerTraductionEvtAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(
    supprimerTraductionEvtAction,
    etatInitial,
  );

  const idSuppression = `suppr-trad-evt-${lang}`;
  const erreur = etat.error ?? etatSuppression.error;
  const succes = etat.ok ?? etatSuppression.ok;

  return (
    // `hidden` sur le conteneur, jamais un démontage : le contenu déjà saisi
    // dans l'autre langue doit survivre au changement d'onglet.
    <div className="adm-edit__langue" hidden={!visible}>
      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      {/* Avant les champs, et non après : une personne qui ouvre cet onglet doit
          savoir d'où vient le texte avant d'en lire la première ligne. */}
      <BandeauTraduction entite="evenement" entiteId={evenementId} locale={lang} etat={etatIA} sourcePossible={sourceIA} actif={visible} />

      {!valeurs.existe && <p className="adm-edit__neuve">{t.tradNouvelle(LANG_LABEL[lang])}</p>}

      <form action={action} className="adm-edit__form">
        <input type="hidden" name="evenementId" value={evenementId} />
        <input type="hidden" name="locale" value={lang} />

        <EvtTraductionChamps lang={lang} valeurs={valeurs} assets={assets} />

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
          <input type="hidden" name="evenementId" value={evenementId} />
          <input type="hidden" name="locale" value={lang} />
        </form>
      )}
    </div>
  );
}
