"use client";

/**
 * Écran « Nouvelle composante » : un formulaire, une langue.
 *
 * Il ne demande QUE ce sans quoi la fiche ne peut pas s'ouvrir — le code,
 * l'accent et l'intitulé court. Tout le reste (données du MEP, problématique,
 * projets phares) se remplit ensuite, section par section, sur la fiche : les
 * réunir ici donnerait un formulaire de soixante champs devant lequel on
 * renonce.
 *
 * Une seule langue à la création : une composante naît dans la langue où elle
 * est rédigée. Les autres versions s'ajoutent depuis la fiche.
 */
import { useActionState, useId, useState } from "react";
import { creerComposanteAction, type ProjetFormState } from "@/actions/admin-projet";
import { ADMIN_PROJET } from "@/content/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import type { ComposanteSaisie } from "@/lib/projet/saisie";
import { CHAMPS_SECTION, PROJET_STATUSES, PROJET_STATUT_HINT, PROJET_STATUT_LABEL } from "@/lib/projet/statut";
import { ChampCouleur } from "@/components/dashboard/ChampCouleur";

const etatInitial: ProjetFormState = { error: null, ok: null };

const LANG_LABEL: Record<Lang, string> = { fr: "Français", en: "English" };

export function ComposanteCreation({ composante }: { composante: ComposanteSaisie }) {
  const t = ADMIN_PROJET;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(creerComposanteAction, etatInitial);
  const [locale, setLocale] = useState<Lang>("fr");
  const [statut, setStatut] = useState(composante.status);

  return (
    <form action={action} className="adm-edit__form" style={{ maxWidth: 720 }}>
      {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}

      <div className="adm-form__field">
        <label className="label-mono" htmlFor={`${idBase}-locale`}>{t.langueRedaction}</label>
        <select
          id={`${idBase}-locale`}
          name="locale"
          className="field"
          value={locale}
          onChange={(event) => setLocale(event.target.value as Lang)}
        >
          {LOCALES.map((lang) => (
            <option key={lang} value={lang}>{LANG_LABEL[lang]}</option>
          ))}
        </select>
        <p className="adm-hint" style={{ marginTop: 6 }}>{t.langueRedactionAide}</p>
      </div>

      <div className="adm-item__grille">
        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-code`}>{t.champCode}</label>
          <input id={`${idBase}-code`} name="code" type="text" className="field mono" placeholder="C6" required />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champCodeAide}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-slug`}>{t.champSlug}</label>
          <input id={`${idBase}-slug`} name="slug" type="text" className="field mono" spellCheck={false} placeholder="c6" />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champSlugAide}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-status`}>État</label>
          <select
            id={`${idBase}-status`}
            name="status"
            className="field"
            value={statut}
            onChange={(event) => setStatut(event.target.value as typeof statut)}
          >
            {PROJET_STATUSES.map((valeur) => (
              <option key={valeur} value={valeur}>{PROJET_STATUT_LABEL[valeur]}</option>
            ))}
          </select>
          <p className="adm-hint" style={{ marginTop: 6 }}>{PROJET_STATUT_HINT[statut]}</p>
        </div>

        <div className="adm-form__field">
          <label className="label-mono" htmlFor={`${idBase}-position`}>{t.champPosition}</label>
          <input id={`${idBase}-position`} name="position" type="number" className="field" defaultValue={composante.position} />
          <p className="adm-hint" style={{ marginTop: 6 }}>{t.champPositionAide}</p>
        </div>
      </div>

      <ChampCouleur defaultValue={composante.color} label={t.champCouleur} aide={t.champCouleurAide} />

      {/* Les mêmes champs que la section « Identité & héros » de la fiche : la
          table de vocabulaire est la seule source, ici comme là-bas. */}
      {CHAMPS_SECTION.identite.map((spec) => (
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
              key={`${locale}-${spec.champ}`}
              placeholder={spec.placeholder}
            />
          ) : (
            <input
              id={`${idBase}-${spec.champ}`}
              name={spec.champ}
              type="text"
              className="field"
              key={`${locale}-${spec.champ}`}
              placeholder={spec.placeholder}
              required={spec.requis}
            />
          )}
          {spec.aide && <p className="adm-hint" style={{ marginTop: 6 }}>{spec.aide}</p>}
        </div>
      ))}

      <div className="adm-edit__actions">
        <button type="submit" className="btn btn--primary" disabled={enCours}>
          {enCours ? t.creation : t.creer}
          {!enCours && <span className="arrow">→</span>}
        </button>
      </div>
    </form>
  );
}
