import type { Lang } from "./pick";

export const LOCALES: Lang[] = ["fr", "en"];

/** Normalise an incoming route param to a supported language. */
export const asLang = (value: string): Lang => (value === "en" ? "en" : "fr");

/**
 * Vrai si le segment EST une langue servie, sans repli.
 *
 * `asLang` ramène n'importe quoi à « fr » : c'est ce qu'on veut d'un lecteur de
 * paramètre, pas d'un contrôle d'accès. Pour décider si une URL existe, il faut
 * la question stricte — cf. le garde de `app/[lang]/layout.tsx`.
 */
export const estLocale = (value: string): value is Lang => (LOCALES as string[]).includes(value);

export type LangParams = { params: { lang: string } };
