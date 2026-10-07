import { dict } from "@/content/i18n";
import { IntrouvableCorps } from "@/components/chrome/IntrouvableCorps";

/**
 * Écran « page introuvable » (cf. app/not-found.tsx) — partie serveur.
 *
 * L'écran introuvable est monté à la racine : son code client accompagne donc
 * TOUTES les pages du site, pas seulement les 404. Quand il importait
 * `@/content/i18n` côté client, le dictionnaire complet (FR + EN) partait avec
 * lui dans le JavaScript de chaque page. On ne transmet plus que ses neuf
 * libellés, dans les deux langues, puisque la langue ne se lit que sur l'URL,
 * côté client (cf. IntrouvableCorps).
 */
export function Introuvable() {
  return <IntrouvableCorps libelles={{ fr: dict("fr").introuvable, en: dict("en").introuvable }} />;
}
