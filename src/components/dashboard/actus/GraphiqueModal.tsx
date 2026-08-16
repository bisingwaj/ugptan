"use client";

/**
 * Composition d'un graphique, depuis l'éditeur de contenu.
 *
 * Le rédacteur y saisit une SÉRIE — des intitulés, des valeurs — et choisit la
 * forme qui la sert. Rien de graphique n'est produit ici : la modale renvoie la
 * description, que l'éditeur enregistre dans la figure et que le site dessine
 * (cf. lib/html/graphique.ts).
 *
 * ─── L'aperçu est le rendu réel, pas une imitation ──────────────────────────
 *
 * Le bloc de droite emploie le composant `Graphique` du SITE, celui-là même qui
 * dessinera la figure sur la page publique. Un aperçu approximatif rendrait le
 * choix de la forme impossible : c'est précisément parce qu'une courbe ne dit
 * pas la même chose qu'un anneau qu'il faut voir les deux avant de trancher.
 *
 * ─── Le collage depuis un tableur ───────────────────────────────────────────
 *
 * Les chiffres d'un rapport vivent dans un tableur, jamais dans une console.
 * Retaper vingt lignes à la main, c'est vingt occasions de se tromper : le
 * champ de collage reprend les colonnes telles qu'Excel ou LibreOffice les
 * mettent dans le presse-papiers (intitulé, tabulation, valeur).
 */
import { useEffect, useId, useState } from "react";
import {
  GRAPHIQUE_MAX_ENTREES,
  GRAPHIQUE_TYPES,
  GRAPHIQUE_TYPE_AIDE,
  GRAPHIQUE_TYPE_LABEL,
  lireNombre,
  normaliserGraphique,
  type Graphique,
  type GraphiqueType,
} from "@/lib/html/graphique";
import { Graphique as GraphiqueVue } from "@/components/prose/Graphique";

/** Une ligne du formulaire : la valeur y reste du TEXTE tant qu'elle se saisit. */
type LigneSaisie = { label: string; valeur: string };

const LIGNE_VIDE: LigneSaisie = { label: "", valeur: "" };

const lignesDepuis = (graphique: Graphique | null): LigneSaisie[] =>
  graphique && graphique.entrees.length > 0
    ? graphique.entrees.map((entree) => ({
        label: entree.label,
        // Virgule décimale : la saisie se relit dans la langue où elle a été faite.
        valeur: String(entree.valeur).replace(".", ","),
      }))
    : [{ ...LIGNE_VIDE }, { ...LIGNE_VIDE }, { ...LIGNE_VIDE }];

/**
 * Lecture d'un collage tabulaire.
 *
 * Trois séparateurs admis, dans cet ordre : tabulation (ce que produisent les
 * tableurs), point-virgule (CSV francophone), virgule (CSV anglophone). La
 * virgule vient EN DERNIER, sans quoi « 12,5 » serait lu comme deux colonnes.
 */
function lireCollage(texte: string): LigneSaisie[] {
  return texte
    .split(/\r?\n/)
    .map((ligne) => ligne.trim())
    .filter(Boolean)
    .map((ligne) => {
      const separateur = ligne.includes("\t") ? "\t" : ligne.includes(";") ? ";" : ",";
      const colonnes = ligne.split(separateur);
      if (colonnes.length < 2) return null;
      const valeur = colonnes[colonnes.length - 1].trim();
      const label = colonnes.slice(0, -1).join(" ").trim();
      if (!label || lireNombre(valeur) === null) return null;
      return { label, valeur };
    })
    .filter((ligne): ligne is LigneSaisie => ligne !== null)
    .slice(0, GRAPHIQUE_MAX_ENTREES);
}

export function GraphiqueModal({
  open,
  valeur,
  onClose,
  onValider,
}: {
  open: boolean;
  /** Description existante, quand on modifie un graphique déjà posé. */
  valeur: Graphique | null;
  onClose: () => void;
  onValider: (graphique: Graphique) => void;
}) {
  const idBase = useId();

  const [type, setType] = useState<GraphiqueType>(valeur?.type ?? "barres");
  const [titre, setTitre] = useState(valeur?.titre ?? "");
  const [unite, setUnite] = useState(valeur?.unite ?? "");
  const [source, setSource] = useState(valeur?.source ?? "");
  const [lignes, setLignes] = useState<LigneSaisie[]>(() => lignesDepuis(valeur));
  const [collage, setCollage] = useState("");

  /**
   * Recharge à chaque OUVERTURE, et non à chaque rendu : la modale est montée
   * en permanence par l'éditeur (elle ne s'affiche que dépliée), et un état
   * dérivé de la prop à chaque passage effacerait la saisie en cours.
   */
  useEffect(() => {
    if (!open) return;
    setType(valeur?.type ?? "barres");
    setTitre(valeur?.titre ?? "");
    setUnite(valeur?.unite ?? "");
    setSource(valeur?.source ?? "");
    setLignes(lignesDepuis(valeur));
    setCollage("");
  }, [open, valeur]);

  useEffect(() => {
    if (!open) return;
    const surTouche = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [open, onClose]);

  if (!open) return null;

  const majLigne = (index: number, champ: keyof LigneSaisie, contenu: string) =>
    setLignes((actuelles) =>
      actuelles.map((ligne, rang) => (rang === index ? { ...ligne, [champ]: contenu } : ligne)),
    );

  const ajouterLigne = () =>
    setLignes((actuelles) =>
      actuelles.length >= GRAPHIQUE_MAX_ENTREES ? actuelles : [...actuelles, { ...LIGNE_VIDE }],
    );

  const retirerLigne = (index: number) =>
    setLignes((actuelles) =>
      actuelles.length <= 1 ? actuelles : actuelles.filter((_, rang) => rang !== index),
    );

  const reprendreCollage = () => {
    const reprises = lireCollage(collage);
    if (reprises.length === 0) return;
    setLignes(reprises);
    setCollage("");
  };

  // Description normalisée : `null` tant qu'aucune ligne n'est exploitable.
  // C'est elle qui alimente l'aperçu ET ce qui sera inséré — les deux ne
  // peuvent donc pas diverger.
  const graphique = normaliserGraphique({ type, titre, unite, source, entrees: lignes });
  const complet = graphique !== null;

  return (
    <div className="adm-modal" role="dialog" aria-modal="true" aria-label="Composer un graphique" onClick={onClose}>
      <div
        className="adm-modal__panel adm-graph__panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="adm-modal__head">
          <div>
            <div className="adm-modal__titre">{valeur ? "Modifier le graphique" : "Insérer un graphique"}</div>
            <p className="adm-hint" style={{ marginTop: 4 }}>
              Les valeurs sont enregistrées telles quelles ; c'est le site qui dessine la figure, à son
              format et aux couleurs de la page.
            </p>
          </div>
          <button type="button" className="adm-modal__fermer" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="adm-modal__corps adm-graph__corps">
          {/* --- Saisie ----------------------------------------------------- */}
          <div className="adm-graph__saisie">
            <fieldset className="adm-fieldset">
              <legend className="label-mono">Forme</legend>
              <div className="adm-graph__formes">
                {GRAPHIQUE_TYPES.map((valeurType) => (
                  <label
                    key={valeurType}
                    className={`adm-graph__forme${type === valeurType ? " is-on" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`${idBase}-type`}
                      value={valeurType}
                      checked={type === valeurType}
                      onChange={() => setType(valeurType)}
                    />
                    <span>
                      <strong>{GRAPHIQUE_TYPE_LABEL[valeurType]}</strong>
                      <span className="adm-hint">{GRAPHIQUE_TYPE_AIDE[valeurType]}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="adm-form__field">
              <label className="label-mono" htmlFor={`${idBase}-titre`}>Titre du graphique</label>
              <input
                id={`${idBase}-titre`}
                type="text"
                className="field"
                value={titre}
                maxLength={140}
                placeholder="Répartition des bénéficiaires par province"
                onChange={(event) => setTitre(event.target.value)}
              />
            </div>

            <div className="adm-form__row">
              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-unite`}>Unité</label>
                <input
                  id={`${idBase}-unite`}
                  type="text"
                  className="field"
                  value={unite}
                  maxLength={12}
                  placeholder="%"
                  onChange={(event) => setUnite(event.target.value)}
                />
                <p className="adm-hint" style={{ marginTop: 6 }}>
                  Suit chaque valeur affichée. Laissez vide si le nombre se suffit.
                </p>
              </div>

              <div className="adm-form__field">
                <label className="label-mono" htmlFor={`${idBase}-source`}>Source des chiffres</label>
                <input
                  id={`${idBase}-source`}
                  type="text"
                  className="field"
                  value={source}
                  maxLength={180}
                  placeholder="Rapport de suivi, T1 2026"
                  onChange={(event) => setSource(event.target.value)}
                />
              </div>
            </div>

            <div className="adm-graph__series">
              <div className="label-mono">Série ({lignes.length} / {GRAPHIQUE_MAX_ENTREES})</div>

              <table className="adm-graph__table">
                <thead>
                  <tr>
                    <th scope="col">Intitulé</th>
                    <th scope="col">Valeur</th>
                    <th scope="col"><span className="sr-only">Retirer</span></th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne, index) => (
                    // La clé est le RANG : les lignes n'ont pas d'identité
                    // propre, et une clé tirée du contenu ferait perdre le
                    // curseur à chaque frappe dans l'intitulé.
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          className="field"
                          value={ligne.label}
                          maxLength={60}
                          aria-label={`Intitulé de la ligne ${index + 1}`}
                          onChange={(event) => majLigne(index, "label", event.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="field mono"
                          value={ligne.valeur}
                          aria-label={`Valeur de la ligne ${index + 1}`}
                          // `type="text"` et non `number` : le champ doit
                          // accepter « 12,5 » comme « 12.5 », ce qu'un champ
                          // numérique refuse selon la langue du navigateur.
                          onChange={(event) => majLigne(index, "valeur", event.target.value)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="adm-graph__retirer"
                          onClick={() => retirerLigne(index)}
                          disabled={lignes.length <= 1}
                          aria-label={`Retirer la ligne ${index + 1}`}
                          title="Retirer la ligne"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="adm-actions__row" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={ajouterLigne}
                  disabled={lignes.length >= GRAPHIQUE_MAX_ENTREES}
                >
                  Ajouter une ligne
                </button>
              </div>

              <details className="adm-graph__collage">
                <summary>Coller depuis un tableur</summary>
                <p className="adm-hint" style={{ margin: "8px 0" }}>
                  Une ligne par entrée, l'intitulé puis la valeur. Les colonnes copiées d'Excel ou de
                  LibreOffice conviennent telles quelles, comme un fichier CSV.
                </p>
                <textarea
                  className="field mono"
                  rows={5}
                  value={collage}
                  spellCheck={false}
                  aria-label="Lignes à reprendre"
                  placeholder={"Kinshasa\t1240\nKongo-Central\t860"}
                  onChange={(event) => setCollage(event.target.value)}
                />
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  style={{ marginTop: 10 }}
                  onClick={reprendreCollage}
                  disabled={lireCollage(collage).length === 0}
                >
                  Reprendre ces lignes
                </button>
              </details>
            </div>
          </div>

          {/* --- Aperçu ------------------------------------------------------ */}
          <div className="adm-graph__apercu">
            <div className="label-mono">Aperçu</div>
            {graphique ? (
              <div className="adm-graph__scene">
                <GraphiqueVue graphique={graphique} lang="fr" />
              </div>
            ) : (
              <p className="adm-hint">
                Renseignez au moins une ligne complète — un intitulé et une valeur numérique — pour voir
                le graphique.
              </p>
            )}
          </div>
        </div>

        <div className="adm-modal__barre">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            disabled={!complet}
            onClick={() => graphique && onValider(graphique)}
          >
            {valeur ? "Mettre à jour" : "Insérer le graphique"}
          </button>
          <button type="button" className="btn btn--outline btn--sm" onClick={onClose}>
            Annuler
          </button>
          {!complet && (
            <span className="adm-hint">Une ligne complète au minimum : un intitulé, une valeur.</span>
          )}
        </div>
      </div>
    </div>
  );
}
