"use client";
/* Compteur — un chiffre clé qui défile jusqu'à sa valeur quand il entre à
   l'écran.
   - SSR-safe : le HTML porte la valeur FINALE (indexée, lisible sans JS). À
     l'hydratation, un chiffre encore hors de l'écran repasse à zéro, puis
     défile quand il entre ; un chiffre déjà visible ne bouge pas.
   - Lecteurs d'écran : la valeur finale est annoncée (`aria-label`), jamais
     les étapes intermédiaires.
   - Reduced-motion : valeur finale directe.
   - Largeur stable : chiffres tabulaires, pour que le texte ne tremble pas. */
import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE, MARGE_APPARITION } from "./variants";
import { usePrefersReducedMotion } from "./useReducedMotion";

export function Compteur({
  valeur,
  locale = "fr-FR",
  options,
  prefixe = "",
  suffixe = "",
  duree = 1.4,
  heros = false,
}: {
  valeur: number;
  /** Locale de formatage (« fr-FR », « en-GB »). */
  locale?: string;
  options?: Intl.NumberFormatOptions;
  prefixe?: string;
  suffixe?: string;
  /** Durée du décompte, en secondes. */
  duree?: number;
  /** Chiffre d'un héros : il défile dès l'arrivée sur la page, même déjà
   *  visible — c'est la première chose qu'on voit bouger. */
  heros?: boolean;
}) {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: MARGE_APPARITION });
  const format = new Intl.NumberFormat(locale, options);
  const final = `${prefixe}${format.format(valeur)}${suffixe}`;
  const [texte, setTexte] = useState(final);
  /** Armé seulement si le chiffre était HORS de l'écran à l'hydratation : un
   *  chiffre déjà lu ne repart pas de zéro sous les yeux du lecteur. */
  const arme = useRef(false);
  const parti = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (reduce !== false || !el) return;
    const haut = el.getBoundingClientRect().top;
    if (heros || haut > window.innerHeight * 0.9 || haut < 0) {
      arme.current = true;
      setTexte(`${prefixe}${format.format(0)}${suffixe}`);
    }
    // Une seule fois, à l'hydratation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  useEffect(() => {
    if (reduce || !inView || !arme.current || parti.current) return;
    parti.current = true;
    // Les décimales affichées suivent celles de la valeur finale.
    const decimales = options?.maximumFractionDigits ?? (Number.isInteger(valeur) ? 0 : 1);
    const controle = animate(0, valeur, {
      duration: duree,
      ease: EASE,
      onUpdate: (v) => {
        const arrondi = decimales === 0 ? Math.round(v) : Number(v.toFixed(decimales));
        setTexte(`${prefixe}${format.format(arrondi)}${suffixe}`);
      },
      onComplete: () => setTexte(final),
    });
    return () => controle.stop();
    // `format` et `final` dérivent des props listées.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, valeur, duree, prefixe, suffixe, locale]);

  return (
    <span ref={ref} aria-label={final} style={{ fontVariantNumeric: "tabular-nums" }}>
      <span aria-hidden>{texte}</span>
    </span>
  );
}
