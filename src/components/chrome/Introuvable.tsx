"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dict } from "@/content/i18n";
import { NAV, route } from "@/lib/routes";
import { isLang, type Lang } from "@/lib/pick";

/**
 * Corps de l'écran « page introuvable » (cf. app/not-found.tsx).
 *
 * Client, pour une seule raison : une page `not-found` ne reçoit pas les
 * paramètres de route, et la langue ne peut donc se lire que sur l'URL — comme
 * dans `[lang]/error.tsx`. Le rendu servi est celui du français, la version
 * préretendue à la compilation n'ayant pas d'URL ; l'anglais prend le relais dès
 * l'hydratation. C'est acceptable ici, et seulement ici : cet écran n'est jamais
 * indexé, et il ne dit rien qu'il faille lire avant que la page ne vive.
 */
export function Introuvable() {
  const pathname = usePathname();
  const segment = pathname.split("/")[1] ?? "";
  const lang: Lang = isLang(segment) ? segment : "fr";
  const t = dict(lang).introuvable;

  /* Cet écran est rendu hors du layout de langue : le `<html>` qui l'enveloppe
     est celui que Next fabrique par défaut, et il ne porte aucun `lang`. Un
     lecteur d'écran prononcerait alors le texte avec la voix de la langue du
     système. On le pose donc ici, où la langue est connue. */
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  /* Quatre portes, pas une liste : l'accueil pour repartir de zéro, et les trois
     sections où aboutissent la plupart des liens périmés — un article retiré, un
     rapport remplacé, une demande qui n'a plus d'adresse. Elles remplacent
     l'en-tête et le pied de page, absents à ce niveau de l'arbre. */
  const sorties = [
    { href: route(lang, NAV.accueil), label: t.accueil },
    { href: route(lang, NAV.actualites), label: t.actus },
    { href: route(lang, NAV.transparence), label: t.docs },
    { href: route(lang, NAV.contact), label: t.contact },
  ];

  return (
    <section className="section">
      <div className="section__inner max-w-[62ch]">
        <div className="mono text-[11px] text-ac">{t.code}</div>
        <h1 className="h2 mt-3">{t.titre}</h1>
        <p className="lead mt-5">{t.corps}</p>
        <p className="mt-8 text-[14px] text-c-60">{t.pistes}</p>
        <div className="stack-sm mt-4 flex flex-wrap gap-2.5">
          {sorties.map((sortie, rang) => (
            <Link
              key={sortie.href}
              href={sortie.href}
              className={rang === 0 ? "btn btn--primary" : "btn btn--ghost"}
            >
              {sortie.label}
              {rang === 0 && <span className="arrow">→</span>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
