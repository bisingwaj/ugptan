"use server";

/**
 * Écritures du module « Événements ».
 *
 * ⚠️ INVARIANT : chaque action commence par `assertPermission("evenements")`.
 * Le proxy laisse passer les POST (rediriger un POST de server action casserait
 * le protocole Flight), la barrière d'autorisation est donc ici, et nulle part
 * ailleurs.
 *
 * ─── Un formulaire par langue ────────────────────────────────────────────────
 *
 * Même dispositif que les actualités, et pour la même raison : la fiche et les
 * traductions s'enregistrent SÉPARÉMENT.
 *
 *   · `enregistrerFicheEvtAction`       → statut, dates, lieu-modalité, visuel,
 *                                         organisateur… ce qui appartient à
 *                                         l'événement, pas à une langue ;
 *   · `enregistrerTraductionEvtAction`  → UNE langue : titre, slug, lieu,
 *                                         description, informations, SEO.
 *
 * Avec un envoi unique portant les deux langues, l'écran du traducteur
 * réécrirait AUSSI la langue d'origine telle qu'il l'a chargée : toute
 * correction faite entre-temps par le rédacteur serait écrasée sans que
 * personne ne le voie.
 *
 * Corollaire sur les noms de champs : ils ne sont PAS préfixés par la langue
 * (`title`, et non `fr_title`). Le formulaire porte sa langue dans un champ
 * `locale`, ce qui rend impossible la confusion de préfixe.
 *
 * Trois règles de cohérence, vérifiées côté serveur :
 *   1. la description est ASSAINIE avant écriture — l'éditeur envoie du HTML
 *      produit par le navigateur de l'auteur, jamais une donnée de confiance ;
 *   2. une date de début est exigée, et une fin ne peut pas précéder son début ;
 *   3. rien ne se publie sans une langue complète (titre + lieu) EN BASE, ce qui
 *      se vérifie sur l'événement relu et non sur le formulaire soumis.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertPermission } from "@/lib/auth/guard";
import { adminPath } from "@/lib/admin";
import { LOCALES } from "@/lib/params";
import type { Lang } from "@/lib/pick";
import { isEmptyHtml, safeUrl, sanitizeHtml } from "@/lib/html/sanitize";
import { fromDateTimeLocal } from "@/lib/format";
import { slugify, uniqueSlug } from "@/lib/actus/slug";
import { isEvenementMode, isEvenementStatut } from "@/lib/events/statut";
import { INSCRIPTION_LABEL, isInscriptionStatut } from "@/lib/events/inscription";
import { revaliderEvenements } from "@/lib/events/cache";
import { composantes } from "@/content/data";

/** État partagé par tous les formulaires du module. */
export type EvtFormState = { error: string | null; ok: string | null };

const EVTS_PATH = adminPath("/events");
const CATEGORIES_PATH = adminPath("/events/categories");

const CODES_COMPOSANTE = new Set(composantes.map((c) => c.code));

/** Nom des langues dans les messages rendus à l'utilisateur. */
const LANGUE_LABEL: Record<Lang, string> = { fr: "française", en: "anglaise" };

/** Code Prisma d'une violation de contrainte d'unicité. */
const UNIQUE_VIOLATION = "P2002";

const estDoublon = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: string }).code === UNIQUE_VIOLATION;

/* -------------------------------------------------------------------------- */
/* Lecture du formulaire                                                       */
/* -------------------------------------------------------------------------- */

const texte = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();
const optionnel = (value: string): string | null => (value.length ? value : null);
const coche = (formData: FormData, key: string): boolean =>
  formData.get(key) === "on" || formData.get(key) === "1";

/**
 * Adresse saisie dans un champ de lien.
 *
 * `safeUrl` est celui de l'assainisseur HTML : il n'accepte que http(s), mailto
 * et tel, donc un `javascript:` collé dans « lien d'inscription » ne peut pas
 * ressortir en attribut `href` sur la page publique.
 */
const lien = (formData: FormData, key: string): string | null => {
  const brut = texte(formData, key);
  return brut ? safeUrl(brut) : null;
};

/** Couleur d'accent : hexadécimal à 6 chiffres, ou rien. */
function lireCouleur(value: string): string | null {
  const couleur = value.trim().toLowerCase();
  if (!couleur) return null;
  return /^#[0-9a-f]{6}$/.test(couleur) ? couleur : null;
}

/** Langue portée par le formulaire, ou `null` si elle n'est pas servie par le site. */
function lireLocale(formData: FormData): Lang | null {
  const brut = texte(formData, "locale");
  return (LOCALES as string[]).includes(brut) ? (brut as Lang) : null;
}

/** Contenu d'UNE langue, tel que soumis par son formulaire. */
type TraductionEvt = {
  title: string;
  slug: string;
  excerpt: string | null;
  contentHtml: string;
  lieu: string | null;
  adresse: string | null;
  places: string | null;
  infos: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  coverAlt: string | null;
};

function lireTraduction(formData: FormData): TraductionEvt {
  const title = texte(formData, "title");
  // La description est assainie ICI, à la frontière : tout ce qui descend plus
  // bas est réputé sûr, y compris ce que l'éditeur relira ensuite.
  const contentHtml = sanitizeHtml(String(formData.get("content") ?? ""));

  return {
    title,
    slug: slugify(texte(formData, "slug") || title),
    excerpt: optionnel(texte(formData, "excerpt")),
    contentHtml: isEmptyHtml(contentHtml) ? "" : contentHtml,
    lieu: optionnel(texte(formData, "lieu")),
    adresse: optionnel(texte(formData, "adresse")),
    places: optionnel(texte(formData, "places")),
    infos: optionnel(texte(formData, "infos")),
    seoTitle: optionnel(texte(formData, "seoTitle")),
    seoDescription: optionnel(texte(formData, "seoDescription")),
    coverAlt: optionnel(texte(formData, "coverAlt")),
  };
}

/**
 * Rend un slug unique DANS SA LANGUE (l'unicité est portée par
 * `@@unique([locale, slug])`), en écartant l'événement courant : réenregistrer
 * une traduction sans toucher au titre ne doit pas transformer `forum-national`
 * en `forum-national-2`.
 */
async function slugUnique(locale: Lang, base: string, evenementId: string | null): Promise<string> {
  const pris = await db().evenementTranslation.findMany({
    where: {
      locale,
      slug: { startsWith: base || "evenement" },
      ...(evenementId ? { evenementId: { not: evenementId } } : {}),
    },
    select: { slug: true },
  });

  return uniqueSlug(base || "evenement", pris.map((row) => row.slug));
}

/** Codes de composante cochés, réduits à ceux qui existent réellement. */
function lireComposantes(formData: FormData): string[] {
  return formData.getAll("comps").map(String).filter((code) => CODES_COMPOSANTE.has(code));
}

/**
 * Dates de l'événement.
 *
 * Le début est TOUJOURS obligatoire, y compris sur un brouillon : c'est la
 * seule donnée qui ordonne le calendrier, et une fiche sans date ne pourrait
 * apparaître nulle part — pas même dans la liste de la console, triée par date.
 *
 * Une fin antérieure au début est refusée plutôt que corrigée en silence : sur
 * un formulaire à deux champs, l'inversion est presque toujours une frappe dans
 * le mauvais champ, et la deviner produirait une durée fausse.
 */
function lireDates(formData: FormData): { startAt: Date; endAt: Date | null } | { error: string } {
  const startAt = fromDateTimeLocal(texte(formData, "startAt"));
  if (!startAt) return { error: "La date et l'heure de début sont obligatoires." };

  const endAt = fromDateTimeLocal(texte(formData, "endAt"));
  if (endAt && endAt.getTime() < startAt.getTime()) {
    return { error: "La fin de l'événement précède son début : vérifiez les deux dates." };
  }

  return { startAt, endAt };
}

/** Champs de la fiche, communs à toutes les langues. */
function lireFiche(formData: FormData) {
  const coverMediaId = optionnel(texte(formData, "coverMediaId"));
  const modeBrut = texte(formData, "mode");

  return {
    allDay: coche(formData, "allDay"),
    featured: coche(formData, "featured"),
    mode: isEvenementMode(modeBrut) ? modeBrut : ("PRESENTIEL" as const),
    color: lireCouleur(texte(formData, "color")),
    comps: lireComposantes(formData),
    categoryId: optionnel(texte(formData, "categoryId")),
    coverMediaId,
    // Une couverture issue de la bibliothèque prime sur une clé du registre :
    // conserver les deux laisserait deux sources de vérité pour un seul visuel.
    coverKey: coverMediaId ? null : optionnel(texte(formData, "coverKey")),
    registrationUrl: lien(formData, "registrationUrl"),
    externalUrl: lien(formData, "externalUrl"),
    onlineUrl: lien(formData, "onlineUrl"),
    organiserName: optionnel(texte(formData, "organiserName")),
    organiserEmail: optionnel(texte(formData, "organiserEmail")),
    organiserPhone: optionnel(texte(formData, "organiserPhone")),
    organiserUrl: lien(formData, "organiserUrl"),
  };
}

/**
 * Une langue est-elle publiable ?
 *
 * Titre ET lieu, et non titre et description : un événement peut être annoncé
 * avant que son programme soit écrit, mais jamais sans dire où il se tient.
 * C'est la même règle que `traductionEvtComplete` (lib/events/edition.ts),
 * répétée ici sur la forme relue en base.
 */
const estComplete = (t: { title: string; lieu: string | null }): boolean =>
  t.title.trim().length > 0 && (t.lieu ?? "").trim().length > 0;

/* -------------------------------------------------------------------------- */
/* Création                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Crée l'événement et sa PREMIÈRE langue.
 *
 * Une seule langue à la création, volontairement : un événement s'annonce dans
 * la langue où il est rédigé. Les autres versions s'ajoutent ensuite, chacune
 * par son propre formulaire, quand le traducteur s'en saisit.
 */
export async function creerEvenementAction(
  _prev: EvtFormState,
  formData: FormData,
): Promise<EvtFormState> {
  const acteur = await assertPermission("evenements");

  const locale = lireLocale(formData);
  if (!locale) return { error: "Langue de rédaction inconnue.", ok: null };

  const statutBrut = texte(formData, "status");
  if (!isEvenementStatut(statutBrut)) return { error: "Statut inconnu.", ok: null };
  const statut = statutBrut;

  const dates = lireDates(formData);
  if ("error" in dates) return { error: dates.error, ok: null };

  const traduction = lireTraduction(formData);
  if (!traduction.title) return { error: "Un titre est requis pour créer l'événement.", ok: null };

  if (statut === "PUBLISHED" && !estComplete(traduction)) {
    return {
      error: "Le lieu est vide : impossible de publier. Renseignez-le, ou enregistrez en brouillon.",
      ok: null,
    };
  }

  const fiche = lireFiche(formData);
  traduction.slug = await slugUnique(locale, traduction.slug, null);

  const evenement = await db().evenement.create({
    data: {
      ...fiche,
      ...dates,
      status: statut,
      createdById: acteur.id,
      translations: { create: [{ locale, ...traduction }] },
    },
    select: { id: true },
  });

  revaliderEvenements();
  // redirect() lève NEXT_REDIRECT : appelé en dernier, hors de tout try/catch.
  redirect(`${EVTS_PATH}/${evenement.id}?cree=1`);
}

/* -------------------------------------------------------------------------- */
/* Fiche (tout sauf les langues)                                               */
/* -------------------------------------------------------------------------- */

export async function enregistrerFicheEvtAction(
  _prev: EvtFormState,
  formData: FormData,
): Promise<EvtFormState> {
  await assertPermission("evenements");

  const id = texte(formData, "id");
  if (!id) return { error: "Événement introuvable.", ok: null };

  const statutBrut = texte(formData, "status");
  if (!isEvenementStatut(statutBrut)) return { error: "Statut inconnu.", ok: null };
  const statut = statutBrut;

  const dates = lireDates(formData);
  if ("error" in dates) return { error: dates.error, ok: null };

  const evenement = await db().evenement.findUnique({
    where: { id },
    select: { id: true, translations: { select: { title: true, lieu: true } } },
  });
  if (!evenement) return { error: "Événement introuvable.", ok: null };

  // La complétude se lit EN BASE et non dans le formulaire : cet envoi ne porte
  // aucune langue, et l'état des traductions a pu changer depuis l'affichage.
  if (statut === "PUBLISHED" && !evenement.translations.some(estComplete)) {
    return {
      error: "Aucune langue complète : renseignez un titre et un lieu dans au moins une langue avant de publier.",
      ok: null,
    };
  }

  await db().evenement.update({
    where: { id },
    data: { ...lireFiche(formData), ...dates, status: statut },
  });

  revalidatePath(`${EVTS_PATH}/${id}`);
  revalidatePath(EVTS_PATH);
  revaliderEvenements();
  return { error: null, ok: "Réglages enregistrés." };
}

/* -------------------------------------------------------------------------- */
/* Traductions                                                                 */
/* -------------------------------------------------------------------------- */

/** Enregistre UNE langue, et elle seule. */
export async function enregistrerTraductionEvtAction(
  _prev: EvtFormState,
  formData: FormData,
): Promise<EvtFormState> {
  await assertPermission("evenements");

  const evenementId = texte(formData, "evenementId");
  const locale = lireLocale(formData);
  if (!evenementId) return { error: "Événement introuvable.", ok: null };
  if (!locale) return { error: "Langue inconnue.", ok: null };

  const evenement = await db().evenement.findUnique({ where: { id: evenementId }, select: { id: true } });
  if (!evenement) return { error: "Événement introuvable.", ok: null };

  const traduction = lireTraduction(formData);
  if (!traduction.title) {
    return {
      error: "Le titre est obligatoire. Pour retirer cette langue du site, utilisez « Supprimer cette traduction ».",
      ok: null,
    };
  }

  traduction.slug = await slugUnique(locale, traduction.slug, evenementId);

  await db().evenementTranslation.upsert({
    where: { evenementId_locale: { evenementId, locale } },
    update: traduction,
    create: { evenementId, locale, ...traduction },
  });

  revaliderEvenements();

  const incomplete = traduction.lieu
    ? ""
    : " Le lieu est encore vide : cette langue ne sera pas servie au public.";
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} enregistrée.${incomplete}` };
}

/**
 * Retire une langue.
 *
 * C'est le seul geste qui fait disparaître un événement d'une version du site.
 * Refusé s'il ne reste qu'elle sur un événement publié : la page publique
 * n'aurait plus rien à servir dans aucune langue.
 */
export async function supprimerTraductionEvtAction(
  _prev: EvtFormState,
  formData: FormData,
): Promise<EvtFormState> {
  await assertPermission("evenements");

  const evenementId = texte(formData, "evenementId");
  const locale = lireLocale(formData);
  if (!evenementId || !locale) return { error: "Traduction introuvable.", ok: null };

  const evenement = await db().evenement.findUnique({
    where: { id: evenementId },
    select: { status: true, translations: { select: { locale: true } } },
  });
  if (!evenement) return { error: "Événement introuvable.", ok: null };

  const autres = evenement.translations.filter((t) => t.locale !== locale);

  if (evenement.status === "PUBLISHED" && autres.length === 0) {
    return {
      error: "C'est la seule langue de cet événement publié : dépubliez-le d'abord, ou ajoutez une autre langue.",
      ok: null,
    };
  }

  await db().evenementTranslation.deleteMany({ where: { evenementId, locale } });

  revaliderEvenements();
  return { error: null, ok: `Version ${LANGUE_LABEL[locale]} supprimée.` };
}

/* -------------------------------------------------------------------------- */
/* Actions rapides                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Bascule publication / retrait depuis la liste.
 *
 * Le retrait choisit `DRAFT` et non `ARCHIVED` : dépublier, c'est reprendre la
 * main sur une annonce, pas la clore. L'archivage reste un geste explicite,
 * posé depuis la fiche.
 */
export async function basculerPublicationEvtAction(
  _prev: EvtFormState,
  formData: FormData,
): Promise<EvtFormState> {
  await assertPermission("evenements");

  const id = texte(formData, "id");
  if (!id) return { error: "Événement introuvable.", ok: null };

  const evenement = await db().evenement.findUnique({
    where: { id },
    select: { status: true, translations: { select: { title: true, lieu: true } } },
  });
  if (!evenement) return { error: "Événement introuvable.", ok: null };

  const enLigne = evenement.status === "PUBLISHED";

  if (!enLigne && !evenement.translations.some(estComplete)) {
    return { error: "Aucune langue complète : renseignez un titre et un lieu avant de publier.", ok: null };
  }

  await db().evenement.update({ where: { id }, data: { status: enLigne ? "DRAFT" : "PUBLISHED" } });

  // ⚠️ La FICHE de la console est revalidée, pas seulement le site public.
  // Le sélecteur « État » des réglages vit sur la même page que ce bouton : sans
  // cette ligne, il ne reçoit jamais la nouvelle valeur et continue de renvoyer
  // l'ancienne au premier enregistrement (cf. EvtReglagesChamps, qui se recale
  // sur la prop). Les deux corrections vont ensemble — l'une donne la valeur
  // fraîche, l'autre la prend en compte.
  revalidatePath(`${EVTS_PATH}/${id}`);
  revalidatePath(EVTS_PATH);
  revaliderEvenements();
  return { error: null, ok: enLigne ? "Événement dépublié." : "Événement publié." };
}

/**
 * Duplication : la copie repart en brouillon, avec des slugs neufs et la même
 * date. C'est le geste courant de la série (« Consultation publique — Sud-Kivu »
 * après « Nord-Kivu ») : on reprend la structure, pas l'identité. Toutes les
 * langues sont copiées, traduire deux fois le même modèle n'aurait pas de sens.
 */
export async function dupliquerEvenementAction(
  _prev: EvtFormState,
  formData: FormData,
): Promise<EvtFormState> {
  const acteur = await assertPermission("evenements");

  const id = texte(formData, "id");
  if (!id) return { error: "Événement introuvable.", ok: null };

  const source = await db().evenement.findUnique({ where: { id }, include: { translations: true } });
  if (!source) return { error: "Événement introuvable.", ok: null };

  const copies: ({ locale: string } & TraductionEvt)[] = [];
  for (const tr of source.translations) {
    if (!(LOCALES as string[]).includes(tr.locale)) continue;
    copies.push({
      locale: tr.locale,
      title: `${tr.title} (copie)`,
      slug: await slugUnique(tr.locale as Lang, slugify(`${tr.slug}-copie`), null),
      excerpt: tr.excerpt,
      contentHtml: tr.contentHtml,
      lieu: tr.lieu,
      adresse: tr.adresse,
      places: tr.places,
      infos: tr.infos,
      seoTitle: tr.seoTitle,
      seoDescription: tr.seoDescription,
      coverAlt: tr.coverAlt,
    });
  }

  const copie = await db().evenement.create({
    data: {
      status: "DRAFT",
      startAt: source.startAt,
      endAt: source.endAt,
      allDay: source.allDay,
      mode: source.mode,
      featured: false,
      color: source.color,
      categoryId: source.categoryId,
      coverMediaId: source.coverMediaId,
      coverKey: source.coverKey,
      registrationUrl: source.registrationUrl,
      externalUrl: source.externalUrl,
      onlineUrl: source.onlineUrl,
      organiserName: source.organiserName,
      organiserEmail: source.organiserEmail,
      organiserPhone: source.organiserPhone,
      organiserUrl: source.organiserUrl,
      comps: source.comps,
      createdById: acteur.id,
      translations: { create: copies },
    },
    select: { id: true },
  });

  revaliderEvenements();
  redirect(`${EVTS_PATH}/${copie.id}?copie=1`);
}

export async function supprimerEvenementAction(
  _prev: EvtFormState,
  formData: FormData,
): Promise<EvtFormState> {
  await assertPermission("evenements");

  const id = texte(formData, "id");
  if (!id) return { error: "Événement introuvable.", ok: null };

  const existe = await db().evenement.findUnique({ where: { id }, select: { id: true } });
  if (!existe) return { error: "Événement introuvable.", ok: null };

  // Les traductions tombent en cascade (cf. schéma).
  await db().evenement.delete({ where: { id } });

  revaliderEvenements();
  redirect(`${EVTS_PATH}?supprime=1`);
}

/* -------------------------------------------------------------------------- */
/* Catégories                                                                  */
/* -------------------------------------------------------------------------- */

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

export async function enregistrerCategorieEvtAction(
  _prev: EvtFormState,
  formData: FormData,
): Promise<EvtFormState> {
  await assertPermission("evenements");

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
    if (id) await db().evenementCategory.update({ where: { id }, data: donnees });
    else await db().evenementCategory.create({ data: donnees });
  } catch (error) {
    if (estDoublon(error)) return { error: "Cet identifiant d'URL est déjà pris par une autre catégorie.", ok: null };
    throw error;
  }

  revalidatePath(CATEGORIES_PATH);
  revaliderEvenements();
  return { error: null, ok: id ? "Catégorie mise à jour." : `Catégorie « ${libelles.nomFr} » créée.` };
}

/**
 * Suppression d'une catégorie.
 *
 * Les événements ne sont PAS supprimés : leur rattachement passe à `null`
 * (`onDelete: SetNull` au schéma). On l'annonce plutôt que de le laisser
 * découvrir — une fiche qui perd sa pastille sans explication ressemble à une
 * perte de données.
 */
export async function supprimerCategorieEvtAction(
  _prev: EvtFormState,
  formData: FormData,
): Promise<EvtFormState> {
  await assertPermission("evenements");

  const id = texte(formData, "id");
  if (!id) return { error: "Catégorie introuvable.", ok: null };

  const categorie = await db().evenementCategory.findUnique({
    where: { id },
    select: { nomFr: true, _count: { select: { evenements: true } } },
  });
  if (!categorie) return { error: "Catégorie introuvable.", ok: null };

  await db().evenementCategory.delete({ where: { id } });

  revalidatePath(CATEGORIES_PATH);
  revaliderEvenements();

  const orphelins = categorie._count.evenements;
  return {
    error: null,
    ok: orphelins > 0
      ? `Catégorie « ${categorie.nomFr} » supprimée. ${orphelins} événement(s) sont désormais sans catégorie.`
      : `Catégorie « ${categorie.nomFr} » supprimée.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Inscriptions                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Arbitrage d'une demande de participation.
 *
 * ⚠️ La console est le SEUL endroit qui touche à ces lignes : elles portent des
 * données personnelles collectées sans compte, et rien du site public n'y
 * accède (cf. le commentaire du modèle `EvenementInscription`).
 *
 * Aucune notification n'est envoyée d'ici. Confirmer une place et prévenir la
 * personne sont deux gestes distincts, et le second suppose un service de
 * courriel que le projet n'a pas encore : le faire croire serait pire que de ne
 * pas le faire.
 */
export async function statuerInscriptionAction(
  _prev: EvtFormState,
  formData: FormData,
): Promise<EvtFormState> {
  await assertPermission("evenements");

  const id = texte(formData, "id");
  const statut = texte(formData, "statut");
  if (!id) return { error: "Demande introuvable.", ok: null };
  if (!isInscriptionStatut(statut)) return { error: "État inconnu.", ok: null };

  const inscription = await db().evenementInscription.findUnique({
    where: { id },
    select: { nom: true, evenementId: true },
  });
  if (!inscription) return { error: "Demande introuvable.", ok: null };

  await db().evenementInscription.update({
    where: { id },
    data: { statut, note: optionnel(texte(formData, "note")) },
  });

  revalidatePath(`${EVTS_PATH}/${inscription.evenementId}/inscriptions`);
  return { error: null, ok: `Demande de ${inscription.nom} : ${INSCRIPTION_LABEL[statut]}.` };
}

/**
 * Suppression définitive d'une demande.
 *
 * Distincte de l'annulation : annuler conserve la trace du passage de la
 * personne, supprimer l'efface. Le second geste existe pour honorer une
 * demande d'effacement, pas pour faire le ménage — d'où la confirmation côté
 * console et l'absence de suppression en lot.
 */
export async function supprimerInscriptionAction(
  _prev: EvtFormState,
  formData: FormData,
): Promise<EvtFormState> {
  await assertPermission("evenements");

  const id = texte(formData, "id");
  if (!id) return { error: "Demande introuvable.", ok: null };

  const inscription = await db().evenementInscription.findUnique({
    where: { id },
    select: { nom: true, evenementId: true },
  });
  if (!inscription) return { error: "Demande introuvable.", ok: null };

  await db().evenementInscription.delete({ where: { id } });

  revalidatePath(`${EVTS_PATH}/${inscription.evenementId}/inscriptions`);
  return { error: null, ok: `Demande de ${inscription.nom} supprimée.` };
}
