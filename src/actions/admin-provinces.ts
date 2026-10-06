"use server";

/**
 * Écritures du module « Provinces » — fiches de référence et projets localisés.
 *
 * ⚠️ INVARIANT : chaque action commence par une garde d'autorisation. Le proxy
 * laisse passer les POST (rediriger un POST de server action casserait le
 * protocole Flight), la barrière est donc ici, et nulle part ailleurs.
 *
 * Le droit requis est celui du module « Le Projet » — `projet` —, dont la page
 * « Provinces » est le quatrième écran : les pages province vivent sous
 * `/project/provinces` côté public.
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
import { revaliderProvinces } from "@/lib/provinces/cache";
import { slugsProvinces } from "@/lib/provinces/chemins";
import { estOdd, ficheTraduite, isAvancement, projetTraduit } from "@/lib/provinces/statut";
import { codesComposantes } from "@/lib/projet/query";
import { apresEnregistrementLangue } from "@/lib/ia/planifier";
import { oublierTraductions } from "@/lib/ia/suivi";

/** État partagé par tous les formulaires du module. */
export type ProvinceFormState = { error: string | null; ok: string | null };

const ECRAN = adminPath("/project/provinces");

const LANGUE_LABEL: Record<Lang, string> = { fr: "française", en: "anglaise" };

/** Toute écriture rafraîchit l'écran ET les pages publiques. */
function rafraichir(): void {
  revalidatePath(ECRAN);
  revaliderProvinces();
}

/* -------------------------------------------------------------------------- */
/* Lecture du formulaire                                                       */
/* -------------------------------------------------------------------------- */

const texte = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();
const optionnel = (value: string): string | null => (value.length ? value : null);

const entier = (formData: FormData, key: string): number => {
  const valeur = Number.parseInt(texte(formData, key), 10);
  return Number.isFinite(valeur) ? valeur : 0;
};

/**
 * Entier positif facultatif : `null` si le champ est vide, `undefined` s'il est
 * invalide — distinction nécessaire pour refuser plutôt que d'effacer.
 * Les espaces et les séparateurs de milliers saisis à la main sont tolérés
 * (« 8 500 000 », « 8.500.000 »).
 */
function entierFacultatif(formData: FormData, key: string): number | null | undefined {
  const brut = texte(formData, key).replace(/[\s.,  ]/g, "");
  if (!brut) return null;
  if (!/^\d+$/.test(brut)) return undefined;
  const valeur = Number.parseInt(brut, 10);
  return Number.isSafeInteger(valeur) && valeur <= 2_147_483_647 ? valeur : undefined;
}

function lireLocale(formData: FormData): Lang | null {
  const brut = texte(formData, "locale");
  return (LOCALES as string[]).includes(brut) ? (brut as Lang) : null;
}

/** Lignes d'une zone de texte à saisie multiple, sans doublon ni ligne vide. */
const lireLignes = (formData: FormData, key: string): string[] => [
  ...new Set(
    String(formData.get(key) ?? "")
      .split("\n")
      .map((ligne) => ligne.trim())
      .filter((ligne) => ligne.length > 0),
  ),
];

/** Date saisie en `<input type="date">` à l'heure de Kinshasa. */
function lireDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T09:00:00+01:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Jour civil d'une source (« attesté au … ») : stocké à minuit UTC, relu tel
 * quel par la couche publique (`toISOString().slice(0, 10)`).
 */
function lireJour(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Une adresse de source doit être un lien http(s) complet : la page en affiche le domaine. */
function estUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Clé libre dans une série, en incrémentant tant qu'elle est prise. */
function cleLibre(prefixe: string, prises: Set<string>): string {
  let rang = 1;
  while (prises.has(`${prefixe}-${rang}`)) rang += 1;
  return `${prefixe}-${rang}`;
}

/* -------------------------------------------------------------------------- */
/* Fiches                                                                      */
/* -------------------------------------------------------------------------- */

export async function enregistrerFicheAction(
  _prev: ProvinceFormState,
  formData: FormData,
): Promise<ProvinceFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  const fiche = id ? await db().provinceFiche.findUnique({ where: { id }, select: { id: true } }) : null;
  if (!fiche) return { error: "Fiche introuvable.", ok: null };

  const nombres = {
    superficieKm2: entierFacultatif(formData, "superficieKm2"),
    population: entierFacultatif(formData, "population"),
    populationAnnee: entierFacultatif(formData, "populationAnnee"),
    territoires: entierFacultatif(formData, "territoires"),
    communes: entierFacultatif(formData, "communes"),
  };
  const LIBELLES: Record<keyof typeof nombres, string> = {
    superficieKm2: "la superficie",
    population: "la population",
    populationAnnee: "l'année de la population",
    territoires: "le nombre de territoires",
    communes: "le nombre de communes",
  };
  for (const [cle, valeur] of Object.entries(nombres) as [keyof typeof nombres, number | null | undefined][]) {
    if (valeur === undefined) {
      return { error: `Saisissez ${LIBELLES[cle]} en chiffres entiers, ou laissez le champ vide.`, ok: null };
    }
  }
  if (nombres.populationAnnee !== null && nombres.populationAnnee !== undefined
    && (nombres.populationAnnee < 1900 || nombres.populationAnnee > 2100)) {
    return { error: "L'année de la population doit être une année à quatre chiffres.", ok: null };
  }

  const dateBrute = texte(formData, "gouverneurDate");
  const gouverneurDate = lireJour(dateBrute);
  if (dateBrute && !gouverneurDate) return { error: "Date de la source du gouverneur invalide.", ok: null };

  const sources = lireLignes(formData, "sources");
  const invalide = sources.find((source) => !estUrl(source));
  if (invalide) {
    return { error: `« ${invalide} » n'est pas une adresse complète (https://…). Une source par ligne.`, ok: null };
  }

  await db().provinceFiche.update({
    where: { id },
    data: {
      chefLieu: optionnel(texte(formData, "chefLieu")),
      superficieKm2: nombres.superficieKm2 ?? null,
      population: nombres.population ?? null,
      populationAnnee: nombres.populationAnnee ?? null,
      populationSource: optionnel(texte(formData, "populationSource")),
      territoires: nombres.territoires ?? null,
      communes: nombres.communes ?? null,
      villes: lireLignes(formData, "villes"),
      gouverneur: optionnel(texte(formData, "gouverneur")),
      viceGouverneur: optionnel(texte(formData, "viceGouverneur")),
      gouverneurDate,
      gouverneurSource: optionnel(texte(formData, "gouverneurSource")),
      langues: lireLignes(formData, "langues"),
      sources,
    },
  });

  rafraichir();
  return { error: null, ok: "Fiche enregistrée." };
}

export async function basculerFicheAction(
  _prev: ProvinceFormState,
  formData: FormData,
): Promise<ProvinceFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  const fiche = id
    ? await db().provinceFiche.findUnique({ where: { id }, select: { status: true } })
    : null;
  if (!fiche) return { error: "Fiche introuvable.", ok: null };

  /* Aucune condition de traduction pour publier : les chiffres, le gouverneur
     et les sources se lisent dans toutes les langues, et la page tient sans
     présentation (elle reprend alors le chapô générique). */
  const enLigne = fiche.status === "PUBLISHED";
  await db().provinceFiche.update({ where: { id }, data: { status: enLigne ? "DRAFT" : "PUBLISHED" } });

  rafraichir();
  return { error: null, ok: enLigne ? "Fiche retirée du site." : "Fiche publiée." };
}

export async function enregistrerFicheLangueAction(
  _prev: ProvinceFormState,
  formData: FormData,
): Promise<ProvinceFormState> {
  const acteur = await assertPermission("projet");

  const ficheId = texte(formData, "ficheId");
  const locale = lireLocale(formData);
  if (!ficheId) return { error: "Fiche introuvable.", ok: null };
  if (!locale) return { error: "Langue inconnue.", ok: null };

  const valeurs = {
    description: optionnel(texte(formData, "description")),
    administration: optionnel(texte(formData, "administration")),
  };
  if (!ficheTraduite(valeurs)) {
    return {
      error: "Renseignez la présentation. Pour retirer cette langue, utilisez « Supprimer cette traduction ».",
      ok: null,
    };
  }

  const fiche = await db().provinceFiche.findUnique({ where: { id: ficheId }, select: { id: true } });
  if (!fiche) return { error: "Fiche introuvable.", ok: null };

  await db().provinceFicheTranslation.upsert({
    where: { ficheId_locale: { ficheId, locale } },
    update: valeurs,
    create: { ficheId, locale, ...valeurs },
  });

  await apresEnregistrementLangue("provinceFiche", ficheId, locale, acteur.id);

  rafraichir();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} enregistrée.` };
}

export async function supprimerFicheLangueAction(
  _prev: ProvinceFormState,
  formData: FormData,
): Promise<ProvinceFormState> {
  await assertPermission("projet");

  const ficheId = texte(formData, "ficheId");
  const locale = lireLocale(formData);
  if (!ficheId || !locale) return { error: "Traduction introuvable.", ok: null };

  /* Pas de garde « dernière langue » : une fiche sans présentation reste
     lisible (chiffres, administration, sources), contrairement à un projet
     sans intitulé. */
  await db().provinceFicheTranslation.deleteMany({ where: { ficheId, locale } });
  await oublierTraductions("provinceFiche", ficheId, locale);

  rafraichir();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} supprimée.` };
}

/* -------------------------------------------------------------------------- */
/* Projets                                                                     */
/* -------------------------------------------------------------------------- */

export async function ajouterProjetAction(
  _prev: ProvinceFormState,
  _formData: FormData,
): Promise<ProvinceFormState> {
  await assertPermission("projet");

  const [dernier, existants] = await Promise.all([
    db().provinceProjet.findFirst({ orderBy: { position: "desc" }, select: { position: true } }),
    db().provinceProjet.findMany({ select: { key: true } }),
  ]);

  await db().provinceProjet.create({
    data: {
      key: cleLibre("PRJ", new Set(existants.map((row) => row.key))),
      status: "DRAFT",
      avancement: "PREVU",
      position: (dernier?.position ?? -1) + 1,
    },
    select: { id: true },
  });

  rafraichir();
  return { error: null, ok: "Projet ajouté en fin de liste. Renseignez-le puis publiez-le." };
}

export async function enregistrerProjetAction(
  _prev: ProvinceFormState,
  formData: FormData,
): Promise<ProvinceFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  const projet = id ? await db().provinceProjet.findUnique({ where: { id }, select: { id: true } }) : null;
  if (!projet) return { error: "Projet introuvable.", ok: null };

  const avancement = texte(formData, "avancement");
  if (!isAvancement(avancement)) return { error: "Avancement inconnu.", ok: null };

  const composante = texte(formData, "composante");
  if (composante && !(await codesComposantes()).has(composante)) {
    return { error: `La composante « ${composante} » n'existe pas.`, ok: null };
  }

  const odd = [...new Set(
    formData.getAll("odd").map((valeur) => Number.parseInt(String(valeur), 10)).filter(estOdd),
  )].sort((a, b) => a - b);

  /* Les cases suivent l'ordre alphabétique de l'écran ; on enregistre celui de
     la table de référence, pour que deux saisies identiques donnent la même
     ligne. Une valeur hors des 26 est ignorée. */
  const cochees = new Set(formData.getAll("provinces").map(String));
  const provinces = slugsProvinces().filter((slug) => cochees.has(slug));

  const debutBrut = texte(formData, "debut");
  const finBrut = texte(formData, "fin");
  const debut = lireDate(debutBrut);
  const fin = lireDate(finBrut);
  if ((debutBrut && !debut) || (finBrut && !fin)) return { error: "Date invalide.", ok: null };
  if (debut && fin && fin < debut) return { error: "La fin précède le début.", ok: null };

  await db().provinceProjet.update({
    where: { id },
    data: {
      avancement,
      composante: optionnel(composante),
      odd,
      provinces,
      debut,
      fin,
      position: entier(formData, "position"),
    },
  });

  rafraichir();
  return { error: null, ok: "Projet enregistré." };
}

export async function basculerProjetAction(
  _prev: ProvinceFormState,
  formData: FormData,
): Promise<ProvinceFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  const projet = id
    ? await db().provinceProjet.findUnique({
        where: { id },
        select: { status: true, translations: { select: { titre: true } } },
      })
    : null;
  if (!projet) return { error: "Projet introuvable.", ok: null };

  const enLigne = projet.status === "PUBLISHED";
  if (!enLigne && !projet.translations.some((tr) => projetTraduit(tr))) {
    return { error: "Donnez l'intitulé dans au moins une langue avant de publier.", ok: null };
  }

  await db().provinceProjet.update({ where: { id }, data: { status: enLigne ? "DRAFT" : "PUBLISHED" } });

  rafraichir();
  return { error: null, ok: enLigne ? "Projet retiré du site." : "Projet publié." };
}

export async function supprimerProjetAction(
  _prev: ProvinceFormState,
  formData: FormData,
): Promise<ProvinceFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  const projet = id ? await db().provinceProjet.findUnique({ where: { id }, select: { id: true } }) : null;
  if (!projet) return { error: "Projet introuvable.", ok: null };

  await db().provinceProjet.delete({ where: { id } });
  await oublierTraductions("provinceProjet", id);

  rafraichir();
  return { error: null, ok: "Projet supprimé." };
}

export async function deplacerProjetAction(
  _prev: ProvinceFormState,
  formData: FormData,
): Promise<ProvinceFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  const sens = texte(formData, "sens") === "bas" ? 1 : -1;

  const projet = id
    ? await db().provinceProjet.findUnique({ where: { id }, select: { id: true, position: true } })
    : null;
  if (!projet) return { error: "Projet introuvable.", ok: null };

  /* Échange avec le VOISIN, et non avec la position calculée : les positions
     peuvent comporter des trous après suppressions (cf. admin-gouvernance). */
  const voisin = await db().provinceProjet.findFirst({
    where: { position: sens < 0 ? { lt: projet.position } : { gt: projet.position } },
    orderBy: { position: sens < 0 ? "desc" : "asc" },
    select: { id: true, position: true },
  });
  if (!voisin) return { error: null, ok: null };

  await db().$transaction([
    db().provinceProjet.update({ where: { id: projet.id }, data: { position: voisin.position } }),
    db().provinceProjet.update({ where: { id: voisin.id }, data: { position: projet.position } }),
  ]);

  rafraichir();
  return { error: null, ok: null };
}

export async function enregistrerProjetLangueAction(
  _prev: ProvinceFormState,
  formData: FormData,
): Promise<ProvinceFormState> {
  const acteur = await assertPermission("projet");

  const projetId = texte(formData, "projetId");
  const locale = lireLocale(formData);
  if (!projetId) return { error: "Projet introuvable.", ok: null };
  if (!locale) return { error: "Langue inconnue.", ok: null };

  const valeurs = {
    titre: optionnel(texte(formData, "titre")),
    resume: optionnel(texte(formData, "resume")),
    lieu: optionnel(texte(formData, "lieu")),
  };
  if (!projetTraduit(valeurs)) {
    return {
      error: "Renseignez l'intitulé. Pour retirer cette langue, utilisez « Supprimer cette traduction ».",
      ok: null,
    };
  }

  const projet = await db().provinceProjet.findUnique({ where: { id: projetId }, select: { id: true } });
  if (!projet) return { error: "Projet introuvable.", ok: null };

  await db().provinceProjetTranslation.upsert({
    where: { projetId_locale: { projetId, locale } },
    update: valeurs,
    create: { projetId, locale, ...valeurs },
  });

  await apresEnregistrementLangue("provinceProjet", projetId, locale, acteur.id);

  rafraichir();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} enregistrée.` };
}

export async function supprimerProjetLangueAction(
  _prev: ProvinceFormState,
  formData: FormData,
): Promise<ProvinceFormState> {
  await assertPermission("projet");

  const projetId = texte(formData, "projetId");
  const locale = lireLocale(formData);
  if (!projetId || !locale) return { error: "Traduction introuvable.", ok: null };

  const projet = await db().provinceProjet.findUnique({
    where: { id: projetId },
    select: { status: true, translations: { select: { locale: true, titre: true } } },
  });
  if (!projet) return { error: "Projet introuvable.", ok: null };

  /* Retirer la dernière langue d'un projet EN LIGNE le ferait disparaître du
     site sans que personne l'ait dépublié. */
  const restantes = projet.translations.filter((tr) => tr.locale !== locale && projetTraduit(tr));
  if (projet.status === "PUBLISHED" && restantes.length === 0) {
    return {
      error: "C'est la dernière langue renseignée d'un projet en ligne : retirez-le du site d'abord.",
      ok: null,
    };
  }

  await db().provinceProjetTranslation.deleteMany({ where: { projetId, locale } });
  await oublierTraductions("provinceProjet", projetId, locale);

  rafraichir();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} supprimée.` };
}
