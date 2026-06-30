import type { Lang } from "./pick";

export const LOCALES: Lang[] = ["fr", "en"];

/** Normalise an incoming route param to a supported language. */
export const asLang = (value: string): Lang => (value === "en" ? "en" : "fr");

export type LangParams = { params: { lang: string } };
