"use server";

/**
 * Catégories et étiquettes des actualités.
 *
 * Séparé de `admin-actualites.ts` : ce sont des référentiels, pas du contenu.
 * Ils changent rarement, se partagent entre tous les articles, et leur
 * suppression a des effets à distance — d'où les garde-fous ci-dessous.
 *
 * ⚠️ Même invariant que le reste du module : `assertPermission("actualites")`
 * en tête de chaque action.
 */
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { adminPath } from "@/lib/admin";
import { assertPermission } from "@/lib/auth/guard";
import { slugify } from "@/lib/actus/slug";
import { revaliderActualites } from "@/lib/actus/cache";
import type { ActuFormState } from "@/actions/admin-actualites";

const CATEGORIES_PATH = adminPath("/actualites/categories");
const ETIQUETTES_PATH = adminPath("/actualites/etiquettes");

const texte = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();

/** Code Prisma d'une violation de contrainte d'unicité. */
const UNIQUE_VIOLATION = "P2002";

const estDoublon = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: string }).code === UNIQUE_VIOLATION;

/** Couleur d'accent : hexadécimal à 6 chiffres, ou rien. */
function lireCouleur(value: string): string | null {
  const couleur = value.trim().toLowerCase();
  if (!couleur) return null;
  return /^#[0-9a-f]{6}$/.test(couleur) ? couleur : null;
}

/**
 * Libellés des deux langues.
 * L'anglais retombe sur le français plutôt que de rester vide : une catégorie
 * sans libellé anglais afficherait un filtre muet sur la version anglaise.
 */
function lireLibelles(formData: FormData): { nomFr: string; nomEn: string } | null {
  const nomFr = texte(formData, "nomFr");
  if (!nomFr) return null;
  return { nomFr, nomEn: texte(formData, "nomEn") || nomFr };
}

/* -------------------------------------------------------------------------- */
/* Catégories                                                                  */
/* -------------------------------------------------------------------------- */

export async function enregistrerCategorieAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  await assertPermission("actualites");

  const id = texte(formData, "id");
  const libelles = lireLibelles(formData);
  if (!libelles) return { error: "Le libellé français est obligatoire.", ok: null };

  const slug = slugify(texte(formData, "slug") || libelles.nomFr);
  if (!slug) return { error: "Le libellé ne produit aucun identifiant d'URL exploitable.", ok: null };

  const position = Number.parseInt(texte(formData, "position"), 10);
  const donnees = {
    ...libelles,
    slug,
    color: lireCouleur(texte(formData, "color")),
    position: Number.isFinite(position) ? position : 0,
  };

  try {
    if (id) await db().articleCategory.update({ where: { id }, data: donnees });
    else await db().articleCategory.create({ data: donnees });
  } catch (error) {
    if (estDoublon(error)) return { error: "Cet identifiant d'URL est déjà pris par une autre catégorie.", ok: null };
    throw error;
  }

  revalidatePath(CATEGORIES_PATH);
  revaliderActualites();
  return { error: null, ok: id ? "Catégorie mise à jour." : `Catégorie « ${libelles.nomFr} » créée.` };
}

/**
 * Suppression d'une catégorie.
 *
 * Les articles ne sont PAS supprimés : leur rattachement passe à `null`
 * (`onDelete: SetNull` au schéma). On l'annonce plutôt que de le laisser
 * découvrir — un communiqué qui perd sa pastille sans explication ressemble à
 * une perte de données.
 */
export async function supprimerCategorieAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  await assertPermission("actualites");

  const id = texte(formData, "id");
  if (!id) return { error: "Catégorie introuvable.", ok: null };

  const categorie = await db().articleCategory.findUnique({
    where: { id },
    select: { nomFr: true, _count: { select: { articles: true } } },
  });
  if (!categorie) return { error: "Catégorie introuvable.", ok: null };

  await db().articleCategory.delete({ where: { id } });

  revalidatePath(CATEGORIES_PATH);
  revaliderActualites();

  const orphelins = categorie._count.articles;
  return {
    error: null,
    ok: orphelins > 0
      ? `Catégorie « ${categorie.nomFr} » supprimée. ${orphelins} article(s) sont désormais sans catégorie.`
      : `Catégorie « ${categorie.nomFr} » supprimée.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Étiquettes                                                                  */
/* -------------------------------------------------------------------------- */

export async function enregistrerTagAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  await assertPermission("actualites");

  const id = texte(formData, "id");
  const libelles = lireLibelles(formData);
  if (!libelles) return { error: "Le libellé français est obligatoire.", ok: null };

  const slug = slugify(texte(formData, "slug") || libelles.nomFr);
  if (!slug) return { error: "Le libellé ne produit aucun identifiant d'URL exploitable.", ok: null };

  try {
    if (id) await db().tag.update({ where: { id }, data: { ...libelles, slug } });
    else await db().tag.create({ data: { ...libelles, slug } });
  } catch (error) {
    if (estDoublon(error)) return { error: "Cet identifiant d'URL est déjà pris par une autre étiquette.", ok: null };
    throw error;
  }

  revalidatePath(ETIQUETTES_PATH);
  revaliderActualites();
  return { error: null, ok: id ? "Étiquette mise à jour." : `Étiquette « ${libelles.nomFr} » créée.` };
}

export async function supprimerTagAction(
  _prev: ActuFormState,
  formData: FormData,
): Promise<ActuFormState> {
  await assertPermission("actualites");

  const id = texte(formData, "id");
  if (!id) return { error: "Étiquette introuvable.", ok: null };

  const tag = await db().tag.findUnique({ where: { id }, select: { nomFr: true } });
  if (!tag) return { error: "Étiquette introuvable.", ok: null };

  // Les rattachements aux articles tombent en cascade (cf. schéma) ; le contenu
  // des articles n'est pas touché.
  await db().tag.delete({ where: { id } });

  revalidatePath(ETIQUETTES_PATH);
  revaliderActualites();
  return { error: null, ok: `Étiquette « ${tag.nomFr} » supprimée.` };
}
