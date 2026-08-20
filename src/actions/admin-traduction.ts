"use server";

/**
 * Ce qu'un rédacteur peut faire d'une traduction assistée.
 *
 * Trois gestes, et rien de plus : la relancer, la valider sans y toucher, ou la
 * demander pour un contenu que l'assistance n'a jamais vu (un article
 * antérieur à sa mise en service).
 *
 * ⚠️ INVARIANT : chaque action commence par résoudre l'entité dans le registre,
 * puis exige la permission du module dont elle relève. L'entité n'étant désignée
 * que par un couple (`entite`, `entiteId`) venu du formulaire, c'est le registre
 * — et lui seul — qui dit quel droit s'applique. Sans cette résolution, une clé
 * forgée ouvrirait n'importe quel module.
 *
 * ─── Relance : en direct, pas en tâche de fond ───────────────────────────────
 *
 * Contrairement au déclenchement automatique, la relance ATTEND. C'est un geste
 * explicite : la personne a cliqué, elle regarde l'écran, et lui rendre la main
 * avant que le résultat n'existe l'obligerait à recharger pour savoir. Le prix
 * en est une attente de dix à soixante secondes, que le bouton annonce.
 */
import { revalidatePath } from "next/cache";
import { assertPermission } from "@/lib/auth/guard";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { iaConfiguree } from "@/lib/ia/client";
import { entite as trouverEntite, type Entite } from "@/lib/ia/registre";
import { executerTraduction } from "@/lib/ia/planifier";
import { demander, marquerRelue, sourceProbable } from "@/lib/ia/suivi";

export type TraductionFormState = { error: string | null; ok: string | null };

const LANGUE_LABEL: Record<Lang, string> = { fr: "française", en: "anglaise" };

const lire = (formData: FormData, cle: string): string => String(formData.get(cle) ?? "").trim();

/** Langue portée par le formulaire, ou `null` si elle n'est pas servie par le site. */
function lireLocale(formData: FormData, cle = "locale"): Lang | null {
  const brut = lire(formData, cle);
  return (LOCALES as string[]).includes(brut) ? (brut as Lang) : null;
}

/**
 * Résout l'entité ET le droit qu'elle exige.
 *
 * L'ordre importe : on ne peut pas exiger un droit avant de savoir lequel, et
 * on ne peut pas le savoir sans lire le registre. La lecture du registre ne
 * divulgue rien — il ne contient que des déclarations de structure.
 */
async function resoudre(
  formData: FormData,
): Promise<{ entite: Entite; entiteId: string; acteurId: string } | { erreur: string }> {
  const cle = lire(formData, "entite");
  const entiteId = lire(formData, "entiteId");

  const entite = trouverEntite(cle);
  if (!entite || !entiteId) return { erreur: "Contenu introuvable." };

  const acteur = await assertPermission(entite.permission);
  if (!(await entite.existe(entiteId))) return { erreur: "Contenu introuvable." };

  return { entite, entiteId, acteurId: acteur.id };
}

/** Rafraîchit l'écran du module et les fiches qu'il contient. */
function rafraichir(entite: Entite): void {
  revalidatePath(entite.ecran, "layout");
}

/* -------------------------------------------------------------------------- */
/* Relancer                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * (Re)compose une langue, et attend le résultat.
 *
 * Sert aussi bien à reprendre une tâche interrompue qu'à demander une
 * traduction pour un contenu que l'assistance n'a jamais touché : dans les deux
 * cas, la langue source est déduite (cf. `sourceProbable`).
 */
export async function relancerTraductionAction(
  _prev: TraductionFormState,
  formData: FormData,
): Promise<TraductionFormState> {
  if (!iaConfiguree()) {
    return { error: "Assistance à la traduction non configurée sur ce serveur.", ok: null };
  }

  const resolu = await resoudre(formData);
  if ("erreur" in resolu) return { error: resolu.erreur, ok: null };
  const { entite, entiteId } = resolu;

  const cible = lireLocale(formData);
  if (!cible) return { error: "Langue inconnue.", ok: null };

  const source = await sourceProbable(entite, entiteId, cible);
  if (!source) {
    return {
      error: "Aucune langue de ce contenu ne porte de texte : il n'y a rien à traduire.",
      ok: null,
    };
  }

  await demander(entite.cle, entiteId, source, cible);
  await executerTraduction(entite.cle, entiteId, source, cible);
  rafraichir(entite);

  // `executerTraduction` ne lève jamais : le résultat se lit dans le journal,
  // que l'écran rechargé vient d'afficher. On ne redit donc pas ici ce qui s'y
  // trouve déjà — au risque de le contredire.
  return { error: null, ok: `Version ${LANGUE_LABEL[cible]} traitée.` };
}

/* -------------------------------------------------------------------------- */
/* Valider                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * « J'ai relu, c'est bon. »
 *
 * Sans ce geste, valider une traduction correcte imposerait de rouvrir son
 * formulaire et de l'enregistrer sans rien changer. Il produit exactement le
 * même effet : la langue cesse d'appartenir à l'assistance, et plus aucune
 * génération ne la réécrira.
 */
export async function validerTraductionAction(
  _prev: TraductionFormState,
  formData: FormData,
): Promise<TraductionFormState> {
  const resolu = await resoudre(formData);
  if ("erreur" in resolu) return { error: resolu.erreur, ok: null };
  const { entite, entiteId, acteurId } = resolu;

  const locale = lireLocale(formData);
  if (!locale) return { error: "Langue inconnue.", ok: null };

  await marquerRelue(entite.cle, entiteId, locale, acteurId);
  rafraichir(entite);

  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} validée.` };
}
