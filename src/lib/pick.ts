/* Bilingual content primitives — the project ships FR/EN; 6 languages are planned. */

export type Lang = "fr" | "en";

export type Bilingual = { fr: string; en: string };

/** Some MEP fields are plain strings (e.g. "MPTN"), others are {fr,en}. */
export type Localizable = string | Bilingual | null | undefined;

export const LANGS: Lang[] = ["fr", "en"];

export const isLang = (value: string): value is Lang => value === "fr" || value === "en";

export const otherLang = (lang: Lang): Lang => (lang === "fr" ? "en" : "fr");

/** Resolve a localizable value to a string for the active language. */
export function pick(value: Localizable, lang: Lang): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.fr ?? value.en ?? "";
}
