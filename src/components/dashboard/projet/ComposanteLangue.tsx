"use client";

/**
 * Les textes d'UNE section de la composante, dans UNE langue.
 *
 * Chaque couple (section, langue) a son formulaire, son bouton et son message :
 * enregistrer l'en-tête anglais de la finalité n'écrit jamais une ligne de
 * français, ni un champ d'une autre section.
 *
 * ⚠️ Le champ caché `champs` n'est pas décoratif : il déclare à l'action les
 * textes que CET envoi porte. Sans lui, les champs des autres sections —
 * absents du formulaire — seraient lus comme vides et effacés en base
 * (cf. `lireEnteteComposante` dans actions/admin-projet.ts).
 */
import { useActionState, useId } from "react";
import {
  enregistrerComposanteLangueAction, supprimerComposanteLangueAction, type ProjetFormState,
} from "@/actions/admin-projet";
import { ADMIN_PROJET } from "@/content/admin";
import type { Lang } from "@/lib/pick";
import type { TraductionComposanteSaisie } from "@/lib/projet/saisie";
import { CHAMPS_SECTION, type ComposanteSection } from "@/lib/projet/statut";

const etatInitial: ProjetFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function ComposanteLangue({
  composanteId,
  section,
  lang,
  valeurs,
  visible,
  /** La suppression de la traduction n'a de sens que sur la section d'identité. */
  avecSuppression = false,
}: {
  composanteId: string;
  section: ComposanteSection;
  lang: Lang;
  valeurs: TraductionComposanteSaisie;
  visible: boolean;
  avecSuppression?: boolean;
}) {
  const t = ADMIN_PROJET;
  const idBase = useId();
  const champs = CHAMPS_SECTION[section];

  const [etat, action, enCours] = useActionState(enregistrerComposanteLangueAction, etatInitial);
  const [etatSuppression, suppression, suppressionEnCours] = useActionState(
    supprimerComposanteLangueAction,
    etatInitial,
  );

  const idSuppression = `suppr-comp-trad-${section}-${lang}`;
  const erreur = etat.error ?? etatSuppression.error;
  const succes = etat.ok ?? etatSuppression.ok;

  if (champs.length === 0) return null;

  return (
    <div className="adm-edit__langue" hidden={!visible}>
      {erreur && <div className="auth-error" role="alert">{erreur}</div>}
      {succes && <div className="adm-ok" role="status">{succes}</div>}

      {!valeurs.existe && <p className="adm-edit__neuve">{t.tradNouvelle(LANG_LABEL[lang])}</p>}

      <form action={action} className="adm-edit__form">
        <input type="hidden" name="composanteId" value={composanteId} />
        <input type="hidden" name="locale" value={lang} />
        <input type="hidden" name="champs" value={champs.map((spec) => spec.champ).join(",")} />

        {champs.map((spec) => (
          <div key={spec.champ} className="adm-form__field">
            <label className="label-mono" htmlFor={`${idBase}-${spec.champ}`}>
              {spec.label}
              {spec.requis && <span className="adm-edit__requis"> obligatoire</span>}
            </label>
            {spec.long ? (
              <textarea
                id={`${idBase}-${spec.champ}`}
                name={spec.champ}
                className="field"
                rows={3}
                // `key` sur la langue : l'onglet reste monté, mais un changement
                // de langue de rédaction doit vider ce qui appartenait à l'autre.
                key={`${lang}-${spec.champ}`}
                defaultValue={valeurs[spec.champ]}
                placeholder={spec.placeholder}
              />
            ) : (
              <input
                id={`${idBase}-${spec.champ}`}
                name={spec.champ}
                type="text"
                className="field"
                key={`${lang}-${spec.champ}`}
                defaultValue={valeurs[spec.champ]}
                placeholder={spec.placeholder}
              />
            )}
            {spec.aide && <p className="adm-hint" style={{ marginTop: 6 }}>{spec.aide}</p>}
          </div>
        ))}

        <div className="adm-edit__actions">
          <button type="submit" className="btn btn--primary" disabled={enCours}>
            {enCours ? t.enregistrement : t.enregistrerLangue(LANG_LABEL[lang])}
            {!enCours && <span className="arrow">→</span>}
          </button>

          {avecSuppression && valeurs.existe && (
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

      {avecSuppression && valeurs.existe && (
        <form
          id={idSuppression}
          action={suppression}
          hidden
          onSubmit={(event) => {
            if (!window.confirm(t.supprimerTraductionConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="composanteId" value={composanteId} />
          <input type="hidden" name="locale" value={lang} />
        </form>
      )}
    </div>
  );
}
