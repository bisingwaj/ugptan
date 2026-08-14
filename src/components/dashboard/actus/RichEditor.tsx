"use client";

/**
 * Éditeur de contenu riche des articles.
 *
 * Écrit à la main, sans bibliothèque : le dépôt n'embarque aucune dépendance
 * d'interface (icônes, animations et grilles sont toutes dessinées ici), et un
 * éditeur tiers imposerait son propre HTML, son propre thème et sa propre
 * politique de collage — trois choses que ce projet contrôle déjà.
 *
 * Mécanique : un `contenteditable` piloté par `document.execCommand`. L'API est
 * marquée obsolète mais reste implémentée par tous les moteurs, et c'est celle
 * qui donne gratuitement l'annulation native, la gestion des sélections
 * multiples et le comportement attendu de la touche Entrée. La reconstruire à
 * la main sur `Range` coûterait un ordre de grandeur de plus pour un résultat
 * moins fidèle.
 *
 * Deux points structurent le composant :
 *
 *  - **La sélection est mémorisée.** Cliquer un bouton de barre d'outils, ou
 *    ouvrir la modale de médias, fait perdre le curseur ; sans mémorisation,
 *    l'image s'insérerait en tête de document. Chaque bouton empêche en outre
 *    le `mousedown` par défaut, ce qui évite le déplacement du curseur.
 *  - **Rien n'entre sans être assaini.** Le HTML collé traverse le MÊME
 *    assainisseur que celui appliqué à l'écriture en base
 *    (cf. lib/html/sanitize.ts). Un collage depuis Word ou depuis une page web
 *    arrive donc déjà réduit aux balises que le site sait afficher.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { televerserMediaAction } from "@/actions/admin-medias";
import { htmlToText, readingMinutes, sanitizeHtml } from "@/lib/html/sanitize";
import {
  GRAPHIQUE_ATTR, GRAPHIQUE_CLASSE, decoderGraphique, figureGraphique, type Graphique,
} from "@/lib/html/graphique";
import type { MediaRef } from "@/lib/medias";
import { idYouTube, urlIntegrationYouTube } from "@/lib/actus/video";
import { EditorIcon, type EditorIconName } from "@/components/dashboard/actus/EditorIcon";
import { MediaPicker, type ChoixMedia } from "@/components/dashboard/actus/MediaPicker";
import { GraphiqueModal } from "@/components/dashboard/actus/GraphiqueModal";

type Props = {
  /** Nom du champ transmis au formulaire (contenu HTML assaini). */
  name: string;
  defaultValue?: string;
  assets: MediaRef[];
  /** Identifiant de l'étiquette qui décrit la zone d'édition. */
  labelId?: string;
  placeholder?: string;
};

/** Blocs proposés. `value` est passé tel quel à `formatBlock`. */
const BLOCS = [
  { value: "<p>", label: "Paragraphe" },
  { value: "<h2>", label: "Titre 2" },
  { value: "<h3>", label: "Titre 3" },
  { value: "<h4>", label: "Titre 4" },
  { value: "<blockquote>", label: "Citation" },
  { value: "<pre>", label: "Bloc de code" },
];

/** Couleurs de texte — celles du design system, pas une roue chromatique. */
const COULEURS_TEXTE = [
  "#161616", "#525252", "#8d8d8d",
  "#0f62fe", "#0043ce", "#009d9a",
  "#198038", "#da1e28", "#8a3ffc", "#ff832b",
];

const COULEURS_FOND = ["#edf5ff", "#defbe6", "#fff2e8", "#ffe9e9", "#f4f4f4"];

const escapeAttr = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function RichEditor({ name, defaultValue = "", assets, labelId, placeholder }: Props) {
  // Capturé une fois : le `contenteditable` est piloté par le DOM, pas par
  // React. Réinjecter la valeur à chaque rendu replacerait le curseur en tête.
  const initial = useRef(sanitizeHtml(defaultValue)).current;

  const editeurRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);

  const [html, setHtml] = useState(initial);
  const [source, setSource] = useState(false);
  const [palette, setPalette] = useState<"texte" | "fond" | null>(null);
  const [picker, setPicker] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [depot, setDepot] = useState(false);

  /* Graphique en cours de composition. `cible` désigne la figure à REMPLACER
     quand on modifie un graphique déjà posé ; nulle, la figure est insérée au
     curseur. */
  const [graphOuvert, setGraphOuvert] = useState(false);
  const [graphValeur, setGraphValeur] = useState<Graphique | null>(null);
  const graphCibleRef = useRef<HTMLElement | null>(null);

  /* --- Synchronisation ---------------------------------------------------- */

  /**
   * Une figure de graphique n'est pas un texte : ce qu'elle affiche dans
   * l'éditeur est le REPLI de sa description (cf. lib/html/graphique.ts), et
   * corriger un chiffre à la main dans ce tableau ne toucherait pas la
   * description — le dessin publié ne bougerait pas d'un pixel. Les figures
   * sont donc verrouillées à la frappe : on les modifie par la modale, qui
   * réécrit les deux d'un coup.
   *
   * L'attribut ne survit pas à l'enregistrement : `contenteditable` n'est pas
   * sur la liste blanche de l'assainisseur.
   */
  const verrouillerGraphiques = useCallback((node: HTMLElement) => {
    node.querySelectorAll(`figure.${GRAPHIQUE_CLASSE}`).forEach((figure) => {
      if (figure.getAttribute("contenteditable") !== "false") {
        figure.setAttribute("contenteditable", "false");
      }
    });
  }, []);

  const synchroniser = useCallback(() => {
    const node = editeurRef.current;
    if (!node) return;
    verrouillerGraphiques(node);
    setHtml(node.innerHTML);
  }, [verrouillerGraphiques]);

  const memoriser = useCallback(() => {
    const selection = window.getSelection();
    const node = editeurRef.current;
    if (!selection?.rangeCount || !node) return;
    if (!node.contains(selection.anchorNode)) return;
    selectionRef.current = selection.getRangeAt(0).cloneRange();
  }, []);

  const restaurer = useCallback(() => {
    const node = editeurRef.current;
    if (!node) return;
    node.focus();

    const range = selectionRef.current;
    if (!range || !node.contains(range.commonAncestorContainer)) return;

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, []);

  useEffect(() => {
    const node = editeurRef.current;
    if (!node) return;
    // Sans cette bascule, Chrome insère un <div> à chaque retour à la ligne :
    // le corps se remplirait de blocs que le rendu public ne stylise pas.
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch {
      /* Moteur sans cette commande : le comportement par défaut fait l'affaire. */
    }
    if (!node.innerHTML.trim()) node.innerHTML = "<p><br></p>";
    verrouillerGraphiques(node);
    setHtml(node.innerHTML);
  }, [verrouillerGraphiques]);

  /* --- Commandes ---------------------------------------------------------- */

  const executer = useCallback((commande: string, valeur?: string) => {
    restaurer();
    document.execCommand(commande, false, valeur);
    memoriser();
    synchroniser();
  }, [restaurer, memoriser, synchroniser]);

  const inserer = useCallback((fragment: string) => {
    restaurer();
    document.execCommand("insertHTML", false, fragment);
    memoriser();
    synchroniser();
  }, [restaurer, memoriser, synchroniser]);

  const colorer = useCallback((commande: "foreColor" | "hiliteColor", couleur: string) => {
    restaurer();
    // `styleWithCSS` produit un `style="color:…"` plutôt qu'une balise <font>,
    // que l'assainisseur écarterait à l'enregistrement.
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(commande, false, couleur);
    document.execCommand("styleWithCSS", false, "false");
    setPalette(null);
    memoriser();
    synchroniser();
  }, [restaurer, memoriser, synchroniser]);

  const poserLien = useCallback(() => {
    memoriser();
    const url = window.prompt("Adresse du lien (https://… , mailto:… ou /fr/…)");
    if (url === null) return;

    const valeur = url.trim();
    if (!valeur) {
      executer("unlink");
      return;
    }
    executer("createLink", valeur);
  }, [executer, memoriser]);

  const insererTableau = useCallback(() => {
    memoriser();
    const lignes = Number.parseInt(window.prompt("Nombre de lignes (en-tête compris)", "3") ?? "", 10);
    const colonnes = Number.parseInt(window.prompt("Nombre de colonnes", "3") ?? "", 10);
    if (!Number.isFinite(lignes) || !Number.isFinite(colonnes)) return;

    const l = Math.min(Math.max(lignes, 2), 20);
    const c = Math.min(Math.max(colonnes, 1), 8);

    const entete = `<thead><tr>${"<th>Intitulé</th>".repeat(c)}</tr></thead>`;
    const corps = `<tbody>${`<tr>${"<td>&nbsp;</td>".repeat(c)}</tr>`.repeat(l - 1)}</tbody>`;
    inserer(`<table class="actu-table">${entete}${corps}</table><p><br></p>`);
  }, [inserer, memoriser]);

  const insererVideo = useCallback(() => {
    memoriser();
    const saisie = window.prompt("Lien YouTube de la vidéo");
    if (!saisie) return;

    const id = idYouTube(saisie);
    if (!id) {
      setMessage("Lien YouTube non reconnu. Collez l'adresse complète de la vidéo.");
      return;
    }

    setMessage(null);
    inserer(
      `<figure class="actu-embed"><iframe src="${escapeAttr(urlIntegrationYouTube(id))}" ` +
        `title="Vidéo YouTube" loading="lazy" allowfullscreen></iframe></figure><p><br></p>`,
    );
  }, [inserer, memoriser]);

  /* --- Graphiques --------------------------------------------------------- */

  /** Ouvre la modale sur une figure vierge, au curseur mémorisé. */
  const ouvrirGraphique = useCallback(() => {
    memoriser();
    graphCibleRef.current = null;
    setGraphValeur(null);
    setGraphOuvert(true);
  }, [memoriser]);

  /**
   * Clic dans la zone d'édition : une figure de graphique se rouvre à la
   * modale. Elle est verrouillée à la frappe, le clic est donc le seul geste
   * qui reste — et c'est celui qu'on tente naturellement.
   */
  const surClicZone = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const figure = (event.target as HTMLElement).closest?.(`figure.${GRAPHIQUE_CLASSE}`);
    if (!(figure instanceof HTMLElement)) return;

    event.preventDefault();
    graphCibleRef.current = figure;
    setGraphValeur(decoderGraphique(figure.getAttribute(GRAPHIQUE_ATTR) ?? ""));
    setGraphOuvert(true);
  }, []);

  const validerGraphique = useCallback((graphique: Graphique) => {
    setGraphOuvert(false);

    const fragment = figureGraphique(graphique);
    if (!fragment) {
      setMessage("Série trop longue pour être enregistrée. Réduisez le nombre de lignes.");
      return;
    }

    const cible = graphCibleRef.current;
    graphCibleRef.current = null;

    // Modification : la figure est remplacée dans le document, sans passer par
    // `execCommand` — la sélection n'est pas dans la figure, qui est verrouillée.
    if (cible?.isConnected) {
      const gabarit = document.createElement("div");
      gabarit.innerHTML = fragment;
      const neuve = gabarit.firstElementChild;
      if (neuve) {
        cible.replaceWith(neuve);
        setMessage(null);
        synchroniser();
        return;
      }
    }

    setMessage(null);
    inserer(`${fragment}<p><br></p>`);
  }, [inserer, synchroniser]);

  const insererImage = useCallback((choix: ChoixMedia) => {
    setPicker(false);
    const legende = choix.kind === "asset" ? choix.asset.legende ?? "" : "";
    inserer(
      `<figure class="actu-figure"><img src="${escapeAttr(choix.src)}" alt="${escapeAttr(choix.alt)}" ` +
        `loading="lazy" /><figcaption>${legende || "Légende du visuel"}</figcaption></figure><p><br></p>`,
    );
  }, [inserer]);

  /* --- Collage et dépôt de fichiers --------------------------------------- */

  const televerserPuisInserer = useCallback(async (fichier: File) => {
    setMessage("Téléversement de l'image…");
    const formData = new FormData();
    formData.set("fichier", fichier);

    try {
      const resultat = await televerserMediaAction(formData);
      if (!resultat.ok) {
        setMessage(resultat.error);
        return;
      }
      setMessage(null);
      inserer(
        `<figure class="actu-figure"><img src="${escapeAttr(resultat.src)}" alt="" loading="lazy" />` +
          `<figcaption>Légende du visuel</figcaption></figure><p><br></p>`,
      );
    } catch {
      setMessage("Téléversement impossible. Réessayez.");
    }
  }, [inserer]);

  const onPaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    const data = event.clipboardData;
    if (!data) return;

    const html = data.getData("text/html");
    const texte = data.getData("text/plain");

    /**
     * ⚠️ Le TEXTE l'emporte sur l'image, et l'ordre de ce test est tout le
     * sujet.
     *
     * Word, Excel et Outlook déposent dans le presse-papiers une IMAGE de la
     * sélection À CÔTÉ de son texte : copier un paragraphe de Word, c'est
     * copier à la fois du HTML, du texte brut et une capture. Chercher l'image
     * d'abord — ce que faisait cette fonction — revenait à téléverser une photo
     * du paragraphe au lieu de coller le paragraphe.
     *
     * Une capture d'écran, elle, arrive SEULE : ni HTML, ni texte. C'est
     * exactement ce que teste la condition, et c'est le seul cas où le fichier
     * doit gagner.
     */
    const capture = !html && !texte
      ? Array.from(data.items)
          .find((item) => item.kind === "file" && item.type.startsWith("image/"))
          ?.getAsFile()
      : undefined;

    if (capture) {
      event.preventDefault();
      memoriser();
      void televerserPuisInserer(capture);
      return;
    }

    if (!html) return; // texte brut : le comportement natif convient

    // Un fragment que l'assainisseur vide entièrement — une mise en forme sans
    // aucun texte — ne doit pas faire perdre le collage : on retombe alors sur
    // le texte brut, que le navigateur aurait inséré de lui-même.
    const propre = sanitizeHtml(html);
    event.preventDefault();

    if (propre.trim()) document.execCommand("insertHTML", false, propre);
    else if (texte) document.execCommand("insertText", false, texte);

    synchroniser();
  }, [memoriser, synchroniser, televerserPuisInserer]);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    setDepot(false);
    const fichier = Array.from(event.dataTransfer?.files ?? []).find((f) => f.type.startsWith("image/"));
    if (!fichier) return;
    event.preventDefault();
    memoriser();
    void televerserPuisInserer(fichier);
  }, [memoriser, televerserPuisInserer]);

  /* --- Bascule code source ------------------------------------------------ */

  const basculerSource = useCallback(() => {
    if (source) {
      const propre = sanitizeHtml(html);
      const node = editeurRef.current;
      if (node) {
        node.innerHTML = propre || "<p><br></p>";
        verrouillerGraphiques(node);
      }
      setHtml(propre);
    } else {
      synchroniser();
    }
    setSource((valeur) => !valeur);
  }, [source, html, synchroniser, verrouillerGraphiques]);

  /* --- Rendu -------------------------------------------------------------- */

  const Bouton = ({
    icone, titre, onClick, actif = false,
  }: { icone: EditorIconName; titre: string; onClick: () => void; actif?: boolean }) => (
    <button
      type="button"
      title={titre}
      aria-label={titre}
      aria-pressed={actif}
      className={`rte__b${actif ? " is-on" : ""}`}
      // Empêche la perte de sélection au clic — sans quoi la commande
      // s'appliquerait à un curseur qui n'est plus dans le texte visé.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <EditorIcon name={icone} />
    </button>
  );

  const texte = htmlToText(html);
  const mots = texte ? texte.split(/\s+/).length : 0;

  return (
    <div className="rte">
      <div className="rte__barre" role="toolbar" aria-label="Mise en forme">
        <select
          className="rte__bloc"
          defaultValue=""
          aria-label="Style de bloc"
          onMouseDown={memoriser}
          onChange={(event) => {
            if (!event.target.value) return;
            executer("formatBlock", event.target.value);
            event.target.value = "";
          }}
        >
          <option value="" disabled>Style…</option>
          {BLOCS.map((bloc) => (
            <option key={bloc.value} value={bloc.value}>{bloc.label}</option>
          ))}
        </select>

        <span className="rte__sep" />

        <button type="button" title="Gras" aria-label="Gras" className="rte__b rte__b--txt"
          onMouseDown={(e) => e.preventDefault()} onClick={() => executer("bold")}><b>G</b></button>
        <button type="button" title="Italique" aria-label="Italique" className="rte__b rte__b--txt"
          onMouseDown={(e) => e.preventDefault()} onClick={() => executer("italic")}><i>I</i></button>
        <button type="button" title="Souligné" aria-label="Souligné" className="rte__b rte__b--txt"
          onMouseDown={(e) => e.preventDefault()} onClick={() => executer("underline")}><u>S</u></button>
        <button type="button" title="Barré" aria-label="Barré" className="rte__b rte__b--txt"
          onMouseDown={(e) => e.preventDefault()} onClick={() => executer("strikeThrough")}><s>B</s></button>

        <span className="rte__sep" />

        <Bouton icone="puces" titre="Liste à puces" onClick={() => executer("insertUnorderedList")} />
        <Bouton icone="numeros" titre="Liste numérotée" onClick={() => executer("insertOrderedList")} />
        <Bouton icone="citation" titre="Citation" onClick={() => executer("formatBlock", "<blockquote>")} />

        <span className="rte__sep" />

        <Bouton icone="gauche" titre="Aligner à gauche" onClick={() => executer("justifyLeft")} />
        <Bouton icone="centre" titre="Centrer" onClick={() => executer("justifyCenter")} />
        <Bouton icone="droite" titre="Aligner à droite" onClick={() => executer("justifyRight")} />
        <Bouton icone="justifie" titre="Justifier" onClick={() => executer("justifyFull")} />

        <span className="rte__sep" />

        <Bouton icone="lien" titre="Insérer un lien" onClick={poserLien} />
        <Bouton icone="delier" titre="Retirer le lien" onClick={() => executer("unlink")} />
        <Bouton icone="image" titre="Insérer une image" onClick={() => { memoriser(); setPicker(true); }} />
        <Bouton icone="video" titre="Insérer une vidéo" onClick={insererVideo} />
        <Bouton icone="tableau" titre="Insérer un tableau" onClick={insererTableau} />
        <Bouton icone="graphique" titre="Insérer un graphique" onClick={ouvrirGraphique} />
        <Bouton icone="regle" titre="Séparateur" onClick={() => executer("insertHorizontalRule")} />

        <span className="rte__sep" />

        <span className="rte__palette-hote">
          <Bouton icone="couleur" titre="Couleur du texte" actif={palette === "texte"}
            onClick={() => { memoriser(); setPalette((p) => (p === "texte" ? null : "texte")); }} />
          {palette === "texte" && (
            <span className="rte__palette">
              {COULEURS_TEXTE.map((couleur) => (
                <button key={couleur} type="button" title={couleur} aria-label={`Couleur ${couleur}`}
                  className="rte__pastille" style={{ background: couleur }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => colorer("foreColor", couleur)} />
              ))}
            </span>
          )}
        </span>

        <span className="rte__palette-hote">
          <Bouton icone="surlignage" titre="Surlignage" actif={palette === "fond"}
            onClick={() => { memoriser(); setPalette((p) => (p === "fond" ? null : "fond")); }} />
          {palette === "fond" && (
            <span className="rte__palette">
              {COULEURS_FOND.map((couleur) => (
                <button key={couleur} type="button" title={couleur} aria-label={`Surlignage ${couleur}`}
                  className="rte__pastille" style={{ background: couleur }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => colorer("hiliteColor", couleur)} />
              ))}
              <button type="button" className="rte__pastille rte__pastille--vide" title="Retirer le surlignage"
                aria-label="Retirer le surlignage"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => colorer("hiliteColor", "transparent")}>✕</button>
            </span>
          )}
        </span>

        <span className="rte__sep" />

        <Bouton icone="gomme" titre="Effacer la mise en forme" onClick={() => executer("removeFormat")} />
        <Bouton icone="annuler" titre="Annuler" onClick={() => executer("undo")} />
        <Bouton icone="retablir" titre="Rétablir" onClick={() => executer("redo")} />

        <span className="rte__sep" />

        <Bouton icone="source" titre="Code HTML" actif={source} onClick={basculerSource} />
      </div>

      {/* Le champ réellement soumis : toujours du HTML assaini côté client, et
          assaini une seconde fois côté serveur avant écriture en base. */}
      <input type="hidden" name={name} value={html} readOnly />

      <div
        ref={editeurRef}
        className={`rte__zone${depot ? " is-depot" : ""}`}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-labelledby={labelId}
        data-placeholder={placeholder ?? "Rédigez l'article…"}
        hidden={source}
        dangerouslySetInnerHTML={{ __html: initial }}
        onInput={synchroniser}
        onBlur={() => { memoriser(); synchroniser(); }}
        onKeyUp={memoriser}
        onMouseUp={memoriser}
        onClick={surClicZone}
        onPaste={onPaste}
        onDragOver={(event) => { event.preventDefault(); setDepot(true); }}
        onDragLeave={() => setDepot(false)}
        onDrop={onDrop}
      />

      {source && (
        <textarea
          className="rte__source mono"
          value={html}
          spellCheck={false}
          aria-label="Code HTML de l'article"
          onChange={(event) => setHtml(event.target.value)}
        />
      )}

      <div className="rte__pied">
        <span>{mots} mot{mots > 1 ? "s" : ""} · {readingMinutes(html)} min de lecture</span>
        {message && <span className="rte__message" role="status">{message}</span>}
        <span className="adm-hint">
          Glissez une image dans la zone pour l'ajouter. Cliquez un graphique pour le modifier.
        </span>
      </div>

      <MediaPicker
        open={picker}
        assets={assets}
        onClose={() => setPicker(false)}
        onSelect={insererImage}
        titre="Insérer une image dans l'article"
      />

      <GraphiqueModal
        open={graphOuvert}
        valeur={graphValeur}
        onClose={() => { setGraphOuvert(false); graphCibleRef.current = null; }}
        onValider={validerGraphique}
      />
    </div>
  );
}
