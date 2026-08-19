"use client";

/**
 * Sélecteur de médias — modale partagée par l'image de couverture et par
 * l'insertion d'images dans le corps d'un article.
 *
 * Trois sources dans un même écran, parce qu'un rédacteur ne veut pas savoir où
 * vit un visuel :
 *   1. la bibliothèque (fichiers téléversés et médias externes) ;
 *   2. un téléversement immédiat, depuis le poste ;
 *   3. le registre d'images intégré au site (`src/content/media.ts`), proposé
 *      seulement pour une couverture — ces clés servent aussi ailleurs sur le
 *      site, les insérer dans un corps d'article brouillerait leur usage.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { televerserMediaAction } from "@/actions/admin-medias";
import { media as registre } from "@/content/media";
import type { ImgKey } from "@/content/types";
import { estImage, MIMES_IMAGE, mediaSrc, poidsLisible, TAILLE_MAX, type MediaRef } from "@/lib/medias";
import { vignette } from "@/lib/images";

/** Ce que le sélecteur renvoie à son appelant. */
export type ChoixMedia =
  | { kind: "asset"; asset: MediaRef; src: string; alt: string }
  | { kind: "key"; key: ImgKey; src: string; alt: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (choix: ChoixMedia) => void;
  /**
   * Bibliothèque telle que chargée par la page. Elle contient aussi des
   * documents depuis la bascule vers Cloudinary ; le sélecteur les écarte —
   * on choisit ici un VISUEL, et un PDF en couverture d'article ne s'affiche
   * pas.
   */
  assets: MediaRef[];
  /** Proposer le registre d'images du site. Réservé à la couverture. */
  avecRegistre?: boolean;
  titre?: string;
};

const CLES_REGISTRE = Object.keys(registre.img) as ImgKey[];

export function MediaPicker({ open, onClose, onSelect, assets, avecRegistre = false, titre = "Choisir un visuel" }: Props) {
  // Copie locale : un téléversement fait depuis la modale doit apparaître tout
  // de suite, sans attendre le rechargement de la page qui porte la liste.
  const [bibliotheque, setBibliotheque] = useState<MediaRef[]>(() => assets.filter((a) => estImage(a.mimeType)));
  const [recherche, setRecherche] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const fichierRef = useRef<HTMLInputElement>(null);

  useEffect(() => setBibliotheque(assets.filter((a) => estImage(a.mimeType))), [assets]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const televerser = useCallback(async (fichier: File) => {
    setErreur(null);
    setEnCours(true);
    try {
      const formData = new FormData();
      formData.set("fichier", fichier);
      const resultat = await televerserMediaAction(formData);

      if (!resultat.ok) {
        setErreur(resultat.error);
        return;
      }

      const nouveau: MediaRef = {
        id: resultat.id,
        filename: fichier.name,
        mimeType: fichier.type,
        size: fichier.size,
        width: resultat.width,
        height: resultat.height,
        // L'adresse rendue par le dépôt : c'est elle que `mediaSrc` doit
        // utiliser, sans repasser par la route de service.
        url: resultat.src || null,
        publicId: resultat.publicId,
        altFr: null,
        altEn: null,
        legende: null,
      };
      setBibliotheque((liste) => [nouveau, ...liste]);
      onSelect({ kind: "asset", asset: nouveau, src: resultat.src, alt: "" });
    } catch {
      setErreur("Téléversement impossible. Vérifiez votre connexion et réessayez.");
    } finally {
      setEnCours(false);
      if (fichierRef.current) fichierRef.current.value = "";
    }
  }, [onSelect]);

  if (!open) return null;

  const terme = recherche.trim().toLowerCase();
  const visibles = terme
    ? bibliotheque.filter((asset) =>
        `${asset.filename} ${asset.altFr ?? ""} ${asset.altEn ?? ""}`.toLowerCase().includes(terme))
    : bibliotheque;

  return (
    <div className="adm-modal" role="dialog" aria-modal="true" aria-label={titre} onClick={onClose}>
      <div className="adm-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="adm-modal__head">
          <span className="adm-modal__titre">{titre}</span>
          <button type="button" onClick={onClose} className="adm-modal__fermer" aria-label="Fermer">✕</button>
        </div>

        <div className="adm-modal__barre">
          <input
            type="search"
            value={recherche}
            onChange={(event) => setRecherche(event.target.value)}
            placeholder="Rechercher un visuel…"
            className="field"
            style={{ maxWidth: 280 }}
          />
          <label className="btn btn--outline btn--sm" style={{ cursor: enCours ? "progress" : "pointer" }}>
            {enCours ? "Téléversement…" : "Téléverser une image"}
            <input
              ref={fichierRef}
              type="file"
              accept={MIMES_IMAGE.join(",")}
              hidden
              disabled={enCours}
              onChange={(event) => {
                const fichier = event.target.files?.[0];
                if (fichier) void televerser(fichier);
              }}
            />
          </label>
          <span className="adm-hint">JPEG, PNG, WebP, AVIF ou GIF · {poidsLisible(TAILLE_MAX)} maximum</span>
        </div>

        {erreur && <div className="auth-error" role="alert">{erreur}</div>}

        <div className="adm-modal__corps">
          {visibles.length === 0 && !avecRegistre && (
            <p className="adm-hint">Aucun visuel dans la bibliothèque. Téléversez-en un ci-dessus.</p>
          )}

          {visibles.length > 0 && (
            <>
              <div className="label-mono">Bibliothèque</div>
              <div className="adm-medias">
                {visibles.map((asset) => {
                  const src = mediaSrc(asset);
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      className="adm-media"
                      onClick={() => onSelect({ kind: "asset", asset, src, alt: asset.altFr ?? "" })}
                    >
                      {/* Le sélecteur affiche des dizaines de fichiers à la fois,
                          dans des cases de 152 px : servis en pleine définition,
                          ils feraient plusieurs dizaines de mégaoctets à chaque
                          ouverture (cf. `vignette()` dans lib/images.ts). */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={vignette(src, 320)} alt="" loading="lazy" decoding="async" className="adm-media__img" />
                      <span className="adm-media__nom">{asset.altFr || asset.filename}</span>
                      <span className="adm-media__meta mono">
                        {asset.width && asset.height ? `${asset.width}×${asset.height}` : "—"}
                        {/* Une adresse sans identifiant de stockage : le fichier
                            est hébergé ailleurs, son poids nous est inconnu. */}
                        {asset.url && !asset.publicId ? " · externe" : ` · ${poidsLisible(asset.size)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {avecRegistre && (
            <>
              <div className="label-mono" style={{ marginTop: 22 }}>Registre du site</div>
              <p className="adm-hint" style={{ marginBottom: 12 }}>
                Visuels partagés par l'ensemble des pages. Utiles comme couverture de repli.
              </p>
              <div className="adm-medias">
                {CLES_REGISTRE.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="adm-media"
                    onClick={() => onSelect({ kind: "key", key, src: registre.img[key], alt: "" })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={registre.img[key]} alt="" loading="lazy" decoding="async" className="adm-media__img" />
                    <span className="adm-media__nom">{key}</span>
                    <span className="adm-media__meta mono">registre</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
