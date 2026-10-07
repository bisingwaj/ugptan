"use client";
/* Avis d'utilisation — bandeau bas de page (partie client).

   Ne reçoit que des chaînes déjà choisies dans la langue courante (cf.
   AvisNavigation.tsx) : aucun dictionnaire n'est importé ici.

   Un BANDEAU, pas une boîte de dialogue. L'avis n'interrompt rien et ne
   conditionne rien : c'est une région de la page (`<section aria-label>`),
   sans `role="dialog"`, sans `aria-modal`, sans piège de focus, et il ne prend
   jamais le focus à son apparition. Qui navigue au clavier le trouve à la fin
   du parcours de tabulation, après le pied de page, et peut continuer à lire
   sans s'en occuper. Échap ne l'acquitte plus : la touche sert à refermer les
   menus et le tiroir, et un acquittement ne doit pas tomber par accident.

   L'acquittement est mémorisé dans le navigateur, sous la même clé
   qu'auparavant : qui l'a déjà donné ne revoit pas l'avis. Rien n'est transmis
   au serveur, rien n'est bloqué tant que l'avis est ouvert.

   Le refus n'est pas une variante de la fermeture : qui n'accepte pas les
   conditions n'a pas à rester sur le site, et les conditions elles-mêmes
   organisent la voie de repli (communication des documents sur demande
   écrite). Le bouton efface donc l'acquittement éventuel et quitte la page,
   sans rien enregistrer. Il passe au second rang visuel (lien discret) ; son
   explication reste annoncée aux lecteurs d'écran. */
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { DUREE, EASE } from "@/components/motion/variants";

/** Version incluse dans la clé : une révision des conditions réaffiche l'avis. */
const CLE = "ugptn.avis-code-numerique.2026-08";

export type LibellesAvis = {
  /** Nom de la région, annoncé par les lecteurs d'écran (« Avis d'utilisation »). */
  region: string;
  /** Phrase de l'avis, coupée autour du lien vers les conditions. */
  avant: string;
  lien: string;
  apres: string;
  compris: string;
  refuser: string;
  refuserAide: string;
};

/* Où reprendre la navigation quand on refuse. Revenir d'où l'on vient est plus
   utile qu'une page vide, mais le référent n'existe pas toujours (accès direct,
   référent masqué) et il peut désigner le site lui-même : dans ces deux cas,
   une page vierge est la seule sortie honnête. */
function sortie() {
  try {
    const provenance = document.referrer;
    if (provenance && new URL(provenance).origin !== window.location.origin) {
      return provenance;
    }
  } catch {
    /* référent illisible : on retombe sur la page vierge. */
  }
  return "about:blank";
}

export function AvisBandeau({ libelles, hrefConditions }: { libelles: LibellesAvis; hrefConditions: string }) {
  const reduce = usePrefersReducedMotion();
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    let lu = false;
    try {
      lu = window.localStorage.getItem(CLE) === "1";
    } catch {
      /* stockage indisponible (navigation privée stricte) : on affiche l'avis. */
    }
    if (lu) return;
    // Laisse la page se poser avant d'afficher l'avis.
    const id = window.setTimeout(() => setOuvert(true), 1100);
    return () => window.clearTimeout(id);
  }, []);

  /* Refuser : aucun acquittement conservé, et on quitte. `window.close()` n'est
     honoré que si l'onglet a été ouvert par un script ; sinon on REMPLACE
     l'entrée d'historique, pour que le bouton « précédent » ne ramène pas sur
     le site que l'on vient de refuser. */
  const refuser = useCallback(() => {
    setOuvert(false);
    try {
      window.localStorage.removeItem(CLE);
    } catch {
      /* stockage indisponible : il n'y avait de toute façon rien à effacer. */
    }
    const destination = sortie();
    window.close();
    window.setTimeout(() => window.location.replace(destination), 150);
  }, []);

  const acquitter = useCallback(() => {
    setOuvert(false);
    try {
      window.localStorage.setItem(CLE, "1");
    } catch {
      /* sans stockage, l'avis réapparaîtra à la prochaine visite : acceptable. */
    }
  }, []);

  return (
    <AnimatePresence>
      {ouvert && (
        /* Surface sombre et filet d'accent en tête, comme l'ancien encart : le
           bandeau se détache des pages, qui sont claires. Les marges suivent le
           gabarit du site et la zone sûre (encoche, barre d'accueil iOS). */
        <m.section
          data-avis=""
          aria-label={libelles.region}
          className="fixed inset-x-0 bottom-0 z-[90] border-t-[3px] border-ac bg-c-black text-c-30 shadow-[0_-14px_40px_rgba(0,0,0,0.3)]"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: reduce ? DUREE.rapide : DUREE.moyenne, ease: EASE }}
        >
          <div className="mx-auto flex max-w-(--maxw) flex-wrap items-center gap-x-8 gap-y-3 pt-3.5 pr-[max(var(--pad-x),var(--sa-r))] pb-[calc(14px+var(--sa-b))] pl-[max(var(--pad-x),var(--sa-l))]">
            <p className="m-0 min-w-0 flex-[1_1_420px] text-[13px] leading-[1.55] max-[560px]:text-[12.5px]">
              {/* Surtitre visible sur grand écran seulement : sur téléphone,
                  chaque ligne compte, et le nom de la région est de toute
                  façon annoncé par `aria-label`. */}
              <span aria-hidden className="mr-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ac-light max-[760px]:hidden">
                {libelles.region}
              </span>
              {libelles.avant}
              <Link
                href={hrefConditions}
                className="border-b border-c-50 text-white transition-colors duration-200 hover:border-ac-light"
              >
                {libelles.lien}
              </Link>
              {libelles.apres}
            </p>

            <div className="flex flex-none items-center gap-5 max-[560px]:w-full max-[560px]:justify-between">
              <button
                type="button"
                onClick={refuser}
                aria-describedby="avis-refus-aide"
                className="min-h-11 text-[12.5px] text-c-40 underline decoration-c-70 underline-offset-4 transition-colors duration-200 hover:text-white"
              >
                {libelles.refuser}
              </button>
              <span id="avis-refus-aide" className="sr-only">{libelles.refuserAide}</span>
              {/* Action principale : 44 px de haut, plancher tactile. */}
              <button
                type="button"
                onClick={acquitter}
                className="min-h-11 border border-ac bg-ac px-5 text-[14px] font-medium text-white transition-colors duration-200 hover:border-acd hover:bg-acd"
              >
                {libelles.compris}
              </button>
            </div>
          </div>
        </m.section>
      )}
    </AnimatePresence>
  );
}
