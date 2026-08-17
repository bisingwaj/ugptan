"use server";

/**
 * Écritures du module « Gouvernance » — organes et chronique des décisions.
 *
 * ⚠️ INVARIANT : chaque action commence par une garde d'autorisation. Le proxy
 * laisse passer les POST (rediriger un POST de server action casserait le
 * protocole Flight), la barrière est donc ici, et nulle part ailleurs.
 *
 * Le droit requis est celui du module « L'UGPTN » — `ugptn` —, dont la page
 * « Gouvernance » est le second écran.
 *
 * Un formulaire par langue, comme partout ailleurs dans la console : la fiche
 * et les traductions s'enregistrent séparément, sans quoi l'écran du traducteur
 * réécrirait la langue d'origine telle qu'il l'a chargée.
 */
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertPermission } from "@/lib/auth/guard";
import { adminPath } from "@/lib/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { revaliderGouvernance } from "@/lib/gouvernance/cache";
import { activiteTraduite, isGouvStatut, organeTraduit } from "@/lib/gouvernance/statut";

/** État partagé par tous les formulaires du module. */
export type GouvFormState = { error: string | null; ok: string | null };

const ECRAN = adminPath("/ugptn/governance");

/** Code Prisma d'une violation de contrainte d'unicité. */
const UNIQUE_VIOLATION = "P2002";

const estDoublon = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: string }).code === UNIQUE_VIOLATION;

const LANGUE_LABEL: Record<Lang, string> = { fr: "française", en: "anglaise" };

/* -------------------------------------------------------------------------- */
/* Lecture du formulaire                                                       */
/* -------------------------------------------------------------------------- */

const texte = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();
const optionnel = (value: string): string | null => (value.length ? value : null);

const entier = (formData: FormData, key: string): number => {
  const valeur = Number.parseInt(texte(formData, key), 10);
  return Number.isFinite(valeur) ? valeur : 0;
};

/** Couleur d'accent : hexadécimal à 6 chiffres, ou rien. */
function lireCouleur(value: string): string | null {
  const couleur = value.trim().toLowerCase();
  if (!couleur) return null;
  return /^#[0-9a-f]{6}$/.test(couleur) ? couleur : null;
}

function lireLocale(formData: FormData): Lang | null {
  const brut = texte(formData, "locale");
  return (LOCALES as string[]).includes(brut) ? (brut as Lang) : null;
}

/**
 * Lignes d'un champ à saisie multiple — les sièges d'un organe.
 *
 * Une zone de texte plutôt qu'un champ à séparateurs : les intitulés en
 * contiennent (« MPTN — Président », « MIS ×2 », « MINFIN-CSPP »), et n'importe
 * quel séparateur en couperait un tôt ou tard.
 */
const lireLignes = (formData: FormData, key: string): string[] =>
  String(formData.get(key) ?? "")
    .split("\n")
    .map((ligne) => ligne.trim())
    .filter((ligne) => ligne.length > 0);

/** Date de classement, saisie en `<input type="date">` à l'heure de Kinshasa. */
function lireDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T09:00:00+01:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Clé libre dans une série, en incrémentant tant qu'elle est prise. */
async function cleLibre(prefixe: string, prises: Set<string>): Promise<string> {
  let rang = 1;
  while (prises.has(`${prefixe}-${rang}`)) rang += 1;
  return `${prefixe}-${rang}`;
}

/* -------------------------------------------------------------------------- */
/* Organes                                                                     */
/* -------------------------------------------------------------------------- */

export async function ajouterOrganeAction(
  _prev: GouvFormState,
  _formData: FormData,
): Promise<GouvFormState> {
  await assertPermission("ugptn");

  const [dernier, existants] = await Promise.all([
    db().organe.findFirst({ orderBy: { position: "desc" }, select: { position: true } }),
    db().organe.findMany({ select: { key: true, sigle: true } }),
  ]);

  const cles = new Set(existants.map((row) => row.key));
  const sigles = new Set(existants.map((row) => row.sigle));
  const key = await cleLibre("ORG", cles);
  // Le sigle est unique et s'affiche : un provisoire lisible vaut mieux qu'un
  // champ vide, que la contrainte refuserait au second ajout.
  const sigle = await cleLibre("ORG", sigles);

  await db().organe.create({
    data: { key, sigle, status: "DRAFT", position: (dernier?.position ?? -1) + 1 },
    select: { id: true },
  });

  revalidatePath(ECRAN);
  revaliderGouvernance();
  return { error: null, ok: "Organe ajouté. Renseignez-le puis publiez-le." };
}

export async function enregistrerOrganeAction(
  _prev: GouvFormState,
  formData: FormData,
): Promise<GouvFormState> {
  await assertPermission("ugptn");

  const id = texte(formData, "id");
  if (!id) return { error: "Organe introuvable.", ok: null };

  const sigle = texte(formData, "sigle").toUpperCase();
  if (!sigle) return { error: "Renseignez le sigle de l'organe.", ok: null };

  const statut = texte(formData, "status");
  if (!isGouvStatut(statut)) return { error: "État inconnu.", ok: null };

  const organe = await db().organe.findUnique({
    where: { id },
    select: { id: true, translations: { select: { nom: true, nature: true } } },
  });
  if (!organe) return { error: "Organe introuvable.", ok: null };

  /* La complétude se lit EN BASE et non dans le formulaire : cet envoi ne porte
     aucune langue, et l'état des traductions a pu changer depuis l'affichage. */
  if (statut === "PUBLISHED" && !organe.translations.some((tr) => organeTraduit(tr))) {
    return {
      error: "Aucune langue renseignée : donnez le nom et la nature dans au moins une langue avant de publier.",
      ok: null,
    };
  }

  try {
    await db().organe.update({
      where: { id },
      data: { sigle, status: statut, position: entier(formData, "position") },
    });
  } catch (error) {
    if (estDoublon(error)) return { error: "Ce sigle est déjà porté par un autre organe.", ok: null };
    throw error;
  }

  revalidatePath(ECRAN);
  revaliderGouvernance();
  return { error: null, ok: "Organe enregistré." };
}

export async function basculerOrganeAction(
  _prev: GouvFormState,
  formData: FormData,
): Promise<GouvFormState> {
  await assertPermission("ugptn");

  const id = texte(formData, "id");
  const organe = await db().organe.findUnique({
    where: { id },
    select: { status: true, translations: { select: { nom: true, nature: true } } },
  });
  if (!organe) return { error: "Organe introuvable.", ok: null };

  const enLigne = organe.status === "PUBLISHED";
  if (!enLigne && !organe.translations.some((tr) => organeTraduit(tr))) {
    return { error: "Donnez le nom et la nature dans au moins une langue avant de publier.", ok: null };
  }

  await db().organe.update({ where: { id }, data: { status: enLigne ? "DRAFT" : "PUBLISHED" } });

  revalidatePath(ECRAN);
  revaliderGouvernance();
  return { error: null, ok: enLigne ? "Organe retiré du site." : "Organe publié." };
}

export async function supprimerOrganeAction(
  _prev: GouvFormState,
  formData: FormData,
): Promise<GouvFormState> {
  await assertPermission("ugptn");

  const id = texte(formData, "id");
  const organe = await db().organe.findUnique({ where: { id }, select: { id: true } });
  if (!organe) return { error: "Organe introuvable.", ok: null };

  await db().organe.delete({ where: { id } });

  revalidatePath(ECRAN);
  revaliderGouvernance();
  return { error: null, ok: "Organe supprimé." };
}

export async function deplacerOrganeAction(
  _prev: GouvFormState,
  formData: FormData,
): Promise<GouvFormState> {
  await assertPermission("ugptn");

  const id = texte(formData, "id");
  const sens = texte(formData, "sens") === "bas" ? 1 : -1;

  const organe = await db().organe.findUnique({
    where: { id },
    select: { id: true, position: true },
  });
  if (!organe) return { error: "Organe introuvable.", ok: null };

  /* L'échange se fait avec le VOISIN, et non avec la position calculée : les
     positions peuvent comporter des trous après suppressions, et décrémenter à
     l'aveugle ferait du sur-place. */
  const voisin = await db().organe.findFirst({
    where: { position: sens < 0 ? { lt: organe.position } : { gt: organe.position } },
    orderBy: { position: sens < 0 ? "desc" : "asc" },
    select: { id: true, position: true },
  });
  if (!voisin) return { error: null, ok: null };

  await db().$transaction([
    db().organe.update({ where: { id: organe.id }, data: { position: voisin.position } }),
    db().organe.update({ where: { id: voisin.id }, data: { position: organe.position } }),
  ]);

  revalidatePath(ECRAN);
  revaliderGouvernance();
  return { error: null, ok: null };
}

function lireTraductionOrgane(formData: FormData) {
  return {
    nom: optionnel(texte(formData, "nom")),
    nature: optionnel(texte(formData, "nature")),
    effectif: optionnel(texte(formData, "effectif")),
    presidence: optionnel(texte(formData, "presidence")),
    decision: optionnel(texte(formData, "decision")),
    frequence: optionnel(texte(formData, "frequence")),
    composition: optionnel(texte(formData, "composition")),
    membres: lireLignes(formData, "membres"),
  };
}

export async function enregistrerOrganeLangueAction(
  _prev: GouvFormState,
  formData: FormData,
): Promise<GouvFormState> {
  await assertPermission("ugptn");

  const organeId = texte(formData, "organeId");
  const locale = lireLocale(formData);
  if (!organeId) return { error: "Organe introuvable.", ok: null };
  if (!locale) return { error: "Langue inconnue.", ok: null };

  const valeurs = lireTraductionOrgane(formData);
  if (!organeTraduit(valeurs)) {
    return {
      error: "Renseignez le nom et la nature. Pour retirer cette langue, utilisez « Supprimer cette traduction ».",
      ok: null,
    };
  }

  await db().organeTranslation.upsert({
    where: { organeId_locale: { organeId, locale } },
    update: valeurs,
    create: { organeId, locale, ...valeurs },
  });

  revalidatePath(ECRAN);
  revaliderGouvernance();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} enregistrée.` };
}

export async function supprimerOrganeLangueAction(
  _prev: GouvFormState,
  formData: FormData,
): Promise<GouvFormState> {
  await assertPermission("ugptn");

  const organeId = texte(formData, "organeId");
  const locale = lireLocale(formData);
  if (!organeId || !locale) return { error: "Traduction introuvable.", ok: null };

  const organe = await db().organe.findUnique({
    where: { id: organeId },
    select: { status: true, translations: { select: { locale: true, nom: true, nature: true } } },
  });
  if (!organe) return { error: "Organe introuvable.", ok: null };

  /* Retirer la dernière langue d'un organe EN LIGNE le ferait disparaître du
     site sans que personne l'ait dépublié. */
  const restantes = organe.translations.filter(
    (tr) => tr.locale !== locale && organeTraduit(tr),
  );
  if (organe.status === "PUBLISHED" && restantes.length === 0) {
    return {
      error: "C'est la dernière langue renseignée d'un organe en ligne : retirez-le du site d'abord.",
      ok: null,
    };
  }

  await db().organeTranslation.deleteMany({ where: { organeId, locale } });

  revalidatePath(ECRAN);
  revaliderGouvernance();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} supprimée.` };
}

/* -------------------------------------------------------------------------- */
/* Chronique des décisions                                                     */
/* -------------------------------------------------------------------------- */

export async function ajouterActiviteAction(
  _prev: GouvFormState,
  _formData: FormData,
): Promise<GouvFormState> {
  await assertPermission("ugptn");

  const [premier, existantes] = await Promise.all([
    db().gouvActivite.findFirst({ orderBy: { position: "asc" }, select: { position: true } }),
    db().gouvActivite.findMany({ select: { key: true } }),
  ]);

  const key = await cleLibre("ACT", new Set(existantes.map((row) => row.key)));

  await db().gouvActivite.create({
    data: {
      key,
      status: "DRAFT",
      /* En TÊTE de chronique, et non en queue : une décision qu'on saisit est
         la plus récente, et la page se lit du plus récent au plus ancien. */
      position: (premier?.position ?? 0) - 1,
      org: "Coordination",
      color: "#0f62fe",
    },
    select: { id: true },
  });

  revalidatePath(ECRAN);
  revaliderGouvernance();
  return { error: null, ok: "Décision ajoutée. Renseignez-la puis publiez-la." };
}

export async function enregistrerActiviteAction(
  _prev: GouvFormState,
  formData: FormData,
): Promise<GouvFormState> {
  await assertPermission("ugptn");

  const id = texte(formData, "id");
  if (!id) return { error: "Décision introuvable.", ok: null };

  const statut = texte(formData, "status");
  if (!isGouvStatut(statut)) return { error: "État inconnu.", ok: null };

  const org = texte(formData, "org");
  if (!org) return { error: "Renseignez l'instance à l'origine de la décision.", ok: null };

  const activite = await db().gouvActivite.findUnique({
    where: { id },
    select: { id: true, translations: { select: { dateLabel: true, titre: true, note: true } } },
  });
  if (!activite) return { error: "Décision introuvable.", ok: null };

  if (statut === "PUBLISHED" && !activite.translations.some((tr) => activiteTraduite(tr))) {
    return {
      error: "Aucune langue complète : renseignez la date, la décision et sa portée dans au moins une langue avant de publier.",
      ok: null,
    };
  }

  await db().gouvActivite.update({
    where: { id },
    data: {
      status: statut,
      position: entier(formData, "position"),
      org,
      color: lireCouleur(texte(formData, "color")) ?? "#0f62fe",
      dateAt: lireDate(texte(formData, "dateAt")),
    },
  });

  revalidatePath(ECRAN);
  revaliderGouvernance();
  return { error: null, ok: "Décision enregistrée." };
}

export async function basculerActiviteAction(
  _prev: GouvFormState,
  formData: FormData,
): Promise<GouvFormState> {
  await assertPermission("ugptn");

  const id = texte(formData, "id");
  const activite = await db().gouvActivite.findUnique({
    where: { id },
    select: { status: true, translations: { select: { dateLabel: true, titre: true, note: true } } },
  });
  if (!activite) return { error: "Décision introuvable.", ok: null };

  const enLigne = activite.status === "PUBLISHED";
  if (!enLigne && !activite.translations.some((tr) => activiteTraduite(tr))) {
    return {
      error: "Renseignez la date, la décision et sa portée dans au moins une langue avant de publier.",
      ok: null,
    };
  }

  await db().gouvActivite.update({ where: { id }, data: { status: enLigne ? "DRAFT" : "PUBLISHED" } });

  revalidatePath(ECRAN);
  revaliderGouvernance();
  return { error: null, ok: enLigne ? "Décision retirée du site." : "Décision publiée." };
}

export async function supprimerActiviteAction(
  _prev: GouvFormState,
  formData: FormData,
): Promise<GouvFormState> {
  await assertPermission("ugptn");

  const id = texte(formData, "id");
  const activite = await db().gouvActivite.findUnique({ where: { id }, select: { id: true } });
  if (!activite) return { error: "Décision introuvable.", ok: null };

  await db().gouvActivite.delete({ where: { id } });

  revalidatePath(ECRAN);
  revaliderGouvernance();
  return { error: null, ok: "Décision supprimée." };
}

export async function deplacerActiviteAction(
  _prev: GouvFormState,
  formData: FormData,
): Promise<GouvFormState> {
  await assertPermission("ugptn");

  const id = texte(formData, "id");
  const sens = texte(formData, "sens") === "bas" ? 1 : -1;

  const activite = await db().gouvActivite.findUnique({
    where: { id },
    select: { id: true, position: true },
  });
  if (!activite) return { error: "Décision introuvable.", ok: null };

  const voisin = await db().gouvActivite.findFirst({
    where: { position: sens < 0 ? { lt: activite.position } : { gt: activite.position } },
    orderBy: { position: sens < 0 ? "desc" : "asc" },
    select: { id: true, position: true },
  });
  if (!voisin) return { error: null, ok: null };

  await db().$transaction([
    db().gouvActivite.update({ where: { id: activite.id }, data: { position: voisin.position } }),
    db().gouvActivite.update({ where: { id: voisin.id }, data: { position: activite.position } }),
  ]);

  revalidatePath(ECRAN);
  revaliderGouvernance();
  return { error: null, ok: null };
}

function lireTraductionActivite(formData: FormData) {
  return {
    dateLabel: optionnel(texte(formData, "dateLabel")),
    titre: optionnel(texte(formData, "titre")),
    note: optionnel(texte(formData, "note")),
  };
}

export async function enregistrerActiviteLangueAction(
  _prev: GouvFormState,
  formData: FormData,
): Promise<GouvFormState> {
  await assertPermission("ugptn");

  const activiteId = texte(formData, "activiteId");
  const locale = lireLocale(formData);
  if (!activiteId) return { error: "Décision introuvable.", ok: null };
  if (!locale) return { error: "Langue inconnue.", ok: null };

  const valeurs = lireTraductionActivite(formData);
  if (!activiteTraduite(valeurs)) {
    return {
      error: "Renseignez la date affichée, la décision et sa portée : le dessin de la chronique affiche les trois.",
      ok: null,
    };
  }

  await db().gouvActiviteTranslation.upsert({
    where: { activiteId_locale: { activiteId, locale } },
    update: valeurs,
    create: { activiteId, locale, ...valeurs },
  });

  revalidatePath(ECRAN);
  revaliderGouvernance();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} enregistrée.` };
}
