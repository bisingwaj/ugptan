"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * Barre de progression de navigation, en haut de l'écran.
 *
 * Les pages du site lisent la base au rendu : entre le clic et l'arrivée du
 * contenu, le navigateur reste sur la page précédente sans rien signaler, et
 * l'attente passe pour un site figé. Cette barre occupe cet intervalle.
 *
 * L'App Router n'expose aucun événement de routeur : le départ se déduit donc
 * du clic sur un lien interne (et de `popstate` pour les boutons précédent /
 * suivant), l'arrivée du changement de `pathname` ou de `searchParams`.
 *
 * Elle ne prétend jamais connaître l'avancement réel : la progression ralentit
 * en approchant d'un plafond et n'atteint 100 % qu'une fois la page arrivée.
 */

/** Une navigation servie depuis le cache ne doit pas provoquer un clignotement. */
const DELAI_AVANT_AFFICHAGE = 140;
/** Cadence des paliers. Assez lente pour rester lisible en mouvement réduit,
 *  où la feuille globale neutralise toutes les transitions CSS. */
const PAS_MS = 160;
/** Plafond tant que la page n'est pas là : la barre ne promet pas la fin. */
const PLAFOND = 92;
/** Garde-fou : une navigation avortée ne doit pas laisser la barre à l'écran. */
const DUREE_MAX = 20_000;
/** Temps d'affichage du 100 % avant effacement. */
const FONDU = 260;

function BarreDeNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [valeur, setValeur] = useState(0);
  const [visible, setVisible] = useState(false);

  const minuteurs = useRef<number[]>([]);
  const intervalle = useRef<number | null>(null);
  const enCours = useRef(false);
  const premierRendu = useRef(true);

  const nettoyer = useCallback(() => {
    minuteurs.current.forEach(clearTimeout);
    minuteurs.current = [];
    if (intervalle.current !== null) {
      clearInterval(intervalle.current);
      intervalle.current = null;
    }
  }, []);

  const terminer = useCallback(() => {
    if (!enCours.current) return;
    enCours.current = false;
    nettoyer();
    setValeur(100);
    minuteurs.current.push(
      window.setTimeout(() => {
        setVisible(false);
        // Remise à zéro après l'effacement, sinon la barre se rétracte à vue.
        minuteurs.current.push(window.setTimeout(() => setValeur(0), 220));
      }, FONDU),
    );
  }, [nettoyer]);

  const demarrer = useCallback(() => {
    if (enCours.current) return;
    enCours.current = true;
    nettoyer();
    setValeur(0);

    minuteurs.current.push(
      window.setTimeout(() => {
        setVisible(true);
        setValeur(18);
        intervalle.current = window.setInterval(() => {
          // Pas décroissant : l'approche du plafond ralentit, ce qui rend
          // l'attente lisible sans jamais annoncer une fin qu'on ignore.
          setValeur((v) =>
            v >= PLAFOND ? v : v + Math.max(0.6, (PLAFOND - v) / 9),
          );
        }, PAS_MS);
      }, DELAI_AVANT_AFFICHAGE),
    );

    minuteurs.current.push(window.setTimeout(terminer, DUREE_MAX));
  }, [nettoyer, terminer]);

  /* Départ : clic sur un lien interne, ou navigation par l'historique. */
  useEffect(() => {
    const surClic = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const lien = (event.target as Element | null)?.closest?.("a");
      if (!(lien instanceof HTMLAnchorElement) || lien.hasAttribute("download"))
        return;
      if (lien.target && lien.target !== "_self") return;

      const cible = new URL(lien.href, window.location.href);
      if (cible.origin !== window.location.origin) return;
      // Ancre dans la page ou lien vers l'URL courante : aucun rendu à attendre.
      if (
        cible.pathname === window.location.pathname &&
        cible.search === window.location.search
      )
        return;

      demarrer();
    };

    document.addEventListener("click", surClic, true);
    window.addEventListener("popstate", demarrer);
    return () => {
      document.removeEventListener("click", surClic, true);
      window.removeEventListener("popstate", demarrer);
    };
  }, [demarrer]);

  /* Arrivée : la nouvelle URL est rendue. */
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    terminer();
  }, [pathname, searchParams, terminer]);

  useEffect(() => nettoyer, [nettoyer]);

  return (
    // Rail : bande fixe de 3 px sur toute la largeur, calée sous la zone sûre
    // pour rester visible derrière une encoche (viewport-fit: cover est actif).
    // Sa géométrie ne dépend d'aucun état ; seul le remplissage varie.
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-(--sa-t) z-[500] h-[3px]">
      {/* Remplissage : mis à l'échelle horizontalement depuis la gauche.
          `scaleX` plutôt qu'une largeur en pourcentage — la transformation ne
          déclenche aucun calcul de mise en page à chaque palier. */}
      <div
        className={cn(
          "h-full w-full origin-left bg-ac",
          "transition-[transform,opacity] duration-200 ease-out",
          visible ? "opacity-100" : "opacity-0",
        )}
        // Exception assumée au tout-Tailwind : facteur d'échelle continu,
        // calculé à l'exécution, qu'aucune classe statique ne peut porter.
        style={{ transform: `scaleX(${valeur / 100})` }}
      />
    </div>
  );
}

/** `useSearchParams` impose une frontière Suspense, sans quoi les 64 pages du
 *  site basculeraient en rendu dynamique. */
export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <BarreDeNavigation />
    </Suspense>
  );
}
