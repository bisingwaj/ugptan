/* En-tête du site — partie serveur.

   L'en-tête est sur TOUTES les pages. Quand il était un composant client
   d'un seul tenant, il importait `@/content/i18n` (dictionnaire FR + EN
   complet) et `@/content/data` pour une poignée de libellés : les deux
   modules partaient dans le JavaScript commun du site, téléchargé et analysé
   à chaque première visite, sur des connexions souvent lentes. Ici, on
   choisit les libellés dans la langue courante ; seuls eux traversent la
   frontière vers la partie interactive (HeaderClient). Le rendu est inchangé. */
import type { Lang } from "@/lib/pick";
import { dict } from "@/content/i18n";
import { langues } from "@/content/data";
import { HeaderClient, type LibellesHeader } from "@/components/chrome/HeaderClient";

/* Libellés propres à l'en-tête, absents du dictionnaire : ils étaient écrits en
   dur, en français, et restaient en français sur le site anglais. */
const PROPRES = {
  fermer: { fr: "Fermer le menu", en: "Close menu" },
  aVenir: { fr: "À venir", en: "Coming soon" },
  langue: { fr: "Langue", en: "Language" },
} as const;

export function Header({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const libelles: LibellesHeader = {
    nav: t.nav,
    navSub: t.navSub,
    navDesc: t.navDesc,
    navigation: t.words.navigation,
    rechercheTitre: t.recherche.titre,
    rechercheAria: t.recherche.ariaLien,
    login: t.cta.login,
    loginHint: t.cta.loginHint,
    loginNote: t.cta.loginNote,
    mgp: t.cta.mgp,
    fermer: PROPRES.fermer[lang],
    aVenir: PROPRES.aVenir[lang],
    langue: PROPRES.langue[lang],
  };
  // Le message d'accueil de chaque langue ne sert pas à l'en-tête : on ne
  // transmet que le code et l'intitulé.
  const menu = langues.map(({ code, label }) => ({ code, label }));
  return <HeaderClient lang={lang} libelles={libelles} langues={menu} />;
}
