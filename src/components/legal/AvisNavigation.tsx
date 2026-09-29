"use client";
/* Avis d'utilisation — bandeau bas de page, première visite.

   Deux régimes distincts, que l'avis ne doit pas confondre. Le Code du
   numérique s'applique du seul fait de l'accès : aucun clic ne le déclenche ni
   ne l'écarte. Les conditions d'utilisation, elles, s'acceptent, et l'article
   « Objet et acceptation » dit que cette acceptation résulte de l'accès. Le
   bouton ne crée donc pas l'acceptation, il la constate et la date côté
   visiteur, pour ne pas reposer la question à chaque page.

   L'acquittement est mémorisé dans le navigateur. Rien n'est transmis au
   serveur, rien n'est bloqué tant que l'avis est ouvert.

   Le refus n'est pas une variante de la fermeture : qui n'accepte pas les
   conditions n'a pas à rester sur le site, et les conditions elles-mêmes
   organisent la voie de repli (communication des documents sur demande
   écrite). Le bouton efface donc l'acquittement éventuel et quitte la page,
   sans rien enregistrer. */
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { Lang } from "@/lib/pick";
import { pick } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { avisNavigation } from "@/content/legal";
import { NAV, route } from "@/lib/routes";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

/** Version incluse dans la clé : une révision des conditions réaffiche l'avis. */
const CLE = "ugptn.avis-code-numerique.2026-08";

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

export function AvisNavigation({ lang }: { lang: Lang }) {
  const t = dict(lang);
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
    // Laisse la page se poser avant d'interrompre la lecture.
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

  useEffect(() => {
    if (!ouvert) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") acquitter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ouvert, acquitter]);

  return (
    <AnimatePresence>
      {ouvert && (
        <m.aside
          className="avis"
          role="dialog"
          aria-modal={false}
          aria-labelledby="avis-titre"
          aria-describedby="avis-corps"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: reduce ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="avis__kicker mono">{pick(avisNavigation.kicker, lang)}</div>

          <h2 id="avis-titre" className="avis__titre">
            {pick(avisNavigation.titre, lang)}
          </h2>

          <p id="avis-corps" className="avis__corps">
            {pick(avisNavigation.corps, lang)}
          </p>

          <p className="avis__precision">{pick(avisNavigation.precision, lang)}</p>

          <div className="avis__actions">
            <button type="button" className="avis__btn" onClick={acquitter}>
              {pick(avisNavigation.accepter, lang)}
            </button>
            <button
              type="button"
              className="avis__btn avis__btn--refus"
              onClick={refuser}
              aria-describedby="avis-refus-aide"
            >
              {pick(avisNavigation.refuser, lang)}
            </button>
            <span className="avis__liens">
              <Link href={route(lang, NAV.conditions)} className="avis__lien">
                {t.nav.conditions}
              </Link>
              <Link href={route(lang, NAV.confidentialite)} className="avis__lien">
                {t.nav.confidentialite}
              </Link>
            </span>
          </div>

          <p id="avis-refus-aide" className="avis__aide">
            {pick(avisNavigation.refuserAide, lang)}
          </p>
        </m.aside>
      )}
    </AnimatePresence>
  );
}
