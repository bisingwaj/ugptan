"use server";

/**
 * Dépôt et suivi d'une plainte — côté PUBLIC, donc sans aucune authentification.
 *
 * Deux principes gouvernent ce fichier :
 *
 *   1. Ce qui entre est une proposition. Toute donnée du formulaire est
 *      revalidée ici : le navigateur n'est pas une frontière de confiance.
 *   2. Ce qui sort est minimal. `trackGrievance` ne renvoie QUE les champs
 *      énumérés dans `PublicCase`. La description, l'identité, les coordonnées,
 *      les notes internes, la priorité et l'agent affecté ne quittent jamais la
 *      console — le numéro de référence est un justificatif, pas une session.
 */
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { isValidEmail } from "@/lib/auth/validate";
import { mgpCategory } from "@/content/mgp";
import { LANGS, pick, type Lang } from "@/lib/pick";
import { NAV, route } from "@/lib/routes";
import { APP_ORIGIN, emailConfigured } from "@/lib/email/config";
import { sendEmail } from "@/lib/email/send";
import { grievanceReceiptEmail } from "@/lib/email/templates/grievance-receipt";
import {
  LIMITS,
  daysUntil,
  dueDateFrom,
  isClosingStatus,
  isValidReference,
  normalizeReference,
  type GrievanceStage,
  type GrievanceStatus,
} from "@/lib/mgp/model";
import { uniqueReference } from "@/lib/mgp/reference";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { ecrituresSuspendues } from "@/lib/reglages/maintenance";

/* --- Dépôt ---------------------------------------------------------------- */

export type GrievanceDraft = {
  category: string;
  description: string;
  /** Facultatif : vide vaut dépôt anonyme. */
  fullName: string;
  email: string;
  phone: string;
  province: string;
  lang: string;
  attachments: { name: string; size: number }[];
};

export type SubmitResult =
  /** `notified` : l'accusé de réception est bien parti à l'adresse saisie. Faux
   *  dès qu'aucune adresse n'a été donnée, que l'envoi n'est pas configuré ou
   *  qu'il a échoué — l'écran de confirmation ne promet alors pas d'e-mail. */
  | { ok: true; reference: string; submittedAt: string; notified: boolean }
  | { ok: false; error: string };

/** Un dépôt légitime demande plusieurs minutes de saisie : cinq par quart
 *  d'heure laissent de la marge à une personne qui se reprend, et coupent court
 *  à l'envoi automatisé. */
const SUBMIT_LIMIT = 5;
const SUBMIT_WINDOW_MS = 15 * 60 * 1000;

const clean = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";

/** Le corps du récit garde ses retours à la ligne : seuls les blancs de bord partent. */
const cleanText = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const asLangCode = (value: unknown): Lang =>
  LANGS.includes(value as Lang) ? (value as Lang) : "fr";

export async function submitGrievance(draft: GrievanceDraft): Promise<SubmitResult> {
  const lang = asLangCode(draft?.lang);
  const t = (fr: string, en: string) => (lang === "en" ? en : fr);

  /* Site fermé : le dossier ne s'ouvre pas. Le formulaire n'est plus affiché,
     mais un onglet resté ouvert avant la fermeture poste encore ici, et une
     plainte déposée au milieu d'une migration se perdrait sans que personne ne
     le sache. Le refus dit où revenir. */
  if (await ecrituresSuspendues()) {
    return {
      ok: false,
      error: t(
        "Le portail est momentanément fermé pour intervention technique. Votre plainte n'a pas été enregistrée : reprenez le dépôt à la réouverture, ou écrivez à info@ugptn.cd.",
        "The portal is temporarily closed for technical work. Your grievance has not been recorded: please file it again once the site reopens, or write to info@ugptn.cd.",
      ),
    };
  }

  const limit = rateLimit(`mgp:submit:${requestIp(await headers())}`, SUBMIT_LIMIT, SUBMIT_WINDOW_MS);
  if (!limit.allowed) {
    return {
      ok: false,
      error: t(
        "Trop de dépôts successifs depuis cette connexion. Réessayez dans quelques minutes, ou passez par le numéro vert.",
        "Too many successive submissions from this connection. Try again in a few minutes, or use the toll-free number.",
      ),
    };
  }

  // L'entrée entière, et non son seul code : l'accusé de réception nomme la
  // catégorie dans la langue du dépôt, la base ne stocke que le code.
  const categoryEntry = mgpCategory(clean(draft?.category, 60));
  if (!categoryEntry) {
    return { ok: false, error: t("Choisissez une catégorie.", "Choose a category.") };
  }
  const category = categoryEntry.code;

  const description = cleanText(draft?.description, LIMITS.description);
  if (description.length < LIMITS.descriptionMin) {
    return {
      ok: false,
      error: t(
        `Décrivez les faits en ${LIMITS.descriptionMin} caractères au minimum : sans récit, la plainte ne peut pas être instruite.`,
        `Describe the facts in at least ${LIMITS.descriptionMin} characters: without an account, the grievance cannot be investigated.`,
      ),
    };
  }

  // Le nom seul décide de l'anonymat : une personne peut vouloir être
  // recontactée sans se nommer, et cela reste un dépôt anonyme.
  const fullName = clean(draft?.fullName, LIMITS.fullName) || null;
  const email = clean(draft?.email, LIMITS.email).toLowerCase() || null;
  const phone = clean(draft?.phone, LIMITS.phone) || null;
  const province = clean(draft?.province, LIMITS.province) || null;

  if (email && !isValidEmail(email)) {
    return {
      ok: false,
      error: t(
        "L'adresse électronique saisie est invalide. Corrigez-la ou laissez le champ vide.",
        "The email address is invalid. Correct it or leave the field empty.",
      ),
    };
  }

  const attachments = (Array.isArray(draft?.attachments) ? draft.attachments : [])
    .slice(0, LIMITS.attachments)
    .map((file) => ({
      name: clean(file?.name, LIMITS.attachmentName) || "document",
      sizeKb: Number.isFinite(file?.size) ? Math.max(0, Math.round(Number(file.size))) : 0,
    }));

  const submittedAt = new Date();

  try {
    const reference = await uniqueReference(
      async (candidate) =>
        (await db().grievance.count({ where: { reference: candidate } })) > 0,
      submittedAt.getFullYear(),
    );

    const created = await db().grievance.create({
      select: { id: true },
      data: {
        reference,
        category,
        description,
        fullName,
        email,
        phone,
        province,
        lang,
        isAnonymous: fullName === null,
        submittedAt,
        dueAt: dueDateFrom(submittedAt),
        attachments: { create: attachments },
        // Première ligne de l'historique : le dossier n'existe jamais sans elle.
        events: {
          create: {
            type: "DEPOT",
            isPublic: true,
            message: "Plainte reçue par le formulaire du site public.",
            toValue: "NOUVELLE",
            authorLabel: "Site public",
          },
        },
      },
    });

    const notified = await sendReceipt({
      grievanceId: created.id,
      reference,
      lang,
      email,
      categoryLabel: pick(categoryEntry, lang),
      description,
      fullName,
      phone,
      province,
      attachments,
      submittedAt,
    });

    return { ok: true, reference, submittedAt: submittedAt.toISOString(), notified };
  } catch (error) {
    // Le détail technique reste au serveur : il n'apprendrait rien d'utile à la
    // personne, et pourrait décrire l'infrastructure.
    console.error("[mgp] échec de l'enregistrement d'une plainte", error);
    return {
      ok: false,
      error: t(
        "L'enregistrement a échoué. Réessayez dans un instant ; si le problème persiste, utilisez le numéro vert ou un point focal provincial.",
        "Registration failed. Try again shortly; if the problem persists, use the toll-free number or a provincial focal point.",
      ),
    };
  }
}

/* --- Accusé de réception -------------------------------------------------- */

/**
 * Renvoie à la personne son numéro de référence et le contenu de son dépôt,
 * dès lors qu'elle a laissé une adresse.
 *
 * ⚠️ NE LÈVE JAMAIS. Quand cette fonction s'exécute, la plainte est déjà écrite
 * en base : une erreur qui remonterait ferait afficher « l'enregistrement a
 * échoué » pour un dossier bel et bien ouvert, et la personne redéposerait.
 * Tout incident finit donc au journal serveur, et le formulaire se borne à ne
 * rien promettre.
 *
 * Envoi ATTENDU, et non lancé en arrière-plan : sur un hébergement sans état,
 * une promesse encore en vol au retour de l'action est interrompue avec
 * l'invocation. Le dépôt coûte quelques centaines de millisecondes de plus,
 * l'accusé part réellement.
 */
async function sendReceipt(params: {
  grievanceId: string;
  reference: string;
  lang: Lang;
  email: string | null;
  categoryLabel: string;
  description: string;
  fullName: string | null;
  phone: string | null;
  province: string | null;
  attachments: { name: string; sizeKb: number }[];
  submittedAt: Date;
}): Promise<boolean> {
  const { grievanceId, email, lang, reference, submittedAt, ...rest } = params;

  // Dépôt sans adresse, ou envoi non configuré (cf. lib/email/config.ts) :
  // aucun des deux n'est une anomalie, il n'y a rien à journaliser.
  if (!email || !emailConfigured) return false;

  try {
    const sent = await sendEmail(
      grievanceReceiptEmail({
        ...rest,
        reference,
        lang,
        email,
        submittedAt,
        dueAt: dueDateFrom(submittedAt),
        // Numéro pré-rempli : le lien ouvre le dossier sans une seule saisie.
        trackUrl: `${APP_ORIGIN}${route(lang, NAV.mgpSuivi)}?ref=${encodeURIComponent(reference)}`,
      }),
    );
    if (!sent.ok) return false;
  } catch (error) {
    // `sendEmail` avale déjà ses erreurs ; reste la composition du message.
    console.error("[mgp] échec de l'accusé de réception", error);
    return false;
  }

  /* Trace au dossier. L'agent qui l'ouvre voit que la personne détient déjà son
     numéro et le détail de son dépôt — il ne le lui redemande pas. Événement
     interne : le suivi public n'a pas à rappeler au plaignant ce qu'il a reçu.
     Son échec ne retire rien à l'envoi, qui a bien eu lieu. */
  try {
    await db().grievanceEvent.create({
      data: {
        grievanceId,
        type: "CONTACT",
        isPublic: false,
        message: `Accusé de réception envoyé automatiquement à ${email}.`,
        // Même vocabulaire que le formulaire de journalisation de la console
        // (cf. `contactChannels` dans content/admin.ts) : un canal nommé
        // autrement scinderait la lecture de l'historique.
        toValue: "Courriel",
        authorLabel: "Site public",
      },
    });
  } catch (error) {
    console.error("[mgp] accusé de réception envoyé mais non journalisé", error);
  }

  return true;
}

/* --- Suivi ---------------------------------------------------------------- */

/**
 * Vue publique d'un dossier. La liste des champs EST la politique de
 * confidentialité du suivi : rien ne s'y ajoute sans décision explicite.
 */
export type PublicCase = {
  reference: string;
  submittedAt: string;
  categoryCode: string;
  status: GrievanceStatus;
  stage: GrievanceStage;
  isAnonymous: boolean;
  dueAt: string;
  daysRemaining: number | null;
  closedAt: string | null;
  /** Messages explicitement adressés au plaignant par l'Unité. */
  updates: { at: string; message: string }[];
};

export type TrackResult = { ok: true; case: PublicCase } | { ok: false; error: string };

/** Le suivi est une lecture par numéro : la limite fait le prix d'un balayage. */
const TRACK_LIMIT = 12;
const TRACK_WINDOW_MS = 10 * 60 * 1000;

export async function trackGrievance(rawReference: string, rawLang: string): Promise<TrackResult> {
  const lang = asLangCode(rawLang);
  const t = (fr: string, en: string) => (lang === "en" ? en : fr);

  const reference = normalizeReference(String(rawReference ?? "").slice(0, 60));

  if (!reference) {
    return { ok: false, error: t("Saisissez votre numéro de référence.", "Enter your reference number.") };
  }

  const limit = rateLimit(`mgp:track:${requestIp(await headers())}`, TRACK_LIMIT, TRACK_WINDOW_MS);
  if (!limit.allowed) {
    return {
      ok: false,
      error: t(
        "Trop de recherches successives. Réessayez dans quelques minutes.",
        "Too many successive lookups. Try again in a few minutes.",
      ),
    };
  }

  // Format invalide et dossier introuvable donnent le MÊME message : distinguer
  // les deux indiquerait à qui balaie des numéros lesquels sont bien formés.
  const notFound = {
    ok: false as const,
    error: t(
      "Aucun dossier ne correspond à ce numéro. Vérifiez la saisie : le numéro figure sur l'accusé de réception, sous la forme UGPTN-MGP-année-code.",
      "No case matches this number. Check your entry: the number appears on the acknowledgement, in the form UGPTN-MGP-year-code.",
    ),
  };

  if (!isValidReference(reference)) return notFound;

  let record;
  try {
    record = await db().grievance.findUnique({
      where: { reference },
      // Sélection close : tout champ non listé ici est hors de portée du public.
      select: {
        reference: true,
        category: true,
        status: true,
        stage: true,
        isAnonymous: true,
        submittedAt: true,
        dueAt: true,
        closedAt: true,
        events: {
          where: { isPublic: true, message: { not: null } },
          select: { message: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("[mgp] échec de la consultation d'un dossier", error);
    return {
      ok: false,
      error: t(
        "Le service de suivi est momentanément indisponible. Réessayez dans un instant.",
        "The tracking service is temporarily unavailable. Try again shortly.",
      ),
    };
  }

  if (!record) return notFound;

  const status = record.status as GrievanceStatus;
  const closed = isClosingStatus(status) || record.closedAt !== null;

  return {
    ok: true,
    case: {
      reference: record.reference,
      submittedAt: record.submittedAt.toISOString(),
      categoryCode: record.category,
      status,
      stage: record.stage as GrievanceStage,
      isAnonymous: record.isAnonymous,
      dueAt: record.dueAt.toISOString(),
      daysRemaining: closed ? null : daysUntil(record.dueAt),
      closedAt: record.closedAt?.toISOString() ?? null,
      updates: record.events.map((event) => ({
        at: event.createdAt.toISOString(),
        message: event.message as string,
      })),
    },
  };
}
