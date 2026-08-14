"use client";

/**
 * Écran d'ajout : le média ET la fiche, en un seul envoi.
 *
 * Les deux vont ensemble ici, et seulement ici : une entrée sans média n'a pas
 * d'existence, et demander deux étapes à la création laisserait une ligne
 * orpheline derrière chaque abandon. Une fois créée, les deux se modifient
 * séparément (cf. actions/admin-galerie.ts).
 *
 * Le formulaire ne demande PAS la même chose selon la nature choisie en amont —
 * une photographie exige son image, une vidéo exige une source de lecture et
 * n'a de la vignette qu'un usage facultatif. La nature voyage en champ caché :
 * elle est décidée par le bouton d'où l'on vient, pas par un sélecteur au milieu
 * du formulaire, qui ferait changer les champs sous les doigts.
 */
import { useActionState, useId, useState } from "react";
import { ajouterGalerieAction, type GalFormState } from "@/actions/admin-galerie";
import { ADMIN_GALERIE } from "@/content/admin";
import type { GalerieSaisie, ReferentielsGalerieSaisie } from "@/lib/galerie/saisie";
import {
  ACCEPT_GAL_IMAGE, TAILLE_MAX, estMimeImageGalerie, poidsLisible,
} from "@/lib/galerie/fichier";
import { GalerieIdentite, GalerieReglages } from "@/components/dashboard/galerie/GalerieChamps";
import { GalerieSourceVideo } from "@/components/dashboard/galerie/GalerieSourceVideo";

const etatInitial: GalFormState = { error: null, ok: null };

export function GalerieAjout({
  item,
  referentiels,
  stockageActif,
}: {
  item: GalerieSaisie;
  referentiels: ReferentielsGalerieSaisie;
  stockageActif: boolean;
}) {
  const t = ADMIN_GALERIE;
  const idBase = useId();
  const [etat, action, enCours] = useActionState(ajouterGalerieAction, etatInitial);

  const [refusVisuel, setRefusVisuel] = useState<string | null>(null);
  const [refusVideo, setRefusVideo] = useState<string | null>(null);

  const video = item.type === "VIDEO";

  /**
   * Contrôle de poids refait CÔTÉ CLIENT, avant l'envoi. Il ne remplace pas
   * celui du serveur — rien de ce qui vient du navigateur ne fait autorité — il
   * évite d'attendre la fin d'un téléversement pour apprendre qu'il sera refusé.
   */
  const verifierVisuel = (fichier: File | null | undefined) => {
    if (!fichier) {
      setRefusVisuel(null);
      return;
    }
    if (!estMimeImageGalerie(fichier.type)) {
      setRefusVisuel("Format non accepté. JPEG, PNG, WebP, AVIF ou GIF.");
      return;
    }
    setRefusVisuel(
      fichier.size > TAILLE_MAX
        ? `Image trop lourde (${poidsLisible(fichier.size)}). Limite : ${poidsLisible(TAILLE_MAX)}.`
        : null,
    );
  };

  const refus = refusVisuel ?? refusVideo;

  return (
    <form action={action} className="adm-edit">
      <input type="hidden" name="type" value={item.type} />

      <div className="adm-edit__alertes">
        {!stockageActif && <div className="auth-error" role="alert">{t.stockageAbsent}</div>}
        {etat.error && <div className="auth-error" role="alert">{etat.error}</div>}
        {refus && <div className="auth-error" role="alert">{refus}</div>}
      </div>

      <div className="adm-edit__main">
        <div className="adm-edit__form">
          <div className="adm-panel adm-edit__bloc">
            <div className="label-mono">{video ? t.visuelVignette : t.blocVisuel}</div>

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-visuel`}>
                {t.visuelChoisir}
                {!video && <span className="adm-edit__requis">obligatoire</span>}
              </label>
              <input
                id={`${idBase}-visuel`}
                name="visuel"
                type="file"
                className="field"
                accept={ACCEPT_GAL_IMAGE}
                required={!video}
                disabled={!stockageActif}
                onChange={(event) => verifierVisuel(event.target.files?.[0])}
              />
              <p className="adm-hint" style={{ marginTop: 6 }}>
                {video ? t.visuelVignetteAide : t.visuelAide} Limite : {poidsLisible(TAILLE_MAX)}.
              </p>
            </div>
          </div>

          {video && (
            <GalerieSourceVideo stockageActif={stockageActif} onRefus={setRefusVideo} obligatoire />
          )}

          <GalerieIdentite item={item} />
        </div>
      </div>

      <aside className="adm-edit__aside">
        <GalerieReglages item={item} referentiels={referentiels} />

        <div className="adm-edit__barre">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={enCours || !stockageActif || refus !== null}
          >
            {enCours ? t.ajout : t.ajouter}
            {!enCours && <span className="arrow">→</span>}
          </button>
          <span className="adm-hint">Enregistré masqué, vérifiable avant mise en ligne.</span>
        </div>
      </aside>
    </form>
  );
}
