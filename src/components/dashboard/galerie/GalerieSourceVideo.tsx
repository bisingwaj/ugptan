"use client";

/**
 * Le fichier vidéo d'une entrée.
 *
 * Un jeu de CHAMPS et non un formulaire : il sert dans l'écran d'ajout, où il
 * part avec la fiche, et dans la fiche d'une vidéo déjà en base, où il a son
 * propre envoi (cf. GalerieVideo). Deux copies auraient divergé au premier
 * format accepté.
 *
 * ⚠️ Une SEULE voie, depuis le retrait des sources externes : un fichier
 * téléversé. L'identifiant YouTube et l'adresse saisie à la main demandaient une
 * saisie par vidéo — ce que le module refuse par principe, l'information vivant
 * sur l'album — et n'ont jamais servi.
 *
 * Le champ part VIDE, y compris sur une vidéo qui a déjà son film : il ne peut
 * dire qu'une chose, le NOUVEAU fichier. Celui en place est annoncé au-dessus
 * par `GalerieVideo`.
 */
import { useId, useState } from "react";
import { ADMIN_GALERIE } from "@/content/admin";
import {
  ACCEPT_GAL_VIDEO, TAILLE_MAX_VIDEO, estMimeVideoGalerie, poidsLisible,
} from "@/lib/galerie/fichier";

export function GalerieSourceVideo({
  stockageActif,
  onRefus,
  obligatoire = false,
}: {
  stockageActif: boolean;
  /** Remonte un refus détecté avant l'envoi, pour désactiver le bouton. */
  onRefus: (message: string | null) => void;
  obligatoire?: boolean;
}) {
  const t = ADMIN_GALERIE;
  const idBase = useId();
  const [nomFichier, setNomFichier] = useState<string | null>(null);

  /**
   * Contrôle refait CÔTÉ CLIENT, avant l'envoi. Il ne remplace pas celui du
   * serveur — rien de ce qui vient du navigateur ne fait autorité — il évite
   * d'attendre la fin d'un téléversement de quinze mégaoctets pour apprendre
   * qu'il sera refusé.
   */
  const verifier = (fichier: File | null | undefined) => {
    setNomFichier(fichier?.name ?? null);

    if (!fichier) {
      onRefus(null);
      return;
    }
    if (!estMimeVideoGalerie(fichier.type)) {
      onRefus("Format vidéo non accepté. MP4 ou WebM uniquement.");
      return;
    }
    onRefus(
      fichier.size > TAILLE_MAX_VIDEO
        ? `Vidéo trop lourde (${poidsLisible(fichier.size)}). Limite : ${poidsLisible(TAILLE_MAX_VIDEO)}. Compressez le film avant de le déposer.`
        : null,
    );
  };

  return (
    <div className="adm-panel adm-edit__bloc">
      <div className="label-mono">{t.blocVideo}</div>

      <div className="adm-form__field" style={{ marginTop: 12 }}>
        <label className="label-mono" htmlFor={`${idBase}-video`}>
          {t.champVideoFichier}
          {obligatoire && <span className="adm-edit__requis">obligatoire</span>}
        </label>
        <input
          id={`${idBase}-video`}
          name="video"
          type="file"
          className="field"
          accept={ACCEPT_GAL_VIDEO}
          required={obligatoire}
          disabled={!stockageActif}
          onChange={(event) => verifier(event.target.files?.[0])}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>
          {t.champVideoFichierAide(poidsLisible(TAILLE_MAX_VIDEO))}
        </p>
        {nomFichier && <p className="adm-hint mono" style={{ marginTop: 4 }}>{nomFichier}</p>}
      </div>
    </div>
  );
}
