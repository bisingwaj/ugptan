"use client";
/* Avis de première visite — bandeau bas de page.

   Ce n'est pas un consentement : la soumission au Code du numérique découle de
   la loi, pas d'un clic. Le bouton acquitte la lecture, et l'acquittement est
   mémorisé dans le navigateur pour ne pas réafficher l'avis à chaque page.
   Rien n'est transmis au serveur, rien n'est bloqué tant que l'avis est ouvert. */
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
            <span className="avis__liens">
              <Link href={route(lang, NAV.conditions)} className="avis__lien">
                {t.nav.conditions}
              </Link>
              <Link href={route(lang, NAV.confidentialite)} className="avis__lien">
                {t.nav.confidentialite}
              </Link>
            </span>
          </div>
        </m.aside>
      )}
    </AnimatePresence>
  );
}
