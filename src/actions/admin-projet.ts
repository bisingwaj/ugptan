"use server";

/**
 * Écritures du module « Le projet » — composantes et cadre de résultats.
 *
 * ⚠️ INVARIANT : chaque action commence par une garde d'autorisation. Le proxy
 * laisse passer les POST (rediriger un POST de server action casserait le
 * protocole Flight), la barrière est donc ici, et nulle part ailleurs.
 *
 * Une seule permission gouverne le module — `projet` —, contrairement au moteur
 * de sections où le droit se déduit de l'emplacement : ici, tout ce qui est
 * touché appartient par construction aux pages du groupe « Le projet ».
 *
 * ─── Un formulaire par langue ────────────────────────────────────────────────
 *
 * Même dispositif que partout ailleurs dans la console, et pour la même raison :
 * la fiche et les traductions s'enregistrent SÉPARÉMENT.
 *
 *   · `enregistrerComposanteAction`       → code, accent, adresse, données du
 *                                           MEP, visuel, vidéo ;
 *   · `enregistrerComposanteLangueAction` → UNE langue de la composante ;
 *   · `enregistrerBlocAction`             → les réglages d'UN bloc ;
 *   · `enregistrerBlocLangueAction`       → UNE langue d'UN bloc.
 *
 * Avec un envoi unique portant les deux langues, l'écran du traducteur
 * réécrirait AUSSI la langue d'origine telle qu'il l'a chargée : toute
 * correction faite entre-temps par le rédacteur serait écrasée sans que
 * personne ne le voie.
 *
 * Corollaire sur les noms de champs : ils ne sont PAS préfixés par la langue.
 * Le formulaire porte sa langue dans un champ `locale`.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertPermission } from "@/lib/auth/guard";
import { adminPath } from "@/lib/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { slugify } from "@/lib/actus/slug";
import { revaliderProjet } from "@/lib/projet/cache";
import { apresEnregistrementLangue } from "@/lib/ia/planifier";
import { oublierTraductions } from "@/lib/ia/suivi";
import {
  blocTraduit, composanteTraduite, indicateurTraduit,
  isChampComposante, isComposanteBlocType, isIndicateurFamille, isProjetStatut,
  CHAMPS_COMPOSANTE, type ChampComposante, type ComposanteBlocType,
} from "@/lib/projet/statut";

/** État partagé par tous les formulaires du module. */
export type ProjetFormState = { error: string | null; ok: string | null };

const BASE = adminPath("/project");
const COMPOSANTES_PATH = `${BASE}/components`;
const RESULTATS_PATH = `${BASE}/results`;

/** Code Prisma d'une violation de contrainte d'unicité. */
const UNIQUE_VIOLATION = "P2002";

const estDoublon = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: string }).code === UNIQUE_VIOLATION;

/**
 * Nom des langues dans les messages rendus à l'utilisateur.
 *
 * Deux formes, parce que le mot qu'elles qualifient n'a pas le même genre :
 * « la version française », mais « le bloc français ».
 */
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

/** Entier facultatif : un champ vide vaut « rien », pas « zéro ». */
function entierOptionnel(formData: FormData, key: string): number | null {
  const brut = texte(formData, key);
  if (!brut) return null;
  const valeur = Number.parseInt(brut.replace(/[\s ]/g, ""), 10);
  return Number.isFinite(valeur) ? valeur : null;
}

/**
 * Montant en millions de dollars.
 *
 * La virgule décimale est admise : le MEP est rédigé en français, et « 43,1 »
 * est la graphie sous laquelle le chiffre est relu. La refuser obligerait à
 * saisir une notation que le document ne porte pas.
 */
function decimalOptionnel(formData: FormData, key: string): number | null {
  const brut = texte(formData, key).replace(/[\s ]/g, "").replace(",", ".");
  if (!brut) return null;
  const valeur = Number.parseFloat(brut);
  return Number.isFinite(valeur) ? valeur : null;
}

/** Couleur d'accent : hexadécimal à 6 chiffres, ou rien. */
function lireCouleur(value: string): string | null {
  const couleur = value.trim().toLowerCase();
  if (!couleur) return null;
  return /^#[0-9a-f]{6}$/.test(couleur) ? couleur : null;
}

/** Langue portée par le formulaire, ou `null` si elle n'est pas servie. */
function lireLocale(formData: FormData): Lang | null {
  const brut = texte(formData, "locale");
  return (LOCALES as string[]).includes(brut) ? (brut as Lang) : null;
}

/**
 * Lignes d'un champ à saisie multiple — paragraphes d'un projet phare, puces.
 *
 * Une zone de texte plutôt qu'un champ à séparateurs : les paragraphes
 * contiennent virgules, points-virgules et tirets, et n'importe quel séparateur
 * en couperait un tôt ou tard. Le retour à la ligne est le seul caractère
 * qu'aucun paragraphe ne porte.
 *
 * Les lignes vides sont écartées : ce sont des respirations de saisie, pas des
 * paragraphes vides à publier.
 */
const lireLignes = (formData: FormData, key: string): string[] =>
  String(formData.get(key) ?? "")
    .split("\n")
    .map((ligne) => ligne.trim())
    .filter((ligne) => ligne.length > 0);

/* -------------------------------------------------------------------------- */
/* Composantes — fiche                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Réglages portés par CET envoi, groupe par groupe.
 *
 * Même précaution que pour les textes, et pour la même raison : la fiche est
 * présentée en sections, et le formulaire de « Données du MEP » ne porte ni le
 * code, ni le visuel, ni la vidéo. Les lire quand même les remettrait à leur
 * valeur par défaut à chaque enregistrement — l'accent repasserait au bleu, la
 * vidéo disparaîtrait.
 *
 * Un envoi qui ne déclare aucun groupe est réputé les porter tous : c'est le
 * cas de la création, dont le formulaire est unique.
 */
const GROUPES_REGLAGES = ["identite", "mep", "video"] as const;
type GroupeReglages = (typeof GROUPES_REGLAGES)[number];

function lireFicheComposante(formData: FormData) {
  const declares = texte(formData, "reglages")
    .split(",")
    .map((groupe) => groupe.trim())
    .filter((groupe): groupe is GroupeReglages =>
      (GROUPES_REGLAGES as readonly string[]).includes(groupe));

  const porte = (groupe: GroupeReglages) => declares.length === 0 || declares.includes(groupe);
  const coverMediaId = optionnel(texte(formData, "coverMediaId"));

  return {
    ...(porte("identite")
      ? {
          color: lireCouleur(texte(formData, "color")) ?? "#0f62fe",
          position: entier(formData, "position"),
          coverMediaId,
          // Un visuel issu de la bibliothèque prime sur une clé du registre :
          // conserver les deux laisserait deux sources de vérité pour une seule
          // image.
          coverKey: coverMediaId ? null : optionnel(texte(formData, "coverKey")),
        }
      : {}),

    ...(porte("mep")
      ? {
          montant: decimalOptionnel(formData, "montant") ?? 0,
          ida: decimalOptionnel(formData, "ida") ?? 0,
          afd: decimalOptionnel(formData, "afd") ?? 0,
          // Les cases cochées de la grille des indicateurs.
          odpCodes: formData.getAll("odpCodes").map(String).filter((code) => code.length > 0),
        }
      : {}),

    ...(porte("video")
      ? {
          videoYt: optionnel(texte(formData, "videoYt")),
          videoSrc: optionnel(texte(formData, "videoSrc")),
          videoDuree: optionnel(texte(formData, "videoDuree")),
          videoPosterKey: optionnel(texte(formData, "videoPosterKey")),
        }
      : {}),
  };
}

/** Le code et l'adresse n'appartiennent qu'à la section d'identité. */
const porteIdentite = (formData: FormData): boolean => {
  const declares = texte(formData, "reglages");
  return declares.length === 0 || declares.split(",").map((g) => g.trim()).includes("identite");
};

/**
 * Code d'une composante, normalisé.
 *
 * Majuscule imposée : le code s'affiche partout en mono (« C1 »), sert de clé
 * de rattachement aux articles, aux marchés et aux renvois entre composantes, et
 * `composantePublique` le compare sans casse. Laisser coexister « c1 » et « C1 »
 * en base créerait deux étiquettes pour une seule composante.
 */
const lireCode = (formData: FormData): string => texte(formData, "code").toUpperCase();

/** Adresse de la page dédiée, dérivée du code à défaut de saisie. */
function lireSlug(formData: FormData, code: string): string {
  const saisi = slugify(texte(formData, "slug"));
  return saisi || slugify(code) || code.toLowerCase();
}

export async function creerComposanteAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  const acteur = await assertPermission("projet");

  const locale = lireLocale(formData);
  if (!locale) return { error: "Langue de rédaction inconnue.", ok: null };

  const code = lireCode(formData);
  if (!code) return { error: "Renseignez le code de la composante (« C6 »).", ok: null };

  const entete = lireEnteteComposante(formData);
  if (!composanteTraduite(entete)) {
    return { error: "Renseignez l'intitulé court de la composante.", ok: null };
  }

  const statut = texte(formData, "status");
  if (!isProjetStatut(statut)) return { error: "État inconnu.", ok: null };

  const slug = lireSlug(formData, code);

  let composante: { id: string };
  try {
    composante = await db().composante.create({
      data: {
        /* `color` posée avant le spread : la lecture de la fiche rend des
           champs FACULTATIFS — un envoi de section n'en porte qu'un groupe —,
           alors qu'une création doit fournir l'accent. Le formulaire de
           création ne déclare aucun groupe et les porte donc tous : la valeur
           ci-dessous est écrasée dans les faits, elle ne sert qu'à dire au
           compilateur qu'il y en aura une. */
        color: "#0f62fe",
        ...lireFicheComposante(formData),
        // La clé n'est jamais affichée : elle sert d'ancrage stable à
        // l'amorçage et survit à un changement de code.
        key: code,
        code,
        slug,
        status: statut,
        createdById: acteur.id,
        translations: { create: [{ locale, ...entete }] },
      },
      select: { id: true },
    });
  } catch (error) {
    if (estDoublon(error)) {
      return {
        error: "Ce code ou cette adresse est déjà pris par une autre composante.",
        ok: null,
      };
    }
    throw error;
  }

  revaliderProjet();
  // redirect() lève NEXT_REDIRECT : appelé en dernier, hors de tout try/catch.
  redirect(`${COMPOSANTES_PATH}/${composante.id}?cree=1`);
}

export async function enregistrerComposanteAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  if (!id) return { error: "Composante introuvable.", ok: null };

  const composante = await db().composante.findUnique({
    where: { id },
    select: { id: true, translations: { select: { titre: true } } },
  });
  if (!composante) return { error: "Composante introuvable.", ok: null };

  /* Le code, l'adresse et l'état de publication n'appartiennent qu'à la section
     d'identité : les autres sections n'y touchent pas. */
  const identite = porteIdentite(formData);

  let entete: { code: string; slug: string; status: "DRAFT" | "PUBLISHED" } | null = null;
  if (identite) {
    const code = lireCode(formData);
    if (!code) return { error: "Renseignez le code de la composante.", ok: null };

    const statut = texte(formData, "status");
    if (!isProjetStatut(statut)) return { error: "État inconnu.", ok: null };

    /* La complétude se lit EN BASE et non dans le formulaire : cet envoi ne
       porte aucune langue, et l'état des traductions a pu changer depuis
       l'affichage. */
    if (statut === "PUBLISHED" && !composante.translations.some((tr) => composanteTraduite(tr))) {
      return {
        error: "Aucune langue renseignée : donnez un intitulé court dans au moins une langue avant de publier.",
        ok: null,
      };
    }

    entete = { code, slug: lireSlug(formData, code), status: statut };
  }

  try {
    await db().composante.update({
      where: { id },
      data: { ...lireFicheComposante(formData), ...(entete ?? {}) },
    });
  } catch (error) {
    if (estDoublon(error)) {
      return {
        error: "Ce code ou cette adresse est déjà pris par une autre composante.",
        ok: null,
      };
    }
    throw error;
  }

  revalidatePath(`${COMPOSANTES_PATH}/${id}`);
  revalidatePath(COMPOSANTES_PATH);
  revaliderProjet();
  return { error: null, ok: "Réglages enregistrés." };
}

/** Publie ou retire la composante, sans quitter l'écran. */
export async function basculerComposanteAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  const composante = await db().composante.findUnique({
    where: { id },
    select: { id: true, status: true, translations: { select: { titre: true } } },
  });
  if (!composante) return { error: "Composante introuvable.", ok: null };

  const enLigne = composante.status === "PUBLISHED";
  if (!enLigne && !composante.translations.some((tr) => composanteTraduite(tr))) {
    return {
      error: "Donnez un intitulé court dans au moins une langue avant de publier.",
      ok: null,
    };
  }

  await db().composante.update({
    where: { id },
    data: { status: enLigne ? "DRAFT" : "PUBLISHED" },
  });

  revalidatePath(`${COMPOSANTES_PATH}/${id}`);
  revalidatePath(COMPOSANTES_PATH);
  revaliderProjet();
  return { error: null, ok: enLigne ? "Composante retirée du site." : "Composante publiée." };
}

export async function supprimerComposanteAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  const composante = await db().composante.findUnique({ where: { id }, select: { id: true } });
  if (!composante) return { error: "Composante introuvable.", ok: null };

  // Les blocs tombent en cascade avec la composante ; leur suivi de traduction,
  // non — il faut donc les relever AVANT la suppression. Les indicateurs, eux,
  // relèvent d'une famille du cadre de résultats et non d'une composante : ils
  // survivent, et leur suivi avec eux.
  const blocs = await db().composanteBloc.findMany({ where: { composanteId: id }, select: { id: true } });
  await db().composante.delete({ where: { id } });
  await oublierTraductions("composante", id);
  for (const bloc of blocs) await oublierTraductions("composanteBloc", bloc.id);

  revaliderProjet();
  redirect(`${COMPOSANTES_PATH}?supprime=1`);
}

/* -------------------------------------------------------------------------- */
/* Composantes — traductions                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Les textes réellement PORTÉS par cet envoi.
 *
 * ⚠️ Pièce maîtresse du découpage en sections. Les onze textes d'une composante
 * vivent sur une seule ligne de traduction, mais la console les présente
 * section par section : le formulaire de la finalité ne porte que `finTitre` et
 * `finLead`. Sans cette déclaration, `optionnel(texte(formData, "soustitre"))`
 * lirait un champ ABSENT comme vide, et enregistrer la finalité effacerait le
 * chapô du héros — une perte silencieuse, à chaque enregistrement.
 *
 * Le formulaire déclare donc ce qu'il touche dans un champ `champs`. Un envoi
 * qui n'en déclare aucun est réputé porter tout : c'est le cas de la création,
 * dont le formulaire est unique.
 */
function lireEnteteComposante(formData: FormData): Partial<Record<ChampComposante, string | null>> {
  const declares = texte(formData, "champs")
    .split(",")
    .map((champ) => champ.trim())
    .filter(isChampComposante);

  const portes = declares.length > 0 ? declares : CHAMPS_COMPOSANTE;
  return Object.fromEntries(portes.map((champ) => [champ, optionnel(texte(formData, champ))]));
}

/**
 * Enregistre UNE langue de la composante, et pour cette langue les seuls champs
 * portés par la section d'où vient l'envoi.
 */
export async function enregistrerComposanteLangueAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  const acteur = await assertPermission("projet");

  const composanteId = texte(formData, "composanteId");
  const locale = lireLocale(formData);
  if (!composanteId) return { error: "Composante introuvable.", ok: null };
  if (!locale) return { error: "Langue inconnue.", ok: null };

  const valeurs = lireEnteteComposante(formData);

  /* La complétude se juge sur la ligne FUSIONNÉE, jamais sur le seul envoi :
     une section qui ne porte pas l'intitulé court n'a pas à le réclamer, et
     l'intitulé déjà enregistré fait foi. */
  const existante = await db().composanteTranslation.findUnique({
    where: { composanteId_locale: { composanteId, locale } },
    select: { titre: true },
  });

  const fusion = { titre: existante?.titre ?? null, ...valeurs };
  if (!composanteTraduite(fusion)) {
    return {
      error: "Renseignez l'intitulé court dans la section « Identité & héros » : c'est lui qui rend cette langue publiable.",
      ok: null,
    };
  }

  await db().composanteTranslation.upsert({
    where: { composanteId_locale: { composanteId, locale } },
    update: valeurs,
    create: { composanteId, locale, ...valeurs },
  });

  /* Une composante s'enregistre SECTION PAR SECTION : chaque envoi relance donc
     la composition de l'autre langue, qui repart de la ligne fusionnée. C'est
     redondant tant que la fiche se remplit, et voulu — la dernière génération
     est la seule qui compte, et elle porte l'état complet. */
  await apresEnregistrementLangue("composante", composanteId, locale, acteur.id);

  revalidatePath(`${COMPOSANTES_PATH}/${composanteId}`);
  revaliderProjet();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} enregistrée.` };
}

export async function supprimerComposanteLangueAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const composanteId = texte(formData, "composanteId");
  const locale = lireLocale(formData);
  if (!composanteId || !locale) return { error: "Traduction introuvable.", ok: null };

  const composante = await db().composante.findUnique({
    where: { id: composanteId },
    select: { status: true, translations: { select: { locale: true, titre: true } } },
  });
  if (!composante) return { error: "Composante introuvable.", ok: null };

  /* Retirer la dernière langue d'une composante EN LIGNE la ferait disparaître
     du site sans que personne l'ait dépubliée : la console le refuse plutôt que
     de laisser une page se vider en silence. */
  const restantes = composante.translations.filter(
    (tr) => tr.locale !== locale && composanteTraduite(tr),
  );
  if (composante.status === "PUBLISHED" && restantes.length === 0) {
    return {
      error: "C'est la dernière langue renseignée d'une composante en ligne : retirez-la du site d'abord.",
      ok: null,
    };
  }

  await db().composanteTranslation.deleteMany({ where: { composanteId, locale } });
  await oublierTraductions("composante", composanteId, locale);

  revalidatePath(`${COMPOSANTES_PATH}/${composanteId}`);
  revaliderProjet();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} supprimée.` };
}

/* -------------------------------------------------------------------------- */
/* Blocs                                                                       */
/* -------------------------------------------------------------------------- */

/** Composante d'un bloc, pour rafraîchir sa fiche après écriture. */
async function composanteDuBloc(blocId: string): Promise<string | null> {
  const bloc = await db().composanteBloc.findUnique({
    where: { id: blocId },
    select: { composanteId: true },
  });
  return bloc ? bloc.composanteId : null;
}

/**
 * Ajoute un bloc vide d'un type donné, en fin de sa liste.
 *
 * Vide et non prérempli : le bloc naît dans la section qui l'a demandé, la
 * rédaction le remplit sur place. Un gabarit d'exemple obligerait à effacer un
 * texte avant d'écrire le sien.
 */
export async function ajouterBlocAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const composanteId = texte(formData, "composanteId");
  const type = texte(formData, "type");
  if (!composanteId) return { error: "Composante introuvable.", ok: null };
  if (!isComposanteBlocType(type)) return { error: "Type de bloc inconnu.", ok: null };

  const composante = await db().composante.findUnique({
    where: { id: composanteId },
    select: { id: true },
  });
  if (!composante) return { error: "Composante introuvable.", ok: null };

  // La position suit le dernier bloc DU MÊME TYPE : chaque section a sa propre
  // numérotation, et un objectif ajouté ne doit pas se ranger derrière un
  // projet phare.
  const dernier = await db().composanteBloc.findFirst({
    where: { composanteId, type },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await db().composanteBloc.create({
    data: {
      composanteId,
      type,
      position: (dernier?.position ?? -1) + 1,
      status: "PUBLISHED",
    },
    select: { id: true },
  });

  revalidatePath(`${COMPOSANTES_PATH}/${composanteId}`);
  revaliderProjet();
  return { error: null, ok: "Entrée ajoutée. Renseignez-la puis enregistrez-la." };
}

/** Réglages non linguistiques d'un bloc. */
export async function enregistrerBlocAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  if (!id) return { error: "Entrée introuvable.", ok: null };

  const statut = texte(formData, "status");
  if (!isProjetStatut(statut)) return { error: "État inconnu.", ok: null };

  const composanteId = await composanteDuBloc(id);
  if (!composanteId) return { error: "Entrée introuvable.", ok: null };

  const coverMediaId = optionnel(texte(formData, "coverMediaId"));

  await db().composanteBloc.update({
    where: { id },
    data: {
      status: statut,
      position: entier(formData, "position"),
      reference: optionnel(texte(formData, "reference")),
      sigle: optionnel(texte(formData, "sigle").toUpperCase()),
      slug: optionnel(slugify(texte(formData, "slug"))),
      montant: decimalOptionnel(formData, "montant"),
      cible: optionnel(texte(formData, "cible").toUpperCase()),
      coverMediaId,
      coverKey: coverMediaId ? null : optionnel(texte(formData, "coverKey")),
    },
  });

  revalidatePath(`${COMPOSANTES_PATH}/${composanteId}`);
  revaliderProjet();
  return { error: null, ok: "Entrée enregistrée." };
}

/** Déplace un bloc d'un rang dans sa propre liste. */
export async function deplacerBlocAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  const sens = texte(formData, "sens") === "bas" ? 1 : -1;

  const bloc = await db().composanteBloc.findUnique({
    where: { id },
    select: { id: true, composanteId: true, type: true, position: true },
  });
  if (!bloc) return { error: "Entrée introuvable.", ok: null };

  /* L'échange se fait avec le VOISIN de même type, et non avec la position
     calculée : les positions peuvent comporter des trous après suppressions, et
     décrémenter à l'aveugle ferait sur-place. */
  const voisin = await db().composanteBloc.findFirst({
    where: {
      composanteId: bloc.composanteId,
      type: bloc.type,
      position: sens < 0 ? { lt: bloc.position } : { gt: bloc.position },
    },
    orderBy: { position: sens < 0 ? "desc" : "asc" },
    select: { id: true, position: true },
  });
  if (!voisin) return { error: null, ok: null };

  await db().$transaction([
    db().composanteBloc.update({ where: { id: bloc.id }, data: { position: voisin.position } }),
    db().composanteBloc.update({ where: { id: voisin.id }, data: { position: bloc.position } }),
  ]);

  revalidatePath(`${COMPOSANTES_PATH}/${bloc.composanteId}`);
  revaliderProjet();
  return { error: null, ok: null };
}

export async function supprimerBlocAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  const composanteId = await composanteDuBloc(id);
  if (!composanteId) return { error: "Entrée introuvable.", ok: null };

  await db().composanteBloc.delete({ where: { id } });
  await oublierTraductions("composanteBloc", id);

  revalidatePath(`${COMPOSANTES_PATH}/${composanteId}`);
  revaliderProjet();
  return { error: null, ok: "Entrée supprimée." };
}

function lireTraductionBloc(formData: FormData) {
  return {
    titre: optionnel(texte(formData, "titre")),
    texte: optionnel(texte(formData, "texte")),
    texteSecondaire: optionnel(texte(formData, "texteSecondaire")),
    paragraphes: lireLignes(formData, "paragraphes"),
    puces: lireLignes(formData, "puces"),
  };
}

/** Enregistre UNE langue d'UN bloc, et elle seule. */
export async function enregistrerBlocLangueAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  const acteur = await assertPermission("projet");

  const blocId = texte(formData, "blocId");
  const locale = lireLocale(formData);
  if (!blocId) return { error: "Entrée introuvable.", ok: null };
  if (!locale) return { error: "Langue inconnue.", ok: null };

  const bloc = await db().composanteBloc.findUnique({
    where: { id: blocId },
    select: { composanteId: true, type: true },
  });
  if (!bloc) return { error: "Entrée introuvable.", ok: null };

  const valeurs = lireTraductionBloc(formData);
  if (!blocTraduit(bloc.type as ComposanteBlocType, valeurs)) {
    return {
      error: "Renseignez les champs requis par ce type d'entrée. Pour retirer cette langue, utilisez « Supprimer cette traduction ».",
      ok: null,
    };
  }

  await db().composanteBlocTranslation.upsert({
    where: { blocId_locale: { blocId, locale } },
    update: valeurs,
    create: { blocId, locale, ...valeurs },
  });

  await apresEnregistrementLangue("composanteBloc", blocId, locale, acteur.id);

  revalidatePath(`${COMPOSANTES_PATH}/${bloc.composanteId}`);
  revaliderProjet();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} enregistrée.` };
}

export async function supprimerBlocLangueAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const blocId = texte(formData, "blocId");
  const locale = lireLocale(formData);
  if (!blocId || !locale) return { error: "Traduction introuvable.", ok: null };

  const composanteId = await composanteDuBloc(blocId);
  if (!composanteId) return { error: "Entrée introuvable.", ok: null };

  await db().composanteBlocTranslation.deleteMany({ where: { blocId, locale } });
  await oublierTraductions("composanteBloc", blocId, locale);

  revalidatePath(`${COMPOSANTES_PATH}/${composanteId}`);
  revaliderProjet();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} supprimée.` };
}

/* -------------------------------------------------------------------------- */
/* Cadre de résultats                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Ajoute un indicateur vide dans une famille.
 *
 * La clé est dérivée de la famille et d'un rang libre : elle n'est jamais
 * affichée, et sert d'ancrage à l'amorçage comme au repérage en base.
 */
export async function ajouterIndicateurAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const famille = texte(formData, "famille");
  if (!isIndicateurFamille(famille)) return { error: "Famille inconnue.", ok: null };

  const dernier = await db().indicateur.findFirst({
    where: { famille },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const prefixe = famille === "ODP" ? "ODP" : "INTER";
  const prises = new Set(
    (await db().indicateur.findMany({
      where: { key: { startsWith: prefixe } },
      select: { key: true },
    })).map((row) => row.key),
  );
  let rang = 1;
  while (prises.has(`${prefixe}-${rang}`)) rang += 1;

  await db().indicateur.create({
    data: {
      key: `${prefixe}-${rang}`,
      famille,
      // Le code est affiché pour les seuls ODP : le dessin des intermédiaires
      // n'en montre pas.
      code: famille === "ODP" ? `ODP-${rang}` : null,
      status: "DRAFT",
      position: (dernier?.position ?? -1) + 1,
      valeur: "",
    },
    select: { id: true },
  });

  revalidatePath(RESULTATS_PATH);
  revaliderProjet();
  return { error: null, ok: "Indicateur ajouté. Renseignez-le puis publiez-le." };
}

/** Réglages non linguistiques d'un indicateur. */
export async function enregistrerIndicateurAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  if (!id) return { error: "Indicateur introuvable.", ok: null };

  const statut = texte(formData, "status");
  if (!isProjetStatut(statut)) return { error: "État inconnu.", ok: null };

  const indicateur = await db().indicateur.findUnique({
    where: { id },
    select: { id: true, famille: true, translations: { select: { label: true } } },
  });
  if (!indicateur) return { error: "Indicateur introuvable.", ok: null };

  const valeur = texte(formData, "valeur");
  if (statut === "PUBLISHED" && !valeur) {
    return { error: "Renseignez la valeur affichée avant de publier.", ok: null };
  }
  if (statut === "PUBLISHED" && !indicateur.translations.some((tr) => indicateurTraduit(tr))) {
    return {
      error: "Aucune langue renseignée : donnez le libellé dans au moins une langue avant de publier.",
      ok: null,
    };
  }

  try {
    await db().indicateur.update({
      where: { id },
      data: {
        status: statut,
        position: entier(formData, "position"),
        code: optionnel(texte(formData, "code").toUpperCase()),
        valeur,
        valeurNum: entierOptionnel(formData, "valeurNum"),
      },
    });
  } catch (error) {
    if (estDoublon(error)) {
      return { error: "Ce code est déjà porté par un autre indicateur.", ok: null };
    }
    throw error;
  }

  revalidatePath(RESULTATS_PATH);
  revaliderProjet();
  return { error: null, ok: "Indicateur enregistré." };
}

export async function supprimerIndicateurAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  const indicateur = await db().indicateur.findUnique({ where: { id }, select: { code: true } });
  if (!indicateur) return { error: "Indicateur introuvable.", ok: null };

  /* Un indicateur rattaché à une composante disparaîtrait de sa page sans
     prévenir : la console dit lesquelles plutôt que de laisser une grille se
     vider en silence. */
  if (indicateur.code) {
    const rattachees = await db().composante.findMany({
      where: { odpCodes: { has: indicateur.code } },
      select: { code: true },
    });
    if (rattachees.length > 0) {
      return {
        error: `Cet indicateur est rattaché à ${rattachees.map((row) => row.code).join(", ")}. Détachez-le de ces composantes avant de le supprimer.`,
        ok: null,
      };
    }
  }

  await db().indicateur.delete({ where: { id } });
  await oublierTraductions("indicateur", id);

  revalidatePath(RESULTATS_PATH);
  revaliderProjet();
  return { error: null, ok: "Indicateur supprimé." };
}

function lireTraductionIndicateur(formData: FormData) {
  return {
    label: optionnel(texte(formData, "label")),
    baseline: optionnel(texte(formData, "baseline")),
    note: optionnel(texte(formData, "note")),
    /* « millions » et « jours » se traduisent, « km » et « kbit/s » se
       recopient : dans les deux cas, c'est un libellé de langue. */
    unit: optionnel(texte(formData, "unit")),
  };
}

/** Enregistre UNE langue d'UN indicateur, et elle seule. */
export async function enregistrerIndicateurLangueAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  const acteur = await assertPermission("projet");

  const indicateurId = texte(formData, "indicateurId");
  const locale = lireLocale(formData);
  if (!indicateurId) return { error: "Indicateur introuvable.", ok: null };
  if (!locale) return { error: "Langue inconnue.", ok: null };

  const valeurs = lireTraductionIndicateur(formData);
  if (!indicateurTraduit(valeurs)) {
    return { error: "Renseignez le libellé : c'est lui qui dit ce que le chiffre mesure.", ok: null };
  }

  await db().indicateurTranslation.upsert({
    where: { indicateurId_locale: { indicateurId, locale } },
    update: valeurs,
    create: { indicateurId, locale, ...valeurs },
  });

  await apresEnregistrementLangue("indicateur", indicateurId, locale, acteur.id);

  revalidatePath(RESULTATS_PATH);
  revaliderProjet();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} enregistrée.` };
}

/** Déplace un indicateur d'un rang dans sa famille. */
export async function deplacerIndicateurAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  const sens = texte(formData, "sens") === "bas" ? 1 : -1;

  const indicateur = await db().indicateur.findUnique({
    where: { id },
    select: { id: true, famille: true, position: true },
  });
  if (!indicateur) return { error: "Indicateur introuvable.", ok: null };

  const voisin = await db().indicateur.findFirst({
    where: {
      famille: indicateur.famille,
      position: sens < 0 ? { lt: indicateur.position } : { gt: indicateur.position },
    },
    orderBy: { position: sens < 0 ? "desc" : "asc" },
    select: { id: true, position: true },
  });
  if (!voisin) return { error: null, ok: null };

  await db().$transaction([
    db().indicateur.update({ where: { id: indicateur.id }, data: { position: voisin.position } }),
    db().indicateur.update({ where: { id: voisin.id }, data: { position: indicateur.position } }),
  ]);

  revalidatePath(RESULTATS_PATH);
  revaliderProjet();
  return { error: null, ok: null };
}

/** Publie ou retire un indicateur, sans quitter l'écran. */
export async function basculerIndicateurAction(
  _prev: ProjetFormState,
  formData: FormData,
): Promise<ProjetFormState> {
  await assertPermission("projet");

  const id = texte(formData, "id");
  const indicateur = await db().indicateur.findUnique({
    where: { id },
    select: { status: true, valeur: true, translations: { select: { label: true } } },
  });
  if (!indicateur) return { error: "Indicateur introuvable.", ok: null };

  const enLigne = indicateur.status === "PUBLISHED";
  if (!enLigne) {
    if (!indicateur.valeur.trim()) {
      return { error: "Renseignez la valeur affichée avant de publier.", ok: null };
    }
    if (!indicateur.translations.some((tr) => indicateurTraduit(tr))) {
      return { error: "Donnez le libellé dans au moins une langue avant de publier.", ok: null };
    }
  }

  await db().indicateur.update({
    where: { id },
    data: { status: enLigne ? "DRAFT" : "PUBLISHED" },
  });

  revalidatePath(RESULTATS_PATH);
  revaliderProjet();
  return { error: null, ok: enLigne ? "Indicateur retiré du site." : "Indicateur publié." };
}
