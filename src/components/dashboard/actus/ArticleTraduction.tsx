"use client";

/**
 * Formulaire d'UNE version linguistique.
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
  enregistrerTraductionAction,
  supprimerTraductionAction,
  type ActuFormState,
} from "@/actions/admin-actualites";
import { ADMIN_ACTUS } from "@/content/admin";
import type { TraductionSaisie } from "@/lib/actus/saisie";
import type { MediaRef } from "@/lib/medias";
import type { Lang } from "@/lib/pick";
import { TraductionChamps } from "@/components/dashboard/actus/TraductionChamps";

const etatInitial: ActuFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function ArticleTraduction({
  articleId,
  lang,
  valeurs,
  assets,
  visible,
}: {
  articleId: string;
  lang: Lang;
  valeurs: TraductionSaisie;
  assets: MediaRef[];
  visible: boolean;
}) {
  const t = ADMIN_ACTUS;
  const [etat, action, enCours] = useActionState(enregistrerTraductionAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(
    supprimerTraductionAction,
    etatInitial,
  );

  const idSuppression = `suppr-trad-${lang}`;
  const erreur = etat.error ?? etatSuppression.error;
  const succes = etat.ok ?? etatSuppression.ok;

  return (
    // `hidden` sur le conteneur, jamais un démontage : le contenu déjà saisi
    // dans l'autre langue doit survivre au changement d'onglet.
    <div className="adm-edit__langue" hidden={!visible}>
      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      {!valeurs.existe && (
        <p className="adm-edit__neuve">
          {t.tradNouvelle(LANG_LABEL[lang])}
        </p>
      )}

      <form action={action} className="adm-edit__form">
        <input type="hidden" name="articleId" value={articleId} />
        <input type="hidden" name="locale" value={lang} />

        <TraductionChamps lang={lang} valeurs={valeurs} assets={assets} />

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
          <input type="hidden" name="articleId" value={articleId} />
          <input type="hidden" name="locale" value={lang} />
        </form>
      )}
    </div>
  );
}
