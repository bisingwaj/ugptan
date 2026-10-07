"use client";
/* Piège de focus d'une fenêtre modale ou d'un tiroir — le comportement de la
   modale vidéo (cf. video/VideoProvider.tsx), mis en commun.

   Tant que `actif` est vrai :
   - le focus entre dans le conteneur (sur `initial`, sinon le premier élément
     focalisable, sinon le conteneur lui-même) ;
   - Tab et Maj+Tab tournent à l'intérieur sans jamais repartir dans la page
     masquée derrière ;
   - Échap appelle `fermer`, s'il est fourni.
   À la désactivation, le focus revient à l'élément qui l'avait à l'ouverture
   (le bouton déclencheur, en général).

   Une seconde modale ouverte par-dessus garde la main sur le clavier tant
   qu'elle a le focus.

   Les éléments masqués (`hidden`, `display: none`, désactivés) sont ignorés :
   un onglet replié ne doit pas devenir une étape invisible du cycle. */
import { useEffect, useRef, type RefObject } from "react";

const FOCALISABLES = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "video[controls]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function cibles(conteneur: HTMLElement): HTMLElement[] {
  return [...conteneur.querySelectorAll<HTMLElement>(FOCALISABLES)].filter(
    (el) => !el.closest("[hidden]") && el.getClientRects().length > 0,
  );
}

export function usePiegeFocus(
  conteneur: RefObject<HTMLElement | null>,
  actif: boolean,
  options: { fermer?: () => void; initial?: RefObject<HTMLElement | null> } = {},
) {
  // Les rappels changent à chaque rendu ; le piège, lui, ne doit se réarmer
  // qu'à l'ouverture.
  const fermer = useRef(options.fermer);
  const initial = useRef(options.initial);
  useEffect(() => {
    fermer.current = options.fermer;
    initial.current = options.initial;
  });

  useEffect(() => {
    if (!actif) return;
    const racine = conteneur.current;
    if (!racine) return;
    const restaurer = document.activeElement as HTMLElement | null;

    // Après le rendu de la fenêtre (animations d'entrée comprises).
    const minuteur = window.setTimeout(() => {
      if (racine.contains(document.activeElement)) return;
      const cible = initial.current?.current ?? cibles(racine)[0];
      if (cible) cible.focus();
      else {
        if (!racine.hasAttribute("tabindex")) racine.setAttribute("tabindex", "-1");
        racine.focus();
      }
    }, 30);

    const surTouche = (e: KeyboardEvent) => {
      // Une autre modale ouverte PAR-DESSUS (la vidéo depuis le tiroir des
      // marchés, par exemple) gère seule le clavier tant qu'elle a le focus.
      const autre = (document.activeElement as HTMLElement | null)?.closest('[aria-modal="true"]');
      if (autre && !racine.contains(autre)) return;
      if (e.key === "Escape" && fermer.current) {
        e.preventDefault();
        fermer.current();
        return;
      }
      if (e.key !== "Tab") return;
      const liste = cibles(racine);
      if (liste.length === 0) {
        e.preventDefault();
        return;
      }
      const premier = liste[0];
      const dernier = liste[liste.length - 1];
      const ici = document.activeElement;
      if (e.shiftKey && (ici === premier || !racine.contains(ici))) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && (ici === dernier || !racine.contains(ici))) {
        e.preventDefault();
        premier.focus();
      }
    };

    document.addEventListener("keydown", surTouche);
    return () => {
      window.clearTimeout(minuteur);
      document.removeEventListener("keydown", surTouche);
      if (restaurer && document.contains(restaurer)) restaurer.focus();
    };
  }, [actif, conteneur]);
}
