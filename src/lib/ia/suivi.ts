import "server-only";

/**
 * Le journal des traductions assistées.
 *
 * Il répond à trois questions, et rien d'autre :
 *
 *   · faut-il traduire cette langue ? (`aTraduire`)
 *   · où en est-elle ? (`etatsDe`, `aRelire`)
 *   · qui a relu, quand, avec quel modèle ? (le journal lui-même)
 *
 * La règle qui gouverne tout le reste tient en une phrase : **l'assistance
 * n'écrase jamais un texte humain**. Une langue est composée si elle est
 * absente, si elle est vide, ou si elle porte une version produite par le
 * modèle que personne n'a encore relue. Dès qu'une personne a enregistré cette
 * langue depuis la console, elle lui appartient.
 *
 * C'est aussi ce qui rend le déclenchement à l'enregistrement sûr dans les deux
 * sens : enregistrer le français peut composer l'anglais, enregistrer l'anglais
 * peut composer le français, et aucun des deux ne peut effacer le travail de
 * l'autre.
 */
import { db } from "@/lib/db";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { isEmptyHtml } from "@/lib/html/sanitize";
import { formatDateTime } from "@/lib/format";
import type { Entite, LigneTraduction } from "@/lib/ia/registre";
import { type EtatVue, type Statut } from "@/lib/ia/statut";

/* Les statuts et leurs libellés vivent dans `statut.ts`, sans import serveur :
   les composants clients du bandeau les lisent aussi. */

/**
 * Au-delà, une tâche `EN_COURS` est réputée interrompue.
 *
 * Le travail se fait dans un `after()`, donc après la réponse HTTP : la
 * plateforme d'hébergement peut couper la fonction avant la fin. Rien ne le
 * signale — d'où ce délai de garde, qui distingue « en train de tourner » de
 * « morte en route » et rend la tâche reprenable.
 */
const DELAI_GARDE_MS = 5 * 60_000;

export type Etat = {
  locale: Lang;
  sourceLocale: Lang;
  statut: Statut;
  modele: string | null;
  champs: string[];
  erreur: string | null;
  demandeeLe: Date;
  produiteLe: Date | null;
  relueLe: Date | null;
  reluePar: string | null;
  /** Vrai si la tâche est en cours depuis trop longtemps pour l'être encore. */
  interrompue: boolean;
};

function versEtat(ligne: {
  locale: string;
  sourceLocale: string;
  statut: string;
  modele: string | null;
  champs: string[];
  erreur: string | null;
  demandeeLe: Date;
  produiteLe: Date | null;
  relueLe: Date | null;
  reluePar?: { name: string } | null;
}): Etat {
  const statut = ligne.statut as Statut;
  return {
    locale: ligne.locale as Lang,
    sourceLocale: ligne.sourceLocale as Lang,
    statut,
    modele: ligne.modele,
    champs: ligne.champs,
    erreur: ligne.erreur,
    demandeeLe: ligne.demandeeLe,
    produiteLe: ligne.produiteLe,
    relueLe: ligne.relueLe,
    reluePar: ligne.reluePar?.name ?? null,
    interrompue:
      statut === "EN_COURS" && Date.now() - ligne.demandeeLe.getTime() > DELAI_GARDE_MS,
  };
}

/* -------------------------------------------------------------------------- */
/* Lecture                                                                     */
/* -------------------------------------------------------------------------- */

/** État de chaque langue d'une entité, indexé par langue. Vide : jamais assistée. */
export async function etatsDe(
  entiteCle: string,
  entiteId: string,
): Promise<Partial<Record<Lang, Etat>>> {
  const lignes = await db().traductionAssistee.findMany({
    where: { entite: entiteCle, entiteId },
    include: { reluePar: { select: { name: true } } },
  });

  const etats: Partial<Record<Lang, Etat>> = {};
  for (const ligne of lignes) {
    const etat = versEtat(ligne);
    etats[etat.locale] = etat;
  }
  return etats;
}

/** Même chose, pour plusieurs entités du même type — une requête, pas N. */
export async function etatsDePlusieurs(
  entiteCle: string,
  entiteIds: string[],
): Promise<Map<string, Partial<Record<Lang, Etat>>>> {
  const carte = new Map<string, Partial<Record<Lang, Etat>>>();
  if (entiteIds.length === 0) return carte;

  const lignes = await db().traductionAssistee.findMany({
    where: { entite: entiteCle, entiteId: { in: entiteIds } },
    include: { reluePar: { select: { name: true } } },
  });

  for (const ligne of lignes) {
    const etat = versEtat(ligne);
    const existant = carte.get(ligne.entiteId) ?? {};
    existant[etat.locale] = etat;
    carte.set(ligne.entiteId, existant);
  }
  return carte;
}

/**
 * Ce que la console doit signaler : tout ce qui n'a pas été relu.
 *
 * Les échecs comme les attentes en font partie — un rédacteur doit savoir
 * qu'une langue a été demandée et n'est jamais arrivée, sans quoi il croira la
 * page bilingue alors qu'elle ne l'est pas.
 */
export async function aRelire(limite = 200) {
  return db().traductionAssistee.findMany({
    where: { statut: { in: ["EN_ATTENTE", "EN_COURS", "GENEREE", "ECHEC"] } },
    include: { reluePar: { select: { name: true } } },
    orderBy: [{ statut: "asc" }, { demandeeLe: "desc" }],
    take: limite,
  });
}

/* -------------------------------------------------------------------------- */
/* Décision                                                                    */
/* -------------------------------------------------------------------------- */

/** Vrai si cette ligne de traduction ne porte aucun texte exploitable. */
function ligneVide(entite: Entite, ligne: LigneTraduction | null): boolean {
  if (!ligne) return true;
  return entite.champs.every((champ) => {
    const valeur = ligne[champ.nom];
    if (champ.nature === "liste") return !Array.isArray(valeur) || valeur.length === 0;
    if (typeof valeur !== "string" || !valeur.trim()) return true;
    return champ.nature === "html" ? isEmptyHtml(valeur) : false;
  });
}

/**
 * Faut-il composer `cible` pour cette entité ?
 *
 * Oui dans trois cas seulement : la langue n'existe pas, elle est vide, ou elle
 * porte une version générée que personne n'a relue — auquel cas la source a
 * changé depuis et la version dérivée doit suivre.
 *
 * Non dès qu'une personne a enregistré cette langue : `RELUE` est le verrou.
 */
export async function aTraduire(entite: Entite, entiteId: string, cible: Lang): Promise<boolean> {
  const journal = await db().traductionAssistee.findUnique({
    where: { entite_entiteId_locale: { entite: entite.cle, entiteId, locale: cible } },
    select: { statut: true },
  });

  if (journal?.statut === "RELUE") return false;

  const existante = (await entite.lire(entiteId, cible)) as LigneTraduction | null;
  if (ligneVide(entite, existante)) return true;

  // Une langue non vide dont le journal dit qu'elle vient du modèle et n'a pas
  // été relue peut être recomposée : personne ne s'en est encore saisi.
  return journal?.statut === "GENEREE" || journal?.statut === "ECHEC";
}

/* -------------------------------------------------------------------------- */
/* Écriture                                                                    */
/* -------------------------------------------------------------------------- */

/** Langues à composer à partir de `source`, hors `source` elle-même. */
export function ciblesDepuis(source: Lang): Lang[] {
  return LOCALES.filter((locale) => locale !== source);
}

/** Inscrit une demande. Repart de zéro : l'erreur d'un essai précédent est effacée. */
export async function demander(
  entiteCle: string,
  entiteId: string,
  source: Lang,
  cible: Lang,
): Promise<void> {
  const commun = { statut: "EN_ATTENTE" as const, sourceLocale: source, erreur: null, demandeeLe: new Date() };
  await db().traductionAssistee.upsert({
    where: { entite_entiteId_locale: { entite: entiteCle, entiteId, locale: cible } },
    create: { entite: entiteCle, entiteId, locale: cible, ...commun },
    update: commun,
  });
}

export async function commencer(entiteCle: string, entiteId: string, cible: Lang): Promise<void> {
  await db().traductionAssistee.updateMany({
    where: { entite: entiteCle, entiteId, locale: cible },
    data: { statut: "EN_COURS", erreur: null },
  });
}

export async function reussir(
  entiteCle: string,
  entiteId: string,
  cible: Lang,
  detail: { modele: string; champs: string[]; intitule: string | null },
): Promise<void> {
  await db().traductionAssistee.updateMany({
    where: { entite: entiteCle, entiteId, locale: cible },
    data: {
      statut: "GENEREE",
      modele: detail.modele,
      champs: detail.champs,
      intitule: detail.intitule,
      erreur: null,
      produiteLe: new Date(),
      relueLe: null,
      relueParId: null,
    },
  });
}

export async function echouer(
  entiteCle: string,
  entiteId: string,
  cible: Lang,
  motif: string,
  intitule: string | null = null,
): Promise<void> {
  await db().traductionAssistee.updateMany({
    where: { entite: entiteCle, entiteId, locale: cible },
    // L'intitulé compte SURTOUT en cas d'échec : c'est par lui qu'on retrouve
    // le contenu à reprendre depuis l'écran de suivi.
    data: { statut: "ECHEC", erreur: motif.slice(0, 500), ...(intitule ? { intitule } : {}) },
  });
}

/**
 * Une personne vient d'enregistrer cette langue : elle en répond désormais.
 *
 * Appelé par CHAQUE action d'enregistrement d'une langue. Sans effet si
 * l'assistance n'a jamais touché à ce contenu — d'où `updateMany`, qui ne lève
 * pas sur une absence de ligne.
 */
export async function marquerRelue(
  entiteCle: string,
  entiteId: string,
  locale: Lang,
  parId: string | null,
): Promise<void> {
  await db().traductionAssistee.updateMany({
    where: { entite: entiteCle, entiteId, locale, statut: { not: "RELUE" } },
    data: { statut: "RELUE", relueLe: new Date(), relueParId: parId, erreur: null },
  });
}

/**
 * Efface le suivi d'une entité — ou d'une seule de ses langues.
 *
 * Le journal ne porte pas de clé étrangère (cf. le commentaire du modèle) :
 * aucune cascade ne joue, c'est donc aux actions de suppression d'appeler ceci.
 * Sans quoi l'écran de suivi listerait des contenus disparus.
 */
export async function oublierTraductions(
  entiteCle: string,
  entiteId: string,
  locale?: Lang,
): Promise<void> {
  await db().traductionAssistee.deleteMany({
    where: { entite: entiteCle, entiteId, ...(locale ? { locale } : {}) },
  });
}

/**
 * Quelle langue lire pour composer `cible` ?
 *
 * Le journal le sait quand l'assistance est déjà passée. Sinon — un contenu
 * ancien, saisi avant la mise en service — on prend la première langue servie
 * qui porte réellement du texte. `null` : il n'y a rien à traduire nulle part.
 */
export async function sourceProbable(
  entite: Entite,
  entiteId: string,
  cible: Lang,
): Promise<Lang | null> {
  const journal = await db().traductionAssistee.findUnique({
    where: { entite_entiteId_locale: { entite: entite.cle, entiteId, locale: cible } },
    select: { sourceLocale: true },
  });
  if (journal && journal.sourceLocale !== cible) return journal.sourceLocale as Lang;

  for (const locale of LOCALES) {
    if (locale === cible) continue;
    const ligne = (await entite.lire(entiteId, locale)) as LigneTraduction | null;
    if (!ligneVide(entite, ligne)) return locale;
  }
  return null;
}

/**
 * Aplatit un état pour un composant client.
 *
 * Les dates sont formatées ICI, côté serveur : les laisser traverser en `Date`
 * obligerait chaque composant à les mettre en forme lui-même, et le fuseau du
 * navigateur ne coïncide pas toujours avec celui du site (cf. lib/format.ts).
 */
export function vueDe(etat: Etat): EtatVue {
  return {
    locale: etat.locale,
    sourceLocale: etat.sourceLocale,
    statut: etat.statut,
    interrompue: etat.interrompue,
    modele: etat.modele,
    erreur: etat.erreur,
    produiteLe: formatDateTime(etat.produiteLe),
    relueLe: formatDateTime(etat.relueLe),
    reluePar: etat.reluePar,
  };
}

/** Les vues de chaque langue d'une entité, prêtes à descendre au client. */
export async function vuesDe(
  entiteCle: string,
  entiteId: string,
): Promise<Partial<Record<Lang, EtatVue>>> {
  const etats = await etatsDe(entiteCle, entiteId);
  const vues: Partial<Record<Lang, EtatVue>> = {};
  for (const locale of LOCALES) {
    const etat = etats[locale];
    if (etat) vues[locale] = vueDe(etat);
  }
  return vues;
}

/** Les vues de plusieurs entités du même type, indexées par identifiant. */
export async function vuesDePlusieurs(
  entiteCle: string,
  entiteIds: string[],
): Promise<Map<string, Partial<Record<Lang, EtatVue>>>> {
  const etats = await etatsDePlusieurs(entiteCle, entiteIds);
  const vues = new Map<string, Partial<Record<Lang, EtatVue>>>();

  for (const [entiteId, parLangue] of etats) {
    const vue: Partial<Record<Lang, EtatVue>> = {};
    for (const locale of LOCALES) {
      const etat = parLangue[locale];
      if (etat) vue[locale] = vueDe(etat);
    }
    vues.set(entiteId, vue);
  }
  return vues;
}
