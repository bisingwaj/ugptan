"use client";

/**
 * Choix d'une couleur d'accent, partagé par les trois écrans qui en demandent
 * une : les réglages d'un événement, les catégories d'événements et celles des
 * actualités.
 *
 * ─── Ce qui est soumis ───────────────────────────────────────────────────────
 * UN SEUL champ part au serveur : un `<input type="hidden">` portant le nom
 * attendu par l'action (`color`), et une valeur qui reste ce qu'elle a toujours
 * été — un hexadécimal à six chiffres, ou la chaîne vide. Les actions n'ont donc
 * pas bougé d'une ligne, et leur validation (`lireCouleur`) reste la barrière.
 * Tout le reste ci-dessous est de la commande d'interface.
 *
 * ─── Trois façons de choisir, une seule valeur ───────────────────────────────
 *   1. la PALETTE du site, en premier : c'est le geste courant, et il évite
 *      celui qui abîme une charte — ouvrir une roue chromatique et retenir un
 *      bleu qui n'est pas LE bleu (cf. `PALETTE_ACCENT`) ;
 *   2. la roue NATIVE du système, pour ce que la palette ne couvre pas ;
 *   3. la saisie HEXADÉCIMALE, conservée parce qu'une charte se transmet en
 *      codes et se colle depuis un document, pas en cliquant.
 *
 * ⚠️ « Aucune » n'est pas une couleur, c'est l'absence de couleur : la fiche
 * retombe alors sur l'accent de sa catégorie, puis sur celui du site. Un
 * `<input type="color">` seul ne sait pas l'exprimer — il vaut toujours quelque
 * chose, noir à défaut. D'où le bouton de retrait, sans lequel poser une couleur
 * serait irréversible.
 */
import { useId, useState } from "react";
import { PALETTE_ACCENT } from "@/content/admin";

/** Six chiffres hexadécimaux précédés d'un croisillon — ce que l'action admet. */
const HEX = /^#[0-9a-f]{6}$/;

/**
 * Ramène une saisie à la forme attendue : minuscules, croisillon rétabli,
 * notation courte dépliée (`#0af` → `#00aaff`). Rend `""` pour tout le reste,
 * ce qui vaut « aucune couleur » — et non une couleur invalide.
 */
function normaliser(saisie: string): string {
  const brut = saisie.trim().toLowerCase().replace(/^#/, "");
  const complet = brut.length === 3 ? brut.split("").map((c) => c + c).join("") : brut;
  const hex = `#${complet}`;
  return HEX.test(hex) ? hex : "";
}

export function ChampCouleur({
  defaultValue,
  label,
  aide,
  /** Nom du champ soumis. `color` partout aujourd'hui, mais rien ne l'impose. */
  name = "color",
}: {
  defaultValue?: string | null;
  label: string;
  aide?: string;
  name?: string;
}) {
  const idBase = useId();
  const [valeur, setValeur] = useState(normaliser(defaultValue ?? ""));
  // Le texte saisi vit à part de la valeur retenue : sans cela, taper « #0f6 »
  // effacerait les caractères au fur et à mesure, chaque frappe intermédiaire
  // étant invalide.
  const [texte, setTexte] = useState(defaultValue?.trim() ?? "");

  const poser = (hex: string) => { setValeur(hex); setTexte(hex); };

  return (
    <div className="adm-form__field">
      <span className="label-mono" id={`${idBase}-label`}>{label}</span>

      {/* C'est ce champ, et lui seul, que l'action lit. */}
      <input type="hidden" name={name} value={valeur} />

      <div className="adm-couleur" role="group" aria-labelledby={`${idBase}-label`}>
        {PALETTE_ACCENT.map((accent) => {
          const actif = valeur === accent.hex;
          return (
            <button
              key={accent.hex}
              type="button"
              className={`adm-couleur__pastille${actif ? " is-on" : ""}`}
              style={{ background: accent.hex }}
              onClick={() => poser(accent.hex)}
              aria-pressed={actif}
              // Le nom accessible dit la couleur, pas son code : « Bleu (accent
              // du site) » se comprend à l'oreille, « #0f62fe » non.
              title={`${accent.nom} · ${accent.hex}`}
              aria-label={accent.nom}
            />
          );
        })}

        {/* Roue native. L'`<input type="color">` est masqué derrière la pastille
            plutôt que rendu tel quel : son apparence par défaut varie d'un
            système à l'autre et jure avec le reste de la console. */}
        <span
          className={`adm-couleur__pastille adm-couleur__libre${valeur && !PALETTE_ACCENT.some((a) => a.hex === valeur) ? " is-on" : ""}`}
          style={valeur ? { background: valeur } : undefined}
        >
          <input
            type="color"
            aria-label={`${label} — autre couleur`}
            value={valeur || "#0f62fe"}
            onChange={(event) => poser(event.target.value.toLowerCase())}
          />
        </span>

        <input
          id={`${idBase}-hex`}
          type="text"
          className="field mono adm-couleur__hex"
          spellCheck={false}
          inputMode="text"
          placeholder="#0f62fe"
          aria-label={`${label} — code hexadécimal`}
          value={texte}
          onChange={(event) => { setTexte(event.target.value); setValeur(normaliser(event.target.value)); }}
          // Au départ du champ, l'affichage rejoint ce qui sera réellement
          // enregistré : une saisie restée invalide s'efface au lieu de laisser
          // croire qu'elle a été retenue.
          onBlur={() => setTexte(valeur)}
        />

        {valeur && (
          <button type="button" className="btn btn--ghost btn--sm adm-couleur__vider" onClick={() => poser("")}>
            Retirer
          </button>
        )}
      </div>

      {aide && <p className="adm-hint" style={{ marginTop: 8 }}>{aide}</p>}
    </div>
  );
}
