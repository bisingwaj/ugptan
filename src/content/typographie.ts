/* ============================================================================
   Typographie d'affichage : petites corrections appliquées au rendu, là où le
   texte vient de sources qui ne les garantissent pas (dictionnaire, console,
   contenu d'origine).
   ========================================================================== */
import type { Lang } from "@/lib/pick";

/**
 * Espaces insécables du français : avant « ? ! : ; » » et après « « ».
 *
 * Saisis avec une espace ordinaire, ces signes tombaient seuls en début de
 * ligne dès que le titre passait à la ligne (« …l'exécution du projet » puis
 * « ? » isolé dessous). Seule l'espace ordinaire (U+0020) est remplacée : un
 * texte déjà correct reste intact, et un signe collé au mot (adresse, heure,
 * « https: ») n'est jamais touché.
 */
export function insecables(texte: string): string {
  return texte.replace(/ +([?!:;»])/g, " $1").replace(/« +/g, "« ");
}

/**
 * Encadre une citation des guillemets de la langue affichée.
 *
 * Français : « » avec espaces insécables, faute de quoi le guillemet fermant
 * tombe seul en début de ligne sur un écran étroit. Anglais : “ ” sans espace,
 * les chevrons français n'ayant pas cours dans un texte anglais.
 *
 * Les guillemets sont posés par le dessin et non saisis dans le texte : la
 * rédaction entre la phrase seule, dans les deux langues.
 */
export function entreGuillemets(texte: string, lang: Lang): string {
  return lang === "en" ? `“${texte}”` : `« ${insecables(texte)} »`;
}

/**
 * Espaces multiples ramenées à une seule, extrémités retirées.
 *
 * Pour les noms propres saisis à la console (« Jacques NKIOSILI  ENKAN ») :
 * la double espace se voyait à l'écran et se lisait comme une pause.
 */
export function espacesSimples(texte: string): string {
  return texte.replace(/\s+/g, " ").trim();
}
