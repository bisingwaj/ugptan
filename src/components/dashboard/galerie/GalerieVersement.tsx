"use client";

/**
 * Versement en série de médias — photos ET vidéos mêlées — dans un album.
 *
 * ─── Pourquoi le navigateur boucle, plutôt qu'un formulaire multiple ─────────
 *
 * Le corps d'une server action est plafonné à 14 Mo (`bodySizeLimit`, cf.
 * next.config.mjs). Un `<input multiple>` envoyé d'un bloc dépasserait ce
 * plafond dès la troisième photographie, et le refus viendrait du TRANSPORT :
 * pas de message lisible, pas de moyen de savoir quel fichier a fauté, rien de
 * repris. On envoie donc un fichier par appel.
 *
 * Quatre bénéfices, et les trois derniers sont ce que l'écran doit montrer :
 *   · le plafond ne peut plus être atteint ;
 *   · un fichier LOURD ne bloque pas les autres — pendant qu'il monte, les
 *     autres ouvriers de la file continuent d'avancer ;
 *   · l'échec est LOCAL : il nomme son fichier, dit pourquoi, et laisse le reste
 *     passer ;
 *   · chaque fichier a son propre ÉTAT, visible à l'écran : en attente, en
 *     cours, terminé, en erreur.
 *
 * ─── Trois de front ─────────────────────────────────────────────────────────
 *
 * Ni séquentiel — quarante photographies l'une après l'autre font attendre une
 * minute et demie pour rien — ni tout en parallèle, qui saturerait la liaison et
 * les limites de l'hébergeur. Trois ouvriers puisent dans la même file : dès que
 * l'un termine, il prend le fichier suivant.
 *
 * ⚠️ Aucune saisie n'est demandée par fichier, et c'est la règle du module :
 * l'information vit sur l'ALBUM. Chaque média hérite de sa rubrique, de sa date,
 * de son lieu et de ses composantes, prend le nom de son fichier pour titre, et
 * arrive visible.
 */
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { verserDansAlbumAction } from "@/actions/admin-galerie";
import { ADMIN_GALERIE } from "@/content/admin";
import {
  ACCEPT_GAL_MEDIA, TAILLE_MAX, TAILLE_MAX_VIDEO,
  poidsLisible, tailleMaxPour, typeMediaDuFichier,
} from "@/lib/galerie/fichier";

/** Nombre de versements menés de front. */
const OUVRIERS = 3;

type Etat = "attente" | "cours" | "termine" | "erreur";

type Ligne = {
  /** Clé stable : deux fichiers peuvent porter le même nom. */
  cle: string;
  nom: string;
  taille: number;
  type: "PHOTO" | "VIDEO" | null;
  etat: Etat;
  message: string | null;
};

const ETAT_LABEL: Record<Etat, string> = {
  attente: "En attente",
  cours: "En cours…",
  termine: "Terminé",
  erreur: "Erreur",
};

export function GalerieVersement({ albumId, stockageActif }: { albumId: string; stockageActif: boolean }) {
  const t = ADMIN_GALERIE;
  const router = useRouter();
  const champ = useRef<HTMLInputElement>(null);

  /** Les fichiers réellement sélectionnés, indexés par clé de ligne. */
  const fichiers = useRef(new Map<string, File>());
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [enCours, setEnCours] = useState(false);

  const majLigne = (cle: string, champs: Partial<Ligne>) =>
    setLignes((liste) => liste.map((l) => (l.cle === cle ? { ...l, ...champs } : l)));

  function choisir(liste: FileList | null) {
    fichiers.current.clear();
    if (!liste) {
      setLignes([]);
      return;
    }

    const nouvelles = Array.from(liste).map((fichier, index) => {
      const cle = `${index}-${fichier.name}-${fichier.size}`;
      fichiers.current.set(cle, fichier);

      const type = typeMediaDuFichier(fichier.type);
      // Le refus se voit AVANT l'envoi : inutile de faire monter douze
      // mégaoctets pour apprendre qu'ils seront écartés.
      const refus = !type
        ? "format non accepté"
        : fichier.size > tailleMaxPour(fichier.type)
          ? `trop lourd (${poidsLisible(fichier.size)} — limite ${poidsLisible(tailleMaxPour(fichier.type))})`
          : null;

      return {
        cle,
        nom: fichier.name,
        taille: fichier.size,
        type,
        etat: refus ? ("erreur" as const) : ("attente" as const),
        message: refus,
      };
    });

    setLignes(nouvelles);
  }

  async function verser() {
    if (enCours) return;

    const aFaire = lignes.filter((l) => l.etat === "attente");
    if (aFaire.length === 0) return;

    setEnCours(true);

    // Index partagé : chaque ouvrier prend le fichier suivant dès qu'il a fini
    // le sien, ce qui garde les trois occupés même si les poids sont très
    // inégaux — une vidéo de dix mégaoctets n'immobilise pas la file.
    let prochain = 0;

    const ouvrier = async () => {
      for (;;) {
        const index = prochain;
        prochain += 1;
        if (index >= aFaire.length) return;

        const ligne = aFaire[index];
        const fichier = fichiers.current.get(ligne.cle);
        if (!fichier) {
          majLigne(ligne.cle, { etat: "erreur", message: "fichier introuvable" });
          continue;
        }

        majLigne(ligne.cle, { etat: "cours", message: null });

        const formData = new FormData();
        formData.set("albumId", albumId);
        formData.set("media", fichier);

        try {
          const resultat = await verserDansAlbumAction(formData);
          if (resultat.ok) majLigne(ligne.cle, { etat: "termine", message: null });
          else majLigne(ligne.cle, { etat: "erreur", message: resultat.error });
        } catch {
          // Une action qui lève — session expirée, coupure — ne doit pas
          // interrompre la file : on note et on continue.
          majLigne(ligne.cle, { etat: "erreur", message: "envoi interrompu" });
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(OUVRIERS, aFaire.length) }, ouvrier));

    setEnCours(false);
    if (champ.current) champ.current.value = "";
    // Recharge la liste des contenus, rendue côté serveur au-dessus.
    router.refresh();
  }

  const compte = useMemo(() => {
    const par = (etat: Etat) => lignes.filter((l) => l.etat === etat).length;
    return {
      total: lignes.length,
      attente: par("attente"),
      cours: par("cours"),
      termine: par("termine"),
      erreur: par("erreur"),
    };
  }, [lignes]);

  const traites = compte.termine + compte.erreur;
  const pourcent = compte.total ? Math.round((traites / compte.total) * 100) : 0;
  const restants = compte.attente + compte.cours;

  return (
    <div className="adm-panel adm-gal__versement">
      <div className="label-mono">{t.versementTitre}</div>
      <p className="adm-hint" style={{ marginTop: 8 }}>{t.versementAide}</p>

      {!stockageActif && (
        <div className="auth-error" role="alert" style={{ marginTop: 12 }}>{t.stockageAbsent}</div>
      )}

      <div className="adm-form__field" style={{ marginTop: 14 }}>
        <label className="label-mono" htmlFor={`versement-${albumId}`}>{t.versementChoisir}</label>
        <input
          id={`versement-${albumId}`}
          ref={champ}
          type="file"
          className="field"
          accept={ACCEPT_GAL_MEDIA}
          multiple
          disabled={!stockageActif || enCours}
          onChange={(event) => choisir(event.target.files)}
        />
        <p className="adm-hint" style={{ marginTop: 6 }}>
          {t.versementFormats(poidsLisible(TAILLE_MAX), poidsLisible(TAILLE_MAX_VIDEO))}
        </p>
      </div>

      {compte.total > 0 && (
        <div className="adm-gal__progres" role="status" aria-live="polite">
          <div className="adm-gal__progres-barre">
            <span style={{ width: `${pourcent}%` }} />
          </div>
          <span className="mono adm-hint">
            {t.versementCompte(compte.termine, restants, compte.erreur, compte.total)}
          </span>
        </div>
      )}

      {lignes.length > 0 && (
        <ul className="adm-gal__file">
          {lignes.map((ligne) => (
            <li key={ligne.cle} className={`adm-gal__file-item adm-gal__file-item--${ligne.etat}`}>
              <span className="adm-gal__file-etat mono" aria-hidden="true">
                {ligne.etat === "termine" ? "✓" : ligne.etat === "erreur" ? "✕" : ligne.etat === "cours" ? "◐" : "·"}
              </span>

              <span className="adm-gal__file-nom">
                <span className="mono">{ligne.nom}</span>
                <span className="adm-gal__file-meta">
                  {ligne.type === "VIDEO" ? t.versementVideoTag : t.versementPhotoTag}
                  {" · "}{poidsLisible(ligne.taille)}
                  {ligne.message ? ` · ${ligne.message}` : ""}
                </span>
              </span>

              <span className="adm-gal__file-badge mono">{ETAT_LABEL[ligne.etat]}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="adm-actions__row" style={{ marginTop: 14 }}>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={verser}
          disabled={!stockageActif || enCours || compte.attente === 0}
        >
          {enCours ? t.versementEnCours(traites, compte.total) : t.versementLancer}
        </button>

        {!enCours && lignes.length > 0 && (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              fichiers.current.clear();
              setLignes([]);
              if (champ.current) champ.current.value = "";
            }}
          >
            {t.versementVider}
          </button>
        )}
      </div>
    </div>
  );
}
