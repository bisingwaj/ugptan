/**
 * Adresses des pages province (`/[lang]/project/provinces/[province]`).
 *
 * Le segment est dérivé du nom par `slugify` — « Kasaï Oriental » →
 * « kasai-oriental », « Équateur » → « equateur » — plutôt que stocké : la
 * table des provinces est figée (26 entrées, cf. content/data.ts) et le nom y
 * fait déjà foi. Sous « Le Projet » à dessein : couper la page Projet en
 * console coupe aussi ses provinces (cf. `navKeysPourChemin`).
 */
import type { Lang } from "@/lib/pick";
import type { Province } from "@/content/types";
import { provinces } from "@/content/data";
import { slugify } from "@/lib/actus/slug";
import { NAV, route } from "@/lib/routes";

export const CHEMIN_PROVINCES = NAV.provinces;

export const slugProvince = (nom: string) => slugify(nom);

export const provinceRoute = (lang: Lang, nom: string) =>
  route(lang, `${CHEMIN_PROVINCES}/${slugProvince(nom)}`);

export const slugsProvinces = (): string[] => provinces.map((p) => slugProvince(p.nom));

export function provinceParSlug(slug: string): Province | undefined {
  return provinces.find((p) => slugProvince(p.nom) === slug);
}
