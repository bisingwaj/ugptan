/**
 * Fabrication des segments d'URL des articles et des taxonomies.
 *
 * Un slug entre dans l'URL publique et dans l'unicité en base : il est donc
 * réduit à l'ASCII minuscule, sans accent ni ponctuation. Aucun import, le
 * module servant aussi à l'aperçu en direct dans le formulaire de la console.
 */

/** Longueur retenue : au-delà, l'URL cesse d'être lisible et le gain SEO est nul. */
const MAX_LENGTH = 90;

/**
 * « L'Unité de Gestion — validée ! » → « l-unite-de-gestion-validee ».
 *
 * La décomposition NFD isole les diacritiques pour les retirer : sans elle,
 * « é » sortirait de la classe `[a-z0-9]` et deviendrait un tiret, ce qui
 * couperait les mots en deux.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`]/g, " ")
    .replace(/[œ]/gi, "oe")
    .replace(/[æ]/gi, "ae")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_LENGTH)
    .replace(/-+$/g, "");
}

/**
 * Segments réservés sous `/news/`.
 *
 * `preview` porte la route de prévisualisation
 * (`src/app/[lang]/news/preview/page.tsx`) : un segment statique l'emporte
 * sur `[slug]` dans l'App Router, un article ainsi nommé deviendrait donc
 * inatteignable. On écarte le nom à la source plutôt que de laisser découvrir
 * la collision en production.
 */
const RESERVES = ["preview"];

/**
 * Rend un slug unique en lui ajoutant un suffixe numérique.
 * `taken` contient les slugs déjà pris DANS LA MÊME LANGUE (l'unicité est
 * portée par `@@unique([locale, slug])`).
 */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set([...taken, ...RESERVES]);
  const root = base || "article";
  if (!used.has(root)) return root;

  for (let n = 2; n < 500; n += 1) {
    const candidate = `${root}-${n}`;
    if (!used.has(candidate)) return candidate;
  }

  // Filet : au-delà de 500 homonymes, on tranche par l'horodatage.
  return `${root}-${Date.now().toString(36)}`;
}
