"use client";

/**
 * Galerie d'images d'un article : choisir, téléverser, ordonner, retirer.
 *
 * Champ de FICHE, sans `<form>` propre : il vit dans les réglages (cf.
 * ReglagesChamps), et la galerie part avec eux — dès la création de l'article,
 * puis à chaque « Enregistrer les réglages ». Le formulaire reçoit un champ
 * caché `galerie` par image, dans l'ordre affiché : c'est cet ordre que le
 * serveur enregistre (cf. `lireGalerie` dans actions/admin-actualites.ts).
 *
 * Les images sont des médias de la BIBLIOTHÈQUE. Un téléversement fait ici y
 * entre aussitôt (même action que la bibliothèque) ; il n'est rattaché à
 * l'article qu'à l'enregistrement des réglages.
 */
import { useRef, useState } from "react";
import { televerserMediaAction } from "@/actions/admin-medias";
import { ADMIN_ACTUS } from "@/content/admin";
import type { ImageGalerie } from "@/lib/actus/saisie";
import { estImage, mediaSrc, MIMES_IMAGE, poidsLisible, TAILLE_MAX, type MediaRef } from "@/lib/medias";
import { vignette } from "@/lib/images";
import { MediaPicker, type ChoixMedia } from "@/components/dashboard/actus/MediaPicker";

/** Plafond d'une galerie : au-delà, c'est un album, qui a son propre module. */
const MAX_IMAGES = 60;

export function ArticleGalerieChamp({ initial, assets }: { initial: ImageGalerie[]; assets: MediaRef[] }) {
  const t = ADMIN_ACTUS;
  const [images, setImages] = useState<ImageGalerie[]>(initial);
  const [picker, setPicker] = useState(false);
  const [envoi, setEnvoi] = useState<{ fait: number; total: number } | null>(null);
  const [erreurs, setErreurs] = useState<string[]>([]);
  const fichiers = useRef<HTMLInputElement>(null);

  const ajouter = (nouvelles: ImageGalerie[]) =>
    setImages((courantes) => {
      const deja = new Set(courantes.map((i) => i.id));
      return [...courantes, ...nouvelles.filter((i) => !deja.has(i.id))].slice(0, MAX_IMAGES);
    });

  const choisir = (choix: ChoixMedia) => {
    setPicker(false);
    if (choix.kind !== "asset") return;
    ajouter([{ id: choix.asset.id, src: mediaSrc(choix.asset), alt: choix.alt }]);
  };

  /** Téléverse les fichiers choisis un par un : une erreur n'arrête pas les autres. */
  const televerser = async (liste: FileList | null) => {
    if (!liste?.length) return;
    const aEnvoyer = [...liste];
    const refus: string[] = [];
    const recues: ImageGalerie[] = [];
    setErreurs([]);
    setEnvoi({ fait: 0, total: aEnvoyer.length });

    for (const [rang, fichier] of aEnvoyer.entries()) {
      if (!estImage(fichier.type)) {
        refus.push(`${fichier.name} : ${t.galerieRefusFormat}`);
      } else if (fichier.size > TAILLE_MAX) {
        refus.push(`${fichier.name} : trop lourd (${poidsLisible(fichier.size)}, limite ${poidsLisible(TAILLE_MAX)}).`);
      } else {
        const donnees = new FormData();
        donnees.set("fichier", fichier);
        try {
          const resultat = await televerserMediaAction(donnees);
          if (resultat.ok) recues.push({ id: resultat.id, src: resultat.src, alt: resultat.alt });
          else refus.push(`${fichier.name} : ${resultat.error}`);
        } catch {
          refus.push(`${fichier.name} : ${t.galerieEchec}`);
        }
      }
      setEnvoi({ fait: rang + 1, total: aEnvoyer.length });
    }

    ajouter(recues);
    setErreurs(refus);
    setEnvoi(null);
    if (fichiers.current) fichiers.current.value = "";
  };

  const deplacer = (index: number, pas: number) =>
    setImages((courantes) => {
      const cible = index + pas;
      if (cible < 0 || cible >= courantes.length) return courantes;
      const copie = [...courantes];
      [copie[index], copie[cible]] = [copie[cible], copie[index]];
      return copie;
    });

  const retirer = (id: string) => setImages((courantes) => courantes.filter((i) => i.id !== id));

  return (
    <div className="adm-panel adm-edit__bloc">
      <div className="label-mono">
        {t.galerieBloc}
        {images.length > 0 && <span className="adm-hint"> · {images.length}</span>}
      </div>

      {images.map((image) => (
        <input key={image.id} type="hidden" name="galerie" value={image.id} />
      ))}

      {images.length === 0 ? (
        <p className="adm-hint">{t.galerieAucune}</p>
      ) : (
        <ol className="adm-galerie">
          {images.map((image, index) => (
            <li key={image.id} className="adm-galerie__item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={vignette(image.src, 240)} alt={image.alt} loading="lazy" decoding="async" />
              <div className="adm-galerie__outils">
                <button
                  type="button"
                  onClick={() => deplacer(index, -1)}
                  disabled={index === 0}
                  aria-label={`${t.galerieAvant} (${index + 1})`}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => deplacer(index, 1)}
                  disabled={index === images.length - 1}
                  aria-label={`${t.galerieApres} (${index + 1})`}
                >
                  →
                </button>
                <button type="button" onClick={() => retirer(image.id)} aria-label={`${t.galerieRetirer} (${index + 1})`}>
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {erreurs.length > 0 && (
        <div className="auth-error" role="alert">
          {erreurs.map((e) => <div key={e}>{e}</div>)}
        </div>
      )}

      <div className="adm-actions__row">
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => setPicker(true)}
          disabled={images.length >= MAX_IMAGES}
        >
          {t.galerieBibliotheque}
        </button>
        <label className={`btn btn--ghost btn--sm${envoi ? " is-disabled" : ""}`}>
          {envoi ? `${t.galerieEnvoi} ${envoi.fait}/${envoi.total}` : t.galerieTeleverser}
          <input
            ref={fichiers}
            type="file"
            accept={MIMES_IMAGE.join(",")}
            multiple
            hidden
            disabled={envoi !== null || images.length >= MAX_IMAGES}
            onChange={(event) => televerser(event.target.files)}
          />
        </label>
      </div>

      <p className="adm-hint">{t.galerieAide}</p>

      <MediaPicker
        open={picker}
        assets={assets}
        onClose={() => setPicker(false)}
        onSelect={choisir}
        titre={t.galerieBloc}
      />
    </div>
  );
}
