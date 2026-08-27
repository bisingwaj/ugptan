"use server";

/**
 * Écritures du module « Réglages » — pour l'instant, la fermeture du site.
 *
 * ⚠️ INVARIANT : chaque action commence par une garde d'autorisation. Le proxy
 * laisse passer les POST (rediriger un POST de server action casserait le
 * protocole Flight), la barrière est donc ici, et nulle part ailleurs. La
 * permission `reglages` est réservée au rôle ADMIN (cf. lib/auth/permissions.ts).
 *
 * ─── Deux actions, et non un seul formulaire ─────────────────────────────────
 *
 * Régler et fermer sont deux gestes de nature différente. Le premier prépare
 * (le code, l'heure annoncée, le message) et n'a aucun effet visible ; le second
 * retire le site au public. Les confondre dans un même envoi ferait d'une
 * correction de virgule dans le message une occasion de fermer le site par
 * inadvertance.
 *
 * ─── Pourquoi la revalidation porte sur la coquille ──────────────────────────
 *
 * L'état est lu par le layout du segment `[lang]`, dont dépend CHAQUE page
 * publique. Invalider page par page laisserait en ligne les pages prérendues :
 * un visiteur tomberait sur une page ordinaire alors que le site est fermé.
 */
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertPermission } from "@/lib/auth/guard";
import { fromDateTimeLocal } from "@/lib/format";
import { patronRoute } from "@/lib/routes";
import { CODE_MOTIF } from "@/lib/reglages/code";
import { REGLAGES_ID } from "@/lib/reglages/maintenance";

/* Seul le TYPE est exporté : un fichier « use server » ne peut exporter que des
   fonctions asynchrones, chaque export devenant un point d'entrée réseau. L'état
   initial se déclare donc dans l'écran, comme partout ailleurs dans la console. */
export type ReglagesFormState = { error: string | null; ok: string | null };

/** Longueur au-delà de laquelle un message de fermeture cesse d'être lu. */
const MESSAGE_MAX = 600;

/** Toutes les pages publiques d'un coup : l'état vit dans leur layout commun. */
function revaliderSitePublic(): void {
  revalidatePath(patronRoute(), "layout");
}

const texte = (form: FormData, champ: string): string =>
  String(form.get(champ) ?? "").trim();

export async function enregistrerReglagesAction(
  _precedent: ReglagesFormState,
  form: FormData,
): Promise<ReglagesFormState> {
  const admin = await assertPermission("reglages");

  const code = texte(form, "code").replace(/\s+/g, "");
  if (code && !CODE_MOTIF.test(code)) {
    return { error: "Le code d'accès doit compter exactement six chiffres.", ok: null };
  }

  const messageFr = texte(form, "messageFr");
  const messageEn = texte(form, "messageEn");
  if (messageFr.length > MESSAGE_MAX || messageEn.length > MESSAGE_MAX) {
    return { error: `Le message de fermeture ne doit pas dépasser ${MESSAGE_MAX} caractères.`, ok: null };
  }

  /* Une seule langue renseignée laisserait l'autre public devant le texte par
     défaut : l'écart ne se verrait qu'en production, et sur la version qu'on ne
     relit jamais. Mieux vaut refuser tout de suite. */
  if (Boolean(messageFr) !== Boolean(messageEn)) {
    return {
      error: "Un message de fermeture s'écrit dans les deux langues, ou dans aucune.",
      ok: null,
    };
  }

  const jusqua = fromDateTimeLocal(texte(form, "jusqua"));
  if (texte(form, "jusqua") && !jusqua) {
    return { error: "L'heure de réouverture annoncée n'est pas lisible.", ok: null };
  }

  const valeurs = {
    maintenanceCode: code || null,
    maintenanceUntil: jusqua,
    maintenanceFr: messageFr || null,
    maintenanceEn: messageEn || null,
    updatedBy: admin.email,
  };

  await db().reglages.upsert({
    where: { id: REGLAGES_ID },
    create: { id: REGLAGES_ID, ...valeurs },
    update: valeurs,
  });

  // Le message et l'heure annoncée s'affichent au public : même si l'état de
  // fermeture n'a pas bougé, la page servie change.
  revaliderSitePublic();

  return { error: null, ok: "Réglages enregistrés." };
}

export async function basculerMaintenanceAction(
  _precedent: ReglagesFormState,
  form: FormData,
): Promise<ReglagesFormState> {
  const admin = await assertPermission("reglages");

  const fermer = texte(form, "fermer") === "1";
  const ligne = await db().reglages.findUnique({ where: { id: REGLAGES_ID } });

  /* Fermer sans code enfermerait tout le monde dehors, l'équipe comprise, et
     la seule issue serait une écriture en base. La console exige donc que le
     code soit posé AVANT la fermeture, et non dans le même geste. */
  if (fermer && !ligne?.maintenanceCode) {
    return {
      error: "Enregistrez d'abord un code d'accès à six chiffres : sans lui, personne ne pourra entrer pendant la fermeture.",
      ok: null,
    };
  }

  const valeurs = {
    maintenance: fermer,
    // Horodatée à la fermeture, effacée à la réouverture : la console affiche
    // « fermé depuis », jamais « fermé depuis la dernière fois ».
    maintenanceSince: fermer ? new Date() : null,
    updatedBy: admin.email,
  };

  await db().reglages.upsert({
    where: { id: REGLAGES_ID },
    create: { id: REGLAGES_ID, ...valeurs },
    update: valeurs,
  });

  revaliderSitePublic();

  return {
    error: null,
    ok: fermer
      ? "Le site public est fermé. Seul le code d'accès y donne encore entrée."
      : "Le site public est rouvert.",
  };
}
